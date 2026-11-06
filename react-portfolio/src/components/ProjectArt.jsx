import { memo, useEffect, useId, useRef } from "react"
import { useReducedMotion } from "motion/react"
import { boxFaces, iso } from "../scope/sim"
import { Art } from "./Art"

/**
 * Project card visuals that act out what each project does.
 * All three are isometric miniatures in the same projection as the
 * "Under the hood" diorama.
 * - S.C.O.P.E.: locked terminal → Redis queue → Judge0 cluster → verdict.
 * - IntervAI: résumé → live voice call over WebSockets → transcript → HR.
 * - Exo-Classifier: telescope → light curve → 11 features → XGBoost trees.
 * Pure SVG; one rAF loop per card that runs only while the card is on screen.
 * Reduced motion gets a still, representative frame.
 */

const W = 800
const H = 500

/* ------------------------------------------------------------ helpers */

const f = (n) => n.toFixed(1)
const P = (x, y, z = 0) => iso(x, y, z)
const clamp01 = (k) => (k < 0 ? 0 : k > 1 ? 1 : k)
const seg = (t, a, b) => clamp01((t - a) / (b - a))
const easeOut = (k) => 1 - (1 - k) ** 3
const lerp = (a, b, k) => a + (b - a) * k

function Box({ b, className = "" }) {
  const fc = boxFaces(b.x0, b.y0, b.w, b.d, b.h, b.z || 0)
  return (
    <g className={className}>
      <polygon className="f-left" points={fc.left} />
      <polygon className="f-right" points={fc.right} />
      <polygon className="f-top" points={fc.top} />
    </g>
  )
}

/** A polyline of world points, with a function to sample a point along it. */
function track(points) {
  const scr = points.map((p) => P(...p))
  const lens = [0]
  for (let i = 1; i < scr.length; i++) {
    lens.push(lens[i - 1] + Math.hypot(scr[i][0] - scr[i - 1][0], scr[i][1] - scr[i - 1][1]))
  }
  const total = lens[lens.length - 1]
  return {
    d: scr.map((p, i) => `${i ? "L" : "M"}${f(p[0])},${f(p[1])}`).join(""),
    at(k) {
      const L = clamp01(k) * total
      let i = 1
      while (i < lens.length - 1 && lens[i] < L) i++
      const u = (L - lens[i - 1]) / (lens[i] - lens[i - 1] || 1)
      return [lerp(scr[i - 1][0], scr[i][0], u), lerp(scr[i - 1][1], scr[i][1], u)]
    },
  }
}

const line = (a, b) => {
  const [x1, y1] = P(...a)
  const [x2, y2] = P(...b)
  return { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2) }
}

/** Text lying on a vertical face that runs along x (the visible "left" face). */
const onXFace = (x, y, z) => {
  const [e, g] = P(x, y, z)
  return `matrix(0.8988 0.4384 0 1 ${f(e)} ${f(g)})`
}

/**
 * Runs `makeDraw($)` once with every [data-k] element, then calls the returned
 * draw(t, dt) on each frame while the card is visible. Hovering the card speeds
 * the clock up.
 */
function useLoop(rootRef, makeDraw, { reduce, still, period, boost = 1.7 }) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const $ = {}
    root.querySelectorAll("[data-k]").forEach((n) => {
      $[n.dataset.k] = n
    })
    const draw = makeDraw($)
    if (reduce) {
      draw(still, 0, true)
      return undefined
    }
    let raf = 0
    let last = 0
    let t = 0
    let speed = 1
    let visible = false
    const host = root.closest(".work-link") || root
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt * speed
      if (period) t %= period
      draw(t, dt * speed)
      raf = requestAnimationFrame(tick)
    }
    const start = () => {
      if (raf || !visible || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      visible ? start() : stop()
    })
    io.observe(root)
    const onVis = () => (document.hidden ? stop() : start())
    const fast = () => (speed = boost)
    const slow = () => (speed = 1)
    document.addEventListener("visibilitychange", onVis)
    host.addEventListener("pointerenter", fast)
    host.addEventListener("pointerleave", slow)
    host.addEventListener("focus", fast)
    host.addEventListener("blur", slow)
    draw(0, 0)
    return () => {
      stop()
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      host.removeEventListener("pointerenter", fast)
      host.removeEventListener("pointerleave", slow)
      host.removeEventListener("focus", fast)
      host.removeEventListener("blur", slow)
    }
  }, [rootRef, makeDraw, reduce, still, period, boost])
}

function Backdrop({ id, tint }) {
  return (
    <>
      <defs>
        <radialGradient id={`bg${id}`} cx="62%" cy="34%" r="85%">
          <stop offset="0" stopColor={tint} />
          <stop offset="1" stopColor="#060607" />
        </radialGradient>
        <pattern id={`gr${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#8a8a96" strokeOpacity="0.07" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#bg${id})`} />
      <rect width={W} height={H} fill={`url(#gr${id})`} />
    </>
  )
}

/* ------------------------------------------------------- S.C.O.P.E. */

