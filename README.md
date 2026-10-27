
# Classroom Daydream — V2.1 Development

### A Guinea Pig Classroom Interactive Game

> **Release status (27 October 2026):** The published GitHub Pages site may still reflect the earlier game implementation. The V2.1 pixel-item interaction prototype has been previewed locally, but the latest local `index.html`, `style.css`, and `script.js` must be committed and pushed before this documentation can describe the live game as updated.

**Course:** SD5913 – Programming for Art & Design  
**Assignment:** Assignment 3 – An Interactive Experience  
**Project Type:** Individual Interactive Browser Game

---

## 1. Project Overview

Classroom Daydream is a small interactive browser game
about a guinea pig student who wants to enjoy little
distractions during class without being caught by
the teacher.

The experience explores the relationship between
observation, timing, risk, and playful decision-making.

The player must collect objects while the teacher is
facing the blackboard and stop interacting when
the teacher turns around.

The game combines two familiar mechanics:

- Red Light, Green Light: observe the teacher and
  act only when it is safe.
- Whac-A-Mole: respond to randomly appearing
  collectible objects.

The project was developed as an individual interactive
experience for SD5913 Assignment 3.

---

## 2. Intended Users

The game is designed for students and casual players
who enjoy short, accessible, and playful experiences.

No previous gaming experience is required.

The experience is intended to be understandable
through visual cues, simple mouse or touch
interactions, and immediate feedback.

---

## 3. Play Online

Live game:

https://yanyan-hub57.github.io/classroom-daydream/

Source code:

https://github.com/YANYAN-hub57/classroom-daydream

---

## 4. How to Play

### Objective

Survive a 60-second classroom session while
collecting at least 8 points.

The player loses immediately if caught by
the teacher 3 times.

### Teacher States

GREEN – SAFE

The teacher is facing the blackboard.

Click the collectible objects to earn points.

YELLOW – WARNING

The teacher is about to turn around.

Stop clicking and prepare to wait.

RED – DANGER

The teacher is watching the classroom.

Clicking an object will increase the caught counter.

### Collectible Objects

Random objects appear in the classroom:

- Carrot
- Cookie
- Doodle
- Star

Each successfully collected object gives 1 point.

Objects disappear after a short period.

The same object cannot be collected repeatedly
after it has already been clicked.

### Winning

Reach at least 8 points and survive until
the 60-second timer reaches zero.

### Losing

Getting caught 3 times ends the game immediately.

If the timer ends before the player reaches
8 points, the game also ends in failure.

---

## 5. Main Interaction

The project is based on an input-response-feedback loop.

### Input

The player observes the teacher and deliberately
clicks a collectible object.

### Response

JavaScript checks the teacher's current state.

If the teacher is facing away, the player earns a point.

If the teacher is about to turn around, no point is earned.

If the teacher is watching, the caught counter increases.

### Feedback

The game communicates the result through:

- Score and caught counters
- Teacher status colours
- Character animations
- Visual effects
- Sound effects
- Text messages
- Win and loss screens

The player uses this feedback to decide
whether to act or wait.

---

## 6. Game Controls

- Start Game: begins the 60-second session.
- Click Object: attempts to collect the object.
- Pause: freezes the game state and timer.
- Resume: continues the paused game.
- Sound On/Off: enables or disables audio effects.
- Restart: resets the game to its initial state.

The game supports mouse and touch input.

Keyboard users can navigate the buttons using Tab
and activate focused buttons using Enter or Space.

---

## 7. Run Locally

### Requirements

- A modern web browser
- Python 3, if using the local server method

The game uses plain HTML, CSS, and JavaScript.

No external JavaScript packages, paid services,
API keys, or machine learning models are required.

### Instructions

Clone the repository:

```bash
git clone https://github.com/YANYAN-hub57/classroom-daydream.git
```

Enter the project directory:

```bash
cd classroom-daydream
```

Start a local server:

```bash
python3 -m http.server 8001
```

Open the following address:

http://localhost:8001

To stop the server, press Ctrl+C in the terminal.

If port 8001 is already occupied, use another
available port, such as 8002.

---

## 8. Project Structure

```text
classroom-daydream/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── screenshot.png
│   ├── teacher-warning.png
│   ├── teacher-look back.png
│   ├── game-result.png
│   └── game-result（failure）.png
├── README.md
└── PROCESS.md
```

### File Descriptions

- index.html: interface and classroom scene structure
- style.css: visual design, characters, and animations
- script.js: game state, timing, interactions, and audio
- assets/: screenshots documenting the experience
- README.md: project description and running instructions
- PROCESS.md: design decisions and user testing

---

## 9. Screenshots

### Main Game Screen

![Classroom Daydream](assets/screenshot.png)

### Teacher Warning State

![Teacher Warning](assets/teacher-warning.png)

### Teacher Observation Scene

![Teacher State](<assets/teacher-look back.png>)

### Game Result

![Game Result](assets/game-result.png)

### Failure Screen

![Game Failure](<assets/game-result（failure）.png>)

---

