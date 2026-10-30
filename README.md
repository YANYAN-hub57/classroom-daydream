# Classroom Daydream

**A Little Guinea Pig Adventure**

**Version:** 3.0  
**Course:** SD5913 — Programming for Art & Design  
**Programme:** MSc in Innovative Multimedia Entertainment, School of Design, The Hong Kong Polytechnic University  
**Project Type:** Individual Interactive Experience  
**Technologies:** HTML, CSS, JavaScript, Web Audio API

**Play the Game:** https://yanyan-hub57.github.io/classroom-daydream/

**GitHub Repository:** https://github.com/YANYAN-hub57/classroom-daydream

---

## 1. Project Overview

*Classroom Daydream* is a browser-based pixel-art mini-game inspired by the familiar experience of getting distracted during class.

The player controls a small guinea pig student who secretly collects snacks, draws pictures, and catches stars while the guinea pig teacher is facing the blackboard.

The challenge is simple: **collect enough points before class ends without getting caught too many times.**

The game combines two familiar gameplay ideas:

- **Red Light, Green Light:** Players must observe the teacher's changing states and decide when to act.
- **Whac-A-Mole:** Collectible items appear at different positions for a limited time, encouraging quick decisions and reactions.

The interaction is built around a clear **input → response → feedback** loop.

The project aims to transform an everyday classroom experience into a playful interactive world through pixel art, character animation, procedural sound, and responsive game mechanics.

---

## 2. Target Audience

The game is designed for:

- Students who can relate to daydreaming during class.
- Casual players who enjoy short, light-hearted mini-games.
- People interested in pixel-art games and expressive character animation.
- Players who prefer accessible browser-based interactions without installation.

Each round takes approximately 45–90 seconds, depending on the selected difficulty.

---

## 3. How to Play

### Objective

Collect enough points before the countdown reaches zero, while staying below the maximum number of times caught.

There are three difficulty levels:

| Setting | EASY | NORMAL | HARD |
|---|---|---|---|
| Duration | 90 seconds | 60 seconds | 45 seconds |
| Minimum score | 12 | 10 | 10 |
| Maximum times caught | 5 | 3 | 2 |
| SAFE duration | 4–6 seconds | 2.5–4 seconds | 1.5–2.5 seconds |
| WARNING duration | 1.2 seconds | 1 second | 0.8 seconds |
| DANGER duration | 1.5–2 seconds | 2–3 seconds | 2.5–3.5 seconds |
| Fake turn probability | 10% | 30% | 50% |
| Item spawn interval | 0.8 seconds | 1.2 seconds | 1.8 seconds |
| Item lifetime | 3.5 seconds | 2.5 seconds | 1.8 seconds |
| Maximum simultaneous items | 8 | 6 | 4 |

### Teacher States

**SAFE — Green**

The teacher is facing the blackboard. Players can collect items and earn points.

**WARNING — Yellow**

The teacher is preparing to turn around. Players should stop collecting. Normal item clicks during this state do not award points.

**DANGER — Red**

The teacher is watching the classroom. Collecting an item within the active detection area can result in being caught.

In HARD mode, a visible vision cone introduces spatial risk: some items may be outside the teacher's field of view.

### Winning and Losing

The player wins if:

1. The countdown reaches zero.
2. The required score has been achieved.
3. The number of times caught is below the selected difficulty's limit.

The player loses if:

- The maximum number of times caught is reached, or
- The countdown ends before the minimum score is achieved.

---

## 4. Collectible Items

Seven ordinary collectible items are available.

| Item | Base Points | Interaction |
|---|---:|---|
| Carrot | 1 | Puffy-cheek chewing |
| Rice Ball | 1 | Big-bite chewing and body movement |
| Cookie | 2 | Crunching, crumbs, and happy swaying |
| Cake | 2 | Happy eating, cream detail, and melody |
| Doodle | 2 | Pencil movement and a progressively drawn flower |
| Orange Juice | 2 | Drinking and gulping effects |
| Star | 3 | Jumping, sparkling, and metallic chime |

Items appear randomly and disappear after a limited time.

Their spawning probabilities are weighted:

- Carrot: 25%
- Rice Ball: 25%
- Cookie: 15%
- Cake: 12%
- Doodle: 10%
- Orange Juice: 10%
- Star: 3%

This creates different levels of reward and encourages players to make quick decisions about which items to collect.

### Special Items

V3.0 introduces four special items.

**Shield**

Provides five seconds of protection against ordinary DANGER-state collection penalties. It does not prevent a trap from triggering.

**Freeze**

Temporarily freezes the teacher state, game countdown, and collectible expiration timers for three seconds.

**Clear**

Automatically collects all ordinary items currently visible and adds their base points to the score without increasing the combo counter.

**Trap**

