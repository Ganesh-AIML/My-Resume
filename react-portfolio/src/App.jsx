import { lazy, Suspense, useCallback, useState } from "react"
import { AgentProvider } from "./agents/AgentProvider"
import { AgentDock } from "./agents/AgentDock"
import { Nav } from "./components/Nav"
import { Hero } from "./components/Hero"
import { SelectedWork } from "./components/SelectedWork"
import { ProjectIndex } from "./components/ProjectIndex"
import { Recognition } from "./components/Recognition"
import { Architecture } from "./components/Architecture"
import { About } from "./components/About"
import { Experience } from "./components/Experience"
import { Contact } from "./components/Contact"
import { Footer } from "./components/Footer"

const AgentChat = lazy(() => import("./assistant/AgentChat"))

export default function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatLoaded, setChatLoaded] = useState(false)
  const openChat = useCallback(() => {
    setChatLoaded(true)
    setChatOpen(true)
  }, [])
  const closeChat = useCallback(() => setChatOpen(false), [])

  return (
    <AgentProvider>
      <a className="skip-link" href="#work">
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero onAsk={openChat} />
        <SelectedWork />
        <ProjectIndex onAsk={openChat} />
        <Architecture />
        <Experience />
        <Recognition />
        <About />
        <Contact onAsk={openChat} />
      </main>
      <Footer />
      <AgentDock onAsk={openChat} />
      {chatLoaded && (
        <Suspense fallback={null}>
          <AgentChat open={chatOpen} onClose={closeChat} />
        </Suspense>
      )}
    </AgentProvider>
  )
}
