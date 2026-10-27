
"use strict";

/* ============================================================
   CLASSROOM DAYDREAM V2.5
   COMPLETE SCRIPT.JS

   Pixel Classroom Edition

   Features:
   - Original 60-second game
   - SAFE / WARNING / DANGER teacher state machine
   - Seven collectible items
   - Single-element CSS box-shadow guinea pigs
   - English interface
   - Unique item reactions
   - Dynamic three-stage 8-bit background music
   - Looping victory / defeat music
   - Falling pixel stickers that remain on the floor
   - Pause, resume, restart and sound toggle
   - Rules modal and mobile compatibility

   No external dependencies
   ============================================================ */


/* ============================================================
   01. GAME CONFIGURATION
   Original mechanics preserved
   ============================================================ */

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


/* ============================================================
   02. V2.5 Update
   PIXEL COLOR PALETTE
   ============================================================ */

const COLORS = {
  outline: "#654b44",
  dark: "#49383c",

  brown: "#987b6b",
  brownLight: "#b49a87",

  grey: "#92918b",
  greyLight: "#b8b7a8",

  orange: "#e5aa70",
  orangeLight: "#f4c693",

  white: "#fffaf0",
  cream: "#f4e6cd",

  pink: "#ecb1b3",
  pinkDark: "#e1909d",

  eye: "#59413f",
  highlight: "#fffdf7",

  red: "#e46a77",
  blue: "#75bfe2",
  yellow: "#f8d66b",

  green: "#71a876",
  purple: "#a987c9"
};


/* ============================================================
   03. V2.5 Update
   ZERO-BLUR PIXEL SHADOW HELPERS
   ============================================================ */

function makeCanvas(width, height) {
  return Array.from(
    { length: height },
    () => Array(width).fill(null)
  );
}

function pixel(grid, x, y, color) {
  x = Math.round(x);
  y = Math.round(y);

  if (
    y >= 0 &&
    y < grid.length &&
    x >= 0 &&
    x < grid[0].length
  ) {
    grid[y][x] = color;
  }
}

function fillRect(grid, x, y, width, height, color) {
  for (let row = y; row < y + height; row++) {
    for (let col = x; col < x + width; col++) {
      pixel(grid, col, row, color);
    }
  }
}

function fillOval(grid, cx, cy, rx, ry, color) {
  for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
    for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
      const distance =
        Math.pow((x - cx) / rx, 2) +
        Math.pow((y - cy) / ry, 2);

      if (distance <= 1) {
        pixel(grid, x, y, color);
      }
    }
  }
}

function toBoxShadow(grid, pixelSize = 4) {
  const shadows = [];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const color = grid[y][x];

      if (!color) continue;

      shadows.push(
        `${x * pixelSize}px ` +
        `${y * pixelSize}px ` +
        `0 0 ${color}`
      );
    }
  }

  return shadows.join(",");
}


/* ============================================================
   04. V2.5 Update
   STUDENT GUINEA PIG PIXEL SPRITE

   Pure box-shadow, single DOM element.

   Design:
   - Rounded, stepped silhouette
   - Grey + white + warm brown fur
   - Pink ears and cheeks
   - Small eyes and nose
   - Small tuft of hair
   ============================================================ */

function drawStudentSprite(expression = "normal") {
  const c = COLORS;
  const g = makeCanvas(36, 37);

  /* BODY */

  fillOval(g, 18, 27, 15, 9, c.outline);
  fillOval(g, 18, 26, 14, 8, c.cream);

  fillOval(g, 11, 26, 7, 7, c.grey);
  fillOval(g, 27, 26, 6, 7, c.brown);

  /* EARS */

  fillOval(g, 8, 10, 6, 7, c.outline);
  fillOval(g, 28, 10, 6, 7, c.outline);

  fillOval(g, 8, 10, 4, 5, c.pink);
  fillOval(g, 28, 10, 4, 5, c.pink);

  pixel(g, 6, 8, c.cream);
  pixel(g, 26, 8, c.cream);

  /* OUTER HEAD */

  fillOval(g, 18, 21, 17, 13, c.outline);
  fillOval(g, 18, 20, 16, 12, c.white);

  /* TRICOLOUR FUR */

  fillOval(g, 9, 18, 8, 10, c.grey);
  fillOval(g, 28, 18, 7, 10, c.brown);

  fillOval(g, 17, 22, 10, 10, c.white);

  /* SOFT FUR TRANSITIONS */

  fillRect(g, 3, 15, 3, 6, c.greyLight);
  fillRect(g, 29, 15, 3, 5, c.orange);
  fillRect(g, 25, 10, 4, 3, c.orangeLight);

  /* LITTLE HAIR TUFT */

  pixel(g, 16, 7, c.outline);
  pixel(g, 17, 6, c.outline);
  pixel(g, 18, 5, c.outline);
  pixel(g, 19, 7, c.outline);
  pixel(g, 20, 6, c.outline);

  /* FACE BLUSH */

  fillRect(g, 6, 24, 5, 3, c.pink);
  fillRect(g, 25, 24, 5, 3, c.pink);

  /* EXPRESSIVE EYES */

  const happyExpressions = [
    "happy", "win", "cookie", "cake"
  ];

  const shockedExpressions = [
    "warning", "surprised", "caught"
  ];

  const sadExpressions = [
    "sad", "lose"
  ];

  if (happyExpressions.includes(expression)) {
    fillRect(g, 11, 20, 5, 1, c.eye);
    fillRect(g, 21, 20, 5, 1, c.eye);
    pixel(g, 11, 19, c.eye);
    pixel(g, 25, 19, c.eye);

  } else if (expression === "blink") {
    fillRect(g, 11, 21, 5, 1, c.eye);
    fillRect(g, 21, 21, 5, 1, c.eye);

  } else if (shockedExpressions.includes(expression)) {
    fillRect(g, 12, 18, 3, 6, c.eye);
    fillRect(g, 22, 18, 3, 6, c.eye);

    pixel(g, 12, 18, c.highlight);
    pixel(g, 22, 18, c.highlight);

  } else if (sadExpressions.includes(expression)) {
    fillRect(g, 11, 22, 5, 2, c.eye);
    fillRect(g, 21, 22, 5, 2, c.eye);
    pixel(g, 11, 21, c.eye);
    pixel(g, 25, 21, c.eye);

  } else if (expression === "danger") {
    fillRect(g, 12, 19, 3, 4, c.eye);
    fillRect(g, 22, 19, 3, 4, c.eye);

    fillRect(g, 28, 17, 2, 4, c.blue);

  } else {
    fillRect(g, 12, 19, 3, 4, c.eye);
    fillRect(g, 22, 19, 3, 4, c.eye);

    pixel(g, 12, 19, c.highlight);
    pixel(g, 22, 19, c.highlight);
  }

  /* NOSE */

  fillRect(g, 17, 25, 3, 2, c.brown);
  fillRect(g, 18, 27, 1, 2, c.eye);

  /* MOUTH */

  if (
    expression === "warning" ||
    expression === "surprised" ||
    expression === "caught"
  ) {
    fillRect(g, 17, 29, 3, 4, c.eye);

  } else if (sadExpressions.includes(expression)) {
    fillRect(g, 16, 31, 5, 1, c.eye);
    pixel(g, 16, 30, c.eye);
    pixel(g, 20, 30, c.eye);

  } else {
    fillRect(g, 15, 29, 3, 1, c.eye);
    fillRect(g, 19, 29, 3, 1, c.eye);
    pixel(g, 16, 30, c.eye);
    pixel(g, 20, 30, c.eye);
  }

  /* FOOD EXPRESSIONS */

  if (
    expression === "carrot" ||
    expression === "rice"
  ) {
    fillRect(g, 5, 23, 7, 5, c.pink);
    fillRect(g, 24, 23, 7, 5, c.pink);
  }

  if (expression === "cake") {
    fillRect(g, 24, 28, 4, 2, c.cream);
    pixel(g, 27, 29, c.white);
  }

  if (expression === "juice") {
    fillRect(g, 17, 28, 3, 4, c.eye);
  }

  /* TEARS */

  if (
    expression === "caught" ||
    expression === "lose"
  ) {
    fillRect(g, 9, 23, 2, 5, c.blue);
    fillRect(g, 26, 23, 2, 5, c.blue);
  }

  /* PAWS */

  fillRect(g, 10, 32, 5, 2, c.cream);
  fillRect(g, 22, 32, 5, 2, c.cream);

  /* LOWER OUTLINE */

  fillRect(g, 11, 35, 14, 1, c.outline);

  return toBoxShadow(g, 4);
}


