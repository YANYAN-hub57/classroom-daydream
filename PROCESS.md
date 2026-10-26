
# PROCESS – Classroom Daydream

**Course:** SD5913 – Programming for Art & Design  
**Assignment:** Assignment 3 – An Interactive Experience  
**Project:** Classroom Daydream V2.0

---

## 1. Starting Idea

My initial idea was to create a small interactive
experience based on an everyday classroom situation:
a student becoming distracted during a lesson.

I wanted to explore how simple actions such as
doodling, eating snacks, and paying attention
could become an interactive decision-making game.

The first version allowed players to choose
between three actions:

- Doodle
- Eat snacks
- Study

Each action changed two values: mood and risk.

The intention was to let the player balance
enjoyment against the possibility of being caught.

---

## 2. Initial Prototype – Version 1.0

The first prototype was developed using HTML,
CSS, and JavaScript.

HTML provided the classroom elements and buttons.

CSS created the environment, student character,
teacher, progress bars, and animations.

JavaScript controlled the interactions,
game state, and winning conditions.

The initial interaction loop was:

Input:
The player clicks an action.

Response:
Mood and risk values change.

Feedback:
Progress bars, text, sound, and animation update.

However, testing showed that this interaction
was too predictable.

For example, repeatedly collecting rewards
could satisfy the winning condition without
requiring much observation or strategy.

The visual design was also relatively simple,
with inconsistent character styles.

---

## 3. First User Trial

I conducted an informal user trial with
four participants, identified anonymously
as A, B, C, and D.

The participants evaluated the first playable
version of Classroom Daydream.

The feedback revealed problems involving
game balance, visual consistency,
interaction mechanics, and character design.

### Participant A – Game Logic

Participant A observed that the game could be
won too easily by repeatedly clicking actions.

This suggested that the original winning rule
rewarded repetition rather than meaningful
decision-making.

The problem was not simply the numerical values.

The interaction lacked an external condition
that required the player to observe and adapt.

### Participant B – Visual Design

Participant B felt that the game interface
looked too rough.

The classroom, student, teacher, and objects
did not have a sufficiently unified visual style.

This made the experience feel less coherent.

### Participant C – Game Mechanics

Participant C suggested drawing inspiration
from Red Light, Green Light and Whac-A-Mole.

These games use observation, timing,
and immediate responses.

This feedback introduced the possibility of
turning the teacher into an active part
of the game system.

### Participant D – Character Design

Participant D suggested using a guinea pig
as the main character.

A small animal character could make the game
more expressive, playful, and memorable.

This idea also offered an opportunity to
develop a consistent character identity.

---

## 4. Reflection on User Feedback

The most important issue identified through
the trial was the relationship between
player input and game consequences.

In Version 1.0, players could predict
the result of clicking an action.

However, they did not need to observe
the classroom or respond to changing conditions.

I decided to redesign the central interaction
rather than only adjust the numerical values.

The revised experience would require
players to observe the teacher,
recognise safe and dangerous moments,
and choose when to interact.

This decision directly addresses
the assignment requirement for a meaningful
input-response-feedback loop.

---

## 5. Design Iteration – Version 2.0

Based on the feedback, I redesigned
Classroom Daydream around a guinea pig
student and a teacher observation system.

### Change 1 – Teacher Observation

The teacher now has three possible states:

GREEN – SAFE

The teacher faces the blackboard.
The player can collect objects safely.

YELLOW – WARNING

The teacher is preparing to turn.
The player is encouraged to stop.

RED – DANGER

The teacher watches the classroom.
Collecting an object increases
the caught counter.

This mechanic introduces timing
and uncertainty into the experience.

### Change 2 – Random Collectibles

Instead of repeatedly pressing fixed
action buttons, the player must respond
to objects appearing in different positions.

Each object is available for a limited time.

Once collected, the object is immediately
removed to prevent repeated scoring.

This mechanic encourages visual attention
and deliberate clicking.

### Change 3 – New Winning Conditions

Version 1.0 used mood and risk thresholds.

Version 2.0 uses a timed challenge.

The player must:

- Play for up to 60 seconds
- Collect at least 8 points
- Avoid being caught 3 times

This changes the experience from
a numerical optimisation task
into a timing-based interaction.

### Change 4 – Guinea Pig Character

The original human student was replaced
with a stylised guinea pig.

The character was created with CSS shapes
and uses simple animations to communicate
different emotional responses.

A successful collection triggers a happy jump.

A dangerous action triggers a frightened movement.

### Change 5 – Clearer Feedback

The revised game includes:

- Colour-coded teacher status
- Countdown timer
- Score counter
- Caught counter
- Collectible animation
- Sound effects
- Text feedback
- Win and loss screens

The player can understand the consequence
of an action and decide whether to continue
collecting or wait.

---

## 6. Technical Implementation

The game is implemented using
HTML, CSS, and vanilla JavaScript.

No external JavaScript framework
or backend is required.

### HTML

The HTML document defines the interface:

- Game title and instructions
- Timer and score
- Teacher status
- Classroom scene
- Guinea pig character
- Collectible object
- Feedback messages
- Game controls
- Result overlay

### CSS

CSS is used to create the visual environment
and character illustrations.

