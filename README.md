# 🇮🇳 Voter Saathi — Indian Election Assistant

> **वोटर साथी** — A smart, multilingual civic engagement assistant that guides Indian citizens through the entire election process using a conversational interface, powered by **Google Gemini AI** and **Google Civic Information API**.

---

## 🎯 Chosen Vertical

**Government & Civic Technology** — Voter Saathi empowers Indian citizens by making election information accessible, personalised, and conversational across **12 Indian languages**.

---

## 🧠 Approach & Logic

Voter Saathi acts as a friendly, **non-partisan** election guide. It combines a **rule-based state machine** for structured navigation with **Google Gemini AI** for intelligent, multilingual responses.

### Core Architecture

```
User Input → Language Check → Route Decision
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼              ▼
              English Mode   AI Mode      Non-English
              (Hardcoded)   (Gemini)     (Auto-Gemini)
                    │             │              │
                    ▼             ▼              ▼
              Instant Cards   AI Response   Translated
              & Info Grids    in any lang   Topic Content
```

### How It Works

1. **Welcome Screen** — Six interactive topic cards: Voter Registration, Elections & Dates, How to Vote, Voter ID (EPIC), EVM & VVPAT, and Ask AI.
2. **Smart Topic Detection** — NLP-lite keyword matching routes queries to the correct handler (supports election terminology in English).
3. **Multilingual AI** — When a non-English language is selected, all topic responses are automatically routed through Gemini AI, which responds in the selected language.
4. **Civic API Integration** — When users provide their address, the app fetches real election data (dates, polling locations, contests) via Google Civic Information API through a secure backend proxy.
5. **Ask AI Mode** — Free-form conversational mode where users can ask anything about Indian elections and receive Gemini-powered answers.

### Google Services Integration

| Service | Usage |
|---------|-------|
| **Google Gemini AI** | Multilingual conversational responses, topic translation, free-form Q&A about Indian elections |
| **Google Civic Information API** | Real-time election data lookup — election dates, polling locations, ballot contests based on user address |
| **Google Fonts** | Premium typography — Plus Jakarta Sans, Space Grotesk, Noto Sans (Devanagari, Tamil, Telugu, Bengali) |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+ installed
- A [Google Civic Information API key](https://developers.google.com/civic-information)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/election-assistant.git
cd election-assistant

# 2. Install dependencies
npm install

# 3. Configure API keys
cp .env.example .env
# Edit .env and add your API keys

# 4. Start the server
node server.js

# 5. Open in browser
# → http://localhost:3000
```

### Example Interaction

```
Bot:  Namaste! 🙏 Welcome to Voter Saathi
User: [Clicks "How to Vote" card]
Bot:  [Shows 8-step guide: Check name → Find booth → Carry ID → Vote on EVM → Verify VVPAT]
User: [Switches language to Hindi]
Bot:  🌐 Language changed to Hindi — All topics respond via Gemini AI
User: [Clicks "Voter Registration"]
Bot:  [Gemini responds in Hindi about NVSP portal, Form 6, documents needed]
```

---

## 🏗️ Project Structure

```
election-assistant/
├── public/
│   ├── index.html        # Chat UI — sidebar, particle canvas, language selector
│   ├── style.css         # Premium dark theme — glassmorphism, tricolor accents
│   └── script.js         # State machine, Gemini AI calls, multilingual routing
├── server.js             # Express backend — Civic API & Gemini API proxies
├── Dockerfile            # Cloud Run deployment container
├── .dockerignore         # Docker build exclusions
├── package.json          # Dependencies (Express, Axios, dotenv)
├── .env.example          # API key template
├── .gitignore            # Protects .env and node_modules
└── README.md             # Documentation
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| AI | Google Gemini 2.0 Flash (with 1.5 Flash & Pro fallback) |
| Data | Google Civic Information API |
| Fonts | Plus Jakarta Sans, Space Grotesk, Noto Sans Indic scripts |
| Deployment | Docker, Google Cloud Run |

---

## 🌐 Multilingual Support (12 Languages)

| Language | Code | Script |
|----------|------|--------|
| English | `en` | Latin |
| हिन्दी (Hindi) | `hi` | Devanagari |
| தமிழ் (Tamil) | `ta` | Tamil |
| తెలుగు (Telugu) | `te` | Telugu |
| ಕನ್ನಡ (Kannada) | `kn` | Kannada |
| বাংলা (Bengali) | `bn` | Bengali |
| मराठी (Marathi) | `mr` | Devanagari |
| ગુજરાતી (Gujarati) | `gu` | Gujarati |
| മലയാളം (Malayalam) | `ml` | Malayalam |
| ਪੰਜਾਬੀ (Punjabi) | `pa` | Gurmukhi |
| اردو (Urdu) | `ur` | Nastaliq |
| ଓଡ଼ିଆ (Odia) | `or` | Odia |

- **English** → Instant hardcoded responses (no API needed)
- **All other languages** → Gemini AI generates responses in the selected language

---

## 🗳️ India-Specific Features

| Feature | Details |
|---------|---------|
| **Voter Registration** | NVSP portal, Form 6, Voter Helpline App, BLO, offline registration |
| **Elections** | Lok Sabha, Vidhan Sabha, Panchayat, Municipal — with ECI schedule links |
| **How to Vote** | 8-step EVM voting guide with VVPAT verification |
| **Voter ID (EPIC)** | Apply (Form 6), corrections (Form 8), e-EPIC download, Aadhaar linking (Form 6B) |
| **EVM & VVPAT** | Control Unit, Ballot Unit, VVPAT slip, security features, NOTA |
| **Polling Booth** | Find via ECI portal, Voter Helpline App, 1950 helpline, SMS |

---

## 🔒 Security

- API keys stored in `.env` — **never** committed to Git
- Backend proxy prevents client-side key exposure
- Express `express.json()` middleware for safe input parsing
- `.gitignore` excludes sensitive files
- Multi-model fallback prevents single-point API failures

---

## ♿ Accessibility

- Semantic HTML5 (`<main>`, `<header>`, `<aside>`, `<nav>`, `<section>`)
- ARIA labels on all interactive elements (`aria-label`, `aria-live`)
- Screen reader-only labels (`.sr-only`) for inputs
- `focus-visible` outlines for keyboard navigation
- High contrast dark theme with readable typography
- Responsive design — mobile sidebar with overlay

---

## 🧪 Testing

- **Manual testing**: Start the server and interact with all 6 topic cards, verify API calls, test language switching
- **Error handling**: Graceful fallback for missing API keys, network errors, and rate limits
- **Multi-model fallback**: Gemini 2.0 Flash → 1.5 Flash → 1.5 Pro (auto-retry on 429 errors)
- **Unit tests**: Architecture supports Jest + Supertest for endpoint testing

---

## 🚀 Deployment (Google Cloud Run)

```bash
gcloud run deploy chunav-saathi \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "CIVIC_API_KEY=your_key,GEMINI_API_KEY=your_key" \
  --port 3000
```

Requires: Google Cloud SDK, billing-enabled project, Cloud Run + Cloud Build + Artifact Registry APIs enabled.

---

## 📝 Assumptions

- User has valid Google Civic Information and Gemini API keys with APIs enabled in Google Cloud Console
- Uses `electionId=2000` for all upcoming elections (Civic API default)
- India-specific content (ECI, NVSP, EVM) is curated for demonstration
- Non-English responses depend on Gemini AI availability and quota
- English is the primary UI language; Indic scripts load via Google Fonts

---

## 📦 Size

Repository is under **10 MB** — no heavy dependencies or binary assets.
