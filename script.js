
"use strict";

/*
====================================================
 CLASSROOM DAYDREAM V2.1
 SD5913 - Assignment 3

 EXPRESSIVE GUINEA PIG EDITION

 Main features:
 - 60-second classroom challenge
 - Red Light / Green Light mechanics
 - Random collectible objects
 - Four unique character reactions
 - Teacher warning and hiding
 - Caught detection
 - Sound effects
 - Pause / Resume / Restart
 - Keyboard accessibility
 - Interruption handling
====================================================
*/


// ==================================================
// 1. GAME CONFIGURATION
// ==================================================

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


// ==================================================
// 2. COLLECTIBLE ITEMS
// ==================================================

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
    name: "星星",
    icon: "⭐",
    points: 1,
    sound: 880
  }

];


// ==================================================
// 3. UNIQUE CHARACTER REACTIONS
// ==================================================

const ITEM_REACTIONS = {

  carrot: {

    animation: "gp-eat-carrot",

    prop: "🥕",

    effect: "💕",

    message: "小豚鼠正在开心地吃胡萝卜！",

    duration: 1500

  },

  cookie: {

    animation: "gp-eat-cookie",

    prop: "🍪",

    effect: "✦",

    message: "咔嚓咔嚓！小豚鼠鼓起脸颊吃饼干！",

    duration: 1500

  },

  doodle: {

    animation: "gp-draw",

    prop: "✏️",

    effect: "🌸",

    message: "小豚鼠正在偷偷画一张可爱的涂鸦！",

    duration: 1800

  },

  star: {

    animation: "gp-star",

    prop: "⭐",

    effect: "✨",

    message: "小豚鼠获得了幸运星，开心地跳起来！",

    duration: 1500

  }

};


// ==================================================
// 4. CREATE INITIAL GAME STATE
// ==================================================

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

let reactionTimer = null;

let reactionId = 0;


// ==================================================
// 5. GET HTML ELEMENTS
// ==================================================

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


// ==================================================
// 6. VALIDATE REQUIRED ELEMENTS
// ==================================================

function validateElements() {

  const missing = Object.entries(elements)

    .filter(function(entry) {

      return entry[1] === null;

    })

    .map(function(entry) {

      return entry[0];

    });


  if (missing.length > 0) {

    throw new Error(

      "Missing HTML elements: " +

      missing.join(", ")

    );

  }

}


validateElements();


// ==================================================
// 7. HELPER FUNCTIONS
// ==================================================

function randomBetween(min, max) {

  return min + Math.random() * (max - min);

}


function randomInt(min, max) {

  return Math.floor(

    Math.random() * (max - min + 1)

  ) + min;

}


function isPlaying() {

  return gameState.mode === "playing";

}


function showFeedback(message) {

  elements.feedback.textContent = message;

}


// ==================================================
// 8. UPDATE GAME HUD
// ==================================================

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


  elements.time.style.color =

    seconds <= 10 ? "#d56b78" : "";


  elements.caught.style.color =

    gameState.caught >= 2 ? "#d56b78" : "";


  elements.score.style.color =

    gameState.score >= CONFIG.targetScore

      ? "#559c72"

      : "";

}


// ==================================================
// 9. SOUND ENGINE
// ==================================================

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

    console.warn(

      "Sound unavailable:",

      error

    );

  }

}


// ==================================================
// 10. GENERAL VISUAL EFFECT
// ==================================================

function showEffect(symbol) {

  elements.effect.textContent = symbol;

  elements.effect.classList.remove("pop");

  void elements.effect.offsetWidth;

  elements.effect.classList.add("pop");

}


// ==================================================
// 11. BASIC STUDENT ANIMATION
// ==================================================

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


// ==================================================
// 12. CLEAR CHARACTER REACTIONS
// ==================================================

function clearItemReaction() {

  reactionId += 1;


  if (reactionTimer !== null) {

    clearTimeout(reactionTimer);

    reactionTimer = null;

  }


  elements.student.classList.remove(

    "gp-eat-carrot",

    "gp-eat-cookie",

    "gp-draw",

    "gp-star",

    "gp-hide",

    "happy",

    "scared"

  );


  const oldProp =

    elements.student.querySelector(

      ".reaction-prop"

    );


  if (oldProp) {

    oldProp.remove();

  }


  const oldDecoration =

    elements.student.querySelector(

      ".reaction-decoration"

    );


  if (oldDecoration) {

    oldDecoration.remove();

  }

}


