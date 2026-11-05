# Portfolio content strategy

Status: **v5 — implemented 2026-11-05.** v5 applies the owner's review of v4; it overrides the tables below wherever they differ:
- **Hero is positioning only** ("I design and ship AI-powered software end to end — from the model to the product people actually use."). No project names; projects live in the projects section.
- **Selected work = the owner's top five:** S.C.O.P.E. (final-year project, used by TCET for all-student exams, 1,000+ concurrent users) · IntervAI · Exo-Classifier (95%) · ResQ AI · College RAG Assistant. Each card opens a short case study (problem → what I built → my role → highlights → metrics → stack → links, or "code private"). Filter tabs removed.
- **The LIAS proctoring platform** moves to the Journey (freelance entry); it is no longer a case study.
- **Recognition:** CredTech "1st Runner-up" with no certificate link (the prize came from the organising club; the Unstop certificate only records participation). DIPEX "State-level finalist, cleared 3 rounds", with certificate. Certificates linked only where they match the label (DIPEX, CodeHathon, MULTICON).
- **About:** education plus "Offer — TCS Prime" (one line, no letter).
- **Copy style:** short and general; no confidential internals.

**Review round 1 (owner):** the hero drops the location/time, scroll cue, tagline and the year-range line; "Ask the AI assistant" (icon + label) takes the year-range position; the primary button is now **Download résumé**. Selected work = **S.C.O.P.E., IntervAI, Exo-Classifier**. Exo-Classifier was chosen as the third because it adds classical ML next to full-stack (S.C.O.P.E.) and GenAI (IntervAI), carries the strongest external validation (NASA Space Apps Global Nominee) and is verifiable (95% result, live demo, public code). More projects = **College RAG Assistant, ResQ AI, Alertica, LearnSphere**.

---
Facts come from `PORTFOLIO_PERSONAL_INFORMATION.md` (PI), revision 2: owner-confirmed claims, LinkedIn export and the Boomlet work report. Exact wording lives in `react-portfolio/src/content/site.js`.

---

## 1. Positioning

**What a recruiter should conclude in 60 seconds:**
> An AI & ML engineer who ships **production AI systems end to end** — a voice-first AI interviewer, an in-browser AI proctoring platform, clinical ML on edge devices — plus the full-stack and backend engineering around them, across three industry internships and freelance work, while holding a 9.74 CGPA.

**Why this positioning:**
- **Differentiation:** most student portfolios show coursework and CRUD apps. Ganesh has *shipped* AI into real organisations (Boomlet, LifeRythem, DRSGA, LIAS). The common thread is AI that has to be reliable in production: voice sessions that cannot drop, exams that cannot be gamed, clinical signals on noisy audio.
- **Fit for the target roles:** **AI/ML engineering** (CNN pipeline, proctoring models, XGBoost), **GenAI / LLM** (IntervAI voice agent and LLM evaluation, RBAC-aware LLM middleware, RAG assistant on this site), **backend / full-stack SDE** (S.C.O.P.E., Boomlet RBAC/ABAC and N+1 work, Spring Boot, FastAPI), **applied AI / product engineering** (end-to-end ownership from R&D to production).
- **Specialisation worth naming:** secure assessment and evaluation — S.C.O.P.E. (exam platform) → LIAS (AI proctoring) → IntervAI (AI interviews) → ICICN 2026 paper on multimodal AI proctoring.

**Recruiter evaluation** (C competence · D differentiation · O ownership · R real-world · V visibility on page):

| Item | C | D | O | R | Placement |
|---|---|---|---|---|---|
| IntervAI (Boomlet) | ● | ● | ● | ● | **Case study 1** |
| S.C.O.P.E. | ● | ● | ◐ team of 3 | ● | **Case study 2** + architecture section |
| AI proctoring platform (LIAS) | ● | ● | ● | ● | **Case study 3** |
| Boomlet operations suite, RBAC/ABAC, −60% DB round-trips | ● | ◐ | ● | ● | Experience (top) |
| LifeRythem — CNN on stethoscope audio, IoT bridges | ● | ● | ● | ● | Experience |
| DRSGA — NABH dashboard, NLP sentiment API | ◐ | ◐ | ● | ● | Experience |
| NASA Space Apps Global Nominee, IIT Kanpur CredTech 1st Runner-up | — | ● | ◐ | — | Hero rail + top of Recognition |
| Exo-Classifier, ResQ AI, Alertica, LearnSphere, RAG assistant, insurance agent, draft manager, HN reader | ◐ | ◐ | ● | ◐ | Project index (one line each) |
| Leadership (ACM SIG AI, Super-AI) | — | ◐ | ● | ◐ | "Beyond the code" card |
| Long technology badge lists, HSC, Spoken Tutorial, tutorial repos | ○ | ○ | — | — | **Excluded** |

## 2. Section order and narrative

**Who → proof of work → how it is built → where → recognition → how I work → contact.**

| # | Section | Objective | Notes |
|---|---|---|---|
| 0 | Hero | Who + one-line proof | Above the fold |
| 1 | Selected work | Three case studies | Expand on demand (progressive disclosure) |
| 2 | Project index | Breadth without diluting the top three | One honest line each + links |
| 3 | Under the hood | Systems thinking | S.C.O.P.E. submission pipeline, stepped diagram (replaces the generic before/after slider) |
| 4 | Journey (experience) | Industry context | **Moved above recognition**: industry work outweighs college events |
| 5 | Recognition | External credibility | Ranked by significance |
| 6 | About | How he works, education, toolkit | His own words and quote |
| 7 | Contact | Make contact effortless | Email, LinkedIn, GitHub, résumé, AI assistant |

