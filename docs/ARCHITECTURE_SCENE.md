# "Under the hood": S.C.O.P.E. live system

Status: **Version A is built** (2026-11-05). Version B is planned and ready to build if A is rejected.

## Facts the scene may show
Real, from the owner and the project record:
- Safe Exam Browser → Express API (JWT / RBAC, Prisma + PostgreSQL) → Nginx least-connection load balancing → Redis queue → Dockerized Judge0 cluster (**10 nodes × 4 workers**) → results, with Socket.io keeping every student's clock in sync.
- Used by TCET for exams across all students, with **1,000+ concurrent users**.

Everything else is **simulated** and labelled on screen ("Simulated traffic · illustrative, not measured"). This includes:
- the traffic, queue depth and "graded" count;
- the 09:55–10:45 timeline;
- the load-test waves.

Each dot is a scaled-down run, not one real submission. If the owner supplies real numbers later (peak runs per minute, average judge time, exam length), they replace the simulated ones.

## Version A: built (ideas 1 + 2 + 4 + 5)
**Isometric diorama.** An SVG scene with three-face shaded boxes; no 3D library is added.
- Pieces: exam hall (30 terminals) · Express API + PostgreSQL · Nginx · Redis queue (stack of cubes) · 10 Judge0 towers with 4 worker LEDs each · Socket.io return line.

**Exam timeline (desktop).** The section pins for about 280vh, and scrolling moves the exam clock from 09:55 to 10:45:
- sign-in (login traffic only) → exam live (about 45% load) → final-minutes rush (over capacity, so the queue grows) → drain → closed.
- On phones, and on short screens, the timeline plays by itself on a loop.

**Load test.** A slider sets 50–1,200 students. Submissions arrive in waves (a 4 s spike every 12 s), so the queue fills and drains without suggesting a hard limit.

**"Redis queue" switch.** With the queue off, any run that finds every worker busy is lost. The lost runs are shown as red ✕ marks and counted as "Lost". This shows why the queue exists.

**Chaos.** Clicking or tapping a Judge0 node takes it offline:
- Its running jobs are requeued, or lost when the queue is off.
- Least-connection routing skips the node.
- "Restore all nodes" brings it back.

**Agents on call.** The simulated cursor agents react to what the simulation does, using `director.callout()`:
- 1,000+ students online
- all workers busy
- queue absorbing the rush
- queue drained
- node down / back online
- runs lost

They don't speak during the build or the tour, and there are at most one call-out per 3.5 s (node events always get one).

**HUD.** Clock, phase caption, students online, queue depth, workers busy (with a meter), graded, and lost (only when the queue is off).

**Accessibility and performance:**
- The scene has an aria description, and the nodes are keyboard buttons.
- With reduced motion, the scene is a still, labelled frame.
- The animation loop runs only while the scene is on screen and the tab is visible.
- The DOM is updated directly (no React re-render per frame), with at most 170 packets.
- Cost: about 8 KB gzipped.

**Files:**
- `src/scope/sim.js`: world geometry, projection and the simulation.
- `src/components/ScopeScene.jsx`: scene, HUD and controls.
- `src/components/Architecture.jsx`: pinned stage plus the existing 6-step explanation.
- `src/agents/director.js`: `callout()`.
- CSS: `ARCH — LIVE SYSTEM` in `sections.css`.

## Version B: alternative (ideas 3 + 4 + 7, reusing 2)
**"Follow one submission."** A real 3D scene with a scroll-driven camera.
- **Scene:** the same machines as 3D meshes (react-three-fiber + drei, **lazy-loaded** only when the section is near, about 150 KB gzipped). Low-poly boxes, emissive red worker LEDs, one red key light to match the hero's rim light.
- **Camera path (pinned, about 400vh):**
  1. Close on one terminal, with the code typed in the editor.
  2. Fly along the pipe into the Express API ("token and role checked").
  3. Swing past PostgreSQL.
  4. Nginx picks the least-busy node.
  5. Drop into the Redis queue behind other runs.
  6. Ride into a Judge0 worker; the LED turns on and the tests run.
  7. The result returns over Socket.io.
  8. **Pull back** to show the whole cluster with 1,000 students. The heartbeat ring (idea 7) is a ring of 1,000 dots that pulse together on each clock sync.
- Each stop shows a card with the existing 6-step copy, so the narrative stays the same.
- **Reused from A:** `sim.js` drives the background traffic, and the load slider appears on the final pulled-back view (idea 2). The agents point at the current stop (idea 4).
- **Fallbacks:** on phones and with reduced motion, it shows Version A's diorama, or a still image of each stop.
- **Effort:** roughly 2× Version A. It adds the three.js dependency and needs a GPU budget check on low-end phones (DPR cap at 1.5, frame loop only while on screen).

### Switching
`Architecture.jsx` renders `<ScopeScene>` inside the pinned stage. Version B would be a sibling component (`ScopeFlight.jsx`) behind a lazy import, and `sim.js` stays shared between both.
