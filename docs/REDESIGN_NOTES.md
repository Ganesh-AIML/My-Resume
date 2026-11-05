# Redesign notes — multi-agent portfolio (phase 1: visual reconstruction)

Branch: `redesign/multi-agent-portfolio` · Backup of the previous site: branch `backup/pre-redesign-2026-11-05` (= `main` @ `3a7ee8f`).

## Concept

An AI & ML engineer's portfolio that is **assembled live by a crew of simulated agents** — the multiplayer-cursor build from the reference reels (see `PORTFOLIO_REFERENCE_ANALYSIS.md`), reframed so it is about the subject: multi-agent systems are what Ganesh builds. The cursors are a choreographed animation; the dock ("14 simulated agents"), the nav's "Motion off" switch and the footer say so.

**Direction (revision 2, 2026-11-05):** the client preferred reference **B** (the "RENANDO" reel) and a red theme. B is now the primary reference for palette, hero composition and section patterns; A only contributes construction details. The new colour portrait has red rim light on the right shoulder, sleeve, lapel and hair edge — it is kept in full colour and sets the accent red.

## Design system

| Token | Value | Role |
|---|---|---|
| `--ink` / `--ink-2` / `--ink-3` | `#060607` / `#0e0e11` / `#17171c` | Black ground and raised surfaces |
| `--paper` / `--paper-2` / `--mute` | `#f4f2ef` / `#b9b8bf` / `#84838d` | Text ramp |
| `--red` | `#e3242f` | Content accent: display lines, numerals, buttons (white on red 5.8:1) |
| `--red-hi` | `#ff3a44` | Red for small text and icons (5.7:1 on black) |
| `--signal` / `--signal-ink` | `#ff3a44` / `#c81b26` | Construction layer: agent frames, handles, guides, dimension tags |
| `--inspect` | `#f4f2ef` | Agent inspection boxes (white dashed) |

Type: **Archivo** variable (width axis) — display 62 % width, weight 850, uppercase; body 100 % width. **Kaushan Script** for the "Hello, I'm" greeting and the quote signature (as in B). **JetBrains Mono** only for the agents' tags.

Patterns taken from B: giant red-gradient word ("PORTFOLIO") behind the cut-out portrait; name in white condensed with a red full stop; role in red; right rail of big red numerals; chapter labels "01 / Selected work"; two-line headlines with a red second line; square-cornered red buttons; 3-up work grid with red indices; laurel numeral + ledger with red years; before/after slider with a red handle; about block with education & toolkit, numbered process timeline and a red quote card with script signature; journey timeline with expandable entries and a "little wins" card; "Let's work together." contact with icon rows and a card (the finale target); "Motion off" switch in the nav.

Section order: Hero → 01 Selected work → 02 Project index → 03 Recognition & awards → 04 Under the hood (compare) → 05 Behind the code (about) → 06 The journey → 07 Contact → Footer.

## Architecture

```
src/agents/director.js     Engine (plain JS, no React state per frame)
src/agents/AgentProvider   Mounts overlay + trail canvas; Layer component / useLayer hook
src/agents/AgentDock       Status dock (useSyncExternalStore on the director)
src/agents/roster.js       Agent names/colours + tool glyphs (arrow, crosshair, I-beam, corner-drag)
src/motion/primitives.jsx  Shared easing, variants, RollText, Magnetic, useFollowLabel
src/content/site.js        Every piece of copy (placeholders) — single integration point
src/components/Headline    Chapter label + two-line headline (each line typed by an agent)
```

**Layers.** Any element wrapped in `<Layer kind="text|block|media" label crew priority finale>` is registered with the director. While agents are on, unbuilt layers are `opacity: 0` (set by `html.agents-boot`, applied before first paint by an inline script with a 4 s failsafe). An IntersectionObserver queues layers as they enter the viewport.

**Agents.** Absolutely positioned in page coordinates inside one overlay (`pointer-events: none`, `overflow: clip`), so scrolling costs nothing. Moves are quadratic Bézier arcs with ease-in-out and distance-based duration. Trails are stamped glyphs on one fixed `<canvas>` (DPR ≤ 1.5, ≤ 5 stamps per agent, 150 ms life).

**Tasks.** `text` — agent travels to the left edge, switches to I-beam and reveals the text in stepped clip-path increments while a selection box grows with it. `block`/`media` — agent drags a frame open from the top-left corner (crosshair); with `crew > 1` helpers hold the other corners, then drift apart; media frames show a grey placeholder that the image dissolves out of. Section guides draw while a section is under construction.

**Ambient (after the visible build).** The crowd thins to 5 (desktop) / 3 (tablet) / 2 (phone); the rest park off-screen and stream back in when new work appears. Agents **take turns**: one ambient action at a time (a short drift, an inspection with a white dashed box + label, or a three-agent huddle), 1.5–3.4 s apart. After 15 s without scrolling or pointer movement the crew winds down to 2 agents and 6–11 s gaps. Agents step aside from the visitor's mouse pointer. When the contact card is in view the whole crew forms a ring around it with name tags, then disperses.

**Scheduling.** One loop for everything, run inside Framer Motion's frame batch (`frame.update`) so it shares Motion's read/update/render phases. It sleeps whenever nothing is moving. Scroll position and viewport size are cached from passive `scroll`/`resize` events — reading `scrollY`/`innerHeight` inside the loop forced a synchronous layout every frame. The director starts one frame after first paint so it never forces the initial page layout inside the boot task. Async choreography (`await moveTo/tween/wait`) runs on the loop's scaled clock so the speed control (1×/2×/0.5×) affects everything. Skip/Replay/Off bump a generation counter and resolve every pending await so scripts exit cleanly.