## 10. Design Features

### Guinea Pig Character

The student character was redesigned as a guinea pig
in response to user feedback.

This character gives the experience a playful
and recognisable visual identity.

### Teacher Observation

The teacher changes between safe, warning,
and watching states.

These changes make timing an essential part
of the interaction.

### Random Collectibles

Objects appear in different positions and disappear
after a short period.

The player must observe and respond rather
than repeatedly click a fixed button.

### Audio and Visual Feedback

Successful collection, warnings, and failure
produce different feedback.

The game remains playable when audio is unavailable.

---

## 11. Error and Interruption Handling

The program handles several common situations:

- A collected item is immediately removed,
  preventing repeated scoring.
- Clicking while the game is paused or finished
  cannot collect objects.
- The timer is stopped before a new one is started.
- The game pauses when the browser tab becomes hidden.
- The game continues when audio is unsupported.
- Restart returns the game to its initial state.

---

## 12. Known Limitations

- The game is designed for one player.
- Progress is not saved after refreshing the browser.
- Collectible icons are displayed using emoji,
  which can look different across operating systems.
- The guinea pig character uses CSS shapes
  rather than an external sprite sheet.
- The experience depends on browser JavaScript support.
- The current game has one level and a fixed
  60-second duration.

---

## 13. Development and Iteration

Version 1.0 used mood and risk values to determine
the result of repeated classroom actions.

User testing revealed problems with the game balance
and visual consistency.

Version 2.0 introduced:

- A 60-second classroom challenge
- Random collectible objects
- Three teacher observation states
- A caught counter
- A guinea pig student character
- Updated visual and audio feedback

The development and user testing process
is documented in PROCESS.md.

---

## 14. Credits

**Concept and game direction:** Project author

**Design and implementation:** Project author,
with AI-assisted coding and design support

**AI tool:** ChatGPT, used for code drafting,
debugging guidance, game mechanics, documentation,
and design exploration

**Artwork:** CSS-created classroom and character
elements, with system emoji used for collectible icons

**Sound effects:** Generated programmatically
using the browser Web Audio API

**User testing:** Four volunteer participants
identified anonymously as A, B, C, and D

No externally hosted API or paid asset service
is required to run the game.

Additional borrowed materials, if added later,
will be credited with their original source
and relevant permissions.

---

## 15. Reflection

Classroom Daydream demonstrates how a small
interactive experience can create meaningful
player decisions through timing and feedback.

The most important improvement from Version 1.0
to Version 2.0 was replacing repetitive clicking
with a clearer relationship between observation,
action, consequence, and the next decision.

The project prioritises a complete and understandable
interaction loop over unnecessary technical complexity.


---

## 16. V2.1 — Expressive Pixel Interaction (Local Prototype)

**Status:** Local visual prototype shown in a development screenshot on 27 October 2026; **the matching local game files are not yet confirmed as pushed to the default GitHub branch**. The documented behaviours below describe the implemented *local design iteration*, not independently verified features of the currently published Pages build.

Following the V2.0 retest, the next iteration focuses on making each collectible produce a distinct, visible character response instead of merely incrementing the score.

### Design changes

| Item | Intended and locally implemented feedback |
| --- | --- |
| Carrot | Pixel-art carrot without a surrounding box; moves toward the guinea pig's mouth, followed by alternating puffed cheeks and chewing |
| Cookie | Pixel-art cookie without a surrounding box; travels toward the mouth, produces crumbs, and makes the guinea pig sway with happy closed eyes |
| Doodle | Pixel pencil and foreground paper; pencil movement gradually reveals a small flower drawing |
| Star | Pixel star and sparkles; guinea pig jumps to celebrate |

The local prototype also introduces an independent foreground interaction layer (`#interaction-layer`) with a higher stacking order than the desk. This addresses the previous problem of food, pencil and sparkles being hidden behind the desk.

### Design rationale

The **input → response → feedback** loop is now deliberately object-specific:

1. **Input:** The player chooses an item during a safe teacher state.
2. **Response:** JavaScript awards a point and triggers that item's corresponding visual sequence.
3. **Feedback:** The item moves, the character's face/body reacts, sound plays, and the score/message updates.
4. **Next decision:** The player checks the teacher's changing safe / warning / danger state before clicking again.

### Evidence and verification

The development screenshot from 27 October 2026 shows a visible tricolour guinea pig and an unboxed pixel cookie in the classroom. A still screenshot **does not establish** that all animations, mobile layouts, pause handling and win/loss states have passed an end-to-end test. Those checks are part of the release checklist.

### Before publishing this version

- Commit and push the **latest local** `index.html`, `style.css`, and `script.js`.
- Take a new screenshot of the V2.1 pixel item build, and add it to `assets/`.
- Test each item, all teacher states, pause/resume/restart, and the 60-second ending.
- Verify the Pages deployment before calling V2.1 publicly released.

The original emoji limitation in Section 12 describes the **previous published implementation**; the local V2.1 prototype replaces those emoji collectibles with programmatically generated transparent pixel sprites.
