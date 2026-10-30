# Classroom Daydream — Development Process

**Project:** Classroom Daydream
**Version:** 3.0
**Course:** SD5913 — Programming for Art & Design
**Project Type:** Individual Interactive Experience

---

## 1. Project Background

This project was developed as an interactive experience for the SD5913 Programming for Art & Design course.

The assignment focuses on designing a small working experience with a clear relationship between user input, system response, and feedback.

Rather than creating a complex game immediately, I began with a familiar everyday situation: **getting distracted during class**.

I wanted to explore how this simple experience could be transformed into a playful interaction using visual feedback, character animation, timing, and sound.

The project eventually developed into *Classroom Daydream*, a pixel-art browser game featuring a guinea pig student and teacher.

---

## 2. Initial Design Question

My initial design question was:

**How can an everyday classroom daydream become a small, playful, and meaningful interactive experience?**

I focused on three design goals:

1. Make the main interaction understandable without complicated instructions.
2. Give players immediate and expressive feedback after each action.
3. Create tension through timing and risk rather than complex controls.

I also wanted the game to feel humorous, warm, and visually approachable.

---

## 3. Early Concept Exploration

### Concept A — Classroom Daydream

The first concept was a pixel-art classroom where the player secretly interacted with objects while a teacher was distracted.

The initial idea focused on the contrast between being attentive in class and wanting to do something more interesting.

### Concept B — Virtual Crab Feeding

I also explored a small digital pet experience based on feeding and interacting with a pixel-art crab.

The player would click different objects, feed the pet, and observe different animations and sounds.

This concept helped me think about interaction feedback, but it offered less tension and decision-making than the classroom idea.

### Final Direction — Guinea Pig Classroom

I returned to the classroom concept and replaced the original characters with guinea pigs.

Guinea pigs have a rounded silhouette and expressive facial features that suit a warm pixel-art style.

I combined this character direction with a **Red Light, Green Light** mechanic.

The teacher turns between the blackboard and the classroom, while collectible objects appear for the player to click.

This created a clearer gameplay loop and a stronger relationship between player input and consequences.

---

## 4. Core Interaction Design

The main interaction is intentionally simple:

**Observe → Decide → Click → Receive Feedback**

The player observes the teacher's behaviour and chooses when to interact with a collectible.

The system checks the teacher's state and responds accordingly.

### SAFE

The player can collect items and increase the score.

### WARNING

The player receives a warning that the teacher is preparing to turn around.

### DANGER

The player risks getting caught when interacting with items.

This creates a repeated decision-making loop.

The player is not simply collecting objects as quickly as possible; they must also consider timing.

---

## 5. Early Prototype — V1.0

### Main Goal

Build a minimum working interactive experience.

### Main Components

- A classroom setting.
- A student character.
- A teacher character.
- A timed round.
- Clickable collectible objects.
- A basic score system.
- A teacher reaction mechanism.

### Main Challenge

The most important technical challenge was connecting the teacher's visual state with the gameplay result.

The game needed to distinguish between a safe collection and a risky action.

An early implementation did not handle this relationship correctly.

---

## 6. User Testing — First Round

I gathered feedback from four users during the earlier development stage.

### User A — Scoring Logic

**Feedback:** The game could result in a win regardless of how the user interacted.

**Problem identified:** The scoring and win-condition checks did not fully represent the intended rules.

**Design response:** I revised the score validation and the relationship between teacher state, successful collection, and failure.

### User B — Visual Quality

**Feedback:** The interface looked visually rough.

**Problem identified:** The early visual presentation lacked polish and a consistent style.

**Design response:** I improved the pixel-art layout, classroom colours, interface borders, and visual hierarchy.

### User C — Gameplay Variety

**Feedback:** A mechanic similar to Red Light, Green Light or Whac-A-Mole could make the experience more engaging.

**Design response:** I developed the teacher's three-state cycle and timed collectible system.

### User D — Character Identity

**Feedback:** Guinea pig characters could make the game more expressive.

**Design response:** I redesigned the student and teacher as pixel-art guinea pigs.

### Main Learning

The first testing round showed that a game must be understandable at both the technical and visual levels.

A visually attractive interaction is not sufficient if the outcome does not match the player's actions.

Likewise, a functioning interaction can still feel uninteresting if the feedback is too limited.

---

## 7. V2.0 — Gameplay Logic Correction

### Goals

- Fix incorrect scoring behaviour.
- Establish a reliable gameplay loop.
- Improve the connection between player action and outcome.

### Changes

- Revised the win/loss conditions.
- Improved teacher-state checks.
- Clarified safe and unsafe interactions.
- Updated the project documentation.
- Prepared the project for further user testing.

