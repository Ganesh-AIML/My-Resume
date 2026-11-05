import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Layer } from "../agents/AgentProvider"
import { contact, person } from "../content/site"
import { Magnetic } from "../motion/primitives"
import { Art } from "./Art"
import { Eyebrow, Headline } from "./Headline"
import { Icon } from "./Icon"

const ROWS = [
  { icon: "mail", label: "Email", value: person.email, href: `mailto:${person.email}`, copy: true },
  { icon: "linkedin", label: "LinkedIn", value: "ganesh-singh-aiml", href: person.linkedin, external: true },
  { icon: "github", label: "GitHub", value: "Ganesh-AIML", href: person.github, external: true },
  { icon: "file", label: "Résumé", value: "PDF download", href: person.resume, download: true },
]

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(person.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${person.email}`
    }
  }
  return (
    <button type="button" className="copy-btn" onClick={copy} aria-label={copied ? "Email address copied" : "Copy email address"}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={copied ? "y" : "n"} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
          <Icon name={copied ? "check" : "copy"} size={14} />
          {copied ? "Copied" : "Copy"}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export function Contact({ onAsk }) {
  return (
    <section className="contact" id="contact" data-section>
      <div className="wrap contact-grid">
        <div className="contact-main">
          <Eyebrow index="07">Your next system</Eyebrow>
          <Headline className="contact-title" priority={3} lines={[{ text: "Let’s work" }, { text: "together", dot: true }]} />
          <Layer as="p" kind="block" label="Lead" className="contact-lead">
            {contact.lead}
          </Layer>
          <Layer kind="block" label="Action" className="contact-cta">
            <Magnetic>
              <a className="btn btn--red" href={`mailto:${person.email}`}>
                Start a conversation
                <Icon name="arrowUpRight" size={16} />
              </a>
            </Magnetic>
          </Layer>
        </div>

        <ul className="contact-rows">
          {ROWS.map((r) => (
            <Layer as="li" key={r.label} kind="block" label={`Link / ${r.label}`} className="contact-item">
              <a
                className="contact-row"
                href={r.href}
                {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                {...(r.download ? { download: true } : {})}
              >
                <span className="contact-icon">
                  <Icon name={r.icon} size={18} />
                </span>
                <span className="contact-text">
                  <span className="contact-label">{r.label}</span>
                  <span className="contact-value">{r.value}</span>
                </span>
                <Icon name="arrowUpRight" size={16} className="contact-arrow" />
              </a>
              {r.copy && <CopyEmail />}
            </Layer>
          ))}
        </ul>

        <Layer kind="block" label="Card / build something" crew={3} finale className="contact-card">
          <div className="contact-card-art" aria-hidden="true">
            <Art seed={2} letter="G" label="" />
          </div>
          <p className="display contact-card-title">
            Build something
            <br />
            <span className="is-red">that thinks.</span>
          </p>
          <button type="button" className="contact-card-play" onClick={onAsk} aria-label="Ask the AI assistant about Ganesh">
            <Icon name="chat" size={22} />
          </button>
          <p className="contact-card-note">Ask my AI assistant anything about my projects and experience.</p>
        </Layer>
      </div>
    </section>
  )
}