/* ============================================================
   05. V2.5 Update
   TEACHER GUINEA PIG PIXEL SPRITE

   Grey + brown mature colouring.
   Small glasses and pointer.
   ============================================================ */

function drawTeacherSprite(expression = "back") {
  const c = COLORS;
  const g = makeCanvas(35, 38);

  /* BODY */

  fillOval(g, 18, 29, 14, 8, c.outline);
  fillOval(g, 18, 28, 13, 7, c.green);

  /* EARS */

  fillOval(g, 8, 11, 6, 7, c.outline);
  fillOval(g, 27, 11, 6, 7, c.outline);

  fillOval(g, 8, 11, 4, 5, c.pink);
  fillOval(g, 27, 11, 4, 5, c.pink);

  /* HEAD */

  fillOval(g, 18, 21, 16, 13, c.outline);
  fillOval(g, 18, 20, 15, 12, c.cream);

  fillOval(g, 10, 18, 8, 10, c.grey);
  fillOval(g, 26, 18, 7, 10, c.brown);

  if (
    expression === "back" ||
    expression === "warning"
  ) {
    /* TEACHER FACING THE BLACKBOARD */

    fillOval(g, 17, 21, 14, 11, c.brown);
    fillOval(g, 10, 20, 7, 8, c.grey);

    fillRect(g, 12, 29, 10, 2, c.brownLight);

  } else {

    /* BLUSH */

    fillRect(g, 6, 24, 5, 3, c.pink);
    fillRect(g, 25, 24, 5, 3, c.pink);

    /* EYES */

    if (expression === "happy") {
      fillRect(g, 11, 20, 5, 1, c.eye);
      fillRect(g, 21, 20, 5, 1, c.eye);

    } else {
      fillRect(g, 12, 19, 3, 4, c.eye);
      fillRect(g, 22, 19, 3, 4, c.eye);
    }

    /* GLASSES */

    fillRect(g, 9, 18, 7, 1, c.eye);
    fillRect(g, 21, 18, 7, 1, c.eye);

    fillRect(g, 9, 18, 1, 7, c.eye);
    fillRect(g, 15, 18, 1, 7, c.eye);

    fillRect(g, 21, 18, 1, 7, c.eye);
    fillRect(g, 27, 18, 1, 7, c.eye);

    fillRect(g, 16, 19, 5, 1, c.eye);

    /* NOSE */

    fillRect(g, 17, 26, 3, 2, c.brown);

    /* MOUTH */

    if (expression === "angry") {
      fillRect(g, 17, 29, 4, 4, c.red);

      /* ANGRY EYEBROWS */
      fillRect(g, 10, 15, 5, 2, c.eye);
      fillRect(g, 22, 15, 5, 2, c.eye);

    } else {
      fillRect(g, 15, 29, 3, 1, c.eye);
      fillRect(g, 19, 29, 3, 1, c.eye);
      pixel(g, 16, 30, c.eye);
      pixel(g, 20, 30, c.eye);
    }
  }

  /* TEACHER UNIFORM */

  fillRect(g, 12, 34, 12, 2, c.green);
  fillRect(g, 16, 34, 3, 2, c.cream);

  /* MINI POINTER */

  fillRect(g, 31, 23, 1, 12, c.outline);
  pixel(g, 31, 22, c.yellow);

  return toBoxShadow(g, 4);
}


/* ============================================================
   06. SPRITE CACHE
   V2.5 Update
   ============================================================ */

const spriteCache = new Map();

function getStudentShadow(expression) {
  const key = "student-" + expression;

  if (!spriteCache.has(key)) {
    spriteCache.set(
      key,
      drawStudentSprite(expression)
    );
  }

  return spriteCache.get(key);
}

function getTeacherShadow(expression) {
  const key = "teacher-" + expression;

  if (!spriteCache.has(key)) {
    spriteCache.set(
      key,
      drawTeacherSprite(expression)
    );
  }

  return spriteCache.get(key);
}


/* ============================================================
   07. HTML REFERENCES
   ============================================================ */

const el = {
  game: document.getElementById("game"),
  scene: document.getElementById("scene"),

  student: document.getElementById("student"),
  teacher: document.getElementById("teacher"),

  teacherEmote:
    document.getElementById("teacher-emote"),

  time: document.getElementById("time-value"),
  score: document.getElementById("score-value"),
  caught: document.getElementById("caught-value"),

  status:
    document.getElementById("teacher-status"),

  collectible:
    document.getElementById("collectible"),

  itemIcon:
    document.getElementById("collectible-icon"),

  layer:
    document.getElementById("interaction-layer"),

  particles:
    document.getElementById("result-particles"),

  resultIcon:
    document.getElementById("result-icon"),

  effect: document.getElementById("effect"),
  feedback: document.getElementById("feedback"),

  overlay: document.getElementById("overlay"),

  overlayTitle:
    document.getElementById("overlay-title"),

  overlayMessage:
    document.getElementById("overlay-message"),

  startButton:
    document.getElementById("start-button"),

  pauseButton:
    document.getElementById("pause-button"),

  pauseIcon:
    document.getElementById("pause-icon"),

  pauseLabel:
    document.getElementById("pause-label"),

  soundButton:
    document.getElementById("sound-button"),

  soundIcon:
    document.getElementById("sound-icon"),

  soundLabel:
    document.getElementById("sound-label"),

  resetButton:
    document.getElementById("reset-button"),

  rulesButton:
    document.getElementById("rules-button"),

  rulesOverlay:
    document.getElementById("rules-overlay"),

  rulesStartButton:
    document.getElementById("rules-start-button"),

  rulesCloseButton:
    document.getElementById("rules-close-button"),

  portraitHint:
    document.getElementById("portrait-hint")
};

