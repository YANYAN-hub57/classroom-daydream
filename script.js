
"use strict";

/* ============================================================
   CLASSROOM DAYDREAM V3.0
   COMPLETE SCRIPT.JS

   Vanilla JavaScript + Web Audio API
   No external resources

   Compatible with V3.0 index.html and style.css
   ============================================================ */


/* ============================================================
   01. V3.0 Update — CENTRAL CONFIGURATION
   ============================================================ */

const CONFIG = {
  tickRate: 50,

  difficulty: {
    easy: {
      duration: 90,
      maxCaught: 5,
      targetScore: 12,
      safe: [4000, 6000],
      warning: 1200,
      danger: [1500, 2000],
      fakeChance: 0.10,
      spawnInterval: 800,
      itemLifetime: 3500,
      maxItems: 8,
      trapWeight: 0,
      vision: false
    },

    normal: {
      duration: 60,
      maxCaught: 3,
      targetScore: 10,
      safe: [2500, 4000],
      warning: 1000,
      danger: [2000, 3000],
      fakeChance: 0.30,
      spawnInterval: 1200,
      itemLifetime: 2500,
      maxItems: 6,
      trapWeight: 3,
      vision: false
    },

    hard: {
      duration: 45,
      maxCaught: 2,
      targetScore: 10,
      safe: [1500, 2500],
      warning: 800,
      danger: [2500, 3500],
      fakeChance: 0.50,
      spawnInterval: 1800,
      itemLifetime: 1800,
      maxItems: 4,
      trapWeight: 9,
      vision: true
    }
  },

  itemWeights: {
    carrot: 25,
    riceball: 25,
    cookie: 15,
    cake: 12,
    doodle: 10,
    juice: 10,
    star: 3
  },

  specialWeights: {
    shield: 3,
    freeze: 2,
    clear: 2
  },

  points: {
    carrot: 1,
    riceball: 1,
    cookie: 2,
    cake: 2,
    doodle: 2,
    juice: 2,
    star: 3
  },

  phases: [
    {
      teacherFrequency: 1,
      lifetime: 1,
      spawn: 1,
      fakeBonus: 0
    },
    {
      teacherFrequency: 1.2,
      lifetime: 0.85,
      spawn: 0.90,
      fakeBonus: 0
    },
    {
      teacherFrequency: 1.4,
      lifetime: 0.70,
      spawn: 0.80,
      fakeBonus: 0.10
    }
  ],

  shieldDuration: 5000,
  freezeDuration: 3000,

  catchFreeze: [1000, 1500, 2000],
  dangerExtensions: [500, 1000, 1500],

  comboBonusLevel1: 5,
  comboBonusLevel2: 10,

  resultParticles: 28,

  storageKey: "classroom-daydream-v3"
};


/* ============================================================
   02. DOM REFERENCES
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
  goalLabel: $("goal-label"),

  comboBar: $("combo-bar"),
  comboValue: $("combo-value"),
  buffValue: $("buff-value"),
  phaseValue: $("phase-value"),

  status: $("teacher-status"),

  board: $("board"),
  itemsLayer: $("items-layer"),
  layer: $("interaction-layer"),
  speechLayer: $("speech-layer"),

  visionCone: $("vision-cone"),
  catchFlash: $("catch-flash"),
  shieldIcon: $("shield-icon"),

  particles: $("result-particles"),
  resultIcon: $("result-icon"),

  effect: $("effect"),
  feedback: $("feedback"),

  overlay: $("overlay"),
  overlayTitle: $("overlay-title"),
  overlayMessage: $("overlay-message"),

  startButton: $("start-button"),
  shareButton: $("share-button"),

  pauseButton: $("pause-button"),
  pauseIcon: $("pause-icon"),
  pauseLabel: $("pause-label"),

  soundButton: $("sound-button"),
  soundIcon: $("sound-icon"),
  soundLabel: $("sound-label"),

  resetButton: $("reset-button"),

  rulesButton: $("rules-button"),
  settingsButton: $("settings-button"),

  rulesOverlay: $("rules-overlay"),
  rulesStart: $("rules-start-button"),
  rulesClose: $("rules-close-button"),

  difficultyChoices: $("difficulty-choices"),
  studentChoices: $("student-choices"),
  teacherChoices: $("teacher-choices"),

  rulesGoal: $("rules-goal"),
  rulesTime: $("rules-time"),
  rulesCaught: $("rules-caught"),

  settingsOverlay: $("settings-overlay"),
  settingsClose: $("settings-close"),

  bgmVolume: $("bgm-volume"),
  sfxVolume: $("sfx-volume"),
  vibrationToggle: $("vibration-toggle"),
  effectsToggle: $("effects-toggle"),
  themeChoice: $("theme-choice"),

  achievementsList: $("achievements-list"),
  achievementToast: $("achievement-toast"),

  portraitHint: $("portrait-hint")
};

for (const [name, node] of Object.entries(el)) {
  if (!node) {
    throw new Error(`Missing required HTML element: ${name}`);
  }
}


/* ============================================================
   03. UTILITY HELPERS
   ============================================================ */

const random = (min, max) =>
  min + Math.random() * (max - min);

const clamp = (value, min, max) =>
  Math.min(max, Math.max(min, value));

const choose = array =>
  array[Math.floor(Math.random() * array.length)];

const now = () => performance.now();

function weightedChoice(entries) {
  const total = entries.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  if (total <= 0) return entries[0]?.id;

  let roll = Math.random() * total;

  for (const item of entries) {
    roll -= item.weight;

    if (roll < 0) {
      return item.id;
    }
  }

  return entries[entries.length - 1].id;
}

function safeStorageRead() {
  try {
    return JSON.parse(
      localStorage.getItem(CONFIG.storageKey) || "{}"
    );
  } catch (_) {
    return {};
  }
}

function safeStorageWrite(data) {
  try {
    localStorage.setItem(
      CONFIG.storageKey,
      JSON.stringify(data)
    );
  } catch (_) {
    // Storage can be unavailable in private browsing.
  }
}


/* ============================================================
   04. V3.0 Update — PERSISTENT PREFERENCES
   ============================================================ */

const DEFAULT_PREFERENCES = {
  difficulty: "normal",

  studentSkin: "classic",
  teacherSkin: "glasses",
  theme: "classic",

  bgmVolume: 35,
  sfxVolume: 75,

  vibration: true,
  effects: true,
  muted: false,

  records: {},
  achievements: []
};

const saved = safeStorageRead();

const preferences = {
  ...DEFAULT_PREFERENCES,
  ...saved,

  records: saved.records || {},
  achievements: Array.isArray(saved.achievements)
    ? saved.achievements
    : []
};

if (!CONFIG.difficulty[preferences.difficulty]) {
  preferences.difficulty = "normal";
}

function savePreferences() {
  safeStorageWrite(preferences);
}

function currentDifficulty() {
  return CONFIG.difficulty[preferences.difficulty];
}


/* ============================================================
   05. V3.0 Update — GAME STATE
   ============================================================ */

function makeInitialState() {
  const config = currentDifficulty();

  return {
    mode: "ready",

    duration: config.duration,
    timeLeft: config.duration * 1000,

    score: 0,
    caught: 0,

    collected: 0,
    starsCollected: 0,

    combo: 0,
    bestCombo: 0,

    phase: 1,

    teacherState: "safe",
    teacherTimeLeft: random(...config.safe),

    fakeLastTime: false,
    fakeTurnActive: false,

    hadViolation: false,

    items: new Map(),
    nextItemId: 1,
    spawnTimeLeft: config.spawnInterval,

    freezeLeft: 0,
    shieldLeft: 0,
    controlFreezeLeft: 0,

    reactionLeft: 0,

    isNewRecord: false,
    endedWithWin: false
  };
}

let state = makeInitialState();

let gameTimer = null;
let lastTickTime = 0;

let rulesOpen = true;
let settingsOpen = false;

let modalReturnMode = "ready";
let settingsReturnMode = "ready";

let previousFocus = null;

let settlementPaused = false;

let emotionTimeout = null;
let blinkInterval = null;

let toastTimeout = null;

const isPlaying = () => state.mode === "playing";


/* ============================================================
   06. V3.0 Update — PIXEL ART PALETTE
   ============================================================ */

