// ===== CONFIG =====
const isPopup = new URLSearchParams(location.search).get('popup') === '1';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
const OPENAI_CHAT_MODEL = 'gpt-4o-mini';
const GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile';

let recognition = null;
let isListening = false;
let isPaused = false;
let mediaStream = null;
let mediaRecorder = null;
let recordInterval = null;
let lineCount = 0;
let interimEl = null;
let activeProvider = 'auto';

const apiKeyInput = document.getElementById('apiKey');
const apiProviderSelect = document.getElementById('apiProvider');
const keyStatus = document.getElementById('keyStatus');
const providerBadge = document.getElementById('providerBadge');
const startBtn = document.getElementById('startBtn');
const overlayPanel = document.getElementById('overlayPanel');
const transcriptBox = document.getElementById('transcriptBox');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

// Load saved settings
const savedKey = localStorage.getItem('api_key') || localStorage.getItem('gemini_api_key');
if (savedKey) apiKeyInput.value = savedKey;
const savedProvider = localStorage.getItem('api_provider');
if (savedProvider) apiProviderSelect.value = savedProvider;

if (isPopup) {
  document.body.classList.add('popup-mode');
  overlayPanel.classList.add('visible');
  const savedMode = localStorage.getItem('live_mode');
  if (savedMode) startListening(savedMode);
}

// ===== API PROVIDER DETECTION =====
function detectProvider(key, manual = 'auto') {
  const k = key.trim();
  if (manual !== 'auto') return manual;
  if (k.startsWith('AIza')) return 'gemini';
  if (k.startsWith('gsk_')) return 'groq';
  if (k.startsWith('sk-') || k.startsWith('sk-proj-')) return 'openai';
  return 'gemini'; // default try gemini
}

function getApiKey() {
  return apiKeyInput.value.trim() || localStorage.getItem('api_key') || '';
}

function saveSettings() {
  localStorage.setItem('api_key', getApiKey());
  localStorage.setItem('api_provider', apiProviderSelect.value);
}

function providerLabel(p) {
  return { gemini: 'Gemini', openai: 'OpenAI', groq: 'Groq' }[p] || p;
}

// ===== TEST API KEY =====
document.getElementById('testKeyBtn').addEventListener('click', testApiKey);

async function testApiKey() {
  const key = getApiKey();
  if (!key) {
    setKeyStatus('❌ API key paste பண்ணுங்கள்', 'error');
    return;
  }

  const provider = detectProvider(key, apiProviderSelect.value);
  setKeyStatus('⏳ Testing...', 'pending');
  activeProvider = provider;

  try {
    const ok = await testProvider(provider, key);
    if (ok) {
      setKeyStatus(`✅ ${providerLabel(provider)} key working!`, 'success');
      providerBadge.textContent = providerLabel(provider);
      saveSettings();
    }
  } catch (err) {
    setKeyStatus(`❌ ${err.message}`, 'error');
  }
}

async function testProvider(provider, key) {
  if (provider === 'gemini') {
    for (const model of GEMINI_MODELS) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Say OK' }] }] })
        }
      );
      if (res.ok) { localStorage.setItem('gemini_model', model); return true; }
      const err = await res.json();
      if (model === GEMINI_MODELS[GEMINI_MODELS.length - 1]) {
        throw new Error(err.error?.message || 'Gemini key invalid');
      }
    }
  }

  if (provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'OpenAI key invalid');
    }
    return true;
  }

  if (provider === 'groq') {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${key}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Groq key invalid');
    }
    return true;
  }

  throw new Error('Unknown provider');
}

function setKeyStatus(msg, type) {
  keyStatus.textContent = msg;
  keyStatus.className = 'key-status ' + (type || '');
}

// ===== START / STOP =====
startBtn.addEventListener('click', async () => {
  if (isListening) {
    stopListening();
  } else {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const key = getApiKey();

    if (mode === 'tab') {
      if (!key) {
        alert('Tab Audio mode-க்கு API key வேணும்.\n\nGemini (free): aistudio.google.com/apikey');
        return;
      }
      activeProvider = detectProvider(key, apiProviderSelect.value);
      saveSettings();
      providerBadge.textContent = providerLabel(activeProvider);
    }

    localStorage.setItem('live_mode', mode);
    startListening(mode);
  }
});

document.getElementById('popupBtn').addEventListener('click', () => {
  saveSettings();
  localStorage.setItem('live_mode', document.querySelector('input[name="mode"]:checked').value);
  window.open('live.html?popup=1', 'LiveOverlay',
    'width=400,height=700,right=0,top=0,menubar=no,toolbar=no,location=no,status=no');
});