const SC = (() => {
  const desk = { x0: -165, y0: -25, w: 100, d: 60, h: 10 }
  const monitor = { x0: -150, y0: 16, w: 72, d: 6, h: 58, z: 10 }
  const keys = { x0: -148, y0: 25, w: 56, d: 8, h: 2, z: 10 }
  const tray = { x0: -10, y0: -8, w: 44, d: 26, h: 4 }
  const cubes = [-6, 4, 14, 24].map((x0) => ({ x0, y0: 1, w: 8, d: 8, h: 8, z: 4 }))
  const towers = [-58, -18, 22].map((y0) => ({ x0: 80, y0, w: 28, d: 28, h: 64 }))
  const screen = [[-145, 22.2, 16], [-83, 22.2, 16], [-83, 22.2, 62], [-145, 22.2, 62]]
  const code = [34, 40, 28, 44, 22, 36].map((len, i) => {
    const indent = [0, 6, 12, 12, 6, 0][i]
    const z = 56 - i * 7
    return { a: [-142 + indent, 22.3, z], len }
  })
  const leds = (t) =>
    [12, 24, 36, 48].map((z) => {
      const y0 = t.y0 + 7
      const y1 = t.y0 + 21
      const x = t.x0 + t.w + 0.2
      return [[x, y0, z], [x, y1, z], [x, y1, z + 6], [x, y0, z + 6]].map((p) => P(...p).map(f).join(",")).join(" ")
    })
  const toTray = track([[-65, 5, 6], [-2, 5, 6], [24, 5, 10]])
  const toTower = track([[28, 5, 10], [60, 5, 6], [60, 36, 6], [80, 36, 6]])
  const back = track([[94, 50, 1], [94, 64, 1], [-110, 64, 1], [-110, 35, 1]])
  return { desk, monitor, keys, tray, cubes, towers, screen, code, leds, toTray, toTower, back }
})()

const SC_PERIOD = 7.2

function scopeDraw($) {
  const codeEls = SC.code.map((_, i) => $[`code${i}`])
  const leds = [0, 1, 2, 3].map((i) => $[`led${i}`])
  return (t) => {
    const fade = 1 - seg(t, 6.7, 7.1)
    // 1. student types the answer
    SC.code.forEach((c, i) => {
      const k = easeOut(seg(t, 0.15 + i * 0.26, 0.45 + i * 0.26))
      const [x2, y2] = P(c.a[0] + c.len * k, c.a[1], c.a[2])
      codeEls[i].setAttribute("x2", f(x2))
      codeEls[i].setAttribute("y2", f(y2))
      codeEls[i].style.opacity = String(Math.min(fade, 1 - seg(t, 5.55, 5.85)))
    })
    // 2. run goes to the queue, waits, then to a judge node
    let p = null
    if (t >= 1.8 && t < 2.6) p = SC.toTray.at(easeOut(seg(t, 1.8, 2.6)))
    else if (t >= 3.2 && t < 3.9) p = SC.toTower.at(seg(t, 3.2, 3.9))
    else if (t >= 4.9 && t < 5.8) p = SC.back.at(seg(t, 4.9, 5.8))
    $.pkt.style.opacity = p ? "1" : "0"
    if (p) $.pkt.setAttribute("transform", `translate(${f(p[0])} ${f(p[1])})`)
    $.waiting.style.opacity = t >= 2.55 && t < 3.25 ? "1" : "0"
    // 3. worker LEDs light up while the tests run
    leds.forEach((el, i) => el.setAttribute("data-on", t > 3.9 + i * 0.2 && t < 5.0 ? "1" : "0"))
    $.tower.setAttribute("data-on", t > 3.9 && t < 5.0 ? "1" : "0")
    // 4. verdict back on the student's screen
    const v = seg(t, 5.75, 6.0) * fade
    $.verdict.style.opacity = String(v)
    $.screen.setAttribute("data-on", v > 0.5 ? "1" : "0")
  }
}

function ScopeMini({ reduce }) {
  const id = useId().replace(/:/g, "")
  const ref = useRef(null)
  useLoop(ref, scopeDraw, { reduce, still: 6.2, period: SC_PERIOD })
  const [lx, ly] = P(-114, 19, 82)
  const [qx, qy] = P(12, 30, 0)
  const [jx, jy] = P(94, -58, 64)
  const [rx, ry] = P(-60, 64, 1)
  return (
    <svg ref={ref} className="pm pm-scope" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Backdrop id={id} tint="#1d0c0f" />
      <g transform="translate(426 322) scale(1.72)">
        <path className="pm-pipe" d={SC.toTray.d} />
        <path className="pm-pipe" d={SC.toTower.d} />
        <path className="pm-pipe pm-pipe--back" d={SC.back.d} />

        <Box b={SC.desk} />
        <Box b={SC.monitor} className="pm-dark" />
        <polygon data-k="screen" className="pm-screen" points={SC.screen.map((p) => P(...p).map(f).join(",")).join(" ")} />
        {SC.code.map((c, i) => (
          <line key={i} data-k={`code${i}`} className={`pm-code${i === 3 ? " pm-code--hi" : ""}`} {...line(c.a, c.a)} />
        ))}
        <g data-k="verdict" className="pm-verdict" transform={onXFace(-141, 22.4, 33)} style={{ opacity: 0 }}>
          <text x="0" y="0">✓ Accepted</text>
        </g>
        <Box b={SC.keys} />

        <g className="pm-lock" transform={`translate(${f(lx)} ${f(ly)})`}>
          <path d="M-5 -2v-4a5 5 0 0 1 10 0v4" />
          <rect x="-7.5" y="-2" width="15" height="11" rx="1.5" />
          <circle cx="0" cy="3.5" r="1.6" />
        </g>
        <text className="pm-label" x={f(lx)} y={f(ly - 14)} textAnchor="middle">LOCKED BROWSER</text>

        <Box b={SC.tray} className="pm-tray" />
        {SC.cubes.map((c, i) => (
          <Box key={i} b={c} className={i === 3 ? "pm-cube-new" : "pm-cube"} />
        ))}
        <g data-k="waiting" className="pm-waiting" style={{ opacity: 0 }}>
          <Box b={SC.cubes[3]} className="pm-cube-hot" />
        </g>
        <text className="pm-label" x={f(qx)} y={f(qy + 16)} textAnchor="middle">REDIS QUEUE</text>

        {SC.towers.map((tw, i) => (
          <g key={i} data-k={i === 2 ? "tower" : undefined} className="pm-tower">
            <Box b={tw} />
            {SC.leds(tw).map((pts, j) =>
              i === 2 ? (
                <polygon key={j} data-k={`led${j}`} className="pm-led" points={pts} />
              ) : (
                <polygon key={j} className="pm-led" data-on={(i + j) % 3 === 0 ? "1" : "0"} points={pts} />
              ),
            )}
          </g>
        ))}
        <text className="pm-label" x={f(jx)} y={f(jy - 12)} textAnchor="middle">JUDGE0 CLUSTER</text>
        <text className="pm-label" x={f(rx)} y={f(ry + 15)} textAnchor="middle">RESULT</text>

        <g data-k="pkt" className="pm-pkt" style={{ opacity: 0 }}>
          <circle r="6" className="pm-pkt-halo" />
          <circle r="2.8" />
        </g>
      </g>
    </svg>
  )
}

