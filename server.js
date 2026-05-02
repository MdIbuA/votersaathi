require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── Civic Information API proxy ──
app.post('/api/election-info', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address is required.' });

    const civicApiKey = process.env.CIVIC_API_KEY;
    if (!civicApiKey || civicApiKey === 'your_civic_api_key_here') {
      return res.status(500).json({ error: 'Civic API key not configured.' });
    }

    const response = await axios.get('https://www.googleapis.com/civicinfo/v2/voterinfo', {
      params: { address, key: civicApiKey, electionId: 2000, officialOnly: false }
    });

    const { election, pollingLocations, contests, state } = response.data;
    let registrationDeadline = '';
    if (state && state.length > 0 && state[0].electionAdministrationBody) {
      registrationDeadline = state[0].electionAdministrationBody.voter_registration_url || '';
    }

    res.json({
      electionName: election?.name || 'Upcoming Election',
      electionDate: election?.electionDay || 'Date not available',
      registrationDeadline: registrationDeadline || 'Check the ECI website \u2013 deadlines vary by state.',
      pollingPlaces: pollingLocations?.map(loc => ({
        name: loc.address?.locationName || 'Polling Station',
        address: [loc.address?.line1, loc.address?.city, loc.address?.state, loc.address?.zip].filter(Boolean).join(', '),
        hours: loc.pollingHours || '7:00 AM \u2013 6:00 PM',
      })) || [],
      contests: contests?.slice(0, 6).map(c => c.office) || [],
    });
  } catch (error) {
    console.error('Civic API error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      return res.status(400).json({ error: 'No election data found for that address.' });
    }
    res.status(500).json({ error: 'Could not fetch election data. Please try again later.' });
  }
});

// ── AI endpoint (OpenRouter primary, Gemini direct fallback) ──
app.post('/api/gemini', async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const langName = {
      en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
      kn: 'Kannada', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati',
      ml: 'Malayalam', pa: 'Punjabi', ur: 'Urdu', or: 'Odia'
    }[language] || 'English';

    const systemPrompt = `You are "Voter Saathi" (वोटर साथी), a friendly, non-partisan Indian election assistant. 
You help Indian citizens understand:
- Voter registration (NVSP portal, Form 6, Form 8, Voter Helpline App)
- Elections (Lok Sabha, Vidhan Sabha, Panchayat, Municipal)
- Voting process (EVM, VVPAT, polling booth procedures)
- Voter ID / EPIC card (apply, correct, download e-EPIC, Aadhaar linking)
- Election Commission of India (ECI) guidelines

IMPORTANT RULES:
- Always respond in ${langName} language.
- Be concise (under 200 words).
- Be non-partisan — never endorse parties or candidates.
- Cite official sources: eci.gov.in, voters.eci.gov.in, 1950 helpline.
- Use bullet points or numbered lists for clarity.`;

    let text = '';

    // ── Strategy 1: OpenRouter (primary) ──
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      const models = [
        'google/gemma-4-31b-it:free',
        'qwen/qwen3-coder:free',
        'meta-llama/llama-3.3-70b-instruct:free'
      ];
      for (const model of models) {
        try {
          const resp = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 512,
            temperature: 0.7
          }, {
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'Voter Saathi'
            },
            timeout: 20000
          });
          text = resp.data?.choices?.[0]?.message?.content || '';
          if (text) { console.log(`OpenRouter ${model} success`); break; }
        } catch (err) {
          console.log(`OpenRouter ${model} failed:`, err.response?.status || err.message);
        }
      }
    }

    // ── Strategy 2: Direct Gemini API (fallback) ──
    if (!text) {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
        const payload = {
          contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\nUser question: ' + message }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        };
        try {
          const resp = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
            payload, { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
          );
          text = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) console.log('Direct Gemini API success');
        } catch (err) {
          console.log('Direct Gemini failed:', err.response?.status || err.message);
        }
      }
    }

    if (!text) {
      return res.status(500).json({ error: 'AI service temporarily unavailable. Please try again in a moment.' });
    }

    res.json({ reply: text });
  } catch (error) {
    console.error('AI endpoint error:', error.message);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

// ── Elections list ──
app.get('/api/elections', async (req, res) => {
  try {
    const civicApiKey = process.env.CIVIC_API_KEY;
    if (!civicApiKey || civicApiKey === 'your_civic_api_key_here') {
      return res.status(500).json({ error: 'Civic API key not configured.' });
    }
    const response = await axios.get('https://www.googleapis.com/civicinfo/v2/elections', {
      params: { key: civicApiKey }
    });
    res.json({ elections: response.data.elections || [] });
  } catch (error) {
    console.error('Elections list error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Could not fetch elections list.' });
  }
});

app.listen(PORT, () => {
  console.log(`Voter Saathi running on http://localhost:${PORT}`);
});
