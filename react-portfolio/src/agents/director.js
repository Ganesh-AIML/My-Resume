/**
 * Agent director — the choreography engine behind the multi-cursor build.
 *
 * Model
 *  - Content elements register as *layers* (see Layer.jsx). While agents are
 *    on, a layer stays hidden until an agent builds it.
 *  - Agents live in page coordinates inside an absolutely positioned overlay,
 *    so scrolling moves them with the content at zero cost.
 *  - One loop drives every agent, tween and trail. It runs inside Framer
 *    Motion's frame batch (frame.update), so Motion's layout reads (useScroll)
 *    happen before this loop's writes and nothing forces a reflow. It
 *    sleeps whenever nothing is moving and wakes on demand.
 *  - Choreography is written as async scripts (`await this.moveTo(...)`).
 *    Every await is driven by the loop's scaled clock, so the speed control
 *    affects everything uniformly. Cancelling resolves all pending awaits and
 *    bumps `gen`; scripts check `ok()` after each await and bail out.
 *
 * Accessibility / safety
 *  - The overlay and trail canvas are `pointer-events: none` + aria-hidden.
 *  - A queued layer is revealed after MAX_WAIT ms even if no agent reached it.
 *  - Keyboard focus inside an unbuilt layer reveals it instantly.
 *  - prefers-reduced-motion or the dock's close button switch agents off and
 *    show everything immediately.
 */
import { frame, cancelFrame } from "motion/react"
import { ROSTER, GLYPHS } from "./roster"

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const rand = (a, b) => a + Math.random() * (b - a)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)

const MAX_WAIT = 1400 // ms a visible layer may stay hidden while queued
const SPEEDS = [1, 2, 0.5]
const STORAGE_KEY = "agents:off"

