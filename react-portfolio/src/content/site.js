/**
 * Site content — single source for every word on the page.
 * Facts follow docs/PORTFOLIO_PERSONAL_INFORMATION.md (owner-confirmed, rev. 2).
 * Style rule from the owner: short and general; no confidential internals.
 */

const base = import.meta.env.BASE_URL

export const person = {
  first: "Ganesh",
  last: "Singh",
  role: ["AI & ML", "Engineer"],
  email: "ganeshsingh71680@gmail.com",
  github: "https://github.com/Ganesh-AIML",
  linkedin: "https://www.linkedin.com/in/ganesh-singh-aiml",
  resume: `${base}assests/Ganesh_Resume.pdf`,
  portrait: `${base}assests/portrait-hero.webp`,
  timeZone: "Asia/Kolkata",
}

export const nav = [
  { id: "work", label: "Work" },
  { id: "journey", label: "Journey" },
  { id: "awards", label: "Awards" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
]

export const hero = {
  greeting: "Hello, I'm",
  backdrop: "Portfolio",
  intro: "I design and ship AI-powered software end to end, from the model to the product people actually use.",
  stats: [
    { value: "3", label: "Industry internships" },
    { value: "9.74", label: "CGPA · B.Tech AI & ML" },
    { value: "8+", label: "Hackathons & competitions" },
  ],
}

/** Top projects, presented as short case studies (owner's selection and order). */
export const caseStudies = [
  {
    id: "scope",
    title: "S.C.O.P.E.",
    meta: "Final-year project · Team of 3 · 2026",
    category: "Full-stack · Distributed systems",
    summary: "The self-hosted exam platform TCET uses to run online exams for all its students.",
    problem: "TCET needed its own exam platform for placement and college tests. It had to run on the campus network, with no data leaving campus.",
    built: "A four-role assessment platform for MCQ and live coding tests, with distributed code execution, live monitoring and analytics.",
    role: "Built with Anuj Singh and Aniket Bhaskar. I designed the system architecture and built the backend and the distributed infrastructure: code execution, queueing, load balancing and real-time exam sync.",
    highlights: [
      "Dockerized Judge0 nodes behind Nginx least-connections load balancing",
      "Redis async queue for code submissions",
      "Exam clocks kept in sync by the server over Socket.io",
      "Load-tested at 40,000 requests and 200 concurrent connections",
    ],
    metrics: [
      { value: "1,000+", label: "Concurrent users" },
      { value: "0%", label: "Failures under load" },
      { value: "4", label: "User roles" },
    ],
    stack: ["React", "Node.js", "Express", "PostgreSQL", "Prisma", "Redis", "Nginx", "Docker", "Judge0", "Socket.io"],
    links: [{ label: "GitHub (public modules)", href: "https://github.com/Ganesh-AIML/SCOPE" }],
    art: 3,
    visual: "scope",
  },
  {
    id: "intervai",
    title: "IntervAI",
    meta: "Boomlet internship · 2026",
    category: "GenAI · Voice AI",
    summary: "A voice-first AI interviewer that screens candidates in a live conversation and writes the evaluation for HR.",
    problem: "First-round technical screens take hours of recruiter time and follow the same pattern every time.",
    built: "Candidates upload a résumé and take a timed voice interview with an AI interviewer. The AI voice model and the system score the candidate and give HR a review dashboard.",
    role: "Built end to end during my internship at Boomlet, from research to a release now used inside the company.",
    highlights: [
      "Real-time voice agent over WebSockets, with keys and prompts kept server-side",
      "Résumé parsing that tailors each interview to the candidate",
      "The voice model judges performance, behaviour and tone during the call, not just the transcript",
      "Answers checked against the résumé after the interview",
      "Admin dashboard for HR review, interview settings and re-scoring",
    ],
    metrics: [
      { value: "5 days", label: "Research to MVP demo" },
      { value: "3", label: "Services: web, API, AI" },
      { value: "Internal", label: "In use at the company" },
    ],
    stack: ["React", "TypeScript", "Java 21", "Spring Boot", "FastAPI", "MongoDB", "Firebase Auth", "Deepgram", "LLM APIs"],
    links: [],
    note: "Company project, so the code is private.",
    art: 1,
    visual: "intervai",
  },
  {
    id: "exo",
    title: "Exo-Classifier",
    meta: "NASA Space Apps 2025 · Team of 6",
    category: "Machine learning",
    summary: "Classifies exoplanet candidates from NASA Kepler and TESS data with 95% accuracy.",
    problem: "NASA's exoplanet catalogues are huge, and hard to read without specialist tools.",
    built: "A classification pipeline and an interactive dashboard that flags likely planets and maps their habitability.",
    role: "Built the ML pipeline and Flask app with Team Pioneer. We were named a Global Nominee at NASA Space Apps 2025.",
    highlights: [
      "11,436 observations across 11 stellar and orbital features",
      "XGBoost model with SHAP and LIME explanations",
      "Habitability views: Goldilocks zone, orbit map, Earth comparison",
    ],
    metrics: [
      { value: "95%", label: "Accuracy" },
      { value: "11,436", label: "Observations" },
      { value: "Global", label: "Nominee, NASA Space Apps" },
    ],
    stack: ["Python", "XGBoost", "scikit-learn", "pandas", "Flask", "Plotly"],
    links: [
      { label: "Live demo", href: "https://exo-classifier.onrender.com" },
      { label: "GitHub", href: "https://github.com/Ganesh-AIML/Exoplanet-Classifier" },
    ],
    art: 0,
    visual: "exo",
  },
]

/** Smaller projects for the index. `ask: true` opens the assistant on this site. */
export const projects = [
  { id: "rag", title: "College RAG Assistant", category: "GenAI · RAG", year: "2026", team: "Solo", text: "A private AI assistant that answers staff questions from college documents, running fully on local models with hybrid search and reranking.", note: "Code is private", art: 4 },
  { id: "resq", title: "ResQ AI", category: "Applied AI · Mobile", year: "2025", team: "Team", text: "Tourist-safety system for Smart India Hackathon 2025: a 10-language app, AI anomaly alerts and a police dashboard. 2nd of 48 at Aavishkar, zonal finalist.", href: "https://github.com/Ganesh-AIML/ResQ-AI", art: 2 },
  { id: "alertica", title: "Alertica", category: "Mobile · Safety", year: "2025", team: "Solo", text: "Women-safety app: voice keyword trigger, SOS with location and audio, and an automated check-in call. DIPEX 2025 finalist.", href: "https://github.com/Ganesh-AIML/Alertica-AI-Powered-Women-Safety-APK", art: 5 },
  { id: "learnsphere", title: "LearnSphere", category: "Backend · Java", year: "2026", team: "Solo", text: "REST backend for an online-learning platform: courses, tests, discussions and progress tracking, secured with JWT.", href: "https://github.com/Ganesh-AIML/Learnshere", art: 6 },
]

/** Under the hood: how a coding submission moves through S.C.O.P.E. */
export const pipeline = {
  note: "How one coding submission travels through S.C.O.P.E., from the locked exam browser to a worker in the execution cluster and back.",
  steps: [
    { title: "Exam browser", text: "Students sit the test in Safe Exam Browser; the editor runs in React." },
    { title: "API", text: "Express checks the session token and role, then records the attempt in PostgreSQL." },
    { title: "Load balancer", text: "Nginx sends each run to the least-busy execution node." },
    { title: "Queue", text: "Redis queues submissions so traffic spikes never drop work." },
    { title: "Execution cluster", text: "Dockerized Judge0 nodes compile and run code against hidden test cases." },
    { title: "Results", text: "Best attempt is saved; Socket.io keeps every student's clock in sync." },
  ],
}

export const journey = {
  entries: [
    {
      id: "boomlet",
      period: "Jul - Sep 2026",
      role: "Software Developer Intern",
      org: "Boomlet · Mumbai",
      points: [
        "Built IntervAI, a voice-first AI interview platform, from research to internal use at the company.",
        "Built modules of an internal operations suite: task boards, milestones, team spaces, messaging and notifications.",
        "Hardened role-based access control and cut database round-trips by over 60%.",
      ],
      stack: ["Java", "Spring Boot", "FastAPI", "React", "PHP", "MySQL", "MongoDB", "LLMs"],
    },
    {
      id: "lias",
      period: "Jun - Jul 2026",
      role: "Forward Deployed AI Engineer · Freelance",
      org: "LIAS · Remote, UK",
      points: [
        "Built an AI-proctored exam platform with React, FastAPI and MongoDB.",
        "Proctoring runs in the browser, so no video is sent to the server.",
        "Secure exam sessions that revoke access after repeated violations, covered by a 150-test suite.",
      ],
      stack: ["React", "FastAPI", "MongoDB", "TensorFlow.js", "MediaPipe"],
    },
    {
      id: "liferythem",
      period: "Feb - Jun 2026",
      role: "Software Development Intern",
      org: "LifeRythem Healthcare · Mumbai",
      points: [
        "Shipped a React Native clinical app with native modules that stream data from IoT health devices.",
        "Trained a CNN on noisy stethoscope audio that reached 90% detection accuracy on edge devices.",
      ],
      stack: ["React Native", "Kotlin", "TensorFlow", "Python"],
    },
    {
      id: "drsga",
      period: "Dec 2025 - Jan 2026",
      role: "AI & ML Intern",
      org: "DRSGA · Mumbai",
      points: [
        "Built a NABH compliance dashboard with 20+ KPIs and automated PDF reports, cutting manual audit time by 80%.",
        "Built an NLP sentiment-analysis service for client feedback.",
      ],
      stack: ["JavaScript", "Chart.js", "Python", "NLP"],
    },
    {
      id: "jacob",
      period: "Jul 2025",
      role: "Web Developer · Freelance",
      org: "Jacob Classes · Mumbai",
      points: ["Built the institute's website with a small team and owned the Toppers page, which earned me a letter of recommendation."],
      stack: ["HTML", "CSS", "JavaScript"],
    },
    {
      id: "junoon",
      period: "May 2024",
      role: "Academic Resource Intern",
      org: "Junoon Foundation",
      points: ["Created learning materials for underprivileged students."],
      stack: [],
    },
  ],
  beyond: [
    { title: "Technical Lead", org: "ACM SIG AI, TCET", year: "" },
    { title: "Secretary", org: "Super-AI Community, TCET", year: "2025-26" },
    { title: "Core Committee, Technical", org: "Super-AI Community, TCET", year: "2024-25" },
  ],
}

export const awards = {
  count: "8",
  countLabel: "Hackathons & competitions",
  note: "Selected results from hackathons, research and competitions.",
  rows: [
    { id: "nasa", year: "2025", title: "Global Nominee at NASA Space Apps Challenge", detail: "Team Pioneer · Exo-Classifier" },
    { id: "credtech", year: "2025", title: "1st Runner-up at CredTech Hackathon, IIT Kanpur", detail: "Team Nerdz · explainable credit-risk tool", cert: "assests/Credtech certificate.png" },
    { id: "aavishkar", year: "2025", title: "2nd of 48 at Aavishkar Research Convention", detail: "Institute round, then zonal finalist · ResQ AI" },
    { id: "dipex", year: "2025", title: "State-level finalist at DIPEX, COEP Pune", detail: "Cleared 3 rounds · Alertica", cert: "assests/DIPEX_Certificate(1).jpeg" },
    { id: "codehathon", year: "2024", title: "3rd place at CodeHathon 2.0, TCET ACM SIGAI", detail: "Competitive programming", cert: "assests/Codethon.png" },
    { id: "multicon", year: "2025", title: "Poster presentation at MULTICON-W 2025", detail: "AI platform to improve athletic performance", cert: "assests/multicon.png" },
  ],
}

export const about = {
  education: [
    { title: "B.Tech, Artificial Intelligence & Machine Learning", detail: "Thakur College of Engineering & Technology · 2023-2027 · CGPA 9.74" },
  ],
  toolkit: [
    { label: "Daily drivers", items: ["Python", "JavaScript", "React", "Node.js", "Java · Spring Boot", "PostgreSQL"] },
    { label: "AI & ML", items: ["scikit-learn", "XGBoost", "TensorFlow", "LLMs & RAG", "Voice agents", "Computer vision"] },
    { label: "Also built with", items: ["FastAPI", "MongoDB", "Flutter", "React Native", "Docker", "Redis", "Nginx", "Firebase"] },
  ],
  process: [
    { title: "Design first", detail: "Architecture, data model and failure cases before code." },
    { title: "Build in modules", detail: "Clear boundaries, so each feature can change on its own." },
    { title: "Audit before merging", detail: "Look for races, leaks and access-control gaps." },
    { title: "Fix the slow paths", detail: "Batch queries, load lazily, measure the gain." },
    { title: "Document and hand off", detail: "Guides others can run without me." },
  ],
  quote: ["Code is not", "just logic.", "It's intent made", "executable."],
}

export const contact = {
  lead: "Open to AI/ML and software engineering internships, and to full-time roles from 2027.",
}
