# Meineke Jeopardy Game — Product Requirements Document (PRD)

**Owner:** Paolo’s Brother  
**Prepared by:** Paolo  
**Purpose:** Interactive Jeopardy‑style web game that trains Meineke staff, boosts morale, and is quick to set up before or after shifts.

---

## 1. Goals

| What | Why | How (Success Metrics) |
|------|-----|-----------------------|
| Re‑enforce core automotive knowledge | Reduce on‑the‑job errors, speed up service times | ≥ 80 % correct answers in post‑game survey |
| Foster healthy team competition | Improve engagement and retention | ≥ 75 % employees opt‑in to play weekly |
| Deliver zero‑admin setup | Technicians are non‑technical, time‑starved | Game launches in < 10 sec, no install |

---

## 2. Core Features

| ID | Feature | Description |
|----|---------|-------------|
| F‑1 | **Configurable Teams (1 – 7)** | Host selects number of teams (default 3) at game start; scoreboard auto‑renders columns. |
| F‑2 | **Dynamic Scoreboard** | Live score updates per team; supports positive & negative scores. |
| F‑3 | **Game Board** | 5 categories × 5 questions; dollar‑value tiles flip: *blank → question → answer* with + / – buttons. |
| F‑4 | **Audio Controls** | Looping Jeopardy theme (+ mute) and SFX for reveal / correct / wrong. |
| F‑5 | **Final Jeopardy** | Single wager round: host enters wagers, reveals Q/A, marks correct/incorrect to settle scores. |
| F‑6 | **Reset & Session‑less** | “Reset Game” restores fresh state; all data in memory—no backend needed. |

### Nice‑to‑Haves (v2)

* Timer per question with auto‑lockout  
* Admin CSV upload for custom question sets  
* Responsive mobile layout  
* Dark‑mode toggle

---

## 3. Functional Requirements

1. **Game Setup**
   * Host inputs team count (1‑7) → app builds scoreboard & radio buttons.
   * Pre‑loaded default question data (editable JS/JSON file).

2. **Tile Logic**
   * State machine: `hidden → question → answer(locked)`.
   * On answer state, render local “+ / –” buttons; clicking either disables tile.

3. **Scoring**
   * Scores stored in `scores[]`, indexed by team.
   * Scoreboard DOM updates immediately.

4. **Final Jeopardy Workflow**
   1. Click “Play Final” → wager inputs visible.
   2. Submit wagers → show question.
   3. Reveal answer → per‑team Correct/Wrong buttons apply ±wager.

5. **Audio**
   * Autoplay music (respect browser policies), looped.
   * Mute button toggles `.muted`.

6. **Config Persistence (stretch)**
   * Optional: URL query params (`?teams=5`) for quick reuse.

---

## 4. Technical Requirements

| Layer | Requirement |
|-------|-------------|
| Front‑end | Vanilla HTML + CSS + JS (ES6). No build tools. |
| Hosting | Static: GitHub Pages / S3 + CloudFront. |
| Browsers | Latest Chrome, Edge, Firefox; iPad Safari (iOS 17). |
| Accessibility | Keyboard‑navigable tiles; ARIA labels on buttons. |
| Audio Assets | Royalty‑free Jeopardy theme & SFX (local mp3/ogg fallback). |
| File Structure | `index.html`, `style.css`, `game.js`, `questions.json`. |

---

## 5. Milestones & Timeline

| Date | Deliverable |
|------|-------------|
| Day 1 | Repo scaffold; base HTML/CSS; team input modal |
| Day 3 | Board render & tile flip logic |
| Day 5 | Scoring & audio integration |
| Day 6 | Final Jeopardy flow |
| Day 7 | Responsive tweaks, cross‑browser smoke test |
| Day 8 | UAT with shop staff; iterate |
| Day 9 | v1 launch on GitHub Pages |

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Autoplay blocked by browsers | No music | Start muted, show “Play Music” prompt |
| Seven‑team layout overflow | Broken UI on small screens | Use CSS grid + horizontal scroll for > 4 teams |
| Question leakage before flip | Players see answers early | Require two distinct clicks & disable pointer events after lock |

---

## 7. Future Analytics (Optional)

* Log answer correctness per team in `localStorage` → export CSV for training insights.

---

### Reference

* Existing prototype HTML shared via canvas  
* Audio: public‑domain Jeopardy theme clip

---

**Next Action:** Confirm feature list & timeline, then spin up GitHub repo to begin v1 implementation.