for (const [name, element] of Object.entries(el)) {
  if (!element) {
    throw new Error(
      "Required HTML element missing: " + name
    );
  }
}


/* ============================================================
   08. CHARACTER APPEARANCE
   ============================================================ */

function setStudentFace(expression) {
  el.student.style.boxShadow =
    getStudentShadow(expression);

  el.student.dataset.face = expression;
}

function setTeacherFace(expression) {
  el.teacher.style.boxShadow =
    getTeacherShadow(expression);

  el.teacher.dataset.face = expression;
}


/* ============================================================
   09. V2.5 Update
   PIXEL ITEM PALETTE
   ============================================================ */

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
   10. V2.5 Update
   SEVEN PIXEL COLLECTIBLES
   ============================================================ */

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
   11. PIXEL OBJECT RENDERING
   Single DOM element + CSS box-shadow
   ============================================================ */

function patternToShadow(
  rows,
  palette = ITEM_COLORS,
  size = 4
) {
  const result = [];

  rows.forEach((row, y) => {
    [...row].forEach((symbol, x) => {
      const color = palette[symbol];

      if (!color) return;

      result.push(
        `${x * size}px ${y * size}px 0 0 ${color}`
      );
    });
  });

  return result.join(",");
}

function makePixelElement(
  name,
  className = "pixel-item",
  size = 4
) {
  const element = document.createElement("span");

  element.className = className;

  element.style.position = "absolute";
  element.style.display = "block";

  element.style.width = size + "px";
  element.style.height = size + "px";

  element.style.background = "transparent";

  element.style.boxShadow =
    patternToShadow(PIXEL_ART[name], ITEM_COLORS, size);

  element.style.pointerEvents = "none";

  return element;
}


/* ============================================================
   12. ORIGINAL ITEMS + THREE NEW ITEMS
   All seven items award one point
   ============================================================ */

const ITEMS = [

  {
    id: "carrot",
    name: "Carrot",
    points: 1,
    sound: 660,
    animation: "gp-eat-carrot",
    expression: "carrot",
    duration: 1600,
    message: "Crunch! Puffy cheeks for a crunchy carrot!"
  },

  {
    id: "cookie",
    name: "Cookie",
    points: 1,
    sound: 560,
    animation: "gp-eat-cookie",
    expression: "cookie",
    duration: 1600,
    message: "Yummy! Cookie crumbs everywhere!"
  },

  {
    id: "doodle",
    name: "Doodle",
    points: 1,
    sound: 750,
    animation: "gp-draw",
    expression: "happy",
    duration: 1800,
    message: "A lovely flower appears on the desk!"
  },

  {
    id: "star",
    name: "Star",
    points: 1,
    sound: 880,
    animation: "gp-star",
    expression: "win",
    duration: 1500,
    message: "Hooray! A little star celebration!"
  },

  {
    id: "cake",
    name: "Cake",
    points: 1,
    sound: 720,
    animation: "gp-eat-cake",
    expression: "cake",
    duration: 1600,
    message: "So sweet! There's cream on your cheek!"
  },

  {
    id: "riceball",
    name: "Rice Ball",
    points: 1,
    sound: 490,
    animation: "gp-eat-rice",
    expression: "rice",
    duration: 1600,
    message: "Big bite! Those cheeks are full!"
  },

  {
    id: "juice",
    name: "Orange Juice",
    points: 1,
    sound: 810,
    animation: "gp-drink-juice",
    expression: "juice",
    duration: 1600,
    message: "Sip, sip! Refreshing orange juice!"
  }

];


/* ============================================================
   13. ORIGINAL GAME STATE
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

let timerId = null;
let lastTick = 0;

let reactionTimeLeft = 0;
let reactionFace = null;

let blinkTimer = null;
let blinkTimeout = null;

let soundEnabled = true;

let rulesOpen = true;
let rulesReturnMode = "ready";
let rulesPreviousFocus = null;

let resultPaused = false;
let settlementToken = 0;
let settlementTimeouts = [];

const random = (min, max) =>
  min + Math.random() * (max - min);

const playing = () =>
  state.mode === "playing";


/* ============================================================
   14. V2.5 Update
   RESPONSIVE STAGE SCALING

   Keeps the game in the viewport.
   ============================================================ */

function updateResponsiveStage() {
  /*
    The current V2.5 HTML/CSS uses a grid-based
    responsive shell rather than a fixed-size
    transform-only stage.

    The scene's actual dimensions are therefore
    read from CSS, and particles use those bounds.

    CSS media queries handle the visual scaling.
  */

  const viewportHeight =
    window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

  document.documentElement.style.setProperty(
    "--available-height",
    viewportHeight + "px"
  );

  const isPortrait =
    window.innerWidth < 768 &&
    window.innerHeight > window.innerWidth;

  el.portraitHint.hidden = !isPortrait;
}

window.addEventListener(
  "resize",
  updateResponsiveStage,
  { passive: true }
);

if (window.visualViewport) {
  window.visualViewport.addEventListener(
    "resize",
    updateResponsiveStage,
    { passive: true }
  );
}


/* ============================================================
   15. V2.5 Update
   WEB AUDIO ENGINE
   ============================================================ */

let audioContext = null;
let masterGain = null;

let backgroundTimer = null;
let backgroundStep = 0;

let settlementTimer = null;
let settlementStep = 0;
let settlementWon = false;

let activeOscillators = new Set();

function ensureAudio() {
  const AudioClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioClass) return null;

  try {
    if (!audioContext) {
      audioContext = new AudioClass();

      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.65;

      masterGain.connect(
        audioContext.destination
      );
    }

    return audioContext;

  } catch (error) {
    console.warn("Web Audio unavailable:", error);
    return null;
  }
}

function unlockAudio() {
  if (!soundEnabled) return;

  const ac = ensureAudio();
  if (!ac) return;

  if (ac.state === "suspended") {
    ac.resume().catch(() => {});
  }
}


/* ============================================================
   16. PIXEL SYNTHESIZER
   ============================================================ */

function playTone(
  frequency,
  duration = 0.12,
  volume = 0.03,
  delay = 0,
  wave = "square"
) {
  if (!soundEnabled) return;

  const ac = ensureAudio();
  if (!ac || !masterGain) return;

  try {
    const oscillator = ac.createOscillator();
    const gain = ac.createGain();

    const startTime =
      ac.currentTime + delay;

    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(
      frequency,
      startTime
    );

    gain.gain.setValueAtTime(
      0.0001,
      startTime
    );

    gain.gain.linearRampToValueAtTime(
      Math.max(0.0002, volume),
      startTime + 0.008
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + duration
    );

    oscillator.connect(gain);
    gain.connect(masterGain);

    activeOscillators.add(oscillator);

    oscillator.onended = () => {
      activeOscillators.delete(oscillator);

      try {
        oscillator.disconnect();
        gain.disconnect();
      } catch (_) {}
    };

    oscillator.start(startTime);

    oscillator.stop(
      startTime + duration + 0.02
    );

  } catch (error) {
    console.warn("Tone skipped:", error);
  }
}

