
"use strict";

/*
 * CLASSROOM DAYDREAM V2.0
 * SD5913 - Assignment 3
 *
 * Guinea Pig Classroom Game
 *
 * Game mechanics:
 * - Red Light, Green Light
 * - Random collectible objects
 * - Teacher observation system
 * - 60-second challenge
 * - Score and caught detection
 * - Pause / Resume / Restart
 * - Sound effects
 * - Error and interruption handling
 *
 * No external JavaScript libraries required.
 */

// ==========================================
// 1. GAME CONFIGURATION
// ==========================================

const CONFIG = {
  duration: 60,
  targetScore: 8,
  maxCaught: 3,
  tickRate: 50,

  itemLifetime: 1900,
  itemSpawnMin: 250,
  itemSpawnMax: 650,

  safeMin: 2800,
  safeMax: 4600,

  warningMin: 900,
  warningMax: 1400,

  watchingMin: 1400,
  watchingMax: 2200
};

// ==========================================
// 2. COLLECTIBLE ITEMS
// ==========================================

const ITEMS = [
  {
    id: "carrot",
    name: "胡萝卜",
    icon: "🥕",
    points: 1,
    sound: 650
  },
  {
    id: "cookie",
    name: "饼干",
    icon: "🍪",
    points: 1,
    sound: 550
  },
  {
    id: "doodle",
    name: "涂鸦",
    icon: "🎨",
    points: 1,
    sound: 750
  },
  {
    id: "star",
    name: "幸运星",
    icon: "⭐",
    points: 1,
    sound: 880
  }
];

// ==========================================
// 3. INITIAL GAME STATE
// ==========================================

function createInitialState() {
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

    collectedCount: 0,
    missedCount: 0,

    lastCollectedItem: null
  };
}

let gameState = createInitialState();

let timerId = null;
let lastTick = 0;

let soundEnabled = true;
let audioContext = null;

// ==========================================
// 4. HTML ELEMENT REFERENCES
// ==========================================

const elements = {
  time: document.getElementById("time-value"),

  score: document.getElementById("score-value"),

  caught: document.getElementById("caught-value"),

  status: document.getElementById("teacher-status"),

  teacher: document.getElementById("teacher"),

  student: document.getElementById("student"),

  collectible: document.getElementById("collectible"),

  itemIcon: document.getElementById("collectible-icon"),

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

// ==========================================
// 5. CHECK REQUIRED HTML ELEMENTS
// ==========================================

function validateElements() {
  const missing = Object.entries(elements)
    .filter(function(entry) {
      return entry[1] === null;
    })
    .map(function(entry) {
      return entry[0];
    });

  if (missing.length > 0) {
    console.error(
      "Missing HTML elements:",
      missing.join(", ")
    );

    throw new Error(
      "Game initialization failed. Missing: " +
      missing.join(", ")
    );
  }
}

validateElements();

// ==========================================
// 6. HELPER FUNCTIONS
// ==========================================

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

function showFeedback(message) {
  elements.feedback.textContent = message;
}

function isPlaying() {
  return gameState.mode === "playing";
}

// ==========================================
// 7. UPDATE GAME HUD
// ==========================================

function updateHUD() {
  const seconds = Math.ceil(
    gameState.timeLeft / 1000
  );

  elements.time.textContent = seconds;

  elements.score.textContent = gameState.score;

  elements.caught.textContent =
    gameState.caught +
    " / " +
    CONFIG.maxCaught;

  // Time warning
  if (seconds <= 10) {
    elements.time.style.color = "#d56b78";
  } else {
    elements.time.style.color = "";
  }

  // Caught warning
  if (gameState.caught >= 2) {
    elements.caught.style.color = "#d56b78";
  } else {
    elements.caught.style.color = "";
  }

  // Score achieved
  if (gameState.score >= CONFIG.targetScore) {
    elements.score.style.color = "#559c72";
  } else {
    elements.score.style.color = "";
  }
}

// ==========================================
// 8. SOUND ENGINE
// ==========================================

function playSound(frequency, duration = 0.13) {
  if (!soundEnabled) {
    return;
  }

  try {
    const AudioClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioClass) {
      return;
    }

    if (!audioContext) {
      audioContext = new AudioClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(function() {});
    }

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    const now = audioContext.currentTime;

    oscillator.type = "square";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(
      0.025,
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);

  } catch (error) {
    // Audio is optional.
    // The game continues even without sound.
    console.warn(
      "Audio is unavailable:",
      error
    );
  }
}