const COLORS = {
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

const ITEM_PALETTE = {
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
   07. PIXEL BOX-SHADOW HELPERS
   ============================================================ */

function makeCanvas(width, height) {
  return Array.from(
    { length: height },
    () => Array(width).fill(null)
  );
}

function rectangle(canvas, x, y, width, height, color) {
  for (let yy = y; yy < y + height; yy++) {
    for (let xx = x; xx < x + width; xx++) {
      if (
        yy >= 0 &&
        yy < canvas.length &&
        xx >= 0 &&
        xx < canvas[yy].length
      ) {
        canvas[yy][xx] = color;
      }
    }
  }
}

function oval(canvas, cx, cy, rx, ry, color) {
  for (
    let y = Math.ceil(cy - ry);
    y <= cy + ry;
    y++
  ) {
    for (
      let x = Math.ceil(cx - rx);
      x <= cx + rx;
      x++
    ) {
      const distance =
        ((x - cx) / rx) ** 2 +
        ((y - cy) / ry) ** 2;

      if (distance <= 1) {
        rectangle(canvas, x, y, 1, 1, color);
      }
    }
  }
}

function canvasShadow(canvas, pixelSize = 4) {
  const shadows = [];

  canvas.forEach((row, y) => {
    row.forEach((color, x) => {
      if (!color) return;

      shadows.push(
        `${x * pixelSize}px ` +
        `${y * pixelSize}px 0 0 ${color}`
      );
    });
  });

  return shadows.join(",");
}

function patternShadow(
  rows,
  palette = ITEM_PALETTE,
  pixelSize = 4
) {
  const shadows = [];

  rows.forEach((row, y) => {
    [...row].forEach((symbol, x) => {
      const color = palette[symbol];

      if (!color) return;

      shadows.push(
        `${x * pixelSize}px ` +
        `${y * pixelSize}px 0 0 ${color}`
      );
    });
  });

  return shadows.join(",");
}


/* ============================================================
   08. V3.0 Update — CHARACTER SKINS
   ============================================================ */

const SKINS = {
  student: {
    classic: {
      left: "#92918b",
      right: "#e5aa70",
      center: "#fffaf0"
    },

    duo: {
      left: "#8a8b82",
      right: "#aa876f",
      center: "#fffaf0"
    },

    cream: {
      left: "#f2dfbd",
      right: "#f2dfbd",
      center: "#fffaf0"
    }
  },

  teacher: {
    glasses: {
      left: "#92918b",
      right: "#9a7d6c"
    },

    beret: {
      left: "#888780",
      right: "#a87e63"
    }
  }
};

function effectiveTeacherSkin() {
  if (preferences.difficulty === "hard") {
    return "beret";
  }

  return preferences.teacherSkin;
}


/* ============================================================
   09. GUINEA PIG PIXEL SPRITES
   ============================================================ */

function drawPig(teacher = false, face = "normal") {
  const canvas = makeCanvas(36, 38);

  const skin = teacher
    ? SKINS.teacher[effectiveTeacherSkin()]
    : SKINS.student[preferences.studentSkin];

  const back =
    teacher &&
    ["back", "warning", "fake"].includes(face);

  // Body
  oval(canvas, 18, 28, 15, 8, COLORS.K);
  oval(
    canvas,
    18,
    27,
    14,
    7,
    teacher ? COLORS.G : COLORS.H
  );

  // Ears
  oval(canvas, 8, 11, 6, 7, COLORS.K);
  oval(canvas, 28, 11, 6, 7, COLORS.K);

  oval(canvas, 8, 11, 4, 5, COLORS.P);
  oval(canvas, 28, 11, 4, 5, COLORS.P);

  // Round face
  oval(canvas, 18, 21, 17, 13, COLORS.K);
  oval(canvas, 18, 20, 16, 12, COLORS.W);

  // Fur patches
  oval(canvas, 9, 18, 8, 10, skin.left);
  oval(canvas, 28, 18, 7, 10, skin.right);
  oval(canvas, 17, 22, 10, 9, COLORS.W);

  if (back) {
    oval(canvas, 18, 21, 14, 11, skin.right);
    oval(canvas, 10, 20, 7, 8, skin.left);

    rectangle(canvas, 12, 29, 10, 2, COLORS.A);

  } else {
    // Cheeks
    rectangle(canvas, 6, 24, 5, 3, COLORS.P);
    rectangle(canvas, 25, 24, 5, 3, COLORS.P);

    const happy = [
      "happy",
      "cookie",
      "cake",
      "win",
      "star",
      "excited"
    ].includes(face);

    const sad = [
      "sad",
      "lose",
      "caught"
    ].includes(face);

    const surprised = [
      "warning",
      "surprised",
      "caught",
      "angry"
    ].includes(face);

    if (happy) {
      rectangle(canvas, 11, 20, 5, 1, COLORS.E);
      rectangle(canvas, 21, 20, 5, 1, COLORS.E);

    } else if (sad) {
      rectangle(canvas, 11, 22, 5, 2, COLORS.E);
      rectangle(canvas, 21, 22, 5, 2, COLORS.E);

    } else if (surprised) {
      rectangle(canvas, 12, 18, 3, 6, COLORS.E);
      rectangle(canvas, 22, 18, 3, 6, COLORS.E);

    } else if (face === "blink") {
      rectangle(canvas, 11, 21, 5, 1, COLORS.E);
      rectangle(canvas, 21, 21, 5, 1, COLORS.E);

    } else {
      rectangle(canvas, 12, 19, 3, 4, COLORS.E);
      rectangle(canvas, 22, 19, 3, 4, COLORS.E);

      rectangle(canvas, 12, 19, 1, 1, COLORS.W);
      rectangle(canvas, 22, 19, 1, 1, COLORS.W);
    }

    // Nose
    rectangle(canvas, 17, 25, 3, 2, COLORS.B);
    rectangle(canvas, 18, 27, 1, 2, COLORS.E);

    // Mouth
    if (
      surprised ||
      face === "juice" ||
      face === "angry"
    ) {
      rectangle(
        canvas,
        17,
        29,
        3,
        4,
        face === "angry" ? COLORS.R : COLORS.E
      );

    } else if (sad) {
      rectangle(canvas, 16, 31, 5, 1, COLORS.E);

    } else {
      rectangle(canvas, 15, 29, 3, 1, COLORS.E);
      rectangle(canvas, 19, 29, 3, 1, COLORS.E);

      rectangle(canvas, 16, 30, 1, 1, COLORS.E);
      rectangle(canvas, 20, 30, 1, 1, COLORS.E);
    }

    // Eating
    if (["carrot", "rice"].includes(face)) {
      rectangle(canvas, 5, 23, 7, 5, COLORS.P);
      rectangle(canvas, 24, 23, 7, 5, COLORS.P);
    }

    if (face === "cake") {
      rectangle(canvas, 24, 28, 4, 2, COLORS.H);
    }

    // Tears / sweat
    if (
      ["danger", "caught", "lose"].includes(face)
    ) {
      rectangle(canvas, 27, 19, 2, 6, COLORS.T);
    }

    if (face === "caught") {
      rectangle(canvas, 8, 23, 2, 5, COLORS.T);
    }

    if (teacher) {
      // Glasses
      rectangle(canvas, 9, 18, 7, 1, COLORS.E);
      rectangle(canvas, 21, 18, 7, 1, COLORS.E);

      rectangle(canvas, 9, 18, 1, 7, COLORS.E);
      rectangle(canvas, 15, 18, 1, 7, COLORS.E);
      rectangle(canvas, 21, 18, 1, 7, COLORS.E);
      rectangle(canvas, 27, 18, 1, 7, COLORS.E);

      rectangle(canvas, 16, 19, 5, 1, COLORS.E);

      if (face === "angry") {
        rectangle(canvas, 10, 15, 5, 2, COLORS.E);
        rectangle(canvas, 22, 15, 5, 2, COLORS.E);
      }
    }
  }

  // Hair tuft
  rectangle(canvas, 16, 6, 1, 2, COLORS.K);
  rectangle(canvas, 18, 5, 1, 3, COLORS.K);
  rectangle(canvas, 20, 6, 1, 2, COLORS.K);

  // Feet
  rectangle(canvas, 10, 33, 5, 2, COLORS.H);
  rectangle(canvas, 22, 33, 5, 2, COLORS.H);

  if (teacher) {
    rectangle(canvas, 12, 35, 12, 2, COLORS.G);

    // Pointer
    rectangle(canvas, 32, 23, 1, 13, COLORS.K);
    rectangle(canvas, 32, 22, 1, 1, COLORS.Y);

    // Beret
    if (effectiveTeacherSkin() === "beret") {
      rectangle(canvas, 8, 5, 20, 3, COLORS.K);
      rectangle(canvas, 10, 2, 16, 4, COLORS.B);
      rectangle(canvas, 16, 1, 4, 2, COLORS.K);
    }
  }

  return canvasShadow(canvas);
}

const characterCache = new Map();

function setFace(character, expression) {
  const skinName = character === "teacher"
    ? effectiveTeacherSkin()
    : preferences.studentSkin;

  const key =
    `${character}-${skinName}-${expression}`;

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

function refreshCharacters() {
  characterCache.clear();

  updateTeacherAppearance();
  updateStudentIdle();
}


/* ============================================================
   10. NORMAL PIXEL ART
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
  ]
};


/* ============================================================
   11. V3.0 Update — SPECIAL PIXEL ART
   ============================================================ */

Object.assign(ART, {
  shield: [
    "...TTTTTT...",
    "..TKKKKKT..",
    ".TKTTTTTTKT.",
    ".TKTTWTTTKT.",
    ".TKTTWTTTKT.",
    "..KTTTTTK..",
    "...KTTTK...",
    "....KTK....",
    ".....K....."
  ],

  freeze: [
    ".....TT.....",
    "..T..TT..T..",
    "...TTTTTT...",
    "TTTTTWWTTTTT",
    "...TTTTTT...",
    "..T..TT..T..",
    ".....TT....."
  ],

  clear: [
    ".....YY.....",
    "...YYYYYY...",
    ".YYYGYYGYYY.",
    "YYYYYYYYYYYY",
    ".YYYGYYGYYY.",
    "...YYYYYY...",
    ".....YY....."
  ],

  trap: [
    "...KKKKKK...",
    "..KPPPPPPK..",
    ".KPPPPPPPPK.",
    "KPPPRRRPPPPK",
    "KPPPRKRPPPPK",
    "KPPPPRPPPPPK",
    ".KPPPPPPPPK.",
    "..KKKKKKKK.."
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

  greyStar: [
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
    "..KK.."
  ],

  cloud: [
    "...XXXX...",
    ".XXXXXXXX.",
    "XXXXXXXXXX",
    ".XXXXXXXX."
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
});

function sprite(name, className = "pixel-item", size = 4) {
  const element = document.createElement("span");

  element.className = className;

  Object.assign(element.style, {
    position: "absolute",
    display: "block",
    width: `${size}px`,
    height: `${size}px`,
    pointerEvents: "none",
    background: "transparent"
  });

  element.style.boxShadow =
    patternShadow(ART[name], ITEM_PALETTE, size);

  return element;
}


/* ============================================================
   12. ITEM DATA
   ============================================================ */

const ITEM_INFO = {
  carrot: {
    name: "Carrot",
    animation: "gp-eat-carrot",
    face: "carrot",
    duration: 1600,
    message: "Crunchy carrot!"
  },

  riceball: {
    name: "Rice Ball",
    animation: "gp-eat-rice",
    face: "rice",
    duration: 1600,
    message: "A big bite!"
  },

  cookie: {
    name: "Cookie",
    animation: "gp-eat-cookie",
    face: "cookie",
    duration: 1600,
    message: "Crunch, crunch!"
  },

  cake: {
    name: "Cake",
    animation: "gp-eat-cake",
    face: "cake",
    duration: 1600,
    message: "Yummy, yummy!"
  },

  doodle: {
    name: "Doodle",
    animation: "gp-draw",
    face: "happy",
    duration: 1800,
    message: "A pixel flower!"
  },

  juice: {
    name: "Orange Juice",
    animation: "gp-drink-juice",
    face: "juice",
    duration: 1600,
    message: "So refreshing!"
  },

  star: {
    name: "Star",
    animation: "gp-star",
    face: "win",
    duration: 1500,
    message: "A shiny star!"
  }
};

const SPECIAL_INFO = {
  shield: {
    name: "Shield",
    aura: "#82dce5"
  },

  freeze: {
    name: "Freeze",
    aura: "#a2cef5"
  },

  clear: {
    name: "Clear",
    aura: "#ffe176"
  },

  trap: {
    name: "Trap",
    aura: "#f18b94"
  }
};


/* ============================================================
   13. V3.0 Update — WEB AUDIO ENGINE
   ============================================================ */

let audioContext = null;
let masterGain = null;

const activeVoices = new Set();

function audioInit() {
  try {
    if (!audioContext) {
      const AudioClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioClass) return null;

      audioContext = new AudioClass();

      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.65;
      masterGain.connect(audioContext.destination);
    }

    return audioContext;

  } catch (error) {
    console.warn("Audio unavailable:", error);
    return null;
  }
}

function audioResume() {
  if (preferences.muted) return;

  const context = audioInit();

  if (
    context &&
    context.state === "suspended"
  ) {
    context.resume().catch(() => {});
  }
}

function audioSuspend() {
  if (
    audioContext &&
    audioContext.state === "running"
  ) {
    audioContext.suspend().catch(() => {});
  }
}

function tone(
  frequency,
  duration = 0.12,
  volume = 0.04,
  waveform = "square",
  delay = 0,
  channel = "sfx"
) {
  if (preferences.muted) return;

  const context = audioInit();
  if (!context || !masterGain) return;

  const userVolume =
    channel === "bgm"
      ? preferences.bgmVolume / 100
      : preferences.sfxVolume / 100;

  if (userVolume <= 0) return;

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    const startTime =
      context.currentTime + delay;

    oscillator.type = waveform;

    oscillator.frequency.setValueAtTime(
      frequency,
      startTime
    );

    gain.gain.setValueAtTime(
      0.0001,
      startTime
    );

    gain.gain.linearRampToValueAtTime(
      Math.max(0.0002, volume * userVolume),
      startTime + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + duration
    );

    oscillator.connect(gain);
    gain.connect(masterGain);

    activeVoices.add(oscillator);

    oscillator.onended = () => {
      activeVoices.delete(oscillator);

      try {
        oscillator.disconnect();
        gain.disconnect();
      } catch (_) {}
    };

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);

  } catch (error) {
    console.warn("Sound skipped:", error);
  }
}

function noise(
  duration = 0.08,
  volume = 0.025,
  channel = "sfx"
) {
  if (preferences.muted) return;

  const context = audioInit();
  if (!context || !masterGain) return;

  const userVolume =
    channel === "bgm"
      ? preferences.bgmVolume / 100
      : preferences.sfxVolume / 100;

  if (userVolume <= 0) return;

  try {
    const length = Math.floor(
      context.sampleRate * duration
    );

    const buffer = context.createBuffer(
      1,
      Math.max(length, 1),
      context.sampleRate
    );

    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] =
        (Math.random() * 2 - 1) *
        (1 - i / data.length);
    }

    const source = context.createBufferSource();
    const gain = context.createGain();

    source.buffer = buffer;

    gain.gain.value =
      volume * userVolume;

    source.connect(gain);
    gain.connect(masterGain);

    activeVoices.add(source);

    source.onended = () => {
      activeVoices.delete(source);

      try {
        source.disconnect();
        gain.disconnect();
      } catch (_) {}
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
   14. V3.0 Update — DYNAMIC BGM
   ============================================================ */

const BGM_MELODY = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 698.46, 880.00, 698.46,
  659.25, 783.99, 1046.50, 783.99,
  587.33, 698.46, 783.99, 523.25
];

let bgmTimer = null;
let bgmStep = 0;

function stopBgm() {
  if (bgmTimer !== null) {
    clearTimeout(bgmTimer);
    bgmTimer = null;
  }
}

function bgmTick() {
  if (
    !isPlaying() ||
    rulesOpen ||
    settingsOpen ||
    preferences.muted
  ) {
    return;
  }

  const phase = state.phase - 1;

  const speed = [330, 235, 155][phase];
  const pitch = [1, 1.12, 1.25][phase];

  tone(
    BGM_MELODY[bgmStep % BGM_MELODY.length] * pitch,
    0.13,
    0.035,
    "square",
    0,
    "bgm"
  );

  if (
    bgmStep %
    (phase === 0 ? 4 : 2) === 0
  ) {
    tone(
      130.81,
      0.14,
      0.022,
      "triangle",
      0,
      "bgm"
    );
  }

  if (
    phase >= 1 &&
    bgmStep % 2 === 1
  ) {
    tone(
      190,
      0.035,
      0.014,
      "square",
      0,
      "bgm"
    );
  }

  if (
    phase === 2 &&
    bgmStep % 4 === 3
  ) {
    tone(
      1174.66,
      0.05,
      0.018,
      "square",
      0,
      "bgm"
    );
  }

  bgmStep++;

  bgmTimer = setTimeout(
    bgmTick,
    speed
  );
}

function startBgm() {
  stopBgm();

  if (
    !isPlaying() ||
    rulesOpen ||
    settingsOpen ||
    preferences.muted
  ) {
    return;
  }

  audioResume();
  bgmTick();
}


/* ============================================================
   15. SETTLEMENT MUSIC
   ============================================================ */

const WIN_TUNE = [
  [523.25, 0.16],
  [659.25, 0.16],
  [783.99, 0.16],
  [1046.50, 0.34],
  [783.99, 0.16],
  [880.00, 0.16],
  [1046.50, 0.40],
  [1318.51, 0.50]
];

const LOSE_TUNE = [
  [392.00, 0.35],
  [349.23, 0.38],
  [329.63, 0.40],
  [293.66, 0.44],
  [261.63, 0.65]
];

let resultMusicTimer = null;
let resultMusicStep = 0;

function stopResultMusic() {
  if (resultMusicTimer !== null) {
    clearTimeout(resultMusicTimer);
    resultMusicTimer = null;
  }
}

function resultMusicTick() {
  if (
    state.mode !== "finished" ||
    settlementPaused ||
    rulesOpen ||
    settingsOpen ||
    preferences.muted
  ) {
    return;
  }

  const melody =
    state.endedWithWin ? WIN_TUNE : LOSE_TUNE;

  const [frequency, duration] =
    melody[resultMusicStep % melody.length];

  tone(
    frequency,
    duration,
    state.endedWithWin ? 0.08 : 0.06,
    state.endedWithWin ? "square" : "triangle",
    0,
    "bgm"
  );

  const last =
    resultMusicStep % melody.length ===
    melody.length - 1;

  resultMusicStep++;

  resultMusicTimer = setTimeout(
    resultMusicTick,
    duration * 1000 + (last ? 650 : 60)
  );
}

function startResultMusic() {
  stopResultMusic();

  if (
    preferences.muted ||
    settlementPaused ||
    rulesOpen ||
    settingsOpen
  ) {
    return;
  }

  audioResume();
  resultMusicTick();
}


/* ============================================================
   16. V3.0 Update — ITEM SOUNDS
   ============================================================ */

function itemSound(id) {
  if (preferences.muted) return;

  switch (id) {
    case "carrot":
      noise(0.055, 0.038);
      tone(570, 0.07, 0.06);
      break;

    case "riceball":
      noise(0.10, 0.04);
      tone(390, 0.09, 0.055);
      break;

    case "cookie":
      noise(0.11, 0.065);
      tone(290, 0.08, 0.045);

      tone(320, 0.07, 0.045, "square", 0.22);
      break;

    case "cake":
      [659, 784, 659, 880].forEach(
        (frequency, i) => {
          tone(
            frequency,
            0.15,
            0.06,
            "triangle",
            i * 0.16
          );
        }
      );
      break;

    case "doodle":
      for (let i = 0; i < 9; i++) {
        // Timed pencil scratch approximation.
        tone(
          180 + i * 15,
          0.06,
          0.018,
          "sawtooth",
          i * 0.15
        );
      }
      break;

    case "juice":
      [300, 260, 220].forEach(
        (frequency, i) => {
          tone(
            frequency,
            0.13,
            0.06,
            "sine",
            i * 0.24
          );
        }
      );
      break;

    case "star":
      [1047, 1568, 2093].forEach(
        (frequency, i) => {
          tone(
            frequency,
            0.38,
            0.06,
            "sine",
            i * 0.08
          );
        }
      );
      break;

    case "shield":
      tone(523, 0.12, 0.08);
      tone(784, 0.22, 0.08, "square", 0.12);
      break;

    case "freeze":
      tone(880, 0.35, 0.06, "sine");
      tone(440, 0.35, 0.05, "sine", 0.10);
      break;

    case "clear":
      [523, 659, 784, 1047].forEach(
        (frequency, i) => {
          tone(
            frequency,
            0.12,
            0.065,
            "square",
            i * 0.08
          );
        }
      );
      break;

    case "trap":
      tone(180, 0.28, 0.10, "sawtooth");
      break;
  }
}

function vibration(pattern) {
  if (!preferences.vibration) return;

  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch (_) {}
}


/* ============================================================
   17. HUD AND FEEDBACK
   ============================================================ */

function updateHud() {
  const difficulty = currentDifficulty();

  const seconds =
    Math.ceil(state.timeLeft / 1000);

  el.time.textContent = String(seconds);
  el.score.textContent = String(state.score);

  el.caught.textContent =
    `${state.caught} / ${difficulty.maxCaught}`;

  el.goalLabel.textContent =
    `GOAL: ${difficulty.targetScore}`;

  el.comboValue.textContent =
    state.combo >= 2
      ? `COMBO ×${state.combo}`
      : "COMBO ×0";

  el.phaseValue.textContent =
    `PHASE ${state.phase}`;

  const buffs = [];

  if (state.shieldLeft > 0) {
    buffs.push(
      `SHIELD ${Math.ceil(state.shieldLeft / 1000)}s`
    );
  }

  if (state.freezeLeft > 0) {
    buffs.push(
      `FREEZE ${Math.ceil(state.freezeLeft / 1000)}s`
    );
  }

  if (state.controlFreezeLeft > 0) {
    buffs.push("STUNNED");
  }

  el.buffValue.textContent =
    buffs.join(" · ");

  el.shieldIcon.hidden =
    state.shieldLeft <= 0;

  el.shieldIcon.classList.toggle(
    "expiring",
    state.shieldLeft > 0 &&
    state.shieldLeft <= 1000
  );

  const timeCritical =
    seconds <= 10 &&
    state.mode === "playing";

  const caughtCritical =
    state.caught === difficulty.maxCaught - 1 &&
    state.mode === "playing";

  el.time.parentElement.classList.toggle(
    "critical",
    timeCritical
  );

  el.caught.parentElement.classList.toggle(
    "critical",
    caughtCritical
  );

  el.score.style.color =
    state.score >= difficulty.targetScore
      ? "#3e966a"
      : "";
}

function feedback(message) {
  el.feedback.textContent = message;
}

function showEffect(text) {
  el.effect.textContent = text;

  el.effect.classList.remove("pop");
  void el.effect.offsetWidth;
  el.effect.classList.add("pop");
}

function floatingPoints(points, x, y) {
  const element = document.createElement("span");

  element.className = "point-float";
  element.textContent = `+${points}`;

  element.style.left = `${x}px`;
  element.style.top = `${y}px`;

  element.style.color =
    points >= 3 ? "#ffdc68" :
    points >= 2 ? "#8de5ac" :
    "#fff7d5";

  el.scene.appendChild(element);

  element.addEventListener(
    "animationend",
    () => element.remove(),
    { once: true }
  );
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

function updateControls() {
  const paused =
    state.mode === "paused" ||
    settlementPaused;

  el.pauseIcon.className =
    "control-icon " +
    (paused ? "icon-play" : "icon-pause");

  el.pauseLabel.textContent =
    paused ? "RESUME" : "PAUSE";

  el.soundIcon.className =
    "control-icon " +
    (preferences.muted
      ? "icon-bell-muted"
      : "icon-bell");

  el.soundLabel.textContent =
    preferences.muted
      ? "SOUND OFF"
      : "SOUND ON";

  el.soundButton.setAttribute(
    "aria-pressed",
    String(!preferences.muted)
  );
}


/* ============================================================
   18. V3.0 Update — DIFFICULTY SELECTION
   ============================================================ */

function updateRulesText() {
  const config = currentDifficulty();

  el.rulesGoal.textContent =
    `${config.targetScore} points`;

  el.rulesTime.textContent =
    `${config.duration} seconds`;

  el.rulesCaught.textContent =
    `fewer than ${config.maxCaught} times`;

  updateHud();
}

function updateChoiceButtons() {
  for (
    const button of
    el.difficultyChoices.querySelectorAll("button")
  ) {
    button.classList.toggle(
      "is-selected",
      button.dataset.difficulty ===
      preferences.difficulty
    );
  }

  for (
    const button of
    el.studentChoices.querySelectorAll("button")
  ) {
    button.classList.toggle(
      "is-selected",
      button.dataset.student ===
      preferences.studentSkin
    );
  }

  for (
    const button of
    el.teacherChoices.querySelectorAll("button")
  ) {
    button.classList.toggle(
      "is-selected",
      button.dataset.teacher ===
      effectiveTeacherSkin()
    );
  }
}

function selectDifficulty(value) {
  if (
    state.mode !== "ready" ||
    !CONFIG.difficulty[value]
  ) {
    return;
  }

  preferences.difficulty = value;

  savePreferences();

  state = makeInitialState();

  el.game.classList.toggle(
    "hard-mode",
    value === "hard"
  );

  updateChoiceButtons();
  updateRulesText();
  refreshCharacters();
}

el.difficultyChoices.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest("[data-difficulty]");

    if (button) {
      selectDifficulty(button.dataset.difficulty);
    }
  }
);

el.studentChoices.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest("[data-student]");

    if (!button || state.mode !== "ready") {
      return;
    }

    if (!SKINS.student[button.dataset.student]) {
      return;
    }

    preferences.studentSkin = button.dataset.student;

    savePreferences();
    updateChoiceButtons();
    refreshCharacters();
  }
);

