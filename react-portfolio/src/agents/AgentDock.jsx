import { AnimatePresence, motion } from "motion/react"
import { useAgentState, useDirector } from "./AgentProvider"
import { ROSTER } from "./roster"
import { Icon } from "../components/Icon"
import { ease } from "../motion/primitives"

function Avatars() {
  return (
    <span className="dock-avatars" aria-hidden="true">
      {ROSTER.slice(0, 5).map((r) => (
        <span key={r.name} style={{ background: r.color }} />
      ))}
    </span>
  )
}

// Leaf components own the fast-changing values so the dock itself only
// re-renders when its mode changes.
const selMode = (s) => s.mode
const selReason = (s) => s.reason
const selAgents = (s) => s.agents
const selBuilt = (s) => s.built
const selTotal = (s) => s.total
const selSpeed = (s) => s.speed
const selTouring = (s) => s.touring
const selElapsed = (s) => s.elapsed

function Count() {
  const built = useAgentState(selBuilt)
  const total = useAgentState(selTotal)
  return (
    <span className="dock-text dock-count">
      <b>{built}</b>
      <span className="dock-dim"> / {total}</span>
      <span className="dock-wide"> layers</span>
    </span>
  )
}

function Progress() {
  const built = useAgentState(selBuilt)
  const total = useAgentState(selTotal)
  return (
    <span className="dock-bar" aria-hidden="true">
      <span style={{ transform: `scaleX(${total ? built / total : 0})` }} />
    </span>
  )
}

function TourButton() {
  const d = useDirector()
  const touring = useAgentState(selTouring)
  return (
    <button
      type="button"
      className={`dock-btn dock-wide${touring ? " is-on" : ""}`}
      onClick={d.toggleTour}
      aria-pressed={touring}
      title="Scroll through the page automatically while the agents build"
    >
      <Icon name="route" size={14} />
      {touring ? "Touring" : "Tour"}
    </button>
  )
}

function SpeedButton() {
  const d = useDirector()
  const speed = useAgentState(selSpeed)
  return (
    <button type="button" className="dock-btn dock-mono" onClick={d.cycleSpeed} title="Animation speed">
      {speed}×
    </button>
  )
}

const swap = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.35, ease: ease.out } },
  exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.2 } },
}

/**
 * Floating status dock for the simulated agents (bottom centre).
 * Mirrors the reference dock: agents · layers · progress · mode · speed · close.
 */
export function AgentDock({ onAsk }) {
  const d = useDirector()
  const mode = useAgentState(selMode)
  const reason = useAgentState(selReason)
  const agents = useAgentState(selAgents)
  const elapsed = useAgentState(selElapsed)

  let content
  if (mode === "boot" || mode === "intro") {
    content = (
      <motion.div key="intro" className="dock-row" {...swap}>
        <Avatars />
        <span className="dock-text">Scanning page…</span>
        <span className="dock-bar dock-bar--scan" />
        <button type="button" className="dock-btn" onClick={d.skip}>
          Skip
        </button>
      </motion.div>
    )
  } else if (mode === "build") {
    content = (
      <motion.div key="build" className="dock-row" {...swap}>
        <Avatars />
        <span className="dock-text">
          <b>{agents}</b> <span className="dock-wide">simulated </span>agents
        </span>
        <span className="dock-sep" aria-hidden="true" />
        <Count />
        <Progress />
        <TourButton />
        <SpeedButton />
        <button type="button" className="dock-btn" onClick={d.skip} title="Show everything now">
          <Icon name="skip" size={14} />
          <span className="dock-wide">Skip</span>
        </button>
      </motion.div>
    )
  } else if (mode === "done") {
    content = (
      <motion.div key="done" className="dock-row" {...swap}>
        <Avatars />
        <span className="dock-text">
          Built by <b>{agents}</b> simulated agents
          {elapsed >= 1 && <span className="dock-wide"> in {elapsed.toFixed(1)}s</span>}
        </span>
        <span className="dock-bar is-full" aria-hidden="true">
          <span />
        </span>
        <button type="button" className="dock-btn" onClick={d.replay}>
          <Icon name="replay" size={14} />
          Replay
        </button>
      </motion.div>
    )
  } else {
    content = (
      <motion.div key="off" className="dock-row" {...swap}>
        <button type="button" className="dock-btn dock-btn--plain" onClick={d.turnOn}>
          <Avatars />
          {reason === "reduced-motion" ? "Agents paused for reduced motion — play" : "Agents off — turn on"}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="dock"
      role="region"
      aria-label="Agent build status"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: ease.out, delay: 0.15 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {content}
      </AnimatePresence>
      <div className="dock-tail">
        <button type="button" className="dock-btn dock-btn--ask" onClick={onAsk}>
          <Icon name="chat" size={14} />
          <span className="dock-wide">Ask</span>
          <span className="sr-only"> the AI assistant about Ganesh</span>
        </button>
        {mode !== "off" && (
          <button type="button" className="dock-icon" onClick={d.turnOff} aria-label="Turn agents off">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
      <span className="sr-only" aria-live="polite">
        {mode === "done" ? "All page sections are visible." : ""}
      </span>
    </motion.div>
  )
}
