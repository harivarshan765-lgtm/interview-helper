// ===== NAVIGATION =====
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');

function goToSection(id) {
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.section === id));
  sections.forEach(s => s.classList.toggle('active', s.id === id));
  sidebar.classList.remove('open');
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => goToSection(btn.dataset.section));
});

document.querySelectorAll('.quick-card').forEach(card => {
  card.addEventListener('click', () => goToSection(card.dataset.go));
});

menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

// ===== TOAST / COPY =====
function showToast(msg = 'Copied!') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('btn-copy')) {
    const target = document.getElementById(e.target.dataset.target);
    if (target) {
      navigator.clipboard.writeText(target.innerText || target.textContent);
      showToast();
    }
  }
});

function showResult(boxId) {
  document.getElementById(boxId).classList.add('show');
}

// ===== MEETING HELPER =====
const meetingAnswers = {
  introduce: {
    en: () => typeof USER_PROFILE !== 'undefined' ? USER_PROFILE.introLine : "Hello, I'm Harivarshan. I'm a Computer Science student with Digital Marketing certification. I have skills in SEO, Canva, Photoshop, and Social Media Marketing.",
    ta: "Name → College → Redback certificate → Skills (SEO, Canva, Photoshop) → Eager to learn சொல்லுங்கள்."
  },
  yesterday: {
    en: (ctx) => `Yesterday, I ${ctx || 'worked on the assigned tasks and learned new tools related to digital marketing'}. I also reviewed some materials to better understand our current projects.`,
    ta: "நேற்று என்ன work பண்ணீங்களோ அதை professional-ஆ சொல்லுங்கள். Context box-ல் type பண்ணினால் அது include ஆகும்."
  },
  understand: {
    en: "Yes, I understand. Thank you for explaining. I'll proceed with the task accordingly.",
    ta: "புரிஞ்சுது என்று polite-ஆ சொல்லுங்கள்."
  },
  deadline: {
    en: (ctx) => `Yes, I will try my best to complete it ${ctx ? 'by ' + ctx : 'within the given deadline'}. If I face any challenges, I'll inform you in advance.`,
    ta: "Deadline-க்குள் முடிக்க try பண்ணுவேன். Problem வந்தா advance-ஆ inform பண்ணுவேன்."
  },
  help: {
    en: "Thank you for offering. I have a small doubt — could you please clarify [your doubt here]? I want to make sure I do it correctly.",
    ta: "Help வேண்டும்னா politely கேளுங்கள். Doubt-ஐ specific-ஆ கேளுங்கள்."
  },
  opinion: {
    en: (ctx) => `In my opinion, ${ctx || 'this approach looks effective for our target audience'}. However, I'd like to learn more before giving a final suggestion.`,
    ta: "உங்கள் opinion சொல்லுங்கள், ஆனால் 'I'd like to learn more' add பண்ணுங்கள் — professional-ஆ இருக்கும்."
  },
  repeat: {
    en: "I'm sorry, could you please repeat that? I want to make sure I understand correctly.",
    ta: "மறுபடியும் சொல்லுங்கள் — polite phrase. Problem இல்லை, professional-ஆ கேட்கலாம்."
  },
  clarify: {
    en: "I apologize, I didn't fully understand that part. Could you please explain it once more? I want to make sure I get it right.",
    ta: "புரியலன்னா கேட்குறது தவறு இல்லை. Polite-ஆ கேளுங்கள்."
  },
  update: {
    en: (ctx) => `Here's my update: ${ctx || 'I have completed the initial research and started working on the designs. I expect to finish the first draft by end of day.'}`,
    ta: "என்ன complete பண்ணீங்கள், என்ன pending — short-ஆ update தருங்கள்."
  },
  learned: {
    en: (ctx) => `Today I learned about ${ctx || 'social media marketing strategies and how to create effective ad creatives using Canva'}. It was very helpful for my understanding.`,
    ta: "இன்று என்ன learn பண்ணீங்களோ அதை சொல்லுங்கள்."
  }
};

document.getElementById('meetingQuestion').addEventListener('change', e => {
  document.getElementById('customQuestionBox').classList.toggle('hidden', e.target.value !== 'custom');
});