el.teacherChoices.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest("[data-teacher]");

    if (!button || state.mode !== "ready") {
      return;
    }

    if (!SKINS.teacher[button.dataset.teacher]) {
      return;
    }

    preferences.teacherSkin = button.dataset.teacher;

    savePreferences();
    updateChoiceButtons();
    refreshCharacters();
  }
);


/* ============================================================
   19. STUDENT ANIMATION STATES
   ============================================================ */

const STUDENT_CLASSES = [
  "state-safe",
  "state-warning",
  "state-danger",
  "state-win",
  "state-lose",

  "normal",
  "blink",
  "scared",
  "happy",

  "gp-hide",
  "gp-eat-carrot",
  "gp-eat-cookie",
  "gp-draw",
  "gp-star",
  "gp-eat-cake",
  "gp-eat-rice",
  "gp-drink-juice"
];

function setStudentState(className, expression) {
  el.student.classList.remove(
    ...STUDENT_CLASSES
  );

  el.student.classList.add(className);

  setFace("student", expression);
}

function updateStudentIdle() {
  if (state.mode === "finished") return;

  if (state.teacherState === "safe") {
    const face =
      state.combo >= 10 ? "excited" :
      state.combo >= 5 ? "happy" :
      "normal";

    setStudentState(
      "state-safe",
      face
    );

    if (face === "normal") {
      el.student.classList.add("normal");
    }

  } else if (state.teacherState === "warning") {
    setStudentState(
      "state-warning",
      "warning"
    );

  } else {
    setStudentState(
      "state-danger",
      "danger"
    );
  }
}