function playSound(frequency, duration = 0.13) {
  playTone(
    frequency,
    duration,
    0.085,
    0,
    "square"
  );
}

function stopActiveTones() {
  activeOscillators.forEach(oscillator => {
    try {
      oscillator.stop();
    } catch (_) {}
  });

  activeOscillators.clear();
}

function suspendAudio() {
  if (
    audioContext &&
    audioContext.state === "running"
  ) {
    audioContext.suspend().catch(() => {});
  }
}

function resumeAudio() {
  if (
    soundEnabled &&
    audioContext &&
    audioContext.state === "suspended"
  ) {
    audioContext.resume().catch(() => {});
  }
}


/* ============================================================
   17. V2.5 Update
   THREE-STAGE BACKGROUND MUSIC
   ============================================================ */

const BACKGROUND_MELODY = [
  523.25, 659.25, 783.99, 659.25,
  587.33, 698.46, 880.00, 698.46,
  659.25, 783.99, 1046.50, 783.99,
  587.33, 698.46, 783.99, 523.25
];

const BACKGROUND_BASS = [
  130.81,
  146.83,
  164.81,
  146.83
];

function backgroundMusicStage() {
  const seconds = state.timeLeft / 1000;

  if (seconds > 40) return 0;
  if (seconds > 20) return 1;

  return 2;
}

function backgroundMusicTick() {
  if (
    !playing() ||
    rulesOpen ||
    !soundEnabled
  ) {
    return;
  }

  const stage = backgroundMusicStage();

  const speed = [330, 235, 155][stage];
  const pitch = [1, 1.12, 1.25][stage];

  const index =
    backgroundStep % BACKGROUND_MELODY.length;

  playTone(
    BACKGROUND_MELODY[index] * pitch,
    Math.min(speed / 1500, 0.18),
    0.021,
    0,
    "square"
  );

  if (
    backgroundStep %
    (stage === 0 ? 4 : 2) === 0
  ) {
    playTone(
      BACKGROUND_BASS[
        Math.floor(backgroundStep / 4) %
        BACKGROUND_BASS.length
      ],
      0.16,
      0.012,
      0,
      "triangle"
    );
  }

  if (
    stage >= 1 &&
    backgroundStep % 2 === 1
  ) {
    playTone(
      stage === 2 ? 210 : 175,
      0.035,
      0.009,
      0,
      "square"
    );
  }

  if (
    stage === 2 &&
    backgroundStep % 4 === 3
  ) {
    playTone(
      1174.66,
      0.045,
      0.012,
      0,
      "square"
    );
  }

  backgroundStep += 1;

  backgroundTimer = setTimeout(
    backgroundMusicTick,
    speed
  );
}

function stopBackgroundMusic() {
  if (backgroundTimer !== null) {
    clearTimeout(backgroundTimer);
    backgroundTimer = null;
  }
}

function startBackgroundMusic() {
  stopBackgroundMusic();

  if (
    !playing() ||
    rulesOpen ||
    !soundEnabled
  ) {
    return;
  }

  unlockAudio();
  backgroundMusicTick();
}


/* ============================================================
   18. V2.5 Update
   VICTORY / DEFEAT MUSIC
   ============================================================ */

const WIN_MELODY = [
  [523.25, 0.16],
  [659.25, 0.16],
  [783.99, 0.16],
  [1046.50, 0.34],
  [783.99, 0.16],
  [880.00, 0.16],
  [1046.50, 0.38],
  [1174.66, 0.16],
  [1318.51, 0.52]
];

const LOSE_MELODY = [
  [392.00, 0.35],
  [349.23, 0.38],
  [329.63, 0.40],
  [293.66, 0.44],
  [261.63, 0.65]
];

function settlementMusicTick() {
  if (
    state.mode !== "finished" ||
    resultPaused ||
    rulesOpen ||
    !soundEnabled
  ) {
    return;
  }

  const melody =
    settlementWon
      ? WIN_MELODY
      : LOSE_MELODY;

  const index =
    settlementStep % melody.length;

  const [frequency, duration] =
    melody[index];

  playTone(
    frequency,
    duration,
    settlementWon ? 0.042 : 0.031,
    0,
    settlementWon ? "square" : "triangle"
  );

  settlementStep += 1;

  const extraGap =
    index === melody.length - 1
      ? 650
      : 60;

  settlementTimer = setTimeout(
    settlementMusicTick,
    duration * 1000 + extraGap
  );
}

function stopSettlementMusic() {
  if (settlementTimer !== null) {
    clearTimeout(settlementTimer);
    settlementTimer = null;
  }
}

function startSettlementMusic(won) {
  stopSettlementMusic();

  settlementWon = won;
  settlementStep = 0;

  if (
    !soundEnabled ||
    resultPaused ||
    rulesOpen
  ) {
    return;
  }

  unlockAudio();
  settlementMusicTick();
}


/* ============================================================
   19. V2.5 Update
   PIXEL CONTROL BUTTON ICONS
   ============================================================ */

function updateControlButtons() {
  const paused =
    state.mode === "paused" ||
    resultPaused;

  el.pauseIcon.className =
    "control-icon " +
    (paused ? "icon-play" : "icon-pause");

  el.pauseLabel.textContent =
    paused ? "RESUME" : "PAUSE";

  el.pauseButton.setAttribute(
    "aria-label",
    paused ? "Resume game" : "Pause game"
  );

  el.soundIcon.className =
    "control-icon " +
    (soundEnabled
      ? "icon-bell"
      : "icon-bell-muted");

  el.soundLabel.textContent =
    soundEnabled ? "SOUND ON" : "SOUND OFF";

  el.soundButton.setAttribute(
    "aria-label",
    soundEnabled ? "Mute sound" : "Enable sound"
  );

  el.soundButton.setAttribute(
    "aria-pressed",
    String(soundEnabled)
  );
}


/* ============================================================
   20. GAME HUD
   ============================================================ */

