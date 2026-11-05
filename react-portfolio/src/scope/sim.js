/**
 * S.C.O.P.E. peak-hour simulation.
 *
 * Plain JS, no React: a world laid out in isometric space plus a small
 * discrete-event model of the submission path
 *   exam hall → Express API → Nginx (least-conn) → Redis queue → Judge0 cluster → results.
 *
 * The architecture (10 nodes × 4 workers, the queue, least-connection routing,
 * 1,000+ students) is the real system. Traffic is ILLUSTRATIVE: every dot is a
 * scaled-down run, and rates are chosen to show behaviour, not measured.
 */

/* ------------------------------------------------------------ projection */

const ANGLE = (26 * Math.PI) / 180
const CA = Math.cos(ANGLE)
const SA = Math.sin(ANGLE)

/** World (x, y on the ground, z up) → screen. */
export function iso(x, y, z = 0) {
  return [(x - y) * CA, (x + y) * SA - z]
}

const pts = (list) => list.map((p) => iso(...p).map((n) => n.toFixed(1)).join(",")).join(" ")

/** The three visible faces of an axis-aligned box. */
export function boxFaces(x0, y0, w, d, h, z = 0) {
  const x1 = x0 + w
  const y1 = y0 + d
  const t = z + h
  return {
    top: pts([[x0, y0, t], [x1, y0, t], [x1, y1, t], [x0, y1, t]]),
    right: pts([[x1, y0, z], [x1, y1, z], [x1, y1, t], [x1, y0, t]]),
    left: pts([[x0, y1, z], [x1, y1, z], [x1, y1, t], [x0, y1, t]]),
  }
}

/** A vertical cylinder (PostgreSQL). */
export function cylinder(cx, cy, r, h) {
  const [bx, by] = iso(cx, cy, 0)
  const [, ty] = iso(cx, cy, h)
  const rx = Math.SQRT2 * CA * r
  const ry = Math.SQRT2 * SA * r
  return {
    body: `M${bx - rx},${ty} L${bx - rx},${by} A${rx},${ry} 0 0 0 ${bx + rx},${by} L${bx + rx},${ty} Z`,
    top: { cx: bx, cy: ty, rx, ry },
  }
}

/* ---------------------------------------------------------------- world */

export const NODES = 10
export const WORKERS = 4
const FLY = 16 // packet flight height

const hall = { x0: -210, y0: -116, w: 170, d: 232, h: 6 }
export const terminals = []
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 6; j++) {
    terminals.push({ x: -192 + i * 30, y: -100 + j * 38, w: 16, d: 18, h: 9 })
  }
}

export const world = {
  hall,
  api: { x: 36, y: -28, w: 56, d: 56, h: 54, cx: 64, cy: 0 },
  pg: { cx: 64, cy: -120, r: 22, h: 34 },
  lb: { x: 170, y: -22, w: 44, d: 44, h: 30, cx: 192, cy: 0 },
  queue: { x: 268, y: -26, w: 172, d: 52, h: 5 },
  nodes: Array.from({ length: NODES }, (_, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const cx = 530 + col * 74
    const cy = -152 + row * 76
    return { i, cx, cy, x: cx - 23, y: cy - 23, w: 46, d: 46, h: 62 }
  }),
  returnY: 214,
}

/** Queue slots, head first (nearest the cluster). */
export const QUEUE_SLOTS = 28
export const queueSlots = Array.from({ length: QUEUE_SLOTS }, (_, i) => {
  const lane = i % 2
  const k = Math.floor(i / 2)
  return { x: 424 - k * 11.5, y: lane ? 9 : -9 }
})

/** Worker LEDs on each node's top face (2 × 2). */
export function ledFaces(node, w) {
  const ox = node.x + 7 + (w % 2) * 18
  const oy = node.y + 7 + Math.floor(w / 2) * 18
  return boxFaces(ox, oy, 14, 14, 2, node.h).top
}

/** Points used for labels and agent call-outs (world → screen via iso). */
export const anchors = {
  hall: [-125, -116, 34],
  api: [64, -28, 60],
  pg: [86, -120, 30],
  lb: [192, -22, 34],
  queue: [356, -26, 8],
  cluster: [567, -175, 104],
  results: [90, world.returnY + 56, 0],
}

/** viewBox covering everything, with a margin. */
export function bounds(margin = 26) {
  const all = []
  const add = (x, y, z = 0) => all.push(iso(x, y, z))
  add(hall.x0, hall.y0)
  add(hall.x0 + hall.w, hall.y0)
  add(hall.x0, hall.y0 + hall.d)
  add(hall.x0 + hall.w, world.returnY + 6)
  add(world.pg.cx, world.pg.cy - 30, 60)
  for (const n of world.nodes) {
    add(n.x, n.y, n.h)
    add(n.x + n.w, n.y + n.d)
    add(n.x + n.w, n.y, n.h)
  }
  add(640, world.returnY + 6)
  const xs = all.map((p) => p[0])
  const ys = all.map((p) => p[1])
  const x = Math.min(...xs) - margin
  const y = Math.min(...ys) - margin - 20
  return { x, y, w: Math.max(...xs) - x + margin, h: Math.max(...ys) - y + margin }
}

