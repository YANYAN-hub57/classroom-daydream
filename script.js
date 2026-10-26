"use strict";

/*
 CLASSROOM DAYDREAM
 SD5913 - Assignment 3
 Interactive Classroom Game
*/

// ========================================
// 1. INITIAL GAME STATE
// ========================================

function createInitialState() {
  return {
    mood: 35,
    risk: 10,
    moves: 0,
    ended: false
  };
}

let gameState = createInitialState();

let soundEnabled = true;
let audioContext = null;
let lastActionTime = 0;


// ========================================
// 2. GAME ACTIONS
// ========================================

const actions = {

  doodle: {
    moodChange: 22,
    riskChange: 27,
    message: "✏️ 你偷偷画了一张可爱的涂鸦！心情提升了！",
    symbol: "✨",
    sound: 660
  },

  snack: {
    moodChange: 15,
    riskChange: 18,
    message: "🍪 咔嚓！你偷偷吃了一块饼干，好满足！",
    symbol: "🍪",
    sound: 520
  },

  study: {
    moodChange: -7,
    riskChange: -26,
    message: "📖 你开始认真听讲，老师的怀疑减少了。",
    symbol: "📚",
    sound: 400
  }

};


// ========================================
// 3. HTML ELEMENTS
// ========================================

const moodValue = document.getElementById("mood-value");

const riskValue = document.getElementById("risk-value");

const moodFill = document.getElementById("mood-fill");

const riskFill = document.getElementById("risk-fill");

const moodTrack = document.getElementById("mood-track");

const riskTrack = document.getElementById("risk-track");

const feedback = document.getElementById("feedback");

const teacher = document.getElementById("teacher");

const effect = document.getElementById("effect");

const turnCount = document.getElementById("turn-count");

const resetButton = document.getElementById("reset-button");

const soundButton = document.getElementById("sound-button");

const actionButtons = document.querySelectorAll("[data-action]");


// ========================================
// 4. KEEP VALUES BETWEEN 0 AND 100
// ========================================

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}


// ========================================
// 5. UPDATE GAME DISPLAY
// ========================================

function updateDisplay() {

  // Update numbers
  moodValue.textContent = gameState.mood;
  riskValue.textContent = gameState.risk;

  // Update progress bars
  moodFill.style.width = gameState.mood + "%";
  riskFill.style.width = gameState.risk + "%";

  // Update accessible progress values
  moodTrack.setAttribute(
    "aria-valuenow",
    gameState.mood
  );

  riskTrack.setAttribute(
    "aria-valuenow",
    gameState.risk
  );

  // Update action count
  turnCount.textContent =
    "已进行 " + gameState.moves + " 次行动";

  // Teacher becomes alert when risk is high
  if (gameState.risk >= 70) {
    teacher.classList.add("alert");
  } else {
    teacher.classList.remove("alert");
  }

  // Disable actions after game ends
  actionButtons.forEach(function(button) {
    button.disabled = gameState.ended;
  });

}


// ========================================
// 6. TEXT FEEDBACK
// ========================================

function showMessage(message) {
  feedback.textContent = message;
}


// ========================================
// 7. VISUAL EFFECT
// ========================================

function showEffect(symbol) {

  effect.textContent = symbol;

  effect.classList.remove("pop");

  // Restart the CSS animation
  void effect.offsetWidth;

  effect.classList.add("pop");

}


// ========================================
// 8. SOUND EFFECTS
// ========================================

function playSound(frequency) {

  if (!soundEnabled) {
    return;
  }

  try {

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    // Audio not supported
    if (!AudioContextClass) {
      return;
    }

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume().catch(function() {});
    }

    const oscillator =
      audioContext.createOscillator();

    const gain =
      audioContext.createGain();

    oscillator.type = "square";

    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(
      0.035,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.15
    );

    oscillator.connect(gain);

    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime + 0.15
    );

  } catch (error) {

    // The game continues without sound
    console.warn("Sound unavailable:", error);

  }

}


// ========================================
// 9. MAIN INTERACTION FUNCTION
// ========================================

function takeAction(actionName) {

  // Handle actions after game ends
  if (gameState.ended) {
    showMessage(
      "本局已经结束，请点击重新开始！"
    );
    return;
  }

  // Prevent accidental rapid repeated clicks
  const currentTime = Date.now();

  if (currentTime - lastActionTime < 350) {
    showMessage(
      "操作太快啦！请稍等一下再行动。"
    );
    return;
  }

  // Find selected action
  const selectedAction = actions[actionName];

  if (!selectedAction) {
    return;
  }

  lastActionTime = currentTime;

  // ====================================
  // RESPONSE: CHANGE GAME STATE
  // ====================================

  gameState.mood = clamp(
    gameState.mood + selectedAction.moodChange
  );

  gameState.risk = clamp(
    gameState.risk + selectedAction.riskChange
  );

  gameState.moves += 1;

  let message = selectedAction.message;


  // ====================================
  // CHECK WIN OR LOSE
  // ====================================

  if (gameState.risk >= 100) {

    gameState.ended = true;

    message =
      "🚨 糟糕！你被老师发现了！游戏失败！点击重新开始再挑战！";

    showEffect("🚨");

    playSound(180);

  } else if (
    gameState.moves >= 4 &&
    gameState.mood >= 80
  ) {

    gameState.ended = true;

    message =
      "🎉 恭喜你！成功度过了快乐的课堂！你赢了！";

    showEffect("🎉");

    playSound(880);

  } else {

    // Normal action feedback
    showEffect(selectedAction.symbol);

    playSound(selectedAction.sound);

    // Teacher warning
    if (gameState.risk >= 70) {

      message +=
        " 👀 小心！老师正在看你！";

    } else if (gameState.moves >= 4) {

      message +=
        " 再提升心情就有机会获胜！";

    }

  }


  // ====================================
  // FEEDBACK: UPDATE USER INTERFACE
  // ====================================

  updateDisplay();

  showMessage(message);

}


// ========================================
// 10. CONNECT BUTTONS TO ACTIONS
// ========================================

actionButtons.forEach(function(button) {

  button.addEventListener("click", function() {

    const actionName = button.dataset.action;

    takeAction(actionName);

  });

});


// ========================================
// 11. RESET GAME
// ========================================

resetButton.addEventListener("click", function() {

  gameState = createInitialState();

  lastActionTime = 0;

  effect.classList.remove("pop");

  effect.textContent = "";

  updateDisplay();

  showMessage(
    "🌸 新的一堂课开始了！这次你准备怎么开小差？"
  );

});


// ========================================
// 12. SOUND ON / OFF
// ========================================

soundButton.addEventListener("click", function() {

  soundEnabled = !soundEnabled;

  if (soundEnabled) {

    soundButton.textContent =
      "🔊 音效开启";

    showMessage(
      "🔊 音效已经开启！"
    );

  } else {

    soundButton.textContent =
      "🔇 音效关闭";

    showMessage(
      "🔇 音效已经关闭！"
    );

  }

});


// ========================================
// 13. INITIALIZE GAME
// ========================================

updateDisplay();

showMessage(
  "🌸 点击课桌物品或下方按钮，开始你的课堂冒险！"
);