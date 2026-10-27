
"use strict";

/* =========================================================
   CLASSROOM DAYDREAM V2.6
   COMPLETE SCRIPT.JS
   Pixel items and expressive character reactions
   ========================================================= */

/* CONFIGURATION */

const CONFIG = {
  duration: 60,
  targetScore: 8,
  maxCaught: 3,
  tickRate: 50,
  itemLifetime: 1900,
  itemSpawnMin: 350,
  itemSpawnMax: 750,
  safeMin: 2800,
  safeMax: 4600,
  warningMin: 900,
  warningMax: 1400,
  watchingMin: 1400,
  watchingMax: 2200
};

/* =========================================================
   1. PIXEL ART
   "." = transparent
   Other letters = palette colors
   ========================================================= */

const PALETTE = {
  K: "#68493e",
  O: "#e78a35",
  L: "#f8b84c",
  G: "#5c9a43",
  D: "#376e47",
  C: "#f6d2a1",
  B: "#b97142",
  H: "#fff2ca",
  W: "#fffaf1",
  Y: "#ffd65e",
  P: "#e893ac",
  R: "#e97172",
  V: "#9d75ba",
  T: "#75b9ac"
};

const PIXEL_ART = {
  carrot: [
    "......GG.......",
    ".....GDDG......",
    "......GGG......",
    ".....KKOO......",
    "....KLOOOK.....",
    "....KLOOOLK....",
    ".....KLOOOK....",
    ".....KLOOOK....",
    "......KLOK.....",
    "......KLOK.....",
    ".......KK......",
    ".......KK......",
    "........K......"
  ],

  cookie: [
    ".....KKKK......",
    "...KKLLLLKK....",
    "..KLLLCLLLLK...",
    ".KLLLBLLLLLLK..",
    ".KLLLLLKLLLLK..",
    "KLLLCLLLLLBLK..",
    "KLLLLLBLCCCCK..",
    "KLLLBLLLLLLLK..",
    ".KLLLCLLBLCLK..",
    ".KLLLLLLLLLK...",
    "..KLLBLLLLK....",
    "...KKLLLLKK....",
    ".....KKKK......"
  ],

  doodle: [
    "...........KK..",
    "..........KPK..",
    ".........KPPK..",
    "........KPPK...",
    ".......KPPK....",
    "......KPPK.....",
    ".....KPPK......",
    "....KPPK.......",
    "...KPPK........",
    "..KPPK.........",
    ".KBBK..........",
    ".KBBK..........",
    "..KK..........."
  ],

  star: [
    ".......YY......",
    "......YYYY.....",
    "......YYYY.....",
    ".YYY.YYYY.YYY..",
    ".KYYYYYYYYYYK..",
    "..KYYYYYYYYK...",
    "...KYYYYYYK....",
    "....YYYYYY.....",
    "...YYYYYYYY....",
    "..YYYY..YYYY...",
    ".YYY......YYY.."
  ],

  flower: [
    "......PP.......",
    "....PPPPPP.....",
    "....PPYYPP.....",
    "..PPYYYYYYPP...",
    "..PPYYYYYYPP...",
    "....PPYYPP.....",
    "....PPPPPP.....",
    "......DD.......",
    "......DD.......",
    "...GG.DD.GG....",
    "..GGG.DD.GGG...",
    "......DD.......",
    "......DD......."
  ]
};

function pixelSprite(name) {
  const rows = PIXEL_ART[name];

  if (!rows) return "";

  const width = Math.max(
    ...rows.map(row => row.length)
  );

  const height = rows.length;
  let rectangles = "";

  rows.forEach((row, y) => {
    Array.from(row).forEach((key, x) => {
      const color = PALETTE[key];

      if (!color) return;

      rectangles +=
        `<rect x="${x}" y="${y}" ` +
        `width="1" height="1" ` +
        `fill="${color}"/>`;
    });
  });

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `viewBox="0 0 ${width} ${height}" ` +
    `shape-rendering="crispEdges">` +
    rectangles +
    `</svg>`;

  return "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(svg);
}