document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('clearBtn').addEventListener('click', clearTranscript);
document.getElementById('minimizeBtn').addEventListener('click', () => overlayPanel.classList.toggle('minimized'));
document.getElementById('copyAllBtn').addEventListener('click', copyAll);

async function startListening(mode) {
  isListening = true;
  isPaused = false;
  document.body.classList.add('listening');
  overlayPanel.classList.add('visible');
  setStatus('live', 'Listening...');
  startBtn.textContent = '⏹ Stop Listening';
  startBtn.classList.add('active');
  clearTranscript();

  if (mode === 'mic') {
    startMicRecognition();
  } else {
    await startTabAudioCapture();
  }
}

function stopListening() {
  isListening = false;
  setStatus('', 'Stopped');
  startBtn.textContent = '▶ Start Listening';
  startBtn.classList.remove('active');
  if (recognition) { recognition.stop(); recognition = null; }
  if (mediaRecorder?.state !== 'inactive') mediaRecorder?.stop();
  mediaStream?.getTracks().forEach(t => t.stop());
  mediaStream = null;
  if (recordInterval) { clearInterval(recordInterval); recordInterval = null; }
  removeInterim();
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    setStatus('', 'Paused');
    recognition?.stop();
    if (mediaRecorder?.state === 'recording') mediaRecorder.pause();
  } else {
    setStatus('live', 'Listening...');
    recognition?.start();
    if (mediaRecorder?.state === 'paused') mediaRecorder.resume();
  }
}

function setStatus(type, text) {
  statusDot.className = 'status-dot' + (type ? ' ' + type : '');
  statusText.textContent = text;
}

// ===== MIC MODE =====
function startMicRecognition() {
  if (!SpeechRecognition) {
    addLine('❌ Chrome browser use பண்ணுங்கள்.', '', true);
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    if (isPaused) return;
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript.trim();
      if (!text) continue;
      if (event.results[i].isFinal) {
        removeInterim();
        onNewText(text);
      } else {
        interim = text;
      }
    }
    if (interim) showInterim(interim);
  };

  recognition.onerror = (e) => {
    if (e.error === 'no-speech' || e.error === 'aborted') return;
    setStatus('', 'Error: ' + e.error);
  };

  recognition.onend = () => {
    if (isListening && !isPaused) {
      try { recognition.start(); } catch (_) {}
    }
  };

  recognition.start();
  addLine('🎤 Mic mode — speak or play audio near mic', '', true);
}

// ===== TAB AUDIO =====
async function startTabAudioCapture() {
  try {
    mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    mediaStream.getVideoTracks().forEach(t => t.stop());

    const audioTracks = mediaStream.getAudioTracks();
    if (!audioTracks.length) {
      addLine('❌ "Share tab audio" ✅ tick பண்ணி மீண்டும் try பண்ணுங்கள்.', '', true);
      stopListening();
      return;
    }

    startChunkRecording(new MediaStream(audioTracks));
    addLine(`🔊 Tab audio ON — ${providerLabel(activeProvider)} transcribing...`, '', true);

    audioTracks[0].onended = () => {
      addLine('⚠️ Tab sharing stopped.', '', true);
      stopListening();
    };
  } catch (err) {
    if (err.name !== 'NotAllowedError') addLine('❌ ' + err.message, '', true);
    stopListening();
  }
}

