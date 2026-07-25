# 💼 Personal Portfolio — Ganesh Singh

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Motion](https://img.shields.io/badge/Motion-11-0055FF)
![Status](https://img.shields.io/badge/Status-Live-success)

> **AI & ML Engineer portfolio built with React, featuring an interactive robot assistant powered by Groq LLM.**

---

## Tech Stack

- **React 19** + **Vite 6** — fast dev server and optimized builds
- **Motion 11** — declarative animations and gestures
- **Lottie + DotLottie** — lightweight vector animations for the robot assistant
- **Groq API** (`llama-3.1-8b-instant`) — LLM-powered chat with portfolio context

---

## Features

- **Interactive Robot Assistant** — Lottie-animated FAB that opens a chat panel
- **AI-Powered Q&A** — Groq LLM answers questions about skills, experience, projects, and certificates using portfolio data as RAG context
- **Intelligent Caching** — in-memory cache with 1-hour TTL and fuzzy matching for frequently asked questions
- **Spotlight Timeline** — interactive experience section with parallax cards and animated metrics
- **Project Showcase** — tilt-enabled cards with live GitHub links
- **Certificate Viewer** — modal-based image viewer
- **Fully Responsive** — mobile, tablet, and desktop layouts

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
├── assests/                # Static images and resume PDF
├── src/
│   ├── App.jsx             # Main app with all section components
│   ├── App.css             # Global styles
│   ├── RobotAssistant.jsx  # Robot FAB + chat panel UI
│   ├── chatService.js      # Groq API client + cache + RAG context
│   └── main.jsx            # Entry point
├── .env.example            # Environment variable template
├── index.html
├── vite.config.js
└── package.json
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
