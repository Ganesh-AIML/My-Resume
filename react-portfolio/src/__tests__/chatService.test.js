/**
 * Behavioral test suite for the RAG pipeline in chatService.js.
 * Tests the core logic components without requiring API calls.
 * 
 * Run: node src/__tests__/chatService.test.js
 */

// We import the raw md via ?raw which doesn't work in Node, so we test
// the individual functions by copying them. But first, let's check if
// we can use the built file or need to test exported functions.

// Since chatService.js uses import.meta.env and ?raw imports,
// we test the pure logic functions by extracting them.

// Test: tokenize function
function testTokenize() {
  const STOP_WORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
    "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were",
    "will", "with", "what", "which", "who", "whom", "this", "these", "those",
    "tell", "me", "about", "explain", "give", "show", "can", "you", "does", "do",
    "how", "many", "much"
  ])

  function tokenize(text) {
    if (!text) return []
    const protectedText = text.replace(/s\.c\.o\.p\.e\./gi, "scopeexam").replace(/s\.c\.o\.p\.e/gi, "scopeexam")
    const tokens = protectedText
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(t => t.length > 1 && !STOP_WORDS.has(t))
    return tokens.map(t => {
      if (t.endsWith("ies")) return t.slice(0, -3) + "y"
      if (t.endsWith("s") && !t.endsWith("ss") && t.length > 3) return t.slice(0, -1)
      return t
    })
  }

  const tests = [
    // S.C.O.P.E. should NOT become "scope" (should become "scopeexam")
    { input: "S.C.O.P.E.", expectedInclude: ["scopeexam"], expectedExclude: ["scope"], desc: "S.C.O.P.E. does not collide with common word 'scope'" },
    { input: "Tell me about S.C.O.P.E.", expectedInclude: ["scopeexam"], expectedExclude: ["scope", "tell", "about"], desc: "S.C.O.P.E. in sentence" },
    { input: "hello there", expectedInclude: ["hello", "there"], expectedExclude: [], desc: "Hello there tokenizes" },
    { input: "technologies used", expectedInclude: ["technology", "used"], desc: "Stemming: technologies -> technology, used stays as used (past tense, not plural)" },
    { input: "assessments", expectedInclude: ["assessment"], desc: "Stemming: assessments -> assessment" },
    { input: "features", expectedInclude: ["feature"], desc: "Stemming: features -> feature" },
    { input: "studies", expectedInclude: ["study"], desc: "Stemming: studies -> study" },
    { input: "what is the scope of work", expectedInclude: ["scope"], expectedExclude: ["scopeexam"], desc: "Common word 'scope' not confused with S.C.O.P.E." },
    { input: "", expectedInclude: [], desc: "Empty input returns empty array" },
  ]

  let passed = 0
  let failed = 0
  for (const t of tests) {
    const result = tokenize(t.input)
    let ok = true
    if (t.expectedInclude) {
      for (const exp of t.expectedInclude) {
        if (!result.includes(exp)) { ok = false; break }
      }
    }
    if (t.expectedExclude) {
      for (const exp of t.expectedExclude) {
        if (result.includes(exp)) { ok = false; break }
      }
    }
    if (ok) {
      console.log(`  ✓ ${t.desc}`)
      passed++
    } else {
      console.log(`  ✗ ${t.desc}`)
      console.log(`    Expected: include=${t.expectedInclude}, exclude=${t.expectedExclude}`)
      console.log(`    Got: ${JSON.stringify(result)}`)
      failed++
    }
  }
  return { passed, failed }
}

