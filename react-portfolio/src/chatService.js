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

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
  "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were",
  "will", "with", "what", "which", "who", "whom", "this", "these", "those",
  "tell", "me", "about", "explain", "give", "show", "can", "you", "does", "do",
  "how", "many", "much"
])

const PROJECT_ALIASES = {
  "S.C.O.P.E.": ["scope", "s.c.o.p.e", "s.c.o.p.e.", "scope platform", "exam platform", "assessment platform", "judge0"],
  "Tourist Guardian Safety Platform": ["tourist guardian", "resq ai", "tourist safety", "safety platform", "sih", "smart india hackathon"],
  "Alertica": ["alertica", "women safety", "womens safety", "calculator app", "sos app"],
  "LearnSphere": ["learnsphere", "learning management", "lms", "spring boot lms"],
  "Exoplanet Classifier": ["exoplanet", "habitability", "kepler", "tess", "exo classifier", "exoplanet classifier"]
}

function normalizeQueryKey(q) {
  return q.toLowerCase().trim().replace(/[^\w\s]/g, "")
}

function getCached(query) {
  const key = normalizeQueryKey(query)
  const entry = cache.get(key)
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.text
  return null
}

function setCache(query, text) {
  cache.set(normalizeQueryKey(query), { text, ts: Date.now() })
}

function tokenize(text) {
  if (!text) return []
  // Protect S.C.O.P.E. acronym (use unique token to avoid collision with common word "scope")
  const protectedText = text.replace(/s\.c\.o\.p\.e\./gi, "scopeexam").replace(/s\.c\.o\.p\.e/gi, "scopeexam")
  const tokens = protectedText
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t))
  
  // Basic stemming
  return tokens.map(t => {
    if (t.endsWith("ies")) return t.slice(0, -3) + "y"
    if (t.endsWith("s") && !t.endsWith("ss") && t.length > 3) return t.slice(0, -1)
    return t
  })
}

