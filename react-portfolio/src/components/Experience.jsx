import { useRef, useState } from "react"
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react"
import { Layer } from "../agents/AgentProvider"
import { journey } from "../content/site"
import { ease } from "../motion/primitives"
import { Eyebrow, Headline } from "./Headline"
import { Icon } from "./Icon"

function Entry({ e, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = `entry-${e.id}`
  return (
    <Layer as="li" kind="block" label={`Entry / ${e.period}`} className={`entry${open ? " is-open" : ""}`}>
      <button type="button" className="entry-row" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span className="entry-period">{e.period}</span>
        <span className="entry-text">
          <span className="entry-role">{e.role}</span>
          <span className="entry-org">{e.org}</span>
        </span>
        <motion.span className="entry-toggle" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3, ease: ease.out }}>
          <Icon name="plus" size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            className="entry-more"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: ease.out }}
          >
            <div className="entry-body">
              <ul className="entry-points">
                {e.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {e.stack.length > 0 && (
                <ul className="chips">
                  {e.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layer>
  )
}

/** Journey: timeline with a red spine that fills as you read, plus leadership outside work. */
export function Experience() {
  const listRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 0.75", "end 0.6"] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })

  return (
    <section className="journey" id="journey" data-section>
      <div className="wrap">
        <Eyebrow index="04">The journey</Eyebrow>
        <Headline className="journey-title" lines={[{ text: "Always learning.", tail: "Always building." }]} />
        <div className="journey-grid">
          <div className="journey-track" ref={listRef}>
            <span className="journey-spine" aria-hidden="true">
              <motion.span style={{ scaleY: fill }} />
            </span>
            <ol className="entries">
              {journey.entries.map((e, i) => (
                <Entry key={e.id} e={e} defaultOpen={i === 0} />
              ))}
            </ol>
          </div>
          <Layer as="aside" kind="block" label="Card / beyond the code" crew={2} className="wins">
            <p className="display wins-title">
              Beyond<span className="dot">.</span>
              <br />
              <span className="is-red">The code.</span>
            </p>
            <ol className="wins-list">
              {journey.beyond.map((w, i) => (
                <li key={w.title + w.org}>
                  <span className="wins-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="wins-name">
                    {w.title}
                    <small>{w.org}</small>
                  </span>
                  <span className="wins-year">{w.year}</span>
                </li>
              ))}
            </ol>
          </Layer>
        </div>
      </div>
    </section>
  )
}
