import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Layer } from "../agents/AgentProvider"
import { projects } from "../content/site"
import { ease } from "../motion/primitives"
import { Art } from "./Art"
import { Eyebrow, Headline } from "./Headline"
import { Icon } from "./Icon"

function ProjectLink({ p, onAsk, className = "" }) {
  if (p.ask) {
    return (
      <button type="button" className={`text-link ${className}`} onClick={onAsk}>
        Try it now <Icon name="chat" size={14} />
      </button>
    )
  }
  if (!p.href) return <span className={`index-private ${className}`}>{p.note || "Code is private"}</span>
  return (
    <a className={`text-link ${className}`} href={p.href} target="_blank" rel="noopener noreferrer">
      View on GitHub <Icon name="arrowUpRight" size={14} />
    </a>
  )
}

/** Smaller projects as a type index; the preview panel follows hover/focus. */
export function ProjectIndex({ onAsk }) {
  const [active, setActive] = useState(0)
  const current = projects[active]

  return (
    <section className="index" id="index" data-section>
      <div className="wrap index-grid">
        <div className="index-main">
          <Eyebrow index="02">More projects</Eyebrow>
          <div className="section-head">
            <Headline lines={[{ text: "Also" }, { text: "built", red: true, dot: true }]} />
            <Layer as="p" kind="block" label="Note" className="section-note">
              More builds across GenAI, applied AI, mobile and backend<span className="hover-only">. Hover or focus a row to preview it</span>.
            </Layer>
          </div>
          <ul className="index-list">
            {projects.map((p, i) => (
              <Layer as="li" key={p.id} kind="block" label={`Row / ${p.title}`} className="index-item">
                <button
                  type="button"
                  className={`index-row${i === active ? " is-active" : ""}`}
                  aria-expanded={i === active}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <span className="index-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="index-name">{p.title}</span>
                  <span className="index-meta">
                    <span>{p.category}</span>
                    <span>{p.team}</span>
                    <span>{p.year}</span>
                  </span>
                  <Icon name="arrowUpRight" size={22} className="index-arrow" />
                </button>
                {i === active && (
                  <div className="index-inline">
                    <p>{p.text}</p>
                    <ProjectLink p={p} onAsk={onAsk} />
                  </div>
                )}
              </Layer>
            ))}
          </ul>
        </div>

        <div className="index-aside">
          <Layer kind="media" label="Preview panel" crew={2} className="media index-preview">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={current.id}
                className="index-frame"
                initial={{ clipPath: "inset(0 0 100% 0)", scale: 1.06 }}
                animate={{ clipPath: "inset(0 0 0% 0)", scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.2 } }}
                transition={{ duration: 0.6, ease: ease.out }}
              >
                <Art seed={current.art} letter={current.title.slice(0, 1)} label={current.category} />
              </motion.div>
            </AnimatePresence>
          </Layer>
          <div className="index-detail" aria-live="polite">
            <p className="index-caption">
              {current.title} <span>{current.year}</span>
            </p>
            <p className="index-text">{current.text}</p>
            <ProjectLink p={current} onAsk={onAsk} />
          </div>
        </div>
      </div>
    </section>
  )
}
