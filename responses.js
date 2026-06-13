// ===== INTERNSHIP RESPONSE ENGINE =====
// Uses USER_PROFILE from profile.js

function getIntroReply() {
  return USER_PROFILE.introLine;
}

function getResumeReply() {
  return `Sure, I'll send my resume right away to ${USER_PROFILE.email}. I can also email it directly to you — please share your email address.`;
}

function getCertificateReply() {
  return `Yes, I have my certificates ready — Digital Marketing from Redback IT Solutions, Digital Literacy from NIELIT (Government of India), and I'm currently enrolled in AI & ML from IIT Patna. I'll upload them shortly. Could you confirm where to upload?`;
}

// Pattern → { reply, action, actionTa }
const TASK_PATTERNS = [
  {
    match: /resume|cv|curriculum vitae|send.*your.*bio/i,
    get reply() { return getResumeReply(); },
    action: `Resume PDF அனுப்புங்கள் → ${USER_PROFILE.email}`,
    actionTa: "harivarshan765@gmail.com-ல் இருந்து resume email பண்ணுங்கள்"
  },
  {
    match: /certificate|certification|upload.*document|submit.*document|degree|marksheet/i,
    get reply() { return getCertificateReply(); },
    action: "3 certificates upload: Redback DM, NIELIT, IIT Patna admission",
    actionTa: "Redback, NIELIT, IIT Patna certificates scan பண்ணி upload பண்ணுங்கள்"
  },
  {
    match: /qualification|education|degree|college|studying|student/i,
    get reply() { return `I'm a Computer Science student at Government College of Engineering, graduating in 2026. I also have Digital Marketing certification and I'm learning AI & ML from IIT Patna.`; },
    action: "Education + certificates சொல்லுங்கள்",
    actionTa: "College, Redback certificate, IIT Patna course mention பண்ணுங்கள்"
  },
  {
    match: /skill|what can you do|what do you know|experience/i,
    get reply() { return `I have skills in ${USER_PROFILE.skillsShort}. I've completed Digital Marketing training and I'm currently learning AI tools and Machine Learning basics.`; },
    action: "Skills list சொல்லுங்கள்: SEO, Canva, Photoshop, SMM",
    actionTa: "உங்கள் main skills confidently சொல்லுங்கள்"
  },
  {
    match: /email|contact|phone|reach you|your number/i,
    get reply() { return `You can reach me at ${USER_PROFILE.email} or ${USER_PROFILE.phone}.`; },
    action: "Email & phone சொல்லுங்கள்",
    actionTa: "9384017725, harivarshan765@gmail.com"
  },
  {
    match: /you know what to do|you know what|figure it out|handle it|take care of it|up to you/i,
    reply: "Yes, I understand. I'll take care of it and update you once it's done.",
    action: "அவங்க சொன்ன task-ஐ செய்து முடித்து update தருங்கள்",
    actionTa: "புரிஞ்சுது என்று சொல்லி work start பண்ணுங்கள்"
  },
  {
    match: /send.*email|email.*me|mail.*me|drop.*mail|shoot.*email/i,
    reply: "Sure, I'll send you an email shortly. Thank you.",
    action: "Email எழுதி send பண்ணுங்கள்",
    actionTa: "Professional email எழுதி அனுப்புங்கள்"
  },
  {
    match: /introduce.*yourself|tell.*about.*yourself|who are you/i,
    get reply() { return getIntroReply(); },
    action: "Confidence-ஆ full intro சொல்லுங்கள் (30 seconds)",
    actionTa: "Name → College → Redback cert → Skills → Eager to learn"
  },
  {
    match: /do you understand|got it|clear\?|make sense|understood/i,
    reply: "Yes, I understand. Thank you for explaining. I'll proceed accordingly.",
    action: "புரிஞ்சுது என்று confirm பண்ணுங்கள்",
    actionTa: "தொடர்ந்து work பண்ணுங்கள்"
  },
  {
    match: /any question|questions\?|doubts|anything.*ask/i,
    reply: "Yes, I have one question — [your doubt here]. Could you please clarify?",
    action: "ஒரு clear doubt கேளுங்கள் (அல்லது 'No questions, thank you')",
    actionTa: "Doubt இருந்தா கேளுங்கள், இல்லனா 'No questions' சொல்லுங்கள்"
  },
  {
    match: /status|update|progress|how.*going|where.*stand/i,
    reply: "Here's my update: I've completed [task 1] and I'm currently working on [task 2]. I expect to finish by [time].",
    action: "என்ன done, என்ன pending — short-ஆ update தருங்கள்",
    actionTa: "Status prepare பண்ணி சொல்லுங்கள்"
  },
  {
    match: /deadline|by when|finish by|complete by|due date|eod|end of day/i,
    reply: "Yes, I'll make sure to complete it within the deadline. I'll inform you if I face any issues.",
    action: "Deadline note பண்ணுங்கள், calendar-ல் set பண்ணுங்கள்",
    actionTa: "நேரத்துக்குள் முடிக்க plan பண்ணுங்கள்"
  },
  {
    match: /can you|could you|will you|would you|are you able/i,
    reply: "Yes, I can do that. I'll get started on it right away and keep you updated.",
    action: "Yes சொல்லி work start பண்ணுங்கள்",
    actionTa: "Confidence-ஆ yes சொல்லுங்கள்"
  },
  {
    match: /need help|want help|stuck|face.*problem|any issue/i,
    reply: "Thank you for asking. I do have a small doubt about [topic]. Could you please guide me?",
    action: "Help கேளுங்கள் — specific doubt சொல்லுங்கள்",
    actionTa: "Problem இருந்தா உடனே சொல்லுங்கள்"
  },
  {
    match: /report|write.*report|submit.*report/i,
    reply: "Sure, I'll prepare the report and send it to you by [deadline].",
    action: "Report எழுதி submit பண்ணுங்கள்",
    actionTa: "Format கேட்டு report prepare பண்ணுங்கள்"
  },
  {
    match: /join.*meeting|attend.*meeting|meeting.*tomorrow|zoom|call at/i,
    reply: "Yes, I'll be there. Could you please share the meeting link or calendar invite?",
    action: "Meeting time note பண்ணுங்கள், link கேளுங்கள்",
    actionTa: "Calendar-ல் reminder set பண்ணுங்கள்"
  },
  {
    match: /design|canva|poster|creative|banner|graphic/i,
    reply: "Sure, I'll create the design using Canva and share it with you for review.",
    action: "Canva-ல் design பண்ணி review-க்கு அனுப்புங்கள்",
    actionTa: "Design draft ready பண்ணுங்கள்"
  },
  {
    match: /social media|instagram|facebook|meta|post|content/i,
    reply: "I'll work on the social media content and share the draft for your approval before posting.",
    action: "Content draft prepare பண்ணி approval கேளுங்கள்",
    actionTa: "Post பண்ணும் முன் manager-க்கு காட்டுங்கள்"
  },
  {
    match: /learn|training|tutorial|watch.*video/i,
    reply: "Thank you. I'll go through the material and let you know if I have any questions.",
    action: "Material பார்த்து notes எடுங்கள்",
    actionTa: "Learn பண்ணி doubts list பண்ணுங்கள்"
  },
  {
    match: /repeat|say again|didn't hear|pardon/i,
    reply: "I'm sorry, could you please repeat that? I want to make sure I understand correctly.",
    action: "கவலைப்படாதீர்கள் — politely மறுபடியும் கேளுங்கள்",
    actionTa: "Normal thing — repeat கேளுங்கள்"
  },
  {
    match: /thank you|thanks|good job|well done|great work|nice work/i,
    reply: "Thank you so much! I really appreciate the feedback. I'll keep doing my best.",
    action: "Thank you சொல்லி smile பண்ணுங்கள்",
    actionTa: "Positive feedback — motivate ஆகும்!"
  },
  {
    match: /tomorrow|today|this week|asap|urgent|immediately/i,
    reply: "Understood. I'll prioritize this and complete it as soon as possible.",
    action: "Urgent task — மற்ற work pause பண்ணி இதை முதலில் செய்யுங்கள்",
    actionTa: "Priority கொடுத்து செய்யுங்கள்"
  },
  {
    match: /what did you|what have you|yesterday|last week/i,
    reply: "Yesterday I worked on [task]. I completed [X] and started [Y]. Today I plan to [next task].",
    action: "நேற்று செய்த work-ஐ list பண்ணி சொல்லுங்கள்",
    actionTa: "Daily work notes வைத்திருங்கள்"
  }
];

