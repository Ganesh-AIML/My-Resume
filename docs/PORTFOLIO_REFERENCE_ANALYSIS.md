# Portfolio reference analysis

Forensic breakdown of the two reference recordings used to art-direct the redesign.

| Ref | Source file | Length | Capture | Site shown |
|---|---|---|---|---|
| **A** | `WhatsApp Video 2026-11-05 at 6.33.29 PM.mp4` | 25.9 s · 478×850 · 30 fps | Phone filming an angled desktop monitor | "IgnitronDev" — engineering studio ("Systems that hold up.") |
| **B** | `Video-44119.mp4` | 56.7 s · 716×1274 · 30 fps | Phone filming a laptop (Chrome, `localhost:5500`) | "RENANDO" — editor / VFX artist portfolio |

Both are Instagram reels by the same creator (@XIAOBIMA_), showing the same underlying technique applied to two different sites.

> **Direction update (2026-11-05, revision 2):** the client prefers **Reference B** and a red theme. B is now the primary reference for palette (black ground, crimson accent), hero composition (giant red word behind a cut-out portrait, white name with red full stop, red role, numeral rail), section patterns (chapter labels, two-line headlines with a red second line, red-year ledger, before/after slider, red quote card, journey timeline, contact card) and the nav "Motion off" switch. Reference A now only informs construction details (stat editing, wide guide lines). The construction layer is drawn in red instead of the references' blue to keep the page in one palette. Key B stills used for the revision: B 4.6 s (hero), 15.2 s (work + logos), 21.5 s (awards), 28.5 s (before/after), 37.5 s (about), 47 s (journey + contact).

## Method

- Frames extracted with ffmpeg at **5 fps** for the full length of both videos (A: 129 frames, B: 282 frames), plus **10 fps** passes over the intro/build sequences (A 0–3 s, A 4–6 s, B 0–4 s, B 4–7 s).
- Website viewport isolated with an ffmpeg `perspective` transform (A: corners ≈ (−8,128) (478,150) (−8,568) (478,556); B: ≈ (70,428) (652,428) (90,822) (672,800)), rescaled to 1100×900 / 1280×800.
- Timestamped contact sheets compared frame-to-frame; enlarged crops taken of the status dock, selection boxes and finale.
- Frame files (kept local, **git-ignored** because they contain third-party content) live in `docs/reference-frames/`:

| File | Content |
|---|---|
| `A_sheet_1fps.jpg`, `B_sheet_1fps.jpg` | Raw 1 fps overview, frame *n* = *n−1* s |
| `A_crop_sheet.jpg` | A, perspective-corrected, 1 fps (row-major, 6 per row) |
| `B_crop_sheet1.jpg`, `B_crop_sheet2.jpg` | B, perspective-corrected, 1 fps (0–29 s, 30–56 s; 5 per row) |
| `A_intro_10fps.jpg`, `B_intro_10fps.jpg` | Intro + construction at 10 fps (0.1 s per tile) |
| `A_stats_10fps.jpg` | A 4.0–6.0 s: stat editing + scroll into next section |
| `B_dock_zoom.jpg`, `B_dock_zoom_end.jpg` | Status dock during build (10 s) and at completion (55.5 s) |
| `A_build.jpg`, `B_t09.jpg`, `B_finale.jpg` | Key stills at A 2.2 s, B 9 s, B 54 s |

---

## 1. Overall visual identity

The shared idea — and the reason both reels are compelling — is **a website that is assembled live, on screen, by a crowd of multiplayer cursors**. The page is presented as if a Figma-style multiplayer canvas were being rebuilt by a swarm of "agents". The construction layer (blue wireframes, selection boxes, handles, guide lines) is temporarily superimposed on top of a finished dark, cinematic site, and then dissolves away to leave the real page.

- **A** is technical/engineering: charcoal ground, white grotesk sans, grey secondary line, a single 3D object, blue blueprint lines and red highlight boxes.
- **B** is cinematic/editorial: black ground, crimson red accent, ultra-condensed heavy display type, a cut-out portrait over an enormous word, script greeting.

Common principles: dark ground; one restrained content accent; a *separate* colour reserved for the construction layer (blue in both); oversized type; the build animation as the signature moment; a persistent floating status dock.

## 2. Colour and typography