function updateHUD() {
  const seconds =
    Math.ceil(state.timeLeft / 1000);

  el.time.textContent = String(seconds);
  el.score.textContent = String(state.score);

  el.caught.textContent =
    `${state.caught} / ${CONFIG.maxCaught}`;

  el.time.style.color =
    seconds <= 10 ? "#d76370" : "";

  el.score.style.color =
    state.score >= CONFIG.targetScore
      ? "#3e966a"
      : "";

  el.caught.style.color =
    state.caught >= 2
      ? "#d76370"
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


/* ============================================================
   21. STUDENT STATE CLASSES
   ============================================================ */

const STUDENT_STATE_CLASSES = [
  "state-safe",
  "state-warning",
  "state-danger",
  "state-win",
  "state-lose",

  "normal",
  "blink",
  "surprised",
  "happy",
  "sad",
  "scared",

  "gp-hide",
  "gp-eat-carrot",
  "gp-eat-cookie",
  "gp-draw",
  "gp-star",
  "gp-eat-cake",
  "gp-eat-rice",
  "gp-drink-juice",

  "action-eat",
  "action-jump"
];

function clearStudentStateClasses() {
  el.student.classList.remove(
    ...STUDENT_STATE_CLASSES
  );
}

function setStudentState(className, expression) {
  clearStudentStateClasses();

  el.student.classList.add(className);

  setStudentFace(expression);
}


/* ============================================================
   22. STUDENT IDLE EXPRESSIONS
   ============================================================ */

function updateStudentIdle() {
  if (!playing()) return;

  if (state.teacherState === "warning") {
    setStudentState(
      "state-warning",
      "warning"
    );

  } else if (state.teacherState === "watching") {
    setStudentState(
      "state-danger",
      "danger"
    );

  } else {
    setStudentState(
      "state-safe",
      "normal"
    );

    el.student.classList.add("normal");
  }
}


/* ============================================================
   23. V2.5 Update
   OCCASIONAL BLINKING
   ============================================================ */

function stopBlinking() {
  if (blinkTimer !== null) {
    clearInterval(blinkTimer);
    blinkTimer = null;
  }

  if (blinkTimeout !== null) {
    clearTimeout(blinkTimeout);
    blinkTimeout = null;
  }
}

function startBlinking() {
  stopBlinking();

  blinkTimer = setInterval(() => {
    if (
      !playing() ||
      rulesOpen ||
      state.teacherState !== "safe" ||
      reactionTimeLeft > 0
    ) {
      return;
    }

    setStudentFace("blink");

    blinkTimeout = setTimeout(() => {
      if (
        playing() &&
        state.teacherState === "safe" &&
        reactionTimeLeft <= 0
      ) {
        setStudentFace("normal");
      }
    }, 140);

  }, 3300);
}


/* ============================================================
   24. TEACHER EMOTION PIXEL ART
   ============================================================ */

const TEACHER_EMOTES = {
  happy: [
    "........KK......",
    ".......KYYK.....",
    ".......KYYK.....",
    "...KKK.KYYK.....",
    "..KGGGKKYYKK....",
    "..KGGGYYYYYK....",
    "..KGGGYYYYYK....",
    "..KGGGYYYYK.....",
    "...KKKKKKKK....."
  ],

  angry: [
    "RR..........RR",
    ".RR..RRRR..RR.",
    "..RRR....RR...",
    "...RYYYYR.....",
    "..RYYYYYYR....",
    "...RYYYYR.....",
    "..RRRRRRRR....",
    ".RR..RRRR..RR.",
    "RR..........RR"
  ]
};

const EMOTE_PALETTE = {
  K: "#59403f",
  Y: "#ffdc69",
  G: "#75b47a",
  R: "#e86578"
};

function clearTeacherEmotion() {
  el.teacher.classList.remove(
    "teacher-happy",
    "teacher-angry"
  );

  el.teacherEmote.className =
    "teacher-emote";

  el.teacherEmote.style.boxShadow = "";

  el.teacher.dataset.emotion = "normal";
}

function showTeacherEmotion(type) {
  clearTeacherEmotion();

  el.teacher.classList.add(
    type === "happy"
      ? "teacher-happy"
      : "teacher-angry"
  );

  setTeacherFace(type);

  el.teacherEmote.style.boxShadow =
    patternToShadow(
      TEACHER_EMOTES[type],
      EMOTE_PALETTE,
      4
    );

  el.teacherEmote.classList.add(type);

  el.teacher.dataset.emotion = type;
}


/* ============================================================
   25. ORIGINAL THREE-STATE TEACHER MACHINE
   ============================================================ */

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
      "SAFE — The teacher faces the board. Collect items!";

    setTeacherFace("back");

  } else if (state.teacherState === "warning") {
    el.teacher.classList.add("warning");
    el.status.classList.add("warning");

    el.status.textContent =
      "WARNING — The teacher is about to turn around!";

    setTeacherFace("warning");

  } else {
    el.teacher.classList.add("watching");
    el.status.classList.add("danger");

    el.status.textContent =
      "DANGER — The teacher is watching. Don't tap!";

    setTeacherFace(
      state.checkHadViolation
        ? "angry"
        : "happy"
    );
  }
}

function advanceTeacher() {
  /* SAFE -> WARNING */

  if (state.teacherState === "safe") {
    clearTeacherEmotion();

    state.teacherState = "warning";

    state.teacherTimeLeft = random(
      CONFIG.warningMin,
      CONFIG.warningMax
    );

    clearReaction();

    setStudentState(
      "state-warning",
      "warning"
    );

    feedback(
      "The teacher is turning around! Hide your treats!"
    );

    playSound(350);

  } else if (state.teacherState === "warning") {
    /* WARNING -> DANGER */

    clearTeacherEmotion();

    state.teacherState = "watching";

    state.teacherTimeLeft = random(
      CONFIG.watchingMin,
      CONFIG.watchingMax
    );

    state.checkHadViolation = false;

    setStudentState(
      "state-danger",
      "danger"
    );

    showTeacherEmotion("happy");

    feedback(
      "The teacher is checking the classroom. Stay still!"
    );

    playSound(850, 0.15);

  } else {
    /* DANGER -> SAFE */

    const wasCaught =
      state.checkHadViolation;

    clearTeacherEmotion();

    state.teacherState = "safe";

    state.teacherTimeLeft = random(
      CONFIG.safeMin,
      CONFIG.safeMax
    );

    state.checkHadViolation = false;

    clearReaction();

    feedback(
      wasCaught
        ? "The teacher turned back. Be more careful!"
        : "Inspection passed! The teacher looks pleased."
    );
  }

  updateTeacherAppearance();

  if (
    state.teacherState === "safe" &&
    playing()
  ) {
    updateStudentIdle();
  }
}

function updateTeacher(delta) {
  state.teacherTimeLeft -= delta;

  while (state.teacherTimeLeft <= 0) {
    const overflow =
      -state.teacherTimeLeft;

    advanceTeacher();

    state.teacherTimeLeft -= overflow;
  }
}