const SPRITES = {};

Object.keys(PIXEL_ART).forEach(name => {
  SPRITES[name] = pixelSprite(name);
});

/* =========================================================
   2. GAME ITEMS
   ========================================================= */

const ITEMS = [
  {
    id: "carrot",
    name: "胡萝卜",
    points: 1,
    sound: 650,
    animation: "gp-eat-carrot",
    duration: 1600,
    message: "🥕 小豚鼠左右鼓起脸颊，正在咀嚼胡萝卜！"
  },

  {
    id: "cookie",
    name: "饼干",
    points: 1,
    sound: 550,
    animation: "gp-eat-cookie",
    duration: 1600,
    message: "🍪 咔嚓！小豚鼠闭上眼睛开心地摇晃！"
  },

  {
    id: "doodle",
    name: "涂鸦",
    points: 1,
    sound: 750,
    animation: "gp-draw",
    duration: 1800,
    message: "🎨 小豚鼠正在偷偷画一朵像素小花！"
  },

  {
    id: "star",
    name: "星星",
    points: 1,
    sound: 880,
    animation: "gp-star",
    duration: 1500,
    message: "⭐ 小豚鼠高兴地跳起来，周围闪闪发光！"
  }
];

/* =========================================================
   3. HTML REFERENCES
   ========================================================= */

