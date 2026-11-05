import { useRef } from "react"
import { motion, useScroll, useSpring } from "motion/react"
import { Layer } from "../agents/AgentProvider"
import { about, person } from "../content/site"
import { Eyebrow, Headline } from "./Headline"

/** About: education + toolkit, the working process, and a red quote card. */
export function About() {
  const stepsRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ["start 0.8", "end 0.55"] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })

  return (
    <section className="about" id="about" data-section>
      <div className="wrap">
        <Eyebrow index="06">Behind the code</Eyebrow>
        <div className="section-head about-head">
          <Headline lines={[{ text: "Not just models", dot: true }, { text: "Systems that", tail: "ship." }]} />
          <Layer as="p" kind="block" label="Statement" className="about-statement">
            {about.statement}
          </Layer>
        </div>

        <div className="about-grid">
          <div className="about-col">
            <Layer as="h3" kind="text" label="Heading" className="about-h">
              Education &amp; toolkit
            </Layer>
            <Layer kind="block" label="Education" className="about-block">
              <p className="about-label">Education</p>
              <ul className="about-list">
                {about.education.map((e) => (
                  <li key={e.title}>
                    <span className="about-item-title">{e.title}</span>
                    <span className="about-item-detail">{e.detail}</span>
                  </li>
                ))}
              </ul>
            </Layer>
            {about.toolkit.map((g) => (
              <Layer key={g.label} kind="block" label={`Toolkit / ${g.label}`} className="about-block">
                <p className="about-label">{g.label}</p>
                <ul className="chips">
                  {g.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </Layer>
            ))}
          </div>

          <div className="about-col">
            <Layer as="h3" kind="text" label="Heading" className="about-h">
              How I work
            </Layer>
            <div className="steps-wrap" ref={stepsRef}>
              <span className="steps-rail" aria-hidden="true">
                <motion.span style={{ scaleY: fill }} />
              </span>
              <ol className="steps">
                {about.process.map((s, i) => (
                  <Layer as="li" key={s.title} kind="block" label={`Step ${i + 1}`} className="step">
                    <span className="display step-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="step-node" aria-hidden="true" />
                    <span className="step-text">
                      <span className="step-title">{s.title}</span>
                      <span className="step-detail">{s.detail}</span>
                    </span>
                  </Layer>
                ))}
              </ol>
            </div>
          </div>

          <Layer as="figure" kind="block" label="Quote card" crew={2} className="quote-card">
            <span className="quote-mark" aria-hidden="true">
              “
            </span>
            <blockquote className="display quote-text">
              {about.quote.map((l, i) => (
                <span key={i} className={i < 2 ? "is-dim" : undefined}>
                  {l}
                </span>
              ))}
            </blockquote>
            <figcaption className="script quote-sign">{person.first}</figcaption>
          </Layer>
        </div>
      </div>
    </section>
  )
}
