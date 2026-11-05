import { useEffect, useRef, useState } from "react"
import { useReducedMotion, useScroll } from "motion/react"
import { Layer } from "../agents/AgentProvider"
import { pipeline } from "../content/site"
import { Eyebrow, Headline } from "./Headline"
import { ScopeScene } from "./ScopeScene"

const PIN_QUERY = "(min-width: 861px) and (min-height: 560px)"

function usePinned(reduce) {
  const [ok, setOk] = useState(() => typeof window !== "undefined" && window.matchMedia(PIN_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(PIN_QUERY)
    const on = () => setOk(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return ok && !reduce
}

/**
 * S.C.O.P.E. under the hood: a pinned, live diorama of the system at exam
 * peak. Scrolling through the stage moves the exam clock.
 */
export function Architecture() {
  const reduce = useReducedMotion()
  const pinned = usePinned(reduce)
  const pinRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ["start start", "end end"] })

  return (
    <section className="arch" id="architecture" data-section>
      <div className="wrap">
        <Eyebrow index="03">Under the hood</Eyebrow>
        <div className="section-head">
          <Headline lines={[{ text: "Inside the" }, { text: "exam engine.", red: true }]} />
          <Layer as="p" kind="block" label="Note" className="section-note">
            {pipeline.note}
          </Layer>
        </div>
      </div>

      <div className={`arch-pin${pinned ? " is-pinned" : ""}`} ref={pinRef}>
        <div className="arch-stage">
          <Layer kind="block" label="Live system · simulated" crew={3} className="wrap arch-stage-inner">
            <ScopeScene progress={scrollYProgress} autoplay={!pinned} reduce={!!reduce} />
          </Layer>
        </div>
      </div>
    </section>
  )
}