/* ---------------------------------------------------------- IntervAI */

const pts = (list) => list.map((p) => P(...p).map(f).join(",")).join(" ")

const IV = (() => {
  const base = { x0: -196, y0: -26, w: 64, d: 44, h: 4 }
  const lid = { x0: -194, y0: -31, w: 60, d: 5, h: 46, z: 4 }
  const screen = pts([[-191, -25.8, 9], [-137, -25.8, 9], [-137, -25.8, 47], [-191, -25.8, 47]])
  const keys = [0, 1, 2, 3].map((r) => ({ a: [-188, -16 + r * 7, 4.1], b: [-142, -16 + r * 7, 4.1] }))
  const ai = { x0: -40, y0: -22, w: 40, d: 40, h: 46 }
  const plinth = { x0: -44, y0: -26, w: 48, d: 48, h: 3 }
  const transcript = { x0: 24, y0: -58, w: 50, d: 36, h: 3, z: 70 }
  const tLines = [0, 1, 2, 3].map((i) => ({ y: -51 + i * 7.5, len: [38, 30, 40, 26][i] }))
  const monitor = { x0: 64, y0: 8, w: 84, d: 6, h: 54, z: 16 }
  const stand = { x0: 101, y0: 4, w: 10, d: 5, h: 16 }
  const foot = { x0: 90, y0: -8, w: 32, d: 22, h: 2 }
  const hrScreen = pts([[67, 14.2, 19], [145, 14.2, 19], [145, 14.2, 67], [67, 14.2, 67]])
  const out = track([[-40, -9, 7], [-132, -9, 7]])
  const inn = track([[-132, 5, 7], [-40, 5, 7]])
  const toHR = track([[49, -40, 70], [92, -10, 62], [104, 14, 46]])
  const fromAI = track([[-20, -2, 52], [10, -24, 66], [36, -40, 72]])
  return { base, lid, screen, keys, ai, plinth, transcript, tLines, monitor, stand, foot, hrScreen, out, inn, toHR, fromAI }
})()

const IV_PERIOD = 9.6
const TURNS = [0, 1, 2, 3].map((i) => ({ t0: 2.5 + i * 1.15, ai: i % 2 === 0 }))
const LAP_BARS = 13
const AI_BARS = 9
const RING = 2 * Math.PI * 9