/* ============================================================
   26. ORIGINAL ITEM SPAWNING
   Seven items, equal probability
   ============================================================ */

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

  const index =
    Math.floor(Math.random() * ITEMS.length);

  const item = ITEMS[index];

  state.activeItem = item;
  state.itemTimeLeft = CONFIG.itemLifetime;

  const sprite = makePixelElement(
    item.id,
    "pixel-item",
    4
  );

  sprite.style.left = "12px";
  sprite.style.top = "5px";

  el.itemIcon.replaceChildren(sprite);

  const positions = [
    { left: 28, bottom: 31 },
    { left: 39, bottom: 38 },
    { left: 53, bottom: 31 },
    { left: 66, bottom: 38 }
  ];

  const position =
    positions[
      Math.floor(
        Math.random() * positions.length
      )
    ];

  el.collectible.style.left =
    position.left + "%";

  el.collectible.style.bottom =
    position.bottom + "%";

  el.collectible.setAttribute(
    "aria-label",
    "Collect " + item.name
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


/* ============================================================
   27. STUDENT POSITION FOR INTERACTION EFFECTS
   ============================================================ */

function getStudentPosition() {
  const sceneRect =
    el.scene.getBoundingClientRect();

  const pigRect =
    el.student.getBoundingClientRect();

  return {
    x: pigRect.left - sceneRect.left + 72,
    y: pigRect.top - sceneRect.top + 88
  };
}


/* ============================================================
   28. REACTION CLEANUP
   ============================================================ */

function clearReaction() {
  reactionTimeLeft = 0;
  reactionFace = null;

  el.layer.replaceChildren();

  delete el.layer.dataset.item;

  if (playing()) {
    updateStudentIdle();
  }
}


/* ============================================================
   29. PIXEL FOREGROUND EFFECT HELPERS
   ============================================================ */

function addForegroundItem(name, x, y) {
  const item = makePixelElement(
    name,
    "foreground-prop",
    4
  );

  item.style.left = x + "px";
  item.style.top = y + "px";

  el.layer.appendChild(item);

  return item;
}

function createCrumbs(x, y, count = 9) {
  for (let i = 0; i < count; i++) {
    const crumb = document.createElement("span");

    crumb.className = "pixel-crumb";

    crumb.style.left =
      x + random(-8, 8) + "px";

    crumb.style.top =
      y + random(-8, 8) + "px";

    crumb.style.setProperty(
      "--dx",
      random(-55, 55) + "px"
    );

    crumb.style.setProperty(
      "--dy",
      random(-42, 50) + "px"
    );

    el.layer.appendChild(crumb);
  }
}

function createTwinkles(x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement("span");

    star.className = "pixel-twinkle";

    const angle =
      i * Math.PI * 2 / count;

    const radius = random(30, 75);

    star.style.left =
      x + Math.cos(angle) * radius + "px";

    star.style.top =
      y + Math.sin(angle) * radius + "px";

    star.style.animationDelay =
      random(0, 0.3) + "s";

    el.layer.appendChild(star);
  }
}

function addDecoration(symbol, x, y) {
  const decoration =
    document.createElement("span");

  decoration.className =
    "foreground-sparkle";

  decoration.textContent = symbol;

  decoration.style.left = x + "px";
  decoration.style.top = y + "px";

  el.layer.appendChild(decoration);
}


/* ============================================================
   30. V2.5 Update
   SEVEN DIFFERENT ITEM ANIMATIONS
   ============================================================ */

function playItemReaction(item) {
  clearReaction();

  const { x, y } = getStudentPosition();

  el.layer.dataset.item = item.id;

  setStudentState(
    item.animation,
    item.expression
  );

  /* CARROT */

  if (item.id === "carrot") {
    addForegroundItem(
      "carrot",
      x + 20,
      y
    );

    addDecoration("♥", x - 30, y - 45);
  }

  /* COOKIE */

  if (item.id === "cookie") {
    addForegroundItem(
      "cookie",
      x + 20,
      y
    );

    createCrumbs(x + 20, y + 5);
  }

  /* DOODLE */

  if (item.id === "doodle") {
    const paper =
      document.createElement("div");

    paper.className =
      "foreground-doodle-paper";

    const sceneRect =
      el.scene.getBoundingClientRect();

    const deskRect =
      document.querySelector(".desk")
        .getBoundingClientRect();

    const px = Math.min(
      x + 65,
      sceneRect.width - 85
    );

    const py = Math.min(
      y + 35,
      deskRect.top - sceneRect.top + 45
    );

    paper.style.left = px + "px";
    paper.style.top = py + "px";

    const flower = makePixelElement(
      "flower",
      "pixel-item",
      4
    );

    flower.style.left = "10px";
    flower.style.top = "8px";

    paper.appendChild(flower);
    el.layer.appendChild(paper);

    addForegroundItem(
      "doodle",
      px - 20,
      py - 20
    );
  }

  /* STAR */

  if (item.id === "star") {
    addForegroundItem(
      "star",
      x,
      y - 45
    );

    createTwinkles(x, y - 30);
  }

  /* CAKE */

  if (item.id === "cake") {
    addForegroundItem(
      "cake",
      x + 20,
      y
    );

    createCrumbs(x + 18, y + 10, 5);

    addDecoration("♥", x + 15, y - 40);
  }

  /* RICE BALL */

  if (item.id === "riceball") {
    addForegroundItem(
      "riceball",
      x + 18,
      y
    );

    createCrumbs(x + 12, y + 8, 4);
  }

  /* ORANGE JUICE */

  if (item.id === "juice") {
    addForegroundItem(
      "juice",
      x + 23,
      y
    );

    createTwinkles(
      x + 20,
      y - 20,
      4
    );
  }

  reactionFace = item.expression;
  reactionTimeLeft = item.duration;

  showEffect("+1");
}


/* ============================================================
   31. ORIGINAL SCORING AND CAUGHT LOGIC
   ============================================================ */

function collectItem() {
  if (
    !playing() ||
    rulesOpen ||
    !state.activeItem
  ) {
    return;
  }

  const item = state.activeItem;

  /* Prevent multiple clicks on one item */

  hideItem();
  scheduleItem();

  /* DANGER */

  if (state.teacherState === "watching") {
    state.caught += 1;
    state.checkHadViolation = true;

    clearReaction();

    setStudentState(
      "scared",
      "caught"
    );

    showTeacherEmotion("angry");

    showEffect("!");
    playSound(170, 0.25);

    feedback(
      `Caught! ${state.caught}/${CONFIG.maxCaught} warnings.`
    );

    updateHUD();

    if (state.caught >= CONFIG.maxCaught) {
      finishGame(
        false,
        "The teacher caught you three times!"
      );
    } else {
      reactionTimeLeft = 600;
    }

    return;
  }

  /* WARNING */

  if (state.teacherState === "warning") {
    clearReaction();

    setStudentState(
      "gp-hide",
      "warning"
    );

    showEffect("!");
    playSound(300);

    feedback(
      "Too risky! No point awarded."
    );

    reactionTimeLeft = 400;

    return;
  }

  /* SAFE */

  state.score += item.points;
  state.collectedCount += 1;

  playItemReaction(item);
  playSound(item.sound);

  updateHUD();

  feedback(
    `${item.message} Score: ${state.score}/${CONFIG.targetScore}.`
  );
}


/* ============================================================
   32. V2.5 Update
   PIXEL SETTLEMENT STICKERS
   ============================================================ */

const RESULT_ART = {

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

  party: [
    ".......BB...",
    "......BBBB..",
    ".....KYYK...",
    "....KYYYYK..",
    "...KYYYYYYK.",
    "..KPPPPPPPPK",
    ".KKKKKKKKKKK",
    "........R...",
    "....G......."
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
    "...BB...",
    "..BBBB..",
    ".BBBBBB.",
    "BBBBBBBB",
    ".BBBBBB.",
    "..BBBB.."
  ],

  exclamation: [
    "..KK..",
    "..KK..",
    "..KK..",
    "..KK..",
    "......",
    "..KK..",
    "..KK.."
  ]
};

const RESULT_COLORS = {
  K: "#4e3b41",
  W: "#fff9ec",
  Y: "#ffdc68",
  R: "#e66d84",
  G: "#79c491",
  P: "#db99d0",
  V: "#9277c8",
  B: "#88c7e1",
  X: "#9899a1"
};


