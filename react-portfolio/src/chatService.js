import { SKILLS } from "./loadPortfolioData"

const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const API_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.1-8b-instant"
const CACHE_TTL = 3600000
const MAX_TOKENS = 300

const cache = new Map()

function normalize(q) {
  return q.toLowerCase().trim().replace(/[^\w\s]/g, "")
}

function getCached(query) {
  const key = normalize(query)
  const exact = cache.get(key)
  if (exact && Date.now() - exact.ts < CACHE_TTL) return exact.text
  for (const [ck, entry] of cache) {
    if (Date.now() - entry.ts > CACHE_TTL) continue
    if (key.includes(ck) || ck.includes(key)) return entry.text
  }
  return null
}

function setCache(query, text) {
  cache.set(normalize(query), { text, ts: Date.now() })
}

function tokenize(text) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
}

const chunks = (() => {
  const skillsText = SKILLS.map((s) => s.name).join(", ")

  return [
    {
      heading: "Skills",
      content: `Ganesh knows: ${skillsText}`,
      tokens: tokenize(`skills ${skillsText}`),
    },
    {
      heading: "Contact",
      content: "Email: ganeshsingh71680@gmail.com. LinkedIn: https://linkedin.com/in/ganesh-singh-aiml. GitHub: https://github.com/Ganesh-AIML",
      tokens: tokenize("contact email linkedin github ganeshsingh71680@gmail.com"),
    },
    {
      heading: "Resume",
      content: "Ganesh's resume is available at assests/Ganesh_Resume.pdf",
      tokens: tokenize("resume pdf download assests/Ganesh_Resume.pdf"),
    },
    {
      heading: "LifeRythem",
      content: "Software Development Intern at LifeRythem. Period: March 2026 - Present. Technologies: React Native, Kotlin, CNN, TensorFlow/Keras, Python, IoT. Building React Native APK with Kotlin native plugins integrating 4+ IoT medical devices. Engineered CNN-based ML pipeline on stethoscope auscultation data achieving 90% detection accuracy for cardiac and pulmonary anomalies.",
      tokens: tokenize("liferythem software development intern react native kotlin cnn tensorflow keras python iot medical stethoscope ecg spo2"),
    },
    {
      heading: "DRSGA",
      content: "AI & ML Intern at DRSGA. Period: December 2025 - January 2026. Technologies: JavaScript, Chart.js, Machine Learning, NLP, REST APIs, Python. Engineered real-time NABH compliance dashboard with Chart.js visualizing 20+ KPIs reducing manual audit time by 80%. Developed ML-based NLP sentiment analysis system exposed via REST APIs analyzing 100+ client feedback records.",
      tokens: tokenize("drsga ai ml intern javascript chartjs machine learning nlp rest api python nabh compliance dashboard sentiment analysis"),
    },
    {
      heading: "JACOB Coaching Classes",
      content: "Web Project Developer at JACOB Coaching Classes (Freelance). Period: July 2025. Technologies: HTML5, CSS3, JavaScript, Google Apps Script. Engineered responsive web portal enabling 50+ students to access class schedules online. Delivered on time resulting in Letter of Recommendation.",
      tokens: tokenize("jacob coaching web developer freelance html css javascript google apps script portal student"),
    },
    {
      heading: "Super-AI Community",
      content: "Secretary at Super-AI Community (Leadership). Period: July 2025 - Present. Technologies: Team Management, Documentation, Technical Workshops, Community Building. Coordinated communication across technical and creative teams. Orchestrated 15+ technical workshops increasing community engagement by 40%.",
      tokens: tokenize("super ai community secretary leadership team management workshops technical community building engagement"),
    },
    {
      heading: "Junoon Foundation",
      content: "Resource Intern at Junoon Foundation (Social Impact). Period: May 2024 - June 2024. Technologies: Curriculum Design, Educational Content, Social Outreach. Developed academic worksheets for underprivileged students. Supported educational drives impacting 100+ students.",
      tokens: tokenize("junoon foundation resource intern social impact curriculum educational outreach underprivileged students"),
    },
    {
      heading: "Hackathons & Competitions",
      content: "Participant & Finalist in various national competitions (2024-2025). NASA Space Apps 2025: Global Nominees Top 13 from India. Credtech Hackathon: 2nd Prize at IIT Kanpur. DIPEX 2025: Finalist. Smart India Hackathon 2025, Aavishkar Research Convention 2nd place, Ideathon 2025, Multicon Research 2024, Codethon 2024 3rd place.",
      tokens: tokenize("hackathon competition nasa space apps global nominee top 13 india credtech iit kanpur 2nd prize dipex finalist smart india aavishkar codethon researcher"),
    },
  ]
})()