A misleading collectible that causes the player to be caught and breaks the current combo.

The EASY difficulty does not generate traps. Traps are more likely to appear at higher difficulty levels.

---

## 5. Combo and Scoring System

V3.0 introduces a combo mechanism to reward consecutive successful collections.

- **1–4 consecutive items:** No bonus.
- **5–9 consecutive items:** +1 bonus point per collection.
- **10 or more consecutive items:** +2 bonus points per collection.

A combo ends when the player gets caught, triggers a trap, or allows a normal item to expire.

Special items do not increase the combo.

The game also records the highest combo achieved during a round.

---

## 6. Additional Gameplay Mechanics

### Fake Teacher Turns

During WARNING, the teacher may occasionally make a fake turn and return directly to SAFE.

Fake turns use difficulty-dependent probability and distinct audio feedback.

The system prevents two consecutive fake turns.

### Dynamic Difficulty

Each round has three stages:

**Phase 1 — Beginning**

The game uses the selected difficulty's base parameters.

**Phase 2 — Middle**

Teacher turning frequency increases, while item duration and spawning intervals decrease.

**Phase 3 — Final**

The game becomes faster and more demanding, synchronized with the most intense background music stage.

### Progressive Caught Penalties

Getting caught triggers visual and audio feedback and temporarily prevents interaction.

Repeated mistakes increase the penalty, creating additional tension near the end of a round.

---

## 7. Visual Design

### Pixel-Art Direction

The game uses a warm retro classroom aesthetic inspired by classic pixel games.

Main visual elements include:

- Cream-coloured classroom walls.
- Dark green chalkboard.
- Warm wooden desks and flooring.
- Pixel-art windows and classroom decorations.
- Rounded guinea pig characters.
- Pixel buttons, speech bubbles, and animated collectibles.

### Guinea Pig Characters

The student guinea pig uses a rounded three-colour design with expressive eyes, soft cheeks, and small ears.

Available student appearances:

- Classic tricolour.
- Grey-brown duo.
- Cream.

Teacher appearances:

- Glasses.
- Beret.

Character expressions respond to changes in teacher state, item collection, success, and failure.

### Dynamic Classroom

Additional visual details include moving clouds, a classroom clock, an animated plant, and blackboard messages that change as the game progresses.

The game supports two colour themes:

- Classic Cream.
- Autumn Caramel.

### Victory and Defeat

At the end of each round, pixel-art elements fall into the classroom and remain near the floor.

Victory effects include stars, balloons, hearts, smiley faces, and confetti.

Defeat effects include grey stars, teardrops, exclamation marks, and clouds.

---

## 8. Sound Design

All game sounds are generated programmatically using the **Web Audio API**.

No external audio files are required.

The sound system includes:

- A looping 8-bit background melody.
- Faster musical pacing during later gameplay stages.
- Distinct sound effects for individual collectibles.
- Teacher-state warning sounds.
- Feedback when the player gets caught.
- Special-item sound effects.
- Victory and defeat melodies.
- Combo and achievement sounds.

The game also provides independent controls for background music and sound-effect volume.

Audio playback is initiated through user interaction to accommodate browser autoplay restrictions.

---

## 9. Interaction Design

The main interaction loop is:

**Input → Response → Feedback → Decision**

**Input**

The player clicks or taps a collectible item.

**Response**

The game checks the teacher's current state, item type, active buffs, and selected difficulty.

**Feedback**

The interface responds through:

- Score updates.
- Character expressions.
- Movement animations.
- Sound effects.
- Pixel speech bubbles.
- Floating score text.
- Teacher reactions.
- Combo and status indicators.

**Decision**

The player decides whether to continue collecting, wait for a safer moment, or use a special item.

This repeated loop forms the central interactive experience.

---

## 10. Controls

### Mouse and Touch

- Click or tap collectible items.
- Use the bottom buttons to pause, toggle sound, or restart.
- Open the question-mark button to view the rules.
- Open the settings button to customize the experience.

### Keyboard

| Key | Function |
|---|---|
| Space | Pause / Resume |
| R | Restart |
| M | Toggle Sound |
| H | Open Rules |
| Escape | Close a modal or pause |

### Accessibility and Responsive Behaviour

The interface includes keyboard-accessible controls, visible focus indicators, mobile touch support, and a landscape recommendation for smaller devices.

The game automatically pauses when the browser tab or application loses focus.

---

## 11. Settings and Local Data

V3.0 uses browser `localStorage` to save selected preferences and progress.

Saved information includes:

- Difficulty preference.
- Student and teacher appearances.
- Visual theme.
- Background music volume.
- Sound-effect volume.
- Vibration preference.
- Scene-effect preference.
- Personal best scores.
- Highest combo records.
- Unlocked achievements.

The game does not require a user account or backend server.

---

