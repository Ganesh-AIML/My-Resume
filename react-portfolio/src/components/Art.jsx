import { memo, useId } from "react"

/**
 * Generated placeholder artwork for project previews (inline SVG, no network).
 * Seven data-flavoured motifs — radar, waveform, graph, contours, dot field,
 * monogram, regression — so each slot has its own composition until real
 * project imagery is integrated.
 */
function rng(seed) {
  let a = seed * 9973 + 1
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const W = 800
const H = 600
const SODIUM = "#e3242f"
const BLUE = "#8a8a96"
const PAPER = "#e9edf7"

function Radar({ r }) {
  const cx = 470
  const cy = 300
  return (
    <g fill="none">
      {[60, 120, 180, 240, 300].map((rad) => (
        <circle key={rad} cx={cx} cy={cy} r={rad} stroke={PAPER} strokeOpacity="0.12" />
      ))}
      <path d={`M${cx} ${cy} L${cx + 300} ${cy - 120} A320 320 0 0 1 ${cx + 300} ${cy + 60} Z`} fill={SODIUM} fillOpacity="0.16" />
      <line x1={cx} y1={cy} x2={cx + 300} y2={cy - 120} stroke={SODIUM} strokeWidth="2" />
      {Array.from({ length: 14 }, (_, i) => {
        const a = r() * Math.PI * 2
        const d = 40 + r() * 260
        return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={2 + r() * 4} fill={i % 4 ? PAPER : SODIUM} fillOpacity={i % 4 ? 0.5 : 0.95} />
      })}
    </g>
  )
}

function Wave({ r }) {
  const n = 46
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const h = 40 + Math.abs(Math.sin(i * 0.33 + r() * 0.6)) * 300 * (0.5 + r() * 0.5)
        const x = 40 + i * ((W - 80) / n)
        return <rect key={i} x={x} y={H / 2 - h / 2} width="7" height={h} rx="3.5" fill={i > 30 && i < 36 ? SODIUM : PAPER} fillOpacity={i > 30 && i < 36 ? 0.95 : 0.22} />
      })}
      <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke={BLUE} strokeOpacity="0.6" />
    </g>
  )
}

function Graph({ r }) {
  const nodes = Array.from({ length: 16 }, () => [80 + r() * 640, 70 + r() * 460, 3 + r() * 9])
  const edges = []
  nodes.forEach((a, i) => {
    nodes.forEach((b, j) => {
      if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 210) edges.push([a, b])
    })
  })
  return (
    <g>
      {edges.map(([a, b], i) => (
        <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={i % 7 ? PAPER : SODIUM} strokeOpacity={i % 7 ? 0.16 : 0.8} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n[0]} cy={n[1]} r={n[2]} fill={i === 3 ? SODIUM : "#0e0e11"} stroke={i === 3 ? SODIUM : PAPER} strokeOpacity="0.6" />
      ))}
    </g>
  )
}

function Contours({ r }) {
  const off = r() * 10
  return (
    <g fill="none">
      {Array.from({ length: 13 }, (_, k) => {
        let d = ""
        for (let i = 0; i <= 40; i++) {
          const x = (i / 40) * W
          const y = 80 + k * 36 + Math.sin(i * 0.28 + off + k * 0.4) * (20 + k * 2) + Math.sin(i * 0.11 + k) * 18
          d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`
        }
        return <path key={k} d={d} stroke={k === 7 ? SODIUM : PAPER} strokeOpacity={k === 7 ? 0.9 : 0.16} strokeWidth={k === 7 ? 2 : 1} />
      })}
    </g>
  )
}

function Dots({ r }) {
  const cols = 26
  const rows = 19
  const fx = r() * 3
  return (
    <g>
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols
        const ro = Math.floor(i / cols)
        const v = (Math.sin(c * 0.35 + fx) + Math.cos(ro * 0.42 - fx)) / 2
        const rad = 1 + Math.max(0, v) * 6
        return <circle key={i} cx={30 + c * 29.6} cy={30 + ro * 30} r={rad} fill={v > 0.82 ? SODIUM : PAPER} fillOpacity={v > 0.82 ? 0.95 : 0.12 + Math.max(0, v) * 0.35} />
      })}
    </g>
  )
}

function Glyph({ letter }) {
  return (
    <g>
      <text x="400" y="470" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight="900" fontStretch="62%" fontSize="520" fill="none" stroke={PAPER} strokeOpacity="0.35" strokeWidth="2">
        {letter}
      </text>
      <rect x="248" y="96" width="304" height="380" fill="none" stroke={BLUE} strokeOpacity="0.7" strokeDasharray="6 6" />
      <circle cx="552" cy="96" r="7" fill={SODIUM} />
    </g>
  )
}

function Regression({ r }) {
  const pts = Array.from({ length: 60 }, (_, i) => {
    const x = 60 + (i / 60) * 680
    return [x, 470 - (x - 60) * 0.5 - Math.sin(x / 90) * 30 + (r() - 0.5) * 120]
  })
  let d = ""
  for (let i = 0; i <= 40; i++) {
    const x = 60 + (i / 40) * 680
    d += `${i ? "L" : "M"}${x} ${470 - (x - 60) * 0.5 - Math.sin(x / 90) * 30}`
  }
  return (
    <g>
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={PAPER} fillOpacity="0.4" />
      ))}
      <path d={d} fill="none" stroke={SODIUM} strokeWidth="3" />
      <path d={`M60 520H740M60 80V520`} stroke={BLUE} strokeOpacity="0.6" />
    </g>
  )
}

const MOTIFS = [Radar, Wave, Graph, Contours, Dots, Glyph, Regression]
const TINTS = ["#1c0b0e", "#170c10", "#1d0e11", "#150a0c", "#1a0d10", "#200c0f", "#130a0c"]

function ArtImpl({ seed = 0, letter = "A", label = "Preview placeholder" }) {
  const id = useId()
  const r = rng(seed + 1)
  const Motif = MOTIFS[seed % MOTIFS.length]
  return (
    <svg className="art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <defs>
        <radialGradient id={`g${id}`} cx="70%" cy="30%" r="90%">
          <stop offset="0" stopColor={TINTS[seed % TINTS.length]} />
          <stop offset="1" stopColor="#060607" />
        </radialGradient>
        <pattern id={`p${id}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke={BLUE} strokeOpacity="0.08" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#g${id})`} />
      <rect width={W} height={H} fill={`url(#p${id})`} />
      <Motif r={r} letter={letter} />
      <text x="28" y={H - 26} fontFamily="JetBrains Mono, monospace" fontSize="15" fill={PAPER} fillOpacity="0.45">
        {label}
      </text>
    </svg>
  )
}

export const Art = memo(ArtImpl)