### Result

V2.0 established a more reliable foundation for later visual and interaction development.

---

## 8. V2.1 — Collectible Interaction Improvements

### Problem

The game initially offered limited differences between collectible interactions.

Repeated clicking could feel monotonous.

### Design Response

I developed separate reactions for four collectible types.

**Carrot**

The guinea pig's cheeks puff up during chewing.

**Cookie**

The character shakes happily while pixel crumbs appear.

**Doodle**

The character performs a drawing action, and a flower appears on the desk.

**Star**

The character jumps with a small sparkling effect.

### Technical Approach

The interaction was implemented using JavaScript state changes and CSS animations.

The visual effects were controlled through classes added and removed during gameplay.

### Learning

Different feedback for similar actions can make an interaction feel richer without significantly increasing the complexity of the controls.

---

## 9. V2.2 — Teacher Behaviour and Emotion

### Goal

Make the teacher feel like a character rather than a simple timing indicator.

### Changes

The teacher received additional visual states:

- Facing the blackboard.
- Turning around.
- Watching the classroom.
- Reacting happily after a successful inspection.
- Reacting angrily when catching the student.

The teacher's emotion was communicated through facial expression, body movement, and pixel symbols.

### Design Reasoning

The game needed to communicate danger clearly, but I wanted the teacher to remain visually cute rather than intimidating.

### Learning

Character animation can communicate rules while also contributing to storytelling.

---

## 10. V2.3 — Classroom Environment Redesign

### Problem

The earlier classroom lacked visual depth and a consistent environment.

### Changes

I redesigned the classroom around a warm retro pixel-art aesthetic.

Main elements included:

- Dark green chalkboard.
- Warm wooden flooring.
- Pixel-art window.
- Simplified classroom furniture.
- Layered desk elements.
- Consistent pixel borders.
- A clearer HUD and control area.

### Layout Requirement

I also focused on keeping the full game visible on one screen without vertical scrolling.

### Learning

Visual hierarchy is part of interaction design.

The player should be able to identify the timer, score, teacher state, and available actions quickly.

---

## 11. V2.4 — Expressive Characters, Controls, and Sound

A later feedback round focused on the clarity and expressiveness of the game.

### Control Buttons

The bottom text buttons were replaced with pixel-style icons for:

- Pause / Resume.
- Sound On / Off.
- Restart.

Small labels remained underneath the icons to support recognition.

### Guinea Pig Appearance

The characters were redesigned with a more rounded silhouette, softer colour transitions, and clearer facial features.

The student retained a multicolour appearance, while the teacher retained visual identity details such as glasses and a pointer.

### Student Expressions

Additional expressions were introduced for:

- SAFE.
- WARNING.
- DANGER.
- Successful collection.
- Being caught.
- Victory.
- Defeat.

### End-of-Game Feedback

I introduced victory and defeat particles, using pixel-art elements that fall across the classroom scene.

### Background Music

I developed a procedural 8-bit background melody using the Web Audio API.

The music becomes faster during the later stages of the round.

### Learning

Visual and audio feedback can make the same gameplay mechanics feel more alive and emotionally engaging.

---

## 12. V2.5 — Expanded Collectible System

### Goal

Increase interaction variety while keeping the original gameplay rules.

### Changes

Three new food items were added:

- Cake.
- Rice Ball.
- Orange Juice.

The complete collection now contained seven ordinary items.

### Differentiated Reactions

The new items introduced additional character behaviours.

**Cake:** A satisfied expression and cream detail.

**Rice Ball:** A big chewing motion.

**Orange Juice:** A drinking animation with a straw-like visual interaction.

### Visual Consistency

The items were designed using programmatically generated pixel patterns rendered through CSS `box-shadow`.

### Learning

A small number of additional interactions can greatly increase perceived variety when each one has a distinctive response.

---

## 13. V2.6 — Sound and Character Dialogue

### Design Goal

Improve the emotional connection between the student and teacher.

### Changes

I developed additional item-specific feedback.

**Cookie**

Crunching sounds were added to reinforce the eating animation.

**Cake**

A cheerful melodic sound suggested the character's enjoyment.

**Orange Juice**

Rounded, low-pitched tones suggested drinking and gulping.

**Star**

A bright metallic chime reinforced the star collection.

**Doodle**

Scratch-like sound synthesis was used to suggest a pencil moving across paper.

### Pixel Speech Bubbles

Certain collectible interactions trigger short conversations between the student and teacher.

Examples include:

- Student: "Yummy, yummy!"
- Teacher: "Hmm?"
- Student: "So refreshing!"
- Teacher: "Did I hear something?"

### Learning

Sound is especially important in interactive work because it confirms actions without requiring the player to look at a particular interface element.

The dialogue system also adds humour and personality to the gameplay.

---

## 14. V2.6.1 — Score Rule Synchronization

### Problem

The minimum score required for victory needed to be adjusted to improve the challenge.

### Change

The NORMAL difficulty's minimum score was increased from 8 to 10 points.

The update affected:

- The main game configuration.
- Final win/loss validation.
- The opening rules.
- HUD goal information.
- Score feedback.
- Final results.

### Design Reasoning

A single shared configuration value is more maintainable than repeating the same rule throughout the code.

### Learning

Gameplay values and interface copy must remain synchronized.

A mismatch between displayed rules and actual logic can undermine the player's trust in the system.

---

## 15. V3.0 — Systematic Gameplay Expansion

V3.0 represents a transition from a small single-mode game to a more configurable and replayable interactive experience.

The upgrade is organized around six areas:

1. Gameplay difficulty and balancing.
2. New gameplay mechanics.
3. Visual content and environment.
4. Interaction feedback.
5. System functionality.
6. Audio immersion.

The aim is to increase replayability while preserving the simple core interaction.

---

## 16. V3.0 — Three Difficulty Levels

### Motivation

Players have different reaction speeds and levels of familiarity with browser games.

A single difficulty setting cannot always provide an appropriate challenge.

### Design Solution

I introduced three modes.

| Feature       | EASY    | NORMAL | HARD    |
| ------------- | ------- | ------ | ------- |
| Time          | 90s     | 60s    | 45s     |
| Minimum Score | 12      | 10     | 10      |
| Caught Limit  | 5       | 3      | 2       |
| SAFE          | Longer  | Medium | Shorter |
| WARNING       | 1.2s    | 1.0s   | 0.8s    |
| DANGER        | Shorter | Medium | Longer  |
| Fake Turns    | 10%     | 30%    | 50%     |

### Dynamic Difficulty

Each round also includes three stages.

Later stages increase the pressure by modifying teacher timing, item lifetime, and spawning intervals.

The changing pace is connected to the game's music.

### Design Intention

The difficulty system encourages replay without requiring players to learn a completely different set of rules.

---

## 17. V3.0 — Weighted Scoring and Combos

### Previous System

The earlier versions used equal scores for all collected items.

### New System

Different items now offer different rewards.

| Item         | Base Points |
| ------------ | ----------: |
| Carrot       |           1 |
| Rice Ball    |           1 |
| Cookie       |           2 |
| Cake         |           2 |
| Doodle       |           2 |
| Orange Juice |           2 |
| Star         |           3 |

The spawning system uses weighted probabilities.

### Combo Mechanism

Successful consecutive collections increase a combo counter.

- 1–4 combo: No bonus.
- 5–9 combo: +1 bonus point.
- 10+ combo: +2 bonus points.

### Design Reasoning

The system encourages the player to consider both speed and risk.

Higher-value rewards are more desirable, but careless interaction can break the combo or result in being caught.

---

## 18. V3.0 — Four Special Items

### Shield

Provides temporary protection against ordinary collection penalties.

### Freeze

Pauses the game countdown, teacher transition, and collectible expiration timers.

### Clear

Automatically collects visible ordinary items.

### Trap

Creates a negative consequence when clicked.

### Design Intention

Special items introduce more meaningful decisions into the existing gameplay loop.

Rather than adding complicated controls, these features extend the meaning of a single click.

---

## 19. V3.0 — Fake Turns and Vision Cone

### Fake Turns

The teacher sometimes begins turning around but returns to the blackboard without entering DANGER.

This reduces the predictability of the state sequence.

### HARD Vision Cone

HARD mode introduces a spatial detection mechanism.

In this mode, clicking inside the teacher's visible area carries risk, while items outside the detection area may be safer.

### Design Reasoning

The original game primarily challenged timing.

The new vision-cone system adds spatial awareness without changing the basic click interaction.

---

## 20. V3.0 — Character Skins and Dynamic Environment

### Character Customization

Three student appearances were introduced:

- Classic.
- Duo.
- Cream.

Two teacher appearances were introduced:

- Glasses.
- Beret.

The character variations reuse the same animation logic.

### Classroom Environment

The scene was expanded with:

- Moving pixel clouds.
- Animated classroom clock.
- Small plant movement.
- Changing chalkboard content.
- Subtle lighting and atmosphere.

### Theme System

Two colour schemes were added:

