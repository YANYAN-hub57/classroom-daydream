
"use strict";

/* ============================================================
   CLASSROOM DAYDREAM V2.6.1
   COMPLETE SCRIPT.JS

   Vanilla JavaScript / Web Audio API
   No external assets or libraries
   ============================================================ */


/* ============================================================
   01. GAME SETTINGS
   ============================================================ */

/* V2.6.1 Score Update */
const CONFIG = {
  duration: 60,
  targetScore: 10,
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

const random = (a, b) => a + Math.random() * (b - a);

const choose = array =>
  array[Math.floor(Math.random() * array.length)];


/* ============================================================
   02. HTML ELEMENTS
   ============================================================ */

const $ = id => document.getElementById(id);

const el = {
  game: $("game"),
  scene: $("scene"),

  student: $("student"),
  teacher: $("teacher"),
  teacherEmote: $("teacher-emote"),

  time: $("time-value"),
  score: $("score-value"),
  caught: $("caught-value"),
  status: $("teacher-status"),

  collectible: $("collectible"),
  itemIcon: $("collectible-icon"),

  layer: $("interaction-layer"),
  speech: $("speech-layer"),
  particles: $("result-particles"),

  resultIcon: $("result-icon"),
  effect: $("effect"),
  feedback: $("feedback"),

  overlay: $("overlay"),
  overlayTitle: $("overlay-title"),
  overlayMessage: $("overlay-message"),
  startButton: $("start-button"),

  pauseButton: $("pause-button"),
  pauseIcon: $("pause-icon"),
  pauseLabel: $("pause-label"),

  soundButton: $("sound-button"),
  soundIcon: $("sound-icon"),
  soundLabel: $("sound-label"),

  resetButton: $("reset-button"),

  rulesButton: $("rules-button"),
  rulesOverlay: $("rules-overlay"),
  rulesStartButton: $("rules-start-button"),
  rulesCloseButton: $("rules-close-button"),

  portraitHint: $("portrait-hint")
};

for (const [name, element] of Object.entries(el)) {
  if (!element) {
    throw new Error(`Missing HTML element: ${name}`);
  }
}


/* ============================================================
   03. PIXEL COLOURS
   ============================================================ */

const C = {
  K: "#654b44",
  B: "#9a7d6c",
  A: "#b49a87",
  X: "#92918b",
  x: "#b8b7a8",
  O: "#e5aa70",
  L: "#f4c693",
  W: "#fffaf0",
  H: "#f4e6cd",
  P: "#ecb1b3",
  E: "#59413f",
  R: "#e46a77",
  T: "#75bfe2",
  Y: "#f8d66b",
  G: "#71a876",
  V: "#a987c9"
};

const ITEM_COLORS = {
  K: "#614842",
  O: "#ed873c",
  L: "#f7b952",
  G: "#65a34d",
  D: "#376944",
  C: "#f5d5a0",
  B: "#ad7047",
  H: "#fff3d8",
  W: "#fffaf2",
  Y: "#ffda67",
  P: "#e895b1",
  R: "#e86a76",
  V: "#a489d1",
  T: "#76b7bf",
  X: "#989ba5"
};


/* ============================================================
   04. PIXEL DRAWING HELPERS
   ============================================================ */

function makeCanvas(w, h) {
  return Array.from(
    { length: h },
    () => Array(w).fill(null)
  );
}

function rectangle(g, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      if (
        g[yy] &&
        xx >= 0 &&
        xx < g[yy].length
      ) {
        g[yy][xx] = color;
      }
    }
  }
}

function oval(g, cx, cy, rx, ry, color) {
  for (let y = Math.ceil(cy - ry); y <= cy + ry; y++) {
    for (let x = Math.ceil(cx - rx); x <= cx + rx; x++) {
      const d =
        ((x - cx) / rx) ** 2 +
        ((y - cy) / ry) ** 2;

      if (d <= 1) {
        rectangle(g, x, y, 1, 1, color);
      }
    }
  }
}

function pixelShadow(g, px = 4) {
  const shadows = [];

  g.forEach((row, y) => {
    row.forEach((color, x) => {
      if (color) {
        shadows.push(
          `${x * px}px ${y * px}px 0 0 ${color}`
        );
      }
    });
  });

  return shadows.join(",");
}

function patternShadow(rows, palette = ITEM_COLORS, px = 4) {
  const shadows = [];

  rows.forEach((row, y) => {
    [...row].forEach((symbol, x) => {
      if (palette[symbol]) {
        shadows.push(
          `${x * px}px ${y * px}px 0 0 ${palette[symbol]}`
        );
      }
    });
  });

  return shadows.join(",");
}


/* ============================================================
   05. GUINEA PIG PIXEL CHARACTERS

   One empty DIV per character.
   Drawn entirely using CSS box-shadow.
   ============================================================ */