function startChunkRecording(stream) {
  const chunks = [];
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus' : 'audio/webm';

  mediaRecorder = new MediaRecorder(stream, { mimeType });
  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  mediaRecorder.onstop = async () => {
    if (!chunks.length || isPaused) { chunks.length = 0; return; }
    const blob = new Blob(chunks, { type: mimeType });
    chunks.length = 0;
    if (blob.size < 1000) return;
    await transcribeAudio(blob);
  };

  function recordChunk() {
    if (!isListening || isPaused) return;
    chunks.length = 0;
    mediaRecorder.start();
    setTimeout(() => { if (mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 4000);
  }

  recordChunk();
  recordInterval = setInterval(recordChunk, 4200);
}

// ===== UNIFIED TRANSCRIPTION — any API key =====
async function transcribeAudio(audioBlob) {
  const key = getApiKey();
  if (!key) return;

  const provider = activeProvider || detectProvider(key, apiProviderSelect.value);
  showInterim('Transcribing...');

  try {
    let english = '';
    let tamil = '';
    const showTamil = document.getElementById('showTamil')?.checked ?? true;

    if (provider === 'gemini') {
      const result = await transcribeGemini(audioBlob, key, showTamil);
      english = result.en;
      tamil = result.ta;
    } else if (provider === 'openai') {
      english = await transcribeOpenAI(audioBlob, key);
      if (showTamil && english) tamil = await translateText(english, key, 'openai');
    } else if (provider === 'groq') {
      english = await transcribeGroq(audioBlob, key);
      if (showTamil && english) tamil = await translateText(english, key, 'groq');
    }

    removeInterim();
    if (english) onNewText(english, tamil);
  } catch (err) {
    removeInterim();
    // Auto-fallback: try other providers
    const fallback = await tryFallback(audioBlob, provider);
    if (!fallback) addLine('❌ ' + err.message, '', true);
  }
}

async function tryFallback(audioBlob, failedProvider) {
  const key = getApiKey();
  const all = ['gemini', 'openai', 'groq'].filter(p => p !== failedProvider);
  const showTamil = document.getElementById('showTamil')?.checked ?? true;

  for (const p of all) {
    try {
      let english = '', tamil = '';
      if (p === 'gemini' && key.startsWith('AIza')) {
        const r = await transcribeGemini(audioBlob, key, showTamil);
        english = r.en; tamil = r.ta;
      } else if (p === 'openai' && key.startsWith('sk')) {
        english = await transcribeOpenAI(audioBlob, key);
        if (showTamil) tamil = await translateText(english, key, 'openai');
      } else if (p === 'groq' && key.startsWith('gsk_')) {
        english = await transcribeGroq(audioBlob, key);
        if (showTamil) tamil = await translateText(english, key, 'groq');
      } else continue;

      if (english) {
        activeProvider = p;
        providerBadge.textContent = providerLabel(p);
        onNewText(english, tamil);
        return true;
      }
    } catch (_) {}
  }
  return false;
}

// --- Gemini ---
async function transcribeGemini(audioBlob, key, showTamil) {
  const base64 = await blobToBase64(audioBlob);
  const prompt = showTamil
    ? 'Listen to audio. Return ONLY JSON: {"en":"transcription","ta":"simple tamil"}. No speech = {"en":"","ta":""}'
    : 'Transcribe audio to English only. No speech = empty string.';

  for (const model of GEMINI_MODELS) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: 'audio/webm', data: base64 } },
            { text: prompt }
          ]}]
        })
      }
    );
    const data = await res.json();
    if (!res.ok) {
      if (model !== GEMINI_MODELS[GEMINI_MODELS.length - 1]) continue;
      throw new Error(data.error?.message || 'Gemini error');
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    localStorage.setItem('gemini_model', model);

    if (showTamil) {
      try {
        const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
        return { en: parsed.en || '', ta: parsed.ta || '' };
      } catch {
        return { en: raw.trim(), ta: '' };
      }
    }
    return { en: raw.trim(), ta: '' };
  }
  throw new Error('Gemini models unavailable');
}

// --- OpenAI Whisper ---
async function transcribeOpenAI(audioBlob, key) {
  const form = new FormData();
  form.append('file', audioBlob, 'audio.webm');
  form.append('model', 'whisper-1');
  form.append('language', 'en');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI error');
  return (data.text || '').trim();
}

// --- Groq Whisper ---
async function transcribeGroq(audioBlob, key) {
  const form = new FormData();
  form.append('file', audioBlob, 'audio.webm');
  form.append('model', 'whisper-large-v3');
  form.append('language', 'en');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Groq error');
  return (data.text || '').trim();
}

// --- Tamil Translation (any provider) ---
async function translateText(text, key, provider) {
  const prompt = `Explain this English in simple Tamil for a student (1-2 lines):\n"${text}"`;

  if (provider === 'gemini' || key.startsWith('AIza')) {
    const model = localStorage.getItem('gemini_model') || GEMINI_MODELS[0];
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  if (provider === 'openai' || key.startsWith('sk')) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OPENAI_CHAT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  if (provider === 'groq' || key.startsWith('gsk_')) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GROQ_CHAT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  return '';
}

function blobToBase64(blob) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
}