| Role | A | B |
|---|---|---|
| Ground | charcoal ≈ `#141518` | near-black ≈ `#07080b` with faint red vignette |
| Primary text | white | white |
| Content accent | white/grey two-tone headline; red only in tooling | crimson ≈ `#e0262f` → dark-red gradient on display word |
| Construction | electric blue ≈ `#2f6bff` strokes, translucent blue fills, white square handles | same blue system |
| Highlight | red ≈ `#ff3b30` boxes linking stats (A 4.0 s) | red frame around media card (B 9.0 s) |
| Cursors | pastel multi-colour arrows (cyan, pink, mint, lavender, peach, yellow) | same palette |

Type: A uses a tight neo-grotesk (Inter Tight–like) for display at heavy weight with the second line in grey ("Systems that / hold up."), monospace micro-labels. B uses an ultra-condensed black display face (Anton/Bebas-like) for "PORTFOLIO", "THE WORK. THE RECOGNITION.", "FROM RAW. TO REAL.", "LET'S WORK TOGETHER." with a red second line, a brush script for "Hello, I'm", and a small geometric sans for body.

## 3. Hero composition

- **A (3.6 s):** left-aligned headline in two lines (white / grey), 3-line description, primary white button + secondary text button; 3D object right; stat row along the bottom (2019 · 02 · 07 · 01) with tiny labels.
- **B (3–5 s):** script "Hello, I'm" → condensed "RENANDO." (white) → "EDITOR & VFX ARTIST" (red) → paragraph → red CTA; an enormous red "PORTFOLIO" word spans the width *behind* a cut-out portrait; right rail of large red numerals ("3.", "3.", "10.") with labels; "Play showreel" + location under the fold.

## 4. Navigation and page structure

Thin top bar: logo left, centred text links (B: Karya · Awards · Tentang · Perjalanan · Kontak), right side status + "Let's talk" (B) / CTA button (A). During the build each nav item receives its own blue selection tag (B 3–5 s).

Section order — A: Hero → "Technical depth is the product." → "Proof lives in what we run." (project list + preview) → "We build systems, not just software." (process) → "Have a difficult system to think through?" (contact + email input) → footer columns.
B: Hero → Showreel → Selected work (filter tabs + 3 video cards) → client logo strip → Awards ("The work. The recognition." + laurel numeral + year list) → before/after slider ("From raw. To real.") → About (education & skills, process timeline, red quote card, toolkit icons) → Journey timeline ("Terus bergerak…" + "Little wins. Big meaning.") → Contact ("Let's work together." + contact rows + "Make it feel real" card) → footer.

## 5. Section layouts

- Asymmetric two-column splits dominate (heading/copy left, list/media right).
- Every section opens with a tiny index label and an oversized two-line display heading.
- Lists are hairline-ruled rows (awards, journey, contact), not cards.
- Each section has one "hero object": 3D model, portrait, media trio, laurel numeral, before/after slider, red quote card, video card.
- B uses a red vertical rule as a timeline spine (33–42 s); A uses a red vertical rule beside project previews (7–9 s).

## 6. Cursor system (the signature)

Observed cursor vocabulary (A_intro_10fps, B_intro_10fps):

| Tool | Where seen | Meaning |
|---|---|---|
| Arrow pointer, pastel fill, dark outline | everywhere | travelling / idle |
| Crosshair `+` / `×` | A 1.3 s, B 0.8 s | placing / drawing a frame |
| I-beam | A 2.2 s ("IgnitronDev designs and builds the techn▌") | typing text into a text layer |
| Corner drag | A 1.6–2.0 s | resizing a frame from a corner handle |

Behaviour:
- **Flocking:** agents move in loose formations (V-shapes and lines), not independently-random paths. In A 0.0–0.4 s two flocks enter from the left and right edges with long smeared trails.
- **Trails are stamped copies** of the cursor glyph ("+++", "×××", ">>>") rather than a continuous line — a motion-blur echo.
- **Converge → work → disperse:** clusters orbit the loader (A 0.4–1.2 s; B 0–0.8 s), scatter in a burst, then individual agents peel off to targets.
- **Multi-agent collaboration:** several agents hold different corners of one large frame while it is resized (A 1.8 s, B 1.3 s).
- **Inspect/edit:** agents box a value, it highlights blue, and the number changes in place (A 4.0–5.4 s: 2019 → 02 → 07).
- **Finale:** ~30 agents converge into a ring/arc around the final CTA card (B 50–56 s, `B_finale.jpg`).
- **Status dock** (`B_dock_zoom.jpg`): bottom-centre floating pill — stacked avatar dots · "23 agents" · "95 / 364 layers" · thin progress bar · "Touring" (blue) · "1x" speed · sound · ✕. At completion (`B_dock_zoom_end.jpg`): "Rebuilt by 30 agents in 51.4 s" · full bar · sound · **Go live** · **Replay** · ✕. Before build: "Scanning page…".