It also provides responsive layouts,
animations, warning colours,
and button interaction states.

### JavaScript

JavaScript stores and updates the game state.

The main functions include:

- createInitialState()
- updateHUD()
- advanceTeacherState()
- spawnItem()
- collectItem()
- gameTick()
- pauseGame()
- resumeGame()
- finishGame()
- resetGame()

The program checks player input against
the current teacher state.

The resulting change is communicated
through visual and audio feedback.

---

## 7. Input → Response → Feedback

A central example is collecting an object.

### Input

The player clicks a carrot or another
collectible object.

### Response

JavaScript checks the current teacher state.

If the teacher is facing away,
the score increases.

If the teacher is preparing to turn,
the player receives no points.

If the teacher is watching,
the caught counter increases.

### Feedback

The interface updates the score
or caught counter.

A sound effect and character animation
communicate the result.

Text feedback explains the outcome.

The player can then decide when
to attempt another collection.

This creates a repeated loop of
observation, action, response,
and feedback.

---

## 8. Error and Interruption Handling

The experience includes several safeguards.

First, collected objects disappear
immediately after being clicked.

This prevents multiple points being awarded
from repeated clicks on the same object.

Second, the program only allows collection
while the game is in the playing state.

Third, the game prevents duplicate
timer intervals.

Fourth, the game pauses when
the player switches to another browser tab.

Finally, audio is optional.

If sound cannot play, the visual interaction
and core game rules remain available.

These decisions were made to support
a more reliable user experience.

---

## 9. AI Tools and Design Decisions

I used ChatGPT as an AI-assisted development tool.

It supported the project by helping me:

- Understand the assignment requirements
- Plan the interactive game structure
- Draft HTML, CSS, and JavaScript
- Understand VS Code and GitHub workflows
- Investigate coding and local server errors
- Explore alternative interaction mechanics
- Structure the README and PROCESS documents

### AI Suggestion Kept

I kept the suggestion to implement a clear
input-response-feedback cycle.

In Version 2.0, the teacher's changing
observation state makes this relationship
more meaningful.

The player must actively observe
and decide when to collect objects.

### AI Suggestion Changed

An earlier implementation focused on
increasing and decreasing mood and risk
through three fixed buttons.

After user testing, I changed this approach.

Instead of relying only on numerical values,
the revised game uses observation,
timing, and random collectible objects.

This decision was informed by actual
user feedback rather than simply accepting
the original implementation.

### Role of AI

AI was used to support ideation,
coding, explanation, and documentation.

The project also involved user feedback,
design decisions, implementation,
and iterative testing.

---

## 10. Visual Design Decisions

The visual design uses a warm,
pastel classroom environment.

The colour palette includes:

- Cream
- Dusty pink
- Soft brown
- Muted green
- Warm yellow

The guinea pig character and teacher
use simplified CSS shapes.

The aim is to create a consistent
pixel-inspired aesthetic.

The classroom environment is kept simple
so that the teacher state and collectible
objects remain easy to notice.

The status indicator uses three colours
to communicate the player's situation:

Green for safe.

Yellow for warning.

Red for danger.

These visual cues are accompanied by text
so that the game does not rely on colour alone.

---

## 11. Screenshots and Development Evidence

### Version 2.0 Main Interface

![Main Game](assets/screenshot.png)

### Teacher Warning State

![Teacher Warning](assets/teacher-warning.png)

### Teacher Observation

![Teacher State](<assets/teacher-look back.png>)

### Game Result

![Game Result](assets/game-result.png)

### Failure Result

![Failure Result](<assets/game-result（failure）.png>)

The screenshots document the interface,
teacher states, and game results.

Git commit history documents the development
and subsequent changes.

---

## 12. Second User Trial

Status: Follow-up testing to be documented.

The second trial should examine whether
the revised game addresses the feedback
from the first version.

Questions to investigate:

1. Can players understand the teacher's
   three states without explanation?

2. Is the game more engaging than the
   original repeated-clicking system?

3. Is the guinea pig character easier
   to recognise and more visually consistent?

4. Can players understand how they win
   or lose the game?

5. Are the pause and restart controls clear?

After conducting the second trial,
record the actual observations,
any remaining problems, and the
resulting design decisions here.

Do not replace this section with
invented user feedback.

---

## 13. Known Limitations

The game is designed for a short,
single-player browser experience.

The classroom environment and
characters are drawn using CSS.

They are pixel-inspired rather than
high-resolution sprite animations.

Collectible objects use emoji,
which may display differently
on different devices.

The game does not save progress
after the browser is refreshed.

There is only one level and
one fixed time limit.

---

## 14. Final Reflection

The development of Classroom Daydream
shows how user feedback can transform
a small interactive idea.

The first prototype demonstrated
basic input-response-feedback through
mood and risk values.

However, users identified weaknesses
in its gameplay and visual design.

The revised version introduces
a more meaningful interaction:

Players must observe changing conditions,
make decisions under time pressure,
and interpret immediate feedback.

The project demonstrates that
interaction quality and usability
are more important than adding
unnecessary technical complexity.

A small experience can become
more engaging when its actions,
consequences, and feedback
are clearly connected.