// ==================================================
// 13. UNIQUE ITEM REACTION
// ==================================================

function playItemReaction(item) {

  const reaction = ITEM_REACTIONS[item.id];


  if (!reaction) {

    animateStudent("happy");

    return;

  }


  clearItemReaction();


  const currentReaction = reactionId;


  const prop = document.createElement("span");

  prop.className = "reaction-prop";

  prop.textContent = reaction.prop;

  prop.setAttribute(

    "aria-hidden",

    "true"

  );


  const decoration = document.createElement("span");

  decoration.className = "reaction-decoration";

  decoration.textContent = reaction.effect;

  decoration.setAttribute(

    "aria-hidden",

    "true"

  );


  elements.student.appendChild(prop);

  elements.student.appendChild(decoration);


  void elements.student.offsetWidth;


  elements.student.classList.add(

    reaction.animation

  );


  showEffect("+1");


  reactionTimer = setTimeout(function() {

    if (currentReaction !== reactionId) {

      return;

    }

    clearItemReaction();

  }, reaction.duration);

}


// ==================================================
// 14. TEACHER VISUAL APPEARANCE
// ==================================================

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

    elements.status.classList.add("safe");

    elements.status.textContent =

      "🟢 SAFE！老师正在写黑板，可以偷偷行动！";

  }


  else if (teacherState === "warning") {

    elements.teacher.classList.add("warning");

    elements.status.classList.add("warning");

    elements.status.textContent =

      "🟡 WARNING！老师准备回头了！";

  }


  else {

    elements.teacher.classList.add("watching");

    elements.status.classList.add("danger");

    elements.status.textContent =

      "🔴 STOP！老师正在看你！不要点击！";

  }

}


// ==================================================
// 15. ADVANCE TEACHER STATE
// ==================================================

