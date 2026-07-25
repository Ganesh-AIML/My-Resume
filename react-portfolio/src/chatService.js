import { SKILLS } from "./loadPortfolioData"
import md from "./portfolio-data.md?raw"

const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const API_URL = "https://api.groq.com/openai/v1/chat/completions"
const MODEL = "llama-3.3-70b-versatile"
const CACHE_TTL = 3600000
const MAX_TOKENS = 2048

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
  return sections.map(section => {
    const lines = section.trim().split("\n")
    const heading = lines[0].replace(/^## /, "").trim()
    const body = lines.slice(1).join("\n").trim()
    return { heading, content: body, tokens: tokenize(`${heading} ${body}`) }
  })
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

function preprocessQuery(query, history) {
  const rawTokens = tokenize(query)
  const tokens = [...rawTokens]
  for (const t of rawTokens) {
    if (t.endsWith('s') && t.length > 3 && t !== 'this' && t !== 'that') {
      const s = t.slice(0, -1)
      if (!tokens.includes(s)) tokens.push(s)
    }
  }

  const projectRoots = chunks.filter(c => /^Project: /i.test(c.heading))
  const specificTokens = tokens.filter(t => t !== 'project' && t !== 'projects')
  const hasSpecificProject = specificTokens.some(t =>
    projectRoots.some(c => c.heading.toLowerCase().replace(/^project: /i, '').includes(t))
  )

  const hasProjectsPlural = /\bprojects\b/i.test(query)
  const hasProjectGeneric = /\bprojects?\b/i.test(query)

  const queryType = hasProjectsPlural && !hasSpecificProject ? 'list_all'
    : hasProjectGeneric && !hasSpecificProject ? 'project_generic'
    : 'general'

  let projectHint = null
  if (!hasSpecificProject) {
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i].text.toLowerCase()
      for (const c of projectRoots) {
        const pn = c.heading.replace(/^Project: /i, '').trim()
        const pnClean = pn.replace(/\./g, '')
        if (msg.includes(pn.toLowerCase()) || msg.includes(pnClean.toLowerCase())) {
          projectHint = c.heading
          break
        }
      }
      if (projectHint) break
    }
  }

  return { tokens, queryType, projectHint }
}

function findRelevantChunks(query, history = []) {
  const pp = preprocessQuery(query, history)

  if (pp.queryType === 'list_all') {
    return chunks.filter(c => /^Project: /i.test(c.heading))
  }

  const searchTokens = [...pp.tokens]
  if (pp.projectHint) {
    searchTokens.push(...tokenize(pp.projectHint))
  }

  if (searchTokens.length === 0) return []

  const N = chunks.length
  const avgDocLen = chunks.reduce((s, c) => s + c.tokens.length, 0) / N
  const df = new Map()
  for (const qt of searchTokens) df.set(qt, chunks.filter((c) => c.tokens.includes(qt)).length)
  const scored = chunks
    .map((c) => ({ ...c, score: bm25Score(searchTokens, c, avgDocLen, N, df) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)

  const isListQuery = /\b(list|all|every|each|name|show|what are)\b/i.test(query)
  const topN = isListQuery ? 5 : 2
  return scored.slice(0, topN)
}

function buildSystemPrompt(query, history = []) {
  const matched = findRelevantChunks(query, history)
  const context = matched.length
    ? matched.map((c) => `## ${c.heading}\n${c.content}`).join("\n\n")
    : "No specific portfolio section matched. If the user is asking about a project, experience, skill, certificate, or education topic, suggest they ask about a specific topic from Ganesh's portfolio."

  const historyBlock = history.length
    ? `## Conversation History (for reference)\n${history.map((m) => `${m.role}: ${m.text}`).join("\n")}`
    : ""

  const skillsBlock = query.match(/\b(skill|know|tech stack|expertise|proficient|technologies?|good at|work with|familiar|background|stack)\b/i)
    ? `## Always Available\n\nGanesh's skills: ${SKILLS.map((s) => s.name).join(", ")}\n\nOnly mention skills if relevant to the question. Do not list all skills unless asked.`
    : ""

  return `You are the AI assistant for Ganesh Singh's personal portfolio.

## Retrieved Context

${context}

## Truthfulness Policy

Never invent or guess information. Only answer using information present in the Retrieved Context above. If information is incomplete or partially available, share what you know and acknowledge the gaps — do not infer or make up details.

### Response Rules
1. Every technology or number you mention must appear in the Retrieved Context.
2. If a project's context shows its technologies, you can list them.
3. If information about a specific topic is missing, say so simply.

${skillsBlock}

${historyBlock}

## Response Style

Be friendly, professional, and conversational. Use 2-5 sentences. Use bullet points for listing items.

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
