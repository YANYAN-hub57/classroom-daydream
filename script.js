
"use strict";

/* =========================================================
   CLASSROOM DAYDREAM V2.4 — COMPLETE SCRIPT.JS
   ========================================================= */

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
  watchingMin: 1700,
  watchingMax: 2400
};

/* =========================================================
   V2.4 Update: pixel-art renderer
   ========================================================= */

const COLORS = {
  outline: "#654b44",
  brown: "#9a7663",
  brownLight: "#bd9376",
  orange: "#e4a66b",
  orangeLight: "#f4c18b",
  white: "#fff8e8",
  cream: "#f3e6cb",
  pink: "#e99eab",
  eye: "#48343b",
  eyeLight: "#fff8f3",
  red: "#db5b6a",
  blue: "#72b9e0",
  gold: "#f7d267",
  green: "#659f69",
  grey: "#9a9eaa",
  purple: "#a986ce"
};

const ITEM_PALETTE = {
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

/* All shadows have zero blur and zero spread. */

function pixelsToShadow(grid, size = 4) {
  const shadows = [];

  grid.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        shadows.push(
          `${x * size}px ${y * size}px 0 0 ${color}`
        );
      }
    });
  });

  return shadows.join(",");
}

function makeCanvas(w, h) {
  return Array.from(
    { length: h },
    () => Array(w).fill(null)
  );
}

function dot(g, x, y, color) {
  if (
    y >= 0 && y < g.length &&
    x >= 0 && x < g[0].length
  ) {
    g[y][x] = color;
  }
}

function rect(g, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      dot(g, xx, yy, color);
    }
  }
}

function oval(g, cx, cy, rx, ry, color) {
  for (let y = Math.floor(cy - ry - 1);
       y <= cy + ry + 1; y++) {
    for (let x = Math.floor(cx - rx - 1);
         x <= cx + rx + 1; x++) {
      const v =
        ((x - cx) / rx) ** 2 +
        ((y - cy) / ry) ** 2;

      if (v <= 1) dot(g, x, y, color);
    }
  }
}

/* =========================================================
   V2.4 Update: one-element guinea pig sprites

   Sections:
   - tuft
   - ears
   - round facial outline
   - tricolour fur
   - eyes and expression
   - blush
   - chin and paws

   One box-shadow value is applied to each empty div.
   ========================================================= */