function advanceTeacherState() {

  if (gameState.teacherState === "safe") {

    gameState.teacherState = "warning";


    gameState.teacherTimeLeft =

      randomBetween(

        CONFIG.warningMin,

        CONFIG.warningMax

      );


    // Guinea pig hides the current activity.
    clearItemReaction();

    elements.student.classList.add("gp-hide");


    showFeedback(

      "⚠️ 老师停下了粉笔！小豚鼠赶紧藏起东西！"

    );


    playSound(350, 0.12);

  }


  else if (gameState.teacherState === "warning") {

    gameState.teacherState = "watching";


    gameState.teacherTimeLeft =

      randomBetween(

        CONFIG.watchingMin,

        CONFIG.watchingMax

      );


    elements.student.classList.remove("gp-hide");


    showFeedback(

      "👀 老师回头了！现在不要点击道具！"

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


    elements.student.classList.remove("gp-hide");


    showFeedback(

      "🌿 老师转回黑板了！可以继续行动！"

    );

  }


  updateTeacherAppearance();

}


// ==================================================
// 16. UPDATE TEACHER TIMER
// ==================================================

function updateTeacher(delta) {

  gameState.teacherTimeLeft -= delta;


  while (gameState.teacherTimeLeft <= 0) {

    const overshoot =

      -gameState.teacherTimeLeft;


    advanceTeacherState();


    gameState.teacherTimeLeft -= overshoot;

  }

}


// ==================================================
// 17. HIDE COLLECTIBLE
// ==================================================

function hideItem() {

  gameState.activeItem = null;

  gameState.itemTimeLeft = 0;


  elements.collectible.hidden = true;

  elements.collectible.disabled = true;

}


// ==================================================
// 18. SCHEDULE NEXT COLLECTIBLE
// ==================================================

function scheduleNextItem() {

  gameState.nextItemTime =

    randomBetween(

      CONFIG.itemSpawnMin,

      CONFIG.itemSpawnMax

    );

}


// ==================================================
// 19. SPAWN RANDOM COLLECTIBLE
// ==================================================

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

  gameState.itemTimeLeft = CONFIG.itemLifetime;

  gameState.nextItemTime = 0;


  elements.itemIcon.textContent = item.icon;


  const positions = [

    { left: 27, bottom: 31 },

    { left: 39, bottom: 35 },

    { left: 51, bottom: 31 },

    { left: 63, bottom: 35 }

  ];


  const position = positions[

    randomInt(

      0,

      positions.length - 1

    )

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


// ==================================================
// 20. UPDATE COLLECTIBLE TIMER
// ==================================================

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


// ==================================================
// 21. MAIN COLLECTIBLE INTERACTION
// ==================================================

function collectItem() {

  if (!isPlaying()) {

    return;

  }


  if (gameState.activeItem === null) {

    return;

  }


  const item = gameState.activeItem;


  // Remove immediately to prevent repeated points.
  hideItem();

  scheduleNextItem();


  // ------------------------------------------
  // RED: TEACHER WATCHING
  // ------------------------------------------

  if (gameState.teacherState === "watching") {

    gameState.caught += 1;


    clearItemReaction();

    showEffect("💥");

    animateStudent("scared");

    playSound(170, 0.25);


    showFeedback(

      "🚨 被老师抓到了！已被发现 " +

      gameState.caught +

      " / " +

      CONFIG.maxCaught +

      " 次。"

    );


    updateHUD();


    if (gameState.caught >= CONFIG.maxCaught) {

      finishGame(

        false,

        "你被老师发现了 3 次！"

      );

    }


    return;

  }


  // ------------------------------------------
  // YELLOW: TEACHER WARNING
  // ------------------------------------------

  if (gameState.teacherState === "warning") {

    clearItemReaction();


    elements.student.classList.add(

      "gp-hide"

    );


    showEffect("⚠️");

    playSound(300);


    showFeedback(

      "⚠️ 老师正要转身！小豚鼠赶紧藏起来！" +

      "本次没有获得分数。"

    );


    return;

  }


  // ------------------------------------------
  // GREEN: SAFE COLLECTION
  // ------------------------------------------

  gameState.score += item.points;

  gameState.collectedCount += 1;

  gameState.lastCollectedItem = item.id;


  updateHUD();


  // Unique animation for each item.
  playItemReaction(item);


  // Unique sound for each item.
  playSound(item.sound);


  const reaction = ITEM_REACTIONS[item.id];


  const characterMessage = reaction

    ? reaction.message

    : "小豚鼠成功收集了道具！";


  if (gameState.score >= CONFIG.targetScore) {

    showFeedback(

      "⭐ " +

      gameState.score +

      " 分！ " +

      characterMessage +

      " 已达到目标，坚持到下课！"

    );

  }


  else {

    showFeedback(

      "⭐ " +

      gameState.score +

      " / " +

      CONFIG.targetScore +

      " 分。 " +

      characterMessage

    );

  }

}


// ==================================================
// 22. STOP GAME TIMER
// ==================================================

function stopTimer() {

  if (timerId !== null) {

    clearInterval(timerId);

    timerId = null;

  }

}


// ==================================================
// 23. MAIN GAME LOOP
// ==================================================

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


  gameState.timeLeft = Math.max(

    0,

    gameState.timeLeft - delta

  );


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

        "下课了，但快乐分数还不够！"

      );

    }


    return;

  }


  updateTeacher(delta);

  updateItems(delta);

  updateHUD();

}


// ==================================================
// 24. START GAME TIMER
// ==================================================

function startTimer() {

  stopTimer();


  lastTick = performance.now();


  timerId = setInterval(

    gameTick,

    CONFIG.tickRate

  );

}


// ==================================================
// 25. SHOW OVERLAY
// ==================================================

function showOverlay(title, message, buttonText) {

  elements.overlayTitle.textContent = title;

  elements.overlayMessage.textContent = message;

  elements.startButton.textContent = buttonText;

  elements.overlay.hidden = false;

}


// ==================================================
// 26. HIDE OVERLAY
// ==================================================

function hideOverlay() {

  elements.overlay.hidden = true;

}


// ==================================================
// 27. START GAME
// ==================================================