function intervaiDraw($) {
  const lap = Array.from({ length: LAP_BARS }, (_, i) => $[`lw${i}`])
  const aiw = Array.from({ length: AI_BARS }, (_, i) => $[`aw${i}`])
  const tl = IV.tLines.map((_, i) => $[`tl${i}`])
  const bars = [0, 1, 2, 3].map((i) => $[`hb${i}`])
  const wave = (els, t, active, amp, mid) =>
    els.forEach((el, i) => {
      const k = active ? 0.25 + 0.75 * Math.abs(Math.sin(t * 11 + i * 1.7) * Math.sin(t * 5.3 + i * 0.6)) : 0.12
      const h = amp * k
      el.setAttribute("y", f(mid - h / 2))
      el.setAttribute("height", f(h))
    })
  return (t) => {
    const fade = 1 - seg(t, 9.0, 9.5)
    // 1. résumé uploaded, flies into the AI service and is parsed
    const r0 = seg(t, 0.1, 0.5)
    const fly = easeOut(seg(t, 1.5, 2.3))
    const [ax, ay] = $.resumeHome
    $.resume.style.opacity = String(f(r0 * (1 - seg(t, 2.0, 2.3))))
    $.resume.setAttribute("transform", `translate(${f(lerp(0, $.aiTop[0] - ax, fly))} ${f(lerp(0, $.aiTop[1] - ay, fly) - Math.sin(fly * Math.PI) * 30)}) scale(${f(1 - fly * 0.6)})`)
    const sc = seg(t, 0.5, 1.4)
    $.rscan.style.opacity = sc > 0 && sc < 1 ? "1" : "0"
    $.rscan.setAttribute("transform", `translate(0 ${f(sc * 40)})`)
    $.ai.setAttribute("data-on", t > 2.2 && t < 2.6 ? "1" : "0")

    // 2. live voice interview over WebSockets, turn by turn
    let turn = null
    for (const tr of TURNS) if (t >= tr.t0 && t < tr.t0 + 1.15) turn = tr
    const aiTalk = !!turn && turn.ai
    const youTalk = !!turn && !turn.ai
    $.flowOut.style.opacity = aiTalk ? "1" : "0"
    $.flowIn.style.opacity = youTalk ? "1" : "0"
    $.flowOut.style.strokeDashoffset = f(t * 40)
    $.flowIn.style.strokeDashoffset = f(-t * 40)
    $.lap.setAttribute("data-mode", aiTalk ? "ai" : youTalk ? "you" : "idle")
    wave(lap, t, !!turn, 9, 26)
    wave(aiw, t + 0.4, aiTalk, 16, 14)
    $.orb.setAttribute("data-on", aiTalk ? "1" : "0")
    $.orbCore.setAttribute("r", f(aiTalk ? 9.5 + Math.sin(t * 14) * 1.2 : 9))
    $.rings.setAttribute("transform", `rotate(${f(t * 40)})`)
    const call = t >= 2.5 && t < 7.1
    $.live.style.opacity = call && Math.sin(t * 6) > -0.3 ? "1" : "0.25"
    const secs = Math.max(0, 59 - Math.floor(Math.max(0, t - 2.5) * 4))
    $.timer.textContent = `14:${String(secs).padStart(2, "0")}`
    // every turn becomes a transcript line
    tl.forEach((el, i) => {
      const k = easeOut(seg(t, TURNS[i].t0 + 0.2, TURNS[i].t0 + 0.8)) * fade
      const ln = IV.tLines[i]
      const [x2, y2] = P(IV.transcript.x0 + 6 + ln.len * k, ln.y, IV.transcript.z + IV.transcript.h + 0.1)
      el.setAttribute("x2", f(x2))
      el.setAttribute("y2", f(y2))
    })
    $.trans.style.opacity = String(f(Math.max(0.35, seg(t, 2.4, 2.8)) * (0.35 + 0.65 * fade)))

    // 3. transcript scored against the résumé → HR dashboard
    let p = null
    if (turn) p = IV.fromAI.at((t - turn.t0) / 1.15)
    if (t >= 7.1 && t < 7.8) p = IV.toHR.at(easeOut(seg(t, 7.1, 7.8)))
    $.pkt.style.opacity = p ? "1" : "0"
    if (p) $.pkt.setAttribute("transform", `translate(${f(p[0])} ${f(p[1])})`)
    const ring = easeOut(seg(t, 7.8, 8.6)) * fade
    $.ring.style.strokeDashoffset = f(RING * (1 - 0.82 * ring))
    bars.forEach((el, i) => {
      const k = easeOut(seg(t, 7.9 + i * 0.15, 8.5 + i * 0.15)) * fade
      el.setAttribute("width", f([36, 28, 40, 32][i] * k))
    })
    $.match.style.opacity = String(f(seg(t, 8.5, 8.7) * fade))
    $.hr.setAttribute("data-on", ring > 0.05 ? "1" : "0")
  }
}