function drawPig(teacher = false, face = "normal") {
  const g = makeCanvas(36, 38);

  const back =
    teacher &&
    (face === "back" || face === "warning");

  // Rounded body
  oval(g, 18, 28, 15, 8, C.K);
  oval(g, 18, 27, 14, 7, teacher ? C.G : C.H);

  // Ears
  oval(g, 8, 11, 6, 7, C.K);
  oval(g, 28, 11, 6, 7, C.K);
  oval(g, 8, 11, 4, 5, C.P);
  oval(g, 28, 11, 4, 5, C.P);

  // Rounded head
  oval(g, 18, 21, 17, 13, C.K);
  oval(g, 18, 20, 16, 12, teacher ? C.H : C.W);

  // Fur patches
  oval(g, 9, 18, 8, 10, C.X);
  oval(g, 28, 18, 7, 10, teacher ? C.B : C.O);
  oval(g, 17, 22, 10, 9, C.W);

  if (back) {
    oval(g, 18, 21, 14, 11, C.B);
    oval(g, 10, 20, 7, 8, C.X);
    rectangle(g, 12, 29, 10, 2, C.A);
  } else {
    // Cheeks
    rectangle(g, 6, 24, 5, 3, C.P);
    rectangle(g, 25, 24, 5, 3, C.P);

    const happy = [
      "happy", "cookie", "cake", "win", "star"
    ].includes(face);

    const sad = ["sad", "lose"].includes(face);

    const shocked = [
      "warning", "caught", "surprised"
    ].includes(face);

    // Eyes
    if (happy) {
      rectangle(g, 11, 20, 5, 1, C.E);
      rectangle(g, 21, 20, 5, 1, C.E);
    } else if (sad) {
      rectangle(g, 11, 22, 5, 2, C.E);
      rectangle(g, 21, 22, 5, 2, C.E);
    } else if (shocked) {
      rectangle(g, 12, 18, 3, 6, C.E);
      rectangle(g, 22, 18, 3, 6, C.E);
    } else if (face === "blink") {
      rectangle(g, 11, 21, 5, 1, C.E);
      rectangle(g, 21, 21, 5, 1, C.E);
    } else {
      rectangle(g, 12, 19, 3, 4, C.E);
      rectangle(g, 22, 19, 3, 4, C.E);
      rectangle(g, 12, 19, 1, 1, C.W);
      rectangle(g, 22, 19, 1, 1, C.W);
    }

    // Nose
    rectangle(g, 17, 25, 3, 2, C.B);
    rectangle(g, 18, 27, 1, 2, C.E);

    // Mouth
    if (
      shocked ||
      face === "juice" ||
      face === "angry"
    ) {
      rectangle(
        g, 17, 29, 3, 4,
        face === "angry" ? C.R : C.E
      );
    } else if (sad) {
      rectangle(g, 16, 31, 5, 1, C.E);
      rectangle(g, 16, 30, 1, 1, C.E);
      rectangle(g, 20, 30, 1, 1, C.E);
    } else {
      rectangle(g, 15, 29, 3, 1, C.E);
      rectangle(g, 19, 29, 3, 1, C.E);
      rectangle(g, 16, 30, 1, 1, C.E);
      rectangle(g, 20, 30, 1, 1, C.E);
    }

    // Eating expressions
    if (["carrot", "rice"].includes(face)) {
      rectangle(g, 5, 23, 7, 5, C.P);
      rectangle(g, 24, 23, 7, 5, C.P);
    }

    if (face === "cake") {
      rectangle(g, 24, 28, 4, 2, C.H);
    }

    // Sweat and tears
    if (["danger", "caught", "lose"].includes(face)) {
      rectangle(g, 27, 19, 2, 6, C.T);
    }

    if (["caught", "lose"].includes(face)) {
      rectangle(g, 8, 23, 2, 5, C.T);
    }

    // Teacher glasses
    if (teacher) {
      rectangle(g, 9, 18, 7, 1, C.E);
      rectangle(g, 21, 18, 7, 1, C.E);
      rectangle(g, 9, 18, 1, 7, C.E);
      rectangle(g, 15, 18, 1, 7, C.E);
      rectangle(g, 21, 18, 1, 7, C.E);
      rectangle(g, 27, 18, 1, 7, C.E);
      rectangle(g, 16, 19, 5, 1, C.E);

      if (face === "angry") {
        rectangle(g, 10, 15, 5, 2, C.E);
        rectangle(g, 22, 15, 5, 2, C.E);
      }
    }
  }

  // Tuft of hair
  rectangle(g, 16, 6, 1, 2, C.K);
  rectangle(g, 18, 5, 1, 3, C.K);
  rectangle(g, 20, 6, 1, 2, C.K);

  // Feet
  rectangle(g, 10, 33, 5, 2, C.H);
  rectangle(g, 22, 33, 5, 2, C.H);

  if (teacher) {
    // Uniform and pointer
    rectangle(g, 12, 35, 12, 2, C.G);
    rectangle(g, 32, 23, 1, 13, C.K);
    rectangle(g, 32, 22, 1, 1, C.Y);
  }

  return pixelShadow(g);
}

const characterCache = new Map();

function setFace(character, expression) {
  const key = `${character}-${expression}`;

  if (!characterCache.has(key)) {
    characterCache.set(
      key,
      drawPig(character === "teacher", expression)
    );
  }

  el[character].style.boxShadow =
    characterCache.get(key);

  el[character].dataset.face = expression;
}


/* ============================================================
   06. SEVEN COLLECTIBLE ITEMS
   ============================================================ */

const ART = {
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
    ".......KK......"
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

  cake: [
    "......RR.......",
    ".....RGGR......",
    "......GG.......",
    "...KKKKKKKK....",
    "..KWWWWWWWWK...",
    "..KWPPPPPPWK...",
    "..KWWWWWWWWK...",
    "..KRWWRWWRWK...",
    "..KRRRRRRRRK...",
    "..KWWWWWWWWK...",
    "..KLLLLLLLLK...",
    "...KKKKKKKK...."
  ],

  riceball: [
    ".....KKKK......",
    "....KWWWWK.....",
    "...KWWWWWWK....",
    "..KWWWWWWWWK...",
    ".KWWWWWWWWWWK..",
    "KWWWWWWWWWWWWK.",
    "KWWWDDDDWWWWWK.",
    "KWWWDDDDWWWWWK.",
    "KWWWDDDDWWWWWK.",
    ".KWWDDDDWWWWK..",
    "..KKKKKKKKKK..."
  ],

  juice: [
    ".......RRR.....",
    ".......RWR.....",
    ".......RRR.....",
    "......RR.......",
    "..KKKKKKKKKK...",
    ".KHHHHHHHHHHK..",
    ".KOOOOOOOOOOK..",
    ".KOOOWWOOLOOK..",
    ".KOOOOOOOOOOK..",
    ".KOOOOOOOOOOK..",
    ".KLLLLLLLLLLK..",
    "..KKKKKKKKKK..."
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
    "......DD......."
  ],

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

  balloon: [
    "..KKKK..",
    ".KRRRRK.",
    "KRRWWRRK",
    "KRRRRRRK",
    ".KRRRRK.",
    "..KKKK..",
    "...KK...",
    "...KK..."
  ],

  heart: [
    ".RR..RR.",
    "RRRRRRRR",
    "RRRRRRRR",
    ".RRRRRR.",
    "..RRRR..",
    "...RR..."
  ],

  confetti: [
    ".R....G.",
    "..R..G..",
    "..YGG...",
    "...YY...",
    ".P....V.",
    "P......V"
  ],

  bubble: [
    ".KKKKKKKKKK.",
    "KWWWWWWWWWWK",
    "KWWWWWWWWWWK",
    "KWWWWWWWWWWK",
    ".KKKKKKKKKK.",
    "...KK......"
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
    "...TT...",
    "..TTTT..",
    ".TTTTTT.",
    "TTTTTTTT",
    ".TTTTTT.",
    "..TTTT.."
  ],

  exclamation: [
    "..KK..",
    "..KK..",
    "..KK..",
    "..KK..",
    "......",
    "..KK..",
    "..KK.."
  ],

  question: [
    "..KKKK..",
    ".KK..KK.",
    ".....KK.",
    "....KK..",
    "...KK...",
    "........",
    "...KK..."
  ],

  thumbs: [
    "......KK..",
    ".....KYYK.",
    "..KK.KYYK.",
    ".KGGKKYYK.",
    ".KGGYYYYK.",
    ".KGGYYYYK.",
    "..KKKKKKK."
  ],

  anger: [
    "RR.....RR",
    ".RR.R.RR.",
    "..RRRRR..",
    "..RYYR...",
    ".RRRRRRR.",
    "RR.....RR"
  ]
};