// ==========================================
// 9. VISUAL EFFECTS
// ==========================================

function showEffect(symbol) {
  elements.effect.textContent = symbol;

  elements.effect.classList.remove("pop");

  // Force animation restart
  void elements.effect.offsetWidth;

  elements.effect.classList.add("pop");
}

function animateStudent(animationType) {
  elements.student.classList.remove(
    "happy",
    "scared"
  );

  void elements.student.offsetWidth;

  elements.student.classList.add(
    animationType
  );
}

// ==========================================
// 10. TEACHER VISUAL STATE
// ==========================================

function updateTeacherAppearance() {
  const teacherState = gameState.teacherState;

  elements.teacher.classList.remove(
    "facing-away",
    "warning",
    "watching"
  );

  elements.status.classList.remove(
    "safe",
    "warning",
    "danger"
  );

  if (teacherState === "safe") {
    elements.teacher.classList.add(
      "facing-away"
    );

    elements.status.classList.add(
      "safe"
    );

    elements.status.textContent =
      "🟢 SAFE！老师正在写黑板，可以偷偷行动！";
  }

  else if (teacherState === "warning") {
    elements.teacher.classList.add(
      "warning"
    );

    elements.status.classList.add(
      "warning"
    );

    elements.status.textContent =
      "🟡 WARNING！老师准备回头了！";
  }

  else if (teacherState === "watching") {
    elements.teacher.classList.add(
      "watching"
    );

    elements.status.classList.add(
      "danger"
    );

    elements.status.textContent =
      "🔴 STOP！老师正在看你！不要点击！";
  }
}

// ==========================================
// 11. TEACHER STATE TRANSITIONS
// ==========================================

function advanceTeacherState() {
  if (gameState.teacherState === "safe") {
    gameState.teacherState = "warning";

    gameState.teacherTimeLeft =
      randomBetween(
        CONFIG.warningMin,
        CONFIG.warningMax
      );

    showFeedback(
      "⚠️ 老师停下了粉笔！马上停止收集！"
    );

    playSound(350, 0.12);
  }

  else if (
    gameState.teacherState === "warning"
  ) {
    gameState.teacherState = "watching";

    gameState.teacherTimeLeft =
      randomBetween(
        CONFIG.watchingMin,
        CONFIG.watchingMax
      );

    showFeedback(
      "👀 老师回头了！现在不能点击桌面道具！"
    );

    playSound(240, 0.2);
  }

  else {
    gameState.teacherState = "safe";

    gameState.teacherTimeLeft =
      randomBetween(
        CONFIG.safeMin,
        CONFIG.safeMax
      );

    showFeedback(
      "🌿 老师转回黑板了！现在可以继续收集！"
    );
  }

  updateTeacherAppearance();
}

// ==========================================
// 12. UPDATE TEACHER TIMER
// ==========================================

function updateTeacher(delta) {
  gameState.teacherTimeLeft -= delta;

  // Preserve overshoot so teacher transitions
  // remain consistent even with timer drift.
  while (gameState.teacherTimeLeft <= 0) {
    const overshoot =
      -gameState.teacherTimeLeft;

    advanceTeacherState();

    gameState.teacherTimeLeft -= overshoot;
  }
}

// ==========================================
// 13. HIDE COLLECTIBLE
// ==========================================

function hideItem() {
  gameState.activeItem = null;
  gameState.itemTimeLeft = 0;

  elements.collectible.hidden = true;
  elements.collectible.disabled = true;
}

// ==========================================
// 14. SCHEDULE NEXT ITEM
// ==========================================

function scheduleNextItem() {
  gameState.nextItemTime =
    randomBetween(
      CONFIG.itemSpawnMin,
      CONFIG.itemSpawnMax
    );
}

// ==========================================
// 15. SPAWN RANDOM ITEM
// ==========================================