function IntervaiMini({ reduce }) {
  const id = useId().replace(/:/g, "")
  const ref = useRef(null)
  const resumeHome = P(-232, 4, 34)
  const aiTop = P(-20, -2, 50)
  const draw = useRef(null)
  if (!draw.current) draw.current = ($) => intervaiDraw(Object.assign($, { resumeHome, aiTop }))
  useLoop(ref, draw.current, { reduce, still: 8.9, period: IV_PERIOD })
  const [ox, oy] = P(-20, -2, 84)
  const [lx, ly] = P(-164, -28, 52)
  const [ix, iy] = P(-20, 22, 0)
  const [tx, ty] = P(49, -58, 74)
  const [hx, hy] = P(106, 14, 70)
  const [wx, wy] = P(-100, 30, 0)
  return (
    <svg ref={ref} className="pm pm-iv" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Backdrop id={id} tint="#1a0b0e" />
      <defs>
        <radialGradient id={`orb${id}`} cx="40%" cy="35%">
          <stop offset="0" stopColor="#ffd9d6" />
          <stop offset="0.35" stopColor="#ff3a44" />
          <stop offset="1" stopColor="#5a0910" />
        </radialGradient>
        <linearGradient id={`beam${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#e3242f" stopOpacity="0.35" />
          <stop offset="1" stopColor="#e3242f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="translate(470 330) scale(1.7)">
        {/* WebSocket voice lanes */}
        <path className="pm-pipe" d={IV.out.d} />
        <path className="pm-pipe" d={IV.inn.d} />
        <path data-k="flowOut" className="pm-flow pm-flow--ai" d={IV.out.d} style={{ opacity: 0 }} />
        <path data-k="flowIn" className="pm-flow" d={IV.inn.d} style={{ opacity: 0 }} />

        {/* candidate's laptop with the call screen */}
        <Box b={IV.base} />
        {IV.keys.map((k, i) => (
          <line key={i} className="pm-keys" {...line(k.a, k.b)} />
        ))}
        <Box b={IV.lid} className="pm-dark" />
        <polygon className="pm-screen" points={IV.screen} />
        <g data-k="lap" className="pm-call" data-mode="idle" transform={onXFace(-191, -25.7, 47)}>
          <circle data-k="live" cx="3.6" cy="4" r="1.5" className="pm-call-dot" />
          <text x="6.4" y="5.6" className="pm-call-txt">LIVE</text>
          <text data-k="timer" x="51" y="5.6" textAnchor="end" className="pm-call-txt">14:59</text>
          <circle cx="27" cy="13.5" r="6.2" className="pm-call-orb" />
          <circle cx="27" cy="13.5" r="3" className="pm-call-orb-in" />
          {Array.from({ length: LAP_BARS }, (_, i) => (
            <rect key={i} data-k={`lw${i}`} className="pm-call-bar" x={f(9 + i * 3)} y="25" width="1.6" height="2" rx="0.8" />
          ))}
          <line x1="12" x2="42" y1="34" y2="34" className="pm-call-cap" />
        </g>
        <text className="pm-label" x={f(lx)} y={f(ly - 8)} textAnchor="middle">CANDIDATE</text>

        {/* résumé upload */}
        <g data-k="resume" className="pm-resume" style={{ opacity: 0 }}>
          <g transform={`translate(${f(resumeHome[0])} ${f(resumeHome[1])})`}>
            <rect x="-14" y="-19" width="28" height="38" rx="1.5" className="pm-sheet" />
            <circle cx="-7" cy="-11" r="3.4" className="pm-sheet-face" />
            {[-12, -9].map((y) => (
              <line key={y} x1="-1" x2="9" y1={y} y2={y} className="pm-sheet-line" />
            ))}
            {[-2, 2.5, 7, 11.5, 15].map((y, i) => (
              <line key={y} x1="-9" x2={[9, 6, 9, 4, 7][i]} y1={y} y2={y} className="pm-sheet-line" />
            ))}
            <line data-k="rscan" x1="-14" x2="14" y1="-19" y2="-19" className="pm-scan" style={{ opacity: 0 }} />
            <text y="30" textAnchor="middle" className="pm-label">RÉSUMÉ</text>
          </g>
        </g>

        {/* AI interviewer service */}
        <Box b={IV.plinth} className="pm-tray" />
        <g data-k="ai" className="pm-ai">
          <Box b={IV.ai} />
          <g transform={onXFace(-37, 18.2, 40)}>
            <rect x="0" y="0" width="34" height="28" className="pm-ai-face" />
            {Array.from({ length: AI_BARS }, (_, i) => (
              <rect key={i} data-k={`aw${i}`} className="pm-ai-bar" x={f(3 + i * 3.4)} y="13" width="2" height="2" rx="1" />
            ))}
          </g>
          {[12, 22, 32].map((z) => (
            <polygon key={z} className="pm-led" data-on={z === 22 ? "1" : "0"} points={pts([[0.2, -16, z], [0.2, -4, z], [0.2, -4, z + 4], [0.2, -16, z + 4]])} />
          ))}
        </g>
        <path d={`M${f(aiTop[0] - 9)} ${f(aiTop[1] - 4)}L${f(ox - 4)} ${f(oy)}L${f(ox + 4)} ${f(oy)}L${f(aiTop[0] + 9)} ${f(aiTop[1] - 4)}Z`} fill={`url(#beam${id})`} />
        <g data-k="orb" className="pm-orb" transform={`translate(${f(ox)} ${f(oy)})`}>
          <circle r="20" className="pm-orb-halo" />
          <g data-k="rings">
            <ellipse rx="17" ry="5.5" className="pm-orb-ring" />
            <ellipse rx="17" ry="5.5" className="pm-orb-ring" transform="rotate(60)" />
            <ellipse rx="17" ry="5.5" className="pm-orb-ring" transform="rotate(120)" />
          </g>
          <circle data-k="orbCore" r="9" fill={`url(#orb${id})`} />
        </g>
        <text className="pm-label" x={f(ix)} y={f(iy + 18)} textAnchor="middle">AI INTERVIEWER</text>
        <text className="pm-label" x={f(wx)} y={f(wy + 16)} textAnchor="middle">WEBSOCKET · LIVE VOICE</text>

        {/* transcript */}
        <g data-k="trans" style={{ opacity: 0.35 }}>
          <Box b={IV.transcript} className="pm-panel-top" />
          {IV.tLines.map((ln, i) => {
            const a = [IV.transcript.x0 + 6, ln.y, IV.transcript.z + IV.transcript.h + 0.1]
            return <line key={i} data-k={`tl${i}`} className={`pm-tline${i % 2 === 0 ? " pm-tline--ai" : ""}`} {...line(a, a)} />
          })}
          <text className="pm-label" x={f(tx)} y={f(ty - 16)} textAnchor="middle">TRANSCRIPT</text>
        </g>

        {/* HR dashboard */}
        <Box b={IV.foot} />
        <Box b={IV.stand} />
        <Box b={IV.monitor} className="pm-dark" />
        <polygon data-k="hr" className="pm-screen" points={IV.hrScreen} />
        <g className="pm-hrui" transform={onXFace(67, 14.3, 67)}>
          <circle cx="15" cy="22" r="9" className="pm-hr-track" />
          <circle data-k="ring" cx="15" cy="22" r="9" className="pm-hr-ring" strokeDasharray={f(RING)} strokeDashoffset={f(RING)} transform="rotate(-90 15 22)" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="31" y={f(12 + i * 6.5)} width="40" height="2.6" rx="1.3" className="pm-hr-bg" />
              <rect data-k={`hb${i}`} x="31" y={f(12 + i * 6.5)} width="0" height="2.6" rx="1.3" className="pm-hr-bar" />
            </g>
          ))}
          <text data-k="match" x="4" y="43" className="pm-hr-match" style={{ opacity: 0 }}>✓ RÉSUMÉ MATCH</text>
        </g>
        <text className="pm-label" x={f(hx)} y={f(hy - 12)} textAnchor="middle">HR DASHBOARD</text>

        <g data-k="pkt" className="pm-pkt" style={{ opacity: 0 }}>
          <circle r="6" className="pm-pkt-halo" />
          <circle r="2.8" />
        </g>
      </g>
    </svg>
  )
}