/* ------------------------------------------------------------- scenario */

/** Exam timeline, in minutes from 09:55 to 10:45. */
export const TIMELINE_MIN = 50
const smooth = (a, b, t) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

export function clockLabel(min) {
  const total = 9 * 60 + 55 + Math.floor(min)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

/** Students online and run load (1 = full cluster capacity) at a timeline minute. */
export function scenario(min) {
  const students = Math.round(1000 * smooth(0, 5, min))
  let load = 0
  let phase = "signin"
  if (min >= 5) {
    phase = "live"
    load = 0.45
  }
  if (min >= 28) {
    phase = "rush"
    load = 0.45 + 0.67 * smooth(28, 33, min)
  }
  if (min >= 41) {
    phase = "drain"
    load = 1.12 * (1 - smooth(41, 44, min))
  }
  if (min >= 45) {
    phase = "closed"
    load = 0
  }
  return { students, load, phase, login: min < 5 ? students : 0 }
}

/** Load test: base run load for a given number of students (submission waves come on top). */
export const loadFor = (students) => (students / 1200) * 0.8

/* ------------------------------------------------------------------ sim */

const JOB_MIN = 1.4
const JOB_MAX = 2.4
const CAPACITY = (NODES * WORKERS) / ((JOB_MIN + JOB_MAX) / 2 + 0.45) // runs per second at load 1 (job + flight)
const SPEED = { run: 250, dispatch: 460, result: 520, auth: 300, db: 260 }
export const MAX_PACKETS = 170

const rand = (a, b) => a + Math.random() * (b - a)

function makePath(points) {
  const lens = []
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1]
    const [bx, by] = points[i]
    const l = Math.hypot(bx - ax, by - ay)
    lens.push(l)
    total += l
  }
  return { points, lens, total }
}

function at(path, d) {
  const { points, lens } = path
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const k = lens[i] ? Math.min(1, d / lens[i]) : 1
      const [ax, ay, az] = points[i]
      const [bx, by, bz] = points[i + 1]
      return [ax + (bx - ax) * k, ay + (by - ay) * k, az + (bz - az) * k]
    }
    d -= lens[i]
  }
  return points[points.length - 1]
}

export class Sim {
  constructor() {
    this.students = 0
    this.load = 0
    this.phase = "signin"
    this.login = 0
    this.queueOn = true
    this.alive = Array(NODES).fill(true)
    this.workers = Array.from({ length: NODES }, () => Array(WORKERS).fill(0)) // 0 = idle, else seconds left
    this.queue = 0
    this.packets = []
    this.graded = 0
    this.dropped = 0
    this.acc = 0
    this.accAuth = 0
    this.syncT = 0
    this.waves = false // load test: submissions arrive in waves
    this.waveT = 0
    this.events = [] // { type, ... } drained by the view each frame
    this.drops = [] // recent drop positions for the view
  }

  get busy() {
    let n = 0
    for (let i = 0; i < NODES; i++) if (this.alive[i]) for (const w of this.workers[i]) if (w !== 0) n++
    return n
  }

  get capacity() {
    return this.alive.filter(Boolean).length * WORKERS
  }

  emit(e) {
    this.events.push(e)
  }

  /** Least-connection pick: the live node with the fewest busy workers. */
  pickNode() {
    let best = -1
    let bestBusy = Infinity
    const start = Math.floor(Math.random() * NODES)
    for (let k = 0; k < NODES; k++) {
      const i = (start + k) % NODES
      if (!this.alive[i]) continue
      const b = this.workers[i].filter((w) => w !== 0).length
      if (b < WORKERS && b < bestBusy) {
        best = i
        bestBusy = b
      }
    }
    return best
  }

  spawn(kind, path, extra = {}) {
    if (this.packets.length >= MAX_PACKETS) return null
    const p = { kind, path, d: 0, speed: SPEED[kind], ...extra }
    this.packets.push(p)
    return p
  }

  litTerminals() {
    return Math.min(terminals.length, Math.ceil((this.students / 1000) * (terminals.length - 2)))
  }

  terminalPoint() {
    const lit = Math.max(1, this.litTerminals())
    const t = terminals[Math.floor(Math.random() * lit)]
    return [t.x + t.w / 2, t.y + t.d / 2, FLY]
  }

  /** A run travels from a terminal to the queue entrance. */
  spawnRun() {
    const from = this.terminalPoint()
    const { api, lb } = world
    const p = this.spawn(
      "run",
      makePath([from, [-34, from[1] * 0.25, FLY], [api.cx, api.cy, FLY], [lb.cx, lb.cy, FLY], [268, 0, FLY]]),
      { stage: "toQueue" },
    )
    if (!p) this.arriveAtQueue()
  }

  spawnAuth() {
    const from = this.terminalPoint()
    const { api } = world
    this.spawn("auth", makePath([from, [-34, from[1] * 0.25, FLY], [api.cx, api.cy, FLY], [-34, -from[1] * 0.1, FLY], from]))
  }

