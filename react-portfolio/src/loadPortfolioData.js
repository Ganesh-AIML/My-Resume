import md from "./portfolio-data.md?raw"

const SKILL_ICONS = {
  Java: "fab fa-java",
  Python: "fab fa-python",
  "Spring Boot": "fas fa-leaf",
  "Machine Learning": "fas fa-brain",
  Blockchain: "fas fa-link",
  "Node.js": "fab fa-node-js",
  SQL: "fas fa-database",
  Docker: "fab fa-docker",
  "Redis & Nginx": "fas fa-server",
  Flutter: "fas fa-mobile-alt",
  "Power BI": "fas fa-chart-bar",
  JavaScript: "fab fa-js-square",
  "HTML & CSS": "fab fa-html5",
}

function parseSkills(content) {
  const section = content.match(/^## Skills\s*\n([\s\S]*?)(?=\n---|\n## )/m)
  if (!section) return []
  const text = section[1].trim().replace(/\n/g, " ")
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ icon: SKILL_ICONS[name] || "fas fa-code", name }))
}

function parseMetrics(str) {
  return str.split("|").map((t) => {
    const s = t.trim()
    const num = s.match(/([\d.]+)([%+]?)$/)
    if (num) {
      const prefix = s.slice(0, s.indexOf(num[1])).trim()
      return { target: Number(num[1]), suffix: num[2] || "", label: prefix }
    }
    const text = s.match(/^(.+?)\s+(.+)$/)
    if (text) return { text: text[2], label: text[1] }
    return { text: s, label: s }
  })
}

function parseAchievements(section) {
  const match = section.match(/- Achievements:\n([\s\S]*?)(?=\n- |\n\n|\n---|\n## )/)
  if (!match) return []
  return match[1]
    .split("\n")
    .map((l) => l.replace(/^  - /, "").trim())
    .filter(Boolean)
}

function parseTech(section) {
  const match = section.match(/- Technologies: (.+)/)
  if (!match) return []
  return match[1].split(",").map((s) => s.trim())
}

function parseExperiences(content) {
  const sections = [...content.matchAll(/^## Experience: (.+)\n([\s\S]*?)(?=\n---|\n## )/gm)]
  return sections.map(([, title, body]) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")
    const role = body.match(/- Role: (.+)/)?.[1] || ""
    const company = body.match(/- Company: (.+)/)?.[1] || title
    const badge = body.match(/- Badge: (.+)/)?.[1] || ""
    const period = body.match(/- Period: (.+)/)?.[1] || ""
    const metrics = parseMetrics(body.match(/- Metrics: (.+)/)?.[1] || "")
    const achievements = parseAchievements(body)
    const tech = parseTech(body)

    const detailsMatch = body.match(/- Sub-events:\n([\s\S]*?)(?=\n---|\n## )/)
    const details = detailsMatch
      ? [...detailsMatch[1].matchAll(/  - (.+?): (.+)/g)].map((m) => ({ title: m[1], desc: m[2] }))
      : undefined

    return { id, role, company, badge, period, metrics, achievements, tech, ...(details ? { details } : {}) }
  })
}

function parseProjects(content) {
  const sections = [...content.matchAll(/^## Project: (.+)\n([\s\S]*?)(?=\n---|\n## )/gm)]
  return sections.map(([, title, body]) => {
    const desc = body.match(/- Description: (.+)/)?.[1] || ""
    const tech = parseTech(body)
    const github = body.match(/- GitHub: (.+)/)?.[1]
    return { title, desc, tech, ...(github ? { github } : {}) }
  })
}

function parseCertificates(content) {
  const sections = [...content.matchAll(/^## Certificate: (.+)\n([\s\S]*?)(?=\n---|\n## )/gm)]
  return sections.map(([, name, body]) => ({
    name,
    issuer: body.match(/- Issuer: (.+)/)?.[1] || "",
    img: body.match(/- Image: (.+)/)?.[1] || "",
  }))
}

const parsed = (() => {
  const content = md
  return {
    SKILLS: parseSkills(content),
    EXPERIENCES: parseExperiences(content),
    PROJECTS: parseProjects(content),
    CERTIFICATES: parseCertificates(content),
  }
})()

export const SKILLS = parsed.SKILLS
export const EXPERIENCES = parsed.EXPERIENCES
export const PROJECTS = parsed.PROJECTS
export const CERTIFICATES = parsed.CERTIFICATES
