import { useLayoutEffect, useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { Layer } from "../agents/AgentProvider"
import { hero, person } from "../content/site"
import { Magnetic } from "../motion/primitives"
import { Icon } from "./Icon"

/**
 * Cinematic hero: a giant red word behind the cut-out portrait (the red rim
 * light on the portrait carries the theme), name and role on the left,
 * numbers rail on the right.
 */
export function Hero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  // Depth while leaving the hero: the backdrop word drifts up, the portrait sinks.
  const yBack = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-18%"])
  const yPortrait = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "8%"])
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.3])
  const topRef = useRef(null)
  const traceRef = useRef(null)

  // Clip the dashed "PORTFOLIO" trace to the name block, so the trace only
  // appears where the backdrop word runs behind "Hello, I'm" and the name.
  useLayoutEffect(() => {
    const sec = ref.current
    const top = topRef.current
    const trace = traceRef.current
    if (!sec || !top || !trace) return
    const update = () => {
      const s = sec.getBoundingClientRect()
      const t = top.getBoundingClientRect()
      const pad = 6
      trace.style.clipPath = `inset(${t.top - s.top - pad}px ${s.right - t.right - pad}px ${s.bottom - t.bottom - pad}px ${t.left - s.left - pad}px)`
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(sec)
    ro.observe(top)
    window.addEventListener("resize", update)
    document.fonts?.ready.then(update)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <section className="hero" id="top" ref={ref} data-section>
      <div className="hero-glow" aria-hidden="true" />
      <motion.div className="wrap hero-wrap" style={{ opacity: fade }}>
        <div className="hero-figure">
          <motion.div className="hero-backdrop-wrap" style={{ y: yBack }} aria-hidden="true">
            <Layer as="p" kind="text" label="Display / backdrop" priority={5} className="display hero-backdrop">
              {hero.backdrop}
            </Layer>
          </motion.div>
          <motion.div className="hero-portrait-wrap" style={{ y: yPortrait }}>
            <Layer kind="media" label="Portrait" crew={4} priority={4} className="media hero-portrait">
              <img src={person.portrait} alt={`Portrait of ${person.first} ${person.last}`} width="1122" height="1402" fetchPriority="high" decoding="async" />
            </Layer>
          </motion.div>
        </div>

        <div className="hero-top" ref={topRef}>
          <Layer as="p" kind="text" label="Greeting" className="script hero-hello">
            {hero.greeting}
          </Layer>
          <h1 className="display hero-name">
            <Layer as="span" kind="text" label="Display / name" priority={3}>
              {person.first}
            </Layer>
            <Layer as="span" kind="text" label="Display / name" priority={3}>
              {person.last}
              <span className="dot">.</span>
            </Layer>
          </h1>
          <Layer as="p" kind="text" label="Role" className="display hero-role">
            {person.role[0]}
            <br />
            {person.role[1]}
          </Layer>
        </div>

        <div className="hero-bottom">
          <Layer as="p" kind="block" label="Intro" className="hero-intro">
            {hero.intro}
          </Layer>
          <Layer kind="block" label="Actions" className="hero-actions">
            <Magnetic>
              <a className="btn btn--red" href={person.resume} download>
                Download résumé
                <Icon name="download" size={16} />
              </a>
            </Magnetic>
          </Layer>
        </div>

        <aside className="hero-rail" aria-label="At a glance">
          <ul className="hero-stats">
            {hero.stats.map((s, i) => (
              <Layer as="li" key={i} kind="block" label={`Stat ${i + 1}`} className="hero-stat">
                <span className="display hero-stat-value">
                  {s.value}
                  {/^\d+$/.test(s.value) && <span className="hero-stat-dot">.</span>}
                </span>
                <span className="hero-stat-label">{s.label}</span>
              </Layer>
            ))}
          </ul>
        </aside>
      </motion.div>

      {/* Dashed red outline of the backdrop word, drawn over the name where they overlap. */}
      <div className="hero-trace" ref={traceRef} aria-hidden="true">
        <motion.div className="hero-backdrop-wrap" style={{ y: yBack, opacity: fade }}>
          <p className="display hero-backdrop hero-backdrop--trace">{hero.backdrop}</p>
        </motion.div>
      </div>
    </section>
  )
}