document.getElementById('getMeetingAnswer').addEventListener('click', () => {
  const type = document.getElementById('meetingQuestion').value;
  const ctx = document.getElementById('meetingContext').value.trim();
  const custom = document.getElementById('customQuestion').value.trim();

  if (!type) { showToast('Select a question type'); return; }

  let answer, tamil;

  if (type === 'custom' && custom) {
    answer = generateCustomAnswer(custom, ctx);
    tamil = `"${custom}" — இந்த question-க்கு professional answer generate பண்ணப்பட்டது. Context-ஐ update பண்ணி use பண்ணுங்கள்.`;
  } else if (meetingAnswers[type]) {
    const data = meetingAnswers[type];
    answer = typeof data.en === 'function' ? data.en(ctx) : data.en;
    tamil = typeof data.ta === 'function' ? data.ta(ctx) : data.ta;
  } else {
    showToast('Select a question type');
    return;
  }

  document.getElementById('meetingAnswer').textContent = answer;
  document.getElementById('meetingTamil').textContent = '🇮🇳 ' + tamil;
  showResult('meetingResult');
});

function generateCustomAnswer(question, ctx) {
  const q = question.toLowerCase();
  if (q.includes('can you') || q.includes('will you') || q.includes('could you')) {
    return `Yes, I can do that${ctx ? '. ' + ctx : ''}. I'll make sure to complete it properly and keep you updated on the progress.`;
  }
  if (q.includes('experience') || q.includes('worked')) {
    return `I have basic experience with ${ctx || 'Canva, Photoshop, and social media content creation'}. I'm eager to learn more during this internship.`;
  }
  if (q.includes('why') || q.includes('reason')) {
    return `I'm interested in digital marketing because ${ctx || 'I enjoy creating content and want to learn how to reach audiences through social media and Meta ads'}.`;
  }
  return `Thank you for the question. ${ctx || 'Based on my current understanding, I would approach this carefully and seek guidance when needed.'} I'm happy to discuss this further.`;
}

// ===== TRANSLATE / EXPLAIN =====
const wordDict = {
  'deadline': 'கடைசி தேதி / நேரம்',
  'meeting': 'கூட்டம்',
  'update': 'புதுப்பிப்பு / status',
  'campaign': 'விளம்பர பிரச்சாரம்',
  'audience': 'பார்வையாளர்கள் / target people',
  'engagement': 'பார்வையாளர்களின் interaction',
  'impression': 'எத்தனை முறை ad காட்டப்பட்டது',
  'conversion': 'visitor customer ஆக மாறுதல்',
  'budget': 'பட்ஜெட் / செலவு திட்டம்',
  'analytics': 'தரவு பகுப்பாய்வு',
  'creative': 'வடிவமைப்பு / design content',
  'target': 'இலக்கு',
  'performance': 'செயல்திறன்',
  'report': 'அறிக்கை',
  'feedback': 'கருத்து / பின்னூட்டம்',
  'assign': 'பணி ஒதுக்குதல்',
  'complete': 'முடிக்க',
  'submit': 'சமர்ப்பிக்க',
  'review': 'மறுபரிசீலனை',
  'design': 'வடிவமைப்பு',
  'content': 'உள்ளடக்கம்',
  'social media': 'சமூக ஊடகம்',
  'advertisement': 'விளம்பரம்',
  'client': 'வாடிக்கையாளர்',
  'team': 'குழு',
  'project': 'திட்டம்',
  'task': 'பணி',
  'learn': 'கற்றுக்கொள்',
  'intern': 'பயிற்சி மாணவர்',
  'manager': 'மேலாளர்',
  'schedule': 'அட்டவணை',
  'priority': 'முன்னுரிமை',
  'urgent': 'அவசரம்',
  'approve': 'அங்கீகரிக்க',
  'revise': 'திருத்தம் செய்',
  'launch': 'தொடங்கு / release',
  'strategy': 'திட்டமிடல்',
  'metric': 'அளவீடு',
  'click': 'கிளிக்',
  'reach': 'எத்தனை பேருக்கு சென்றது',
  'brand': 'பிராண்ட்',
  'post': 'பதிவு',
  'story': 'ஸ்டோரி',
  'reel': 'ரீல்',
  'hashtag': 'ஹேஷ்டேக்',
  'caption': 'விளக்கம் / text',
  'insight': 'பகுப்பாய்வு தகவல்',
  'objective': 'இலக்கு',
  'optimize': 'மேம்படுத்து',
  'roi': 'Return on Investment — செலவுக்கு எவ்வளவு return',
  'ctr': 'Click Through Rate — எத்தனை பேர் click பண்ணார்கள்',
  'cpc': 'Cost Per Click — ஒரு click-க்கு செலவு',
  'cpm': 'Cost Per 1000 Impressions',
  'meta': 'Facebook & Instagram (Meta platform)',
  'boost': 'paid promotion',
  'organic': 'இலவச / paid இல்லாத reach',
  'paid': 'பணம் செலுத்தி',
  'kpi': 'Key Performance Indicator — முக்கிய அளவீடு',
  'brief': 'சுருக்க விளக்கம்',
  'deadline extension': 'கால அவகாசம் கேட்பது'
};

