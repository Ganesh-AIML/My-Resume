import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useMotionValueEvent } from "motion/react"
import { useDirector } from "../agents/AgentProvider"
import {
  MAX_PACKETS,
  NODES,
  QUEUE_SLOTS,
  Sim,
  TIMELINE_MIN,
  WORKERS,
  anchors,
  boxFaces,
  bounds,
  clockLabel,
  cylinder,
  iso,
  ledFaces,
  loadFor,
  queueSlots,
  scenario,
  terminals,
  world,
} from "../scope/sim"

const VB = bounds()
const pct = ([x, y, z = 0]) => {
  const [sx, sy] = iso(x, y, z)
  return { left: `${((sx - VB.x) / VB.w) * 100}%`, top: `${((sy - VB.y) / VB.h) * 100}%` }
}
const line = (list) => list.map((p) => iso(...p).map((n) => n.toFixed(1)).join(",")).join(" ")
const fmt = (n) => n.toLocaleString("en-IN")

const PHASES = {
  signin: "Students sign in. Express checks each token and role before the exam opens.",
  live: "Exam live. Nginx sends every run to the least-busy Judge0 node.",
  rush: "Final-minutes rush. Redis holds the overflow, so no submission is lost.",
  drain: "Rush over. Workers drain the queue.",
  closed: "Exam closed. Best attempts are saved and results go back over Socket.io.",
  load: "Load test. Drag to set how many students are online; submissions arrive in waves.",
  noqueue: "Without the queue, a run that finds every worker busy is lost.",
}

function Box({ b, className, children }) {
  const f = boxFaces(b.x, b.y, b.w, b.d, b.h, b.z || 0)
  return (
    <g className={className}>
      <polygon className="f-left" points={f.left} />
      <polygon className="f-right" points={f.right} />
      <polygon className="f-top" points={f.top} />
      {children}
    </g>
  )
}

