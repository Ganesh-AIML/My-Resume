import { useEffect, useState } from "react"
import { person } from "../content/site"

/* A small, tidy neural net: 4 inputs → 5 hidden → 3 outputs. Signals run
   along four routes and all land on the red output node in the middle. */
const COLS = [
  { x: 44, ys: [52, 92, 132, 172] },
  { x: 160, ys: [32, 72, 112, 152, 192] },
  { x: 276, ys: [72, 112, 152] },
]
const OUT = 1 // index of the highlighted output node
const ROUTES = [
  [0, 1],
  [2, 2],
  [1, 0],
  [3, 3],
] // [input, hidden] pairs; every route then goes hidden → OUT

const node = (c, i) => [COLS[c].x, COLS[c].ys[i]]

function useClock(timeZone) {
  const fmt = () =>
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone }).format(new Date())
  const [now, setNow] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setNow(fmt()), 15000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone])
  return now
}

function Net() {
  const edges = []
  for (let c = 0; c < 2; c++)
    COLS[c].ys.forEach((_, i) =>
      COLS[c + 1].ys.forEach((__, j) => {
        const [x1, y1] = node(c, i)
        const [x2, y2] = node(c + 1, j)
        edges.push(<line key={`${c}-${i}-${j}`} className="tc-edge" x1={x1} y1={y1} x2={x2} y2={y2} />)
      }),
    )
  const hot = new Set(ROUTES.flatMap(([a, b]) => [`0-${a}`, `1-${b}`]))
  const [ox, oy] = node(2, OUT)

  return (
    <svg className="tc-net" viewBox="0 0 320 224" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="tc-glow">
          <stop offset="0" stopColor="#ff2a36" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff2a36" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={ox} cy={oy} r="58" fill="url(#tc-glow)" />
      {edges}
      {ROUTES.map(([a, b], k) => {
        const [x0, y0] = node(0, a)
        const [x1, y1] = node(1, b)
        return (
          <g key={k} style={{ "--d": `${k * 0.9}s` }}>
            <line className="tc-pulse" x1={x0} y1={y0} x2={x1} y2={y1} pathLength="100" />
            <line className="tc-pulse tc-pulse--2" x1={x1} y1={y1} x2={ox} y2={oy} pathLength="100" />
          </g>
        )
      })}
      {COLS.map((col, c) =>
        col.ys.map((y, i) => {
          const out = c === 2 && i === OUT
          const lit = hot.has(`${c}-${i}`)
          return <circle key={`${c}-${i}`} className={`tc-node${lit ? " is-lit" : ""}${out ? " is-out" : ""}`} cx={col.x} cy={y} r={out ? 9 : 5.5} />
        }),
      )}
      <circle className="tc-ring" cx={ox} cy={oy} r="9" />
    </svg>
  )
}

/** Closing card in Contact: availability, local time and the thinking net. */
export function ThinkCard() {
  const time = useClock(person.timeZone)
  return (
    <>
      <div className="tc-top">
        <span className="tc-status">
          <span className="tc-dot" aria-hidden="true" />
          Open to work
        </span>
        <span className="tc-time">
          Mumbai · <b>{time}</b>
        </span>
      </div>
      <Net />
      <div className="tc-bottom">
        <p className="display contact-card-title">
          Build something
          <br />
          <span className="is-red">that thinks.</span>
        </p>
        <p className="tc-foot">
          <span>Internships</span>
          <span aria-hidden="true">·</span>
          <span>Full-time from 2027</span>
        </p>
      </div>
    </>
  )
}
