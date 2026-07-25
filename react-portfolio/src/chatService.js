import { SKILLS } from "./loadPortfolioData"
import md from "./portfolio-data.md?raw"

const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const API_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.1-8b-instant"
const CACHE_TTL = 3600000
const MAX_TOKENS = 800

const cache = new Map()
const MAX_HISTORY = 6
let conversationHistory = []

function normalize(q) {
  return q.toLowerCase().trim().replace(/[^\w\s]/g, "")
}

function getCached(query) {
  const key = normalize(query)
  const entry = cache.get(key)
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.text
  return null
}

function setCache(query, text) {
  cache.set(normalize(query), { text, ts: Date.now() })
}

function tokenize(text) {
  const cleaned = text.replace(/([A-Za-z])\.(?=[A-Za-z])/g, '$1')
  return cleaned.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
}

const chunks = (() => {
  const sections = md.split(/\n(?=## )/).slice(1)
  const result = []
  for (const section of sections) {
    const lines = section.trim().split("\n")
    const heading = lines[0].replace(/^## /, "").trim()
    const body = lines.slice(1).join("\n").trim()
    const subSections = body.split(/\n(?=### )/)
    if (subSections.length > 1) {
      for (const sub of subSections) {
        const subLines = sub.trim().split("\n")
        const isSub = subLines[0].startsWith("###")
        const subHeading = isSub ? subLines[0].replace(/^### /, "").trim() : heading
        const subContent = subLines.slice(isSub ? 1 : 0).join("\n").trim()
        const fullHeading = isSub ? `${heading} > ${subHeading}` : heading
        result.push({ heading: fullHeading, content: subContent, tokens: tokenize(`${fullHeading} ${subContent}`) })
      }
    } else {
      result.push({ heading, content: body, tokens: tokenize(`${heading} ${body}`) })
    }
  }
  return result
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
  if (chunk.heading && !chunk.heading.includes('>')) {
    score *= 2
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

function buildSystemPrompt(query, history = []) {
  const matched = findRelevantChunks(query)
  const context = matched.length
    ? matched.map((c) => `## ${c.heading}\n${c.content}`).join("\n\n")
    : "I couldn't find verified information about that in Ganesh's portfolio."

  const historyBlock = history.length
    ? `## Conversation History (for context only — do NOT rely on it for facts)\n${history.map((m) => `${m.role}: ${m.text}`).join("\n")}`
    : ""

  const skillsBlock = query.match(/\b(skill|know|tech stack|expertise|proficient|technologies?|good at|work with|familiar|background|stack)\b/i)
    ? `## Always Available\n\nGanesh's skills: ${SKILLS.map((s) => s.name).join(", ")}\n\nOnly mention skills if relevant to the question. Do not list all skills unless asked.`
    : ""

  return `You are the AI assistant for Ganesh Singh's personal portfolio.

## Retrieved Context

${context}

## Truthfulness Policy — MANDATORY

Never invent, infer, assume, or guess information. Only answer using information present in the Retrieved Context above.

### Project Isolation Rule

The Retrieved Context belongs to a SINGLE project. You MUST:
1. ONLY use information from that project's section.
2. NEVER combine information from multiple projects or from your general knowledge.
3. For project TECHNOLOGIES: verify each one exists verbatim in the context.

### Response Rules

1. Every technology you name must appear VERBATIM in the Retrieved Context.
2. Every number or metric must appear VERBATIM in the Retrieved Context.
3. If the context has no technologies section, DO NOT list any technologies.
4. If the context has no metrics section, DO NOT provide any numbers.

### Missing Information

If the Retrieved Context does NOT contain the specific information requested, respond with this EXACT sentence:

"I couldn't find verified information about that in Ganesh's portfolio."

DO NOT add explanations, suggestions, or general knowledge.

${skillsBlock}

${historyBlock}

## Response Style

Be friendly, professional, and conversational. Default to 2-5 sentences. Use bullet points when listing items.

Speak as Ganesh's portfolio assistant. Use phrases like "According to Ganesh's portfolio..." instead of "I built...". Never impersonate Ganesh.

## Markdown Formatting

Format your response using Markdown for readability:
- **Bold** for emphasis
- Bullet lists with \`-\` for unordered items
- Numbered lists with \`1.\` for ordered items
- \`inline code\` for technical terms
- Code blocks with triple backticks for multi-line code snippets
- [links](url) for clickable references
- Tables with pipe syntax for structured data

## Scope Restrictions

Do NOT become a general-purpose AI assistant. Politely refuse requests that are unrelated to Ganesh or his portfolio.`
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
      temperature: 0.0,
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
  if (cached) {
    conversationHistory.push({ role: "user", text: query })
    conversationHistory.push({ role: "assistant", text: cached })
    if (conversationHistory.length > MAX_HISTORY * 2) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY * 2)
    }
    return cached
  }

  const systemPrompt = buildSystemPrompt(query, conversationHistory)
  const reply = await callGroq([
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({ role: m.role, content: m.text })),
    { role: "user", content: query },
  ])

  conversationHistory.push({ role: "user", text: query })
  conversationHistory.push({ role: "assistant", text: reply })
  if (conversationHistory.length > MAX_HISTORY * 2) {
    conversationHistory = conversationHistory.slice(-MAX_HISTORY * 2)
  }

  setCache(query, reply)
  return reply
}