/* ============================================================
   33. V2.5 Update
   CREATE FALLING PIXEL STICKERS

   Stickers stay at the landing position.
   ============================================================ */

function createResultSticker(type, won, delay) {
  const sticker =
    document.createElement("div");

  sticker.className = "result-sticker";

  const rows =
    type === "star"
      ? PIXEL_ART.star
      : RESULT_ART[type];

  const palette =
    type === "star"
      ? ITEM_COLORS
      : RESULT_COLORS;

  const size = random(0, 1) < 0.5 ? 4 : 5;

  sticker.style.boxShadow =
    patternToShadow(rows, palette, size);

  const sceneWidth = el.scene.clientWidth;
  const sceneHeight = el.scene.clientHeight;

  const artWidth =
    Math.max(...rows.map(row => row.length)) *
    size;

  const artHeight = rows.length * size;

  const startX = random(
    5,
    Math.max(6, sceneWidth - artWidth - 5)
  );

  const drift = random(-24, 24);

  const landingX = Math.max(
    5,
    Math.min(
      sceneWidth - artWidth - 5,
      startX + drift
    )
  );

  const landingY =
    sceneHeight - artHeight - random(7, 30);

  /*
    CSS starts each particle at top: -65px.
    Therefore the animation distance to the
    final landing position is landingY + 65.
  */

  sticker.style.setProperty(
    "--x",
    startX + "px"
  );

  sticker.style.setProperty(
    "--drift",
    (landingX - startX) + "px"
  );

  sticker.style.setProperty(
    "--distance",
    (landingY + 65) + "px"
  );

  sticker.style.setProperty(
    "--fall-time",
    random(
      won ? 2.2 : 3.0,
      won ? 3.1 : 4.0
    ) + "s"
  );

  sticker.style.setProperty(
    "--delay",
    delay + "s"
  );

  sticker.style.setProperty(
    "--rotation",
    random(-30, 30) + "deg"
  );

  el.particles.appendChild(sticker);
}


/* ============================================================
   34. V2.5 Update
   WIN / LOSE PARTICLE EFFECTS
   ============================================================ */

function startSettlementParticles(won) {
  el.particles.replaceChildren();

  el.particles.classList.remove("is-paused");
  el.scene.classList.remove("settlement-paused");

  const types = won
    ? [
        "star",
        "balloon",
        "party",
        "smile",
        "bubble"
      ]
    : [
        "sadStar",
        "tear",
        "exclamation"
      ];

  const count = 28;

  for (let i = 0; i < count; i++) {
    const type =
      types[Math.floor(Math.random() * types.length)];

    const delay = random(0, 0.85);

    createResultSticker(
      type,
      won,
      delay
    );
  }
}

function clearSettlement() {
  settlementToken += 1;

  settlementTimeouts.forEach(clearTimeout);
  settlementTimeouts = [];

  resultPaused = false;

  el.particles.replaceChildren();

  el.particles.classList.remove(
    "is-paused"
  );

  el.scene.classList.remove(
    "settlement-paused"
  );

  el.resultIcon.className = "result-icon";
  el.resultIcon.style.boxShadow = "";

  stopSettlementMusic();
}


/* ============================================================
   35. V2.5 Update
   RESULT CARD ICON
   ============================================================ */

function updateResultIcon(won) {
  el.resultIcon.className =
    "result-icon " + (won ? "win" : "lose");

  el.resultIcon.style.boxShadow =
    patternToShadow(
      won
        ? PIXEL_ART.star
        : RESULT_ART.tear,

      won
        ? ITEM_COLORS
        : RESULT_COLORS,

      5
    );
}


/* ============================================================
   36. V2.5 Update
   SETTLEMENT PAUSE / RESUME
   ============================================================ */

function pauseSettlement() {
  if (
    state.mode !== "finished" ||
    resultPaused
  ) {
    return;
  }

  resultPaused = true;

  el.particles.classList.add(
    "is-paused"
  );

  stopSettlementMusic();
  suspendAudio();

  updateControlButtons();
}

function resumeSettlement() {
  if (
    state.mode !== "finished" ||
    !resultPaused ||
    rulesOpen
  ) {
    return;
  }

  resultPaused = false;

  el.particles.classList.remove(
    "is-paused"
  );

  resumeAudio();

  if (soundEnabled) {
    startSettlementMusic(settlementWon);
  }

  updateControlButtons();
}


/* ============================================================
   37. ORIGINAL TIMER
   ============================================================ */

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function gameTick() {
  if (
    !playing() ||
    rulesOpen
  ) {
    return;
  }

  const now = performance.now();

  const delta = Math.max(
    0,
    now - lastTick
  );

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
        ? "You made it to the end of class!"
        : "Class is over, but you needed more points!"
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

  timerId = setInterval(
    gameTick,
    CONFIG.tickRate
  );
}


/* ============================================================
   38. START GAME
   ============================================================ */

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

  el.game.classList.remove("game-paused");

  el.pauseButton.disabled = false;

  updateTeacherAppearance();
  updateStudentIdle();

  scheduleItem();

  unlockAudio();

  startTimer();
  startBackgroundMusic();
  startBlinking();

  updateControlButtons();

  feedback(
    "The game has started! Collect items when it is safe."
  );

  playSound(700);
}


/* ============================================================
   39. PAUSE GAME
   ============================================================ */

function pauseGame() {
  if (!playing()) return;

  state.mode = "paused";

  stopTimer();
  stopBackgroundMusic();
  stopBlinking();

  el.game.classList.add("game-paused");

  el.collectible.hidden = true;
  el.collectible.disabled = true;

  suspendAudio();

  showOverlay(
    "PAUSED",
    "Your game is paused.",
    "CONTINUE"
  );

  feedback("Game paused.");

  updateControlButtons();
}


/* ============================================================
   40. RESUME GAME
   ============================================================ */

function resumeGame() {
  if (
    state.mode !== "paused" ||
    rulesOpen
  ) {
    return;
  }

  state.mode = "playing";

  hideOverlay();

  el.game.classList.remove(
    "game-paused"
  );

  if (state.activeItem) {
    el.collectible.hidden = false;
    el.collectible.disabled = false;
  }

  resumeAudio();

  startTimer();
  startBackgroundMusic();
  startBlinking();

  updateControlButtons();

  feedback("Game resumed!");
}


/* ============================================================
   41. WIN / LOSE
   ============================================================ */

function finishGame(won, reason) {
  if (state.mode === "finished") return;

  state.mode = "finished";

  stopTimer();
  stopBackgroundMusic();
  stopBlinking();

  hideItem();

  clearReaction();
  clearTeacherEmotion();

  stopActiveTones();

  setStudentState(
    won ? "state-win" : "state-lose",
    won ? "win" : "lose"
  );

  el.game.classList.remove(
    "game-paused"
  );

  const summary =
    `${reason}\n` +
    `Final score: ${state.score}\n` +
    `Items collected: ${state.collectedCount}\n` +
    `Times caught: ${state.caught}`;

  showOverlay(
    won ? "YOU WIN!" : "GAME OVER",
    summary,
    won ? "PLAY AGAIN" : "TRY AGAIN"
  );

  updateHUD();

  feedback(
    won
      ? "Congratulations! What a brilliant daydream!"
      : "Better luck next time, little guinea pig!"
  );

  updateResultIcon(won);

  startSettlementParticles(won);

  el.pauseButton.disabled = false;

  startSettlementMusic(won);

  updateControlButtons();
}


