import { Layer } from "../agents/AgentProvider"

/**
 * Chapter label, e.g. "01 / Selected work". Chapters are a real sequence
 * through the page, so the numbering carries information.
 */
export function Eyebrow({ index, children, className = "" }) {
  return (
    <Layer as="p" kind="text" label="Label" className={`eyebrow ${className}`}>
      <b>{index}</b> / {children}
    </Layer>
  )
}

/**
 * Condensed two-line headline. Each line is typed in by an agent.
 * line: { text, red?: whole line red, tail?: red text after the white part, dot?: red full stop }
 */
export function Headline({ as: Tag = "h2", lines, className = "", priority }) {
  return (
    <Tag className={`display headline ${className}`}>
      {lines.map((l, i) => (
        <Layer as="span" key={i} kind="text" label={`Headline / line ${i + 1}`} priority={priority} className={l.red ? "is-red" : undefined}>
          {l.text}
          {l.tail && (
            <>
              {" "}
              <span className="is-red">{l.tail}</span>
            </>
          )}
          {l.dot && <span className="dot">.</span>}
        </Layer>
      ))}
    </Tag>
  )
}