function stopBlink() {
  if (blinkInterval !== null) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
}

function startBlink() {
  stopBlink();

  blinkInterval = setInterval(() => {
    if (
      !isPlaying() ||
      rulesOpen ||
      settingsOpen ||
      state.reactionLeft > 0 ||
      state.teacherState !== "safe"
    ) {
      return;
    }

    setFace("student", "blink");

    // Game tick restores the idle expression.
    state.reactionLeft = 140;

  }, 3500);
}


/* ============================================================
   20. TEACHER EMOTION
   ============================================================ */

function teacherEmotion(type) {
  el.teacher.classList.remove(
    "teacher-happy",
    "teacher-angry"
  );

  el.teacherEmote.className =
    "teacher-emote";

  el.teacherEmote.style.boxShadow = "";

  if (!type) return;

  el.teacher.classList.add(
    type === "happy"
      ? "teacher-happy"
      : "teacher-angry"
  );

  setFace("teacher", type);

  el.teacherEmote.style.boxShadow =
    patternShadow(
      ART[type === "happy" ? "thumbs" : "anger"]
    );

  el.teacherEmote.classList.add(type);
}

function updateTeacherAppearance() {
  el.teacher.classList.remove(
    "facing-away",
    "warning",
    "watching"
  );

  const teacherState = state.teacherState;

  if (teacherState === "safe") {
    el.teacher.classList.add("facing-away");

    setFace("teacher", "back");

    el.status.className =
      "teacher-status safe";

    el.status.textContent =
      "SAFE — The teacher faces the board. Collect items!";

  } else if (teacherState === "warning") {
    el.teacher.classList.add("warning");

    setFace(
      "teacher",
      state.fakeTurnActive ? "fake" : "warning"
    );

    el.status.className =
      "teacher-status warning";

    el.status.textContent =
      "WARNING — The teacher is about to turn!";

  } else {
    el.teacher.classList.add("watching");

    setFace(
      "teacher",
      state.hadViolation
        ? "angry"
        : "normal"
    );

    el.status.className =
      "teacher-status danger";

    el.status.textContent =
      "DANGER — The teacher is watching!";
  }

  const config = currentDifficulty();

  el.visionCone.hidden = !(
    config.vision &&
    teacherState === "watching"
  );

  el.game.dataset.teacherState =
    teacherState;
}


/* ============================================================
   21. V3.0 Update — DYNAMIC PHASE
   ============================================================ */

function phaseMultiplier() {
  return CONFIG.phases[state.phase - 1];
}

function updatePhase() {
  const progress =
    state.timeLeft /
    (state.duration * 1000);

  const nextPhase =
    progress > 2 / 3 ? 1 :
    progress > 1 / 3 ? 2 : 3;

  if (nextPhase === state.phase) return;

  state.phase = nextPhase;

  el.game.dataset.phase =
    String(nextPhase);

  el.comboBar.dataset.phase =
    String(nextPhase);

  updateBlackboard();

  tone(
    nextPhase === 3 ? 1047 : 784,
    0.16,
    0.055
  );

  feedback(
    `PHASE ${nextPhase} — The classroom is getting busier!`
  );
}