const phraseDict = {
  'could you please': 'தயவுசெய்து ... செய்ய முடியுமா? (polite request)',
  'let me know': 'எனக்கு தெரிவியுங்கள்',
  'as soon as possible': 'விரைவில் / ASAP',
  'by end of day': 'இன்றைய நாள் முடிவுக்குள்',
  'keep me posted': 'எனக்கு update தருங்கள்',
  'circle back': 'பிறகு மீண்டும் discuss பண்ணுவோம்',
  'touch base': 'contact / பேசுவோம்',
  'on track': 'சரியான பாதையில்',
  'action items': 'செய்ய வேண்டிய பணிகள்',
  'follow up': 'தொடர்ந்து பார்க்க / மீண்டும் check',
  'reach out': 'தொடர்பு கொள்',
  'going forward': 'இனிமேல்',
  'at this point': 'இந்த நேரத்தில்',
  'moving forward': 'முன்னோக்கி',
  'heads up': 'முன்னறிவிப்பு',
  'loop in': 'ஒருவரை include பண்ணு (email/meeting)',
  'ping me': 'message அனுப்பு',
  'stand up': 'daily short team meeting',
  'sync up': 'ஒத்திசைக்க / பேசி align பண்ணு'
};

document.getElementById('translateBtn').addEventListener('click', () => {
  const text = document.getElementById('translateInput').value.trim();
  if (!text) { showToast('Paste some English text'); return; }

  const lower = text.toLowerCase();
  let explanation = [];
  let foundPhrases = [];
  let foundWords = [];

  for (const [phrase, tamil] of Object.entries(phraseDict)) {
    if (lower.includes(phrase)) foundPhrases.push(`"${phrase}" → ${tamil}`);
  }

  const words = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
  for (const word of words) {
    if (wordDict[word]) foundWords.push(`${word} → ${wordDict[word]}`);
  }

  for (const [key, val] of Object.entries(wordDict)) {
    if (key.includes(' ') && lower.includes(key)) {
      foundWords.push(`${key} → ${val}`);
    }
  }

  if (foundPhrases.length) {
    explanation.push('📌 Phrases:\n' + foundPhrases.join('\n'));
  }
  if (foundWords.length) {
    explanation.push('📌 Words:\n' + [...new Set(foundWords)].join('\n'));
  }

  if (!explanation.length) {
    explanation.push('இந்த text-ல் common internship/marketing words கிடைக்கவில்லை.');
    explanation.push('\n💡 Tip: Marketing Terms tab-ல் search பண்ணுங்கள், அல்லது Cursor chat-ல் full translation கேளுங்கள்.');
  }

  explanation.push('\n📝 Original: ' + text);
  document.getElementById('translateOutput').textContent = explanation.join('\n\n');
  showResult('translateResult');
});

