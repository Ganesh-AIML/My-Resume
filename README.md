# 💼 Personal Portfolio — Ganesh Singh

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Motion](https://img.shields.io/badge/Motion-11-0055FF)
![Status](https://img.shields.io/badge/Status-Live-success)

> **AI & ML Engineer portfolio, built live on screen by a crew of simulated cursor agents — with a Groq-powered assistant that answers questions about the work.**

---

## Tech Stack

- **React 19** + **Vite 6** — fast dev server and optimized builds
- **Motion 11** (Framer Motion) — UI animation, layout transitions, scroll-linked effects
- **Custom agent director** — one requestAnimationFrame loop that choreographs the multi-cursor build
- **Groq API** (`llama-3.1-8b-instant`) — LLM-powered chat with portfolio context

---

## Features

- **Multi-cursor build** — 14 simulated agents (6 on phones) stream in, orbit the monogram, then frame, type and place every section as it scrolls into view. Selection boxes, blueprint guides, stamped trails, multi-agent corner holds, inspections and a finale ring around the contact card. The cursors are a choreographed animation and the UI says so.
- **Status dock** — agents, layers built, Tour (opt-in auto-scroll), speed, Skip, Replay, turn off (remembered), and the assistant.
- **Accessible by default** — reduced motion shows everything immediately; content is in the DOM for screen readers; focusing an unbuilt element reveals it; the agent layer never intercepts pointer input.
- **AI assistant** — Groq LLM with portfolio data as RAG context, lazy-loaded on first open.

See `docs/REDESIGN_NOTES.md` for the architecture and `docs/PORTFOLIO_REFERENCE_ANALYSIS.md` for the reference study.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Groq API key (free) from [console.groq.com](https://console.groq.com)

### Setup

```bash
# 1. Clone
git clone https://github.com/Ganesh-AIML/My-Resume.git
cd My-Resume/react-portfolio

# 2. Install dependencies
npm install

# 3. Create .env file with your Groq API key
echo "VITE_GROQ_API_KEY=gsk_your_key_here" > .env

# 4. Start dev server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
react-portfolio/
├── public/assests/          # Portrait, certificates, résumé PDF
├── src/
│   ├── agents/              # Director engine, provider/Layer, dock, agent CSS
│   ├── assistant/           # Lazy-loaded chat panel
│   ├── components/          # Page sections, generated artwork, icons
│   ├── content/site.js      # All page copy (placeholders for now)
│   ├── motion/primitives.jsx# Shared easing, variants, RollText, Magnetic
│   ├── styles/              # tokens.css, base.css, sections.css
│   ├── chatService.js       # Groq client + cache + RAG retrieval
│   ├── loadPortfolioData.js # Structured portfolio data (used by the assistant)
│   └── portfolio-data.md    # RAG source document
├── index.html
└── vite.config.js
```

---

## Deployment

The site auto-deploys to **GitHub Pages** via GitHub Actions on push to `main`.

### Setting up the API key for production

1. Go to repo **Settings → Secrets and variables → Actions**
2. Add `VITE_GROQ_API_KEY` with your Groq key as the value
3. Push to `main` — the workflow builds with the key baked in

> **Note:** The API key is embedded in the client-side JS bundle at build time. This is acceptable for a portfolio using a free-tier Groq key (rate-limited, no billing risk).

---

## Connect

[GitHub](https://github.com/Ganesh-AIML) · [LinkedIn](https://linkedin.com/in/ganesh-singh-aiml) · [Email](mailto:ganeshsingh71680@gmail.com)