function matchTask(text) {
  const lower = text.toLowerCase();
  for (const p of TASK_PATTERNS) {
    if (p.match.test(lower)) return p;
  }
  return null;
}

function isQuestionOrTask(text) {
  const lower = text.toLowerCase();
  if (text.includes('?')) return true;
  if (matchTask(text)) return true;
  const triggers = [
    'please', 'can you', 'could you', 'will you', 'would you',
    'send', 'upload', 'submit', 'share', 'complete', 'finish',
    'do you', 'are you', 'have you', 'need you', 'want you',
    'make sure', 'let me know', 'confirm', 'check'
  ];
  return triggers.some(t => lower.includes(t));
}

async function suggestResponse(text, apiKey, provider) {
  const matched = matchTask(text);
  if (matched) {
    return {
      reply: matched.reply,
      action: matched.action,
      actionTa: matched.actionTa,
      source: 'ready'
    };
  }

  if (!isQuestionOrTask(text)) return null;

  if (!apiKey) {
    return {
      reply: "Thank you. Let me confirm — could you please clarify what you'd like me to do?",
      action: "Clear-ஆ புரியலன்னா clarify கேளுங்கள்",
      actionTa: "Generic safe response",
      source: 'default'
    };
  }

  try {
    const ai = await aiSuggestResponse(text, apiKey, provider);
    if (ai) return { ...ai, source: 'ai' };
  } catch (_) {}

  return {
    reply: "Yes, I understand. I'll take care of it and update you shortly.",
    action: "புரிஞ்சது போல் சொல்லி பிறகு clarify பண்ணுங்கள்",
    actionTa: "Safe response",
    source: 'default'
  };
}

async function aiSuggestResponse(text, key, provider) {
  const prompt = `You are helping ${USER_PROFILE.name}, a student ${USER_PROFILE.role} with ${USER_PROFILE.skills} skills.

Someone in a meeting said: "${text}"

Return ONLY JSON:
{
  "reply": "short professional English reply Hari should speak (2 sentences max)",
  "action": "what Hari should DO next in simple English (1 line)",
  "actionTa": "same action in simple Tamil for student"
}`;

  const raw = await callTextAI(prompt, key, provider);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    if (parsed.reply) return parsed;
  } catch (_) {
    return { reply: raw.trim(), action: 'Follow up on this task', actionTa: 'இந்த task-ஐ follow up பண்ணுங்கள்' };
  }
  return null;
}

async function callTextAI(prompt, key, provider) {
  if (provider === 'gemini' || key.startsWith('AIza')) {
    const model = localStorage.getItem('gemini_model') || 'gemini-2.0-flash';
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
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200
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
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  return '';
}