  dispatch(fromQueue) {
    const i = this.pickNode()
    if (i < 0) return false
    const w = this.workers[i].findIndex((x) => x === 0)
    this.workers[i][w] = -1 // reserved while the run flies to the node
    const n = world.nodes[i]
    const start = fromQueue ? [queueSlots[0].x, 0, FLY] : [268, 0, FLY]
    const p = this.spawn("run", makePath([start, [440, 0, FLY], [480, n.cy, FLY], [n.cx, n.cy, n.h + 6]]), { stage: "toNode", node: i, worker: w, speed: SPEED.dispatch })
    if (!p) this.workers[i][w] = rand(JOB_MIN, JOB_MAX) // over the visual cap: skip the flight
    return true
  }

  arriveAtQueue() {
    if (this.queue === 0 && this.dispatch(false)) return
    if (this.queueOn) {
      this.queue++
    } else {
      this.dropped++
      this.drops.push({ x: 268, y: rand(-14, 14), t: 0.8 })
      this.emit({ type: "drop" })
    }
  }

  /** A run lost its worker (node taken down): requeue it, or drop it without a queue. */
  lose(n = 1) {
    if (this.queueOn) this.queue += n
    else {
      this.dropped += n
      for (let k = 0; k < n; k++) this.drops.push({ x: 440, y: rand(-14, 14), t: 0.8 })
      this.emit({ type: "drop" })
    }
  }

  /** Turning the queue off loses whatever it was holding. */
  setQueue(on) {
    if (this.queueOn === on) return
    this.queueOn = on
    if (!on && this.queue > 0) {
      this.dropped += this.queue
      for (let k = 0; k < Math.min(this.queue, 12); k++) this.drops.push({ x: rand(300, 430), y: rand(-14, 14), t: 0.9 })
      this.queue = 0
      this.emit({ type: "drop" })
    }
  }

  setAlive(i, on) {
    if (this.alive[i] === on) return
    this.alive[i] = on
    if (!on) {
      const lost = this.workers[i].filter((w) => w > 0).length
      this.workers[i] = this.workers[i].map((w) => (w === -1 ? -1 : 0))
      if (lost) this.lose(lost)
    }
    this.emit({ type: on ? "node-up" : "node-down", node: i })
  }

  step(dt) {
    // Arrivals (in a load test, a 4 s wave every 12 s)
    let mult = 1
    if (this.waves) {
      this.waveT = (this.waveT + dt) % 12
      mult = this.waveT < 4 ? 1.6 : 0.82
    }
    this.wave = mult > 1
    this.acc += this.load * mult * CAPACITY * dt
    while (this.acc >= 1) {
      this.acc -= 1
      this.spawnRun()
    }
    this.accAuth += (this.login / 1000) * 9 * dt
    while (this.accAuth >= 1) {
      this.accAuth -= 1
      this.spawnAuth()
    }

    // Workers
    for (let i = 0; i < NODES; i++) {
      if (!this.alive[i]) continue
      const ws = this.workers[i]
      for (let w = 0; w < WORKERS; w++) {
        if (ws[w] <= 0) continue
        ws[w] -= dt
        if (ws[w] <= 0) {
          ws[w] = 0
          this.graded++
          const n = world.nodes[i]
          this.spawn(
            "result",
            makePath([[n.cx, n.cy, n.h + 6], [n.cx, world.returnY, FLY], [-110, world.returnY, FLY], [-110, 104, FLY]]),
          )
        }
      }
    }

    // Queue → free workers
    while (this.queue > 0 && this.dispatch(true)) this.queue--

    // Packets
    const keep = []
    for (const p of this.packets) {
      p.d += p.speed * dt
      if (p.d < p.path.total) {
        keep.push(p)
        continue
      }
      if (p.kind === "run" && p.stage === "toQueue") this.arriveAtQueue()
      else if (p.kind === "run" && p.stage === "toNode") {
        if (this.alive[p.node]) {
          this.workers[p.node][p.worker] = rand(JOB_MIN, JOB_MAX)
          if (Math.random() < 0.18) {
            const { api, pg } = world
            this.spawn("db", makePath([[api.cx, api.cy, 40], [pg.cx, pg.cy, 30]]))
          }
        } else {
          this.workers[p.node][p.worker] = 0
          this.lose(1)
        }
      }
    }
    this.packets = keep

    for (const d of this.drops) d.t -= dt
    this.drops = this.drops.filter((d) => d.t > 0)

    // Socket.io clock sync pulse
    this.syncT += dt
    let pulse = false
    if (this.syncT > 4.5) {
      this.syncT = 0
      pulse = this.students > 0
    }
    return pulse
  }

  /** Position of every packet, projected. */
  positions(out) {
    let n = 0
    for (const p of this.packets) {
      const [x, y, z] = at(p.path, p.d)
      const [sx, sy] = iso(x, y, z)
      out[n++] = { sx, sy, kind: p.kind }
    }
    return n
  }

  /** A fixed, plausible snapshot for reduced motion. */
  static snapshot() {
    const s = new Sim()
    s.students = 1000
    s.queue = 9
    s.workers = s.workers.map((ws, i) => ws.map((_, w) => ((i + w) % 5 === 0 ? 0 : 1)))
    return s
  }
}