// Extract structured chunks with hierarchy and metadata
const chunks = (() => {
  const rawSections = md.split(/\n(?=## )/).slice(1)
  const parsedChunks = []

  for (const sec of rawSections) {
    const lines = sec.trim().split("\n")
    const heading = lines[0].replace(/^## /, "").trim()
    const body = lines.slice(1).join("\n").trim()

    // Determine metadata type and project association
    let type = "general"
    let projectName = null

    if (heading.startsWith("Project: ")) {
      type = "project"
      projectName = heading.split("—")[0].replace("Project: ", "").trim()
    } else if (heading.startsWith("Experience: ")) {
      type = "experience"
    } else if (heading.includes("Education")) {
      type = "education"
    } else if (heading.includes("Skills")) {
      type = "skills"
    } else if (heading.includes("Certificate")) {
      type = "certificate"
    } else if (heading.includes("Achievements")) {
      type = "achievements"
    } else if (heading.includes("Project Index")) {
      type = "project_index"
    }

    const fullTokens = tokenize(`${heading} ${body}`)
    
    parsedChunks.push({
      id: heading.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      heading,
      content: body,
      tokens: fullTokens,
      metadata: {
        type,
        projectName
      }
    })
  }

  return parsedChunks
})()

// Classifier for query intent and out-of-domain detection
function classifyQuery(query) {
  const q = query.toLowerCase().trim()

  // 1. Greeting check — match base greetings and common variants ("hello there", "hi there")
  if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|hola|sup)[\s!.?,;]*$/i.test(q) ||
      /^(hi|hello|hey)\s+(there|everyone|guys|folks|all)[\s!.?,;]*$/i.test(q)) {
    return { type: "greeting" }
  }

  // 2. Pure Math calculation check
  if (/^(what is|calculate|solve|eval)?\s*(\d+\s*[\+\-\*\/\^]\s*\d+)+[\s?]*$/i.test(q) || /^\d+\s*[\+\-\*\/]\s*\d+$/.test(q)) {
    return { type: "out_of_domain", reason: "math" }
  }

  // 3. Tutorial / how-to / walkthrough request check (not portfolio related)
  const mentionsPortfolio = /\b(ganesh|portfolio|project|scope|resq|alertica|learnsphere|exoplanet|tourist|guardian|experience|resume|skill|tcet|liferythem)\b/i.test(q)

  const isTutorialQuery = /\b(how (to|do|can|would|is)|tutorial|guide|walkthrough|step.?by.?step)\b/i.test(q)
  if (isTutorialQuery && !mentionsPortfolio) {
    return { type: "out_of_domain", reason: "tutorial" }
  }

  // 4. Coding problem / algorithm / build request check (not portfolio related)
  const isCodingRequest = /\b(write|code|implement|generate|solve|program|function)\b.*\b(in|using)?\s*(java|python|c\+\+|javascript|c#|golang|rust|ruby|php|sql|code|function|class|fibonacci|factorial|binary search|sorting|linked list|matrix)\b/i.test(q) ||
    /\b(create|build|develop)\s+(a\s+)?(rest api|website|app|script|program|function|class)\b/i.test(q)
  
  if (isCodingRequest && !mentionsPortfolio) {
    return { type: "out_of_domain", reason: "coding_request" }
  }

  // 5. Concept explanation / general knowledge check
  const isExplanationQuery = /\b(explain|what is|what are|define|meaning of|difference between|compare|what does)\b/i.test(q)
  const isGeneralKnowledge = /^(who is|what is the capital|explain quantum|how far is the moon|tell me a joke)/i.test(q)
  if ((isExplanationQuery || isGeneralKnowledge) && !mentionsPortfolio) {
    return { type: "out_of_domain", reason: "general_knowledge" }
  }

  return { type: "portfolio" }
}

// Entity Extractor: find explicit project references in user query
function extractEntities(query) {
  const qLower = query.toLowerCase()
  const detectedProjects = []

  for (const [pName, aliases] of Object.entries(PROJECT_ALIASES)) {
    if (aliases.some(alias => qLower.includes(alias))) {
      detectedProjects.push(pName)
    }
  }

  return { projects: detectedProjects }
}

// BM25 implementation
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

function findRelevantChunks(query, history = []) {
  const entities = extractEntities(query)

  // Follow-up context: if no project in current query but ambiguous pronoun detected,
  // scan conversation history backward for the last explicitly mentioned project
  if (entities.projects.length === 0 && /\b(it|this|that|these|those|they|there|the)\b/i.test(query)) {
    for (const entry of [...history].reverse()) {
      if (entry.role === "user") {
        const historyEntities = extractEntities(entry.text)
        if (historyEntities.projects.length > 0) {
          entities.projects = historyEntities.projects
          break
        }
      }
    }
  }

  const qTokens = tokenize(query)

  let candidatePool = chunks

  // Metadata-First Filtering:
  // If the query explicitly asks about a specific project, restrict search space to that project's chunks + Project Index
  if (entities.projects.length > 0) {
    candidatePool = chunks.filter(c => 
      c.metadata.type === "project_index" ||
      (c.metadata.type === "project" && entities.projects.some(p => c.heading.toLowerCase().startsWith(`project: ${p.toLowerCase()} —`)))
    )
  }

  const isListQuery = /\b(list|all|every|each|names|show|what are|overview|projects)\b/i.test(query)
  if (isListQuery && candidatePool === chunks) {
    // Return all project overview chunks for "list all projects" queries
    const projectIndex = chunks.filter(c => c.metadata.type === "project_index")
    const projectOverviews = chunks.filter(c => c.metadata.type === "project" && c.heading.includes("Overview"))
    return [...projectIndex, ...projectOverviews]
  }

  if (qTokens.length === 0) {
    return candidatePool.slice(0, 3)
  }

  const N = candidatePool.length
  const avgDocLen = candidatePool.reduce((s, c) => s + c.tokens.length, 0) / (N || 1)
  const df = new Map()

  for (const qt of qTokens) {
    df.set(qt, candidatePool.filter((c) => c.tokens.includes(qt)).length)
  }

  let scored = candidatePool
    .map((c) => ({ ...c, score: bm25Score(qTokens, c, avgDocLen, N, df) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)

  // Fallback: if metadata-filtered to a specific project but BM25 found no matches
  // (e.g., "scope" query uses common-word alias instead of "scopeexam" token),
  // return filtered chunks ordered by section importance
  if (scored.length === 0 && entities.projects.length > 0) {
    scored = candidatePool
      .filter(c => c.metadata.type !== "project_index")
      .map((c, i) => ({ ...c, score: candidatePool.length - i }))
  }

  // Top-N selection
  let topChunks = scored.slice(0, 4)

  // Parent Context Injection:
  // If a project subsection chunk was retrieved (e.g. Architecture/Features), ensure its corresponding Overview chunk is also included
  const injectedOverviewChunks = []
  for (const chunk of topChunks) {
    if (chunk.metadata.type === "project" && chunk.metadata.projectName) {
      const overviewChunk = chunks.find(c => 
        c.metadata.type === "project" && 
        c.metadata.projectName === chunk.metadata.projectName && 
        c.heading.includes("Overview")
      )
      if (overviewChunk && !topChunks.some(tc => tc.id === overviewChunk.id) && !injectedOverviewChunks.some(ic => ic.id === overviewChunk.id)) {
        injectedOverviewChunks.push(overviewChunk)
      }
    }
  }

  return [...injectedOverviewChunks, ...topChunks]
}

function buildSystemPrompt(retrievedChunks, queryClass) {
  const context = retrievedChunks.length
    ? retrievedChunks.map((c) => `## ${c.heading}\n${c.content}`).join("\n\n")
    : "No specific portfolio section matched."

  return `You are the official AI assistant for Ganesh Singh's personal portfolio. Your ONLY source of truth is the Retrieved Context provided below.

## Retrieved Context

${context}

## STRICT TRUTHFULNESS & GROUNDING RULES — DO NOT VIOLATE

1. **ONLY answer using information explicitly present in the Retrieved Context above.** Never use pre-trained parametric knowledge or infer unstated facts about Ganesh.
2. **Never mix or combine technologies/features across different projects.** Each project's stack and architecture must remain isolated.
3. **If information about a specific detail is not present in the Retrieved Context**, state clearly:
   "I couldn't find verified information about that in Ganesh's portfolio." Do NOT attempt to guess, infer, or hallucinate an answer.
4. **For out-of-domain requests** (such as general math, external coding requests, general knowledge, or topics unrelated to Ganesh), state politely:
   "I am specifically designed to answer questions about Ganesh Singh's portfolio, projects, skills, and experience. I would be happy to tell you about his work!"
5. **Always cite the project or experience name** when detailing technologies or achievements.

## Response Style
- Friendly, professional, accurate, and concise.
- Use clean Markdown formatting (bold, bullet points, code tags) for readability.
- Speak as Ganesh's assistant (e.g. "According to Ganesh's portfolio..."). Never impersonate Ganesh directly.`
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

  // 1. Check exact cache first
  const cached = getCached(query)
  if (cached) {
    conversationHistory.push({ role: "user", text: query })
    conversationHistory.push({ role: "assistant", text: cached })
    if (conversationHistory.length > MAX_HISTORY * 2) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY * 2)
    }
    return cached
  }

  // 2. Stage 1: Query Classification & Out-of-Domain Guardrail
  const classification = classifyQuery(query)
  if (classification.type === "greeting") {
    const reply = "Hello! 👋 I'm Ganesh's AI portfolio assistant. Ask me anything about his projects, skills, work experience, education, or achievements!"
    conversationHistory.push({ role: "user", text: query })
    conversationHistory.push({ role: "assistant", text: reply })
    setCache(query, reply)
    return reply
  }

  if (classification.type === "out_of_domain") {
    const reply = "I am specifically designed to answer questions about Ganesh Singh's portfolio, projects, skills, and experience. I would be happy to tell you about his work! What would you like to know about his projects?"
    conversationHistory.push({ role: "user", text: query })
    conversationHistory.push({ role: "assistant", text: reply })
    setCache(query, reply)
    return reply
  }

  // 3. Stage 2-5: Retrieval Pipeline
  const matchedChunks = findRelevantChunks(query, conversationHistory)

  // 4. Stage 6: Prompt Construction
  const systemPrompt = buildSystemPrompt(matchedChunks, classification)

  // 5. Call LLM with clear message structure (System prompt + clean history + current query)
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({ role: m.role, content: m.text })),
    { role: "user", content: query }
  ]

  const reply = await callGroq(messages)

  // 6. Update conversation history & Cache
  conversationHistory.push({ role: "user", text: query })
  conversationHistory.push({ role: "assistant", text: reply })
  if (conversationHistory.length > MAX_HISTORY * 2) {
    conversationHistory = conversationHistory.slice(-MAX_HISTORY * 2)
  }

  setCache(query, reply)
  return reply
}
