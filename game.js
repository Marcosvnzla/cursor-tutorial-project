// Initialize Kaboom.js with optimizations
kaboom({
  global: true,
  fullscreen: false,
  scale: 1,
  debug: false, // Disable debug for performance
  clearColor: [0.53, 0.81, 0.92, 1], // Sky blue background
  canvas: document.querySelector("#gameCanvas"),
  width: 1024,
  height: 576,
  crisp: true, // Crisp pixel art rendering
  touchToMouse: true, // Enable touch controls for mobile
});

// Game constants
const PLAYER_SPEED = 200;
const JUMP_FORCE = 500;
const GRAVITY = 1200;

// Game state
let gameState = "title";
let score = 0;
let lives = 3;
let currentLevel = 1;

// Load sprites with animations
loadSprite(
  "player",
  "data:image/svg+xml;base64," +
    btoa(`
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
  <rect x="8" y="8" width="4" height="4" fill="#333"/>
  <rect x="20" y="8" width="4" height="4" fill="#333"/>
  <rect x="10" y="16" width="12" height="4" fill="#333"/>
</svg>
`)
);

loadSprite(
  "player-jump",
  "data:image/svg+xml;base64," +
    btoa(`
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#ff6b6b" stroke="#333" stroke-width="2"/>
  <rect x="8" y="6" width="4" height="4" fill="#333"/>
  <rect x="20" y="6" width="4" height="4" fill="#333"/>
  <ellipse cx="16" cy="18" rx="8" ry="3" fill="#333"/>
</svg>
`)
);

loadSprite(
  "platform",
  "data:image/svg+xml;base64," +
    btoa(`
<svg width="64" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="32" fill="#8B4513" stroke="#654321" stroke-width="2"/>
  <rect x="4" y="4" width="56" height="4" fill="#A0522D"/>
</svg>
`)
);

loadSprite(
  "enemy",
  "data:image/svg+xml;base64=" +
    btoa(`
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#ff4757" stroke="#333" stroke-width="2"/>
  <rect x="6" y="6" width="4" height="4" fill="#333"/>
  <rect x="22" y="6" width="4" height="4" fill="#333"/>
  <rect x="8" y="20" width="16" height="4" fill="#333"/>
</svg>
`)
);

loadSprite(
  "coin",
  "data:image/svg+xml;base64=" +
    btoa(`
<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" fill="#ffd700" stroke="#ffb300" stroke-width="2"/>
  <text x="12" y="16" text-anchor="middle" fill="#ffb300" font-family="Arial" font-size="12" font-weight="bold">$</text>
</svg>
`)
);