/* ----------------------------------------------------- Exo-Classifier */

const EX = (() => {
  const star = { x: -182, y: -22, z: 54, r: 19 }
  const orbitR = 46
  const tiltS = 0.37
  const orbitAt = (a) => {
    const dx = Math.cos(a) * orbitR
    const dy = Math.sin(a) * orbitR
    return { p: P(star.x + dx, star.y + dy, star.z + tiltS * (dx + dy)), front: dx + dy > 0 }
  }
  const ringBack = []
  const ringFront = []
  for (let i = 0; i <= 96; i++) {
    const o = orbitAt((i / 96) * Math.PI * 2 + Math.PI / 4)
    ;(o.front ? ringFront : ringBack).push(o.p)
  }
  const pathOf = (list) => list.map((p, i) => `${i ? "L" : "M"}${f(p[0])},${f(p[1])}`).join("")
  const satBody = { x0: -176, y0: 44, w: 12, d: 12, h: 12, z: 18 }
  const satWings = [
    { x0: -173, y0: 24, w: 6, d: 18, h: 1, z: 24 },
    { x0: -173, y0: 58, w: 6, d: 18, h: 1, z: 24 },
  ]
  const panel = { x0: -116, y0: -36, w: 72, d: 5, h: 50, z: 12 }
  const leg = { x0: -84, y0: -35, w: 8, d: 3, h: 12 }
  const foot = { x0: -96, y0: -44, w: 32, d: 18, h: 2 }
  const lcFace = pts([[-113, -30.8, 15], [-47, -30.8, 15], [-47, -30.8, 59], [-113, -30.8, 59]])
  const tray = { x0: -26, y0: -14, w: 74, d: 26, h: 3 }
  const feats = [14, 24, 10, 30, 18, 26, 12, 22, 28, 16, 20].map((h, i) => ({ x0: -22 + i * 6.3, y0: -5, w: 4.2, d: 8, h, z: 3 }))
  const slab = { x0: 82, y0: -40, w: 52, d: 66, h: 4 }
  const trees = [-30, -8, 14].map((y) => ({ x: 85, y, z: 58 }))
  const toPanel = track([[-170, 50, 6], [-170, 50, 2], [-80, 50, 2], [-80, -27, 2]])
  const toTray = track([[-44, -27, 5], [-34, -27, 5], [-34, 0, 5], [-26, 0, 5]])
  const toModel = track([[48, 0, 5], [82, 0, 5]])
  return { star, orbitAt, ringBack: pathOf(ringBack), ringFront: pathOf(ringFront), satBody, satWings, panel, leg, foot, lcFace, tray, feats, slab, trees, toPanel, toTray, toModel }
})()

const EX_PERIOD = 7.4
const T_TRANSIT = 1.2
const CURVE_END = 2.2
const LC = { w: 62, h: 34, x: 2, top: 6 }
/** Each tree's decision path: node ids lit in order. */
const TREE_PATHS = [["r", "a", "a2"], ["r", "b", "b1"], ["r", "a", "a1"]]
const TREE_NODES = { r: [23, 9], a: [11, 25], b: [35, 25], a1: [5, 41], a2: [17, 41], b1: [29, 41], b2: [41, 41] }
const TREE_EDGES = [["r", "a"], ["r", "b"], ["a", "a1"], ["a", "a2"], ["b", "b1"], ["b", "b2"]]

function fluxAt(u) {
  const c = T_TRANSIT / CURVE_END
  const d = Math.abs(u - c)
  const dip = d < 0.07 ? 1 : d < 0.11 ? 1 - (d - 0.07) / 0.04 : 0
  return 1 - dip * 0.55 + Math.sin(u * 61) * 0.035 + Math.sin(u * 157) * 0.025
}