function sprite(name, className = "pixel-item", px = 4) {
  const element = document.createElement("span");

  element.className = className;

  Object.assign(element.style, {
    position: "absolute",
    display: "block",
    width: `${px}px`,
    height: `${px}px`,
    background: "transparent",
    pointerEvents: "none"
  });

  element.style.boxShadow =
    patternShadow(ART[name], ITEM_COLORS, px);

  return element;
}

const ITEMS = [
  {
    id: "carrot",
    name: "Carrot",
    animation: "gp-eat-carrot",
    face: "carrot",
    duration: 1600,
    message: "Crunchy carrot! Puffy cheeks!"
  },
  {
    id: "cookie",
    name: "Cookie",
    animation: "gp-eat-cookie",
    face: "cookie",
    duration: 1600,
    message: "Crunch, crunch! What a tasty cookie!"
  },
  {
    id: "doodle",
    name: "Doodle",
    animation: "gp-draw",
    face: "happy",
    duration: 1800,
    message: "A little pixel flower takes shape!"
  },
  {
    id: "star",
    name: "Star",
    animation: "gp-star",
    face: "win",
    duration: 1500,
    message: "A shiny star! Make a wish!"
  },
  {
    id: "cake",
    name: "Cake",
    animation: "gp-eat-cake",
    face: "cake",
    duration: 1600,
    message: "Yummy, yummy! Sweet cake!"
  },
  {
    id: "riceball",
    name: "Rice Ball",
    animation: "gp-eat-rice",
    face: "rice",
    duration: 1600,
    message: "A big bite of rice ball!"
  },
  {
    id: "juice",
    name: "Orange Juice",
    animation: "gp-drink-juice",
    face: "juice",
    duration: 1600,
    message: "Gulp, gulp! Refreshing juice!"
  }
];


/* ============================================================
   07. GAME STATE
   ============================================================ */

function initialState() {
  return {
    mode: "ready",
    timeLeft: CONFIG.duration * 1000,
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

let timer = null;
let lastTick = 0;
let reactionTime = 0;

let blinkTimer = null;
let blinkReturn = null;

let rulesOpen = true;
let rulesBefore = "ready";
let returnFocus = null;
let settlementPausedForRules = false;

let soundOn = true;
let resultPaused = false;
let settlementWon = false;

const playing = () => state.mode === "playing";


/* ============================================================
   08. WEB AUDIO SYSTEM
   ============================================================ */

let audio = null;
let master = null;

const activeVoices = new Set();

function audioInit() {
  try {
    if (!audio) {
      const AudioClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioClass) return null;

      audio = new AudioClass();

      master = audio.createGain();
      master.gain.value = 0.6;
      master.connect(audio.destination);
    }

    return audio;
  } catch (error) {
    console.warn("Audio unavailable:", error);
    return null;
  }
}

function audioResume() {
  const context = audioInit();

  if (
    context &&
    soundOn &&
    context.state === "suspended"
  ) {
    context.resume().catch(() => {});
  }
}

function audioSuspend() {
  if (audio && audio.state === "running") {
    audio.suspend().catch(() => {});
  }
}

function tone(
  frequency,
  duration = 0.12,
  volume = 0.035,
  type = "square",
  delay = 0
) {
  if (!soundOn) return;

  const context = audioInit();
  if (!context || !master) return;

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    const start = context.currentTime + delay;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      start
    );

    gain.gain.setValueAtTime(0.0001, start);

    gain.gain.linearRampToValueAtTime(
      volume,
      start + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      start + duration
    );

    oscillator.connect(gain);
    gain.connect(master);

    activeVoices.add(oscillator);

    oscillator.onended = () => {
      activeVoices.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };

    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  } catch (error) {
    console.warn("Sound skipped:", error);
  }
}

function noise(duration = 0.08, volume = 0.025) {
  if (!soundOn) return;

  const context = audioInit();
  if (!context || !master) return;

  try {
    const length = Math.max(
      1,
      Math.floor(context.sampleRate * duration)
    );

    const buffer = context.createBuffer(
      1,
      length,
      context.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] =
        (Math.random() * 2 - 1) *
        (1 - i / length);
    }

    const source = context.createBufferSource();
    const gain = context.createGain();

    source.buffer = buffer;
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(master);

    activeVoices.add(source);

    source.onended = () => {
      activeVoices.delete(source);
      source.disconnect();
      gain.disconnect();
    };

    source.start();
  } catch (error) {
    console.warn("Noise skipped:", error);
  }
}