// Test: classifyQuery function
function testClassifyQuery() {
  function classifyQuery(query) {
    const q = query.toLowerCase().trim()

    // 1. Greeting check
    if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|hola|sup)[\s!.?,;]*$/i.test(q) ||
        /^(hi|hello|hey)\s+(there|everyone|guys|folks|all)[\s!.?,;]*$/i.test(q)) {
      return { type: "greeting" }
    }

    // 2. Pure Math calculation check
    if (/^(what is|calculate|solve|eval)?\s*(\d+\s*[\+\-\*\/\^]\s*\d+)+[\s?]*$/i.test(q) || /^\d+\s*[\+\-\*\/]\s*\d+$/.test(q)) {
      return { type: "out_of_domain", reason: "math" }
    }

    // 3. Tutorial / how-to check
    const mentionsPortfolio = /\b(ganesh|portfolio|project|scope|resq|alertica|learnsphere|exoplanet|tourist|guardian|experience|resume|skill|tcet|liferythem)\b/i.test(q)

    const isTutorialQuery = /\b(how (to|do|can|would|is)|tutorial|guide|walkthrough|step.?by.?step)\b/i.test(q)
    if (isTutorialQuery && !mentionsPortfolio) {
      return { type: "out_of_domain", reason: "tutorial" }
    }

    // 4. Coding request check
    const isCodingRequest = /\b(write|code|implement|generate|solve|program|function)\b.*\b(in|using)?\s*(java|python|c\+\+|javascript|c#|golang|rust|ruby|php|sql|code|function|class|fibonacci|factorial|binary search|sorting|linked list|matrix)\b/i.test(q) ||
      /\b(create|build|develop)\s+(a\s+)?(rest api|website|app|script|program|function|class)\b/i.test(q)
    
    if (isCodingRequest && !mentionsPortfolio) {
      return { type: "out_of_domain", reason: "coding_request" }
    }

    // 5. Concept explanation check
    const isExplanationQuery = /\b(explain|what is|what are|define|meaning of|difference between|compare|what does)\b/i.test(q)
    const isGeneralKnowledge = /^(who is|what is the capital|explain quantum|how far is the moon|tell me a joke)/i.test(q)
    if ((isExplanationQuery || isGeneralKnowledge) && !mentionsPortfolio) {
      return { type: "out_of_domain", reason: "general_knowledge" }
    }

    return { type: "portfolio" }
  }

  const tests = [
    // Greetings
    { input: "hello", expected: "greeting", desc: "Base greeting: hello" },
    { input: "hello there", expected: "greeting", desc: "Extended greeting: hello there" },
    { input: "hi", expected: "greeting", desc: "Base greeting: hi" },
    { input: "hi there", expected: "greeting", desc: "Extended greeting: hi there" },
    { input: "hey there", expected: "greeting", desc: "Extended greeting: hey there" },
    { input: "good morning", expected: "greeting", desc: "Time greeting: good morning" },
    { input: "greetings!", expected: "greeting", desc: "Greetings with punctuation" },
    { input: "hello everyone", expected: "greeting", desc: "Extended greeting: hello everyone" },
    
    // Math
    { input: "what is 2+2", expected: "out_of_domain", desc: "Math: what is 2+2" },
    { input: "calculate 5*10", expected: "out_of_domain", desc: "Math: calculate 5*10" },
    { input: "solve 100/5", expected: "out_of_domain", desc: "Math: solve 100/5" },
    { input: "10 + 20", expected: "out_of_domain", desc: "Math: 10 + 20" },
    
    // Tutorial
    { input: "how to center a div", expected: "out_of_domain", desc: "Tutorial: how to center a div" },
    { input: "how do I write a Python script", expected: "out_of_domain", desc: "Tutorial: how do I write Python" },
    { input: "tutorial for React", expected: "out_of_domain", desc: "Tutorial: tutorial for React" },
    { input: "step by step guide for flask", expected: "out_of_domain", desc: "Tutorial: step by step guide" },
    
    // But tutorials about portfolio projects should pass through
    { input: "how to use scope exam platform", expected: "portfolio", desc: "Tutorial about portfolio project passes through" },
    
    // Coding requests
    { input: "write fibonacci in java", expected: "out_of_domain", desc: "Coding: write fibonacci in java" },
    { input: "implement sorting algorithm in python", expected: "out_of_domain", desc: "Coding: implement sort in python" },
    { input: "create a rest api", expected: "out_of_domain", desc: "Coding: create a REST API" },
    { input: "build a website using react", expected: "out_of_domain", desc: "Coding: build a website" },
    { input: "generate a function to sort array", expected: "out_of_domain", desc: "Coding: generate function" },
    
    // But coding about portfolio projects should pass through
    { input: "what code did ganesh write for scope", expected: "portfolio", desc: "Coding about portfolio passes through" },
    
    // Explanation / general knowledge
    { input: "what is JavaScript closure", expected: "out_of_domain", desc: "Explanation: what is JS closure" },
    { input: "explain quantum computing", expected: "out_of_domain", desc: "Explanation: explain quantum" },
    { input: "what is the capital of France", expected: "out_of_domain", desc: "General knowledge: capital" },
    { input: "define polymorphism", expected: "out_of_domain", desc: "Explanation: define" },
    { input: "difference between REST and GraphQL", expected: "out_of_domain", desc: "Explanation: difference between" },
    { input: "compare React and Angular", expected: "out_of_domain", desc: "Explanation: compare" },
    { input: "tell me a joke", expected: "out_of_domain", desc: "General: tell me a joke" },
    
    // But portfolio questions should be portfolio
    { input: "what is ganesh's cgpa", expected: "portfolio", desc: "Portfolio: CGPA question" },
    { input: "tell me about scope project", expected: "portfolio", desc: "Portfolio: S.C.O.P.E. project" },
    { input: "what technologies does learnsphere use", expected: "portfolio", desc: "Portfolio: LearnSphere tech" },
    { input: "explain the architecture of tourist guardian", expected: "portfolio", desc: "Portfolio: Tourist Guardian architecture" },
    { input: "list all projects", expected: "portfolio", desc: "Portfolio: list all projects" },
    { input: "what is ganesh's role at liferythem", expected: "portfolio", desc: "Portfolio: LifeRythem role" },
    
    // Mixed queries that mention both portfolio and OOD should be portfolio
    { input: "explain ganesh's portfolio projects", expected: "portfolio", desc: "Mixed: explain portfolio" },
    
    // Adversarial - should NOT trigger hallucination
    { input: "how to build a scope exam platform", expected: "portfolio", desc: "Adversarial: how to build scope (portfolio)" },
  ]

  let passed = 0
  let failed = 0
  for (const t of tests) {
    const result = classifyQuery(t.input)
    const ok = result.type === t.expected
    if (ok) {
      console.log(`  ✓ ${t.desc}`)
      passed++
    } else {
      console.log(`  ✗ ${t.desc}`)
      console.log(`    Expected: ${t.expected}, Got: ${result.type}${result.reason ? ` (${result.reason})` : ''}`)
      failed++
    }
  }
  return { passed, failed }
}