/** Static ground, pipes and machines. Rendered once. */
function Scenery({ alive, onNode, nodeRefs, ledRefs, termRefs, cubeRefs }) {
  const { hall, api, pg, lb, queue, nodes, returnY } = world
  const grid = []
  for (let x = -240; x <= 680; x += 60) grid.push(line([[x, -230], [x, 260]]))
  for (let y = -230; y <= 260; y += 60) grid.push(line([[-240, y], [680, y]]))
  const cyl = cylinder(pg.cx, pg.cy, pg.r, pg.h)
  const ordered = [...nodes].sort((a, b) => a.cx + a.cy - (b.cx + b.cy))

  const pipes = [
    [[hall.x0 + hall.w, 0], [api.x, 0]],
    [[api.cx, api.y], [pg.cx, pg.cy + pg.r]],
    [[api.x + api.w, 0], [lb.x, 0]],
    [[lb.x + lb.w, 0], [queue.x, 0]],
    [[queue.x + queue.w, 0], [480, 0]],
    [[480, nodes[0].cy], [480, nodes[NODES - 1].cy]],
    ...nodes.map((n) => [[480, n.cy], [n.x, n.cy]]),
  ]
  const back = [[nodes[1].cx, returnY], [-110, returnY], [-110, hall.y0 + hall.d]]

  return (
    <>
      <g className="sc-grid">
        {grid.map((p, i) => (
          <polyline key={i} points={p} />
        ))}
      </g>

      <g className="sc-pipes">
        {pipes.map((p, i) => (
          <g key={i}>
            <polyline className="pipe" points={line(p.map(([x, y]) => [x, y, 1]))} />
            <polyline className="pipe-flow" points={line(p.map(([x, y]) => [x, y, 1]))} />
          </g>
        ))}
        {[nodes[0].cx, nodes[1].cx].map((cx) => (
          <polyline key={cx} className="pipe pipe--back" points={line([[cx, nodes[NODES - 1].cy + 23, 1], [cx, returnY, 1]])} />
        ))}
        <polyline className="pipe pipe--back" points={line(back.map(([x, y]) => [x, y, 1]))} />
        <polyline className="pipe-flow pipe-flow--back" points={line(back.map(([x, y]) => [x, y, 1]))} />
      </g>

      {/* Exam hall */}
      <Box b={{ x: hall.x0, y: hall.y0, w: hall.w, d: hall.d, h: hall.h }} className="sc-hall" />
      <g className="sc-terms">
        {terminals.map((t, i) => (
          <g key={i} ref={(el) => (termRefs.current[i] = el)} className="sc-term">
            <Box b={{ ...t, z: hall.h }} />
          </g>
        ))}
      </g>

      {/* PostgreSQL */}
      <g className="sc-pg">
        <path d={cyl.body} />
        <ellipse {...cyl.top} />
      </g>

      <Box b={api} className="sc-api" />
      <Box b={lb} className="sc-lb" />

      {/* Redis queue */}
      <Box b={queue} className="sc-queue" />
      <g className="sc-cubes">
        {queueSlots.map((s, i) => (
          <g key={i} ref={(el) => (cubeRefs.current[i] = el)} className="sc-cube">
            <Box b={{ x: s.x - 4.5, y: s.y - 4.5, w: 9, d: 9, h: 9, z: queue.h }} />
          </g>
        ))}
      </g>

      {/* Judge0 cluster */}
      {ordered.map((n) => {
        const top = boxFaces(n.x, n.y, n.w, n.d, n.h).top.split(" ")
        const label = `Judge0 node ${n.i + 1}, ${alive[n.i] ? "online" : "offline"}. Press to take it ${alive[n.i] ? "offline" : "back online"}.`
        return (
          <g
            key={n.i}
            ref={(el) => (nodeRefs.current[n.i] = el)}
            className={`sc-node${alive[n.i] ? "" : " is-down"}`}
            role="button"
            tabIndex={0}
            aria-label={label}
            onClick={() => onNode(n.i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onNode(n.i)
              }
            }}
          >
            <Box b={n} />
            {Array.from({ length: WORKERS }, (_, w) => (
              <polygon key={w} ref={(el) => (ledRefs.current[n.i * WORKERS + w] = el)} className="sc-led" points={ledFaces(n, w)} />
            ))}
            {!alive[n.i] && (
              <g className="sc-x">
                <line x1={top[0].split(",")[0]} y1={top[0].split(",")[1]} x2={top[2].split(",")[0]} y2={top[2].split(",")[1]} />
                <line x1={top[1].split(",")[0]} y1={top[1].split(",")[1]} x2={top[3].split(",")[0]} y2={top[3].split(",")[1]} />
              </g>
            )}
          </g>
        )
      })}
    </>
  )
}

/**
 * Isometric, live simulation of S.C.O.P.E. at exam peak.
 * progress: a MotionValue 0..1 (scroll through the pinned stage) that drives
 * the exam clock in timeline mode. autoplay: run the clock by itself instead
 * (phones, where the stage is not pinned).
 */