const el = {
  time: document.getElementById("time-value"),
  score: document.getElementById("score-value"),
  caught: document.getElementById("caught-value"),
  status: document.getElementById("teacher-status"),
  teacher: document.getElementById("teacher"),
  student: document.getElementById("student"),
  collectible: document.getElementById("collectible"),
  itemIcon: document.getElementById("collectible-icon"),
  layer: document.getElementById("interaction-layer"),
  effect: document.getElementById("effect"),
  feedback: document.getElementById("feedback"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayMessage: document.getElementById("overlay-message"),
  startButton: document.getElementById("start-button"),
  pauseButton: document.getElementById("pause-button"),
  resetButton: document.getElementById("reset-button"),
  soundButton: document.getElementById("sound-button")
};

for (const [name, element] of Object.entries(el)) {
  if (!element) {
    throw new Error("Missing HTML element: " + name);
  }
}

/* =========================================================
   4. STATE
   ========================================================= */

function initialState() {
  return {
    mode: "ready",
    timeLeft: CONFIG.duration * 1000,
    score: 0,
    caught: 0,
    teacherState: "safe",
    teacherTimeLeft: 3500,
    activeItem: null,
    itemTimeLeft: 0,
    nextItemTime: 0,
    collectedCount: 0
  };
}

let state = initialState();

let timerId = null;
let lastTick = 0;
let reactionTimer = null;
let reactionToken = 0;

let soundEnabled = true;
let audioContext = null;

const random = (min, max) =>
  min + Math.random() * (max - min);

const playing = () => state.mode === "playing";

/* =========================================================
   5. SOUND
   ========================================================= */

function playSound(frequency, duration = 0.13) {
  if (!soundEnabled) return;

  try {
    const AudioClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioClass) return;

    if (!audioContext) {
      audioContext = new AudioClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = "square";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.022, now);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (error) {
    console.warn("Audio unavailable:", error);
  }
}

/* =========================================================
   6. INTERFACE
   ========================================================= */

function updateHUD() {
  const seconds = Math.ceil(state.timeLeft / 1000);

  el.time.textContent = String(seconds);
  el.score.textContent = String(state.score);

  el.caught.textContent =
    `${state.caught} / ${CONFIG.maxCaught}`;

  el.time.style.color =
    seconds <= 10 ? "#d96e7c" : "";

  el.caught.style.color =
    state.caught >= 2 ? "#d96e7c" : "";

  el.score.style.color =
    state.score >= CONFIG.targetScore
      ? "#559c72"
      : "";
}

function feedback(message) {
  el.feedback.textContent = message;
}

function showEffect(message) {
  el.effect.textContent = message;
  el.effect.classList.remove("pop");

  void el.effect.offsetWidth;

  el.effect.classList.add("pop");
}

function showOverlay(title, message, buttonText) {
  el.overlayTitle.textContent = title;
  el.overlayMessage.textContent = message;
  el.startButton.textContent = buttonText;
  el.overlay.hidden = false;
}

function hideOverlay() {
  el.overlay.hidden = true;
}

/* =========================================================
   7. PIXEL SPRITE ELEMENTS
   ========================================================= */

function makePixelImage(name, className) {
  const img = document.createElement("img");

  img.src = SPRITES[name];
  img.alt = "";
  img.className = className;
  img.draggable = false;

  img.setAttribute("aria-hidden", "true");

  return img;
}

function placePixelImage(name, className, x, y) {
  const img = makePixelImage(name, className);

  img.style.left = x + "px";
  img.style.top = y + "px";

  el.layer.appendChild(img);

  return img;
}

function getStudentPosition() {
  const scene = el.layer.getBoundingClientRect();
  const pig = el.student.getBoundingClientRect();

  return {
    x: pig.left + pig.width / 2 - scene.left,
    y: pig.top + pig.height * 0.59 - scene.top
  };
}

function makeDecoration(symbol, x, y) {
  const span = document.createElement("span");

  span.className = "foreground-sparkle";
  span.textContent = symbol;

  span.style.left = x + "px";
  span.style.top = y + "px";

  el.layer.appendChild(span);
}

/* =========================================================
   8. CLEAR REACTIONS
   ========================================================= */

function clearReaction() {
  reactionToken += 1;

  if (reactionTimer !== null) {
    clearTimeout(reactionTimer);
    reactionTimer = null;
  }

  el.student.classList.remove(
    "gp-eat-carrot",
    "gp-eat-cookie",
    "gp-draw",
    "gp-star",
    "gp-hide",
    "happy",
    "scared"
  );

  el.layer.replaceChildren();
  delete el.layer.dataset.item;
}

/* =========================================================
   9. COOKIE CRUMBS
   ========================================================= */

function makeCookieCrumbs(x, y) {
  for (let i = 0; i < 9; i++) {
    const crumb = document.createElement("span");

    crumb.className = "pixel-crumb";

    crumb.style.left = x + random(-8, 8) + "px";
    crumb.style.top = y + random(-8, 8) + "px";

    crumb.style.setProperty(
      "--dx",
      random(-55, 55) + "px"
    );

    crumb.style.setProperty(
      "--dy",
      random(-42, 50) + "px"
    );

    crumb.style.animationDelay =
      random(0.12, 0.38) + "s";

    el.layer.appendChild(crumb);
  }
}

/* =========================================================
   10. STAR PARTICLES
   ========================================================= */

function makeStarParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    const star = document.createElement("span");

    star.className = "pixel-twinkle";

    const angle = i * Math.PI * 2 / 10;
    const radius = random(30, 88);

    star.style.left =
      x + Math.cos(angle) * radius + "px";

    star.style.top =
      y + Math.sin(angle) * radius + "px";

    star.style.animationDelay =
      random(0, 0.4) + "s";

    el.layer.appendChild(star);
  }
}

/* =========================================================
   11. FOUR UNIQUE INTERACTIONS
   ========================================================= */