function stopVoices() {
  for (const voice of activeVoices) {
    try {
      voice.stop();
    } catch (_) {}
  }

  activeVoices.clear();
}


/* ============================================================
   09. THREE-STAGE BACKGROUND MUSIC
   ============================================================ */

let bgmTimer = null;
let bgmStep = 0;

const BGM_MELODY = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 698.46, 880, 698.46,
  659.25, 783.99, 1046.5, 783.99,
  587.33, 698.46, 783.99, 523.25
];

function stopBgm() {
  clearTimeout(bgmTimer);
  bgmTimer = null;
}

function bgmTick() {
  if (!playing() || rulesOpen || !soundOn) return;

  const seconds = state.timeLeft / 1000;
  const stage =
    seconds > 40 ? 0 :
    seconds > 20 ? 1 : 2;

  const speed = [330, 235, 155][stage];
  const pitch = [1, 1.12, 1.25][stage];

  tone(
    BGM_MELODY[bgmStep % BGM_MELODY.length] * pitch,
    0.13,
    0.018
  );

  if (bgmStep % (stage === 0 ? 4 : 2) === 0) {
    tone(
      [130.81, 146.83, 164.81, 146.83][
        Math.floor(bgmStep / 4) % 4
      ],
      0.14,
      0.012,
      "triangle"
    );
  }

  if (stage >= 1 && bgmStep % 2 === 1) {
    tone(190, 0.035, 0.007);
  }

  if (stage === 2 && bgmStep % 4 === 3) {
    tone(1174.66, 0.05, 0.01);
  }

  bgmStep++;
  bgmTimer = setTimeout(bgmTick, speed);
}

function startBgm() {
  stopBgm();

  if (!playing() || rulesOpen || !soundOn) return;

  audioResume();
  bgmTick();
}


/* ============================================================
   10. SETTLEMENT MUSIC
   ============================================================ */

let resultMusicTimer = null;
let resultStep = 0;

const WIN_TUNE = [
  [523.25, 0.16],
  [659.25, 0.16],
  [783.99, 0.16],
  [1046.5, 0.34],
  [783.99, 0.16],
  [880, 0.16],
  [1046.5, 0.4],
  [1318.51, 0.5]
];

const LOSE_TUNE = [
  [392, 0.35],
  [349.23, 0.38],
  [329.63, 0.4],
  [293.66, 0.44],
  [261.63, 0.65]
];

function stopResultMusic() {
  clearTimeout(resultMusicTimer);
  resultMusicTimer = null;
}

function resultMusicTick() {
  if (
    state.mode !== "finished" ||
    resultPaused ||
    rulesOpen ||
    !soundOn
  ) return;

  const melody = settlementWon ? WIN_TUNE : LOSE_TUNE;
  const [frequency, duration] =
    melody[resultStep % melody.length];

  tone(
    frequency,
    duration,
    settlementWon ? 0.045 : 0.032,
    settlementWon ? "square" : "triangle"
  );

  const atEnd =
    resultStep % melody.length === melody.length - 1;

  resultStep++;

  resultMusicTimer = setTimeout(
    resultMusicTick,
    duration * 1000 + (atEnd ? 650 : 65)
  );
}

function startResultMusic(won) {
  stopResultMusic();

  settlementWon = won;
  resultStep = 0;

  if (soundOn && !resultPaused && !rulesOpen) {
    audioResume();
    resultMusicTick();
  }
}


/* ============================================================
   11. DIFFERENT ITEM SOUNDS
   ============================================================ */

function itemSound(id) {
  if (!soundOn) return;

  switch (id) {
    case "carrot":
      noise(0.055, 0.038);
      tone(570, 0.07, 0.045);
      break;

    case "cookie":
      // Crunch, crunch
      noise(0.11, 0.065);
      tone(290, 0.08, 0.03);
      setTimeout(() => {
        if (playing() && soundOn) {
          noise(0.1, 0.06);
          tone(320, 0.07, 0.03);
        }
      }, 220);
      break;

    case "doodle":
      // Scratchy pencil-on-paper sound
      for (let i = 0; i < 9; i++) {
        setTimeout(() => {
          if (playing() && soundOn) {
            noise(0.065, 0.016);
          }
        }, i * 150);
      }
      break;

    case "star":
      // Metallic chime
      [1046.5, 1568, 2093].forEach((freq, i) => {
        tone(freq, 0.38, 0.045, "sine", i * 0.08);
      });
      break;

    case "cake":
      // Cheerful "yum-yum" melodic imitation
      [659.25, 783.99, 659.25, 880].forEach(
        (freq, i) => {
          tone(freq, 0.15, 0.048, "triangle", i * 0.16);
        }
      );
      break;

    case "riceball":
      noise(0.1, 0.04);
      tone(390, 0.09, 0.04);
      break;

    case "juice":
      // Three rounded gulp sounds
      [300, 260, 220].forEach((freq, i) => {
        tone(freq, 0.13, 0.055, "sine", i * 0.24);
      });
      break;
  }
}


/* ============================================================
   12. HUD AND BUTTONS
   ============================================================ */

function updateHUD() {
  const seconds = Math.ceil(state.timeLeft / 1000);

  el.time.textContent = String(seconds);
  el.score.textContent = String(state.score);
  el.caught.textContent =
    `${state.caught} / ${CONFIG.maxCaught}`;

  el.score.style.color =
    state.score >= CONFIG.targetScore ? "#3e966a" : "";

  el.time.style.color =
    seconds <= 10 ? "#d76370" : "";
}