function readProfile() {
  const w = window.innerWidth
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
  if (w < 720) return { count: 6, concurrency: 3, ambient: 2, pointer: false, trail: 3 }
  if (w < 1100) return { count: 9, concurrency: 4, ambient: 3, pointer: fine, trail: 4 }
  return { count: 14, concurrency: 6, ambient: 5, pointer: fine, trail: 5 }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function storedOff() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export class Director {
  constructor() {
    this.layers = new Map()
    this.seq = 0
    this.listeners = new Set()
    this.agents = []
    this.tweens = new Set()
    this.timers = []
    this.boxes = new Set()
    this.guides = new Map()
    this.stamps = []
    this.t = 0
    this.last = 0
    this.gen = 0
    this.raf = false
    // Cached from scroll/resize events: reading scrollY/innerHeight inside the
    // loop would force a synchronous layout every frame.
    this.win = { sx: 0, sy: 0, w: 0, h: 0 }
    this.sleepTimer = 0
    this.activeTasks = 0
    this.lastSchedule = 0
    this.lastHuddle = 0
    this.finaleDone = false
    this.nextAmbientAt = 0
    this.lastActivity = 0
    this.tourNextAt = 0
    this.pointer = null
    this.mounted = false
    this.reduced = typeof window !== "undefined" && prefersReducedMotion()
    const startOff = typeof window === "undefined" || this.reduced || storedOff()
    this.state = {
      mode: startOff ? "off" : "boot",
      reason: this.reduced ? "reduced-motion" : startOff ? "user" : null,
      agents: 0,
      built: 0,
      total: 0,
      speed: 1,
      touring: false,
      elapsed: 0,
    }
  }

  /* ------------------------------------------------------------------ store */

  subscribe = (fn) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  getSnapshot = () => this.state

  set(patch) {
    this.state = { ...this.state, ...patch }
    this.listeners.forEach((fn) => fn())
  }

  get mode() {
    return this.state.mode
  }

  building() {
    return this.mode === "boot" || this.mode === "intro" || this.mode === "build"
  }

  syncCounts() {
    if (this.countQueued) return
    this.countQueued = true
    queueMicrotask(() => {
      this.countQueued = false
      let built = 0
      for (const l of this.layers.values()) if (l.state === "built") built++
      const total = this.layers.size
      if (built !== this.state.built || total !== this.state.total) this.set({ built, total })
      if (this.mode === "build" && total > 0 && built === total) this.complete()
    })
  }

  /* ----------------------------------------------------------------- layers */

  register(el, opts = {}) {
    const kind = opts.kind || "block"
    const layer = {
      el,
      order: this.seq++,
      kind,
      label: opts.label || defaultLabel(el, kind),
      crew: opts.crew || 1,
      priority: opts.priority ?? (kind === "media" ? 2 : kind === "text" ? 1 : 0),
      finale: !!opts.finale,
      state: "pending",
      inView: false,
      queuedAt: 0,
    }
    this.layers.set(el, layer)
    if (opts.instant || !this.building()) {
      this.markBuilt(layer, false)
    } else {
      el.dataset.state = "pending"
      this.io?.observe(el)
    }
    this.syncCounts()
    return () => {
      this.io?.unobserve(el)
      this.layers.delete(el)
      this.syncCounts()
    }
  }

  markBuilt(layer, animate) {
    if (layer.state === "built") return
    layer.state = "built"
    const el = layer.el
    el.style.clipPath = ""
    el.dataset.state = "built"
    if (animate) {
      el.classList.add("is-settling")
      setTimeout(() => el.classList.remove("is-settling"), 750)
    }
    this.io?.unobserve(el)
    this.syncCounts()
  }

  enqueue(layer) {
    if (layer.state !== "pending") return
    layer.state = "queued"
    layer.queuedAt = performance.now()
    this.wake()
  }

  onIntersect = (entries) => {
    for (const e of entries) {
      const layer = this.layers.get(e.target)
      if (!layer) continue
      layer.inView = e.isIntersecting
      if (e.isIntersecting && this.mode === "build") this.enqueue(layer)
    }
  }

  rect(el) {
    const r = el.getBoundingClientRect()
    if (!r.width && !r.height) return null
    return {
      left: r.left + this.win.sx - this.origin.x,
      top: r.top + this.win.sy - this.origin.y,
      width: r.width,
      height: r.height,
    }
  }

  readWindow = () => {
    this.lastActivity = performance.now()
    this.win.sx = window.scrollX
    this.win.sy = window.scrollY
    this.win.w = window.innerWidth
    this.win.h = window.innerHeight
    // Scrolling may reveal work for the crew; let the loop check.
    if (this.started) this.wake()
  }

  viewport() {
    const w = this.win
    return { x: w.sx - this.origin.x, y: w.sy - this.origin.y, w: w.w, h: w.h }
  }

  /* ------------------------------------------------------------ lifecycle */

  mount(root, canvas) {
    if (this.mounted) return
    this.mounted = true
    this.root = root
    this.canvas = canvas
    document.documentElement.classList.add("agents-ready")
    // Start after the first paint: measuring layout inside the initial render
    // task would force the whole page's first layout synchronously.
    this.startRaf = requestAnimationFrame(() => {
      this.startTimer = setTimeout(this.start, 0)
    })
  }

  start = () => {
    if (!this.mounted) return
    const root = this.root
    this.ctx = this.canvas.getContext("2d")
    this.cfg = readProfile()
    this.measureOrigin()
    this.resizeCanvas()
    this.io = new IntersectionObserver(this.onIntersect, { rootMargin: "0px 0px -6% 0px" })
    for (const l of this.layers.values()) if (l.state !== "built") this.io.observe(l.el)

    window.addEventListener("resize", this.onResize, { passive: true })
    window.addEventListener("scroll", this.readWindow, { passive: true })
    window.addEventListener("pointermove", this.onPointerMove, { passive: true })
    document.addEventListener("focusin", this.onFocusIn)
    this.started = true

    if (this.mode === "off") {
      this.revealAll(false)
      root.hidden = true
      document.documentElement.classList.remove("agents-boot")
      return
    }
    document.documentElement.classList.add("agents-boot")
    this.createAgents()
    this.startIntro()
  }

  destroy() {
    if (!this.mounted) return
    this.mounted = false
    this.started = false
    cancelAnimationFrame(this.startRaf)
    clearTimeout(this.startTimer)
    this.cancelAll()
    cancelFrame(this.tick)
    clearTimeout(this.sleepTimer)
    this.raf = false
    this.io?.disconnect()
    this.io = null
    window.removeEventListener("resize", this.onResize)
    window.removeEventListener("scroll", this.readWindow)
    window.removeEventListener("pointermove", this.onPointerMove)
    document.removeEventListener("focusin", this.onFocusIn)
    this.stopTour()
    this.agents.forEach((a) => a.el.remove())
    this.agents = []
    this.monogram?.remove()
    this.monogram = null
    // Unbuilt layers go back to pending so a remount (StrictMode) restarts cleanly.
    for (const l of this.layers.values()) {
      if (l.state !== "built") {
        l.state = "pending"
        l.el.style.clipPath = ""
        l.el.dataset.state = "pending"
      }
    }
    if (this.mode !== "off") this.set({ mode: "boot" })
  }

  measureOrigin() {
    const r = this.root.getBoundingClientRect()
    this.readWindow()
    this.origin = { x: r.left + this.win.sx, y: r.top + this.win.sy }
  }

  resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.dpr = dpr
    this.canvas.width = Math.round(window.innerWidth * dpr)
    this.canvas.height = Math.round(window.innerHeight * dpr)
  }

  onResize = () => {
    this.readWindow()
    clearTimeout(this.resizeTimer)
    this.resizeTimer = setTimeout(() => {
      this.measureOrigin()
      this.resizeCanvas()
      const prev = this.cfg.count
      this.cfg = { ...readProfile(), count: prev }
    }, 150)
  }

  onFocusIn = (e) => {
    if (!this.building()) return
    const host = e.target.closest?.("[data-layer]")
    if (!host) return
    const layer = this.layers.get(host)
    if (layer && layer.state !== "built") this.markBuilt(layer, false)
  }

  onPointerMove = (e) => {
    if (!this.cfg?.pointer || e.pointerType !== "mouse" || this.mode === "off") return
    const v = this.viewport()
    this.lastActivity = performance.now()
    this.pointer = { x: e.clientX + v.x, y: e.clientY + v.y }
    if (this.pointerQueued) return
    this.pointerQueued = true
    requestAnimationFrame(() => {
      this.pointerQueued = false
      this.repel()
    })
  }

  /* --------------------------------------------------------------- agents */

  createAgents() {
    const n = this.cfg.count
    this.agents = ROSTER.slice(0, n).map((r, i) => {
      const el = document.createElement("div")
      el.className = "agent"
      el.style.setProperty("--c", r.color)
      el.dataset.tool = "arrow"
      el.innerHTML = `${GLYPHS}<span class="agent-tag"></span>`
      this.root.appendChild(el)
      return {
        i,
        name: r.name,
        color: r.color,
        el,
        tagEl: el.querySelector(".agent-tag"),
        x: -100,
        y: -100,
        move: null,
        busy: false,
        token: 0,
        parked: true,
        nextAt: 0,
        nudgedAt: 0,
        lsx: 0,
        lsy: 0,
        cleanup: [],
        tool: "arrow",
      }
    })
    this.agents.forEach((a) => this.setVisible(a, false))
    this.set({ agents: n })
  }

  setTool(a, tool) {
    if (a.tool === tool) return
    a.tool = tool
    a.el.dataset.tool = tool
  }

  setTag(a, text) {
    if (text) {
      a.tagEl.textContent = `${a.name} · ${text}`
      a.el.classList.add("has-tag")
    } else {
      a.el.classList.remove("has-tag")
    }
  }

  setVisible(a, visible) {
    a.parked = !visible
    a.el.style.visibility = visible ? "visible" : "hidden"
  }

  place(a, x, y) {
    a.x = x
    a.y = y
    a.lsx = x
    a.lsy = y
    a.el.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  /** Bring a parked agent in from the viewport edge nearest to (tx, ty). */
  unpark(a, tx, ty) {
    if (!a.parked) return
    const v = this.viewport()
    const fromLeft = tx - v.x < v.w / 2
    this.place(a, fromLeft ? v.x - 30 : v.x + v.w + 30, clamp(ty + rand(-120, 120), v.y + 20, v.y + v.h - 20))
    this.setVisible(a, true)
  }

  park(a) {
    const v = this.viewport()
    const toLeft = a.x - v.x < v.w / 2
    a.busy = "ambient"
    const tok = ++a.token
    this.moveTo(a, toLeft ? v.x - 40 : v.x + v.w + 40, a.y + rand(-80, 80), { dur: 700 }).then(() => {
      if (tok !== a.token) return
      a.busy = false
      this.setVisible(a, false)
    })
  }

  /** Interrupt an agent's ambient routine so it can take real work. */
  preempt(a) {
    a.token++
    a.cleanup.forEach((fn) => fn())
    a.cleanup = []
    if (a.move) {
      const m = a.move
      a.move = null
      m.resolve()
    }
    this.setTag(a, null)
    a.busy = false
  }

  /* ------------------------------------------------------- loop & timing */

  wake() {
    if (!this.mounted || this.mode === "off" || this.raf) return
    clearTimeout(this.sleepTimer)
    this.raf = true
    frame.update(this.tick)
  }

  moveTo(a, tx, ty, opts = {}) {
    if (a.move) a.move.resolve()
    const dist = Math.hypot(tx - a.x, ty - a.y)
    const dur = opts.dur ?? clamp(dist * 0.75 + 240, 320, 950)
    // Quadratic Bézier with a perpendicular control point: a gentle arc, never a ruler line.
    const mx = (a.x + tx) / 2
    const my = (a.y + ty) / 2
    const nx = -(ty - a.y) / (dist || 1)
    const ny = (tx - a.x) / (dist || 1)
    const bend = (opts.arc ?? 0.18) * dist * (Math.random() < 0.5 ? -1 : 1)
    return new Promise((resolve) => {
      a.move = {
        fx: a.x,
        fy: a.y,
        cx: mx + nx * bend,
        cy: my + ny * bend,
        tx,
        ty,
        t0: this.t,
        dur,
        ease: opts.ease || easeInOut,
        resolve,
      }
      this.wake()
    })
  }

  tween(dur, fn) {
    return new Promise((resolve) => {
      this.tweens.add({ t0: this.t, dur, fn, resolve })
      this.wake()
    })
  }

  wait(ms) {
    return new Promise((resolve) => {
      this.timers.push({ at: this.t + ms, resolve })
      this.wake()
    })
  }

  cancelAll() {
    this.gen++
    for (const tw of this.tweens) tw.resolve()
    this.tweens.clear()
    this.timers.forEach((tm) => tm.resolve())
    this.timers = []
    for (const a of this.agents) {
      a.token++
      a.cleanup.forEach((fn) => fn())
      a.cleanup = []
      if (a.move) {
        const m = a.move
        a.move = null
        m.resolve()
      }
      a.busy = false
      this.setTag(a, null)
      this.setTool(a, "arrow")
    }
    this.activeTasks = 0
    for (const b of this.boxes) b.el.remove()
    this.boxes.clear()
    for (const g of this.guides.values()) {
      clearTimeout(g.timer)
      g.els.forEach((el) => el.remove())
    }
    this.guides.clear()
    this.stamps = []
    this.monogram?.remove()
    this.monogram = null
  }

  tick = ({ timestamp: now }) => {
    this.raf = false
    const dt = this.last ? Math.min(now - this.last, 48) : 16
    this.last = now
    this.t += dt * this.state.speed

    // Layout reads (assignment, ambient picks) happen before this frame's writes.
    if (now - this.lastSchedule > 90) {
      this.lastSchedule = now
      this.schedule(now)
    }

    for (const tw of this.tweens) {
      const p = clamp((this.t - tw.t0) / tw.dur, 0, 1)
      tw.fn(p)
      if (p >= 1) {
        this.tweens.delete(tw)
        tw.resolve()
      }
    }
    if (this.timers.length) {
      this.timers = this.timers.filter((tm) => {
        if (this.t >= tm.at) {
          tm.resolve()
          return false
        }
        return true
      })
    }

    let moving = false
    const stampGap = 22
    for (const a of this.agents) {
      const m = a.move
      if (m) {
        const p = clamp((this.t - m.t0) / m.dur, 0, 1)
        const e = m.ease(p)
        const u = 1 - e
        a.x = u * u * m.fx + 2 * u * e * m.cx + e * e * m.tx
        a.y = u * u * m.fy + 2 * u * e * m.cy + e * e * m.ty
        if (p >= 1) {
          a.move = null
          m.resolve()
        }
        moving = true
      }
      if (a.x !== a.rx || a.y !== a.ry) {
        a.rx = a.x
        a.ry = a.y
        a.el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0)`
        if (!a.parked) {
          const d = Math.hypot(a.x - a.lsx, a.y - a.lsy)
          if (d > stampGap) {
            if (d < 220) this.stamps.push({ x: a.x, y: a.y, t: now, c: a.color, tool: a.tool })
            a.lsx = a.x
            a.lsy = a.y
          }
        }
      }
    }
    const cap = this.agents.length * this.cfg.trail
    if (this.stamps.length > cap) this.stamps.splice(0, this.stamps.length - cap)
    this.drawTrails(now)

    const busy =
      moving ||
      this.tweens.size > 0 ||
      this.timers.length > 0 ||
      this.stamps.length > 0 ||
      this.trailsDirty ||
      this.mode === "intro" ||
      this.hasQueued()
    // A wake() during this tick may already have queued the next frame.
    if (this.raf) return
    if (busy) {
      this.raf = true
      frame.update(this.tick)
    } else {
      this.last = 0
      // Sleep until the next ambient action is due.
      this.sleepTimer = setTimeout(() => this.wake(), clamp(this.nextAmbientAt - now, 120, 4000))
    }
  }

  hasQueued() {
    for (const l of this.layers.values()) if (l.state === "queued") return true
    return false
  }

  drawTrails(now) {
    const ctx = this.ctx
    const dpr = this.dpr
    if (!this.stamps.length) {
      if (this.trailsDirty) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.trailsDirty = false
      }
      return
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const v = this.viewport()
    const life = 150
    let alive = 0
    for (const s of this.stamps) {
      const age = (now - s.t) / life
      if (age >= 1) continue
      alive++
      const x = s.x - v.x
      const y = s.y - v.y
      if (y < -20 || y > v.h + 20) continue
      ctx.globalAlpha = 0.42 * (1 - age)
      if (s.tool === "cross") {
        ctx.strokeStyle = s.c
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(x - 4, y)
        ctx.lineTo(x + 4, y)
        ctx.moveTo(x, y - 4)
        ctx.lineTo(x, y + 4)
        ctx.stroke()
      } else if (s.tool === "arrow") {
        ctx.fillStyle = s.c
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + 10, y + 5)
        ctx.lineTo(x + 5.4, y + 6.2)
        ctx.lineTo(x + 3.6, y + 10.6)
        ctx.closePath()
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    if (!alive) this.stamps = []
    this.trailsDirty = true
  }

  /* ------------------------------------------------------- construction */

  box(r, { label, fill = false, inspect = false } = {}) {
    const el = document.createElement("div")
    el.className = `sel${fill ? " sel--fill" : ""}${inspect ? " sel--inspect" : ""}`
    el.style.left = `${r.left}px`
    el.style.top = `${r.top}px`
    el.innerHTML = `<i class="h tl"></i><i class="h tr"></i><i class="h bl"></i><i class="h br"></i><span class="sel-tag"></span>`
    el.querySelector(".sel-tag").textContent = label
      ? `${label} · ${Math.round(r.width)}×${Math.round(r.height)}`
      : `${Math.round(r.width)}×${Math.round(r.height)}`
    this.root.appendChild(el)
    const box = {
      el,
      setSize(w, h) {
        el.style.width = `${w}px`
        el.style.height = `${h}px`
      },
      done: (hold = 250) => {
        setTimeout(() => {
          el.classList.add("is-out")
          setTimeout(() => {
            el.remove()
            this.boxes.delete(box)
          }, 450)
        }, hold / this.state.speed)
      },
    }
    this.boxes.add(box)
    return box
  }

  /** Blueprint guides that frame a section while it is under construction. */
  guide(layer) {
    const sec = layer.el.closest("[data-section]")
    if (!sec) return
    let g = this.guides.get(sec)
    if (!g) {
      const s = this.rect(sec)
      const wrap = sec.querySelector(".wrap")
      const w = wrap ? this.rect(wrap) : s
      if (!s || !w) return
      const top = s.top + Math.min(64, s.height * 0.08)
      const lines = [
        ["h", 0, top, this.root.clientWidth],
        ["v", w.left, s.top, s.height],
        ["v", w.left + w.width, s.top, s.height],
      ].map(([dir, x, y, len]) => {
        const el = document.createElement("div")
        el.className = `guide guide--${dir}`
        el.style.left = `${x}px`
        el.style.top = `${y}px`
        el.style[dir === "h" ? "width" : "height"] = `${len}px`
        this.root.appendChild(el)
        requestAnimationFrame(() => el.classList.add("is-in"))
        return el
      })
      g = { els: lines, timer: 0 }
      this.guides.set(sec, g)
    }
    clearTimeout(g.timer)
    g.timer = setTimeout(() => {
      g.els.forEach((el) => {
        el.classList.add("is-out")
        setTimeout(() => el.remove(), 600)
      })
      this.guides.delete(sec)
    }, 1800 / this.state.speed)
  }

  nearestFree(x, y) {
    let best = null
    let bestScore = Infinity
    for (const a of this.agents) {
      if (a.busy === "task") continue
      let score = a.parked ? 4000 : Math.hypot(a.x - x, a.y - y)
      if (a.busy === "ambient") score += 600
      if (score < bestScore) {
        bestScore = score
        best = a
      }
    }
    if (!best) return null
    if (best.busy === "ambient") this.preempt(best)
    this.unpark(best, x, y)
    best.busy = "task"
    return best
  }

  assign() {
    if (this.mode !== "build" && this.mode !== "done") return
    const now = performance.now()
    const queued = []
    for (const l of this.layers.values()) if (l.state === "queued") queued.push(l)
    if (!queued.length) return
    queued.sort((a, b) => b.priority - a.priority || a.order - b.order)
    for (const layer of queued) {
      if (now - layer.queuedAt > MAX_WAIT / Math.max(this.state.speed, 1)) {
        this.markBuilt(layer, true)
        continue
      }
      if (this.activeTasks >= this.cfg.concurrency) continue
      const r = this.rect(layer.el)
      if (!r) {
        this.markBuilt(layer, false)
        continue
      }
      const lead = this.nearestFree(r.left, r.top)
      if (!lead) continue
      const helpers = []
      for (let i = 1; i < layer.crew; i++) {
        const h = this.nearestFree(r.left, r.top)
        if (h) helpers.push(h)
      }
      this.run(lead, layer, helpers)
    }
  }

  async run(a, layer, helpers) {
    const gen = this.gen
    const ok = () => gen === this.gen && this.mounted
    this.activeTasks++
    layer.state = "building"
    this.guide(layer)
    try {
      if (layer.kind === "text") await this.taskText(a, layer, ok)
      else await this.taskFrame(a, layer, helpers, ok)
    } finally {
      if (ok()) {
        this.activeTasks--
        if (layer.state === "building") this.markBuilt(layer, true)
        for (const h of [a, ...helpers]) {
          h.busy = false
          h.nextAt = performance.now() + rand(300, 1400)
          this.setTag(h, null)
          this.setTool(h, "arrow")
        }
        this.wake()
      }
    }
  }

  async taskText(a, layer, ok) {
    const first = this.rect(layer.el)
    if (!first) return
    await this.moveTo(a, first.left - 4, first.top + first.height / 2)
    if (!ok()) return
    const r = this.rect(layer.el) || first
    this.setTool(a, "text")
    this.setTag(a, "typing")
    const el = layer.el
    el.style.clipPath = "inset(-15% 100% -25% -3%)"
    el.dataset.state = "building"
    const box = this.box(r, { label: layer.label })
    const steps = clamp(Math.round(r.width / 16), 8, 42)
    const dur = clamp(r.width * 1.3, 320, 1100)
    const midY = r.top + r.height / 2
    await this.tween(dur, (p) => {
      const e = Math.ceil(p * steps) / steps
      el.style.clipPath = `inset(-15% ${(1 - e) * 100}% -25% -3%)`
      box.setSize(r.width * e, r.height)
      a.x = r.left + r.width * e + 2
      a.y = midY
    })
    if (!ok()) return
    this.markBuilt(layer, false)
    box.done(220)
    await this.wait(120)
  }

  async taskFrame(a, layer, helpers, ok) {
    const first = this.rect(layer.el)
    if (!first) return
    const arrivals = [this.moveTo(a, first.left, first.top)]
    helpers.forEach((h) => arrivals.push(this.moveTo(h, first.left + rand(-14, 14), first.top + rand(-14, 14))))
    await Promise.all(arrivals)
    if (!ok()) return
    const r = this.rect(layer.el) || first
    const media = layer.kind === "media"
    this.setTool(a, "cross")
    this.setTag(a, media ? "placing image" : "framing")
    helpers.forEach((h, i) => {
      this.setTool(h, "grab")
      if (i === 0) this.setTag(h, "holding")
    })
    const box = this.box(r, { label: layer.label, fill: media })
    const dur = clamp(Math.hypot(r.width, r.height) * 0.8, 360, 950)
    await this.tween(dur, (p) => {
      const e = easeInOut(p)
      const w = Math.max(2, r.width * e)
      const h = Math.max(2, r.height * e)
      box.setSize(w, h)
      a.x = r.left + w
      a.y = r.top + h
      // Helpers hold the other corners while the frame is dragged open.
      const corners = [
        [r.left + w, r.top],
        [r.left, r.top + h],
        [r.left, r.top],
      ]
      helpers.forEach((hp, i) => {
        const c = corners[i % 3]
        hp.x = c[0]
        hp.y = c[1]
      })
    })
    if (!ok()) return
    if (media) {
      layer.el.dataset.state = "building"
      await this.wait(260)
      if (!ok()) return
    }
    this.markBuilt(layer, true)
    box.done(media ? 420 : 200)
    // Helpers let go and drift apart.
    helpers.forEach((h) => {
      const ang = Math.atan2(h.y - (r.top + r.height / 2), h.x - (r.left + r.width / 2))
      this.moveTo(h, h.x + Math.cos(ang) * 60, h.y + Math.sin(ang) * 60, { dur: 420, ease: easeOut })
    })
    await this.wait(160)
  }

  /* -------------------------------------------------------------- intro */

  async startIntro() {
    this.set({ mode: "intro", elapsed: 0 })
    const gen = this.gen
    const ok = () => gen === this.gen && this.mounted
    const v = this.viewport()
    const cx = v.x + v.w / 2
    const cy = v.y + v.h * 0.46

    const mono = document.createElement("div")
    mono.className = "agent-monogram"
    mono.textContent = "G"
    mono.style.left = `${cx}px`
    mono.style.top = `${cy}px`
    this.root.appendChild(mono)
    this.monogram = mono

    const R = Math.min(v.w, 900) * 0.09 + 34
    this.agents.forEach((a, i) => {
      a.cluster = i % 2
      a.phase = rand(-0.45, 0.45)
      a.rr = R + rand(-16, 22)
      this.place(a, a.cluster ? v.x + v.w + 40 : v.x - 40, cy + rand(-180, 180))
      this.setVisible(a, true)
      this.setTool(a, "arrow")
    })
    const orbit = (a, ang) => {
      const base = ang + a.cluster * Math.PI + a.phase
      return [cx + Math.cos(base) * a.rr * 1.35, cy + Math.sin(base) * a.rr * 0.85]
    }

    await Promise.all(
      this.agents.map((a, i) =>
        this.wait(i * 22).then(() => {
          if (!ok()) return
          const [x, y] = orbit(a, 0)
          return this.moveTo(a, x, y, { dur: 620 + rand(0, 160), arc: 0.12 })
        }),
      ),
    )
    if (!ok()) return
    mono.classList.add("is-live")
    await this.tween(950, (p) => {
      const ang = easeInOut(p) * Math.PI * 1.15
      this.agents.forEach((a) => {
        const [x, y] = orbit(a, ang)
        a.x = x
        a.y = y
      })
    })
    if (!ok()) return
    // Layers are measured from here on: make sure web fonts have settled (max 1.2 s extra).
    if (document.fonts?.status !== "loaded") {
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))])
      if (!ok()) return
    }

    // Tool switch + scatter: the cue that construction has started.
    this.agents.forEach((a) => this.setTool(a, "cross"))
    mono.classList.add("is-out")
    setTimeout(() => mono.remove(), 500)
    this.monogram = null
    this.buildStart = performance.now()
    this.set({ mode: "build" })
    for (const l of this.layers.values()) if (l.inView && l.state === "pending") this.enqueue(l)
    this.assign()
    for (const a of this.agents) {
      if (a.busy) continue
      const ang = Math.atan2(a.y - cy, a.x - cx)
      const d = rand(160, Math.min(v.w, v.h) * 0.45)
      a.busy = "ambient"
      const tok = ++a.token
      this.moveTo(a, clamp(cx + Math.cos(ang) * d * 1.6, v.x + 30, v.x + v.w - 30), clamp(cy + Math.sin(ang) * d, v.y + 80, v.y + v.h - 80), {
        dur: 600,
        ease: easeOut,
      }).then(() => {
        if (tok !== a.token) return
        a.busy = false
        this.setTool(a, "arrow")
        a.nextAt = performance.now() + rand(200, 1200)
      })
    }
  }

  /* ------------------------------------------------------------ ambient */

  schedule(now) {
    if (this.mode !== "build" && this.mode !== "done") return
    this.assign()
    this.checkFinale()
    this.ambient(now)
    if (this.state.touring) this.tourStep(now)
  }

  visibleBuiltLayers(maxArea = 0.35) {
    const v = this.viewport()
    const out = []
    for (const l of this.layers.values()) {
      if (l.state !== "built" || !l.inView) continue
      const r = this.rect(l.el)
      if (!r) continue
      if (r.top < v.y + 70 || r.top + r.height > v.y + v.h - 60) continue
      if (r.width * r.height > v.w * v.h * maxArea) continue
      out.push({ l, r })
    }
    return out
  }

  ambient(now) {
    const v = this.viewport()
    const idle = this.activeTasks === 0 && !this.hasQueued()
    const visible = this.agents.filter((a) => !a.parked)
    // After 15 s without scrolling or pointer movement the crew winds down.
    const quiet = now - this.lastActivity > 15000
    const crew = quiet ? Math.min(2, this.cfg.ambient) : this.cfg.ambient
    // Thin the crowd once the visible build is done.
    if (idle && visible.length > crew) {
      const free = visible.filter((a) => !a.busy)
      const cy = v.y + v.h / 2
      free.sort((a, b) => Math.abs(b.y - cy) - Math.abs(a.y - cy))
      free.slice(0, visible.length - crew).forEach((a) => this.park(a))
    }
    // Keep a small crew around when the visitor scrolls somewhere new.
    if (idle && visible.length < crew) {
      const a = this.agents.find((x) => x.parked && !x.busy)
      if (a) this.unpark(a, v.x + rand(0, v.w), v.y + v.h / 2)
    }
    // Agents take turns: one ambient action at a time with a pause between.
    // Overlapping wanders would keep the loop (and the GPU) busy every frame.
    if (now < this.nextAmbientAt) return
    if (this.agents.some((a) => a.busy === "ambient" || (!a.parked && a.move))) return
    this.nextAmbientAt = now + (quiet ? rand(6000, 11000) : rand(1500, 3400))
    const pool = this.agents.filter((a) => !a.parked && !a.busy)
    if (!pool.length) return
    const a = pool[Math.floor(Math.random() * pool.length)]
    const off = a.y < v.y - 30 || a.y > v.y + v.h + 30
    if (off) {
      this.place(a, a.x < v.x + v.w / 2 ? v.x - 30 : v.x + v.w + 30, clamp(a.y, v.y - 30, v.y + v.h + 30))
      this.wander(a)
      return
    }
    const roll = Math.random()
    if (roll < 0.35) this.inspect(a)
    else if (roll < 0.5 && now - this.lastHuddle > 12000) this.huddle(a, now)
    else this.wander(a)
  }

  wander(a) {
    // A local drift (not a cross-screen trip) keeps each ambient turn short.
    const v = this.viewport()
    const inView = a.y > v.y && a.y < v.y + v.h
    let x = clamp((inView ? a.x : v.x + v.w / 2) + rand(-0.28, 0.28) * v.w, v.x + v.w * 0.06, v.x + v.w * 0.94)
    let y = clamp((inView ? a.y : v.y + v.h / 2) + rand(-0.25, 0.25) * v.h, v.y + v.h * 0.14, v.y + v.h * 0.86)
    if (this.pointer && Math.hypot(this.pointer.x - x, this.pointer.y - y) < 140) {
      x = v.x + v.w - (x - v.x)
    }
    this.moveTo(a, x, y, { dur: clamp(Math.hypot(x - a.x, y - a.y) * 1.2 + 260, 600, 1300), arc: 0.25 })
  }

  async inspect(a) {
    const pool = this.visibleBuiltLayers()
    if (!pool.length) return this.wander(a)
    const { l, r } = pool[Math.floor(Math.random() * pool.length)]
    a.busy = "ambient"
    const tok = ++a.token
    const ok = () => tok === a.token && this.mounted
    await this.moveTo(a, r.left - 6, r.top - 6)
    if (!ok()) return
    this.setTool(a, "cross")
    this.setTag(a, "inspecting")
    const box = this.box(r, { label: l.label, inspect: true })
    a.cleanup.push(() => box.done(0))
    await this.tween(380, (p) => {
      const e = easeInOut(p)
      box.setSize(r.width * e, r.height * e)
      a.x = r.left + r.width * e
      a.y = r.top + r.height * e
    })
    if (!ok()) return
    this.setTool(a, "arrow")
    await this.wait(900)
    if (!ok()) return
    a.cleanup = []
    box.done(0)
    this.setTag(a, null)
    a.busy = false
    this.wander(a)
  }

  async huddle(a, now) {
    const pool = this.visibleBuiltLayers(0.2)
    const crew = [a, ...this.agents.filter((x) => x !== a && !x.parked && !x.busy)].slice(0, 3)
    if (!pool.length || crew.length < 3) return this.wander(a)
    this.lastHuddle = now
    const { r } = pool[Math.floor(Math.random() * pool.length)]
    const spots = [
      [r.left - 18, r.top - 14],
      [r.left + r.width + 10, r.top + r.height * 0.3],
      [r.left + r.width * 0.45, r.top + r.height + 14],
    ]
    const toks = crew.map((m) => {
      m.busy = "ambient"
      return ++m.token
    })
    const live = () => this.mounted && crew.every((m, i) => toks[i] === m.token)
    await Promise.all(crew.map((m, i) => this.moveTo(m, spots[i][0], spots[i][1], { arc: 0.3 })))
    if (!live()) return
    this.setTag(crew[0], "reviewing")
    await this.wait(1500)
    crew.forEach((m, i) => {
      if (toks[i] !== m.token) return
      this.setTag(m, null)
      m.busy = false
      m.nextAt = performance.now() + rand(400, 1600)
      this.wander(m)
    })
  }

  repel() {
    const p = this.pointer
    if (!p) return
    const now = performance.now()
    for (const a of this.agents) {
      if (a.parked || a.busy === "task" || now - a.nudgedAt < 500) continue
      const dx = a.x - p.x
      const dy = a.y - p.y
      const d = Math.hypot(dx, dy)
      if (d > 70) continue
      a.nudgedAt = now
      if (a.busy === "ambient") this.preempt(a)
      const k = (110 - d) / (d || 1)
      this.moveTo(a, a.x + dx * k, a.y + dy * k, { dur: 420, arc: 0.1, ease: easeOut })
      a.nextAt = now + rand(900, 2000)
    }
  }

  /* ---------------------------------------------------------- call-outs */

  /**
   * Public hook for live scenes (the S.C.O.P.E. diorama): send one free agent
   * to a point and have it say something there. getPoint() returns viewport
   * coordinates and is re-read while the agent holds, so a pinned scene keeps
   * its agent in place as the page scrolls. Returns false when nobody can go.
   */
  async callout(getPoint, text, hold = 2200) {
    if (!this.started || (this.mode !== "done" && this.mode !== "build")) return false
    if (this.activeTasks > 0 || this.state.touring) return false
    const toPage = () => {
      const p = getPoint()
      if (!p) return null
      const v = this.viewport()
      return { x: p.x + v.x + 4, y: p.y + v.y + 4 }
    }
    const target = toPage()
    if (!target) return false
    const pool = this.agents.filter((x) => !x.busy)
    if (!pool.length) return false
    pool.sort((p, q) => p.parked - q.parked || Math.hypot(p.x - target.x, p.y - target.y) - Math.hypot(q.x - target.x, q.y - target.y))
    const a = pool[0]
    if (a.parked) this.unpark(a, target.x, target.y)
    a.busy = "ambient"
    const tok = ++a.token
    const ok = () => tok === a.token && this.mounted
    this.lastActivity = performance.now()
    await this.moveTo(a, target.x, target.y, { arc: 0.22 })
    if (!ok()) return true
    this.setTag(a, text)
    await this.tween(hold, () => {
      if (!ok()) return
      const p = toPage()
      if (p) {
        a.x = p.x
        a.y = p.y
      }
    })
    if (!ok()) return true
    this.setTag(a, null)
    a.busy = false
    this.nextAmbientAt = performance.now() + 1500
    this.wander(a)
    return true
  }

  /* ------------------------------------------------------------- finale */

  checkFinale() {
    if (this.finaleDone || this.activeTasks > 0) return
    for (const l of this.layers.values()) {
      if (l.finale && l.state === "built" && l.inView) {
        const r = this.rect(l.el)
        const v = this.viewport()
        const mid = r ? r.top + r.height / 2 : 0
        if (r && mid > v.y + v.h * 0.2 && mid < v.y + v.h * 0.75) {
          this.finaleDone = true
          this.finale(r)
        }
        return
      }
    }
  }

  async finale(r) {
    const gen = this.gen
    const crew = this.agents
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const rx = r.width / 2 + 28
    const ry = r.height / 2 + 26
    const toks = crew.map((a) => {
      if (a.busy === "ambient") this.preempt(a)
      a.busy = "ambient"
      if (a.parked) this.unpark(a, cx, cy)
      this.setTool(a, "arrow")
      return ++a.token
    })
    const live = (a, i) => gen === this.gen && toks[i] === a.token
    const n = crew.length
    const at = (i, spin, breathe) => {
      const ang = (i / n) * Math.PI * 2 + spin
      return [cx + Math.cos(ang) * rx * breathe, cy + Math.sin(ang) * ry * breathe]
    }
    await Promise.all(
      crew.map((a, i) => {
        const [x, y] = at(i, 0, 1)
        return this.wait(i * 30).then(() => this.moveTo(a, x, y, { arc: 0.22 }))
      }),
    )
    if (gen !== this.gen) return
    // Crew sign-off: every agent shows its name while the ring breathes.
    crew.forEach((a, i) => {
      if (!live(a, i)) return
      a.tagEl.textContent = a.name
      a.el.classList.add("has-tag")
    })
    await this.tween(2400, (p) => {
      const spin = easeInOut(p) * 0.9
      const breathe = 1 + Math.sin(p * Math.PI) * 0.06
      crew.forEach((a, i) => {
        if (!live(a, i)) return
        const [x, y] = at(i, spin, breathe)
        a.x = x
        a.y = y
      })
    })
    crew.forEach((a, i) => {
      if (!live(a, i)) return
      this.setTag(a, null)
      a.busy = false
      a.nextAt = performance.now() + rand(0, 900)
      const ang = Math.atan2(a.y - cy, a.x - cx)
      this.moveTo(a, a.x + Math.cos(ang) * 160, a.y + Math.sin(ang) * 120, { dur: 700, ease: easeOut })
    })
  }

  /* -------------------------------------------------------------- tour */

  tourStep(now) {
    if (now < this.tourNextAt || this.activeTasks > 0 || this.hasQueued()) return
    const v = this.viewport()
    const secs = [...document.querySelectorAll("[data-section]")]
    const next = secs.find((s) => this.rect(s) && this.rect(s).top > v.y + 40)
    if (!next) {
      this.stopTour()
      return
    }
    this.tourNextAt = now + 2600 / this.state.speed
    const top = next.getBoundingClientRect().top + window.scrollY - 40
    this.programmaticScroll = true
    window.scrollTo({ top, behavior: "smooth" })
  }

  onUserScrollIntent = (e) => {
    if (e.type === "keydown" && !["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key)) return
    this.stopTour()
  }

  startTour() {
    if (this.mode !== "build") return
    this.set({ touring: true })
    this.tourNextAt = 0
    window.addEventListener("wheel", this.onUserScrollIntent, { passive: true })
    window.addEventListener("touchstart", this.onUserScrollIntent, { passive: true })
    window.addEventListener("keydown", this.onUserScrollIntent)
    this.wake()
  }

  stopTour() {
    if (this.state.touring) this.set({ touring: false })
    window.removeEventListener("wheel", this.onUserScrollIntent)
    window.removeEventListener("touchstart", this.onUserScrollIntent)
    window.removeEventListener("keydown", this.onUserScrollIntent)
  }

  /* ---------------------------------------------------------- controls */

  toggleTour = () => (this.state.touring ? this.stopTour() : this.startTour())

  cycleSpeed = () => {
    const i = SPEEDS.indexOf(this.state.speed)
    this.set({ speed: SPEEDS[(i + 1) % SPEEDS.length] })
  }

  revealAll(animate) {
    let i = 0
    for (const l of this.layers.values()) {
      if (l.state === "built") continue
      if (animate && l.inView) {
        const layer = l
        setTimeout(() => this.markBuilt(layer, true), Math.min(i++ * 30, 600))
      } else {
        this.markBuilt(l, false)
      }
    }
  }

  complete() {
    if (this.mode !== "build") return
    this.stopTour()
    this.set({ mode: "done", elapsed: (performance.now() - this.buildStart) / 1000 })
    // Let any staggered reveals finish before un-hiding the remaining layers.
    setTimeout(() => {
      if (this.mode === "done") document.documentElement.classList.remove("agents-boot")
    }, 900)
  }

  skip = () => {
    if (this.mode === "off" || this.mode === "done") return
    if (!this.buildStart) this.buildStart = performance.now()
    this.cancelAll()
    this.revealAll(true)
    this.agents.forEach((a) => {
      if (a.parked) return
      a.nextAt = performance.now() + rand(0, 800)
    })
    this.set({ mode: "build" })
    this.complete()
    this.wake()
  }

  replay = () => {
    if (!this.mounted) return
    this.cancelAll()
    this.stopTour()
    this.finaleDone = false
    document.documentElement.classList.add("agents-boot")
    for (const l of this.layers.values()) {
      l.state = "pending"
      l.el.style.clipPath = ""
      l.el.dataset.state = "pending"
      this.io.observe(l.el)
    }
    this.syncCounts()
    this.startIntro()
  }

  turnOff = () => {
    this.cancelAll()
    this.stopTour()
    this.revealAll(false)
    cancelFrame(this.tick)
    clearTimeout(this.sleepTimer)
    this.raf = false
    this.agents.forEach((a) => this.setVisible(a, false))
    this.drawTrails(performance.now())
    if (this.root) this.root.hidden = true
    document.documentElement.classList.remove("agents-boot")
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      /* storage unavailable: preference lasts for this page view */
    }
    this.set({ mode: "off", reason: "user", touring: false })
  }

  turnOn = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    if (!this.mounted) return
    if (!this.started) {
      // start() has not run yet; it will begin the intro now that mode is no longer "off".
      this.set({ mode: "boot", reason: null })
      return
    }
    this.root.hidden = false
    if (!this.agents.length) this.createAgents()
    this.set({ mode: "boot", reason: null })
    this.replay()
  }
}

function defaultLabel(el, kind) {
  if (kind === "media") return "Image"
  const tag = el.tagName.toLowerCase()
  if (/^h[1-6]$/.test(tag)) return "Heading"
  if (tag === "p") return "Text"
  if (tag === "li") return "Row"
  return "Frame"
}
