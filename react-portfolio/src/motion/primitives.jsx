import { useRef } from "react"
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react"

/** Shared easing curves (Framer Motion cubic-bézier arrays). */
export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  snap: [0.2, 0.9, 0.1, 1],
}

/** Shared variants. */
export const variants = {
  stagger: (gap = 0.05, delay = 0) => ({
    hidden: {},
    show: { transition: { staggerChildren: gap, delayChildren: delay } },
  }),
  rise: {
    hidden: { opacity: 0, y: "60%" },
    show: { opacity: 1, y: "0%", transition: { duration: 0.7, ease: ease.out } },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4 } },
  },
}

const rollChar = {
  rest: { y: "0%" },
  hover: { y: "-100%" },
}

/**
 * Letters roll up to reveal a duplicate on hover (nav, buttons).
 * The parent must set whileHover="hover" initial="rest" animate="rest".
 */
export function RollText({ text }) {
  return (
    <span className="roll" aria-label={text}>
      {[...text].map((ch, i) => (
        <span className="roll-ch" key={i} aria-hidden="true">
          <motion.span
            className="roll-track"
            variants={rollChar}
            transition={{ duration: 0.42, ease: ease.out, delay: i * 0.018 }}
          >
            <span>{ch === " " ? " " : ch}</span>
            <span>{ch === " " ? " " : ch}</span>
          </motion.span>
        </span>
      ))}
    </span>
  )
}

/** Pulls its child gently toward the pointer. Disabled for reduced motion. */
export function Magnetic({ children, strength = 0.28, className }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.6 })
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.6 })

  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span ref={ref} className={`magnetic ${className || ""}`} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  )
}

/** A label that trails the pointer inside its parent (project media hover). */
export function useFollowLabel() {
  const x = useSpring(0, { stiffness: 380, damping: 32 })
  const y = useSpring(0, { stiffness: 380, damping: 32 })
  const onPointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - r.left)
    y.set(e.clientY - r.top)
  }
  return { x, y, onPointerMove }
}
