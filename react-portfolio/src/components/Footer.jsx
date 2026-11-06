import { motion, useInView } from "motion/react"
import { useRef } from "react"
import { person } from "../content/site"
import { ease } from "../motion/primitives"

export function Footer() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" })
  const word = `${person.first} ${person.last}`
  return (
    <footer className="footer" ref={ref}>
      <div className="wrap footer-top">
        <a href="#top" className="nav-mark footer-mark" aria-label={`${person.first}, back to top`}>
          {person.first}
          <span className="nav-dot" />
        </a>
        <ul className="footer-links">
          <li>
            <a href={person.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href={person.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={`mailto:${person.email}`}>Email</a>
          </li>
          <li>
            <a href="#top">Back to top</a>
          </li>
        </ul>
      </div>
      <p className="footer-word display" aria-hidden="true">
        {[...word].map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: "100%" }}
            animate={inView ? { y: "0%" } : undefined}
            transition={{ duration: 0.9, ease: ease.out, delay: i * 0.03 }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
        <motion.span className="dot" initial={{ y: "100%" }} animate={inView ? { y: "0%" } : undefined} transition={{ duration: 0.9, ease: ease.out, delay: word.length * 0.03 }}>
          .
        </motion.span>
      </p>
      <div className="wrap footer-base">
        <span>© {new Date().getFullYear()} {word}</span>
        <span>The cursors on this page are simulated agents. It's a choreographed animation, not other visitors.</span>
        <span>Built with React and Motion</span>
      </div>
    </footer>
  )
}