function spawnItem() {
  if (!isPlaying()) {
    return;
  }

  if (gameState.activeItem !== null) {
    return;
  }

  const index = randomInt(
    0,
    ITEMS.length - 1
  );

  const item = ITEMS[index];

  gameState.activeItem = item;

  gameState.itemTimeLeft =
    CONFIG.itemLifetime;

  gameState.nextItemTime = 0;

  elements.itemIcon.textContent = item.icon;

  // Positions within classroom desk area
  const positions = [
    { left: 27, bottom: 31 },
    { left: 39, bottom: 35 },
    { left: 51, bottom: 31 },
    { left: 63, bottom: 35 }
  ];

  const position = positions[
    randomInt(0, positions.length - 1)
  ];

  elements.collectible.style.left =
    position.left + "%";

  elements.collectible.style.bottom =
    position.bottom + "%";

  elements.collectible.setAttribute(
    "aria-label",
    "收集" + item.name
  );

  elements.collectible.hidden = false;
  elements.collectible.disabled = false;
}

// ==========================================
// 16. UPDATE RANDOM ITEMS
// ==========================================

function updateItems(delta) {
  if (gameState.activeItem !== null) {
    gameState.itemTimeLeft -= delta;

    if (gameState.itemTimeLeft <= 0) {
      gameState.missedCount += 1;

      hideItem();
      scheduleNextItem();
    }
  }

  else {
    gameState.nextItemTime -= delta;

    if (gameState.nextItemTime <= 0) {
      spawnItem();
    }
  }
}

// ==========================================
// 17. COLLECT ITEM
// ==========================================

function collectItem() {
  // Do nothing if paused, ready, or finished
  if (!isPlaying()) {
    return;
  }

  // Prevent repeated clicks on a collected item
  if (gameState.activeItem === null) {
    return;
  }

  const item = gameState.activeItem;

  // Remove item immediately before scoring
  hideItem();
  scheduleNextItem();

  // ======================================
  // RED LIGHT: TEACHER WATCHING
  // ======================================

  if (gameState.teacherState === "watching") {
    gameState.caught += 1;

    showEffect("💥");
    animateStudent("scared");

    playSound(170, 0.25);

    showFeedback(
      "🚨 被老师抓到了！" +
      " 已被发现 " +
      gameState.caught +
      " / " +
      CONFIG.maxCaught +
      " 次。"
    );

    updateHUD();

    if (
      gameState.caught >= CONFIG.maxCaught
    ) {
      finishGame(
        false,
        "你被老师发现了 3 次！"
      );
    }

    return;
  }

  // ======================================
  // YELLOW LIGHT: WARNING
  // ======================================

  if (gameState.teacherState === "warning") {
    showEffect("⚠️");
    animateStudent("scared");

    playSound(300);

    showFeedback(
      "⚠️ 老师正要转身！" +
      "这次没有获得分数。" +
      "请等待绿色安全状态！"
    );

    return;
  }

  // ======================================
  // GREEN LIGHT: SAFE COLLECTION
  // ======================================

  gameState.score += item.points;

  gameState.collectedCount += 1;

  gameState.lastCollectedItem = item.id;

  updateHUD();

  showEffect(
    "+" + item.points + "⭐"
  );

  animateStudent("happy");

  playSound(item.sound);

  if (
    gameState.score >= CONFIG.targetScore
  ) {
    showFeedback(
      "🎉 你已经获得 " +
      gameState.score +
      " 分！" +
      "继续躲避老师，" +
      "坚持到倒计时结束才能获胜！"
    );
  }

  else {
    const remaining =
      CONFIG.targetScore -
      gameState.score;

    showFeedback(
      "🐹 成功收集 " +
      item.name +
      "！当前 " +
      gameState.score +
      " 分。" +
      "还差 " +
      remaining +
      " 分达到目标。"
    );
  }
}

// ==========================================
// 18. STOP GAME TIMER
// ==========================================

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

// ==========================================
// 19. GAME LOOP
// ==========================================