function playItemReaction(item) {
  clearReaction();

  const token = reactionToken;
  const { x, y } = getStudentPosition();

  el.layer.dataset.item = item.id;

  void el.student.offsetWidth;
  el.student.classList.add(item.animation);

  // CARROT
  if (item.id === "carrot") {
    placePixelImage(
      "carrot",
      "foreground-prop",
      x + 22,
      y
    );

    makeDecoration("♥", x - 45, y - 65);
    makeDecoration("♥", x + 32, y - 80);
  }

  // COOKIE
  if (item.id === "cookie") {
    placePixelImage(
      "cookie",
      "foreground-prop",
      x + 24,
      y
    );

    makeCookieCrumbs(x + 15, y + 10);
  }

  // DOODLE
  if (item.id === "doodle") {
    const paper = document.createElement("div");

    paper.className = "foreground-doodle-paper";

    const sceneRect = el.layer.getBoundingClientRect();
    const deskRect =
      document.querySelector(".desk").getBoundingClientRect();

    const paperX = Math.min(
      x + 72,
      sceneRect.width - 55
    );

    const paperY = Math.min(
      y + 62,
      deskRect.top - sceneRect.top + 42
    );

    paper.style.left = paperX + "px";
    paper.style.top = paperY + "px";

    paper.appendChild(
      makePixelImage("flower", "pixel-item")
    );

    el.layer.appendChild(paper);

    placePixelImage(
      "doodle",
      "foreground-prop",
      paperX - 14,
      paperY - 19
    );
  }

  // STAR
  if (item.id === "star") {
    placePixelImage(
      "star",
      "foreground-prop",
      x + 8,
      y - 58
    );

    makeStarParticles(x, y - 35);
  }

  showEffect("+1");

  reactionTimer = setTimeout(() => {
    if (token !== reactionToken) return;
    clearReaction();
  }, item.duration);
}

/* =========================================================
   12. TEACHER APPEARANCE
   ========================================================= */

function updateTeacherAppearance() {
  el.teacher.classList.remove(
    "facing-away",
    "warning",
    "watching"
  );

  el.status.classList.remove(
    "safe",
    "warning",
    "danger"
  );

  if (state.teacherState === "safe") {
    el.teacher.classList.add("facing-away");
    el.status.classList.add("safe");

    el.status.textContent =
      "🟢 SAFE！老师正在写黑板，可以偷偷行动！";
  }

  else if (state.teacherState === "warning") {
    el.teacher.classList.add("warning");
    el.status.classList.add("warning");

    el.status.textContent =
      "🟡 WARNING！老师准备回头了！";
  }

  else {
    el.teacher.classList.add("watching");
    el.status.classList.add("danger");

    el.status.textContent =
      "🔴 STOP！老师正在看你！不要点击！";
  }
}

/* =========================================================
   13. TEACHER STATE TRANSITIONS
   ========================================================= */

function advanceTeacher() {
  if (state.teacherState === "safe") {
    state.teacherState = "warning";

    state.teacherTimeLeft = random(
      CONFIG.warningMin,
      CONFIG.warningMax
    );

    clearReaction();
    el.student.classList.add("gp-hide");

    feedback("⚠️ 老师准备回头！赶快藏好东西！");
    playSound(350);
  }

  else if (state.teacherState === "warning") {
    state.teacherState = "watching";

    state.teacherTimeLeft = random(
      CONFIG.watchingMin,
      CONFIG.watchingMax
    );

    el.student.classList.remove("gp-hide");

    feedback("👀 老师正在看你！不要点击！");
    playSound(240, 0.2);
  }

  else {
    state.teacherState = "safe";

    state.teacherTimeLeft = random(
      CONFIG.safeMin,
      CONFIG.safeMax
    );

    clearReaction();

    feedback("🌿 老师回去写黑板了，可以继续！");
  }

  updateTeacherAppearance();
}

function updateTeacher(delta) {
  state.teacherTimeLeft -= delta;

  while (state.teacherTimeLeft <= 0) {
    const overflow = -state.teacherTimeLeft;

    advanceTeacher();

    state.teacherTimeLeft -= overflow;
  }
}

/* =========================================================
   14. ITEM SPAWNING
   ========================================================= */

function hideItem() {
  state.activeItem = null;
  state.itemTimeLeft = 0;

  el.collectible.hidden = true;
  el.collectible.disabled = true;
}

function scheduleItem() {
  state.nextItemTime = random(
    CONFIG.itemSpawnMin,
    CONFIG.itemSpawnMax
  );
}

