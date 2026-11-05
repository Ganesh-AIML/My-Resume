import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react"
import { Layer } from "../agents/AgentProvider"
import { pipeline } from "../content/site"
import { ease } from "../motion/primitives"
import { Eyebrow, Headline } from "./Headline"
import { ScopeScene } from "./ScopeScene"

const PIN_QUERY = "(min-width: 861px) and (min-height: 560px)"

function usePinned(reduce) {
  const [ok, setOk] = useState(() => typeof window !== "undefined" && window.matchMedia(PIN_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY)
    const on = () => setOk(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return ok && !reduce
}

/**
 * S.C.O.P.E. under the hood. A pinned, live diorama of the system at exam
 * peak (scroll moves the exam clock), followed by the six-step explanation.
 */
export function Architecture() {
  const reduce = useReducedMotion()
  const pinned = usePinned(reduce)
  const pinRef = useRef(null)
  const stepsRef = useRef(null)
  const [active, setActive] = useState(0)
  const held = useRef(false)
  const n = pipeline.steps.length

  const { scrollYProgress: clockProgress } = useScroll({ target: pinRef, offset: ["start start", "end end"] })
  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ["start 0.85", "end 0.45"] })

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (held.current) return
    setActive(Math.min(n - 1, Math.max(0, Math.floor(p * n))))
  })

  const select = (i) => {
    held.current = true
    setActive(i)
  }
  const step = pipeline.steps[active]

  return (
    <section className="arch" id="architecture" data-section>
      <div className="wrap">
        <Eyebrow index="03">Under the hood</Eyebrow>
        <div className="section-head">
          <Headline lines={[{ text: "Inside the" }, { text: "exam engine.", red: true }]} />
          <Layer as="p" kind="block" label="Note" className="section-note">
            {pipeline.note}
          </Layer>
        </div>
      </div>

      <div className={`arch-pin${pinned ? " is-pinned" : ""}`} ref={pinRef}>
        <div className="arch-stage">
          <Layer kind="block" label="Live system · simulated" crew={3} className="wrap arch-stage-inner">
            <ScopeScene progress={clockProgress} autoplay={!pinned} reduce={!!reduce} />
          </Layer>
        </div>
      </div>

      <div className="wrap arch-explain" ref={stepsRef} onPointerLeave={() => (held.current = false)}>
        <Layer kind="block" label="Pipeline" crew={2} className="arch-flow">
          <span className="arch-line" aria-hidden="true">
            <motion.span className="arch-fill" animate={{ scaleX: (active + 1) / n }} transition={{ duration: 0.5, ease: ease.out }} />
            <span className="arch-pulse" />
          </span>
          <ol className="arch-steps">
            {pipeline.steps.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  className={`arch-step${i === active ? " is-active" : ""}${i < active ? " is-done" : ""}`}
                  aria-pressed={i === active}
                  onPointerEnter={() => select(i)}
                  onFocus={() => select(i)}
                  onClick={() => select(i)}
                >
                  <span className="arch-node" aria-hidden="true" />
                  <span className="arch-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="arch-title">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </Layer>

        <div className="arch-detail" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              className="arch-detail-inner"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: ease.out }}
            >
              <span className="display arch-detail-num">{String(active + 1).padStart(2, "0")}</span>
              <div>
                <p className="arch-detail-title">{step.title}</p>
                <p className="arch-detail-text">{step.text}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