## 12. Achievements

V3.0 includes five achievements.

| Achievement | Requirement |
|---|---|
| Perfect Grade | Win without getting caught |
| Collector | Collect at least 20 items in one round |
| Combo Master | Reach a combo of 10 |
| Speedrunner | Win on HARD difficulty |
| Lucky Star | Collect 3 stars in one round |

Unlocked achievements are saved locally and displayed in the settings panel.

---

## 13. Technical Implementation

The project uses three core files:

**`index.html`**

Defines the page structure, game interface, buttons, overlays, difficulty options, and settings.

**`style.css`**

Controls the pixel-art classroom, layout, character animations, visual effects, and responsive behaviour.

**`script.js`**

Controls gameplay logic, teacher states, timers, item generation, scoring, sound synthesis, settings, achievements, and local records.

### Key Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- CSS `box-shadow` pixel drawing
- CSS keyframe animations
- Web Audio API
- Browser `localStorage`
- DOM events
- Responsive CSS media queries

The project does not use any JavaScript frameworks, external image files, hosted fonts, or third-party libraries.

---

## 14. Project Structure

```text
classroom-daydream/
├── index.html
├── style.css
├── script.js
├── README.md
└── PROCESS.md
```

All required game assets are implemented through code.

---

## 15. How to Run Locally

### Method 1 — Python Local Server

Open the project folder in Visual Studio Code.

Open the integrated Terminal and run:

```bash
python3 -m http.server 8010 --bind 127.0.0.1
```

Then visit:

http://localhost:8010/

### Method 2 — GitHub Pages

The project can be deployed as a static website using GitHub Pages.

Repository settings:

- Source: Deploy from a branch.
- Branch: `main`.
- Directory: `/ (root)`.

Published address:

https://yanyan-hub57.github.io/classroom-daydream/

The deployed version depends on the latest files pushed to the repository.

---

## 16. User Testing and Iteration

The game was developed through several iterations based on feedback from informal user testing.

### Early Testing

Testing identified problems involving score validation, limited character feedback, and insufficiently expressive visual presentation.

### Visual Improvements

The original character design was developed into a more recognizable guinea pig, with improved pixel styling, expressive faces, and more detailed classroom scenery.

### Interaction Improvements

Different collectibles were given distinct animations and sound effects.

Speech bubbles were added to make the teacher and student feel more responsive.

### Gameplay Improvements

V3.0 expands the original game with difficulty selection, weighted item scoring, special items, combo rewards, fake teacher turns, and local progress tracking.

The new V3.0 systems require additional regression testing to evaluate balance and stability across different browsers and devices.

For more details, see [PROCESS.md](PROCESS.md).

---

## 17. Testing Checklist

The following checks should be completed before the final submission:

- [ ] All three difficulty modes launch with the correct values.
- [ ] SAFE, WARNING, and DANGER transitions work correctly.
- [ ] Fake turns cannot occur twice consecutively.
- [ ] Ordinary collectible scores match their configured values.
- [ ] Shield, Freeze, Clear, and Trap work as intended.
- [ ] Combo bonuses and interruptions are calculated correctly.
- [ ] The doodle flower appears progressively.
- [ ] Item-specific sounds play correctly.
- [ ] Pause and resume preserve timers and temporary effects.
- [ ] Restart clears temporary gameplay state.
- [ ] Win and lose conditions work for each difficulty.
- [ ] Settings and achievements persist after reloading.
- [ ] The layout remains usable on desktop and mobile.
- [ ] GitHub Pages matches the tested local version.

---

## 18. Credits

**Concept, interaction design, visual direction, implementation, testing, and documentation:** Project author.

**AI-assisted development:** ChatGPT was used as a coding and design-support tool during the development process, including brainstorming, debugging support, code generation, documentation drafting, and iteration.

**Art and audio assets:** Pixel-art visuals are generated through CSS and JavaScript. Music and sound effects are synthesized using the Web Audio API.

**External dependencies:** None.

The project was developed for educational purposes as part of SD5913 Programming for Art & Design.

---

## 19. Future Improvements

Potential future development includes:

- More advanced balancing through additional playtesting.
- Improved mobile portrait support.
- More expressive character animations.
- Additional classroom events and environmental interactions.
- Expanded achievement and progression systems.
- Improved sound transitions and accessibility settings.
- Optional visual tutorials for first-time players.

---

## 20. Project Reflection

*Classroom Daydream* demonstrates how a relatively small browser game can create an engaging interactive experience through the combination of visual design, state-based programming, and feedback.

The project began as a simple interaction concept and gradually developed into a more complex game system.

The most important lesson was that meaningful interaction depends not only on functionality, but also on how clearly the system communicates changes to the player.

Through iteration, the project became an exploration of timing, risk, character expression, and the relationship between user action and system response.