function spawnItem() {
  if (!playing() || state.activeItem) return;

  const item = ITEMS[
    Math.floor(Math.random() * ITEMS.length)
  ];

  state.activeItem = item;
  state.itemTimeLeft = CONFIG.itemLifetime;

  // Transparent pixel image instead of emoji.
  el.itemIcon.replaceChildren(
    makePixelImage(item.id, "pixel-item")
  );

  const positions = [
    { left: 27, bottom: 31 },
    { left: 39, bottom: 35 },
    { left: 51, bottom: 31 },
    { left: 63, bottom: 35 }
  ];

  const pos = positions[
    Math.floor(Math.random() * positions.length)
  ];

  el.collectible.style.left = pos.left + "%";
  el.collectible.style.bottom = pos.bottom + "%";

  el.collectible.setAttribute(
    "aria-label",
    "收集" + item.name
  );

  el.collectible.hidden = false;
  el.collectible.disabled = false;
}

function updateItems(delta) {
  if (state.activeItem) {
    state.itemTimeLeft -= delta;

    if (state.itemTimeLeft <= 0) {
      hideItem();
      scheduleItem();
    }
  } else {
    state.nextItemTime -= delta;

    if (state.nextItemTime <= 0) {
      spawnItem();
    }
  }
}

/* =========================================================
   15. COLLECT ITEM
   ========================================================= */

function collectItem() {
  if (!playing() || !state.activeItem) return;

  const item = state.activeItem;

  // Prevent repeated scoring from rapid clicks.
  hideItem();
  scheduleItem();

  // RED STATE
  if (state.teacherState === "watching") {
    state.caught += 1;

    clearReaction();
    el.student.classList.add("scared");

    showEffect("!");
    playSound(170, 0.25);

    feedback(
      `🚨 被老师发现！${state.caught}/${CONFIG.maxCaught}`
    );

    updateHUD();

    if (state.caught >= CONFIG.maxCaught) {
      finishGame(false, "被老师发现了 3 次！");
    }

    return;
  }

  // YELLOW STATE
  if (state.teacherState === "warning") {
    clearReaction();
    el.student.classList.add("gp-hide");

    showEffect("!");
    playSound(300);

    feedback("⚠️ 老师快回头了！本次不加分。");
    return;
  }

  // GREEN STATE
  state.score += item.points;
  state.collectedCount += 1;

  playItemReaction(item);
  playSound(item.sound);

  updateHUD();

  feedback(
    `${item.message} 当前 ${state.score}/${CONFIG.targetScore} 分。`
  );
}

/* =========================================================
   16. TIMER
   ========================================================= */

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function tick() {
  if (!playing()) return;

  const now = performance.now();
  const delta = Math.max(0, now - lastTick);

  lastTick = now;

  state.timeLeft = Math.max(
    0,
    state.timeLeft - delta
  );

  if (state.timeLeft <= 0) {
    state.timeLeft = 0;

    const won =
      state.score >= CONFIG.targetScore &&
      state.caught < CONFIG.maxCaught;

    finishGame(
      won,
      won
        ? "成功坚持到下课！"
        : "下课了，但分数还不够！"
    );

    return;
  }

  updateTeacher(delta);
  updateItems(delta);
  updateHUD();
}

function startTimer() {
  stopTimer();

  lastTick = performance.now();

  timerId = setInterval(
    tick,
    CONFIG.tickRate
  );
}

/* =========================================================
   17. START / PAUSE / RESUME
   ========================================================= */

function startGame() {
  if (playing()) return;

  if (state.mode === "paused") {
    resumeGame();
    return;
  }

  if (state.mode === "finished") {
    resetGame();
  }

  clearReaction();

  state.mode = "playing";
  state.teacherState = "safe";
  state.teacherTimeLeft = 3500;

  hideOverlay();

  el.pauseButton.disabled = false;
  el.pauseButton.textContent = "⏸ 暂停";

  updateTeacherAppearance();

  scheduleItem();
  startTimer();

  feedback("🎮 游戏开始！安全时点击像素道具！");
  playSound(700);
}