function createPigSprite({
  teacher = false,
  face = "normal",
  back = false
} = {}) {

  const c = COLORS;
  const g = makeCanvas(34, 35);

  /* Body / lower silhouette */
  oval(g, 16, 27, 13, 7, c.outline);
  oval(g, 16, 26, 12, 6,
       teacher ? c.brownLight : c.cream);

  /* Round ears */
  oval(g, 7, 10, 5, 6, c.outline);
  oval(g, 25, 10, 5, 6, c.outline);
  oval(g, 7, 10, 3, 4, c.pink);
  oval(g, 25, 10, 3, 4, c.pink);

  /* Rounded face and pixel chin */
  oval(g, 16, 20, 16, 13, c.outline);
  oval(g, 16, 19, 15, 12,
       teacher ? c.brownLight : c.white);

  /* Fur patches */
  if (teacher) {
    oval(g, 9, 15, 8, 9, c.brown);
    oval(g, 24, 16, 6, 9, c.orange);
    oval(g, 16, 22, 8, 9, c.cream);
  } else {
    oval(g, 7, 16, 7, 10, c.brown);
    oval(g, 26, 16, 7, 10, c.orange);
    oval(g, 16, 22, 8, 9, c.white);
  }

  /* Re-establish small mouth/chin outline */
  rect(g, 7, 31, 18, 1, c.outline);
  rect(g, 5, 29, 3, 2, c.outline);
  rect(g, 24, 29, 3, 2, c.outline);

  /* Tuft */
  dot(g, 14, 6, c.outline);
  dot(g, 15, 5, c.outline);
  dot(g, 16, 4, c.outline);
  dot(g, 17, 6, c.outline);
  dot(g, 18, 5, c.outline);

  /* Blush */
  rect(g, 5, 23, 5, 3, c.pink);
  rect(g, 23, 23, 5, 3, c.pink);

  /* Paws */
  rect(g, 8, 31, 5, 2, c.cream);
  rect(g, 20, 31, 5, 2, c.cream);

  if (back) {
    /* Teacher looking at the blackboard */
    oval(g, 16, 19, 13, 11, c.brown);
    oval(g, 23, 18, 5, 7, c.orange);
    rect(g, 11, 26, 10, 2, c.brownLight);
  } else {

    /* Eyes vary by emotion */
    if (
      face === "happy" ||
      face === "win" ||
      face === "cookie"
    ) {
      rect(g, 9, 19, 5, 1, c.eye);
      rect(g, 20, 19, 5, 1, c.eye);
      dot(g, 9, 18, c.eye);
      dot(g, 24, 18, c.eye);
    } else if (face === "blink") {
      rect(g, 9, 20, 5, 1, c.eye);
      rect(g, 20, 20, 5, 1, c.eye);
    } else if (
      face === "warning" ||
      face === "surprised"
    ) {
      rect(g, 10, 16, 3, 6, c.eye);
      rect(g, 21, 16, 3, 6, c.eye);
      dot(g, 11, 17, c.eyeLight);
      dot(g, 22, 17, c.eyeLight);
    } else if (
      face === "sad" ||
      face === "lose"
    ) {
      rect(g, 9, 19, 4, 2, c.eye);
      rect(g, 21, 19, 4, 2, c.eye);
      dot(g, 9, 18, c.eye);
      dot(g, 24, 18, c.eye);
    } else {
      rect(g, 10, 18, 3, 4, c.eye);
      rect(g, 21, 18, 3, 4, c.eye);
      dot(g, 10, 18, c.eyeLight);
      dot(g, 21, 18, c.eyeLight);
    }

    /* Nose */
    rect(g, 15, 23, 4, 2, c.brown);
    rect(g, 16, 25, 2, 2, c.eye);

    /* Mouth */
    if (
      face === "surprised" ||
      face === "warning" ||
      face === "angry"
    ) {
      rect(g, 15, 27, 4, 4,
           face === "angry" ? c.red : c.eye);
    } else if (
      face === "sad" ||
      face === "lose"
    ) {
      rect(g, 14, 29, 6, 1, c.eye);
      dot(g, 14, 28, c.eye);
      dot(g, 19, 28, c.eye);
    } else {
      rect(g, 13, 27, 3, 1, c.eye);
      rect(g, 18, 27, 3, 1, c.eye);
      dot(g, 14, 28, c.eye);
      dot(g, 19, 28, c.eye);
    }

    /* Carrot: alternating cheek enlargement */
    if (face === "carrot") {
      rect(g, 4, 22, 7, 5, c.pink);
      rect(g, 23, 22, 7, 5, c.pink);
    }

    /* Fear / tears */
    if (
      face === "danger" ||
      face === "caught" ||
      face === "lose"
    ) {
      rect(g, 26, 16, 2, 4, c.blue);
    }

    if (face === "caught") {
      rect(g, 7, 21, 2, 6, c.blue);
      rect(g, 25, 21, 2, 6, c.blue);
    }

    /* Angry eyebrows */
    if (face === "angry") {
      rect(g, 8, 15, 5, 2, c.eye);
      rect(g, 21, 15, 5, 2, c.eye);
      dot(g, 12, 17, c.eye);
      dot(g, 21, 17, c.eye);
    }

    /* Teacher glasses */
    if (teacher) {
      rect(g, 8, 18, 7, 1, c.eye);
      rect(g, 19, 18, 7, 1, c.eye);
      rect(g, 8, 18, 1, 6, c.eye);
      rect(g, 14, 18, 1, 6, c.eye);
      rect(g, 19, 18, 1, 6, c.eye);
      rect(g, 25, 18, 1, 6, c.eye);
      rect(g, 15, 19, 4, 1, c.eye);
    }
  }

  /* Teacher outfit and pointer identity */
  if (teacher) {
    rect(g, 10, 33, 14, 2, c.green);
    rect(g, 29, 21, 1, 11, c.outline);
    dot(g, 29, 20, c.gold);
  }

  return pixelsToShadow(g, 4);
}

/* Sprite visual cache */

const pigCache = new Map();

function pigShadow(key) {
  if (!pigCache.has(key)) {
    const teacher = key.startsWith("teacher:");
    const face = key.split(":")[1];
    const back = face === "back";
    pigCache.set(key, createPigSprite({
      teacher,
      face,
      back
    }));
  }
  return pigCache.get(key);
}

const el = {
  game: document.getElementById("game"),
  scene: document.getElementById("scene"),
  student: document.getElementById("student"),
  teacher: document.getElementById("teacher"),
  teacherEmote: document.getElementById("teacher-emote"),
  layer: document.getElementById("interaction-layer"),
  particles: document.getElementById("result-particles"),
  resultIcon: document.getElementById("result-icon"),

  time: document.getElementById("time-value"),
  score: document.getElementById("score-value"),
  caught: document.getElementById("caught-value"),
  status: document.getElementById("teacher-status"),
  collectible: document.getElementById("collectible"),
  itemIcon: document.getElementById("collectible-icon"),
  effect: document.getElementById("effect"),
  feedback: document.getElementById("feedback"),

  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayMessage: document.getElementById("overlay-message"),
  startButton: document.getElementById("start-button"),

  pauseButton: document.getElementById("pause-button"),
  pauseIcon: document.getElementById("pause-icon"),
  pauseLabel: document.getElementById("pause-label"),

  soundButton: document.getElementById("sound-button"),
  soundIcon: document.getElementById("sound-icon"),
  soundLabel: document.getElementById("sound-label"),

  resetButton: document.getElementById("reset-button"),
  rulesButton: document.getElementById("rules-button"),
  rulesOverlay: document.getElementById("rules-overlay"),
  rulesStartButton:
    document.getElementById("rules-start-button"),
  rulesCloseButton:
    document.getElementById("rules-close-button")
};

for (const [key, value] of Object.entries(el)) {
  if (!value) {
    throw new Error("Missing HTML element: " + key);
  }
}

function setStudentFace(face) {
  el.student.style.boxShadow =
    pigShadow("student:" + face);
}

function setTeacherFace(face) {
  el.teacher.style.boxShadow =
    pigShadow("teacher:" + face);
}

