# Pong 2-Player (Arrows vs WASD)

A tiny HTML5 canvas Pong clone. One file per concern. No build tools.

## Controls
- Right paddle: Up/Down arrows
- Left paddle in 2P: W/S
- P toggles 1P/2P
- Space pauses
- R resets scores and serves

## Run locally
Just open `index.html` in a browser.

If your OS opens it as text:
- Drag `index.html` into a browser window, or
- Right-click → Open With → your browser, or
- Ensure the filename is exactly `index.html` and not `index.html.txt`

## Deploy to GitHub Pages
1. Create a new GitHub repository (public is easiest).
2. Upload **index.html**, **style.css**, **game.js**, and **README.md**.
3. In the repo Settings → Pages → Build and deployment → Source: **Deploy from a branch**.
4. Set **Branch** to `main` (or `master`) and `/root`. Save.
5. Wait a minute; your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## Files
- `index.html` – markup that links the CSS and JS
- `style.css` – styles for the page and canvas
- `game.js` – all game logic and input
- `README.md` – these instructions

## Notes
- 1-player mode uses a basic AI for the left paddle.
- 2-player mode uses WASD for the left paddle and arrows for the right.