// ===== EMAIL WRITER =====
const emailTemplates = {
  leave: (to, detail) => `Subject: Leave Request — ${detail || '[Date]'}

Dear ${to || 'Sir/Madam'},

I hope this email finds you well. I would like to request leave on ${detail || '[date]'} due to [reason]. I will ensure that my pending tasks are completed before my leave.

Thank you for your understanding.

Best regards,
Hari Harivarshan`,

  thank: (to, detail) => `Subject: Thank You

Dear ${to || 'Sir/Madam'},

Thank you for ${detail || 'your guidance and support'}. I truly appreciate the opportunity to learn and grow during this internship.

Best regards,
Hari Harivarshan`,

  update: (to, detail) => `Subject: Work Update — ${new Date().toLocaleDateString('en-IN')}

Dear ${to || 'Sir/Madam'},

I hope you are doing well. Here is my work update:

${detail || '• Completed assigned tasks\n• Working on next steps\n• No blockers at the moment'}

Please let me know if you need any further details.

Best regards,
Hari Harivarshan`,

  doubt: (to, detail) => `Subject: Clarification Needed

Dear ${to || 'Sir/Madam'},

I hope you are doing well. I have a doubt regarding ${detail || '[topic]'}. Could you please clarify when you have a moment? I want to make sure I proceed correctly.

Thank you for your time.

Best regards,
Hari Harivarshan`,

  late: (to, detail) => `Subject: Running Late — ${new Date().toLocaleDateString('en-IN')}

Dear ${to || 'Sir/Madam'},

I apologize for the inconvenience. I am running late today due to ${detail || '[reason]'}. I expect to arrive by [time].

Thank you for your understanding.

Best regards,
Hari Harivarshan`,

  complete: (to, detail) => `Subject: Task Completed — ${detail || '[Task Name]'}

Dear ${to || 'Sir/Madam'},

I have completed the task: ${detail || '[task description]'}. Please review it and let me know if any changes are needed.

Thank you.

Best regards,
Hari Harivarshan`,

  intro: (to, detail) => `Subject: Introduction — Hari Harivarshan, Digital Marketing Intern

Dear ${to || 'Team'},

My name is Hari Harivarshan, and I have recently joined as a digital marketing intern. I have basic experience with Canva and Photoshop, and I am eager to learn about social media marketing and Meta ads.

${detail ? 'I am particularly interested in ' + detail + '.' : ''}

I look forward to working with all of you.

Best regards,
Hari Harivarshan`
};

document.getElementById('generateEmail').addEventListener('click', () => {
  const type = document.getElementById('emailType').value;
  const to = document.getElementById('emailTo').value.trim();
  const detail = document.getElementById('emailDetail').value.trim();
  const template = emailTemplates[type];
  if (template) {
    document.getElementById('emailOutput').textContent = template(to, detail);
    showResult('emailResult');
  }
});