## 3. Section plan

| Section | Selected content | Source | Presentation | Priority | Recruiter value | Exclusions |
|---|---|---|---|---|---|---|
| **Hero** | "AI & ML Engineer"; intro: production AI end to end (voice interview agents, in-browser proctoring, clinical ML) + full-stack; rail: **3** industry internships · **9.74** CGPA · **8+** hackathons incl. NASA Space Apps global nominee; tagline from his own README: "Build things that outlive the deadline." | LI, CV, GHP | Existing cinematic hero | High | Positioning in 5 s | Generic "passionate developer" |
| **Selected work** | IntervAI · S.C.O.P.E. · AI proctoring (LIAS). Each: problem → what I built → my role → architecture → 3 decisions → outcome → stack → links (or "code private") | BR, CV, PD | 3 cards; "Read case study" opens an inline panel | **Highest** | Depth, ownership, specific interview hooks | Confidential internals |
| **Project index** | Exo-Classifier (NASA), ResQ AI (SIH/Aavishkar), Alertica (DIPEX), LearnSphere, RAG assistant ("Try it"), insurance AI agent, collaborative draft manager, HN reader | PD, GIT | Type index + preview with links | Medium | Breadth across AI, backend, mobile | Tutorials, assignments of no depth, personal pages |
| **Under the hood** | S.C.O.P.E. coding-submission path: Safe Exam Browser → Express API (JWT/RBAC, Prisma/Postgres) → Nginx least-conn → Redis queue → Dockerized Judge0 cluster (10 nodes × 4 workers) → results + Socket.io time-sync | CV, PD | Scroll-stepped pipeline diagram | Medium | Systems design at a glance | — |
| **Journey** | Boomlet, LIAS, LifeRythem, DRSGA, Jacob Classes, Junoon (each expandable with 2–4 bullets + stack); card "Beyond the code": ACM SIG AI Technical Lead, Super-AI Secretary, Super-AI Core Committee | LI, BR, CV, PD | Timeline + side card | High | What he did where, measurable outcomes | Day-by-day log detail, internal names |
| **Recognition** | NASA Space Apps 2025 Global Nominee · IIT Kanpur CredTech 2025 1st Runner-up · ICICN 2026 paper (under review) · Aavishkar 2025-26 · DIPEX 2025 Finalist · CodeHathon 2.0 3rd place · MULTICON-W 2025 poster | owner, CV, PD, CERT | Laurel "8+" + ranked ledger; "View certificate" opens the image where it shows the stated result | Medium–High | External validation | Participation-only certificates, Python course |
| **About** | Statement grounded in how he actually works (architecture first, isolated modules, adversarial audits, fixing hot paths); education (B.Tech AI & ML, TCET 2023–2027, CGPA 9.74); toolkit in three evidence groups (no percentages); 5-step process from the Boomlet log; quote "Code is not just logic — it's intent made executable." | GHP, BR, CV | Existing about layout | Medium | Personality + engineering habits | HSC, skill ratings |
| **Contact** | "Open to AI/ML and software engineering roles — internships now, full-time from 2027"; email (copy), LinkedIn, GitHub, résumé; AI assistant card (finale) | GHP, CV | Existing contact | High | Frictionless next step | Phone number (it stays in the résumé PDF) |

**Site-wide:** the AI assistant's knowledge base (`src/portfolio-data.md`) is updated with Boomlet, IntervAI and the corrected dates. Alertica's app unlock code is removed from public data.

## 4. Review 1 — Recruiter
- *v3 weakness:* positioning was built only on public repos, so it missed the largest body of work (Boomlet) and undersold confirmed results. **Fix:** IntervAI leads; confirmed recognitions return to the hero rail.
- *Weakness:* experience appeared after awards. **Fix:** journey before recognition.
- *Weakness:* numbers without context. **Fix:* each number sits next to the system it describes (e.g. "−60% DB round-trips, N+1 removal across task trees").

## 5. Review 2 — Portfolio owner
- *Weakness:* v3 framed team and private work too cautiously. **Fix:** describe what he built in his own confirmed terms; team size is still stated where a project was a team effort (S.C.O.P.E., Exo-Classifier, ResQ AI), because it answers the first interview question.
- *Weakness:* personality absent. **Fix:** his README lines ("outlive the deadline", "intent made executable") and his real working habits drive the About section.

## 6. Review 3 — Design and storytelling
- *Weakness:* the before/after slider had no real content. **Fix:** replaced by the S.C.O.P.E. pipeline.
- *Weakness:* filter tabs over three projects added clicks, not information. **Fix:* removed; the index carries breadth.
- *Weakness:* long case studies would bloat the page. **Fix:** collapsed by default, one open at a time.
- *Final pass:* no remaining structural issues; the open items below are factual.

## 7. Open items (non-blocking)
- Exo-Classifier accuracy: 75% (résumé) vs 95% (GitHub README). The number is omitted until confirmed.
- "TCS Prime" in the LinkedIn headline: not shown until he confirms what to say.
- Book chapter: title and publisher needed before it is listed.
- ACM SIG AI Technical Lead: dates.
- Certificate images for CredTech and DIPEX show participation wording, so they are not linked next to the runner-up/finalist labels. Add result proof (results page or email) to show one.