// Test: extractEntities and follow-up project detection from history
function testEntityExtraction() {
  const PROJECT_ALIASES = {
    "S.C.O.P.E.": ["scope", "s.c.o.p.e", "s.c.o.p.e.", "scope platform", "exam platform", "assessment platform", "judge0"],
    "Tourist Guardian Safety Platform": ["tourist guardian", "resq ai", "tourist safety", "safety platform", "sih", "smart india hackathon"],
    "Alertica": ["alertica", "women safety", "womens safety", "calculator app", "sos app"],
    "LearnSphere": ["learnsphere", "learning management", "lms", "spring boot lms"],
    "Exoplanet Classifier": ["exoplanet", "habitability", "kepler", "tess", "exo classifier", "exoplanet classifier"]
  }

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

  // Simulate findRelevantChunks follow-up logic
  function getFollowUpProject(query, history) {
    const entities = extractEntities(query)
    if (entities.projects.length === 0 && /\b(it|this|that|these|those|they|there|the)\b/i.test(query)) {
      for (const entry of [...history].reverse()) {
        if (entry.role === "user") {
          const historyEntities = extractEntities(entry.text)
          if (historyEntities.projects.length > 0) {
            return historyEntities.projects[0]
          }
        }
      }
    }
    return entities.projects.length > 0 ? entities.projects[0] : null
  }

  const tests = [
    // Direct entity extraction
    { input: "Tell me about S.C.O.P.E.", expected: "S.C.O.P.E.", desc: "Entity: S.C.O.P.E. by full name" },
    { input: "what is the exam platform", expected: "S.C.O.P.E.", desc: "Entity: exam platform alias" },
    { input: "tell me about tourist guardian", expected: "Tourist Guardian Safety Platform", desc: "Entity: tourist guardian" },
    { input: "resq ai features", expected: "Tourist Guardian Safety Platform", desc: "Entity: resq ai alias" },
    { input: "alertica technologies", expected: "Alertica", desc: "Entity: alertica" },
    { input: "learnsphere database", expected: "LearnSphere", desc: "Entity: learnsphere" },
    { input: "exoplanet classifier accuracy", expected: "Exoplanet Classifier", desc: "Entity: exoplanet classifier" },
    { input: "what is lms", expected: "LearnSphere", desc: "Entity: lms alias" },
    { input: "sih project details", expected: "Tourist Guardian Safety Platform", desc: "Entity: sih alias" },
    { input: "hello how are you", expected: null, desc: "No entity: greeting has no project" },
    
    // Follow-up context detection
    { input: "what technologies does it use", history: [{ role: "user", text: "tell me about scope" }], expected: "S.C.O.P.E.", desc: "Follow-up: 'it' resolves to S.C.O.P.E." },
    { input: "tell me more about it", history: [{ role: "user", text: "what is learnsphere" }], expected: "LearnSphere", desc: "Follow-up: 'it' resolves to LearnSphere" },
    { input: "how does that work", history: [{ role: "user", text: "explain exoplanet classifier" }], expected: "Exoplanet Classifier", desc: "Follow-up: 'that' resolves to Exoplanet" },
    { input: "what about this project", history: [{ role: "user", text: "tell me about alertica" }], expected: "Alertica", desc: "Follow-up: 'this project' resolves to Alertica" },
    { input: "what are the features there", history: [{ role: "user", text: "tourist guardian platform" }], expected: "Tourist Guardian Safety Platform", desc: "Follow-up: 'there' resolves to Tourist Guardian" },
    { input: "who built these", history: [{ role: "user", text: "scope project details" }], expected: "S.C.O.P.E.", desc: "Follow-up: 'these' resolves to S.C.O.P.E." },
    { input: "and the database", history: [{ role: "user", text: "tell me about learnsphere" }], expected: "LearnSphere", desc: "Follow-up: ambiguous but pronoun triggers history scan" },
    
    // Follow-up without ambiguous pronoun should NOT scan history
    { input: "what technologies does learnsphere use", history: [{ role: "user", text: "tell me about scope" }], expected: "LearnSphere", desc: "Explicit: LearnSphere even after S.C.O.P.E. in history" },
    
    // Follow-up with multi-turn history
    { input: "what about it", history: [
      { role: "user", text: "list all projects" },
      { role: "assistant", text: "Here are the projects..." },
      { role: "user", text: "tell me about exoplanet" }
    ], expected: "Exoplanet Classifier", desc: "Follow-up: last user message (exoplanet) after intermediate messages" },
  ]

  let passed = 0
  let failed = 0
  for (const t of tests) {
    const history = t.history || []
    const result = getFollowUpProject(t.input, history)
    const ok = result === t.expected
    if (ok) {
      console.log(`  ✓ ${t.desc}`)
      passed++
    } else {
      console.log(`  ✗ ${t.desc}`)
      console.log(`    Expected: ${t.expected}, Got: ${result}`)
      failed++
    }
  }
  return { passed, failed }
}

// Run all tests
console.log("=== Tokenization Tests ===")
const tokResult = testTokenize()
console.log(`\n=== Query Classification Tests ===`)
const clsResult = testClassifyQuery()
console.log(`\n=== Entity Extraction & Follow-up Tests ===`)
const entResult = testEntityExtraction()

console.log(`\n========================================`)
console.log(`Results:`)
console.log(`  Tokenization:        ${tokResult.passed}/${tokResult.passed + tokResult.failed} passed`)
console.log(`  Classification:      ${clsResult.passed}/${clsResult.passed + clsResult.failed} passed`)
console.log(`  Entity/Follow-up:    ${entResult.passed}/${entResult.passed + entResult.failed} passed`)
const total = tokResult.passed + clsResult.passed + entResult.passed
const totalTests = tokResult.passed + tokResult.failed + clsResult.passed + clsResult.failed + entResult.passed + entResult.failed
console.log(`\n  TOTAL: ${total}/${totalTests} passed (${Math.round(total/totalTests*100)}%)`)
console.log(`========================================`)

if (total < totalTests) {
  process.exit(1)
}