function gameTick() {
  if (!isPlaying()) {
    return;
  }

  const now = performance.now();

  const delta = Math.max(
    0,
    now - lastTick
  );

  lastTick = now;

  // Update remaining time
  gameState.timeLeft = Math.max(
    0,
    gameState.timeLeft - delta
  );

  // ======================================
  // END WHEN TIME REACHES ZERO
  // ======================================

  if (gameState.timeLeft <= 0) {
    gameState.timeLeft = 0;

    updateHUD();

    const won =
      gameState.score >= CONFIG.targetScore &&
      gameState.caught < CONFIG.maxCaught;

    if (won) {
      finishGame(
        true,
        "你成功坚持到了下课！"
      );
    }

    else {
      finishGame(
        false,
        "下课了，但你的快乐分数还不够！"
      );
    }

    return;
  }

  // Update teacher and objects
  updateTeacher(delta);
  updateItems(delta);

  updateHUD();
}

// ==========================================
// 20. START GAME TIMER
// ==========================================

function startTimer() {
  // Never allow duplicate timers
  stopTimer();

  lastTick = performance.now();

  timerId = setInterval(
    gameTick,
    CONFIG.tickRate
  );
}

// ==========================================
// 21. SHOW GAME OVERLAY
// ==========================================

function showOverlay(
  title,
  message,
  buttonText
) {
  elements.overlayTitle.textContent = title;

  elements.overlayMessage.textContent =
    message;

  elements.startButton.textContent =
    buttonText;

  elements.overlay.hidden = false;
}

// ==========================================
// 22. HIDE GAME OVERLAY
// ==========================================

function hideOverlay() {
  elements.overlay.hidden = true;
}

// ==========================================
// 23. START GAME
// ==========================================

function startGame() {
  if (gameState.mode === "playing") {
    return;
  }

  // Start fresh after a finished game
  if (gameState.mode === "finished") {
    resetGame();
  }

  // Resume existing paused game
  if (gameState.mode === "paused") {
    resumeGame();
    return;
  }

  gameState.mode = "playing";

  hideOverlay();

  elements.pauseButton.disabled = false;
  elements.pauseButton.textContent =
    "⏸ 暂停";

  gameState.teacherState = "safe";

  gameState.teacherTimeLeft = 3500;

  updateTeacherAppearance();

  // Spawn the first collectible
  scheduleNextItem();

  startTimer();

  showFeedback(
    "🎮 游戏开始！" +
    "观察老师的方向，" +
    "安全时点击桌面道具！"
  );

  playSound(700);
}

// ==========================================
// 24. PAUSE GAME
// ==========================================

function pauseGame() {
  if (gameState.mode !== "playing") {
    return;
  }

  gameState.mode = "paused";

  stopTimer();

  // Keep current item state frozen,
  // but hide the clickable item while paused.
  elements.collectible.hidden = true;
  elements.collectible.disabled = true;

  elements.pauseButton.textContent =
    "▶ 继续";

  showOverlay(
    "PAUSED",
    "游戏已经暂停。" +
    "点击继续恢复游戏。",
    "▶ 继续游戏"
  );

  showFeedback(
    "⏸ 游戏已暂停。"
  );
}

// ==========================================
// 25. RESUME GAME
// ==========================================

function resumeGame() {
  if (gameState.mode !== "paused") {
    return;
  }

  gameState.mode = "playing";

  hideOverlay();

  elements.pauseButton.textContent =
    "⏸ 暂停";

  // Restore the previously active item.
  if (gameState.activeItem !== null) {
    elements.collectible.hidden = false;
    elements.collectible.disabled = false;
  }

  startTimer();

  updateTeacherAppearance();

  showFeedback(
    "▶ 游戏继续！小心老师！"
  );
}

// ==========================================
// 26. FINISH GAME
// ==========================================