function updateBlackboard() {
  const main =
    el.board.querySelector(".board-content b");

  const note =
    el.board.querySelector(".board-content small");

  if (state.phase === 1) {
    main.textContent = "2 + 2 = ?";
    note.textContent = "STAY FOCUSED!";

  } else if (state.phase === 2) {
    main.textContent = "✦  ☆  ✦";
    note.textContent = "KEEP STUDYING!";

  } else {
    main.textContent = "CLASS ENDS SOON";
    note.textContent = "FINAL MINUTES!";
  }
}


/* ============================================================
   22. V3.0 Update — TEACHER STATE MACHINE
   ============================================================ */

function newStateDuration(kind, shortSafe = false) {
  const config = currentDifficulty();
  const phase = phaseMultiplier();

  if (kind === "warning") {
    return config.warning;
  }

  const range = config[kind];

  let duration = random(
    range[0],
    range[1]
  );

  if (kind === "safe") {
    duration /= phase.teacherFrequency;

    if (shortSafe) {
      duration *= 0.72;
    }
  }

  return duration;
}

function advanceTeacherState() {
  if (state.teacherState === "safe") {
    state.teacherState = "warning";

    state.teacherTimeLeft =
      newStateDuration("warning");

    state.fakeTurnActive = false;

    clearReaction();

    updateStudentIdle();

    tone(350, 0.13, 0.08);

    feedback(
      "The teacher is turning around!"
    );

  } else if (state.teacherState === "warning") {
    const config = currentDifficulty();

    const fakeChance = clamp(
      config.fakeChance +
      phaseMultiplier().fakeBonus,
      0,
      1
    );

    const fake =
      !state.fakeLastTime &&
      Math.random() < fakeChance;

    if (fake) {
      state.teacherState = "safe";

      state.teacherTimeLeft =
        newStateDuration("safe", true);

      state.fakeLastTime = true;
      state.fakeTurnActive = true;

      tone(650, 0.08, 0.06);
      tone(480, 0.13, 0.05, "triangle", 0.10);

      feedback(
        "Fake turn! The teacher faces the board again."
      );

    } else {
      state.teacherState = "watching";

      state.teacherTimeLeft =
        newStateDuration("danger");

      state.fakeLastTime = false;
      state.fakeTurnActive = false;

      state.hadViolation = false;

      teacherEmotion("happy");

      tone(850, 0.16, 0.08);

      feedback(
        "The teacher is watching. Be careful!"
      );
    }

    updateStudentIdle();

  } else {
    state.teacherState = "safe";

    state.teacherTimeLeft =
      newStateDuration("safe");

    state.hadViolation = false;
    state.fakeTurnActive = false;

    teacherEmotion(null);

    clearReaction();
    updateStudentIdle();

    feedback(
      "Inspection finished! Collect items again."
    );
  }

  updateTeacherAppearance();
}

function updateTeacher(delta) {
  if (state.freezeLeft > 0) return;

  state.teacherTimeLeft -= delta;

  while (state.teacherTimeLeft <= 0) {
    const overflow =
      -state.teacherTimeLeft;

    advanceTeacherState();

    state.teacherTimeLeft -= overflow;
  }
}


/* ============================================================
   23. V3.0 Update — HARD MODE VISION CHECK
   ============================================================ */

function inTeacherVision(x, y) {
  if (
    state.teacherState !== "watching"
  ) {
    return false;
  }

  const config = currentDifficulty();

  if (!config.vision) {
    return true;
  }

  const width = el.scene.clientWidth;
  const height = el.scene.clientHeight;

  // Approximate the teacher's screen-space eye origin.
  const originX = width * 0.80;
  const originY = height * 0.43;

  const dx = x - originX;
  const dy = y - originY;

  const distance =
    Math.hypot(dx, dy);

  if (distance < 1) return true;

  // The cone points diagonally down-left.
  const directionX = -Math.SQRT1_2;
  const directionY = Math.SQRT1_2;

  const dot =
    (dx * directionX + dy * directionY) /
    distance;

  return dot >= Math.cos(Math.PI / 4);
}


/* ============================================================
   24. V3.0 Update — MULTI-ITEM SPAWNING
   ============================================================ */

function selectItemType() {
  const difficulty = currentDifficulty();

  const normalEntries = Object.entries(
    CONFIG.itemWeights
  ).map(([id, weight]) => ({
    id,
    weight
  }));

  const specialEntries = Object.entries(
    CONFIG.specialWeights
  ).map(([id, weight]) => ({
    id,
    weight
  }));

  if (difficulty.trapWeight > 0) {
    specialEntries.push({
      id: "trap",
      weight: difficulty.trapWeight
    });
  }

  const hasSpecial = [...state.items.values()]
    .some(item => item.special);

  const entries = hasSpecial
    ? normalEntries
    : [...normalEntries, ...specialEntries];

  return weightedChoice(entries);
}

function effectiveSpawnInterval() {
  return (
    currentDifficulty().spawnInterval *
    phaseMultiplier().spawn
  );
}

function effectiveItemLifetime() {
  return (
    currentDifficulty().itemLifetime *
    phaseMultiplier().lifetime
  );
}

function findSpawnPosition() {
  const positions = [
    [26, 28],
    [37, 35],
    [48, 28],
    [59, 37],
    [69, 30],
    [30, 49],
    [49, 49],
    [65, 48]
  ];

  return choose(positions);
}

function itemScreenPosition(record) {
  return {
    x: el.scene.clientWidth * record.x / 100 + 28,
    y: el.scene.clientHeight *
      (1 - record.bottom / 100) - 25
  };
}

function spawnItem() {
  if (!isPlaying()) return;

  const difficulty = currentDifficulty();

  if (
    state.items.size >= difficulty.maxItems
  ) {
    return;
  }

  const type = selectItemType();

  const special =
    Object.prototype.hasOwnProperty.call(
      SPECIAL_INFO,
      type
    );

  const id = state.nextItemId++;

  const [x, bottom] = findSpawnPosition();

  const button = document.createElement("button");

  button.type = "button";

  button.className =
    "game-item" +
    (special ? " special" : "");

  button.setAttribute(
    "aria-label",
    special
      ? SPECIAL_INFO[type].name
      : ITEM_INFO[type].name
  );

  button.style.left = `${x}%`;
  button.style.bottom = `${bottom}%`;

  if (special) {
    button.style.setProperty(
      "--aura",
      SPECIAL_INFO[type].aura
    );
  }

  const artwork = sprite(type);

  artwork.style.left = "10px";
  artwork.style.top = "4px";

  button.appendChild(artwork);

  const record = {
    id,
    type,
    special,
    x,
    bottom,

    lifetime: effectiveItemLifetime(),
    element: button
  };

  button.addEventListener(
    "click",
    () => collectItem(id)
  );

  state.items.set(id, record);

  el.itemsLayer.appendChild(button);

  if (
    currentDifficulty().vision &&
    state.teacherState === "watching"
  ) {
    const position = itemScreenPosition(record);

    button.classList.toggle(
      "in-vision",
      inTeacherVision(position.x, position.y)
    );
  }
}

function removeItem(id, expired = false) {
  const item = state.items.get(id);

  if (!item) return null;

  state.items.delete(id);

  if (expired) {
    item.element.classList.add("item-expire");

    setTimeout(
      () => item.element.remove(),
      210
    );

  } else {
    item.element.remove();
  }

  return item;
}

function clearAllItems() {
  state.items.clear();

  el.itemsLayer.replaceChildren();
}

function updateItems(delta) {
  if (state.freezeLeft > 0) return;

  for (const item of [...state.items.values()]) {
    item.lifetime -= delta;

    if (item.lifetime <= 0) {
      removeItem(item.id, true);

      if (!item.special) {
        breakCombo();
      }
    }
  }

  state.spawnTimeLeft -= delta;

  if (state.spawnTimeLeft <= 0) {
    spawnItem();

    state.spawnTimeLeft +=
      effectiveSpawnInterval();
  }
}


/* ============================================================
   25. V3.0 Update — COMBO SYSTEM
   ============================================================ */

function breakCombo() {
  state.combo = 0;
  updateHud();
}

function bonusForCombo(combo) {
  if (
    combo >= CONFIG.comboBonusLevel2
  ) {
    return 2;
  }

  if (
    combo >= CONFIG.comboBonusLevel1
  ) {
    return 1;
  }

  return 0;
}

function comboBurst(x, y) {
  if (!preferences.effects) return;

  for (let i = 0; i < 12; i++) {
    const element = document.createElement("span");

    element.className = "combo-star";

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;

    const angle =
      i * Math.PI * 2 / 12;

    element.style.setProperty(
      "--dx",
      `${Math.cos(angle) * 95}px`
    );

    element.style.setProperty(
      "--dy",
      `${Math.sin(angle) * 95}px`
    );

    el.scene.appendChild(element);

    element.addEventListener(
      "animationend",
      () => element.remove(),
      { once: true }
    );
  }

  tone(1047, 0.12, 0.08);
  tone(1319, 0.18, 0.08, "square", 0.10);

  vibration([15, 35, 15, 35, 15]);
}

function increaseCombo(x, y) {
  state.combo++;

  state.bestCombo = Math.max(
    state.bestCombo,
    state.combo
  );

  if (
    state.combo === 5 ||
    state.combo === 10
  ) {
    comboBurst(x, y);
  }
}


/* ============================================================
   26. V3.0 Update — CAUGHT PENALTIES
   ============================================================ */