- Classic Cream.
- Autumn Caramel.

### Learning

Visual variation can increase a game's personality and replay value without requiring a new gameplay system.

---

## 21. V3.0 — Interaction Feedback Improvements

The new version adds multiple layers of feedback.

### Visual Feedback

- Floating point numbers.
- Combo effects.
- Red caught flash.
- Critical countdown styling.
- Buff indicators.
- Status transition feedback.

### Audio Feedback

- Item-specific sound effects.
- Special-item tones.
- Combo sounds.
- Achievement notifications.
- Victory and defeat melodies.

### Character Feedback

- Expressions linked to the teacher's state.
- Happy reactions to successful collections.
- Shocked and sad reactions after being caught.
- Victory and defeat expressions.

### Design Reasoning

An interactive experience should communicate what happened, why it happened, and what the player can do next.

---

## 22. V3.0 — Preferences, Achievements, and Records

### Local Storage

The game uses browser `localStorage` to remember:

- Difficulty.
- Character appearance.
- Theme.
- Sound settings.
- Scene-effect preference.
- Achievement progress.
- Personal best records.

### Achievements

Five achievements were designed:

- Perfect Grade.
- Collector.
- Combo Master.
- Speedrunner.
- Lucky Star.

### Personal Records

Best scores and highest combos are stored separately for each difficulty level.

### Design Intention

These features give players a reason to return and provide a sense of progress beyond a single round.

---

## 23. Technical Implementation

### HTML

HTML defines the game's semantic structure, HUD, buttons, dialogue layers, item container, rules, and settings.

### CSS

CSS controls the pixel-art visual style, layout, character animations, collectible effects, and interface transitions.

### JavaScript

JavaScript controls the state machine, game timers, scoring, item spawning, sound synthesis, achievements, and persistent settings.

### Web Audio API

Audio is synthesized directly in the browser through oscillators, gain nodes, and procedural noise.

### CSS Box-Shadow

The guinea pigs and collectible items are rendered using zero-blur pixel shadows.

Each character appearance is generated from a pixel grid, then converted into CSS `box-shadow` coordinates.

### Local Storage

Preferences and records are saved without a server.

---

## 24. Technical Challenges

### Challenge 1 — State Synchronization

The teacher state, item availability, timer, temporary buffs, and scoring must remain consistent.

**Approach:** Use a centralized JavaScript state object and shared configuration values.

### Challenge 2 — Pause and Resume

Pausing a game affects more than the main countdown.

Animations, items, buffs, and sound also need to stop and resume correctly.

**Approach:** Coordinate gameplay updates through a central timer and explicitly control animation and audio states.

### Challenge 3 — Procedural Pixel Art

Creating recognizable characters using CSS alone requires careful control of pixel coordinates, outlines, and colour patches.

**Approach:** Generate pixel patterns in JavaScript and convert them into zero-blur `box-shadow` declarations.

### Challenge 4 — Browser Audio

Web browsers restrict audio playback before a user interaction.

**Approach:** Initialize and resume Web Audio playback through the Start Game interaction.

### Challenge 5 — Responsive Layout

The game needs to remain readable without introducing page scrolling.

**Approach:** Use a fixed-height game shell, responsive CSS sizing, and mobile landscape guidance.

### Challenge 6 — Increasing System Complexity

Adding difficulty modes, special items, combos, and persistent records increases the number of possible state combinations.

**Approach:** Organize configuration, gameplay state, UI updates, and audio functions into separate code sections.

---

## 25. Evaluation Against the Assignment Brief

The original assignment requested a small interactive experience with a clear input, response, and feedback cycle.

*Classroom Daydream* addresses this through:

**Clear Input**

The player clicks or taps collectible items.

**Programmed Response**

The game evaluates the teacher's state, item type, difficulty, and temporary effects.

**Immediate Feedback**

The game responds through score updates, animation, sound, dialogue, and status changes.

**Player Decision**

The player chooses whether to continue collecting or wait for a safer opportunity.

The V3.0 expansion builds upon this original interaction rather than replacing it with a different game.

---

## 26. Testing Plan for V3.0

The earlier versions received informal user testing and iterative improvements.

However, V3.0 introduces new systems that require a separate round of validation.

### Functional Tests

- [ ] Verify EASY, NORMAL, and HARD duration and caught limits.
- [ ] Verify correct scoring for all seven ordinary items.
- [ ] Verify combo bonuses at 5 and 10 consecutive items.
- [ ] Verify traps interrupt combos and trigger the caught penalty.
- [ ] Verify Shield behaviour in DANGER.
- [ ] Verify Freeze timing and its interaction with other timers.
- [ ] Verify Clear collects visible ordinary items correctly.
- [ ] Verify fake turns cannot occur twice consecutively.
- [ ] Verify HARD vision-cone detection.
- [ ] Verify all win and lose conditions.

