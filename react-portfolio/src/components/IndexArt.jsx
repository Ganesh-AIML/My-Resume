import { memo, useId } from "react"
import { Art } from "./Art"

/**
 * "More projects" previews: blueprint-style system diagrams (4:5).
 * Every label comes from the site copy or the public repos:
 * - RAG: hybrid search + reranking on local models (site copy).
 * - ResQ AI: IsolationForest route-deviation alerts, geo-fenced red zones,
 *   police dashboard with severity (ResQ-AI README).
 * - Alertica: keyword trigger, 10-second countdown, SMS + location, audio,
 *   Twilio IVR check-in call "1 safe / 0 help" (Alertica README).
 * - LearnSphere: open /api/auth, JwtFilter on every other route, the four
 *   controllers and JPA entities on PostgreSQL (Learnshere repo).
 */

const VW = 400
const VH = 500

function Sheet({ fig, title, tag, children }) {
  const uid = useId().replace(/:/g, "")
  return (
    <svg className="ix" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={`ixbg${uid}`} cx="65%" cy="25%" r="95%">
          <stop offset="0" stopColor="#1c0b0e" />
          <stop offset="1" stopColor="#060607" />
        </radialGradient>
        <pattern id={`ixg${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#8a8a96" strokeOpacity="0.06" />
        </pattern>
        <pattern id={`ixG${uid}`} width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M100 0H0V100" fill="none" stroke="#8a8a96" strokeOpacity="0.1" />
        </pattern>
        <pattern id={`ixh${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#e3242f" strokeOpacity="0.35" strokeWidth="1.4" />
        </pattern>
        <marker id={`ixa${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#f4f2ef" fillOpacity="0.6" />
        </marker>
        <marker id={`ixr${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="#ff3a44" />
        </marker>
      </defs>
      <rect width={VW} height={VH} fill={`url(#ixbg${uid})`} />
      <rect width={VW} height={VH} fill={`url(#ixg${uid})`} />
      <rect width={VW} height={VH} fill={`url(#ixG${uid})`} />
      {/* drawing-sheet frame */}
      <g className="ix-frame">
        <path d="M16 30V16H30M370 16H384V30M384 470V484H370M30 484H16V470" />
      </g>
      <text className="ix-fig" x="24" y="38">{fig}</text>
      <text className="ix-tag" x="376" y="38" textAnchor="end">{tag}</text>
      {children({ arrow: `url(#ixa${uid})`, red: `url(#ixr${uid})`, hatch: `url(#ixh${uid})` })}
      <line className="ix-rule" x1="24" x2="376" y1="448" y2="448" />
      <text className="ix-title" x="24" y="470">{title}</text>
    </svg>
  )
}

const T = ({ x, y, children, a = "start", c = "ix-label" }) => (
  <text className={c} x={x} y={y} textAnchor={a}>
    {children}
  </text>
)

/* -------------------------------------------------- 01 College RAG */

function RagDiagram() {
  return (
    <Sheet fig="FIG. 01" tag="PRIVATE · RUNS LOCALLY" title="HYBRID SEARCH + RERANK → LOCAL LLM">
      {({ arrow, red }) => (
        <>
          <T x={24} y={64} c="ix-step">A · INGEST</T>
          {/* document stack */}
          {[12, 6, 0].map((o, i) => (
            <g key={o} transform={`translate(${34 + o} ${80 - o})`} className={i === 2 ? "ix-doc ix-doc--top" : "ix-doc"}>
              <path d="M0 0H30L40 10V52H0Z" />
              {i === 2 && <path className="ix-fold" d="M30 0V10H40" />}
              {i === 2 && [18, 25, 32, 39].map((y, j) => <line key={y} className="ix-ink" x1="7" x2={[33, 28, 33, 22][j]} y1={y} y2={y} />)}
            </g>
          ))}
          <T x={60} y={150} a="middle">COLLEGE DOCS</T>
          <line className="ix-line" x1="96" y1="106" x2="128" y2="106" markerEnd={arrow} />
          {/* chunks */}
          {[0, 1].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}${c}`} className={r === 0 && c === 1 ? "ix-chunk ix-chunk--hi" : "ix-chunk"} x={136 + c * 32} y={88 + r * 22} width="26" height="16" rx="2" />
            )),
          )}
          <T x={183} y={150} a="middle">CHUNKS</T>
          <line className="ix-line" x1="238" y1="106" x2="272" y2="106" markerEnd={arrow} />
          {/* index */}
          <g className="ix-db">
            <path d="M282 84V124A32 8 0 0 0 346 124V84" />
            <ellipse cx="314" cy="84" rx="32" ry="8" />
            <path className="ix-db-ring" d="M282 104A32 8 0 0 0 346 104" />
          </g>
          <T x={314} y={150} a="middle">INDEX</T>

          <line className="ix-divider" x1="24" x2="376" y1="166" y2="166" />
          <T x={24} y={188} c="ix-step">B · QUERY</T>

          {/* question */}
          <g className="ix-bubble">
            <path d="M136 196H264A6 6 0 0 1 270 202V222A6 6 0 0 1 264 228H208L200 236L192 228H136A6 6 0 0 1 130 222V202A6 6 0 0 1 136 196Z" />
          </g>
          <T x={200} y={216} a="middle" c="ix-strong">STAFF QUESTION</T>

          {/* index bus feeding both searches */}
          <path className="ix-line ix-dash" d="M314 132V246" />
          <path className="ix-line ix-dash" d="M314 246H70V258" />
          <path className="ix-line ix-dash" d="M314 246V258" />
          {/* query fans out */}
          <path className="ix-flow" d="M200 238V244H120V258" markerEnd={red} />
          <path className="ix-flow" d="M200 238V244H280V258" markerEnd={red} />

          {/* searches */}
          <rect className="ix-box" x="44" y="260" width="140" height="44" rx="3" />
          <T x={56} y={279} c="ix-strong">KEYWORD</T>
          <T x={56} y={294}>exact terms</T>
          <g className="ix-icon" transform="translate(152 272)">
            <line x1="0" x2="20" y1="2" y2="2" />
            <line className="ix-hi" x1="0" x2="14" y1="10" y2="10" />
            <line x1="0" x2="18" y1="18" y2="18" />
          </g>
          <rect className="ix-box" x="216" y="260" width="140" height="44" rx="3" />
          <T x={228} y={279} c="ix-strong">VECTOR</T>
          <T x={228} y={294}>meaning</T>
          <g className="ix-icon" transform="translate(322 270)">
            <line x1="4" y1="18" x2="14" y2="8" />
            <line x1="14" y1="8" x2="22" y2="16" />
            <circle cx="4" cy="18" r="2.4" />
            <circle className="ix-hi-fill" cx="14" cy="8" r="2.8" />
            <circle cx="22" cy="16" r="2.4" />
            <circle cx="22" cy="3" r="1.8" />
          </g>

          {/* merge → rerank */}
          <path className="ix-flow" d="M114 304V314H200" />
          <path className="ix-flow" d="M286 304V314H200V322" markerEnd={red} />
          <path className="ix-funnel" d="M142 326H258L226 364H174Z" />
          {[156, 172, 188, 204, 220, 236].map((x, i) => (
            <line key={x} className={i === 1 || i === 4 ? "ix-cand ix-cand--hi" : "ix-cand"} x1={x} x2={x} y1="332" y2="342" />
          ))}
          <line className="ix-cand ix-cand--hi" x1="194" x2="194" y1="350" y2="358" />
          <line className="ix-cand ix-cand--hi" x1="206" x2="206" y1="350" y2="358" />
          <T x={270} y={342} c="ix-strong">RERANK</T>
          <T x={270} y={356}>best passages</T>

          {/* local LLM */}
          <path className="ix-flow" d="M200 364V374" markerEnd={red} />
          <g className="ix-chip">
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <line x1="152" x2="160" y1={386 + i * 10} y2={386 + i * 10} />
                <line x1="240" x2="248" y1={386 + i * 10} y2={386 + i * 10} />
              </g>
            ))}
            <rect x="160" y="378" width="80" height="46" rx="3" />
          </g>
          <T x={200} y={399} a="middle" c="ix-strong">LLM</T>
          <T x={200} y={413} a="middle">local model</T>
          <g className="ix-lock" transform="translate(236 378)">
            <circle r="9" />
            <path d="M-3 -1V-3A3 3 0 0 1 3 -3V-1" />
            <rect x="-4.2" y="-1" width="8.4" height="6" rx="1" />
          </g>
          <T x={40} y={398}>runs fully on</T>
          <T x={40} y={412}>local models</T>
          {/* answer */}
          <path className="ix-flow" d="M248 401H262" markerEnd={red} />
          <g className="ix-bubble ix-bubble--ans">
            <path d="M270 384H356A6 6 0 0 1 362 390V412A6 6 0 0 1 356 418H270A6 6 0 0 1 264 412V390A6 6 0 0 1 270 384Z" />
          </g>
          <T x={313} y={405} a="middle" c="ix-strong">ANSWER</T>
        </>
      )}
    </Sheet>
  )
}

/* -------------------------------------------------------- 02 ResQ AI */

function ResqDiagram() {
  return (
    <Sheet fig="FIG. 02" tag="SIH 2025 · TEAM" title="ROUTE ANOMALY → POLICE DASHBOARD">
      {({ red, hatch }) => (
        <>
          <defs>
            <clipPath id="ixmap">
              <rect x="24" y="50" width="352" height="246" rx="3" />
            </clipPath>
          </defs>
          <g clipPath="url(#ixmap)">
            <rect className="ix-map" x="24" y="50" width="352" height="246" />
            {/* river */}
            <path className="ix-river" d="M10 250C70 236 110 286 170 300S280 290 330 310" />
            {/* roads */}
            <g className="ix-road">
              <path d="M10 98L390 84" />
              <path d="M10 176L390 164" />
              <path d="M10 236L390 226" />
              <path d="M88 40V310" />
              <path d="M190 40L196 310" />
              <path d="M300 40L292 310" />
              <path d="M24 300L170 130" />
            </g>
            <g className="ix-road-mid">
              <path d="M10 98L390 84" />
              <path d="M10 176L390 164" />
              <path d="M10 236L390 226" />
              <path d="M88 40V310" />
              <path d="M190 40L196 310" />
              <path d="M300 40L292 310" />
              <path d="M24 300L170 130" />
            </g>
            {/* blocks */}
            {[
              [100, 108, 80, 56],
              [206, 102, 82, 52],
              [100, 186, 80, 40],
              [206, 180, 76, 38],
              [36, 108, 42, 56],
            ].map(([x, y, w, h]) => (
              <rect key={`${x}${y}`} className="ix-block" x={x} y={y} width={w} height={h} rx="2" />
            ))}
            {/* geo-fenced red zone */}
            <path className="ix-zone" d="M304 56H376V150H318L304 120Z" fill={hatch} />
            <path className="ix-zone-edge" d="M304 56H376V150H318L304 120Z" />
          </g>
          <rect className="ix-map-frame" x="24" y="50" width="352" height="246" rx="3" />
          <T x={370} y={146} a="end" c="ix-label ix-label--red ix-halo">GEO-FENCE</T>
          <T x={370} y={158} a="end" c="ix-label ix-label--red ix-halo">RED ZONE</T>

          {/* planned route vs actual path (both follow the road centre lines) */}
          <path className="ix-planned" d="M58 260L80.6 234.1L294 228.5" />
          <path className="ix-actual" d="M58 260L80.6 234.1L194.2 231.2L192.9 170.2L296 167.3L298.3 98" />
          <g transform="translate(58 260)" className="ix-pin">
            <path d="M0 0C-7 -9 -7 -16 0 -18C7 -16 7 -9 0 0Z" transform="translate(0 -2)" />
            <circle cy="-13" r="2.6" className="ix-pin-dot" />
          </g>
          <T x={58} y={280} a="middle" c="ix-label ix-halo">START</T>
          <circle className="ix-dest" cx="294" cy="228.5" r="4.2" />
          <T x={294} y={250} a="middle" c="ix-label ix-halo">PLANNED STOP</T>
          <T x={140} y={220} a="middle" c="ix-label ix-halo">left the route</T>

          {/* anomaly */}
          <g className="ix-ping" transform="translate(298.3 98)">
            <circle className="ix-ping-ring" r="16" />
            <circle className="ix-ping-ring ix-ping-ring--2" r="16" />
            <circle className="ix-ping-core" r="5" />
          </g>
          <line className="ix-leader" x1="282" y1="92" x2="230" y2="74" />
          <rect className="ix-callout" x="58" y="56" width="170" height="34" rx="3" />
          <T x={68} y={70} c="ix-strong ix-strong--red">ANOMALY · ROUTE DEVIATION</T>
          <T x={68} y={83}>IsolationForest model</T>

          {/* legend */}
          <rect className="ix-legend" x="226" y="270" width="142" height="18" rx="2" />
          <line className="ix-planned" x1="234" x2="250" y1="279" y2="279" />
          <T x={255} y={282}>planned</T>
          <line className="ix-actual" x1="306" x2="320" y1="279" y2="279" />
          <T x={325} y={282}>actual</T>
          <rect className="ix-chip-tag" x="24" y="306" width="128" height="20" rx="10" />
          <T x={88} y={320} a="middle">APP · 10 LANGUAGES</T>

          {/* alert */}
          <path className="ix-flow ix-flow--anim" d="M330 296V330" markerEnd={red} />
          <T x={322} y={318} a="end" c="ix-label ix-label--red">REAL-TIME ALERT</T>

          {/* police dashboard */}
          <rect className="ix-window" x="24" y="334" width="352" height="104" rx="3" />
          <line className="ix-rule" x1="24" x2="376" y1="352" y2="352" />
          {[34, 44, 54].map((x) => (
            <circle key={x} className="ix-dot" cx={x} cy="343" r="2.6" />
          ))}
          <T x={200} y={347} a="middle" c="ix-strong">POLICE DASHBOARD</T>
          <rect className="ix-minimap" x="34" y="362" width="104" height="66" rx="2" />
          <path className="ix-road-mini" d="M34 386L138 380M34 410L138 404M64 362V428M108 362L110 428" />
          <circle className="ix-ping-core" cx="118" cy="378" r="3.6" />
          <rect className="ix-row ix-row--hi" x="150" y="362" width="216" height="20" rx="2" />
          <rect className="ix-sev" x="156" y="366" width="34" height="12" rx="2" />
          <T x={173} y={375} a="middle" c="ix-sev-txt">HIGH</T>
          <T x={198} y={376} c="ix-strong">Route deviation</T>
          {[388, 410].map((y) => (
            <g key={y}>
              <rect className="ix-row" x="150" y={y} width="216" height="18" rx="2" />
              <rect className="ix-sev ix-sev--low" x="156" y={y + 4} width="34" height="10" rx="2" />
              <line className="ix-ink" x1="198" x2={y === 388 ? 300 : 270} y1={y + 9} y2={y + 9} />
            </g>
          ))}
        </>
      )}
    </Sheet>
  )
}

/* ------------------------------------------------------- 03 Alertica */

const WAVE = Array.from({ length: 44 }, (_, i) => {
  const hot = i >= 16 && i <= 23
  const h = hot ? 16 + Math.abs(Math.sin(i * 1.3)) * 22 : 4 + Math.abs(Math.sin(i * 0.9) * Math.sin(i * 0.37)) * 14
  return { x: 54 + i * 7.4, h, hot }
})

function AlerticaDiagram() {
  return (
    <Sheet fig="FIG. 03" tag="DIPEX 2025 · FINALIST" title="VOICE KEYWORD → SOS → CHECK-IN CALL">
      {({ arrow, red }) => (
        <>
          <T x={24} y={64} c="ix-step">1 · ALWAYS LISTENING</T>
          {/* mic */}
          <g className="ix-mic" transform="translate(34 106)">
            <rect x="-5" y="-14" width="10" height="18" rx="5" />
            <path d="M-9 -2A9 9 0 0 0 9 -2M0 7V12M-5 12H5" />
          </g>
          {WAVE.map((b) => (
            <rect key={b.x} className={b.hot ? "ix-wave ix-wave--hot" : "ix-wave"} x={b.x} y={106 - b.h / 2} width="3.4" height={b.h} rx="1.7" />
          ))}
          <path className="ix-bracket" d="M170 80V74H228V80" />
          <T x={199} y={68} a="middle" c="ix-strong ix-strong--red">“HELP”</T>
          <T x={199} y={140} a="middle">keyword detected</T>

          <path className="ix-flow ix-flow--anim" d="M200 146V170" markerEnd={red} />

          {/* SOS with 10 s countdown */}
          <T x={24} y={190} c="ix-step">2 · SOS</T>
          <g transform="translate(200 222)">
            <circle className="ix-sos-pulse" r="40" />
            <circle className="ix-count-track" r="44" />
            <circle className="ix-count" r="44" strokeDasharray="276.5" strokeDashoffset="83" transform="rotate(-90)" />
            <circle className="ix-sos" r="34" />
            <text className="ix-sos-txt" y="6" textAnchor="middle">SOS</text>
          </g>
          <T x={264} y={208} c="ix-strong">10 s</T>
          <T x={264} y={222}>countdown</T>
          <T x={264} y={236}>to cancel</T>

          {/* fan-out */}
          <path className="ix-flow" d="M200 266V280H86V296" markerEnd={red} />
          <path className="ix-flow" d="M200 266V296" markerEnd={red} />
          <path className="ix-flow" d="M200 280H314V296" markerEnd={red} />
          <T x={24} y={272} c="ix-step">3 · ALERTS</T>

          {[
            { x: 24, w: 124, title: "SMS + LOCATION", sub: "to contacts" },
            { x: 154, w: 92, title: "AUDIO", sub: "surroundings" },
            { x: 252, w: 124, title: "CHECK-IN CALL", sub: "Twilio IVR" },
          ].map((c) => (
            <g key={c.title}>
              <rect className="ix-box" x={c.x} y="300" width={c.w} height="76" rx="3" />
              <T x={c.x + 10} y={356} c="ix-strong">{c.title}</T>
              <T x={c.x + 10} y={369}>{c.sub}</T>
            </g>
          ))}
          {/* icons */}
          <g className="ix-icon" transform="translate(48 312)">
            <path className="ix-hi-fill" d="M0 24C-9 13 -9 4 0 1C9 4 9 13 0 24Z" />
            <circle cx="0" cy="9" r="3" className="ix-hole" />
            <rect x="22" y="4" width="34" height="20" rx="3" />
            <path d="M22 6L39 16L56 6" />
          </g>
          <g transform="translate(164 314)">
            <circle className="ix-rec" cx="5" cy="10" r="4.5" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const h = [6, 14, 9, 18, 11, 16, 7, 12][i]
              return <rect key={i} className="ix-wave" x={18 + i * 7} y={10 - h / 2} width="3.4" height={h} rx="1.7" />
            })}
          </g>
          <g className="ix-icon" transform="translate(264 312)">
            <path className="ix-hi-fill" d="M4 2C2 2 0 4 1 7C3 15 9 21 17 23C20 24 22 22 22 20L22 16L16 14L13 17C9 15 7 13 5 9L8 6L6 0Z" />
            <path d="M26 4A12 12 0 0 1 36 14M26 10A6 6 0 0 1 31 15" />
          </g>

          {/* IVR branch */}
          <path className="ix-line" d="M314 376V386H206V394" markerEnd={arrow} />
          <path className="ix-line" d="M314 386H322V394" markerEnd={arrow} />
          <rect className="ix-ivr" x="150" y="396" width="112" height="38" rx="3" />
          <T x={158} y={412} c="ix-strong">PRESS 1 · SAFE</T>
          <T x={158} y={426}>confirm with PIN</T>
          <rect className="ix-ivr ix-ivr--hi" x="268" y="396" width="108" height="38" rx="3" />
          <T x={276} y={412} c="ix-strong ix-strong--red">0 / NO ANSWER</T>
          <T x={276} y={426}>full alert</T>
        </>
      )}
    </Sheet>
  )
}

/* ---------------------------------------------------- 04 LearnSphere */

const ROUTES = [
  { path: "/api/courses", sub: "/published" },
  { path: "/api/tests", sub: "/question · /attempt" },
  { path: "/api/discussions", sub: "/thread · /post" },
  { path: "/api/enrollments", sub: "/user/{userId}" },
]
const ENTITIES = ["UserAccount", "Course", "Test", "TestAttempt", "DiscussionThread", "Enrollment", "UserProgress"]

function LearnsphereDiagram() {
  return (
    <Sheet fig="FIG. 04" tag="SPRING BOOT · JAVA" title="JWT-SECURED REST API → POSTGRESQL">
      {({ arrow, red }) => (
        <>
          {/* client ↔ auth */}
          <rect className="ix-box" x="24" y="58" width="108" height="58" rx="3" />
          <g className="ix-icon" transform="translate(36 68)">
            <rect x="0" y="0" width="30" height="20" rx="2" />
            <line x1="0" x2="30" y1="5" y2="5" />
          </g>
          <T x={36} y={104} c="ix-strong">CLIENT</T>
          <rect className="ix-box" x="246" y="58" width="130" height="58" rx="3" />
          <T x={256} y={76} c="ix-strong">/api/auth</T>
          <T x={256} y={91}>/login · /register</T>
          <T x={256} y={106} c="ix-label ix-label--ok">open (permitAll)</T>
          <line className="ix-line" x1="134" y1="72" x2="242" y2="72" markerEnd={arrow} />
          <T x={189} y={66} a="middle">POST /login</T>
          <line className="ix-flow" x1="244" y1="100" x2="136" y2="100" markerEnd={red} />
          <g transform="translate(189 100)">
            <rect className="ix-token" x="-24" y="-9" width="48" height="18" rx="9" />
            <T x={0} y={4} a="middle" c="ix-token-txt">JWT</T>
          </g>

          {/* request with bearer token through the filter */}
          <path className="ix-flow ix-flow--anim" d="M78 116V140H200V158" markerEnd={red} />
          <rect className="ix-callout" x="210" y="128" width="150" height="20" rx="3" />
          <T x={218} y={142}>Authorization: Bearer …</T>

          <rect className="ix-gate" x="24" y="162" width="352" height="34" rx="3" />
          <g className="ix-lock ix-lock--gate" transform="translate(48 179)">
            <circle r="10" />
            <path d="M-3.4 -1V-3.4A3.4 3.4 0 0 1 3.4 -3.4V-1" />
            <rect x="-4.8" y="-1" width="9.6" height="6.6" rx="1" />
          </g>
          <T x={66} y={177} c="ix-strong">JwtFilter</T>
          <T x={66} y={189}>every other route: authenticated()</T>

          {/* controllers */}
          <path className="ix-line" d="M110 196V274M290 196V274" />
          {ROUTES.map((r, i) => {
            const x = i % 2 ? 204 : 24
            const y = i < 2 ? 214 : 274
            return (
              <g key={r.path}>
                <rect className="ix-box ix-box--solid" x={x} y={y} width="172" height="50" rx="3" />
                <rect className="ix-method" x={x + 10} y={y + 9} width="28" height="13" rx="2" />
                <T x={x + 24} y={y + 19} a="middle" c="ix-method-txt">GET</T>
                <rect className="ix-method ix-method--post" x={x + 42} y={y + 9} width="34" height="13" rx="2" />
                <T x={x + 59} y={y + 19} a="middle" c="ix-method-txt">POST</T>
                <T x={x + 10} y={y + 35} c="ix-strong">{r.path}</T>
                <T x={x + 10} y={y + 45} c="ix-label ix-label--sm">{r.sub}</T>
              </g>
            )
          })}

          {/* JPA → PostgreSQL */}
          {[110, 290].map((x) => (
            <path key={x} className="ix-line" d={`M${x} 324V340H200V352`} />
          ))}
          <g className="ix-db">
            <path d="M160 356V400A40 9 0 0 0 240 400V356" />
            <ellipse cx="200" cy="356" rx="40" ry="9" />
            <path className="ix-db-ring" d="M160 378A40 9 0 0 0 240 378" />
          </g>
          <T x={200} y={393} a="middle" c="ix-strong">PostgreSQL</T>
          <T x={252} y={366}>Spring Data JPA</T>
          {ENTITIES.map((e, i) => {
            const left = i < 4
            const x = left ? 24 : 262
            const y = left ? 352 + i * 21 : 386 + (i - 4) * 21
            const w = Math.max(64, e.length * 6.2 + 14)
            return (
              <g key={e}>
                <rect className={e === "UserProgress" ? "ix-entity ix-entity--hi" : "ix-entity"} x={left ? x : 376 - w} y={y - 11} width={w} height="16" rx="8" />
                <T x={left ? x + w / 2 : 376 - w / 2} y={y + 1} a="middle" c="ix-entity-txt">{e}</T>
              </g>
            )
          })}
        </>
      )}
    </Sheet>
  )
}

/* ------------------------------------------------------------ export */

const DIAGRAMS = { rag: RagDiagram, resq: ResqDiagram, alertica: AlerticaDiagram, learnsphere: LearnsphereDiagram }

function IndexArtImpl({ id, label, seed = 0 }) {
  const D = DIAGRAMS[id]
  if (!D) return <Art seed={seed} label={label} />
  return (
    <span className="ix-wrap" role="img" aria-label={label}>
      <D />
    </span>
  )
}

export const IndexArt = memo(IndexArtImpl)