function caughtPenalty() {
  state.caught++;
  state.hadViolation = true;

  breakCombo();
  clearAllItems();

  const index = clamp(
    state.caught - 1,
    0,
    CONFIG.catchFreeze.length - 1
  );

  state.controlFreezeLeft =
    CONFIG.catchFreeze[index];

  state.teacherTimeLeft +=
    CONFIG.dangerExtensions[index];

  el.catchFlash.classList.remove("hit");
  void el.catchFlash.offsetWidth;
  el.catchFlash.classList.add("hit");

  setStudentState("scared", "caught");
  teacherEmotion("angry");

  tone(
    230 - index * 35,
    0.30,
    0.12,
    "sawtooth"
  );

  vibration(80);

  feedback(
    `Caught! ${state.caught}/${currentDifficulty().maxCaught}.`
  );

  if (
    state.caught >=
    currentDifficulty().maxCaught
  ) {
    finishGame(false, "Too many warnings!");
  } else {
    state.reactionLeft = 1000;
  }

  updateHud();
}


/* ============================================================
   27. V3.0 Update — SPECIAL ITEM EFFECTS
   ============================================================ */

function useSpecial(item) {
  itemSound(item.type);

  vibration([15, 40, 15]);

  const position = itemScreenPosition(item);

  switch (item.type) {
    case "shield":
      state.shieldLeft =
        CONFIG.shieldDuration;

      feedback(
        "Shield activated! You are protected for 5 seconds."
      );

      showEffect("SHIELD");
      break;

    case "freeze":
      state.freezeLeft =
        CONFIG.freezeDuration;

      feedback(
        "Time freeze! The classroom stops for 3 seconds."
      );

      showEffect("FREEZE");
      break;

    case "clear": {
      let collectedPoints = 0;

      const ordinary = [...state.items.values()]
        .filter(record => !record.special);

      for (const record of ordinary) {
        collectedPoints +=
          CONFIG.points[record.type];

        removeItem(record.id);
      }

      state.score += collectedPoints;
      state.collected += ordinary.length;

      floatingPoints(
        collectedPoints,
        position.x,
        position.y
      );

      feedback(
        `Clear! Collected ${ordinary.length} items for ${collectedPoints} points.`
      );

      break;
    }

    case "trap":
      if (state.shieldLeft > 0) {
        state.shieldLeft = 0;
      }

      caughtPenalty();
      break;
  }

  updateHud();
}


/* ============================================================
   28. V3.0 Update — COLLECT ITEM
   ============================================================ */

function collectItem(id) {
  if (
    !isPlaying() ||
    rulesOpen ||
    settingsOpen
  ) {
    return;
  }

  const record = state.items.get(id);

  if (!record) return;

  if (state.controlFreezeLeft > 0) {
    record.element.classList.remove("rejected");
    void record.element.offsetWidth;
    record.element.classList.add("rejected");

    feedback("Wait! The student is stunned.");
    return;
  }

  // Traps always cause a catch.
  if (record.type === "trap") {
    removeItem(id);
    useSpecial(record);
    return;
  }

  // Positive specials can be collected without scoring.
  if (record.special) {
    removeItem(id);
    useSpecial(record);
    return;
  }

  const position = itemScreenPosition(record);

  let danger =
    state.teacherState === "watching";

  if (
    danger &&
    currentDifficulty().vision
  ) {
    danger = inTeacherVision(
      position.x,
      position.y
    );
  }

  if (
    danger &&
    state.shieldLeft <= 0
  ) {
    removeItem(id);
    caughtPenalty();
    return;
  }

  if (
    state.teacherState === "warning" &&
    state.freezeLeft <= 0
  ) {
    removeItem(id);

    feedback("Too risky! No points awarded.");

    setStudentState(
      "gp-hide",
      "warning"
    );

    state.reactionLeft = 400;

    return;
  }

  // SAFE, protected DANGER, or outside HARD vision.
  removeItem(id);

  increaseCombo(
    position.x,
    position.y
  );

  const basePoints =
    CONFIG.points[record.type];

  const comboBonus =
    bonusForCombo(state.combo);

  const total =
    basePoints + comboBonus;

  state.score += total;
  state.collected++;

  if (record.type === "star") {
    state.starsCollected++;
  }

  floatingPoints(
    total,
    position.x,
    position.y
  );

  reactToItem(record.type);
  itemSound(record.type);

  vibration(
    total >= 3 ? 30 : 10
  );

  feedback(
    `${ITEM_INFO[record.type].message} +${total} points!`
  );

  checkAchievements();

  updateHud();
}


/* ============================================================
   29. NORMAL ITEM VISUAL EFFECTS
   ============================================================ */

function studentPosition() {
  const scene =
    el.scene.getBoundingClientRect();

  const student =
    el.student.getBoundingClientRect();

  return {
    x: student.left - scene.left + 72,
    y: student.top - scene.top + 88
  };
}

function clearReaction() {
  state.reactionLeft = 0;

  el.layer.replaceChildren();
  el.speechLayer.replaceChildren();

  delete el.layer.dataset.item;

  updateStudentIdle();
}

function foregroundSprite(type, x, y) {
  const element = sprite(
    type,
    "foreground-prop"
  );

  element.style.left = `${x}px`;
  element.style.top = `${y}px`;

  el.layer.appendChild(element);
}

function createCrumbs(x, y) {
  for (let i = 0; i < 7; i++) {
    const crumb = document.createElement("span");

    crumb.className = "pixel-crumb";

    crumb.style.left =
      `${x + random(-10, 10)}px`;

    crumb.style.top =
      `${y + random(-10, 10)}px`;

    crumb.style.setProperty(
      "--dx",
      `${random(-55, 55)}px`
    );

    crumb.style.setProperty(
      "--dy",
      `${random(-45, 50)}px`
    );

    el.layer.appendChild(crumb);
  }
}

function speech(character, message) {
  const bubble = document.createElement("div");

  bubble.className =
    `speech-bubble ${character}-bubble`;

  bubble.textContent = message;

  const scene =
    el.scene.getBoundingClientRect();

  const pig =
    el[character].getBoundingClientRect();

  const x =
    pig.left - scene.left +
    (character === "teacher" ? 65 : 72);

  const y =
    pig.top - scene.top + 15;

  bubble.style.left =
    `${clamp(x, 75, scene.width - 75)}px`;

  bubble.style.top =
    `${Math.max(55, y)}px`;

  el.speechLayer.appendChild(bubble);
}

function itemDialogue(type) {
  const dialogues = {
    cookie: [
      "Crunch, crunch!",
      ["Hmm?", "What's that?", "Huh?"]
    ],

    cake: [
      "Yummy, yummy!",
      ["Hmm?", "Did I hear something?", "What's that?"]
    ],

    juice: [
      "So refreshing!",
      ["Huh?", "What's that?", "Hmm?"]
    ],

    star: [
      "A shiny star!",
      ["Hmm?", "What's that?", "Huh?"]
    ]
  };

  const pair = dialogues[type];

  if (!pair) return;

  speech("student", pair[0]);
  speech("teacher", choose(pair[1]));
}

function reactToItem(type) {
  clearReaction();

  const item = ITEM_INFO[type];

  const position = studentPosition();

  const x = position.x;
  const y = position.y;

  el.layer.dataset.item = type;

  setStudentState(
    item.animation,
    item.face
  );

  if (
    ["carrot", "cookie", "cake", "riceball", "juice"]
      .includes(type)
  ) {
    foregroundSprite(
      type,
      x + 20,
      y
    );
  }

  if (
    type === "cookie" ||
    type === "cake" ||
    type === "riceball"
  ) {
    createCrumbs(
      x + 20,
      y + 5
    );
  }

  if (type === "star") {
    foregroundSprite(
      "star",
      x,
      y - 45
    );
  }

  if (type === "doodle") {
    const paper =
      document.createElement("div");

    paper.className =
      "foreground-doodle-paper";

    paper.style.left =
      `${x + 65}px`;

    paper.style.top =
      `${y + 25}px`;

    const reveal =
      document.createElement("div");

    reveal.className =
      "flower-reveal";

    const flower =
      sprite("flower");

    flower.style.left = "12px";
    flower.style.top = "8px";

    reveal.appendChild(flower);
    paper.appendChild(reveal);

    el.layer.appendChild(paper);

    foregroundSprite(
      "doodle",
      x + 20,
      y - 20
    );
  }

  itemDialogue(type);

  state.reactionLeft =
    item.duration;
}


/* ============================================================
   30. V3.0 Update — BUFF TIMERS
   ============================================================ */

function updateBuffs(delta) {
  if (state.shieldLeft > 0) {
    state.shieldLeft = Math.max(
      0,
      state.shieldLeft - delta
    );
  }

  if (state.controlFreezeLeft > 0) {
    state.controlFreezeLeft = Math.max(
      0,
      state.controlFreezeLeft - delta
    );
  }

  if (state.freezeLeft > 0) {
    state.freezeLeft = Math.max(
      0,
      state.freezeLeft - delta
    );
  }
}


/* ============================================================
   31. V3.0 Update — ACHIEVEMENTS
   ============================================================ */

const ACHIEVEMENTS = {
  perfect: {
    title: "Perfect Grade",
    description: "Win without getting caught."
  },

  collector: {
    title: "Collector",
    description: "Collect 20 items in one game."
  },

  combo: {
    title: "Combo Master",
    description: "Reach a 10-item combo."
  },

  speedrunner: {
    title: "Speedrunner",
    description: "Win on HARD difficulty."
  },

  lucky: {
    title: "Lucky Star",
    description: "Collect 3 stars in one game."
  }
};

function unlockAchievement(id) {
  if (
    !ACHIEVEMENTS[id] ||
    preferences.achievements.includes(id)
  ) {
    return;
  }

  preferences.achievements.push(id);

  savePreferences();
  renderAchievements();

  el.achievementToast.textContent =
    `ACHIEVEMENT: ${ACHIEVEMENTS[id].title}`;

  el.achievementToast.hidden = false;

  tone(1047, 0.14, 0.07);
  tone(1319, 0.18, 0.07, "square", 0.13);

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(
    () => {
      el.achievementToast.hidden = true;
    },
    3000
  );
}

function checkAchievements() {
  if (state.collected >= 20) {
    unlockAchievement("collector");
  }

  if (state.bestCombo >= 10) {
    unlockAchievement("combo");
  }

  if (state.starsCollected >= 3) {
    unlockAchievement("lucky");
  }
}