export function ScopeScene({ progress, autoplay, reduce }) {
  const director = useDirector()
  const [mode, setMode] = useState("timeline")
  const [students, setStudents] = useState(800)
  const [queueOn, setQueueOn] = useState(true)
  const [alive, setAlive] = useState(() => Array(NODES).fill(true))
  const [inView, setInView] = useState(false)

  const sim = useMemo(() => (reduce ? Sim.snapshot() : new Sim()), [reduce])
  const rootRef = useRef(null)
  const svgRef = useRef(null)
  const dotsRef = useRef(null)
  const dropsRef = useRef(null)
  const nodeRefs = useRef([])
  const ledRefs = useRef([])
  const termRefs = useRef([])
  const cubeRefs = useRef([])
  const hud = useRef({})
  const clock = useRef(0)
  const modeRef = useRef(mode)
  modeRef.current = mode
  const flags = useRef({ lastCall: 0, queueHigh: false, full: false, online: false })

  /* ------------------------------------------------------------ inputs */

  useMotionValueEvent(progress, "change", (p) => {
    if (autoplay) return
    clock.current = Math.min(1, Math.max(0, (p - 0.04) / 0.9)) * TIMELINE_MIN
  })

  useEffect(() => {
    sim.waves = mode === "load"
    if (mode === "load") {
      sim.students = students
      sim.load = loadFor(students)
      sim.login = 0
    }
  }, [mode, students, sim])

  useEffect(() => {
    sim.setQueue(queueOn)
  }, [queueOn, sim])

  const toggleNode = useCallback(
    (i) => {
      setAlive((cur) => {
        const next = [...cur]
        next[i] = !next[i]
        sim.setAlive(i, next[i])
        return next
      })
    },
    [sim],
  )

  const restore = () => {
    for (let i = 0; i < NODES; i++) sim.setAlive(i, true)
    setAlive(Array(NODES).fill(true))
  }

  /* --------------------------------------------------------- visibility */

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* ------------------------------------------------------- agents on call */

  const toClient = useCallback((pt) => {
    const svg = svgRef.current
    if (!svg) return null
    const r = svg.getBoundingClientRect()
    const [sx, sy] = iso(...pt)
    return { x: r.left + ((sx - VB.x) / VB.w) * r.width, y: r.top + ((sy - VB.y) / VB.h) * r.height }
  }, [])

  const call = useCallback(
    (pt, text, force = false) => {
      const f = flags.current
      const now = performance.now()
      if (!director || (!force && now - f.lastCall < 3500)) return
      f.lastCall = now
      director.callout(() => toClient(pt), text)
    },
    [director, toClient],
  )

  /* ---------------------------------------------------------- the loop */

  useEffect(() => {
    const view = { lit: -1, cubes: -1, leds: [], dots: [], drops: 0 }
    const pos = new Array(MAX_PACKETS)
    const circles = dotsRef.current ? [...dotsRef.current.children] : []
    const marks = dropsRef.current ? [...dropsRef.current.children] : []
    let hudAt = -Infinity
    let syncTimer = 0

    const paint = (now) => {
      // Terminals light up with the number of students online.
      const lit = sim.litTerminals()
      if (lit !== view.lit) {
        termRefs.current.forEach((el, i) => el?.classList.toggle("is-on", i < lit))
        view.lit = lit
      }
      // Queue cubes
      const cubes = Math.min(sim.queue, QUEUE_SLOTS)
      if (cubes !== view.cubes) {
        cubeRefs.current.forEach((el, i) => el?.classList.toggle("is-on", i < cubes))
        view.cubes = cubes
      }
      // Worker LEDs
      for (let i = 0; i < NODES; i++) {
        for (let w = 0; w < WORKERS; w++) {
          const k = i * WORKERS + w
          const v = sim.workers[i][w]
          const s = v > 0 ? 2 : v < 0 ? 1 : 0
          if (view.leds[k] !== s) {
            const el = ledRefs.current[k]
            if (el) el.dataset.s = s
            view.leds[k] = s
          }
        }
      }
      // Packets
      const n = sim.positions(pos)
      for (let i = 0; i < circles.length; i++) {
        const c = circles[i]
        if (i < n) {
          const p = pos[i]
          c.setAttribute("cx", p.sx.toFixed(1))
          c.setAttribute("cy", p.sy.toFixed(1))
          if (view.dots[i] !== p.kind) {
            c.setAttribute("class", `dot dot--${p.kind}`)
            view.dots[i] = p.kind
          }
        } else if (view.dots[i] !== "off") {
          c.setAttribute("class", "dot is-off")
          view.dots[i] = "off"
        }
      }
      // Drop marks
      for (let i = 0; i < marks.length; i++) {
        const d = sim.drops[i]
        const m = marks[i]
        if (d) {
          const [sx, sy] = iso(d.x, d.y, 18 + (0.9 - d.t) * 30)
          m.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`)
          m.style.opacity = Math.min(1, d.t * 2).toFixed(2)
        } else if (m.style.opacity !== "0") m.style.opacity = "0"
      }
      // HUD at ~8 Hz
      if (now - hudAt > 120) {
        hudAt = now
        const h = hud.current
        const busy = sim.busy
        const cap = sim.capacity
        const timeline = modeRef.current === "timeline"
        if (h.clock) h.clock.textContent = timeline ? clockLabel(clock.current) : "Live"
        if (h.students) h.students.textContent = sim.students >= 1000 ? `${fmt(sim.students)}+` : fmt(sim.students)
        if (h.queue) h.queue.textContent = sim.queueOn ? fmt(sim.queue) : "Off"
        if (h.busy) h.busy.textContent = `${busy}/${cap}`
        if (h.graded) h.graded.textContent = reduce ? "—" : fmt(sim.graded)
        if (h.dropped) h.dropped.textContent = fmt(sim.dropped)
        if (h.over) h.over.textContent = sim.queue > QUEUE_SLOTS ? `+${sim.queue - QUEUE_SLOTS}` : ""
        if (h.caption) {
          const key = !sim.queueOn && sim.dropped > 0 ? "noqueue" : timeline ? sim.phase : "load"
          if (h.caption.dataset.key !== key) {
            h.caption.dataset.key = key
            h.caption.textContent = PHASES[key]
          }
        }
        if (h.fill) h.fill.style.transform = `scaleX(${cap ? busy / cap : 0})`
      }
    }

    if (reduce) {
      sim.phase = "live"
      clock.current = 18
      paint(0)
      return
    }
    if (!inView) return

    let raf = 0
    let last = 0
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (document.hidden) {
        last = 0
        return
      }
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60
      last = now

      if (modeRef.current === "timeline") {
        if (autoplay) {
          clock.current += dt * (TIMELINE_MIN / 42)
          if (clock.current > TIMELINE_MIN + 4) clock.current = 0
        }
        const sc = scenario(Math.min(clock.current, TIMELINE_MIN))
        sim.students = sc.students
        sim.load = sc.load
        sim.login = sc.login
        sim.phase = sc.phase
      }

      const pulse = sim.step(dt)
      if (pulse) {
        rootRef.current?.classList.add("is-sync")
        clearTimeout(syncTimer)
        syncTimer = setTimeout(() => rootRef.current?.classList.remove("is-sync"), 650)
      }
      paint(now)

      // Agents on call
      const f = flags.current
      for (const e of sim.events) {
        const n = world.nodes[e.node]
        if (e.type === "node-down") call([n.cx, n.cy, n.h + 8], "node down · rerouting", true)
        else if (e.type === "node-up") call([n.cx, n.cy, n.h + 8], "node back online", true)
        else if (e.type === "drop") call(anchors.queue, "runs lost · no queue")
      }
      sim.events.length = 0
      if (!f.online && sim.students >= 1000) {
        f.online = true
        call(anchors.hall, "1,000+ students online")
      }
      if (sim.students < 500) f.online = false
      const cap = sim.capacity
      if (!f.full && cap > 0 && sim.busy >= cap) {
        f.full = true
        call(anchors.cluster, `all ${cap} workers busy`)
      }
      if (sim.busy < cap * 0.6) f.full = false
      if (!f.queueHigh && sim.queue >= 12) {
        f.queueHigh = true
        call(anchors.queue, "queue absorbing the rush")
      } else if (f.queueHigh && sim.queue === 0) {
        f.queueHigh = false
        call(anchors.queue, "queue drained")
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(syncTimer)
    }
  }, [inView, reduce, autoplay, sim, call])

  const setHud = (k) => (el) => (hud.current[k] = el)
  const anyDown = alive.some((a) => !a)

  return (
    <div className={`sc${reduce ? " is-static" : ""}${inView && !reduce ? " is-live" : ""}`} ref={rootRef}>
      <div className="sc-hud">
        <div className="sc-clock">
          <span className="display sc-time" ref={setHud("clock")}>
            {reduce ? "10:13" : "09:55"}
          </span>
          <p className="sc-caption" ref={setHud("caption")} aria-live="off">
            {reduce ? PHASES.live : PHASES.signin}
          </p>
        </div>
        <dl className="sc-stats">
          <div>
            <dt>Students online</dt>
            <dd ref={setHud("students")}>0</dd>
          </div>
          <div>
            <dt>Redis queue</dt>
            <dd ref={setHud("queue")}>0</dd>
          </div>
          <div className="sc-stat-busy">
            <dt>Workers busy</dt>
            <dd ref={setHud("busy")}>0/40</dd>
            <span className="sc-meter" aria-hidden="true">
              <span ref={setHud("fill")} />
            </span>
          </div>
          <div>
            <dt>Graded</dt>
            <dd ref={setHud("graded")}>0</dd>
          </div>
          {!queueOn && (
            <div className="sc-stat-drop">
              <dt>Lost</dt>
              <dd ref={setHud("dropped")}>0</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="sc-fit">
        <div className="sc-canvas" style={{ "--ratio": VB.w / VB.h }}>
          <svg
            ref={svgRef}
            viewBox={`${VB.x.toFixed(1)} ${VB.y.toFixed(1)} ${VB.w.toFixed(1)} ${VB.h.toFixed(1)}`}
            role="img"
            aria-label="Simulated S.C.O.P.E. architecture at exam peak: students in the exam hall send code runs through the Express API and Nginx load balancer into a Redis queue, which feeds a Judge0 cluster of 10 nodes with 4 workers each; results return to students over Socket.io."
          >
            <Scenery alive={alive} onNode={toggleNode} nodeRefs={nodeRefs} ledRefs={ledRefs} termRefs={termRefs} cubeRefs={cubeRefs} />
            <g className="sc-dots" ref={dotsRef} aria-hidden="true">
              {Array.from({ length: reduce ? 0 : MAX_PACKETS }, (_, i) => (
                <circle key={i} className="dot is-off" r="3" cx="0" cy="0" />
              ))}
            </g>
            <g className="sc-drops" ref={dropsRef} aria-hidden="true">
              {Array.from({ length: reduce ? 0 : 12 }, (_, i) => (
                <g key={i} style={{ opacity: 0 }}>
                  <line x1="-5" y1="-5" x2="5" y2="5" />
                  <line x1="5" y1="-5" x2="-5" y2="5" />
                </g>
              ))}
            </g>
          </svg>

          <div className="sc-labels" aria-hidden="true">
            <span className="sc-label" style={pct(anchors.hall)}>
              Exam hall<small>Safe Exam Browser</small>
            </span>
            <span className="sc-label" style={pct(anchors.api)}>
              Express API<small>JWT · RBAC</small>
            </span>
            <span className="sc-label sc-label--minor sc-label--side" style={pct(anchors.pg)}>
              PostgreSQL
            </span>
            <span className="sc-label" style={pct(anchors.lb)}>
              Nginx<small>least-conn</small>
            </span>
            <span className="sc-label" style={pct(anchors.queue)}>
              Redis queue<small ref={setHud("over")} className="sc-over" />
            </span>
            <span className="sc-label sc-label--end" style={pct(anchors.cluster)}>
              Judge0 cluster<small>10 nodes × 4 workers</small>
            </span>
            <span className="sc-label sc-label--minor sc-label--below" style={pct(anchors.results)}>
              Results · Socket.io clock sync
            </span>
          </div>
        </div>
      </div>

      {!reduce && (
        <div className="sc-controls">
          <div className="sc-seg" role="group" aria-label="Simulation mode">
            <button type="button" aria-pressed={mode === "timeline"} onClick={() => setMode("timeline")}>
              Exam timeline
            </button>
            <button type="button" aria-pressed={mode === "load"} onClick={() => setMode("load")}>
              Load test
            </button>
          </div>

          {mode === "load" ? (
            <label className="sc-slider">
              <span>
                Students <b>{fmt(students)}</b>
              </span>
              <input type="range" min="50" max="1200" step="50" value={students} onChange={(e) => setStudents(+e.target.value)} />
            </label>
          ) : (
            <p className="sc-hint">{autoplay ? "The exam plays on a loop." : "Scroll to move the exam clock."}</p>
          )}

          <button type="button" className="sc-toggle" aria-pressed={queueOn} onClick={() => setQueueOn((q) => !q)}>
            <span className="sc-switch" aria-hidden="true" />
            Redis queue {queueOn ? "on" : "off"}
          </button>

          {anyDown ? (
            <button type="button" className="sc-restore" onClick={restore}>
              Restore all nodes
            </button>
          ) : (
            <p className="sc-hint sc-hint--node">Click a Judge0 node to take it offline.</p>
          )}

          <p className="sc-note">Simulated traffic · illustrative, not measured</p>
        </div>
      )}
      {reduce && <p className="sc-note">Still frame of the simulation (animations are reduced on this device).</p>}
    </div>
  )
}