## 7. Animation sequence and timing (measured)

| Phase | A | B | Notes |
|---|---|---|---|
| Swarm enters / scan | 0.0–0.4 s | — | edge streams with trails |
| Orbit loader | 0.4–1.2 s | 0.0–0.8 s | 2 clusters orbit a monogram tile |
| Tool switch + scatter | 1.3 s | 0.8–1.0 s | all cursors → crosshair in one frame |
| Blueprint (frames, guides, grey placeholders) | 1.5–2.2 s | 1.0–1.6 s | largest frame (media) drawn first, full-width guide lines |
| Fill (text typed, media fades into placeholder) | 2.2–3.0 s | 1.6–2.4 s | text via I-beam; media cross-fades |
| Guides dissolve, polish | 3.0–4.0 s | 2.4–4.0 s | small elements (nav, stats) built last |
| Section-by-section tour | 4–20 s | 4–50 s | auto-scroll; each section is built ≈ 1.5–3 s after it enters |
| Completion | 20.5 s | 50–56 s | dock summary + finale ring |

Easing: travel is ease-in-out with a visible arc; drags are linear-ish; fills are ~300–500 ms fades. The whole hero is built in ≈ 2–3 s — fast enough to never feel like a loading screen.

## 8. Scroll-triggered interactions

The reels are recorded in a "Touring" mode that auto-scrolls (with heavy motion blur, A 5.5 s). Construction is tied to the section entering the viewport; layers below the fold are not built yet (B 8–9 s shows the next section empty while agents travel down).

## 9. Hover / micro-interactions

Limited visibility (no real pointer in the recordings). Observable: tab underline on filter tabs (B 8 s), red frame on the active media card (B 9 s), before/after drag handle (B 20–23 s), arrow icons on contact rows.

## 10. Page transitions and loading

No route transitions; the build sequence *is* the loading state. "Scanning page…" → build → "Rebuilt by …" → "Go live" hands control to the visitor.

## 11. Responsive behaviour

Not observable — both recordings are desktop viewports (≈1440 and ≈1366 wide). Mobile behaviour must be designed from scratch.

## 12. Elements to replicate faithfully

1. Swarm intro: edge entry → orbit monogram → tool switch → scatter.
2. Tool vocabulary: arrow, crosshair, I-beam, corner drag.
3. Construction layer in a dedicated blue: frames with square corner handles, dimension tags, full-width guide lines, grey media placeholders.
4. Stamped cursor trails.
5. Multi-agent corner holding on large frames.
6. Floating status dock with agents / layers / progress / mode / speed / close, and its completion state.
7. Finale convergence ring around the contact CTA.
8. Oversized condensed display typography; asymmetric splits; hairline-ruled lists.

## 13. Opportunities to improve

| Reference weakness | Improvement in this build |
|---|---|
| Auto-scroll tour hijacks the page | Building follows **the visitor's own scroll**; Tour is opt-in from the dock and stops on any user input |
| Content is invisible until built | Each layer has a 1.4 s maximum wait, then reveals regardless; "Skip" builds everything; reduced-motion and agents-off show everything immediately |
| Cursors pretend to be real visitors | Dock and footer state plainly that the agents are a simulation |
| Construction tags show meaningless labels | Agent tags show the action being performed ("typing", "placing image", "inspecting") |
| Swarm stays at full density forever | After the visible build, most agents park off-screen; a few stay to inspect content, react to the visitor's pointer and gather at the finale |
| Desktop only | Dedicated mobile behaviour: fewer, smaller agents, compact dock, no pointer reactions |
| Heavy (video, 3D) | No 3D or video; the generated artwork is inline SVG; one optimised portrait |