// ===== GLOSSARY =====
const glossary = [
  { term: 'CTR (Click-Through Rate)', tamil: 'எத்தனை பேர் ad-ஐ பார்த்து click பண்ணார்கள் — percentage-ஆ measure பண்ணுவார்கள்.', example: 'CTR 2% = 100 பேர் பார்த்தால் 2 பேர் click பண்ணினார்' },
  { term: 'Impressions', tamil: 'உங்கள் ad எத்தனை முறை screen-ல் காட்டப்பட்டது.', example: '10,000 impressions = ad 10,000 முறை காட்டப்பட்டது' },
  { term: 'Reach', tamil: 'எத்தனை unique (தனித்தனி) பேர் உங்கள் content-ஐ பார்த்தார்கள்.', example: 'Reach 5,000 = 5,000 different people பார்த்தார்கள்' },
  { term: 'Engagement', tamil: 'Like, comment, share, save — audience interaction எல்லாம்.', example: 'High engagement = people actively interact பண்ணுறாங்க' },
  { term: 'Conversion', tamil: 'Visitor-ஐ customer-ஆ மாற்றுதல் (purchase, signup, etc.).', example: '100 visitors, 5 bought = 5% conversion rate' },
  { term: 'ROI (Return on Investment)', tamil: 'எவ்வளவு பணம் செலவு பண்ணினீங்கள் vs எவ்வளவு return கிடைத்தது.', example: '₹1000 spend, ₹3000 sales = good ROI' },
  { term: 'CPC (Cost Per Click)', tamil: 'ஒரு click-க்கு எவ்வளவு செலவு.', example: 'CPC ₹5 = ஒவ்வொரு click-க்கும் ₹5' },
  { term: 'CPM (Cost Per Mille)', tamil: '1000 impressions-க்கு எவ்வளவு செலவு.', example: 'CPM ₹100 = 1000 views-க்கு ₹100' },
  { term: 'Meta Ads', tamil: 'Facebook & Instagram-ல் paid advertisements.', example: 'Meta Ads Manager-ல் campaign create பண்ணுவார்கள்' },
  { term: 'Target Audience', tamil: 'நீங்கள் reach பண்ண விரும்பும் specific people group.', example: 'Age 18-25, Chennai, interested in fashion' },
  { term: 'Ad Creative', tamil: 'Ad-ல் use பண்ணும் image, video, text.', example: 'Canva-ல் design பண்ணும் poster = creative' },
  { term: 'A/B Testing', tamil: 'இரண்டு versions compare பண்ணி எது better என்று test பண்ணுதல்.', example: 'Blue ad vs Red ad — எது more clicks?' },
  { term: 'Organic Reach', tamil: 'பணம் செலுத்தாமல் இலவசமாக கிடைக்கும் reach.', example: 'Normal post without boost = organic' },
  { term: 'Boost Post', tamil: 'ஒரு post-க்கு பணம் செலுத்தி அதிகமாக people-க்கு காட்டுதல்.', example: '₹500 spend பண்ணி post-ஐ promote பண்ணலாம்' },
  { term: 'KPI (Key Performance Indicator)', tamil: 'Success measure பண்ண முக்கியமான numbers.', example: 'CTR, conversions, engagement = KPIs' },
  { term: 'Landing Page', tamil: 'Ad click பண்ணினால் போகும் webpage.', example: 'Instagram ad → website page' },
  { term: 'Call to Action (CTA)', tamil: 'User-ஐ action எடுக்க சொல்லும் button/text.', example: '"Shop Now", "Learn More", "Sign Up"' },
  { term: 'Hashtag', tamil: '# symbol use பண்ணி content-ஐ categorize பண்ணுதல்.', example: '#DigitalMarketing #MetaAds' },
  { term: 'Insights / Analytics', tamil: 'Performance data — எத்தனை views, clicks, etc.', example: 'Instagram Insights-ல் post performance பார்க்கலாம்' },
  { term: 'Funnel', tamil: 'Customer journey — awareness → interest → purchase.', example: 'Ad பார்த்தார் → website போனார் → buy பண்ணார்' },
  { term: 'Retargeting', tamil: 'முன்பு உங்கள் site/ad பார்த்த people-க்கு மீண்டும் ad காட்டுதல்.', example: 'Amazon-ல் பார்த்த product மறுபடி ad-ல் வருது' },
  { term: 'Lookalike Audience', tamil: 'உங்கள் existing customers-ஐ போல இருக்கும் புதிய people.', example: 'Meta automatically similar people-ஐ கண்டுபிடிக்கும்' },
  { term: 'Pixel', tamil: 'Website-ல் install பண்ணும் code — visitor tracking-க்கு.', example: 'Meta Pixel = website visits track பண்ணும்' },
  { term: 'Bounce Rate', tamil: 'ஒரு page பார்த்து உடனே leave பண்ணும் visitors percentage.', example: 'High bounce rate = content interesting இல்லை' },
  { term: 'Brand Awareness', tamil: 'உங்கள் brand-ஐ எத்தனை பேர் அறிவார்கள் என்பதை அதிகரித்தல்.', example: 'Logo, name recognizable ஆகணும்' }
];

function renderGlossary(filter = '') {
  const list = document.getElementById('glossaryList');
  const f = filter.toLowerCase();
  const items = glossary.filter(g =>
    g.term.toLowerCase().includes(f) || g.tamil.includes(f)
  );
  list.innerHTML = items.map(g => `
    <div class="glossary-item">
      <h4>${g.term}</h4>
      <p class="tamil">🇮🇳 ${g.tamil}</p>
      <p class="example">Example: ${g.example}</p>
    </div>
  `).join('') || '<p style="color:var(--text-muted)">No terms found.</p>';
}

