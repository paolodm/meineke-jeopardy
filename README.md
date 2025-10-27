# Meineke Jeopardy Game

_A web‑based Jeopardy‑style trivia game for Meineke shop employees._

---

## ✨ Features

* **Configurable Teams (1–7)** — choose team count at launch.
* **Jeopardy Board** — 5 categories × 5 questions; tiles flip from dollar‑value → question → answer.
* **Live Scoreboard** — add or subtract points per team in real time.
* **Final Jeopardy** — wager round with automatic score settlement.
* **Classic Audio** — looping Jeopardy theme + reveal / correct / wrong SFX (mute toggle).
* **One‑Click Reset** — restart without refreshing the page.
* Pure **HTML / CSS / JS** — no backend, zero install.

---

## 🚀 Quick Start

```bash
# 1 Clone the repo
$ git clone https://github.com/your‑org/meineke‑jeopardy.git
$ cd meineke‑jeopardy

# 2 Open locally
$ open index.html      # macOS
# OR
$ xdg‑open index.html  # Linux
```

That’s it — the game runs entirely in your browser.

### Hosting on GitHub Pages

1. Push to a public repository.  
2. In **Settings → Pages**, select the `main` branch and `/root` folder.
3. Share the generated URL (e.g. `https://your‑org.github.io/meineke‑jeopardy`).

### Pull Request Previews

Every pull request against `main` automatically publishes a preview build via GitHub Pages. Open the PR page and look for the **Deploy preview** link in the checks section to launch the branch in your browser before merging.

---

## ⚙️ Configuration

| Option | How to Change | Default |
|--------|---------------|---------|
| **Team Count** | Prompt appears on page load; select 1‑7 | 3 |
| **Questions & Answers** | Edit `questions.json` (or the JS object in `game.js`) | Sample Meineke set |
| **Audio Files** | Replace `.mp3` assets in `/audio` | Jeopardy theme & SFX |

> **Pro tip:** Add `?teams=5` to the URL to pre‑select five teams.

---

## 🛠️ Project Structure

```
meineke‑jeopardy/
├── index.html        # main page
├── style.css         # styling
├── game.js           # logic
├── questions.json    # (optional) trivia data
├── audio/            # mp3/ogg files
└── README.md         # this file
```

---

## 🧑‍💻 Development

1. Fork and clone the repo.  
2. `npm install -g http‑server` (optional) and run `http‑server .` for live reload.  
3. Edit `game.js`, `style.css`, or `index.html`; changes reflect instantly.

### Linting / Formatting
No build tooling by default; add ESLint/Prettier if desired.

---

## 🗺️ Roadmap

* [ ] Responsive mobile layout
* [ ] Timer per question
* [ ] Admin CSV upload for custom question sets
* [ ] Dark‑mode toggle

---

## 🤝 Contributing

Contributions are welcome!  
1. Create a feature branch.  
2. Commit your changes.  
3. Open a pull request with a clear description.

---

## 🪪 License

MIT — feel free to use, modify, and share.

---

### Credits

* Developed by Paolo and team.  
* Jeopardy® theme song remains property of its respective owners; used under fair‑use for training purposes only.