// Load sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Simple sound generation functions
function createBeep(frequency, duration, type = "sine") {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

function playJumpSound() {
  createBeep(400, 0.2, "square");
}

function playCoinSound() {
  createBeep(800, 0.1, "sine");
  setTimeout(() => createBeep(1000, 0.1, "sine"), 50);
}

function playEnemyDefeatSound() {
  createBeep(200, 0.3, "sawtooth");
}

function playLevelCompleteSound() {
  createBeep(523, 0.2, "sine"); // C
  setTimeout(() => createBeep(659, 0.2, "sine"), 100); // E
  setTimeout(() => createBeep(784, 0.2, "sine"), 200); // G
  setTimeout(() => createBeep(1047, 0.4, "sine"), 300); // C
}

function playGameOverSound() {
  createBeep(392, 0.5, "triangle"); // G
  setTimeout(() => createBeep(349, 0.5, "triangle"), 200); // F
  setTimeout(() => createBeep(330, 0.5, "triangle"), 400); // E
  setTimeout(() => createBeep(294, 1.0, "triangle"), 600); // D
}

// Title Screen Scene
scene("title", () => {
  add([
    text("SUPER PLATFORMER", {
      size: 48,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 - 100),
    anchor("center"),
    color(255, 255, 255),
  ]);

  add([
    text("Press SPACE to Start", {
      size: 24,
      font: "sink",
    }),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(255, 255, 255),
  ]);

  add([
    text("Use ARROW KEYS to move, SPACE to jump", {
      size: 16,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 + 50),
    anchor("center"),
    color(200, 200, 200),
  ]);

  add([
    text("Touch controls: Tap left/right sides to move, center to jump", {
      size: 12,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 + 80),
    anchor("center"),
    color(150, 150, 150),
  ]);

  // Start game on space press
  onKeyPress("space", () => {
    go("game");
  });
});

// Level configurations
const levels = {
  1: {
    playerStart: vec2(100, 400),
    platforms: [
      // Ground platforms
      { pos: vec2(0, height() - 32) },
      { pos: vec2(64, height() - 32) },
      { pos: vec2(128, height() - 32) },
      { pos: vec2(192, height() - 32) },
      { pos: vec2(256, height() - 32) },
      { pos: vec2(320, height() - 32) },
      { pos: vec2(384, height() - 32) },
      { pos: vec2(448, height() - 32) },
      { pos: vec2(512, height() - 32) },
      { pos: vec2(576, height() - 32) },
      { pos: vec2(640, height() - 32) },
      { pos: vec2(704, height() - 32) },
      { pos: vec2(768, height() - 32) },
      { pos: vec2(832, height() - 32) },
      { pos: vec2(896, height() - 32) },
      { pos: vec2(960, height() - 32) },
      // Floating platforms
      { pos: vec2(300, 450) },
      { pos: vec2(500, 400) },
      { pos: vec2(700, 420) },
      { pos: vec2(800, 380) },
    ],
    enemies: [
      { pos: vec2(400, 480), dir: 1, speed: 50 },
      { pos: vec2(600, 370), dir: -1, speed: 30 },
    ],
    coins: [
      { pos: vec2(350, 400) },
      { pos: vec2(550, 350) },
      { pos: vec2(750, 370) },
      { pos: vec2(850, 330) },
    ],
    goal: vec2(900, 330),
  },
  2: {
    playerStart: vec2(100, 400),
    platforms: [
      // Ground platforms (with gaps)
      { pos: vec2(0, height() - 32) },
      { pos: vec2(64, height() - 32) },
      { pos: vec2(128, height() - 32) },
      { pos: vec2(256, height() - 32) },
      { pos: vec2(320, height() - 32) },
      { pos: vec2(448, height() - 32) },
      { pos: vec2(512, height() - 32) },
      { pos: vec2(640, height() - 32) },
      { pos: vec2(704, height() - 32) },
      { pos: vec2(832, height() - 32) },
      { pos: vec2(896, height() - 32) },
      { pos: vec2(960, height() - 32) },
      // More challenging floating platforms
      { pos: vec2(200, 450) },
      { pos: vec2(380, 420) },
      { pos: vec2(580, 380) },
      { pos: vec2(750, 350) },
      { pos: vec2(900, 320) },
      { pos: vec2(600, 280) },
      { pos: vec2(400, 250) },
    ],
    enemies: [
      { pos: vec2(300, 480), dir: 1, speed: 60 },
      { pos: vec2(500, 350), dir: -1, speed: 40 },
      { pos: vec2(700, 320), dir: 1, speed: 70 },
    ],
    coins: [
      { pos: vec2(250, 400) },
      { pos: vec2(430, 370) },
      { pos: vec2(630, 330) },
      { pos: vec2(800, 300) },
      { pos: vec2(950, 270) },
      { pos: vec2(650, 230) },
    ],
    goal: vec2(950, 270),
  },
  3: {
    playerStart: vec2(100, 400),
    platforms: [
      // Minimal ground platforms
      { pos: vec2(0, height() - 32) },
      { pos: vec2(64, height() - 32) },
      { pos: vec2(960, height() - 32) },
      // Sky level with many floating platforms
      { pos: vec2(200, 450) },
      { pos: vec2(300, 420) },
      { pos: vec2(450, 390) },
      { pos: vec2(600, 360) },
      { pos: vec2(750, 340) },
      { pos: vec2(500, 320) },
      { pos: vec2(350, 300) },
      { pos: vec2(650, 280) },
      { pos: vec2(800, 260) },
      { pos: vec2(400, 240) },
      { pos: vec2(700, 220) },
      { pos: vec2(900, 200) },
    ],
    enemies: [
      { pos: vec2(250, 420), dir: 1, speed: 80 },
      { pos: vec2(500, 290), dir: -1, speed: 60 },
      { pos: vec2(700, 190), dir: 1, speed: 90 },
      { pos: vec2(850, 170), dir: -1, speed: 50 },
    ],
    coins: [
      { pos: vec2(250, 400) },
      { pos: vec2(400, 370) },
      { pos: vec2(550, 340) },
      { pos: vec2(700, 310) },
      { pos: vec2(550, 270) },
      { pos: vec2(400, 190) },
      { pos: vec2(700, 170) },
      { pos: vec2(850, 150) },
      { pos: vec2(450, 170) },
      { pos: vec2(750, 150) },
    ],
    goal: vec2(950, 150),
  },
};

// Main Game Scene
scene("game", () => {
  // Set gravity
  setGravity(GRAVITY);

  // Get current level data
  const levelData = levels[currentLevel];
  if (!levelData) {
    // No more levels, show victory screen
    go("victory");
    return;
  }

  // Create UI
  const scoreText = add([
    text(`Score: ${score}`, { size: 24 }),
    pos(20, 20),
    color(255, 255, 255),
    z(100),
  ]);

  const livesText = add([
    text(`Lives: ${lives}`, { size: 24 }),
    pos(20, 50),
    color(255, 255, 255),
    z(100),
  ]);

  const levelText = add([
    text(`Level: ${currentLevel}`, { size: 24 }),
    pos(20, 80),
    color(255, 255, 255),
    z(100),
  ]);

  // Create player with animation state
  const player = add([
    sprite("player"),
    pos(levelData.playerStart),
    area(),
    body(),
    anchor("center"),
    "player",
  ]);

  // Track jumping state with a simple boolean variable outside the player object
  let playerIsJumping = false;

  // Create platforms from level data
  levelData.platforms.forEach((platformData) => {
    add([
      sprite("platform"),
      pos(platformData.pos),
      area(),
      body({ isStatic: true }),
      "platform",
    ]);
  });

  // Create enemies from level data
  levelData.enemies.forEach((enemyData) => {
    add([
      sprite("enemy"),
      pos(enemyData.pos),
      area(),
      body(),
      anchor("center"),
      "enemy",
      { dir: enemyData.dir, speed: enemyData.speed },
    ]);
  });

  // Create coins from level data with floating animation
  levelData.coins.forEach((coinData, index) => {
    const coin = add([
      sprite("coin"),
      pos(coinData.pos),
      area(),
      anchor("center"),
      "coin",
      { baseY: coinData.pos.y, floatOffset: index * 60 },
    ]);

    // Floating animation
    coin.onUpdate(() => {
      coin.pos.y = coin.baseY + Math.sin(time() * 3 + coin.floatOffset) * 8;
    });
  });

  // Create goal/flag
  const goal = add([
    rect(20, 60),
    pos(levelData.goal),
    area(),
    color(0, 255, 0),
    anchor("center"),
    "goal",
  ]);

  // Add flag pole
  add([
    rect(4, 80),
    pos(levelData.goal.x - 10, levelData.goal.y - 10),
    color(139, 69, 19),
    anchor("center"),
  ]);

  // Player movement - keyboard controls
  onKeyDown("left", () => {
    player.move(-PLAYER_SPEED, 0);
  });

  onKeyDown("right", () => {
    player.move(PLAYER_SPEED, 0);
  });

  onKeyPress("space", () => {
    if (player.isGrounded()) {
      player.jump(JUMP_FORCE);
      playerIsJumping = true;
      player.use(sprite("player-jump"));
      playJumpSound();
    }
  });

  // Touch controls for mobile
  let touchLeft = false;
  let touchRight = false;

  onTouchStart((pos) => {
    const touchX = pos.x;
    const screenWidth = width();

    if (touchX < screenWidth / 3) {
      touchLeft = true;
    } else if (touchX > (screenWidth * 2) / 3) {
      touchRight = true;
    } else {
      // Center tap for jump
      if (player.isGrounded()) {
        player.jump(JUMP_FORCE);
        playerIsJumping = true;
        player.use(sprite("player-jump"));
        playJumpSound();
      }
    }
  });

  onTouchEnd(() => {
    touchLeft = false;
    touchRight = false;
  });

  // Apply touch movement
  onUpdate(() => {
    if (touchLeft) {
      player.move(-PLAYER_SPEED, 0);
    }
    if (touchRight) {
      player.move(PLAYER_SPEED, 0);
    }
  });

  // Handle landing animation with simple update check
  player.onUpdate(() => {
    // Reset jump state when player lands (is grounded and was jumping)
    if (playerIsJumping && player.isGrounded()) {
      playerIsJumping = false;
      player.use(sprite("player"));
    }
  });

  // Enemy AI - simple patrol
  onUpdate("enemy", (enemy) => {
    enemy.move(enemy.dir * enemy.speed, 0);

    // Reverse direction at platform edges or when hitting walls
    if (enemy.pos.x <= 50 || enemy.pos.x >= width() - 50) {
      enemy.dir *= -1;
    }
  });

  // Collision detection
  player.onCollide("enemy", (enemy) => {
    if (player.pos.y < enemy.pos.y - 10) {
      // Player jumped on enemy
      destroy(enemy);
      player.jump(JUMP_FORCE * 0.5);
      score += 100;
      scoreText.text = `Score: ${score}`;
      playEnemyDefeatSound();

      // Add visual effect
      add([
        text("+100", { size: 20 }),
        pos(enemy.pos),
        color(255, 255, 0),
        anchor("center"),
        lifespan(1, { fade: 0.5 }),
        move(UP, 50),
      ]);
    } else {
      // Player hit enemy
      lives--;
      livesText.text = `Lives: ${lives}`;

      if (lives <= 0) {
        playGameOverSound();
        go("gameover");
      } else {
        // Respawn player
        player.pos = levelData.playerStart;
      }
    }
  });

  player.onCollide("coin", (coin) => {
    destroy(coin);
    score += 50;
    scoreText.text = `Score: ${score}`;
    playCoinSound();

    // Add visual effect
    add([
      text("+50", { size: 16 }),
      pos(coin.pos),
      color(255, 215, 0),
      anchor("center"),
      lifespan(0.8, { fade: 0.4 }),
      move(UP, 30),
    ]);

    // Coin spin animation
    add([
      circle(12),
      pos(coin.pos),
      color(255, 215, 0),
      anchor("center"),
      lifespan(0.3, { fade: 0.2 }),
      scale(2),
    ]);
  });

  // Goal collision - advance to next level
  player.onCollide("goal", () => {
    currentLevel++;
    score += 500; // Bonus for completing level
    playLevelCompleteSound();

    // Add level complete effect
    add([
      text("LEVEL COMPLETE!", { size: 32 }),
      pos(width() / 2, height() / 2),
      color(0, 255, 0),
      anchor("center"),
      lifespan(2, { fade: 1 }),
    ]);

    wait(1, () => go("game")); // Delay before loading next level
  });

  // Camera follows player
  player.onUpdate(() => {
    camPos(player.pos.x, height() / 2);
  });

  // Check if player falls off the world
  player.onUpdate(() => {
    if (player.pos.y > height() + 100) {
      lives--;
      livesText.text = `Lives: ${lives}`;

      if (lives <= 0) {
        go("gameover");
      } else {
        player.pos = levelData.playerStart;
      }
    }
  });
});

// Game Over Scene
scene("gameover", () => {
  add([
    text("GAME OVER", {
      size: 48,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 - 100),
    anchor("center"),
    color(255, 100, 100),
  ]);

  add([
    text(`Final Score: ${score}`, {
      size: 32,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 - 20),
    anchor("center"),
    color(255, 255, 255),
  ]);

  add([
    text("Press R to Restart", {
      size: 24,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 + 50),
    anchor("center"),
    color(200, 200, 200),
  ]);

  onKeyPress("r", () => {
    // Reset game state
    score = 0;
    lives = 3;
    currentLevel = 1;
    go("title");
  });
});

// Victory Scene
scene("victory", () => {
  add([
    text("CONGRATULATIONS!", {
      size: 48,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 - 150),
    anchor("center"),
    color(255, 215, 0),
  ]);

  add([
    text("You completed all levels!", {
      size: 32,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 - 80),
    anchor("center"),
    color(255, 255, 255),
  ]);

  add([
    text(`Final Score: ${score}`, {
      size: 36,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 - 20),
    anchor("center"),
    color(255, 255, 255),
  ]);

  add([
    text("🏆 MASTER PLATFORMER 🏆", {
      size: 28,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 + 40),
    anchor("center"),
    color(255, 215, 0),
  ]);

  add([
    text("Press R to Play Again", {
      size: 24,
      font: "sink",
    }),
    pos(width() / 2, height() / 2 + 100),
    anchor("center"),
    color(200, 200, 200),
  ]);

  onKeyPress("r", () => {
    // Reset game state
    score = 0;
    lives = 3;
    currentLevel = 1;
    go("title");
  });
});

// Start with title screen
go("title");