function pauseGame() {
  if (!playing()) return;

  state.mode = "paused";

  stopTimer();
  clearReaction();

  el.collectible.hidden = true;
  el.collectible.disabled = true;

  el.pauseButton.textContent = "▶ 继续";

  showOverlay(
    "PAUSED",
    "游戏已暂停。点击继续恢复。",
    "▶ 继续游戏"
  );

  feedback("⏸ 游戏暂停中。");
}

function resumeGame() {
  if (state.mode !== "paused") return;

  state.mode = "playing";

  hideOverlay();

  el.pauseButton.textContent = "⏸ 暂停";

  if (state.activeItem) {
    el.collectible.hidden = false;
    el.collectible.disabled = false;
  }

  updateTeacherAppearance();
  startTimer();

  feedback("▶ 游戏继续！");
}

/* =========================================================
   18. END GAME
   ========================================================= */

function finishGame(won, reason) {
  if (state.mode === "finished") return;

  state.mode = "finished";

  stopTimer();
  clearReaction();
  hideItem();

  el.pauseButton.disabled = true;
  el.pauseButton.textContent = "⏸ 暂停";

  const summary =
    `${reason}\n` +
    `最终分数：${state.score}\n` +
    `成功收集：${state.collectedCount}\n` +
    `被老师发现：${state.caught} 次`;

  if (won) {
    el.student.classList.add("happy");
    playSound(950, 0.3);

    showOverlay(
      "YOU WIN! 🏆",
      summary,
      "↻ 再玩一次"
    );

    feedback("🎉 小豚鼠成功坚持到了下课！");
  } else {
    el.student.classList.add("scared");
    playSound(180, 0.3);

    showOverlay(
      "GAME OVER",
      summary,
      "↻ 再试一次"
    );

    feedback("💔 挑战失败！下次注意老师的方向。");
  }

  updateHUD();
}

/* =========================================================
   19. RESET
   ========================================================= */

function resetGame() {
  stopTimer();
  clearReaction();

  state = initialState();

  hideItem();

  el.effect.classList.remove("pop");
  el.effect.textContent = "";

  el.pauseButton.disabled = true;
  el.pauseButton.textContent = "⏸ 暂停";

  updateHUD();
  updateTeacherAppearance();

  showOverlay(
    "READY TO PLAY?",
    "60 秒内收集至少 8 分，\n" +
    "被老师发现不能达到 3 次！",
    "▶ 开始游戏"
  );

  feedback("🐹 小豚鼠准备好了！点击开始游戏。");
}

/* =========================================================
   20. EVENTS
   ========================================================= */

el.startButton.addEventListener("click", () => {
  if (state.mode === "paused") {
    resumeGame();
  } else {
    startGame();
  }
});

el.collectible.addEventListener(
  "click",
  collectItem
);

el.pauseButton.addEventListener("click", () => {
  if (playing()) {
    pauseGame();
  } else if (state.mode === "paused") {
    resumeGame();
  }
});

el.resetButton.addEventListener(
  "click",
  resetGame
);

el.soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  el.soundButton.textContent = soundEnabled
    ? "🔊 音效开启"
    : "🔇 音效关闭";

  el.soundButton.setAttribute(
    "aria-pressed",
    String(soundEnabled)
  );

  if (soundEnabled) playSound(700);
});

/* Keyboard: Space to pause or resume. */

document.addEventListener("keydown", event => {
  if (
    event.code === "Space" &&
    event.target === document.body
  ) {
    if (playing()) {
      event.preventDefault();
      pauseGame();
    } else if (state.mode === "paused") {
      event.preventDefault();
      resumeGame();
    }
  }
});

/* Pause automatically when leaving the page. */

document.addEventListener("visibilitychange", () => {
  if (document.hidden && playing()) {
    pauseGame();
  }
});

window.addEventListener("blur", () => {
  if (playing()) {
    pauseGame();
  }
});

/* =========================================================
   21. INITIALIZE
   ========================================================= */

resetGame();