document.getElementById('glossarySearch').addEventListener('input', e => {
  renderGlossary(e.target.value);
});
renderGlossary();

// ===== ENGLISH CORRECTION =====
const corrections = [
  { wrong: /\bi done\b/gi, right: 'I did', note: '"done" க்கு பதிலாக "did" use பண்ணுங்கள் (past tense)' },
  { wrong: /\bi am agree\b/gi, right: 'I agree', note: '"am" தேவையில்லை' },
  { wrong: /\bmore better\b/gi, right: 'better', note: '"more" + "better" ஒன்றே சொல்ல' },
  { wrong: /\breturn back\b/gi, right: 'return', note: '"return" already "back" meaning' },
  { wrong: /\bdiscuss about\b/gi, right: 'discuss', note: '"discuss" க்கு "about" தேவையில்லை' },
  { wrong: /\bexplain me\b/gi, right: 'explain to me', note: '"explain to me" correct' },
  { wrong: /\btoday itself\b/gi, right: 'today itself / by today', note: 'Indian English — "by end of today" more professional' },
  { wrong: /\bi am having\b/gi, right: 'I have', note: '"I have a doubt" (not "I am having")' },
  { wrong: /\bprepone\b/gi, right: 'reschedule to an earlier date', note: '"prepone" Indian English — international-ல் "move up the date"' },
  { wrong: /\bdo the needful\b/gi, right: 'please take the necessary action', note: 'Old phrase — modern English-ல் avoid' },
  { wrong: /\brevert back\b/gi, right: 'reply / get back to me', note: '"revert" = go back to old state. "Reply" use பண்ணுங்கள்' },
  { wrong: /\bkindly do the needful\b/gi, right: 'Could you please handle this?', note: 'Simple, clear request better' },
  { wrong: /\bi want to learn about\b/gi, right: 'I would like to learn about', note: '"would like" more polite & professional' },
  { wrong: /\btomorrow itself\b/gi, right: 'by tomorrow', note: '"by tomorrow" more natural' },
  { wrong: /\bgive me permission\b/gi, right: 'Could I please get approval for', note: 'More formal & polite' },
  { wrong: /\bi am working in\b/gi, right: 'I am working on', note: '"working on a task" (not "in")' },
  { wrong: /\btell about\b/gi, right: 'talk about / explain', note: '"Can you explain..." better' },
  { wrong: /\bonly\b(?=\s*$)/gi, right: '', note: 'Sentence end "only" — remove for professional English' }
];

document.getElementById('correctBtn').addEventListener('click', () => {
  const input = document.getElementById('correctInput').value.trim();
  if (!input) { showToast('Enter a sentence'); return; }

  let fixed = input;
  const notes = [];

  for (const rule of corrections) {
    if (rule.wrong.test(fixed)) {
      fixed = fixed.replace(rule.wrong, rule.right);
      notes.push(rule.note);
    }
    rule.wrong.lastIndex = 0;
  }

  fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
  if (!fixed.endsWith('.') && !fixed.endsWith('?') && !fixed.endsWith('!')) {
    fixed += '.';
  }

  document.getElementById('correctOutput').textContent = fixed;
  document.getElementById('correctTamil').textContent = notes.length
    ? '🇮🇳 Corrections:\n• ' + notes.join('\n• ')
    : '🇮🇳 Good! No common mistakes found. Sentence looks fine.';
  showResult('correctResult');
});