/* ============================================================
   42. RESET GAME
   ============================================================ */

function resetGame() {
  stopTimer();
  stopBackgroundMusic();
  stopSettlementMusic();
  stopBlinking();

  stopActiveTones();

  clearSettlement();

  state = initialState();

  reactionTimeLeft = 0;
  reactionFace = null;

  el.layer.replaceChildren();
  delete el.layer.dataset.item;

  hideItem();

  el.effect.classList.remove("pop");
  el.effect.textContent = "";

  clearTeacherEmotion();

  setStudentState(
    "state-safe",
    "normal"
  );

  el.student.classList.add("normal");

  updateTeacherAppearance();

  el.game.classList.remove(
    "game-paused"
  );

  el.pauseButton.disabled = true;

  updateHUD();
  hideOverlay();
  updateControlButtons();

  feedback(
    "Ready to play! Press START GAME."
  );
}


/* ============================================================
   43. RULES MODAL
   ============================================================ */

function setRulesVisibility(visible) {
  rulesOpen = visible;
  el.rulesOverlay.hidden = !visible;
}

function openRules() {
  if (rulesOpen) return;

  rulesPreviousFocus =
    document.activeElement;

  rulesReturnMode = state.mode;

  if (playing()) {
    pauseGame();
  }

  if (
    state.mode === "finished" &&
    !resultPaused
  ) {
    pauseSettlement();
  }

  setRulesVisibility(true);

  const initial =
    rulesReturnMode === "ready";

  el.rulesStartButton.hidden = !initial;
  el.rulesCloseButton.hidden = initial;

  if (initial) {
    el.rulesStartButton.focus();
  } else {
    el.rulesCloseButton.focus();
  }
}

function closeRules() {
  if (!rulesOpen) return;

  const previousMode =
    rulesReturnMode;

  setRulesVisibility(false);

  rulesReturnMode = "ready";

  if (
    previousMode === "playing" &&
    state.mode === "paused"
  ) {
    resumeGame();
  }

  if (
    previousMode === "finished" &&
    resultPaused
  ) {
    resumeSettlement();
  }

  if (
    rulesPreviousFocus &&
    typeof rulesPreviousFocus.focus === "function"
  ) {
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
  rulesPreviousFocus = null;

  /* Audio must be unlocked by a real user click */

  unlockAudio();

  startGame();
}

function restartToRules() {
  resetGame();

  rulesReturnMode = "ready";
  rulesPreviousFocus = null;

  setRulesVisibility(true);

  el.rulesStartButton.hidden = false;
  el.rulesCloseButton.hidden = true;

  el.rulesStartButton.focus();
}


/* ============================================================
   44. V2.5 Update
   KEYBOARD FOCUS MANAGEMENT
   ============================================================ */

function trapRulesFocus(event) {
  if (
    !rulesOpen ||
    event.key !== "Tab"
  ) {
    return;
  }

  const target =
    rulesReturnMode === "ready"
      ? el.rulesStartButton
      : el.rulesCloseButton;

  event.preventDefault();
  target.focus();
}


/* ============================================================
   45. RULES EVENTS
   ============================================================ */

el.rulesButton.addEventListener(
  "click",
  openRules
);

el.rulesStartButton.addEventListener(
  "click",
  startFromRules
);

el.rulesCloseButton.addEventListener(
  "click",
  closeRules
);


/* ============================================================
   46. COLLECTIBLE EVENT

   On mobile, the click event also handles touch
   without generating duplicate scoring.
   ============================================================ */

el.collectible.addEventListener(
  "click",
  collectItem
);


/* ============================================================
   47. PAUSE / RESUME / RESULT OVERLAY EVENTS
   ============================================================ */

el.startButton.addEventListener(
  "click",
  () => {
    if (rulesOpen) return;

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
    if (rulesOpen) return;

    if (playing()) {
      pauseGame();

    } else if (state.mode === "paused") {
      resumeGame();

    } else if (state.mode === "finished") {
      if (resultPaused) {
        resumeSettlement();
      } else {
        pauseSettlement();
      }
    }
  }
);


/* ============================================================
   48. RESTART EVENT
   ============================================================ */

el.resetButton.addEventListener(
  "click",
  () => {
    if (rulesOpen) return;

    restartToRules();
  }
);


/* ============================================================
   49. SOUND TOGGLE
   ============================================================ */

el.soundButton.addEventListener(
  "click",
  () => {
    if (rulesOpen) return;

    soundEnabled = !soundEnabled;

    if (!soundEnabled) {
      stopBackgroundMusic();
      stopSettlementMusic();
      stopActiveTones();

      suspendAudio();

    } else {
      unlockAudio();

      if (playing()) {
        startBackgroundMusic();

      } else if (
        state.mode === "finished" &&
        !resultPaused
      ) {
        startSettlementMusic(settlementWon);
      }
    }

    updateControlButtons();
  }
);


/* ============================================================
   50. KEYBOARD EVENTS
   ============================================================ */

document.addEventListener(
  "keydown",
  event => {
    trapRulesFocus(event);

    if (rulesOpen) {
      if (
        event.key === "Escape" &&
        rulesReturnMode !== "ready"
      ) {
        event.preventDefault();
        closeRules();
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

      } else if (state.mode === "finished") {
        if (resultPaused) {
          resumeSettlement();
        } else {
          pauseSettlement();
        }
      }
    }
  }
);


/* ============================================================
   51. AUTOMATIC PAUSE
   When switching tabs or apps
   ============================================================ */

document.addEventListener(
  "visibilitychange",
  () => {
    if (!document.hidden) return;

    if (playing()) {
      pauseGame();
    }

    if (
      state.mode === "finished" &&
      !resultPaused
    ) {
      pauseSettlement();
    }
  }
);

window.addEventListener(
  "blur",
  () => {
    if (playing()) {
      pauseGame();
    }

    if (
      state.mode === "finished" &&
      !resultPaused
    ) {
      pauseSettlement();
    }
  }
);


/* ============================================================
   52. TOUCH SUPPORT
   V2.5 Update

   Native click supports touch screens.
   touch-action: manipulation in CSS prevents delays.
   ============================================================ */

document.addEventListener(
  "touchstart",
  () => {},
  { passive: true }
);


/* ============================================================
   53. INITIALIZATION
   ============================================================ */

function initializeGame() {
  updateResponsiveStage();

  resetGame();

  rulesReturnMode = "ready";
  rulesPreviousFocus = null;

  setRulesVisibility(true);

  el.rulesStartButton.hidden = false;
  el.rulesCloseButton.hidden = true;

  el.rulesStartButton.focus();
}

initializeGame();


/* ============================================================
   END OF CLASSROOM DAYDREAM V2.5
   COMPLETE SCRIPT.JS
   ============================================================ */