function exoDraw($) {
  const fb = EX.feats.map((_, i) => [$[`f${i}l`], $[`f${i}r`], $[`f${i}t`]])
  const treeEls = EX.trees.map((_, i) => ({
    nodes: Object.fromEntries(Object.keys(TREE_NODES).map((n) => [n, $[`t${i}${n}`]])),
    edges: Object.fromEntries(TREE_EDGES.map(([a, b]) => [a + b, $[`t${i}${a}${b}`]])),
  }))
  let lastK = -1
  return (t, _dt, still) => {
    const fade = 1 - seg(t, 6.9, 7.3)
    // 1. the planet orbits; when it crosses the star the brightness dips
    // the still frame catches the planet mid-transit
    const a = Math.PI / 4 + (still ? 0 : ((t - T_TRANSIT) / EX_PERIOD) * Math.PI * 2)
    const o = EX.orbitAt(a)
    const [sx, sy] = $.starAt
    const dist = Math.hypot(o.p[0] - sx, o.p[1] - sy)
    const depth = o.front ? clamp01((EX.star.r + 4 - dist) / 8) : 0
    $.starBody.style.opacity = String(f(1 - depth * 0.45))
    $.starHalo.style.opacity = String(f(1 - depth * 0.7))
    const host = o.front ? $.planetFront : $.planetBack
    const other = o.front ? $.planetBack : $.planetFront
    host.setAttribute("transform", `translate(${f(o.p[0])} ${f(o.p[1])})`)
    host.style.opacity = "1"
    other.style.opacity = "0"
    // 2. the telescope records the light curve
    const rev = clamp01(t / CURVE_END)
    const n = Math.max(2, Math.round(rev * 60))
    let d = ""
    for (let i = 0; i < n; i++) {
      const u = (i / (n - 1)) * rev
      const x = LC.x + u * LC.w
      const y = LC.top + (1 - fluxAt(u)) * LC.h
      d += `${i ? "L" : "M"}${f(x)},${f(y)}`
    }
    $.curve.setAttribute("d", d)
    $.curve.style.opacity = String(fade)
    $.cursor.setAttribute("transform", `translate(${f(LC.x + rev * LC.w)} 0)`)
    $.cursor.style.opacity = rev < 1 ? "1" : "0"
    $.beam.style.opacity = t < CURVE_END ? "1" : "0.35"
    let p = null
    if (t < CURVE_END) p = EX.toPanel.at((t * 1.6) % 1)
    else if (t < 2.9) p = EX.toTray.at(easeOut(seg(t, 2.2, 2.9)))
    else if (t >= 3.6 && t < 4.2) p = EX.toModel.at(seg(t, 3.6, 4.2))
    $.pkt.style.opacity = p ? "1" : "0"
    if (p) $.pkt.setAttribute("transform", `translate(${f(p[0])} ${f(p[1])})`)
    // 3. eleven stellar and orbital features
    const k = Math.round(easeOut(seg(t, 2.9, 3.6)) * fade * 100) / 100
    if (k !== lastK) {
      lastK = k
      EX.feats.forEach((b, i) => {
        const fc = boxFaces(b.x0, b.y0, b.w, b.d, 1 + (b.h - 1) * k, b.z)
        fb[i][0].setAttribute("points", fc.left)
        fb[i][1].setAttribute("points", fc.right)
        fb[i][2].setAttribute("points", fc.top)
      })
    }
    // 4. XGBoost: each tree walks its decision path
    treeEls.forEach((tr, i) => {
      const path = TREE_PATHS[i]
      path.forEach((nid, j) => {
        const on = t > 4.2 + i * 0.32 + j * 0.12 && fade > 0.5
        tr.nodes[nid].setAttribute("data-on", on ? "1" : "0")
        if (j) tr.edges[path[j - 1] + nid].setAttribute("data-on", on ? "1" : "0")
      })
    })
    const v = seg(t, 5.3, 5.6) * fade
    $.verdict.style.opacity = String(f(v))
    $.verdict.setAttribute("transform", `translate(0 ${f((1 - v) * 6)})`)
  }
}

