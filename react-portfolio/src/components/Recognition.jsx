import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Layer } from "../agents/AgentProvider"
import { awards } from "../content/site"
import { ease } from "../motion/primitives"
import { Eyebrow, Headline } from "./Headline"
import { Icon } from "./Icon"

const base = import.meta.env.BASE_URL

function Laurel({ flip }) {
  return (
    <svg className="laurel" viewBox="0 0 40 80" width="34" height="68" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M30 76C14 66 8 48 12 28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 66 - i * 11
        return <path key={i} d={`M${18 - i} ${y}c-9-2-13-9-12-15 7 1 12 7 12 15z`} fill="currentColor" />
      })}
    </svg>
  )
}

function CertificateDialog({ row, onClose }) {
  const closeRef = useRef(null)
  useEffect(() => {
    const last = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
      last?.focus?.()
    }
  }, [onClose])

  return (
    <motion.div className="cert-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.figure
        className="cert"
        role="dialog"
        aria-modal="true"
        aria-label={`Certificate: ${row.title}`}
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.4, ease: ease.out }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" ref={closeRef} className="cert-close" onClick={onClose} aria-label="Close certificate">
          <Icon name="close" size={18} />
        </button>
        <img src={`${base}${row.cert}`} alt={`Certificate for ${row.title}`} loading="lazy" />
        <figcaption>{row.title}</figcaption>
      </motion.figure>
    </motion.div>
  )
}

/** Recognition: laurel count on the left, ranked ledger with red years on the right. */
export function Recognition() {
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])
  return (
    <section className="awards" id="awards" data-section>
      <div className="wrap awards-grid">
        <div className="awards-head">
          <Eyebrow index="05">Recognition</Eyebrow>
          <Headline lines={[{ text: "Built", dot: true }, { text: "Recognised.", red: true }]} />
          <Layer kind="block" label="Count" className="awards-count">
            <Laurel />
            <span className="display awards-number">
              {awards.count}
              <span className="dot">+</span>
            </span>
            <Laurel flip />
            <span className="awards-count-label">{awards.countLabel}</span>
          </Layer>
          <Layer as="p" kind="block" label="Note" className="section-note">
            {awards.note}
          </Layer>
        </div>
        <ol className="ledger">
          {awards.rows.map((r, i) => (
            <Layer as="li" key={r.id} kind="block" label={`Row / ${r.year}`} className="ledger-item">
              <div className="ledger-row">
                <span className="ledger-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="ledger-text">
                  <span className="ledger-title">{r.title}</span>
                  <span className="ledger-issuer">{r.detail}</span>
                  {r.cert && (
                    <button type="button" className="ledger-cert" onClick={() => setOpen(r)}>
                      View certificate <Icon name="arrowUpRight" size={12} />
                    </button>
                  )}
                </span>
                <span className="display ledger-year">{r.year}</span>
              </div>
            </Layer>
          ))}
        </ol>
      </div>
      <AnimatePresence>{open && <CertificateDialog row={open} onClose={close} />}</AnimatePresence>
    </section>
  )
}
