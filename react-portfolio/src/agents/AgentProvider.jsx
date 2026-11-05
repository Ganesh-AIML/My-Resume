import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import { Director } from "./director"
import "./agents.css"

const DirectorContext = createContext(null)

export function AgentProvider({ children }) {
  const [director] = useState(() => new Director())
  const layerRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    director.mount(layerRef.current, canvasRef.current)
    return () => director.destroy()
  }, [director])

  return (
    <DirectorContext.Provider value={director}>
      <div className="stage">
        {children}
        <div className="agent-layer" ref={layerRef} aria-hidden="true" />
      </div>
      <canvas className="agent-trails" ref={canvasRef} aria-hidden="true" />
    </DirectorContext.Provider>
  )
}

export function useDirector() {
  return useContext(DirectorContext)
}

/**
 * Subscribe to one slice of the director state. Components re-render only when
 * their selected value changes — important for the dock, whose `layout`
 * animation would otherwise re-measure the page on every built-layer count.
 */
export function useAgentState(select = (s) => s) {
  const d = useDirector()
  const get = () => select(d.getSnapshot())
  return useSyncExternalStore(d.subscribe, get, get)
}

/** Registers an element as a buildable layer. Returns a ref. */
export function useLayer(opts) {
  const director = useDirector()
  const ref = useRef(null)
  const optsRef = useRef(opts)
  optsRef.current = opts
  useLayoutEffect(() => {
    if (!director || !ref.current) return
    return director.register(ref.current, optsRef.current)
  }, [director])
  return ref
}

/**
 * A piece of content the agents build.
 * kind: "text" (typed in with an I-beam), "block" (frame dragged open), "media" (image placed into a placeholder)
 * crew: how many agents collaborate on it (extra agents hold the frame's corners)
 * finale: the element the agents gather around once everything is built
 */
export function Layer({ as: Tag = "div", kind = "block", label, crew, priority, finale, instant, children, ...rest }) {
  const ref = useLayer({ kind, label, crew, priority, finale, instant })
  return (
    <Tag ref={ref} data-layer="" data-kind={kind} {...rest}>
      {children}
    </Tag>
  )
}