function finishAchievements(won) {
  checkAchievements();

  if (!won) return;

  if (state.caught === 0) {
    unlockAchievement("perfect");
  }

  if (preferences.difficulty === "hard") {
    unlockAchievement("speedrunner");
  }
}

function renderAchievements() {
  el.achievementsList.replaceChildren();

  for (
    const [id, achievement] of
    Object.entries(ACHIEVEMENTS)
  ) {
    const unlocked =
      preferences.achievements.includes(id);

    const node = document.createElement("div");

    node.className =
      "achievement" +
      (unlocked ? " unlocked" : "");

    node.textContent =
      `${unlocked ? "★" : "☆"} ${achievement.title}`;

    node.title =
      achievement.description;

    el.achievementsList.appendChild(node);
  }
}


/* ============================================================
   32. V3.0 Update — PERSONAL RECORDS
   ============================================================ */

function getRecord() {
  return preferences.records[
    preferences.difficulty
  ] || {
    score: 0,
    combo: 0
  };
}

function saveGameRecord() {
  const previous = getRecord();

  const newScore = Math.max(
    previous.score,
    state.score
  );

  const newCombo = Math.max(
    previous.combo,
    state.bestCombo
  );

  state.isNewRecord =
    newScore > previous.score ||
    newCombo > previous.combo;

  preferences.records[
    preferences.difficulty
  ] = {
    score: newScore,
    combo: newCombo
  };

  savePreferences();
}


/* ============================================================
   33. SETTLEMENT STICKERS
   ============================================================ */

function clearSettlement() {
  el.particles.replaceChildren();

  el.particles.classList.remove(
    "is-paused"
  );

  el.resultIcon.style.boxShadow = "";

  settlementPaused = false;

  stopResultMusic();
}