**Performance work done during validation.** (1) The dock re-rendered a Motion `layout` container on every built-layer count, making Motion re-measure the page; counts now live in leaf components subscribed with selectors and the dock no longer uses `layout`. (2) Per-frame forced layouts from viewport reads removed (above). (3) A scheduling bug that could queue duplicate frame callbacks (414 rAF/s) fixed. (4) Ambient turn-taking. Mobile TBT went from 370–920 ms to 80–200 ms.

**Safety rails.** A queued layer is revealed after 1.4 s even if no agent reached it. Keyboard focus inside an unbuilt layer reveals it instantly. `prefers-reduced-motion` starts with agents off and everything visible (the dock offers "play" as an opt-in). The off switch is remembered in `localStorage`. Tour (auto-scroll) is opt-in and stops on any wheel, touch or scroll key.

## Content integration (next phase)

All copy lives in `src/content/site.js`, structured to match the existing data in `src/loadPortfolioData.js` / `src/portfolio-data.md` (projects, experience, recognition with certificate images in `public/assests/`, toolkit groups, education). Identity facts already on the old site (name, role, email, GitHub, LinkedIn, résumé, portrait) are used as-is; everything else is marked placeholder. Recognition rows are intentionally non-interactive until certificate images are wired to a viewer.

## Removed

| Item | Reason |
|---|---|
| `src/App.css` | Old global stylesheet; replaced by `styles/tokens.css`, `base.css`, `sections.css` and component CSS. |
| `src/RobotAssistant.jsx` | Old Lottie robot FAB + chat UI. Its chat logic (ChatEngine, markdown rendering) moved into `src/assistant/AgentChat.jsx`; `chatService.js` is unchanged. |
| `@lottiefiles/dotlottie-react` dependency | Only used by the robot FAB; it also fetched an animation from `assets-v2.lottiefiles.com` at runtime. |
| Font Awesome CDN stylesheet (`index.html`) | Replaced by an inline SVG icon set (`components/Icon.jsx`). The `fa-*` strings left in `loadPortfolioData.js` are data the assistant reads, not rendered icons. |
| Playfair Display / Inter fonts | Replaced by Archivo, Kaushan Script and JetBrains Mono. |
| `Statement`, `Education`, `Toolkit` components (revision 1) | Merged into `About.jsx` to follow B's about block. |
| `public/assests/portrait.webp` (revision 1, generated by me) | Replaced by `portrait-hero.webp`, cut out from the new colour portrait. |

Kept deliberately: `chatService.js`, `loadPortfolioData.js` (imported by the chat service), `portfolio-data.md`, `src/__tests__/chatService.test.js` (66/66 passing), every file in `public/assests/` (certificates and résumé are needed for the content phase), `.env.example`, deploy workflow, `vite.config.js` (`base: /My-Resume/`). Added: `public/assests/portrait-hero.webp` — cut out from the new `ganesh_portrait.png` (kept) with a border-connected flood fill on the flat #CBCBCB backdrop, a soft alpha ramp only in a 3 px edge band, colour un-mixing of edge pixels against the backdrop (no grey halo, rim light preserved) and removal of the two enclosed arm/torso gaps; 1122×1402, 64 KB.

## Validation (production build, Chrome 1440×900 and 390×844 @2x)

| Check | Result |
|---|---|
| `npm run build` | ✓ JS 125.8 kB gzip main + 64.9 kB gzip chat chunk (lazy), CSS 7.6 kB gzip |
| Console errors / warnings / failed requests | none (intro, all sections, mobile, reduced motion, interaction runs) |
| Horizontal overflow | 0 px at 1440 and 390 |
| Clicks through the agent layer mid-build | ✓ CTA navigates; text selection works |
| Dock: Skip / Replay / Off (persists across reload) / On | ✓ |
| Filters, index preview, chat open → input focused → Esc closes | ✓ |
| Reduced motion | ✓ all layers visible at load, no agents |
| Lighthouse desktop | Performance 98 · Accessibility 100 · Best practices 100 · SEO 100 · LCP 0.9 s · CLS 0.001 · TBT 50 ms |
| Lighthouse mobile (simulated slow 4G, 3 runs) | Performance 74–79 · Accessibility 100 · Best practices 100 · SEO 100 · LCP 2.6–3.5 s (LCP element: the name) · TBT 210–920 ms (noisy on this machine) · CLS 0 |
| Agent loop cost (Chrome trace) | ≈ 2 ms main-thread rendering work per animated frame; loop sleeps between movements |
| Ambient duty cycle (frames with any agent moving) | 12 / s after the build (was 58 / s before turn-taking); 2 agents and long gaps after 15 s of inactivity |
| Chat RAG tests | 66/66 |

Screenshots: `docs/screenshots/` (desktop intro → hero → every section → finale ring → footer → reduced motion; mobile hero, sections, menu).

## Known limitations

- **Mobile LCP (≈ 2.6–3.5 s simulated)** is dominated by the build concept itself: the hero is hidden until agents type it in. Skip/off/reduced-motion bypass this. If needed later: shorten the phone intro, or render the hero name immediately and let agents only "inspect" it.
- Google Fonts load from the CDN (blocking stylesheet, ~1 kB, so agents measure final text boxes). Self-hosting Archivo and Kaushan Script would remove the third-party request.
- The hero backdrop word "PORTFOLIO", the tagline and the 3 hero numbers are design placeholders to confirm in the content phase.
- `motion` is imported in full (~35 kB gzip). Switching to `LazyMotion` + `m` would save ~10 kB but needs `domMax` for the layout animations used.
- Recognition rows, project links and education details are placeholders; the certificate viewer arrives with the content phase.
- Agents do not interact with the fixed navigation bar (it is outside the page-coordinate overlay).
- The reference reels were filmed on angled screens; colours and timing in the analysis are approximate (±0.1 s).
