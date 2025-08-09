(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  // World
  const W = canvas.width;
  const H = canvas.height;
  const CENTER = { x: W / 2, y: H / 2 };

  // Game state
  let state = {
    modeTwoPlayer: false,   // false = 1P vs AI, true = 2P
    paused: false,
    scores: { left: 0, right: 0 },
    maxScore: 11
  };

  // Entities
  const paddle = (x) => ({
    x,
    y: H / 2 - 50,
    w: 14,
    h: 100,
    speed: 8,
    dy: 0
  });

  const ball = () => ({
    x: CENTER.x,
    y: CENTER.y,
    r: 8,
    speed: 6,
    dx: Math.random() < 0.5 ? -1 : 1,
    dy: (Math.random() * 2 - 1) * 0.75 // small random vertical angle
  });

  const left = paddle(40);
  const right = paddle(W - 40 - 14);
  let b = ball();

  // Inputs
  const keys = {
    ArrowUp: false,
    ArrowDown: false,
    w: false,
    s: false,
    W: false,
    S: false,
  };

  window.addEventListener('keydown', (e) => {
    if (e.key in keys) keys[e.key] = true;

    if (e.key === ' '){
      state.paused = !state.paused;
    }
    if (e.key === 'p' || e.key === 'P') {
      state.modeTwoPlayer = !state.modeTwoPlayer;
    }
    if (e.key === 'r' || e.key === 'R') {
      resetGame(true);
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key in keys) keys[e.key] = false;
  });

  function resetBall(scoredRight) {
    b = ball();
    b.dx = scoredRight ? 1 : -1;
  }

  function resetGame(resetScores = false) {
    if (resetScores) state.scores = { left: 0, right: 0 };
    left.y = H / 2 - left.h / 2;
    right.y = H / 2 - right.h / 2;
    resetBall(Math.random() < 0.5);
    state.paused = false;
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function updatePaddles() {
    // Right paddle: ArrowUp/ArrowDown
    right.dy = 0;
    if (keys.ArrowUp) right.dy -= right.speed;
    if (keys.ArrowDown) right.dy += right.speed;
    right.y = clamp(right.y + right.dy, 0, H - right.h);

    // Left paddle: AI in 1P, WASD in 2P
    if (state.modeTwoPlayer) {
      const up = keys.w || keys.W;
      const down = keys.s || keys.S;
      left.dy = 0;
      if (up) left.dy -= left.speed;
      if (down) left.dy += left.speed;
      left.y = clamp(left.y + left.dy, 0, H - left.h);
    } else {
      // Simple AI: track ball with capped reaction
      const target = b.y - (left.h / 2);
      const diff = target - left.y;
      const aiMax = 6; // reaction cap so you can actually score
      left.y += clamp(diff, -aiMax, aiMax);
      left.y = clamp(left.y, 0, H - left.h);
    }
  }

  function updateBall() {
    b.x += b.dx * b.speed;
    b.y += b.dy * b.speed;

    // Top/bottom bounce
    if (b.y - b.r <= 0 || b.y + b.r >= H) {
      b.dy *= -1;
      b.y = clamp(b.y, b.r, H - b.r);
    }

    // Paddle collisions
    // Left
    if (b.x - b.r <= left.x + left.w && b.x - b.r >= left.x) {
      if (b.y >= left.y && b.y <= left.y + left.h) {
        collideWithPaddle(left);
      }
    }
    // Right
    if (b.x + b.r >= right.x && b.x + b.r <= right.x + right.w) {
      if (b.y >= right.y && b.y <= right.y + right.h) {
        collideWithPaddle(right);
      }
    }

    // Scoring
    if (b.x + b.r < 0) {
      state.scores.right++;
      endOrServe(true);
    } else if (b.x - b.r > W) {
      state.scores.left++;
      endOrServe(false);
    }
  }

  function collideWithPaddle(p) {
    // Reflect horizontally
    b.dx *= -1;

    // Add spin based on hit position
    const hit = (b.y - (p.y + p.h / 2)) / (p.h / 2); // -1 top, 0 middle, 1 bottom
    b.dy = clamp(b.dy + hit * 0.6, -1.5, 1.5);

    // Nudge ball outside paddle to avoid re-collision
    if (p === left) b.x = left.x + left.w + b.r + 0.1;
    if (p === right) b.x = right.x - b.r - 0.1;

    // Slight speed up to keep rallies interesting
    b.speed = Math.min(b.speed + 0.15, 14);
  }

  function endOrServe(scoredRight) {
    if (state.scores.left >= state.maxScore || state.scores.right >= state.maxScore) {
      state.paused = true;
    } else {
      resetBall(scoredRight);
    }
  }

  // Rendering
  function drawCourt() {
    // Middle dashed line
    ctx.setLineDash([12, 12]);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CENTER.x, 0);
    ctx.lineTo(CENTER.x, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scores
    ctx.fillStyle = '#eaeaea';
    ctx.font = '48px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.scores.left, W * 0.25, 70);
    ctx.fillText(state.scores.right, W * 0.75, 70);

    // Mode label
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillStyle = '#c8c8c8';
    ctx.fillText(state.modeTwoPlayer ? '2 Player (W/S vs ↑/↓)' : '1 Player vs AI', CENTER.x, 30);
  }

  function drawPaddle(p) {
    ctx.fillStyle = '#d9d9d9';
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = '#f2f2f2';
    ctx.fill();
  }

  function drawPausedOverlay() {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const winner =
      state.scores.left >= state.maxScore
        ? 'Left Paddle wins'
        : state.scores.right >= state.maxScore
        ? 'Right Paddle wins'
        : null;
    if (winner) {
      ctx.fillText(`${winner}`, CENTER.x, CENTER.y - 10);
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText('Press R to reset. Press P to switch 1P/2P.', CENTER.x, CENTER.y + 24);
    } else {
      ctx.fillText('Paused', CENTER.x, CENTER.y);
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText('Space to resume', CENTER.x, CENTER.y + 28);
    }
  }

  // Main loop
  function loop() {
    ctx.clearRect(0, 0, W, H);

    if (!state.paused) {
      updatePaddles();
      updateBall();
    }

    drawCourt();
    drawPaddle(left);
    drawPaddle(right);
    drawBall();

    if (state.paused) drawPausedOverlay();

    requestAnimationFrame(loop);
  }

  // Kick off
  resetGame(true);
  loop();
})();
