import { useEffect, useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react"
import { nav, person } from "../content/site"
import { RollText, ease, variants } from "../motion/primitives"
import { Icon } from "./Icon"

function useActiveSection(ids) {
  const [active, setActive] = useState(null)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids])
  return active
}

const ids = nav.map((n) => n.id)

export function Nav() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useActiveSection(ids)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(v > 24)
    setHidden(v > prev && v > 320 && !open)
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <motion.header
        className={`nav${scrolled ? " is-scrolled" : ""}`}
        initial={{ y: -80 }}
        animate={{ y: hidden ? -90 : 0 }}
        transition={{ duration: 0.55, ease: ease.out }}
      >
        <div className="nav-inner">
          <a href="#top" className="nav-mark" aria-label={`${person.first} ${person.last}, back to top`}>
            {person.first}
            <span className="nav-dot" />
          </a>
          <nav aria-label="Primary" className="nav-center">
            <ul className="nav-links">
              {nav.map((n) => (
                <li key={n.id}>
                  <motion.a
                    href={`#${n.id}`}
                    className={`nav-link${active === n.id ? " is-active" : ""}`}
                    aria-current={active === n.id ? "location" : undefined}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                  >
                    <RollText text={n.label} />
                    {active === n.id && <motion.span className="nav-pip" layoutId="nav-pip" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  </motion.a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="nav-right">
            <motion.a href="#contact" className="nav-cta" initial="rest" animate="rest" whileHover="hover">
              <RollText text="Let's talk" />
              <Icon name="arrowUpRight" size={14} />
            </motion.a>
          </div>
          <button type="button" className="nav-menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="menu"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 32px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 32px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 32px)" }}
            transition={{ duration: 0.65, ease: ease.inOut }}
          >
            <motion.ul variants={variants.stagger(0.06, 0.2)} initial="hidden" animate="show">
              {nav.map((n, i) => (
                <li key={n.id} className="menu-item">
                  <motion.a href={`#${n.id}`} variants={variants.rise} onClick={() => setOpen(false)}>
                    <span className="menu-num">{String(i + 1).padStart(2, "0")}</span>
                    {n.label}
                  </motion.a>
                </li>
              ))}
            </motion.ul>
            <motion.div className="menu-foot" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.55 } }}>
              <a className="menu-mail" href={`mailto:${person.email}`}>
                {person.email}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
