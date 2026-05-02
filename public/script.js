document.addEventListener('DOMContentLoaded', () => {
  const messages = document.getElementById('messages');
  const form = document.getElementById('input-form');
  const input = document.getElementById('msg-input');
  const resetBtn = document.getElementById('btn-reset');
  const quickActions = document.getElementById('quick-actions');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const navItems = document.querySelectorAll('.menu-item');
  const langSelect = document.getElementById('lang-select');
  const langMobile = document.getElementById('lang-select-mobile');

  let state = 'home', userAddress = '', currentLang = 'en';

  initParticles();

  // Sync language selects + show confirmation
  function onLangChange(val) {
    currentLang = val;
    langSelect.value = val;
    langMobile.value = val;
    messages.innerHTML = '';
    clearChips();
    state = 'home';
    setActive('home');
    if (val === 'en') {
      showWelcome();
    } else {
      addBot(`
        <strong>🌐 Language changed to ${langName()}</strong>
        <div class="tricolor-line"></div>
        <p>All topics will now respond in <strong>${langName()}</strong> using Gemini AI.</p>
        <p style="margin-top:8px;color:var(--text-2)">Choose a topic below or type any question:</p>
        <div class="welcome-grid">
          <div class="wg-card" data-action="register"><span class="wg-emoji">📝</span><span class="wg-title">Voter Registration</span><span class="wg-desc">Register on NVSP</span></div>
          <div class="wg-card" data-action="elections"><span class="wg-emoji">🗓️</span><span class="wg-title">Elections & Dates</span><span class="wg-desc">Lok Sabha, Vidhan Sabha</span></div>
          <div class="wg-card" data-action="howtovote"><span class="wg-emoji">🗳️</span><span class="wg-title">How to Vote</span><span class="wg-desc">Step-by-step EVM guide</span></div>
          <div class="wg-card" data-action="voterid"><span class="wg-emoji">🪪</span><span class="wg-title">Voter ID (EPIC)</span><span class="wg-desc">Apply, correct, download</span></div>
          <div class="wg-card" data-action="evm"><span class="wg-emoji">🖥️</span><span class="wg-title">EVM & VVPAT</span><span class="wg-desc">How machines work</span></div>
          <div class="wg-card" data-action="askai"><span class="wg-emoji">✨</span><span class="wg-title">Ask AI</span><span class="wg-desc">Gemini-powered answers</span></div>
        </div>
      `);
      setTimeout(() => bindWelcomeCards(), 100);
    }
  }
  langSelect.addEventListener('change', e => onLangChange(e.target.value));
  langMobile.addEventListener('change', e => onLangChange(e.target.value));

  menuToggle.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('show'); });
  overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('show'); });

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const topic = btn.dataset.topic;
      setActive(topic);
      sidebar.classList.remove('open'); overlay.classList.remove('show');
      clearChips();
      if (topic === 'home') { resetChat(); return; }
      if (topic === 'askai') { showAskAI(); return; }
      const labels = {register:'Voter Registration',elections:'Elections & Dates',howtovote:'How to Vote',voterid:'Voter ID / EPIC',evm:'EVM & VVPAT'};
      addUser(labels[topic]||topic); handleTopic(topic); scroll();
    });
  });

  function setActive(t) { navItems.forEach(n=>n.classList.remove('active')); const el=document.querySelector(`.menu-item[data-topic="${t}"]`); if(el) el.classList.add('active'); }

  showWelcome();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const txt = input.value.trim(); if(!txt) return;
    input.value = ''; clearChips(); addUser(txt);
    if (state === 'askai') { await askGemini(txt); }
    else { await processInput(txt); }
    scroll();
  });

  resetBtn.addEventListener('click', resetChat);

  function addUser(t) { const d=document.createElement('div'); d.className='msg user'; d.textContent=t; messages.appendChild(d); scroll(); }
  function addBot(html) { rmTyping(); const d=document.createElement('div'); d.className='msg bot'; d.innerHTML=`<div class="bot-header"><div class="bot-avatar">🗳️</div><div class="bot-label">Voter Saathi</div></div>${html}`; messages.appendChild(d); scroll(); }
  function showTyping() { const d=document.createElement('div'); d.className='typing'; d.id='typing-ind'; d.innerHTML='<span class="tdot"></span><span class="tdot"></span><span class="tdot"></span>'; messages.appendChild(d); scroll(); }
  function rmTyping() { const t=document.getElementById('typing-ind'); if(t) t.remove(); }
  function scroll() { requestAnimationFrame(()=>{messages.scrollTop=messages.scrollHeight}); }
  function clearChips() { quickActions.innerHTML=''; }
  function addChips(arr) { clearChips(); arr.forEach(c=>{const b=document.createElement('button');b.className='qa-chip';b.textContent=c.label;b.addEventListener('click',()=>{clearChips();addUser(c.label);if(c.fn)c.fn();scroll()});quickActions.appendChild(b)}); }
  function langName() { return {en:'English',hi:'Hindi',ta:'Tamil',te:'Telugu',kn:'Kannada',bn:'Bengali',mr:'Marathi',gu:'Gujarati',ml:'Malayalam',pa:'Punjabi',ur:'Urdu',or:'Odia'}[currentLang]||'English'; }

  // ── Welcome ──
  function showWelcome() {
    addBot(`
      <div class="welcome-hero">
        <h2>🙏 Namaste! Welcome to Voter Saathi</h2>
        <p>Your friendly, non-partisan guide to Indian elections. Choose a topic or ask AI anything!</p>
      </div>
      <div class="tricolor-line"></div>
      <div class="welcome-grid">
        <div class="wg-card" data-action="register"><div class="wg-emoji">📝</div><span class="wg-title">Voter Registration</span><span class="wg-desc">NVSP / Form 6</span></div>
        <div class="wg-card" data-action="elections"><div class="wg-emoji">🗓️</div><span class="wg-title">Elections & Dates</span><span class="wg-desc">Lok Sabha · Vidhan Sabha</span></div>
        <div class="wg-card" data-action="howtovote"><div class="wg-emoji">🗳️</div><span class="wg-title">How to Vote</span><span class="wg-desc">8-step EVM guide</span></div>
        <div class="wg-card" data-action="voterid"><div class="wg-emoji">🪪</div><span class="wg-title">Voter ID (EPIC)</span><span class="wg-desc">Apply · Correct · e-EPIC</span></div>
        <div class="wg-card" data-action="evm"><div class="wg-emoji">🖥️</div><span class="wg-title">EVM & VVPAT</span><span class="wg-desc">How machines work</span></div>
        <div class="wg-card" data-action="askai"><div class="wg-emoji">✨</div><span class="wg-title">Ask AI</span><span class="wg-desc">AI-powered answers</span></div>
      </div>
      <div class="helpline-bar">
        <span class="hl-item">📞 Helpline: <strong>1950</strong></span>
        <span class="hl-item">🌐 <strong>eci.gov.in</strong></span>
        <span class="hl-item">📱 <strong>Voter Helpline App</strong></span>
      </div>
    `);
    setTimeout(() => bindWelcomeCards(), 100);
  }

  function bindWelcomeCards() {
    document.querySelectorAll('.wg-card').forEach(c => {
      c.addEventListener('click', () => {
        const a = c.dataset.action;
        clearChips();
        addUser(c.querySelector('.wg-title').textContent);
        if (a === 'askai') { showAskAI(); }
        else { handleTopic(a); }
        scroll();
      });
    });
  }

  // ── Ask AI (Gemini) ──
  function showAskAI() {
    state = 'askai'; setActive('askai');
    addBot(`
      <strong>✨ Ask AI — Powered by Google Gemini</strong> <span class="ai-badge">Gemini AI</span>
      <div class="tricolor-line"></div>
      <p>Ask me <strong>anything</strong> about Indian elections in <strong>${langName()}</strong>! I'll respond using Google's Gemini AI.</p>
      <p style="margin-top:8px;color:var(--text-2)">Examples: "What is NOTA?", "How does EVM work?", "Tell me about Lok Sabha elections", "मतदाता पहचान पत्र कैसे बनाएं?"</p>
    `);
    addChips([
      {label:'What is NOTA?',fn:()=>askGemini('What is NOTA?')},
      {label:'EVM vs ballot paper',fn:()=>askGemini('Compare EVM with ballot paper voting')},
      {label:'🏠 Menu',fn:()=>{state='home';setActive('home');resetChat()}}
    ]);
  }

  async function askGemini(question) {
    showTyping();
    try {
      const res = await fetch('/api/gemini', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:question,language:currentLang})});
      const data = await res.json();
      rmTyping();
      if (data.error) {
        addBot(`<strong>AI Error</strong><p style="margin-top:8px">${data.error}</p>`);
      } else {
        // Convert markdown-like formatting
        let reply = data.reply.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n/g,'<br/>');
        addBot(`<span class="ai-badge">Gemini AI</span> <span style="color:var(--text-3);font-size:.7rem;margin-left:4px">${langName()}</span><div style="margin-top:10px">${reply}</div>`);
      }
    } catch(e) { rmTyping(); addBot('<strong>Connection Error</strong><p>Could not reach the AI service.</p>'); }
    addChips([
      {label:'Ask another question',fn:()=>showAskAI()},
      {label:'🏠 Menu',fn:()=>{state='home';setActive('home');resetChat()}}
    ]);
    state = 'askai';
  }

  // ── Process Input ──
  async function processInput(text) {
    const t = text.toLowerCase();
    if (/^(hi|hello|namaste|menu|home|start)/.test(t)) { state='home'; setActive('home'); showWelcome(); return; }
    if (/^(ask ai|ai|gemini)/.test(t)) { showAskAI(); return; }
    switch(state) {
      case 'home': handleTopic(detectTopic(t)); break;
      case 'awaiting_address': await fetchElectionData(text); break;
      case 'awaiting_state': handleStateInfo(text); break;
      default: addBot("Type <strong>menu</strong> to see options or <strong>ask ai</strong> to chat with Gemini."); addChips([{label:'🏠 Menu',fn:()=>{state='home';setActive('home');showWelcome()}}]); break;
    }
  }

  function detectTopic(t) {
    if (/regist|enrol|nvsp|form.?6/.test(t)) return 'register';
    if (/election|date|schedule|lok.?sabha|vidhan|phase|upcoming/.test(t)) return 'elections';
    if (/how.?to.?vote|step|process|voting.?process/.test(t)) return 'howtovote';
    if (/voter.?id|epic|card|aadhaar|link|download|correct/.test(t)) return 'voterid';
    if (/evm|vvpat|machine|electronic/.test(t)) return 'evm';
    if (/poll|booth|station|where|find|locat/.test(t)) return 'polling';
    return 'unknown';
  }

  function handleTopic(topic) {
    // Non-English? Route through Gemini for translated response
    if (currentLang !== 'en' && topic !== 'unknown') {
      const topicPrompts = {
        register: 'Explain how to register as a voter in India. Cover NVSP portal, Form 6, Voter Helpline App, documents needed, and offline registration.',
        elections: 'Explain the types of elections in India - Lok Sabha, Vidhan Sabha, Panchayat, and Municipal. Mention ECI website eci.gov.in for schedules.',
        howtovote: 'Give a step-by-step guide to voting in India: checking name, finding polling booth, carrying ID, visiting booth, getting inked, using EVM, verifying VVPAT.',
        voterid: 'Explain Voter ID (EPIC) card in India: how to apply (Form 6), corrections (Form 8), download e-EPIC, Aadhaar linking (Form 6B), and 1950 helpline.',
        evm: 'Explain how EVM and VVPAT work in Indian elections: Control Unit, Ballot Unit, VVPAT slip, security features, and NOTA option.',
        polling: 'Explain how to find your polling booth in India: voters.eci.gov.in, Voter Helpline App, calling 1950, SMS method.'
      };
      if (topicPrompts[topic]) {
        askGemini(topicPrompts[topic]);
        return;
      }
    }
    switch(topic) {
      case 'register': showRegistration(); break;
      case 'elections': showElections(); break;
      case 'howtovote': showHowToVote(); break;
      case 'voterid': showVoterId(); break;
      case 'evm': showEVM(); break;
      case 'polling': showPolling(); break;
      default: addBot("I didn't catch that. Try <strong>ask ai</strong> to use Gemini, or pick a topic from the sidebar."); addChips([{label:'✨ Ask AI',fn:()=>showAskAI()},{label:'📝 Registration',fn:()=>handleTopic('register')},{label:'🏠 Menu',fn:()=>{state='home';setActive('home');showWelcome()}}]); break;
    }
  }

  function showRegistration() {
    setActive('register'); state='awaiting_state';
    addBot(`<strong>Voter Registration in India</strong><div class="tricolor-line"></div><p>Every Indian citizen aged <strong>18+</strong> can register:</p>
      <div class="info-grid">
        <div class="info-row"><span class="ir-icon">🌐</span><div><div class="ir-label">Online</div><div class="ir-value">Visit <a href="https://voters.eci.gov.in" target="_blank">voters.eci.gov.in</a> → Fill <strong>Form 6</strong> → Upload photo & ID</div></div></div>
        <div class="info-row"><span class="ir-icon">📱</span><div><div class="ir-label">App</div><div class="ir-value">Download <strong>Voter Helpline App</strong> → Register with Aadhaar-linked mobile</div></div></div>
        <div class="info-row"><span class="ir-icon">🏢</span><div><div class="ir-label">Offline</div><div class="ir-value">Visit <strong>Electoral Registration Office</strong> or BLO with Form 6 & documents</div></div></div>
        <div class="info-row"><span class="ir-icon">📄</span><div><div class="ir-label">Documents</div><div class="ir-value">Aadhaar, Passport, or govt ID + address proof</div></div></div>
      </div><p style="margin-top:12px">Which <strong>state</strong> are you in?</p>`);
    addChips([{label:'📅 Elections',fn:()=>handleTopic('elections')},{label:'✨ Ask AI',fn:()=>showAskAI()},{label:'🏠 Menu',fn:()=>{state='home';setActive('home');showWelcome()}}]);
  }

  function showElections() {
    setActive('elections'); state='awaiting_address';
    addBot(`<strong>Indian Elections — Find Your Info</strong><div class="tricolor-line"></div>
      <div class="info-grid">
        <div class="info-row"><span class="ir-icon">🏛️</span><div><div class="ir-label">Lok Sabha</div><div class="ir-value">National parliament — 543 constituencies, every 5 years</div></div></div>
        <div class="info-row"><span class="ir-icon">🏢</span><div><div class="ir-label">Vidhan Sabha</div><div class="ir-value">State assembly elections — schedule varies by state</div></div></div>
        <div class="info-row"><span class="ir-icon">🏘️</span><div><div class="ir-label">Local Body</div><div class="ir-value">Panchayat, municipality & corporation elections</div></div></div>
        <div class="info-row"><span class="ir-icon">📊</span><div><div class="ir-label">ECI</div><div class="ir-value">Visit <a href="https://eci.gov.in" target="_blank">eci.gov.in</a> for schedules</div></div></div>
      </div><p style="margin-top:12px">Type your <strong>full address</strong> to look up election data:</p>`);
  }

  function showHowToVote() {
    setActive('howtovote'); state='home';
    addBot(`<strong>How to Vote — Step by Step</strong><div class="tricolor-line"></div>
      <ol class="step-cards">
        <li><div><strong>Check Your Name</strong><br/>Verify at <a href="https://voters.eci.gov.in" target="_blank">voters.eci.gov.in</a></div></li>
        <li><div><strong>Find Polling Booth</strong><br/>Check voter slip or ECI portal</div></li>
        <li><div><strong>Carry Valid ID</strong><br/>EPIC, Aadhaar, Passport, PAN, or DL</div></li>
        <li><div><strong>Visit the Booth</strong><br/>Go on election day (7 AM – 6 PM)</div></li>
        <li><div><strong>Get Inked</strong><br/>Indelible ink on left index finger</div></li>
        <li><div><strong>Vote on EVM</strong><br/>Press blue button next to your candidate</div></li>
        <li><div><strong>Verify VVPAT</strong><br/>Check the slip (7 seconds) showing your vote</div></li>
        <li><div><strong>Exit</strong><br/>Your vote is secret and secure!</div></li>
      </ol>`);
    addChips([{label:'🪪 Voter ID',fn:()=>handleTopic('voterid')},{label:'🖥️ EVM',fn:()=>handleTopic('evm')},{label:'✨ Ask AI',fn:()=>showAskAI()},{label:'🏠 Menu',fn:()=>{state='home';setActive('home');showWelcome()}}]);
  }

  function showVoterId() {
    setActive('voterid'); state='home';
    addBot(`<strong>Voter ID (EPIC)</strong><div class="tricolor-line"></div>
      <div class="info-grid">
        <div class="info-row"><span class="ir-icon">🆕</span><div><div class="ir-label">New Card</div><div class="ir-value">Fill <strong>Form 6</strong> at <a href="https://voters.eci.gov.in" target="_blank">voters.eci.gov.in</a></div></div></div>
        <div class="info-row"><span class="ir-icon">✏️</span><div><div class="ir-label">Corrections</div><div class="ir-value">Use <strong>Form 8</strong> for name, address, DOB fixes</div></div></div>
        <div class="info-row"><span class="ir-icon">📥</span><div><div class="ir-label">e-EPIC</div><div class="ir-value">Download digital ID via Voter Helpline App</div></div></div>
        <div class="info-row"><span class="ir-icon">🔗</span><div><div class="ir-label">Aadhaar Link</div><div class="ir-value">Link via NVSP portal or Form 6B</div></div></div>
        <div class="info-row"><span class="ir-icon">📞</span><div><div class="ir-label">Helpline</div><div class="ir-value">Call <strong>1950</strong> (toll-free)</div></div></div>
      </div>`);
    addChips([{label:'📝 Register',fn:()=>handleTopic('register')},{label:'✨ Ask AI',fn:()=>showAskAI()},{label:'🏠 Menu',fn:()=>{state='home';setActive('home');showWelcome()}}]);
  }

  function showEVM() {
    setActive('evm'); state='home';
    addBot(`<strong>EVM & VVPAT</strong><div class="tricolor-line"></div>
      <div class="info-grid">
        <div class="info-row"><span class="ir-icon">1️⃣</span><div><div class="ir-label">Control Unit</div><div class="ir-value">Operated by presiding officer. Battery-powered, no network.</div></div></div>
        <div class="info-row"><span class="ir-icon">2️⃣</span><div><div class="ir-label">Ballot Unit</div><div class="ir-value">Shows candidates. Press blue button to vote.</div></div></div>
        <div class="info-row"><span class="ir-icon">3️⃣</span><div><div class="ir-label">VVPAT</div><div class="ir-value">Prints slip for 7-second verification.</div></div></div>
        <div class="info-row"><span class="ir-icon">🔒</span><div><div class="ir-label">Security</div><div class="ir-value">Standalone, tamper-proof, multi-round testing.</div></div></div>
        <div class="info-row"><span class="ir-icon">🧮</span><div><div class="ir-label">NOTA</div><div class="ir-value">Last button — "None Of The Above" option.</div></div></div>
      </div>`);
    addChips([{label:'🗳️ How to Vote',fn:()=>handleTopic('howtovote')},{label:'✨ Ask AI',fn:()=>showAskAI()},{label:'🏠 Menu',fn:()=>{state='home';setActive('home');showWelcome()}}]);
  }

  function showPolling() {
    state='awaiting_address'; setActive('elections');
    addBot(`<strong>Find Your Polling Booth</strong><div class="tricolor-line"></div>
      <div class="info-grid">
        <div class="info-row"><span class="ir-icon">🌐</span><div><div class="ir-label">Online</div><div class="ir-value"><a href="https://voters.eci.gov.in" target="_blank">voters.eci.gov.in</a> → Search Electoral Roll</div></div></div>
        <div class="info-row"><span class="ir-icon">📱</span><div><div class="ir-label">App</div><div class="ir-value">Voter Helpline App → "Know Your Polling Booth"</div></div></div>
        <div class="info-row"><span class="ir-icon">📞</span><div><div class="ir-label">Call</div><div class="ir-value">Dial <strong>1950</strong> or SMS EPIC &lt;ID&gt; to 1950</div></div></div>
      </div><p style="margin-top:12px">Or type your <strong>address</strong> for an API lookup:</p>`);
  }

  function handleStateInfo(name) {
    state='home';
    addBot(`<strong>Registration in ${name}</strong><div class="tricolor-line"></div>
      <div class="info-grid">
        <div class="info-row"><span class="ir-icon">🌐</span><div><div class="ir-label">Portal</div><div class="ir-value"><a href="https://voters.eci.gov.in" target="_blank">voters.eci.gov.in</a> → Select ${name}</div></div></div>
        <div class="info-row"><span class="ir-icon">🏢</span><div><div class="ir-label">Offline</div><div class="ir-value">Visit District Election Office or BLO</div></div></div>
        <div class="info-row"><span class="ir-icon">📞</span><div><div class="ir-label">Help</div><div class="ir-value">Call <strong>1950</strong></div></div></div>
      </div>`);
    addChips([{label:'📅 Elections',fn:()=>handleTopic('elections')},{label:'✨ Ask AI',fn:()=>showAskAI()},{label:'🏠 Menu',fn:()=>{state='home';setActive('home');showWelcome()}}]);
  }

  async function fetchElectionData(address) {
    userAddress=address; showTyping();
    try {
      const res=await fetch('/api/election-info',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address})});
      const data=await res.json(); rmTyping();
      if(data.error){addBot(`<strong>Oops!</strong><p>${data.error}</p>`);}
      else {
        let poll=data.pollingPlaces.map(p=>`<div class="info-row"><span class="ir-icon">📍</span><div><div class="ir-label">${p.name}</div><div class="ir-value">${p.address}<br/><span style="color:var(--text-3);font-size:.75rem">Hours: ${p.hours}</span></div></div></div>`).join('');
        let contests=data.contests.length?`<p style="margin-top:10px"><strong>Contests:</strong></p><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${data.contests.map(c=>`<span style="padding:5px 14px;border-radius:999px;background:rgba(255,153,51,.08);border:1px solid rgba(255,153,51,.15);font-size:.78rem;color:var(--accent)">${c}</span>`).join('')}</div>`:'';
        addBot(`<strong>Election Data Found! 🎉</strong><div class="tricolor-line"></div>
          <div class="info-grid">
            <div class="info-row"><span class="ir-icon">🏛️</span><div><div class="ir-label">Election</div><div class="ir-value">${data.electionName}</div></div></div>
            <div class="info-row"><span class="ir-icon">📅</span><div><div class="ir-label">Date</div><div class="ir-value">${data.electionDate}</div></div></div>
            <div class="info-row"><span class="ir-icon">⏰</span><div><div class="ir-label">Deadline</div><div class="ir-value">${data.registrationDeadline}</div></div></div>
            ${poll||'<div class="info-row"><span class="ir-icon">ℹ️</span><div><div class="ir-value">Polling details unavailable. Check <a href="https://voters.eci.gov.in" target="_blank">voters.eci.gov.in</a></div></div></div>'}
          </div>${contests}`);
      }
    } catch{rmTyping();addBot('<strong>Connection Error</strong><p>Could not reach the API.</p>');}
    state='home';
    addChips([{label:'✨ Ask AI',fn:()=>showAskAI()},{label:'🗳️ How to Vote',fn:()=>handleTopic('howtovote')},{label:'🏠 Menu',fn:()=>{state='home';setActive('home');showWelcome()}}]);
  }

  function resetChat(){messages.innerHTML='';clearChips();state='home';userAddress='';setActive('home');showWelcome();}

  function initParticles(){
    const c=document.getElementById('particle-canvas');if(!c)return;const ctx=c.getContext('2d');
    let w,h;const pts=[];const N=55;const D=130;
    function resize(){w=c.width=window.innerWidth;h=c.height=window.innerHeight}
    window.addEventListener('resize',resize);resize();
    for(let i=0;i<N;i++)pts.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.8+.8,a:Math.random()*.25+.08});
    function draw(){ctx.clearRect(0,0,w,h);for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<D){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(255,153,51,${(1-d/D)*.06})`;ctx.lineWidth=.7;ctx.stroke()}}
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,153,51,${p.a})`;ctx.fill()});requestAnimationFrame(draw)}draw();
  }
});