function finishGame(won, reason) {
  if (gameState.mode === "finished") {
    return;
  }

  gameState.mode = "finished";

  stopTimer();
  hideItem();

  elements.pauseButton.disabled = true;
  elements.pauseButton.textContent =
    "⏸ 暂停";

  const summary =
    reason +
    "\n最终分数：" +
    gameState.score +
    " 分。" +
    "\n成功收集：" +
    gameState.collectedCount +
    " 个道具。" +
    "\n被老师发现：" +
    gameState.caught +
    " 次。";

  if (won) {
    showEffect("🏆");
    animateStudent("happy");

    playSound(950, 0.3);

    showOverlay(
      "YOU WIN! 🏆",
      summary,
      "↻ 再玩一次"
    );

    showFeedback(
      "🎉 恭喜！" +
      "小豚鼠成功度过了快乐的课堂！"
    );
  }

  else {
    showEffect("💔");
    animateStudent("scared");

    playSound(180, 0.3);

    showOverlay(
      "GAME OVER",
      summary,
      "↻ 再试一次"
    );

    showFeedback(
      "💔 挑战失败！" +
      "观察老师回头的时机，" +
      "再试一次吧！"
    );
  }

  updateHUD();
}

// ==========================================
// 27. RESET GAME
// ==========================================

function resetGame() {
  stopTimer();

  gameState = createInitialState();

  hideItem();

  elements.student.classList.remove(
    "happy",
    "scared"
  );

  elements.effect.classList.remove("pop");
  elements.effect.textContent = "";

  elements.pauseButton.disabled = true;
  elements.pauseButton.textContent =
    "⏸ 暂停";

  updateHUD();
  updateTeacherAppearance();

  showOverlay(
    "READY TO PLAY?",
    "60 秒内获得至少 8 分，" +
    "最多只能被老师发现 2 次！" +
    "点击道具时要注意老师的方向。",
    "▶ 开始游戏"
  );

  showFeedback(
    "🐹 小豚鼠准备好了！" +
    "点击开始游戏，" +
    "老师背对时收集桌面道具！"
  );
}

// ==========================================
// 28. START BUTTON
// ==========================================

elements.startButton.addEventListener(
  "click",
  function() {
    if (gameState.mode === "paused") {
      resumeGame();
    }

    else {
      startGame();
    }
  }
);

// ==========================================
// 29. COLLECTIBLE BUTTON
// ==========================================

elements.collectible.addEventListener(
  "click",
  collectItem
);

// ==========================================
// 30. PAUSE BUTTON
// ==========================================

elements.pauseButton.addEventListener(
  "click",
  function() {
    if (gameState.mode === "playing") {
      pauseGame();
    }

    else if (gameState.mode === "paused") {
      resumeGame();
    }
  }
);

// ==========================================
// 31. RESET BUTTON
// ==========================================

elements.resetButton.addEventListener(
  "click",
  resetGame
);

// ==========================================
// 32. SOUND CONTROL
// ==========================================

elements.soundButton.addEventListener(
  "click",
  function() {
    soundEnabled = !soundEnabled;

    elements.soundButton.textContent =
      soundEnabled
        ? "🔊 音效开启"
        : "🔇 音效关闭";

    elements.soundButton.setAttribute(
      "aria-pressed",
      String(soundEnabled)
    );

    if (soundEnabled) {
      showFeedback(
        "🔊 音效已经开启！"
      );

      playSound(700);
    }

    else {
      showFeedback(
        "🔇 音效已经关闭！"
      );
    }
  }
);

// ==========================================
// 33. KEYBOARD CONTROLS
// ==========================================

// Space: pause or resume
// Enter: activate the focused button

document.addEventListener(
  "keydown",
  function(event) {
    if (
      event.code === "Space" &&
      event.target === document.body
    ) {
      if (gameState.mode === "playing") {
        event.preventDefault();
        pauseGame();
      }

      else if (gameState.mode === "paused") {
        event.preventDefault();
        resumeGame();
      }
    }
  }
);

// ==========================================
// 34. HANDLE TAB INTERRUPTIONS
// ==========================================

// Automatically pause when the player
// switches to another browser tab.

document.addEventListener(
  "visibilitychange",
  function() {
    if (
      document.hidden &&
      gameState.mode === "playing"
    ) {
      pauseGame();
    }
  }
);

// ==========================================
// 35. HANDLE WINDOW INTERRUPTIONS
// ==========================================

window.addEventListener(
  "blur",
  function() {
    if (gameState.mode === "playing") {
      pauseGame();
    }
  }
);

// ==========================================
// 36. INITIALIZE THE GAME
// ==========================================

resetGame();