function startGame() {

  if (gameState.mode === "playing") {

    return;

  }


  if (gameState.mode === "finished") {

    resetGame();

  }


  if (gameState.mode === "paused") {

    resumeGame();

    return;

  }


  gameState.mode = "playing";


  hideOverlay();


  elements.pauseButton.disabled = false;

  elements.pauseButton.textContent = "⏸ 暂停";


  gameState.teacherState = "safe";

  gameState.teacherTimeLeft = 3500;


  updateTeacherAppearance();


  scheduleNextItem();

  startTimer();


  showFeedback(

    "🎮 游戏开始！观察老师的方向，" +

    "安全时点击桌面道具！"

  );


  playSound(700);

}


// ==================================================
// 28. PAUSE GAME
// ==================================================

function pauseGame() {

  if (gameState.mode !== "playing") {

    return;

  }


  gameState.mode = "paused";


  stopTimer();


  elements.collectible.hidden = true;

  elements.collectible.disabled = true;


  elements.pauseButton.textContent = "▶ 继续";


  showOverlay(

    "PAUSED",

    "游戏已经暂停，点击继续恢复游戏。",

    "▶ 继续游戏"

  );


  showFeedback("⏸ 游戏已暂停。");

}


// ==================================================
// 29. RESUME GAME
// ==================================================

function resumeGame() {

  if (gameState.mode !== "paused") {

    return;

  }


  gameState.mode = "playing";


  hideOverlay();


  elements.pauseButton.textContent = "⏸ 暂停";


  if (gameState.activeItem !== null) {

    elements.collectible.hidden = false;

    elements.collectible.disabled = false;

  }


  startTimer();

  updateTeacherAppearance();


  showFeedback("▶ 游戏继续！小心老师！");

}


// ==================================================
// 30. FINISH GAME
// ==================================================

function finishGame(won, reason) {

  if (gameState.mode === "finished") {

    return;

  }


  gameState.mode = "finished";


  stopTimer();

  clearItemReaction();

  hideItem();


  elements.pauseButton.disabled = true;

  elements.pauseButton.textContent = "⏸ 暂停";


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

      "🎉 恭喜！小豚鼠成功度过了快乐的课堂！"

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

      "💔 挑战失败！观察老师回头的时机，" +

      "再试一次吧！"

    );

  }


  updateHUD();

}


// ==================================================
// 31. RESET GAME
// ==================================================

function resetGame() {

  stopTimer();

  clearItemReaction();


  gameState = createInitialState();


  hideItem();


  elements.effect.classList.remove("pop");

  elements.effect.textContent = "";


  elements.pauseButton.disabled = true;

  elements.pauseButton.textContent = "⏸ 暂停";


  updateHUD();

  updateTeacherAppearance();


  showOverlay(

    "READY TO PLAY?",

    "60 秒内获得至少 8 分，" +

    "最多只能被老师发现 2 次！" +

    " 点击道具时要注意老师的方向。",

    "▶ 开始游戏"

  );


  showFeedback(

    "🐹 小豚鼠准备好了！点击开始游戏，" +

    "老师背对时收集桌面道具！"

  );

}


// ==================================================
// 32. START BUTTON
// ==================================================

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


// ==================================================
// 33. COLLECTIBLE BUTTON
// ==================================================

elements.collectible.addEventListener(

  "click",

  collectItem

);


// ==================================================
// 34. PAUSE BUTTON
// ==================================================

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


// ==================================================
// 35. RESET BUTTON
// ==================================================

elements.resetButton.addEventListener(

  "click",

  resetGame

);


// ==================================================
// 36. SOUND CONTROL
// ==================================================

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

      showFeedback("🔊 音效已经开启！");

      playSound(700);

    }

    else {

      showFeedback("🔇 音效已经关闭！");

    }

  }

);


// ==================================================
// 37. KEYBOARD CONTROLS
// ==================================================

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


// ==================================================
// 38. HANDLE BROWSER TAB INTERRUPTIONS
// ==================================================

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


// ==================================================
// 39. HANDLE WINDOW INTERRUPTIONS
// ==================================================

window.addEventListener(

  "blur",

  function() {

    if (gameState.mode === "playing") {

      pauseGame();

    }

  }

);


// ==================================================
// 40. INITIALIZE GAME
// ==================================================

resetGame();