### Interaction and Visual Tests

- [ ] Verify guinea pig expressions in all teacher states.
- [ ] Verify all item-specific animations.
- [ ] Verify the doodle flower drawing effect.
- [ ] Verify speech bubbles appear and disappear.
- [ ] Verify character appearances switch correctly.
- [ ] Verify both colour themes.
- [ ] Verify settlement particles remain visible.
- [ ] Verify all buttons and modals.

### Audio Tests

- [ ] Verify background music starts after user interaction.
- [ ] Verify all collectible sounds.
- [ ] Verify special-item sounds.
- [ ] Verify music volume and sound-effect volume separately.
- [ ] Verify global mute.
- [ ] Verify music behaviour after pause and resume.
- [ ] Verify the victory and defeat loops.

### Persistence Tests

- [ ] Reload and check saved difficulty.
- [ ] Reload and check saved character skins.
- [ ] Reload and check saved settings.
- [ ] Check best scores by difficulty.
- [ ] Verify achievement persistence.

### Device and Browser Tests

- [ ] Chrome desktop.
- [ ] Safari desktop.
- [ ] Edge desktop.
- [ ] Mobile landscape view.
- [ ] Mobile touch interaction.
- [ ] Browser-tab switch and automatic pause.

**Testing status:** This checklist is a validation plan, not a claim that all cases have already passed.

---

## 27. Current Limitations

Although V3.0 expands the original game significantly, several areas still require further refinement and testing.

The growing number of gameplay systems makes regression testing particularly important.

Temporary effects, sound playback, and multiple simultaneous items should be tested across different gameplay states.

The game currently uses simplified visual effects and procedural pixel sprites rather than a complete sprite-sheet animation pipeline.

Responsive behaviour also requires practical testing on different screen sizes, especially small mobile devices.

These limitations represent opportunities for further development rather than changes to the central concept.

---

## 28. Personal Reflection

The development of *Classroom Daydream* changed how I understand interaction design.

At the beginning, I focused mainly on whether the player could click something and receive a response.

As the project developed, I realized that the quality of the experience depends on much more than functionality.

Character expressions help communicate emotion. Sound effects make actions feel immediate. Visual hierarchy helps players understand the game. Timing and uncertainty create tension.

User feedback was particularly valuable because it revealed problems that were difficult to notice while developing the game myself.

The scoring issue in the early version reminded me that rules must be carefully tested. Feedback about character design encouraged me to make the visual style more consistent. Suggestions about gameplay variety helped me develop stronger interaction mechanisms.

The V3.0 expansion also taught me that adding features increases the need for careful state management.

A system with multiple timers, buffs, difficulty levels, and temporary effects must be organized clearly to remain understandable and maintainable.

The most important design lesson I gained is that **a successful interactive experience is not defined by the number of features, but by how clearly and meaningfully the system responds to the user.**

---

## 29. Next Steps

Before the final course submission, I plan to:

1. Test the full game locally.
2. Verify the three difficulty modes.
3. Check the complete input-response-feedback loop.
4. Fix any remaining bugs.
5. Test pause, restart, audio, and temporary effects.
6. Review keyboard and mobile usability.
7. Capture gameplay screenshots or a short demonstration video.
8. Update this process document with the actual results of the final test.
9. Confirm the deployed GitHub Pages version matches the tested local build.

---

## 30. Credits and Development Tools

**Development environment:**

- Visual Studio Code
- GitHub
- GitHub Pages
- HTML / CSS / JavaScript
- Web Audio API

**AI assistance:**

ChatGPT was used to assist with concept exploration, coding, debugging ideas, visual refinement, and documentation drafting.

The game's pixel-art characters, item visuals, interactions, and audio are implemented programmatically without external asset dependencies.

**Project author:** Individual coursework project for SD5913 Programming for Art & Design.

---

## 31. Final Summary

*Classroom Daydream* began as a small pixel-art interaction about secretly getting distracted during class.

Through successive iterations, it developed into a more expressive and replayable browser game.

The project combines:

- Familiar everyday storytelling.
- Cute pixel-art character design.
- Time-based risk and reward.
- A three-state teacher system.
- Interactive collectible items.
- Procedural animation and audio.
- User feedback-driven iteration.
- Difficulty customization.
- Persistent preferences and records.

The project demonstrates how creative coding can support both visual expression and meaningful interaction design.
