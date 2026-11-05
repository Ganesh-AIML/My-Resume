// Simulated agent identities. These are a choreographed animation, not real
// visitors — the UI says so wherever the agents are counted.
export const ROSTER = [
  { name: "Ava", color: "#5ee0ff" },
  { name: "Kai", color: "#ff7ab8" },
  { name: "Mira", color: "#63f2b0" },
  { name: "Juno", color: "#a98bff" },
  { name: "Theo", color: "#ffb37a" },
  { name: "Iris", color: "#c8f169" },
  { name: "Nova", color: "#6aa8ff" },
  { name: "Remy", color: "#ff8f6b" },
  { name: "Sol", color: "#ffd84d" },
  { name: "Zed", color: "#34d1c6" },
  { name: "Lux", color: "#d17bff" },
  { name: "Pax", color: "#ff9ec4" },
  { name: "Vee", color: "#9ff0ff" },
  { name: "Oro", color: "#f5c26b" },
]

// One SVG per agent holds every tool glyph; CSS shows the active one.
// Arrow hotspot is its tip (3,2); the others are centred on (12,12).
export const GLYPHS = `
<svg class="agent-glyph" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <g class="g-arrow"><path d="M3 2 L20.5 10.4 L12.4 12.6 L9.2 20.6 Z" fill="var(--c)" stroke="#060914" stroke-width="1.4" stroke-linejoin="round"/></g>
  <g class="g-cross" stroke="var(--c)" stroke-width="2" stroke-linecap="round"><path d="M12 3v6M12 15v6M3 12h6M15 12h6"/><circle cx="12" cy="12" r="1.3" fill="var(--c)" stroke="none"/></g>
  <g class="g-text" stroke="var(--c)" stroke-width="2" stroke-linecap="round" fill="none"><path d="M8.5 4.5c2 0 3.5.6 3.5 2.2v10.6c0 1.6-1.5 2.2-3.5 2.2M15.5 4.5c-2 0-3.5.6-3.5 2.2M15.5 19.5c-2 0-3.5-.6-3.5-2.2M10 12h4"/></g>
  <g class="g-grab" fill="none" stroke="var(--c)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M6 6h5M6 6v5M18 18h-5M18 18v-5"/></g>
</svg>`