function bm25Score(qTokens, chunk, avgDocLen, N, df) {
  const k1 = 1.5
  const b = 0.75
  const docLen = chunk.tokens.length
  let score = 0
  for (const qt of qTokens) {
    const freq = chunk.tokens.filter((t) => t === qt).length
    if (freq === 0) continue
    const docFreq = df.get(qt) || 0
    const idf = Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5))
    score += idf * ((freq * (k1 + 1)) / (freq + k1 * (1 - b + b * (docLen / avgDocLen))))
  }
  return score
}

function findRelevantChunks(query) {
  const qTokens = tokenize(query)
  if (qTokens.length === 0) return []
  const N = chunks.length
  const avgDocLen = chunks.reduce((s, c) => s + c.tokens.length, 0) / N
  const df = new Map()
  for (const qt of qTokens) df.set(qt, chunks.filter((c) => c.tokens.includes(qt)).length)
  const scored = chunks
    .map((c) => ({ ...c, score: bm25Score(qTokens, c, avgDocLen, N, df) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, 2)
}

function buildSystemPrompt(query) {
  const matched = findRelevantChunks(query)
  const context = matched.length
    ? matched.map((c) => `## ${c.heading}\n${c.content}`).join("\n\n")
    : "No specific portfolio section matched. Answer based on general knowledge from Ganesh's portfolio."

  return `You are the AI assistant for Ganesh Singh's personal portfolio.

## Your Role

Your only purpose is to help visitors learn about Ganesh. You may answer questions about his skills, experience, projects, certifications, achievements, resume, technologies, career, research, hackathons, contact information, and portfolio content.

## Scope Restrictions

Do NOT become a general-purpose AI assistant. Politely refuse requests that are unrelated to Ganesh or his portfolio. Example refusals: writing code, solving math, explaining general concepts, writing essays, debugging, or generating emails.

If asked about a technology, answer ONLY from Ganesh's documented experience. Do not provide tutorials or general explanations.

## Truthfulness Policy

Accuracy is more important than sounding helpful. Never invent, infer, assume, or guess information. Only answer using information present in the retrieved context. If information is missing, explicitly say so.

Before mentioning any technology, verify it exists in the retrieved context. Never replace unknown information with common technologies.

For project questions: only include features, architecture, technologies, and achievements that are explicitly documented. Do not infer any details.

## Response Style

Be friendly, professional, and conversational. Default to 2-5 sentences. Use bullet points when listing items. Never write long paragraphs unless asked. Maximum one emoji per response, only if natural.

Speak as Ganesh's portfolio assistant. Use phrases like "According to Ganesh's portfolio..." instead of "I built...". Never impersonate Ganesh.

Always check: every technology and number mentioned must exist in the retrieved context. Never leave sentences incomplete.

## Retrieved Context

${context}

## Always Available

Ganesh's skills: ${SKILLS.map((s) => s.name).join(", ")}

Only mention skills if relevant to the question. Do not list all skills unless asked.`
}

async function callGroq(messages) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Groq API error ${res.status}: ${errText}`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}

export async function ChatEngine(query) {
  if (!API_KEY) {
    return "The chat service is not configured yet. Please check back later!"
  }

  const cached = getCached(query)
  if (cached) return cached

  const systemPrompt = buildSystemPrompt(query)
  const reply = await callGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ])

  setCache(query, reply)
  return reply
}