// ===== UI =====
function onNewText(english, tamil = '') {
  if (!english || english.length < 2) return;
  const lineId = addLine(english, tamil);
  const el = document.getElementById('line-' + lineId);
  const showReply = document.getElementById('showReply')?.checked ?? true;
  const key = getApiKey();
  const p = activeProvider || detectProvider(key, apiProviderSelect.value);

  if (!tamil && document.getElementById('showTamil')?.checked && key) {
    translateText(english, key, p).then(ta => {
      if (el && ta) el.querySelector('.ta').textContent = '🇮🇳 ' + ta;
    });
  }

  if (showReply && !el.classList.contains('system') && isQuestionOrTask(english)) {
    el.classList.add('has-reply');
    const loading = document.createElement('div');
    loading.className = 'reply-loading';
    loading.textContent = '💬 Reply ready ஆகுது...';
    el.appendChild(loading);

    suggestResponse(english, key, p).then(result => {
      loading.remove();
      if (!result || !el) return;
      appendReplyToLine(el, result);
    });
  }
}

function appendReplyToLine(el, result) {
  const replyDiv = document.createElement('div');
  replyDiv.className = 'reply-box';
  replyDiv.innerHTML = `
    <div class="reply-label">💬 நீங்கள் சொல்லுங்கள் (You Say)</div>
    <div class="reply-text">${escapeHtml(result.reply)}</div>
    <button class="reply-copy" type="button">Copy Reply</button>
  `;
  replyDiv.querySelector('.reply-copy').addEventListener('click', () => {
    navigator.clipboard.writeText(result.reply);
    statusText.textContent = 'Reply copied!';
    setTimeout(() => { if (isListening) statusText.textContent = 'Listening...'; }, 1500);
  });

  const actionDiv = document.createElement('div');
  actionDiv.className = 'action-box';
  actionDiv.innerHTML = `
    <div class="action-label">📋 அடுத்து என்ன பண்ணணும்</div>
    <div class="action-text">🇮🇳 ${escapeHtml(result.actionTa || result.action)}</div>
  `;

  el.appendChild(replyDiv);
  el.appendChild(actionDiv);
  transcriptBox.scrollTop = transcriptBox.scrollHeight;
}

function addLine(english, tamil = '', isSystem = false) {
  transcriptBox.querySelector('.placeholder')?.remove();
  lineCount++;
  const div = document.createElement('div');
  div.className = 'transcript-line' + (isSystem ? ' system' : '');
  div.id = 'line-' + lineCount;
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const label = isSystem ? '' : '<div class="they-said">👂 அவங்க சொன்னது</div>';
  div.innerHTML = `
    <div class="time">${time}</div>
    ${label}
    <div class="en">${escapeHtml(english)}</div>
    ${tamil ? `<div class="ta">🇮🇳 ${escapeHtml(tamil)}</div>` : '<div class="ta"></div>'}
  `;
  transcriptBox.appendChild(div);
  transcriptBox.scrollTop = transcriptBox.scrollHeight;
  document.getElementById('lineCount').textContent = lineCount + ' lines';
  return lineCount;
}

function showInterim(text) {
  removeInterim();
  interimEl = document.createElement('div');
  interimEl.className = 'transcript-line interim';
  interimEl.innerHTML = `<div class="en">${escapeHtml(text)}</div>`;
  transcriptBox.appendChild(interimEl);
  transcriptBox.scrollTop = transcriptBox.scrollHeight;
}

function removeInterim() {
  interimEl?.remove();
  interimEl = null;
  transcriptBox.querySelector('.interim')?.remove();
}

function clearTranscript() {
  transcriptBox.innerHTML = '<p class="placeholder">Text இங்கே live-ஆ வரும்...</p>';
  lineCount = 0;
  document.getElementById('lineCount').textContent = '0 lines';
  removeInterim();
}

function copyAll() {
  const lines = transcriptBox.querySelectorAll('.transcript-line:not(.interim):not(.system)');
  const text = [...lines].map(l => {
    const en = l.querySelector('.en')?.textContent || '';
    const ta = l.querySelector('.ta')?.textContent || '';
    const reply = l.querySelector('.reply-text')?.textContent || '';
    const action = l.querySelector('.action-text')?.textContent || '';
    let block = 'They said: ' + en;
    if (ta) block += '\n' + ta;
    if (reply) block += '\nYou say: ' + reply;
    if (action) block += '\nNext: ' + action;
    return block;
  }).filter(Boolean).join('\n\n');
  navigator.clipboard.writeText(text);
  statusText.textContent = 'Copied!';
  setTimeout(() => { if (isListening) statusText.textContent = 'Listening...'; }, 1500);
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
