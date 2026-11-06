import { AnimatePresence, motion } from "motion/react"
import { useAgentState, useDirector } from "./AgentProvider"
import { Icon } from "../components/Icon"
import { ease } from "../motion/primitives"

const selMode = (s) => s.mode
const selTouring = (s) => s.touring

const pop = {
  initial: { opacity: 0, width: 0, marginRight: -6 },
  animate: { opacity: 1, width: "auto", marginRight: 0, transition: { duration: 0.35, ease: ease.out } },
  exit: { opacity: 0, width: 0, marginRight: -6, transition: { duration: 0.25, ease: ease.out } },
}

/**
 * Floating control strip (bottom centre): Tour · Motion on/off · Ask.
 * Tour replays the agent build from the top of the page and scrolls through
 * every section without stopping. Motion off hides the agents (and Tour).
 */
export function AgentDock({ onAsk }) {
  const d = useDirector()
  const off = useAgentState(selMode) === "off"
  const touring = useAgentState(selTouring)

  return (
    <motion.div
      className="dock"
      role="region"
      aria-label="Page controls"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: ease.out, delay: 0.15 }}
    >
      <AnimatePresence initial={false}>
        {!off && (
          <motion.span key="tour" className="dock-slot" {...pop}>
            <button
              type="button"
              className={`dock-btn${touring ? " is-on" : ""}`}
              onClick={d.toggleTour}
              aria-pressed={touring}
              title={touring ? "Stop the tour" : "Watch the agents build the page, top to bottom"}
            >
              <Icon name="route" size={14} />
              {touring ? "Stop tour" : "Tour"}
            </button>
          </motion.span>
        )}
      </AnimatePresence>

      <button
        type="button"
        className={`dock-btn dock-switch${off ? "" : " is-active"}`}
        role="switch"
        aria-checked={!off}
        onClick={off ? d.turnOn : d.turnOff}
        title={off ? "Turn the agent animation on" : "Turn the agent animation off"}
      >
        <Icon name="motion" size={14} />
        Motion
        <span className="dock-pill" aria-hidden="true">
          {off ? "Off" : "On"}
        </span>
      </button>

      <button type="button" className="dock-btn dock-btn--ask" onClick={onAsk}>
        <Icon name="chat" size={14} />
        Ask
        <span className="sr-only"> the AI assistant about Ganesh</span>
      </button>
    </motion.div>
  )
}
