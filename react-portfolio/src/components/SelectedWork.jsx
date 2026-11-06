import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Layer } from "../agents/AgentProvider"
import { caseStudies } from "../content/site"
import { ease, useFollowLabel } from "../motion/primitives"
import { ProjectArt } from "./ProjectArt"
import { Eyebrow, Headline } from "./Headline"
import { Icon } from "./Icon"

function WorkCard({ project, index, open, onToggle }) {
  const follow = useFollowLabel()
  const [hover, setHover] = useState(false)
  const panelId = `case-${project.id}`
  return (
    <article className={`work-card${open ? " is-open" : ""}`}>
      <Layer kind="media" label={`Preview / ${project.title}`} crew={index === 0 ? 3 : 1} className="media work-media">
        <button
          type="button"
          className="work-link"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          onPointerMove={follow.onPointerMove}
          onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
          onPointerLeave={() => setHover(false)}
        >
          <span className="work-art">
            <ProjectArt kind={project.visual} seed={project.art} label={`${project.title}: ${project.summary}`} />
          </span>
          <span className="sr-only">{open ? "Close" : "Open"} the {project.title} case study</span>
          <motion.span
            className="follow-label"
            style={{ x: follow.x, y: follow.y }}
            initial={false}
            animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 0.6 }}
            transition={{ duration: 0.25, ease: ease.out }}
            aria-hidden="true"
          >
            {open ? "Close" : "Case study"}
          </motion.span>
        </button>
      </Layer>
      <Layer kind="block" label="Caption" className="work-meta">
        <span className="display work-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="work-text">
          <h3 className="work-title">{project.title}</h3>
          <span className="work-info">{project.meta}</span>
          <span className="work-summary">{project.summary}</span>
          <button type="button" className="work-more" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
            {open ? "Close case study" : "Read case study"}
            <Icon name={open ? "close" : "arrowDown"} size={14} />
          </button>
        </span>
      </Layer>
    </article>
  )
}

function CaseStudy({ project, onClose }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const t = setTimeout(() => el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }), 120)
    return () => clearTimeout(t)
  }, [project.id, reduce])

  return (
    <motion.section
      ref={ref}
      id={`case-${project.id}`}
      className="case"
      aria-label={`${project.title} case study`}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.55, ease: ease.out }}
    >
      <div className="case-inner">
        <header className="case-head">
          <div>
            <p className="case-cat">{project.category}</p>
            <h3 className="display case-title">
              {project.title}
              {!project.title.endsWith(".") && <span className="dot">.</span>}
            </h3>
            <p className="case-meta">{project.meta}</p>
          </div>
          <button type="button" className="case-close" onClick={onClose} aria-label="Close case study">
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="case-grid">
          <div className="case-col">
            <p className="case-label">The problem</p>
            <p className="case-text">{project.problem}</p>
            <p className="case-label">What I built</p>
            <p className="case-text">{project.built}</p>
            <p className="case-label">My role</p>
            <p className="case-text">{project.role}</p>
          </div>
          <div className="case-col">
            <p className="case-label">Under the hood</p>
            <ul className="case-list">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p className="case-label">Stack</p>
            <ul className="chips">
              {project.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="case-col">
            <ul className="case-metrics">
              {project.metrics.map((m) => (
                <li key={m.label}>
                  <span className="display case-metric">{m.value}</span>
                  <span className="case-metric-label">{m.label}</span>
                </li>
              ))}
            </ul>
            <div className="case-links">
              {project.links.map((l) => (
                <a key={l.href} className="btn btn--line" href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                  <Icon name="arrowUpRight" size={14} />
                </a>
              ))}
              {project.note && <p className="case-note">{project.note}</p>}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export function SelectedWork() {
  const [openId, setOpenId] = useState(null)
  const open = caseStudies.find((p) => p.id === openId)
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id))

  return (
    <section className="work" id="work" data-section>
      <div className="wrap">
        <Eyebrow index="01">Selected work</Eyebrow>
        <div className="section-head">
          <Headline lines={[{ text: "Work that thinks", dot: true }]} />
          <Layer as="p" kind="block" label="Note" className="section-note">
            Three projects I'm proudest of. Open any card for the problem, what I built and how it works.
          </Layer>
        </div>

        <ul className="work-grid">
          {caseStudies.map((p, i) => (
            <li key={p.id} className={`work-cell work-cell--${i < 3 ? "third" : "half"}`}>
              <WorkCard project={p} index={i} open={openId === p.id} onToggle={() => toggle(p.id)} />
            </li>
          ))}
        </ul>

        <AnimatePresence initial={false} mode="wait">
          {open && <CaseStudy key={open.id} project={open} onClose={() => setOpenId(null)} />}
        </AnimatePresence>
      </div>
    </section>
  )
}