function ExoMini({ reduce }) {
  const id = useId().replace(/:/g, "")
  const ref = useRef(null)
  const starAt = P(EX.star.x, EX.star.y, EX.star.z)
  const draw = useRef(null)
  if (!draw.current) draw.current = ($) => exoDraw(Object.assign($, { starAt }))
  useLoop(ref, draw.current, { reduce, still: 6.2, period: EX_PERIOD })
  const [sx, sy] = starAt
  const lens = P(-170, 50, 34)
  const [slx, sly] = P(-170, 66, 0)
  const [plx, ply] = P(-80, -36, 62)
  const [flx, fly] = P(11, 12, 0)
  const [mx, my] = P(108, 26, 0)
  const [vx, vy] = P(108, -8, 84)
  return (
    <svg ref={ref} className="pm pm-exo" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Backdrop id={id} tint="#1c0a0d" />
      <defs>
        <radialGradient id={`star${id}`} cx="42%" cy="38%">
          <stop offset="0" stopColor="#fff3ea" />
          <stop offset="0.3" stopColor="#ffb39a" />
          <stop offset="0.7" stopColor="#ff3a44" />
          <stop offset="1" stopColor="#7a0c13" />
        </radialGradient>
        <radialGradient id={`halo${id}`}>
          <stop offset="0.45" stopColor="#ff3a44" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ff3a44" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`planet${id}`} cx="35%" cy="35%">
          <stop offset="0" stopColor="#f4f2ef" />
          <stop offset="1" stopColor="#4a4a52" />
        </radialGradient>
      </defs>
      <g transform="translate(446 342) scale(1.62)">
        {/* data pipes */}
        <path className="pm-pipe" d={EX.toPanel.d} />
        <path className="pm-pipe" d={EX.toTray.d} />
        <path className="pm-pipe" d={EX.toModel.d} />

        {/* star system: the planet's orbit is nearly edge-on, so it transits */}
        <circle data-k="starHalo" cx={f(sx)} cy={f(sy)} r={EX.star.r * 2} fill={`url(#halo${id})`} />
        <path className="pm-orbit pm-orbit--back" d={EX.ringBack} />
        <g data-k="planetBack" style={{ opacity: 0 }}>
          <circle r="5.6" fill={`url(#planet${id})`} />
        </g>
        <circle data-k="starBody" cx={f(sx)} cy={f(sy)} r={EX.star.r} fill={`url(#star${id})`} />
        <path className="pm-orbit" d={EX.ringFront} />
        <g data-k="planetFront" style={{ opacity: 0 }}>
          <circle r="5.6" fill={`url(#planet${id})`} />
        </g>

        {/* space telescope */}
        <line data-k="beam" className="pm-beam" x1={f(lens[0])} y1={f(lens[1])} x2={f(sx)} y2={f(sy + 6)} />
        <Box b={EX.satWings[0]} className="pm-wing" />
        <Box b={EX.satBody} className="pm-sat" />
        <Box b={EX.satWings[1]} className="pm-wing" />
        <line className="pm-lens" x1={f(lens[0] + 2)} y1={f(lens[1] + 9)} x2={f(lens[0])} y2={f(lens[1])} />
        <text className="pm-label" x={f(slx)} y={f(sly + 16)} textAnchor="middle">KEPLER · TESS</text>

        {/* light-curve monitor */}
        <Box b={EX.foot} />
        <Box b={EX.leg} />
        <Box b={EX.panel} className="pm-dark" />
        <polygon className="pm-screen" points={EX.lcFace} />
        <g className="pm-lc" transform={onXFace(-113, -30.7, 59)}>
          {[10, 20, 30].map((y) => (
            <line key={y} x1="2" x2="64" y1={y + 2} y2={y + 2} className="pm-lc-grid" />
          ))}
          <text x="2" y="4.5" className="pm-lc-txt">FLUX</text>
          <path data-k="curve" className="pm-lc-curve" />
          <g data-k="cursor">
            <line x1="0" x2="0" y1="5" y2="42" className="pm-lc-cursor" />
          </g>
        </g>
        <text className="pm-label" x={f(plx)} y={f(ply - 16)} textAnchor="middle">LIGHT CURVE</text>

        {/* eleven features */}
        <Box b={EX.tray} className="pm-tray" />
        {EX.feats.map((b, i) => {
          const fc = boxFaces(b.x0, b.y0, b.w, b.d, 1, b.z)
          return (
            <g key={i} className={i === 3 || i === 8 ? "pm-feat pm-feat--hi" : "pm-feat"}>
              <polygon data-k={`f${i}l`} className="f-left" points={fc.left} />
              <polygon data-k={`f${i}r`} className="f-right" points={fc.right} />
              <polygon data-k={`f${i}t`} className="f-top" points={fc.top} />
            </g>
          )
        })}
        <text className="pm-label" x={f(flx)} y={f(fly + 16)} textAnchor="middle">11 FEATURES</text>

        {/* XGBoost ensemble */}
        <Box b={EX.slab} className="pm-tray" />
        {EX.trees.map((tr, i) => (
          <g key={i} className="pm-tree" transform={onXFace(tr.x, tr.y, tr.z)}>
            <rect x="0" y="0" width="46" height="50" rx="1.5" className="pm-tree-card" />
            {TREE_EDGES.map(([a, b]) => (
              <line key={a + b} data-k={`t${i}${a}${b}`} className="pm-tree-edge" x1={TREE_NODES[a][0]} y1={TREE_NODES[a][1]} x2={TREE_NODES[b][0]} y2={TREE_NODES[b][1]} />
            ))}
            {Object.entries(TREE_NODES).map(([n, [x, y]]) => (
              <circle key={n} data-k={`t${i}${n}`} className="pm-tree-node" cx={x} cy={y} r={n === "r" ? 3.4 : 2.8} />
            ))}
          </g>
        ))}
        <text className="pm-label" x={f(mx)} y={f(my + 16)} textAnchor="middle">XGBOOST</text>
        <g data-k="verdict" className="pm-tag" style={{ opacity: 0 }}>
          <rect x={f(vx - 34)} y={f(vy - 9)} width="68" height="15" rx="2" />
          <text x={f(vx)} y={f(vy + 1.6)} textAnchor="middle">LIKELY PLANET</text>
        </g>

        <g data-k="pkt" className="pm-pkt" style={{ opacity: 0 }}>
          <circle r="6" className="pm-pkt-halo" />
          <circle r="2.8" />
        </g>
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------ export */

const SCENES = { scope: ScopeMini, intervai: IntervaiMini, exo: ExoMini }

function ProjectArtImpl({ kind, label, seed = 0 }) {
  const reduce = !!useReducedMotion()
  const Scene = SCENES[kind]
  if (!Scene) return <Art seed={seed} label={label} />
  return (
    <span className="pm-wrap" role="img" aria-label={label}>
      <Scene reduce={reduce} />
    </span>
  )
}

export const ProjectArt = memo(ProjectArtImpl)