/* =========================================================
   V2.4 Update: transparent pixel objects via CSS shadows
   ========================================================= */

function patternShadow(rows, palette = ITEM_PALETTE, px = 4) {
  const list = [];

  rows.forEach((row, y) => {
    [...row].forEach((code, x) => {
      if (!palette[code]) return;
      list.push(
        `${x * px}px ${y * px}px 0 0 ${palette[code]}`
      );
    });
  });

  return list.join(",");
}

function makePixelElement(name, className, px = 4) {
  const div = document.createElement("div");
  div.className = className;
  div.style.width = px + "px";
  div.style.height = px + "px";
  div.style.background = "transparent";
  div.style.boxShadow = patternShadow(
    PIXEL_ART[name],
    ITEM_PALETTE,
    px
  );
  return div;
}

const ITEMS = [
  {
    id: "carrot",
    name: "胡萝卜",
    points: 1,
    sound: 650,
    animation: "gp-eat-carrot",
    duration: 1600,
    message: "小豚鼠鼓起脸颊吃胡萝卜！"
  },
  {
    id: "cookie",
    name: "饼干",
    points: 1,
    sound: 550,
    animation: "gp-eat-cookie",
    duration: 1600,
    message: "咔嚓！小豚鼠开心地摇晃！"
  },
  {
    id: "doodle",
    name: "涂鸦",
    points: 1,
    sound: 750,
    animation: "gp-draw",
    duration: 1800,
    message: "小豚鼠正在画一朵花！"
  },
  {
    id: "star",
    name: "星星",
    points: 1,
    sound: 880,
    animation: "gp-star",
    duration: 1500,
    message: "小豚鼠跳起来庆祝！"
  }
];

/* =========================================================
   Game state — original mechanics
   ========================================================= */

function initialState() {
  return {
    mode: "ready",
    timeLeft: 60000,
    score: 0,
    caught: 0,
    teacherState: "safe",
    teacherTimeLeft: 3500,
    checkHadViolation: false,
    activeItem: null,
    itemTimeLeft: 0,
    nextItemTime: 0,
    collectedCount: 0
  };
}

let state = initialState();
let timerId = null;
let lastTick = 0;
let reactionTimeLeft = 0;
let reactionFace = null;

let rulesOpen = true;
let rulesReturnMode = "ready";
let rulesPreviousFocus = null;

let soundEnabled = true;
let resultPaused = false;
let blinkTimer = null;

const random = (a, b) => a + Math.random() * (b - a);
const playing = () => state.mode === "playing";

/* =========================================================
   V2.4 Update: Web Audio — dynamic 8bit soundtrack
   ========================================================= */

let audioContext = null;
let musicTimer = null;
let musicStep = 0;
let activeNotes = [];
let musicMaster = null;