// ===== MEETING NOTES SUMMARY =====
document.getElementById('summarizeBtn').addEventListener('click', () => {
  const text = document.getElementById('notesInput').value.trim();
  if (!text) { showToast('Paste meeting notes'); return; }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const actionWords = ['will', 'should', 'must', 'need to', 'action', 'deadline', 'by', 'assign', 'complete', 'submit', 'review', 'follow up', 'next'];
  const important = [];
  const actions = [];
  const dates = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]?\d{0,4}|monday|tuesday|wednesday|thursday|friday|tomorrow|next week|eod|end of day)\b/gi) || [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (actionWords.some(w => lower.includes(w))) {
      actions.push(line);
    } else if (line.length > 10) {
      important.push(line);
    }
  }

  let html = '<h4 style="margin-bottom:0.75rem;color:var(--primary)">Key Points</h4><ul>';
  const points = [...new Set([...actions, ...important])].slice(0, 8);
  if (points.length) {
    points.forEach(p => { html += `<li>${p}</li>`; });
  } else {
    html += `<li>${lines[0] || 'No clear points found'}</li>`;
  }
  html += '</ul>';

  if (dates.length) {
    html += `<h4 style="margin:1rem 0 0.5rem;color:var(--primary)">Dates / Deadlines</h4><ul>`;
    [...new Set(dates)].forEach(d => { html += `<li>${d}</li>`; });
    html += '</ul>';
  }

  if (actions.length) {
    html += `<h4 style="margin:1rem 0 0.5rem;color:var(--accent)">Action Items</h4><ul>`;
    actions.slice(0, 5).forEach(a => { html += `<li>${a}</li>`; });
    html += '</ul>';
  }

  document.getElementById('notesOutput').innerHTML = html;
  showResult('notesResult');
});

document.getElementById('saveNotesBtn').addEventListener('click', () => {
  const text = document.getElementById('notesInput').value;
  if (text) {
    localStorage.setItem('internship_notes', text);
    showToast('Notes saved!');
  }
});

document.getElementById('loadNotesBtn').addEventListener('click', () => {
  const saved = localStorage.getItem('internship_notes');
  if (saved) {
    document.getElementById('notesInput').value = saved;
    showToast('Notes loaded!');
  } else {
    showToast('No saved notes');
  }
});

// ===== QUICK PHRASES =====
const phrases = [
  { en: "Could you please repeat that?", ta: "மறுபடியும் சொல்ல முடியுமா?" },
  { en: "Let me confirm my understanding...", ta: "நான் சரியாக புரிஞ்சுக்கிட்டேனா confirm பண்ணணும்..." },
  { en: "I'll get back to you on this.", ta: "இதைப் பற்றி பிறகு reply பண்றேன்." },
  { en: "Thank you for the clarification.", ta: "விளக்கத்திற்கு நன்றி." },
  { en: "I'm working on it and will update you shortly.", ta: "வேலை நடக்குது, விரைவில் update தருவேன்." },
  { en: "Could I get some guidance on this?", ta: "இதில் guidance கிடைக்குமா?" },
  { en: "I have completed the task. Please review.", ta: "பணி முடிந்தது. Review பண்ணுங்கள்." },
  { en: "I apologize for the delay.", ta: "தாமதத்திற்கு மன்னிக்கவும்." },
  { en: "Is there anything else you need from me?", ta: "வேற ஏதாவது வேணுமா?" },
  { en: "I'm eager to learn more about this.", ta: "இதைப் பற்றி மேலும் கற்க ஆவலாக இருக்கிறேன்." },
  { en: "Please let me know if any changes are needed.", ta: "மாற்றம் வேணும்னா சொல்லுங்கள்." },
  { en: "I'll make sure to meet the deadline.", ta: "Deadline-க்குள் முடிக்கிறேன்." },
  { en: "May I ask a quick question?", ta: "ஒரு small doubt கேட்கலாமா?" },
  { en: "I appreciate your feedback.", ta: "உங்கள் feedback-க்கு நன்றி." },
  { en: "I'll prioritize this task.", ta: "இந்த task-க்கு priority தருவேன்." },
  { en: "Noted. I'll proceed accordingly.", ta: "புரிஞ்சுது. அதற்கேற்ப தொடருவேன்." },
  { en: "I'm available if you need any assistance.", ta: "உதவி வேணும்னா available-ஆ இருக்கேன்." },
  { en: "Could we schedule a quick call?", ta: "ஒரு quick call schedule பண்ணலாமா?" }
];

const phrasesList = document.getElementById('phrasesList');
phrasesList.innerHTML = phrases.map((p, i) => `
  <div class="phrase-item">
    <div>
      <p class="phrase-english">${p.en}</p>
      <p class="phrase-tamil">🇮🇳 ${p.ta}</p>
    </div>
    <button class="btn-copy" data-target="phrase-${i}">Copy</button>
    <span id="phrase-${i}" style="display:none">${p.en}</span>
  </div>
`).join('');