function updateButtons() {
  const paused =
    state.mode === "paused" || resultPaused;

  el.pauseIcon.className =
    "control-icon " +
    (paused ? "icon-play" : "icon-pause");

  el.pauseLabel.textContent =
    paused ? "RESUME" : "PAUSE";

  el.soundIcon.className =
    "control-icon " +
    (soundOn ? "icon-bell" : "icon-bell-muted");

  el.soundLabel.textContent =
    soundOn ? "SOUND ON" : "SOUND OFF";

  el.soundButton.setAttribute(
    "aria-pressed",
    String(soundOn)
  );
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

function showOverlay(title, message, action) {
  el.overlayTitle.textContent = title;
  el.overlayMessage.textContent = message;
  el.startButton.textContent = action;
  el.overlay.hidden = false;
}

function hideOverlay() {
  el.overlay.hidden = true;
}


/* ============================================================
   13. STUDENT EXPRESSIONS
   ============================================================ */

const STUDENT_CLASSES = [
  "state-safe", "state-warning", "state-danger",
  "state-win", "state-lose",
  "normal", "blink", "scared", "happy",
  "gp-hide", "gp-eat-carrot", "gp-eat-cookie",
  "gp-draw", "gp-star", "gp-eat-cake",
  "gp-eat-rice", "gp-drink-juice"
];

function setStudent(className, expression) {
  el.student.classList.remove(...STUDENT_CLASSES);
  el.student.classList.add(className);
  setFace("student", expression);
}

function idle() {
  if (state.teacherState === "safe") {
    setStudent("state-safe", "normal");
    el.student.classList.add("normal");
  } else if (state.teacherState === "warning") {
    setStudent("state-warning", "warning");
  } else {
    setStudent("state-danger", "danger");
  }
}

function stopBlink() {
  clearInterval(blinkTimer);
  clearTimeout(blinkReturn);
  blinkTimer = null;
  blinkReturn = null;
}

function startBlink() {
  stopBlink();

  blinkTimer = setInterval(() => {
    if (
      !playing() ||
      rulesOpen ||
      reactionTime > 0 ||
      state.teacherState !== "safe"
    ) return;

    setFace("student", "blink");

    blinkReturn = setTimeout(() => {
      if (
        playing() &&
        state.teacherState === "safe" &&
        reactionTime <= 0
      ) {
        setFace("student", "normal");
      }
    }, 140);
  }, 3300);
}


/* ============================================================
   14. TEACHER STATE MACHINE
   ============================================================ */

function teacherEmotion(kind) {
  el.teacher.classList.remove(
    "teacher-happy",
    "teacher-angry"
  );

  el.teacherEmote.className = "teacher-emote";
  el.teacherEmote.style.boxShadow = "";

  if (!kind) return;

  el.teacher.classList.add(
    kind === "happy" ? "teacher-happy" : "teacher-angry"
  );

  setFace("teacher", kind);

  el.teacherEmote.classList.add(kind);
  el.teacherEmote.style.boxShadow =
    patternShadow(ART[kind === "happy" ? "thumbs" : "anger"]);
}

function appearance() {
  el.teacher.classList.remove(
    "facing-away", "warning", "watching"
  );

  el.status.className =
    `teacher-status ${state.teacherState === "watching"
      ? "danger"
      : state.teacherState}`;

  if (state.teacherState === "safe") {
    el.teacher.classList.add("facing-away");
    setFace("teacher", "back");

    el.status.textContent =
      "SAFE — The teacher faces the board. Collect items!";
  } else if (state.teacherState === "warning") {
    el.teacher.classList.add("warning");
    setFace("teacher", "warning");

    el.status.textContent =
      "WARNING — The teacher is about to turn around!";
  } else {
    el.teacher.classList.add("watching");
    setFace(
      "teacher",
      state.checkHadViolation ? "angry" : "happy"
    );

    el.status.textContent =
      "DANGER — The teacher is watching. Don't tap!";
  }
}

function updateTeacher(delta) {
  state.teacherTimeLeft -= delta;

  while (state.teacherTimeLeft <= 0) {
    const overflow = -state.teacherTimeLeft;

    if (state.teacherState === "safe") {
      state.teacherState = "warning";
      state.teacherTimeLeft = random(
        CONFIG.warningMin, CONFIG.warningMax
      );

      clearReaction();
      setStudent("state-warning", "warning");
      feedback("The teacher is turning around!");
      tone(350, 0.12, 0.08);
    } else if (state.teacherState === "warning") {
      state.teacherState = "watching";
      state.teacherTimeLeft = random(
        CONFIG.watchingMin, CONFIG.watchingMax
      );

      state.checkHadViolation = false;
      teacherEmotion("happy");
      setStudent("state-danger", "danger");

      feedback("The teacher is checking the classroom!");
      tone(850, 0.15, 0.08);
    } else {
      state.teacherState = "safe";
      state.teacherTimeLeft = random(
        CONFIG.safeMin, CONFIG.safeMax
      );

      state.checkHadViolation = false;
      teacherEmotion(null);
      clearReaction();

      feedback("The teacher has turned back!");
    }

    appearance();
    state.teacherTimeLeft -= overflow;
  }
}


/* ============================================================
   15. RANDOM COLLECTIBLES
   ============================================================ */

function hideItem() {
  state.activeItem = null;
  state.itemTimeLeft = 0;
  el.collectible.hidden = true;
  el.collectible.disabled = true;
}

function nextItem() {
  state.nextItemTime = random(
    CONFIG.itemSpawnMin,
    CONFIG.itemSpawnMax
  );
}

function spawnItem() {
  if (!playing() || state.activeItem) return;

  const item = choose(ITEMS);

  state.activeItem = item;
  state.itemTimeLeft = CONFIG.itemLifetime;

  const icon = sprite(item.id);
  icon.style.left = "12px";
  icon.style.top = "5px";

  el.itemIcon.replaceChildren(icon);

  const position = choose([
    [28, 31],
    [39, 38],
    [53, 31],
    [66, 38]
  ]);

  el.collectible.style.left = `${position[0]}%`;
  el.collectible.style.bottom = `${position[1]}%`;

  el.collectible.setAttribute(
    "aria-label",
    `Collect ${item.name}`
  );

  el.collectible.hidden = false;
  el.collectible.disabled = false;
}

function updateItems(delta) {
  if (state.activeItem) {
    state.itemTimeLeft -= delta;

    if (state.itemTimeLeft <= 0) {
      hideItem();
      nextItem();
    }
  } else {
    state.nextItemTime -= delta;

    if (state.nextItemTime <= 0) {
      spawnItem();
    }
  }
}


/* ============================================================
   16. SPEECH BUBBLES
   ============================================================ */

function clearSpeech() {
  el.speech.replaceChildren();
}

function speech(character, message) {
  const bubble = document.createElement("div");
  bubble.className =
    `speech-bubble ${character}-bubble`;

  bubble.textContent = message;

  const scene = el.scene.getBoundingClientRect();
  const pig = el[character].getBoundingClientRect();

  const x =
    pig.left - scene.left + (character === "teacher" ? 65 : 72);

  const y =
    pig.top - scene.top + 15;

  bubble.style.left =
    `${Math.max(75, Math.min(scene.width - 75, x))}px`;

  bubble.style.top =
    `${Math.max(55, y)}px`;

  el.speech.appendChild(bubble);
}

function talkFor(item) {
  const conversations = {
    cookie: ["Crunch, crunch!", "Hmm?"],
    cake: ["Yummy, yummy!", "What's that?"],
    juice: ["So refreshing!", "Did I hear something?"],
    star: ["A shiny star!", "Huh?"]
  };

  const pair = conversations[item.id];

  if (pair) {
    speech("student", pair[0]);
    speech("teacher", pair[1]);
  }
}


/* ============================================================
   17. INTERACTION EFFECTS
   ============================================================ */

function clearReaction() {
  reactionTime = 0;
  el.layer.replaceChildren();
  clearSpeech();
  delete el.layer.dataset.item;

  if (playing()) idle();
}

function studentPosition() {
  const scene = el.scene.getBoundingClientRect();
  const pig = el.student.getBoundingClientRect();

  return {
    x: pig.left - scene.left + 72,
    y: pig.top - scene.top + 88
  };
}

function prop(name, x, y) {
  const element = sprite(name, "foreground-prop");
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;

  el.layer.appendChild(element);
}

function crumbs(x, y, count = 9) {
  for (let i = 0; i < count; i++) {
    const crumb = document.createElement("span");
    crumb.className = "pixel-crumb";

    crumb.style.left = `${x + random(-8, 8)}px`;
    crumb.style.top = `${y + random(-8, 8)}px`;

    crumb.style.setProperty(
      "--dx",
      `${random(-55, 55)}px`
    );

    crumb.style.setProperty(
      "--dy",
      `${random(-42, 50)}px`
    );

    el.layer.appendChild(crumb);
  }
}

function twinkles(x, y) {
  for (let i = 0; i < 10; i++) {
    const star = document.createElement("span");
    star.className = "pixel-twinkle";

    const angle = i * Math.PI / 5;
    const radius = random(30, 75);

    star.style.left =
      `${x + Math.cos(angle) * radius}px`;

    star.style.top =
      `${y + Math.sin(angle) * radius}px`;

    el.layer.appendChild(star);
  }
}

function react(item) {
  clearReaction();

  const { x, y } = studentPosition();

  el.layer.dataset.item = item.id;

  setStudent(item.animation, item.face);

  if (["carrot", "cookie", "cake", "riceball", "juice"]
    .includes(item.id)) {
    prop(item.id, x + 20, y);
  }

  if (item.id === "cookie") {
    crumbs(x + 20, y + 5);
  }

  if (item.id === "cake") {
    crumbs(x + 15, y + 8, 4);
  }

  if (item.id === "riceball") {
    crumbs(x + 15, y + 6, 4);
  }

  if (item.id === "star") {
    prop("star", x, y - 45);
    twinkles(x, y - 30);
  }

  if (item.id === "doodle") {
    const paper = document.createElement("div");
    paper.className = "foreground-doodle-paper";

    const desk = document.querySelector(".desk")
      .getBoundingClientRect();

    const scene = el.scene.getBoundingClientRect();

    const px = Math.min(x + 65, scene.width - 90);
    const py = Math.min(
      y + 35,
      desk.top - scene.top + 45
    );

    paper.style.left = `${px}px`;
    paper.style.top = `${py}px`;

    const flower = sprite("flower", "pixel-item");
    flower.style.left = "12px";
    flower.style.top = "8px";

    // The clipping element gradually reveals the flower.
    const reveal = document.createElement("div");
    reveal.className = "flower-reveal";
    reveal.appendChild(flower);

    paper.appendChild(reveal);
    el.layer.appendChild(paper);

    prop("doodle", px - 20, py - 20);
  }

  talkFor(item);
  itemSound(item.id);

  reactionTime = item.duration;

  showEffect("+1");
}


/* ============================================================
   18. COLLECT / SCORE / CAUGHT
   ============================================================ */

function collect() {
  if (!playing() || rulesOpen || !state.activeItem) {
    return;
  }

  const item = state.activeItem;

  // Prevent duplicate scoring.
  hideItem();
  nextItem();

  if (state.teacherState === "watching") {
    state.caught++;
    state.checkHadViolation = true;

    clearReaction();

    setStudent("scared", "caught");
    teacherEmotion("angry");

    showEffect("!");
    tone(170, 0.26, 0.09);

    feedback(
      `Caught! ${state.caught}/${CONFIG.maxCaught} times.`
    );

    updateHUD();

    if (state.caught >= CONFIG.maxCaught) {
      finish(false, "Caught three times!");
    } else {
      reactionTime = 600;
    }

    return;
  }

  if (state.teacherState === "warning") {
    clearReaction();

    setStudent("gp-hide", "warning");
    showEffect("!");

    tone(300, 0.12, 0.08);
    feedback("Too risky! No point awarded.");

    reactionTime = 400;
    return;
  }

  // SAFE: all seven items award exactly one point.
  state.score++;
  state.collectedCount++;

  react(item);
  updateHUD();

  /* V2.6.1 Score Update */
  feedback(
    `${item.message} Score: ${state.score}/${CONFIG.targetScore}.`
  );
}


/* ============================================================
   19. RESULT STICKERS
   ============================================================ */

function clearSettlement() {
  resultPaused = false;

  el.particles.replaceChildren();
  el.particles.classList.remove("is-paused");

  el.resultIcon.className = "result-icon";
  el.resultIcon.style.boxShadow = "";

  stopResultMusic();
}

function dropSticker(name, delay, won) {
  const px = Math.random() < 0.5 ? 4 : 5;
  const element = sprite(name, "result-sticker", px);

  const rows = ART[name];

  const artWidth =
    Math.max(...rows.map(row => row.length)) * px;

  const artHeight = rows.length * px;

  const sceneWidth = el.scene.clientWidth;
  const sceneHeight = el.scene.clientHeight;

  const startX = random(
    8,
    Math.max(9, sceneWidth - artWidth - 8)
  );

  const endX = Math.max(
    8,
    Math.min(
      sceneWidth - artWidth - 8,
      startX + random(-24, 24)
    )
  );

  const ground =
    sceneHeight - artHeight - random(7, 30);

  element.style.setProperty("--x", `${startX}px`);

  element.style.setProperty(
    "--drift",
    `${endX - startX}px`
  );

  element.style.setProperty(
    "--distance",
    `${ground + 65}px`
  );

  element.style.setProperty(
    "--fall-time",
    `${random(won ? 2.2 : 3, won ? 3.1 : 4)}s`
  );

  element.style.setProperty(
    "--delay",
    `${delay}s`
  );

  element.style.setProperty(
    "--rotation",
    `${random(-30, 30)}deg`
  );

  el.particles.appendChild(element);
}

function settlement(won) {
  clearSettlement();

  const types = won
    ? ["star", "balloon", "heart", "smile", "bubble", "confetti"]
    : ["sadStar", "tear", "exclamation"];

  for (let i = 0; i < 28; i++) {
    dropSticker(
      choose(types),
      random(0, 0.85),
      won
    );
  }

  el.resultIcon.style.boxShadow = patternShadow(
    ART[won ? "star" : "tear"],
    ITEM_COLORS,
    5
  );

  el.resultIcon.className =
    `result-icon ${won ? "win" : "lose"}`;

  startResultMusic(won);
}

function pauseSettlement() {
  if (state.mode !== "finished" || resultPaused) return;

  resultPaused = true;

  el.particles.classList.add("is-paused");
  stopResultMusic();
  audioSuspend();
  updateButtons();
}

function resumeSettlement() {
  if (
    state.mode !== "finished" ||
    !resultPaused ||
    rulesOpen
  ) return;

  resultPaused = false;

  el.particles.classList.remove("is-paused");

  audioResume();
  startResultMusic(settlementWon);
  updateButtons();
}


/* ============================================================
   20. GAME TIMER
   ============================================================ */

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function tick() {
  if (!playing() || rulesOpen) return;

  const now = performance.now();
  const delta = Math.max(0, now - lastTick);

  lastTick = now;

  state.timeLeft = Math.max(
    0,
    state.timeLeft - delta
  );

  if (state.timeLeft <= 0) {
    /* V2.6.1 Score Update */
    const won =
      state.score >= CONFIG.targetScore &&
      state.caught < CONFIG.maxCaught;

    finish(
      won,
      won
        ? "You made it through class!"
        : `Class is over. You needed ${CONFIG.targetScore} points.`
    );

    return;
  }

  updateTeacher(delta);
  updateItems(delta);

  if (reactionTime > 0) {
    reactionTime -= delta;

    if (reactionTime <= 0) {
      clearReaction();
    }
  }

  updateHUD();
}

function startTimer() {
  stopTimer();

  lastTick = performance.now();

  timer = setInterval(tick, CONFIG.tickRate);
}


/* ============================================================
   21. START / PAUSE / RESUME
   ============================================================ */

function startGame() {
  if (playing()) return;

  clearReaction();
  teacherEmotion(null);
  clearSettlement();

  state.mode = "playing";
  state.teacherState = "safe";
  state.teacherTimeLeft = 3500;
  state.checkHadViolation = false;

  hideOverlay();

  el.game.classList.remove("game-paused");
  el.pauseButton.disabled = false;

  appearance();
  idle();

  nextItem();
  audioResume();

  startTimer();
  startBgm();
  startBlink();

  updateButtons();

  /* V2.6.1 Score Update */
  feedback(
    `Collect ${CONFIG.targetScore} points before class ends!`
  );

  tone(700, 0.14, 0.085);
}

function pauseGame() {
  if (!playing()) return;

  state.mode = "paused";

  stopTimer();
  stopBgm();
  stopBlink();

  el.game.classList.add("game-paused");

  el.collectible.hidden = true;
  el.collectible.disabled = true;

  audioSuspend();

  showOverlay(
    "PAUSED",
    "Your game is paused.",
    "CONTINUE"
  );

  feedback("Game paused.");
  updateButtons();
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

  audioResume();

  startTimer();
  startBgm();
  startBlink();

  updateButtons();

  /* V2.6.1 Score Update */
  feedback(
    `Keep going! Goal: ${CONFIG.targetScore} points.`
  );
}


/* ============================================================
   22. GAME END
   ============================================================ */

function finish(won, reason) {
  if (state.mode === "finished") return;

  state.mode = "finished";

  stopTimer();
  stopBgm();
  stopBlink();

  hideItem();

  reactionTime = 0;

  el.layer.replaceChildren();
  clearSpeech();

  teacherEmotion(null);
  stopVoices();

  setStudent(
    won ? "state-win" : "state-lose",
    won ? "win" : "lose"
  );

  el.game.classList.remove("game-paused");

  /* V2.6.1 Score Update */
  const summary =
    `${reason}\n` +
    `Final score: ${state.score} / ${CONFIG.targetScore}\n` +
    `Items collected: ${state.collectedCount}\n` +
    `Times caught: ${state.caught} / ${CONFIG.maxCaught}`;

  showOverlay(
    won ? "YOU WIN!" : "GAME OVER",
    summary,
    won ? "PLAY AGAIN" : "TRY AGAIN"
  );

  updateHUD();

  feedback(
    won
      ? "Congratulations! What a brilliant daydream!"
      : `Better luck next time! Reach ${CONFIG.targetScore} points.`
  );

  el.pauseButton.disabled = false;

  settlement(won);
  updateButtons();
}


/* ============================================================
   23. RESET
   ============================================================ */

function reset() {
  stopTimer();
  stopBgm();
  stopResultMusic();
  stopBlink();
  stopVoices();

  clearSettlement();

  state = initialState();
  reactionTime = 0;
  bgmStep = 0;

  el.layer.replaceChildren();
  clearSpeech();

  hideItem();

  el.effect.textContent = "";
  el.effect.classList.remove("pop");

  teacherEmotion(null);

  setStudent("state-safe", "normal");
  el.student.classList.add("normal");

  appearance();

  el.game.classList.remove("game-paused");

  el.pauseButton.disabled = true;

  updateHUD();
  hideOverlay();
  updateButtons();

  /* V2.6.1 Score Update */
  feedback(
    `Ready to play! Reach ${CONFIG.targetScore} points before class ends.`
  );
}


/* ============================================================
   24. RULES MODAL
   ============================================================ */

function rulesVisible(visible) {
  rulesOpen = visible;
  el.rulesOverlay.hidden = !visible;
}

function openRules() {
  if (rulesOpen) return;

  returnFocus = document.activeElement;
  rulesBefore = state.mode;
  settlementPausedForRules = false;

  if (playing()) {
    pauseGame();
  } else if (
    state.mode === "finished" &&
    !resultPaused
  ) {
    pauseSettlement();
    settlementPausedForRules = true;
  }

  rulesVisible(true);

  const initial = rulesBefore === "ready";

  el.rulesStartButton.hidden = !initial;
  el.rulesCloseButton.hidden = initial;

  (initial
    ? el.rulesStartButton
    : el.rulesCloseButton
  ).focus();
}

function closeRules() {
  if (!rulesOpen) return;

  const previous = rulesBefore;

  rulesVisible(false);
  rulesBefore = "ready";

  if (
    previous === "playing" &&
    state.mode === "paused"
  ) {
    resumeGame();
  }

  if (
    previous === "finished" &&
    settlementPausedForRules
  ) {
    resumeSettlement();
  }

  settlementPausedForRules = false;

  if (returnFocus?.focus) {
    returnFocus.focus();
  }

  returnFocus = null;
}

function startFromRules() {
  if (state.mode !== "ready") {
    closeRules();
    return;
  }

  rulesVisible(false);
  rulesBefore = "ready";
  returnFocus = null;

  // Start audio from the actual user interaction.
  audioResume();

  startGame();
}

function restart() {
  reset();

  rulesBefore = "ready";

  rulesVisible(true);

  el.rulesStartButton.hidden = false;
  el.rulesCloseButton.hidden = true;
  el.rulesStartButton.focus();
}


/* ============================================================
   25. BUTTON EVENTS
   ============================================================ */

el.rulesButton.addEventListener("click", openRules);

el.rulesStartButton.addEventListener(
  "click",
  startFromRules
);

el.rulesCloseButton.addEventListener(
  "click",
  closeRules
);

el.collectible.addEventListener("click", collect);

el.startButton.addEventListener("click", () => {
  if (rulesOpen) return;

  if (state.mode === "paused") {
    resumeGame();
  } else if (state.mode === "finished") {
    restart();
  } else {
    startGame();
  }
});

el.pauseButton.addEventListener("click", () => {
  if (rulesOpen) return;

  if (playing()) {
    pauseGame();
  } else if (state.mode === "paused") {
    resumeGame();
  } else if (state.mode === "finished") {
    resultPaused
      ? resumeSettlement()
      : pauseSettlement();
  }
});

el.resetButton.addEventListener("click", () => {
  if (!rulesOpen) restart();
});

el.soundButton.addEventListener("click", () => {
  if (rulesOpen) return;

  soundOn = !soundOn;

  if (!soundOn) {
    stopBgm();
    stopResultMusic();
    stopVoices();
    audioSuspend();
  } else {
    audioResume();

    if (playing()) {
      startBgm();
    } else if (
      state.mode === "finished" &&
      !resultPaused
    ) {
      startResultMusic(settlementWon);
    }
  }

  updateButtons();
});


/* ============================================================
   26. KEYBOARD AND PAGE VISIBILITY
   ============================================================ */

document.addEventListener("keydown", event => {
  if (rulesOpen) {
    if (
      event.key === "Escape" &&
      rulesBefore !== "ready"
    ) {
      event.preventDefault();
      closeRules();
    }

    if (event.key === "Tab") {
      event.preventDefault();

      (rulesBefore === "ready"
        ? el.rulesStartButton
        : el.rulesCloseButton
      ).focus();
    }

    return;
  }

  if (
    event.code === "Space" &&
    event.target === document.body
  ) {
    event.preventDefault();

    if (playing()) {
      pauseGame();
    } else if (state.mode === "paused") {
      resumeGame();
    }
  }
});

function autoPause() {
  if (playing()) pauseGame();

  if (
    state.mode === "finished" &&
    !resultPaused
  ) {
    pauseSettlement();
  }
}

document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden) autoPause();
  }
);

window.addEventListener("blur", autoPause);


/* ============================================================
   27. MOBILE VIEWPORT
   ============================================================ */

function fit() {
  const portrait =
    window.innerWidth < 768 &&
    window.innerHeight > window.innerWidth;

  el.portraitHint.hidden = !portrait;

  document.documentElement.style.setProperty(
    "--available-height",
    `${window.visualViewport?.height || window.innerHeight}px`
  );
}

window.addEventListener(
  "resize",
  fit,
  { passive: true }
);

window.visualViewport?.addEventListener(
  "resize",
  fit,
  { passive: true }
);


/* ============================================================
   28. INITIALISE GAME
   ============================================================ */

fit();
reset();

rulesBefore = "ready";

rulesVisible(true);

el.rulesStartButton.hidden = false;
el.rulesCloseButton.hidden = true;

el.rulesStartButton.focus();


/* ============================================================
   END OF CLASSROOM DAYDREAM V2.6.1
   ============================================================ */