function ensureAudio() {
  const AudioClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioClass) return null;

  if (!audioContext) {
    audioContext = new AudioClass();
    musicMaster = audioContext.createGain();
    musicMaster.gain.value = 0.65;
    musicMaster.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function note(frequency, duration = .12,
              volume = .03, delay = 0,
              type = "square") {
  if (!soundEnabled) return;
  const ac = ensureAudio();
  if (!ac) return;

  const oscillator = ac.createOscillator();
  const gain = ac.createGain();
  const start = ac.currentTime + delay;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(
    frequency,
    start
  );

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(
    volume,
    start + .008
  );
  gain.gain.exponentialRampToValueAtTime(
    .0001,
    start + duration
  );

  oscillator.connect(gain);
  gain.connect(musicMaster);

  oscillator.start(start);
  oscillator.stop(start + duration + .02);

  activeNotes.push(oscillator);

  oscillator.onended = () => {
    activeNotes = activeNotes.filter(
      item => item !== oscillator
    );
  };
}

function stopAllNotes() {
  for (const oscillator of activeNotes) {
    try { oscillator.stop(); }
    catch (_) {}
  }
  activeNotes = [];
}

function soundEffect(frequency, duration = .13) {
  note(frequency, duration, .09);
}

/* Major-scale background tune */

const BG_NOTES = [
  261.63, 329.63, 392, 329.63,
  293.66, 349.23, 440, 349.23,
  329.63, 392, 523.25, 392,
  293.66, 349.23, 392, 261.63
];

const BASS = [130.81, 146.83, 164.81, 146.83];

function musicStage() {
  const seconds = state.timeLeft / 1000;
  if (seconds > 40) return 0;
  if (seconds > 20) return 1;
  return 2;
}

function musicStepOnce() {
  if (!playing() || !soundEnabled || rulesOpen) {
    return;
  }

  const stage = musicStage();
  const index = musicStep % BG_NOTES.length;
  const speed = [350, 250, 165][stage];

  const pitch = stage === 2 ? 1.25 : 1;

  note(
    BG_NOTES[index] * pitch,
    Math.min(.16, speed / 1300),
    .018
  );

  if (musicStep % (stage === 0 ? 4 : 2) === 0) {
    note(
      BASS[Math.floor(musicStep / 4) % 4],
      .15,
      .009,
      0,
      "triangle"
    );
  }

  if (stage >= 1 && musicStep % 2 === 1) {
    note(170, .035, .006, 0, "square");
  }

  musicStep += 1;
  musicTimer = setTimeout(musicStepOnce, speed);
}

function stopBackgroundMusic() {
  if (musicTimer !== null) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
}

function startBackgroundMusic() {
  stopBackgroundMusic();
  if (!soundEnabled || !playing() || rulesOpen) {
    return;
  }
  ensureAudio();
  musicStepOnce();
}

/* Settlement melodies: scheduled on audio clock.
   Browser suspend() pauses their playback timing. */

const WIN_MELODY = [
  [523.25,.15],[659.25,.15],[783.99,.15],
  [1046.5,.33],[783.99,.13],[880,.15],
  [1046.5,.5],[1174.66,.13],[1318.51,.5]
];

const LOSE_MELODY = [
  [392,.32],[349.23,.35],[329.63,.36],
  [293.66,.44],[261.63,.65]
];

function playSettlementMusic(won) {
  if (!soundEnabled) return;

  const melody = won ? WIN_MELODY : LOSE_MELODY;
  let delay = .08;

  for (const [frequency, duration] of melody) {
    note(
      frequency,
      duration,
      .045,
      delay,
      won ? "square" : "triangle"
    );
    delay += duration + .055;
  }
}

function pauseAudio() {
  if (audioContext?.state === "running") {
    audioContext.suspend().catch(() => {});
  }
}

function resumeAudio() {
  if (soundEnabled && audioContext?.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
}

/* =========================================================
   V2.4 Update: UI controls
   ========================================================= */

function updateControlIcons() {
  const paused =
    state.mode === "paused" || resultPaused;

  el.pauseIcon.className =
    "control-icon " + (paused ? "icon-play" : "icon-pause");

  el.pauseLabel.textContent =
    paused ? "RESUME" : "PAUSE";

  el.pauseButton.setAttribute(
    "aria-label",
    paused ? "继续游戏" : "暂停游戏"
  );

  el.soundIcon.className =
    "control-icon " +
    (soundEnabled ? "icon-bell" : "icon-bell-muted");

  el.soundLabel.textContent =
    soundEnabled ? "SOUND ON" : "SOUND OFF";

  el.soundButton.setAttribute(
    "aria-pressed",
    String(soundEnabled)
  );
}

function updateHUD() {
  const seconds = Math.ceil(
    state.timeLeft / 1000
  );

  el.time.textContent = String(seconds);
  el.score.textContent = String(state.score);
  el.caught.textContent =
    `${state.caught} / ${CONFIG.maxCaught}`;

  el.time.style.color =
    seconds <= 10 ? "#ce6672" : "";

  el.score.style.color =
    state.score >= 8 ? "#3b9666" : "";

  el.caught.style.color =
    state.caught >= 2 ? "#ce6672" : "";
}

function feedback(text) {
  el.feedback.textContent = text;
}

function showEffect(text) {
  el.effect.textContent = text;
  el.effect.classList.remove("pop");
  void el.effect.offsetWidth;
  el.effect.classList.add("pop");
}

function showOverlay(title, message, label) {
  el.overlayTitle.textContent = title;
  el.overlayMessage.textContent = message;
  el.startButton.textContent = label;
  el.overlay.hidden = false;
}

function hideOverlay() {
  el.overlay.hidden = true;
}

/* =========================================================
   Student emotion logic
   ========================================================= */

const STUDENT_CLASSES = [
  "state-safe","state-warning","state-danger",
  "state-win","state-lose",
  "normal","blink","surprised","happy","sad",
  "scared","gp-hide","gp-eat-carrot","gp-eat-cookie",
  "gp-draw","gp-star","action-eat","action-jump"
];

function setStudentState(name, face) {
  for (const cls of STUDENT_CLASSES) {
    el.student.classList.remove(cls);
  }
  el.student.classList.add(name);
  setStudentFace(face);
}

function updateStudentIdle() {
  if (!playing()) return;

  if (state.teacherState === "warning") {
    setStudentState("state-warning", "warning");
  } else if (state.teacherState === "watching") {
    setStudentState("state-danger", "danger");
  } else {
    el.student.className =
      "student guinea-pig-student state-safe normal";
    setStudentFace("normal");
  }
}

function startBlinking() {
  clearInterval(blinkTimer);

  blinkTimer = setInterval(() => {
    if (
      !playing() ||
      rulesOpen ||
      state.teacherState !== "safe" ||
      reactionTimeLeft > 0
    ) return;

    setStudentFace("blink");

    setTimeout(() => {
      if (
        playing() &&
        state.teacherState === "safe" &&
        reactionTimeLeft === 0
      ) {
        setStudentFace("normal");
      }
    }, 140);
  }, 3300);
}

/* =========================================================
   Teacher state and emotions
   ========================================================= */

function clearTeacherEmotion() {
  el.teacher.classList.remove(
    "teacher-happy","teacher-angry"
  );
  el.teacherEmote.className = "teacher-emote";
  el.teacherEmote.style.boxShadow = "";
  el.teacher.dataset.emotion = "normal";
}

function drawTeacherEmote(type) {
  const thumbs = [
    "........KK......",
    ".......KYYK.....",
    ".......KYYK.....",
    "...KKK.KYYK.....",
    "..KGGGKKYYKK....",
    "..KGGGYYYYYK....",
    "..KGGGYYYYYK....",
    "..KGGGYYYYK.....",
    "...KKKKKKKK....."
  ];

  const anger = [
    "RR..........RR",
    ".RR..RRRR..RR.",
    "..RRR....RR...",
    "...RYYYYR.....",
    "..RYYYYYYR....",
    "...RYYYYR.....",
    "..RRRRRRRR....",
    ".RR..RRRR..RR.",
    "RR..........RR"
  ];

  const map = {
    K: "#584046",
    Y: "#f7cf5d",
    G: "#7bc77c",
    R: "#e46476"
  };

  el.teacherEmote.style.boxShadow =
    patternShadow(
      type === "happy" ? thumbs : anger,
      map,
      4
    );

  el.teacherEmote.classList.add(type);
}

function showTeacherEmotion(type) {
  clearTeacherEmotion();

  el.teacher.classList.add(
    type === "happy" ? "teacher-happy" : "teacher-angry"
  );

  setTeacherFace(
    type === "happy" ? "happy" : "angry"
  );

  drawTeacherEmote(type);
  el.teacher.dataset.emotion = type;
}

function updateTeacherAppearance() {
  el.teacher.classList.remove(
    "facing-away","warning","watching"
  );
  el.status.className = "teacher-status";

  if (state.teacherState === "safe") {
    el.teacher.classList.add("facing-away");
    el.status.classList.add("safe");
    el.status.textContent =
      "SAFE — 老师背对黑板，可以收集！";
    setTeacherFace("back");
  } else if (state.teacherState === "warning") {
    el.teacher.classList.add("warning");
    el.status.classList.add("warning");
    el.status.textContent =
      "WARNING — 老师快回头了！";
    setTeacherFace("back");
  } else {
    el.teacher.classList.add("watching");
    el.status.classList.add("danger");
    el.status.textContent =
      "DANGER — 老师正在检查，不要点击！";
    setTeacherFace(
      state.checkHadViolation ? "angry" : "happy"
    );
  }
}

function advanceTeacher() {
  if (state.teacherState === "safe") {
    clearTeacherEmotion();
    state.teacherState = "warning";
    state.teacherTimeLeft = random(
      CONFIG.warningMin, CONFIG.warningMax
    );

    clearReaction();
    setStudentState("state-warning", "warning");

    feedback("老师准备回头！");
    soundEffect(350);

  } else if (state.teacherState === "warning") {
    clearTeacherEmotion();
    state.teacherState = "watching";
    state.teacherTimeLeft = random(
      CONFIG.watchingMin, CONFIG.watchingMax
    );

    state.checkHadViolation = false;
    setStudentState("state-danger", "danger");

    showTeacherEmotion("happy");
    feedback("老师正在检查，保持安静！");
    soundEffect(850, .15);

  } else {
    const wasCaught = state.checkHadViolation;
    clearTeacherEmotion();

    state.teacherState = "safe";
    state.teacherTimeLeft = random(
      CONFIG.safeMin, CONFIG.safeMax
    );
    state.checkHadViolation = false;

    clearReaction();
    updateStudentIdle();

    feedback(
      wasCaught
        ? "老师转回去了，下一次小心！"
        : "检查通过！老师满意地继续上课。"
    );
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
   Items and four existing interactions
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

  const sprite = makePixelElement(
    item.id,"pixel-item",4
  );

  sprite.style.transform = "translate(-25px,-25px)";
  el.itemIcon.replaceChildren(sprite);

  const positions = [
    { left: 28, bottom: 31 },
    { left: 39, bottom: 38 },
    { left: 53, bottom: 31 },
    { left: 66, bottom: 38 }
  ];

  const p = positions[
    Math.floor(Math.random() * positions.length)
  ];

  el.collectible.style.left = p.left + "%";
  el.collectible.style.bottom = p.bottom + "%";
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

function studentCenter() {
  const layer = el.layer.getBoundingClientRect();
  const pig = el.student.getBoundingClientRect();

  return {
    x: pig.left - layer.left + 64,
    y: pig.top - layer.top + 83
  };
}

function clearReaction() {
  reactionTimeLeft = 0;
  reactionFace = null;
  el.layer.replaceChildren();
  delete el.layer.dataset.item;
  updateStudentIdle();
}

function addProp(item, x, y) {
  const prop = makePixelElement(
    item.id,"foreground-prop",4
  );
  prop.style.left = x + "px";
  prop.style.top = y + "px";
  el.layer.appendChild(prop);
  return prop;
}

function scatterCrumbs(x, y) {
  for (let i = 0; i < 9; i++) {
    const crumb = document.createElement("span");
    crumb.className = "pixel-crumb";
    crumb.style.left = x + random(-8,8) + "px";
    crumb.style.top = y + random(-8,8) + "px";
    crumb.style.setProperty(
      "--dx", random(-55,55) + "px"
    );
    crumb.style.setProperty(
      "--dy", random(-40,50) + "px"
    );
    el.layer.appendChild(crumb);
  }
}

function spawnTwinkles(x, y) {
  for (let i = 0; i < 10; i++) {
    const twinkle = document.createElement("span");
    twinkle.className = "pixel-twinkle";
    const angle = i * Math.PI / 5;
    const r = random(32,78);
    twinkle.style.left =
      x + Math.cos(angle) * r + "px";
    twinkle.style.top =
      y + Math.sin(angle) * r + "px";
    twinkle.style.animationDelay =
      random(0,.3) + "s";
    el.layer.appendChild(twinkle);
  }
}

function playItemReaction(item) {
  clearReaction();

  const { x, y } = studentCenter();
  el.layer.dataset.item = item.id;

  const faceByItem = {
    carrot: "carrot",
    cookie: "cookie",
    doodle: "happy",
    star: "win"
  };

  el.student.className =
    "student guinea-pig-student " + item.animation;

  setStudentFace(faceByItem[item.id]);

  if (item.id === "carrot") {
    addProp(item,x + 20,y);
  }

  if (item.id === "cookie") {
    addProp(item,x + 22,y);
    scatterCrumbs(x + 15,y + 10);
  }

  if (item.id === "doodle") {
    const paper = document.createElement("div");
    paper.className = "foreground-doodle-paper";

    const scene = el.layer.getBoundingClientRect();
    const desk = document.querySelector(".desk")
      .getBoundingClientRect();

    const px = Math.min(x + 65,scene.width - 55);
    const py = Math.min(
      y + 35,desk.top - scene.top + 42
    );

    paper.style.left = px + "px";
    paper.style.top = py + "px";

    const flower = makePixelElement(
      "flower","pixel-item",4
    );
    flower.style.transform = "translate(-25px,-25px)";
    paper.appendChild(flower);
    el.layer.appendChild(paper);

    addProp(item,px - 15,py - 19);
  }

  if (item.id === "star") {
    addProp(item,x,y - 44);
    spawnTwinkles(x,y - 30);
  }

  reactionFace = faceByItem[item.id];
  reactionTimeLeft = item.duration;
  showEffect("+1");
}

function collectItem() {
  if (
    !playing() ||
    rulesOpen ||
    !state.activeItem
  ) return;

  const item = state.activeItem;
  hideItem();
  scheduleItem();

  if (state.teacherState === "watching") {
    state.caught++;
    state.checkHadViolation = true;

    clearReaction();
    setStudentState("scared", "caught");
    showTeacherEmotion("angry");

    showEffect("!");
    soundEffect(170,.25);

    feedback(
      `被老师抓到了！${state.caught}/${CONFIG.maxCaught}`
    );

    updateHUD();

    if (state.caught >= CONFIG.maxCaught) {
      finishGame(false,"被老师发现了 3 次！");
    } else {
      reactionTimeLeft = 600;
    }

    return;
  }

  if (state.teacherState === "warning") {
    clearReaction();
    setStudentState("gp-hide","warning");
    soundEffect(300);
    feedback("老师快回头了，本次不加分！");
    reactionTimeLeft = 400;
    return;
  }

  state.score += item.points;
  state.collectedCount++;

  playItemReaction(item);
  soundEffect(item.sound);
  updateHUD();

  feedback(
    `${item.message} ${state.score}/${CONFIG.targetScore} 分`
  );
}

/* =========================================================
   V2.4 Update: settlement stickers and falling effects
   ========================================================= */

const STICKERS = {
  smile: [
    "..KKKKKK..",
    ".KYYYYYYK.",
    "KYYYYYYYYK",
    "KYYKYYKYYK",
    "KYYYYYYYYK",
    "KYYKYYKYYK",
    "KYYYKKYYYK",
    ".KYYYYYYK.",
    "..KKKKKK.."
  ],
  heart: [
    ".RR..RR.",
    "RRRRRRRR",
    "RRRRRRRR",
    ".RRRRRR.",
    "..RRRR..",
    "...RR..."
  ],
  balloon: [
    "..KKKK..",
    ".KRRRRK.",
    "KRRWWRRK",
    "KRRRRRRK",
    ".KRRRRK.",
    "..KKKK..",
    "...KK...",
    "...KK...",
    "...KK..."
  ],
  confetti: [
    ".R....G.",
    "..R..G..",
    "..YGG...",
    "...YY...",
    ".P....V.",
    "P......V"
  ],
  sadStar: [
    "...XX...",
    "...XX...",
    "XXXXXXXX",
    ".XXXXXX.",
    "..XXXX..",
    ".XX..XX."
  ],
  tear: [
    "...BB...",
    "..BBBB..",
    ".BBBBBB.",
    "BBBBBBBB",
    ".BBBBBB.",
    "..BBBB.."
  ],
  bang: [
    "..RR..RR..",
    ".RRRRRRRR.",
    "RRRRRRRRRR",
    ".RRRKKRRR.",
    "RRRRRRRRRR",
    "..RRRRRR.."
  ]
};

const STICKER_COLORS = {
  K: "#45343f",
  Y: "#ffdb5f",
  R: "#e96d88",
  G: "#7fc899",
  P: "#db9dda",
  V: "#937acf",
  W: "#fffbe5",
  X: "#9b9baa",
  B: "#83bce2"
};

function clearSettlement() {
  resultPaused = false;
  el.particles.replaceChildren();
  el.particles.classList.remove("is-paused");
  el.scene.classList.remove("settlement-paused");
  el.resultIcon.className = "result-icon";
  el.resultIcon.style.boxShadow = "";
  el.pauseButton.disabled = false;
  stopAllNotes();
}

function startSettlement(won) {
  clearSettlement();

  const types = won
    ? ["star","smile","heart","balloon","confetti","bang"]
    : ["sadStar","tear","sadStar","tear","confetti"];

  for (let i = 0; i < 26; i++) {
    const type = types[
      Math.floor(Math.random() * types.length)
    ];

    const sticker = document.createElement("div");
    sticker.className = "result-sticker";

    const rows = type === "star"
      ? PIXEL_ART.star
      : STICKERS[type];

    const palette = type === "star"
      ? ITEM_PALETTE
      : STICKER_COLORS;

    sticker.style.boxShadow =
      patternShadow(rows,palette,5);

    sticker.style.setProperty(
      "--x",random(4,90) + "%"
    );

    sticker.style.setProperty(
      "--drift",random(-80,80) + "px"
    );

    sticker.style.setProperty(
      "--distance",
      (el.scene.clientHeight + 90) + "px"
    );

    sticker.style.setProperty(
      "--fall-time",random(2.5,3.1) + "s"
    );

    sticker.style.setProperty(
      "--delay",random(0,.9) + "s"
    );

    sticker.style.setProperty(
      "--rotation",random(-270,270) + "deg"
    );

    el.particles.appendChild(sticker);
  }

  el.resultIcon.classList.add(
    won ? "win" : "lose"
  );

  el.resultIcon.style.boxShadow =
    patternShadow(
      won ? PIXEL_ART.star : STICKERS.tear,
      won ? ITEM_PALETTE : STICKER_COLORS,
      5
    );

  playSettlementMusic(won);
}

function toggleSettlementPause() {
  resultPaused = !resultPaused;

  el.particles.classList.toggle(
    "is-paused",resultPaused
  );

  el.scene.classList.toggle(
    "settlement-paused",resultPaused
  );

  if (resultPaused) pauseAudio();
  else resumeAudio();

  updateControlIcons();
}

/* =========================================================
   Timer and game lifecycle
   ========================================================= */

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function tick() {
  if (!playing() || rulesOpen) return;

  const now = performance.now();
  const delta = Math.max(0,now - lastTick);
  lastTick = now;

  state.timeLeft = Math.max(
    0,state.timeLeft - delta
  );

  if (state.timeLeft <= 0) {
    state.timeLeft = 0;

    finishGame(
      state.score >= CONFIG.targetScore &&
      state.caught < CONFIG.maxCaught,
      state.score >= CONFIG.targetScore
        ? "成功坚持到下课！"
        : "下课了，但分数还不够！"
    );
    return;
  }

  updateTeacher(delta);
  updateItems(delta);

  if (reactionTimeLeft > 0) {
    reactionTimeLeft -= delta;

    if (reactionTimeLeft <= 0) {
      clearReaction();
    }
  }

  updateHUD();
}

function startTimer() {
  stopTimer();
  lastTick = performance.now();
  timerId = setInterval(tick,CONFIG.tickRate);
}

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
  clearTeacherEmotion();
  clearSettlement();

  state.mode = "playing";
  state.teacherState = "safe";
  state.teacherTimeLeft = 3500;
  state.checkHadViolation = false;

  hideOverlay();
  el.pauseButton.disabled = false;
  el.game.classList.remove("game-paused");

  updateTeacherAppearance();
  updateStudentIdle();
  scheduleItem();
  startTimer();
  startBackgroundMusic();
  startBlinking();
  updateControlIcons();

  feedback("游戏开始！趁老师转身收集道具！");
  soundEffect(700);
}

function pauseGame() {
  if (!playing()) return;

  state.mode = "paused";
  stopTimer();
  stopBackgroundMusic();
  clearInterval(blinkTimer);
  el.game.classList.add("game-paused");

  el.collectible.hidden = true;
  el.collectible.disabled = true;

  pauseAudio();

  showOverlay("PAUSED","游戏已暂停。","CONTINUE");
  updateControlIcons();
  feedback("游戏已暂停。");
}

function resumeGame() {
  if (state.mode !== "paused" || rulesOpen) return;

  state.mode = "playing";
  hideOverlay();

  el.game.classList.remove("game-paused");

  if (state.activeItem) {
    el.collectible.hidden = false;
    el.collectible.disabled = false;
  }

  resumeAudio();
  startTimer();
  startBackgroundMusic();
  startBlinking();
  updateControlIcons();

  feedback("游戏继续！");
}

function finishGame(won, reason) {
  if (state.mode === "finished") return;

  state.mode = "finished";

  stopTimer();
  stopBackgroundMusic();
  clearInterval(blinkTimer);
  hideItem();
  clearReaction();
  clearTeacherEmotion();

  setStudentState(
    won ? "state-win" : "state-lose",
    won ? "win" : "lose"
  );

  el.game.classList.remove("game-paused");

  const summary =
    `${reason}\n` +
    `最终分数：${state.score}\n` +
    `成功收集：${state.collectedCount}\n` +
    `被老师发现：${state.caught} 次`;

  showOverlay(
    won ? "YOU WIN!" : "GAME OVER",
    summary,
    won ? "PLAY AGAIN" : "TRY AGAIN"
  );

  updateHUD();
  feedback(
    won
      ? "恭喜小豚鼠成功下课！"
      : "小豚鼠有点失落，下次加油！"
  );

  startSettlement(won);
  updateControlIcons();
}

function resetGame() {
  stopTimer();
  stopBackgroundMusic();
  clearInterval(blinkTimer);

  clearSettlement();
  clearReaction();
  clearTeacherEmotion();

  state = initialState();
  musicStep = 0;

  hideItem();
  el.effect.textContent = "";
  el.effect.classList.remove("pop");

  el.game.classList.remove("game-paused");

  setStudentState("state-safe","normal");
  updateTeacherAppearance();
  updateHUD();

  el.pauseButton.disabled = true;
  hideOverlay();
  updateControlIcons();

  feedback("准备好了！点击 START GAME。");
}

/* =========================================================
   V2.4 Update: rules dialog
   ========================================================= */

function setRulesVisibility(visible) {
  rulesOpen = visible;
  el.rulesOverlay.hidden = !visible;
}

function openRules() {
  if (rulesOpen) return;

  rulesPreviousFocus = document.activeElement;
  rulesReturnMode = state.mode;

  if (playing()) pauseGame();

  if (state.mode === "finished" && !resultPaused) {
    el.particles.classList.add("is-paused");
    pauseAudio();
  }

  setRulesVisibility(true);

  const initial = rulesReturnMode === "ready";
  el.rulesStartButton.hidden = !initial;
  el.rulesCloseButton.hidden = initial;

  (initial
    ? el.rulesStartButton
    : el.rulesCloseButton
  ).focus();
}

function closeRules() {
  if (!rulesOpen) return;

  setRulesVisibility(false);
  const previous = rulesReturnMode;
  rulesReturnMode = "ready";

  if (
    previous === "playing" &&
    state.mode === "paused"
  ) {
    resumeGame();
  }

  if (
    previous === "finished" &&
    !resultPaused
  ) {
    el.particles.classList.remove("is-paused");
    resumeAudio();
  }

  if (rulesPreviousFocus?.focus) {
    rulesPreviousFocus.focus();
  }
  rulesPreviousFocus = null;
}

function startFromRules() {
  if (state.mode !== "ready") {
    closeRules();
    return;
  }

  setRulesVisibility(false);
  rulesReturnMode = "ready";
  startGame();
}

function restartToRules() {
  resetGame();
  rulesReturnMode = "ready";
  setRulesVisibility(true);
  el.rulesStartButton.hidden = false;
  el.rulesCloseButton.hidden = true;
  el.rulesStartButton.focus();
}

/* =========================================================
   Events
   ========================================================= */

el.rulesButton.addEventListener("click",openRules);

el.rulesStartButton.addEventListener(
  "click",startFromRules
);

el.rulesCloseButton.addEventListener(
  "click",closeRules
);

el.collectible.addEventListener(
  "click",collectItem
);

el.startButton.addEventListener("click",() => {
  if (rulesOpen) return;
  if (state.mode === "paused") resumeGame();
  else restartToRules();
});

el.pauseButton.addEventListener("click",() => {
  if (rulesOpen) return;

  if (playing()) pauseGame();
  else if (state.mode === "paused") resumeGame();
  else if (state.mode === "finished") {
    toggleSettlementPause();
  }
});

el.resetButton.addEventListener("click",() => {
  if (!rulesOpen) restartToRules();
});

el.soundButton.addEventListener("click",() => {
  if (rulesOpen) return;

  soundEnabled = !soundEnabled;

  if (!soundEnabled) {
    stopBackgroundMusic();
    stopAllNotes();
    pauseAudio();
  } else {
    resumeAudio();

    if (playing()) {
      startBackgroundMusic();
    }
  }

  updateControlIcons();
});

document.addEventListener("keydown",event => {
  if (rulesOpen) {
    if (
      event.key === "Escape" &&
      rulesReturnMode !== "ready"
    ) {
      closeRules();
    }

    if (event.key === "Tab") {
      const button =
        rulesReturnMode === "ready"
          ? el.rulesStartButton
          : el.rulesCloseButton;

      event.preventDefault();
      button.focus();
    }

    return;
  }

  if (
    event.code === "Space" &&
    event.target === document.body
  ) {
    event.preventDefault();

    if (playing()) pauseGame();
    else if (state.mode === "paused") resumeGame();
  }
});

/* Automatic pause on tab/window loss */

document.addEventListener("visibilitychange",() => {
  if (document.hidden) {
    if (playing()) pauseGame();

    if (state.mode === "finished" && !resultPaused) {
      resultPaused = true;
      el.particles.classList.add("is-paused");
      pauseAudio();
      updateControlIcons();
    }
  }
});

window.addEventListener("blur",() => {
  if (playing()) pauseGame();
});

/* =========================================================
   Initialisation
   ========================================================= */

resetGame();

rulesReturnMode = "ready";
setRulesVisibility(true);
el.rulesStartButton.hidden = false;
el.rulesCloseButton.hidden = true;
el.rulesStartButton.focus();

/* END OF CLASSROOM DAYDREAM V2.4 */
