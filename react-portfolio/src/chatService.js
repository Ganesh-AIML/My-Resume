import { SKILLS, EXPERIENCES, PROJECTS, CERTIFICATES } from "./App"

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

function buildSystemPrompt() {
  const skills = SKILLS.map((s) => s.name).join(", ")
  const exp = EXPERIENCES.map(
    (e) =>
      `- ${e.role} at ${e.company} (${e.period}): ${e.achievements.join("; ")}`
  ).join("\n")
  const projs = PROJECTS.map((p) => `- ${p.title}: ${p.desc}`).join("\n")
  const certs = CERTIFICATES.map((c) => `- ${c.name} (${c.issuer})`).join("\n")

  return `You are a helpful assistant for Ganesh Singh's portfolio website. Answer questions about Ganesh based ONLY on the following information. If asked something not in this context, politely redirect to ask about his skills, experience, or projects.

PORTFOLIO DATA:

SKILLS:
${skills}

EXPERIENCE:
${exp}

PROJECTS:
${projs}

CERTIFICATES:
${certs}

Keep responses concise (2-3 sentences max), friendly, and use emojis occasionally. Do not mention that you are an AI or LLM. Just answer naturally.`
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
    return "The chat service is not configured yet. Please check back later! 😊"
  }

  const cached = getCached(query)
  if (cached) return cached

  const systemPrompt = buildSystemPrompt()
  const reply = await callGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: query },
  ])

  setCache(query, reply)
  return reply
}