function dropSticker(type, delay, won) {
  const pixelSize =
    Math.random() < 0.5 ? 4 : 5;

  const element = sprite(
    type,
    "result-sticker",
    pixelSize
  );

  const rows = ART[type];

  const artWidth =
    Math.max(...rows.map(row => row.length)) *
    pixelSize;

  const artHeight =
    rows.length * pixelSize;

  const sceneWidth =
    el.scene.clientWidth;

  const sceneHeight =
    el.scene.clientHeight;

  const startX = random(
    8,
    Math.max(9, sceneWidth - artWidth - 8)
  );

  const endX = clamp(
    startX + random(-24, 24),
    8,
    Math.max(9, sceneWidth - artWidth - 8)
  );

  const landingY =
    sceneHeight -
    artHeight -
    random(7, 30);

  element.style.setProperty(
    "--x",
    `${startX}px`
  );

  element.style.setProperty(
    "--drift",
    `${endX - startX}px`
  );

  element.style.setProperty(
    "--distance",
    `${landingY + 65}px`
  );

  element.style.setProperty(
    "--fall-time",
    `${random(won ? 2.2 : 3, won ? 3.2 : 4)}s`
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

function startSettlement(won) {
  clearSettlement();

  const types = won
    ? [
        "star",
        "balloon",
        "heart",
        "smile",
        "bubble",
        "confetti"
      ]
    : [
        "greyStar",
        "tear",
        "exclamation",
        "cloud"
      ];

  for (
    let i = 0;
    i < CONFIG.resultParticles;
    i++
  ) {
    dropSticker(
      choose(types),
      random(0, 0.85),
      won
    );
  }

  el.resultIcon.style.boxShadow =
    patternShadow(
      ART[won ? "star" : "tear"]
    );

  el.resultIcon.className =
    `result-icon ${won ? "win" : "lose"}`;

  resultMusicStep = 0;

  startResultMusic();
}


/* ============================================================
   34. GAME TIMER
   ============================================================ */

function stopGameTimer() {
  if (gameTimer !== null) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function tick() {
  if (
    !isPlaying() ||
    rulesOpen ||
    settingsOpen
  ) {
    return;
  }

  const currentTime = now();

  const delta = clamp(
    currentTime - lastTickTime,
    0,
    150
  );

  lastTickTime = currentTime;

  // Freeze pauses the game clock and teacher/item timers.
  const wasFrozen =
    state.freezeLeft > 0;

  updateBuffs(delta);

  if (!wasFrozen) {
    state.timeLeft = Math.max(
      0,
      state.timeLeft - delta
    );

    updatePhase();

    updateTeacher(delta);
    updateItems(delta);
  }

  if (state.reactionLeft > 0) {
    state.reactionLeft -= delta;

    if (state.reactionLeft <= 0) {
      clearReaction();
    }
  }

  if (state.timeLeft <= 0) {
    const difficulty = currentDifficulty();

    const won =
      state.score >= difficulty.targetScore &&
      state.caught < difficulty.maxCaught;

    finishGame(
      won,
      won
        ? "You made it through class!"
        : `You needed ${difficulty.targetScore} points.`
    );

    return;
  }

  updateHud();
}

function startGameTimer() {
  stopGameTimer();

  lastTickTime = now();

  gameTimer = setInterval(
    tick,
    CONFIG.tickRate
  );
}


/* ============================================================
   35. START GAME
   ============================================================ */

function startGame() {
  if (isPlaying()) return;

  if (state.mode === "paused") {
    resumeGame();
    return;
  }

  clearSettlement();
  clearReaction();

  state.mode = "playing";

  state.teacherState = "safe";
  state.teacherTimeLeft =
    newStateDuration("safe");

  state.spawnTimeLeft =
    effectiveSpawnInterval();

  state.fakeLastTime = false;

  el.game.classList.remove("game-paused");
  el.game.dataset.phase = "1";

  hideOverlay();

  el.pauseButton.disabled = false;
  el.shareButton.hidden = true;

  updateTeacherAppearance();
  updateStudentIdle();
  updateBlackboard();

  audioResume();

  startGameTimer();
  startBgm();
  startBlink();

  updateHud();
  updateControls();

  feedback(
    `Collect ${currentDifficulty().targetScore} points before class ends!`
  );

  tone(700, 0.14, 0.08);
}


/* ============================================================
   36. PAUSE / RESUME
   ============================================================ */

function pauseGame() {
  if (!isPlaying()) return;

  state.mode = "paused";

  stopGameTimer();
  stopBgm();
  stopBlink();

  el.game.classList.add("game-paused");

  audioSuspend();

  try {
    navigator.vibrate?.(0);
  } catch (_) {}

  showOverlay(
    "PAUSED",
    "Your game is paused.",
    "CONTINUE"
  );

  el.shareButton.hidden = true;

  feedback("Game paused.");

  updateControls();
}

function resumeGame() {
  if (
    state.mode !== "paused" ||
    rulesOpen ||
    settingsOpen
  ) {
    return;
  }

  state.mode = "playing";

  el.game.classList.remove("game-paused");

  hideOverlay();

  audioResume();

  startGameTimer();
  startBgm();
  startBlink();

  updateControls();

  feedback("Game resumed!");
}


/* ============================================================
   37. FINISH GAME
   ============================================================ */

function finishGame(won, reason) {
  if (state.mode === "finished") return;

  state.mode = "finished";
  state.endedWithWin = won;

  stopGameTimer();
  stopBgm();
  stopBlink();
  stopVoices();

  clearAllItems();

  state.freezeLeft = 0;
  state.shieldLeft = 0;
  state.controlFreezeLeft = 0;

  state.reactionLeft = 0;

  el.layer.replaceChildren();
  el.speechLayer.replaceChildren();

  el.game.classList.remove(
    "game-paused"
  );

  setStudentState(
    won ? "state-win" : "state-lose",
    won ? "win" : "lose"
  );

  saveGameRecord();
  finishAchievements(won);

  const record = getRecord();

  const summary = [
    reason,
    `Difficulty: ${preferences.difficulty.toUpperCase()}`,
    `Final score: ${state.score} / ${currentDifficulty().targetScore}`,
    `Items collected: ${state.collected}`,
    `Times caught: ${state.caught} / ${currentDifficulty().maxCaught}`,
    `Best combo: ${state.bestCombo}`,
    `Historical best score: ${record.score}`,
    state.isNewRecord ? "NEW PERSONAL BEST!" : ""
  ].filter(Boolean).join("\n");

  showOverlay(
    won ? "YOU WIN!" : "GAME OVER",
    summary,
    won ? "PLAY AGAIN" : "TRY AGAIN"
  );

  el.shareButton.hidden = false;
  el.pauseButton.disabled = false;

  feedback(
    won
      ? "Congratulations! What a brilliant daydream!"
      : "Better luck next time!"
  );

  startSettlement(won);

  updateHud();
  updateControls();
}


/* ============================================================
   38. RESET GAME
   ============================================================ */

function resetGame() {
  stopGameTimer();
  stopBgm();
  stopResultMusic();
  stopBlink();
  stopVoices();

  clearSettlement();
  clearAllItems();

  el.layer.replaceChildren();
  el.speechLayer.replaceChildren();

  state = makeInitialState();

  el.game.classList.remove(
    "game-paused"
  );

  el.game.dataset.phase = "1";

  el.game.classList.toggle(
    "hard-mode",
    preferences.difficulty === "hard"
  );

  el.effect.textContent = "";
  el.effect.classList.remove("pop");

  el.visionCone.hidden = true;
  el.shieldIcon.hidden = true;

  el.pauseButton.disabled = true;
  el.shareButton.hidden = true;

  teacherEmotion(null);

  setStudentState(
    "state-safe",
    "normal"
  );

  el.student.classList.add("normal");

  updateTeacherAppearance();
  updateBlackboard();

  updateRulesText();
  updateChoiceButtons();
  updateHud();
  updateControls();

  hideOverlay();

  feedback(
    `Ready to play! Reach ${currentDifficulty().targetScore} points.`
  );
}


/* ============================================================
   39. V3.0 Update — SHARE RESULT
   ============================================================ */

function resultShareText() {
  return [
    "CLASSROOM DAYDREAM V3.0",
    `Difficulty: ${preferences.difficulty.toUpperCase()}`,
    `Result: ${state.endedWithWin ? "YOU WIN" : "GAME OVER"}`,
    `Score: ${state.score}`,
    `Caught: ${state.caught}`,
    `Best combo: ${state.bestCombo}`,
    "Can you beat my score?"
  ].join("\n");
}

async function shareResult() {
  const message = resultShareText();

  try {
    await navigator.clipboard.writeText(message);

    feedback("Copied!");

  } catch (_) {
    // Fallback for older browsers.
    const field = document.createElement("textarea");

    field.value = message;
    field.style.position = "fixed";
    field.style.opacity = "0";

    document.body.appendChild(field);

    field.select();

    try {
      document.execCommand("copy");
      feedback("Copied!");
    } catch (_) {
      feedback("Copy unavailable in this browser.");
    }

    field.remove();
  }
}

el.shareButton.addEventListener(
  "click",
  shareResult
);


/* ============================================================
   40. V3.0 Update — SETTINGS
   ============================================================ */

function applySettings() {
  el.bgmVolume.value =
    preferences.bgmVolume;

  el.sfxVolume.value =
    preferences.sfxVolume;

  el.vibrationToggle.checked =
    preferences.vibration;

  el.effectsToggle.checked =
    preferences.effects;

  el.themeChoice.value =
    preferences.theme;

  el.game.dataset.theme =
    preferences.theme;

  el.game.dataset.effects =
    preferences.effects ? "on" : "off";

  updateControls();
  renderAchievements();
}

function openSettings() {
  if (settingsOpen || rulesOpen) return;

  previousFocus = document.activeElement;

  settingsReturnMode = state.mode;

  if (isPlaying()) {
    pauseGame();
  }

  if (
    state.mode === "finished" &&
    !settlementPaused
  ) {
    pauseSettlement();
  }

  settingsOpen = true;

  el.settingsOverlay.hidden = false;

  applySettings();

  el.settingsClose.focus();
}

function closeSettings() {
  if (!settingsOpen) return;

  settingsOpen = false;

  el.settingsOverlay.hidden = true;

  if (
    settingsReturnMode === "playing" &&
    state.mode === "paused"
  ) {
    resumeGame();
  }

  if (
    settingsReturnMode === "finished" &&
    settlementPaused
  ) {
    resumeSettlement();
  }

  if (previousFocus?.focus) {
    previousFocus.focus();
  }

  previousFocus = null;
}

el.settingsButton.addEventListener(
  "click",
  openSettings
);

el.settingsClose.addEventListener(
  "click",
  closeSettings
);

el.bgmVolume.addEventListener(
  "input",
  event => {
    preferences.bgmVolume =
      Number(event.target.value);

    savePreferences();
  }
);

el.sfxVolume.addEventListener(
  "input",
  event => {
    preferences.sfxVolume =
      Number(event.target.value);

    savePreferences();
  }
);

el.vibrationToggle.addEventListener(
  "change",
  event => {
    preferences.vibration =
      event.target.checked;

    savePreferences();
  }
);

el.effectsToggle.addEventListener(
  "change",
  event => {
    preferences.effects =
      event.target.checked;

    savePreferences();
    applySettings();
  }
);

el.themeChoice.addEventListener(
  "change",
  event => {
    preferences.theme =
      event.target.value;

    savePreferences();
    applySettings();
  }
);


/* ============================================================
   41. SETTLEMENT PAUSE / RESUME
   ============================================================ */

function pauseSettlement() {
  if (
    state.mode !== "finished" ||
    settlementPaused
  ) {
    return;
  }

  settlementPaused = true;

  el.particles.classList.add(
    "is-paused"
  );

  stopResultMusic();
  audioSuspend();

  updateControls();
}

function resumeSettlement() {
  if (
    state.mode !== "finished" ||
    !settlementPaused ||
    rulesOpen ||
    settingsOpen
  ) {
    return;
  }

  settlementPaused = false;

  el.particles.classList.remove(
    "is-paused"
  );

  audioResume();
  startResultMusic();

  updateControls();
}


/* ============================================================
   42. RULES MODAL
   ============================================================ */

function setRulesVisible(visible) {
  rulesOpen = visible;

  el.rulesOverlay.hidden = !visible;
}

function openRules() {
  if (rulesOpen || settingsOpen) return;

  previousFocus = document.activeElement;

  modalReturnMode = state.mode;

  if (isPlaying()) {
    pauseGame();
  }

  if (
    state.mode === "finished" &&
    !settlementPaused
  ) {
    pauseSettlement();
  }

  setRulesVisible(true);

  const initial =
    modalReturnMode === "ready";

  el.rulesStart.hidden = !initial;
  el.rulesClose.hidden = initial;

  (
    initial
      ? el.rulesStart
      : el.rulesClose
  ).focus();
}

function closeRules() {
  if (!rulesOpen) return;

  const returnMode = modalReturnMode;

  setRulesVisible(false);

  modalReturnMode = "ready";

  if (
    returnMode === "playing" &&
    state.mode === "paused"
  ) {
    resumeGame();
  }

  if (
    returnMode === "finished" &&
    settlementPaused
  ) {
    resumeSettlement();
  }

  if (previousFocus?.focus) {
    previousFocus.focus();
  }

  previousFocus = null;
}

function startFromRules() {
  if (state.mode !== "ready") {
    closeRules();
    return;
  }

  setRulesVisible(false);

  // User click unlocks Web Audio for mobile browsers.
  audioResume();

  startGame();
}

function restartToRules() {
  resetGame();

  modalReturnMode = "ready";

  setRulesVisible(true);

  el.rulesStart.hidden = false;
  el.rulesClose.hidden = true;

  el.rulesStart.focus();
}

el.rulesButton.addEventListener(
  "click",
  openRules
);

el.rulesStart.addEventListener(
  "click",
  startFromRules
);

el.rulesClose.addEventListener(
  "click",
  closeRules
);


/* ============================================================
   43. BUTTON EVENTS
   ============================================================ */

el.startButton.addEventListener(
  "click",
  () => {
    if (rulesOpen || settingsOpen) return;

    if (state.mode === "paused") {
      resumeGame();

    } else if (state.mode === "finished") {
      restartToRules();

    } else {
      startGame();
    }
  }
);

el.pauseButton.addEventListener(
  "click",
  () => {
    if (rulesOpen || settingsOpen) return;

    if (isPlaying()) {
      pauseGame();

    } else if (state.mode === "paused") {
      resumeGame();

    } else if (state.mode === "finished") {
      if (settlementPaused) {
        resumeSettlement();
      } else {
        pauseSettlement();
      }
    }
  }
);

el.resetButton.addEventListener(
  "click",
  () => {
    if (!rulesOpen && !settingsOpen) {
      restartToRules();
    }
  }
);

el.soundButton.addEventListener(
  "click",
  () => {
    preferences.muted =
      !preferences.muted;

    savePreferences();

    if (preferences.muted) {
      stopBgm();
      stopResultMusic();
      stopVoices();
      audioSuspend();

    } else {
      audioResume();

      if (isPlaying()) {
        startBgm();
      }

      if (
        state.mode === "finished" &&
        !settlementPaused
      ) {
        startResultMusic();
      }
    }

    updateControls();
  }
);


/* ============================================================
   44. V3.0 Update — KEYBOARD SHORTCUTS
   ============================================================ */

document.addEventListener(
  "keydown",
  event => {
    const key = event.key.toLowerCase();

    if (settingsOpen) {
      if (key === "escape") {
        event.preventDefault();
        closeSettings();
      }

      return;
    }

    if (rulesOpen) {
      if (
        key === "escape" &&
        modalReturnMode !== "ready"
      ) {
        event.preventDefault();
        closeRules();
      }

      return;
    }

    if (
      event.target.matches(
        "input, select, textarea"
      )
    ) {
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();

      if (isPlaying()) {
        pauseGame();

      } else if (state.mode === "paused") {
        resumeGame();
      }
    }

    if (key === "r") {
      restartToRules();
    }

    if (key === "m") {
      el.soundButton.click();
    }

    if (key === "h") {
      openRules();
    }

    if (key === "escape") {
      if (isPlaying()) {
        pauseGame();
      }
    }
  }
);


/* ============================================================
   45. AUTO-PAUSE
   ============================================================ */

function autoPause() {
  if (isPlaying()) {
    pauseGame();
  }

  if (
    state.mode === "finished" &&
    !settlementPaused
  ) {
    pauseSettlement();
  }
}

document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden) {
      autoPause();
    }
  }
);

window.addEventListener(
  "blur",
  autoPause
);


/* ============================================================
   46. MOBILE VIEWPORT
   ============================================================ */

function updateViewport() {
  const portrait =
    window.innerWidth < 768 &&
    window.innerHeight > window.innerWidth;

  el.portraitHint.hidden = !portrait;

  document.documentElement.style.setProperty(
    "--available-height",
    `${
      window.visualViewport?.height ||
      window.innerHeight
    }px`
  );
}

window.addEventListener(
  "resize",
  updateViewport,
  { passive: true }
);

window.visualViewport?.addEventListener(
  "resize",
  updateViewport,
  { passive: true }
);


/* ============================================================
   47. INITIALIZATION
   ============================================================ */

function initializeGame() {
  updateViewport();

  applySettings();

  resetGame();

  updateChoiceButtons();
  updateRulesText();

  setRulesVisible(true);

  modalReturnMode = "ready";

  el.rulesStart.hidden = false;
  el.rulesClose.hidden = true;

  el.rulesStart.focus();
}

initializeGame();


/* ============================================================
   END — CLASSROOM DAYDREAM V3.0
   COMPLETE SCRIPT.JS
   ============================================================ */
