import { walk } from "../simulation/turtleGeometry";

const move = (id, distance) => ({ id, kind: "move", distance });
const turn = (id, direction, angle) => ({ id, kind: "turn", direction, angle });
const pen = (id, down) => ({ id, kind: "pen", down });
const color = (id, value, name) => ({ id, kind: "color", color: value, name });
const width = (id, value) => ({ id, kind: "width", width: value });
const repeat = (id, times, children) => ({ id, kind: "repeat", times, children });

const event = (kind, blockId, resultText, extra = {}) => ({
  kind,
  blockId,
  startText: kind === "move" ? "Drawing while the turtle moves" : "Executing the highlighted block",
  resultText,
  ...extra,
});

// Every move destination is derived from the block's distance and the current
// heading (see turtleGeometry.js), so the drawing matches the program exactly.
const triangleStart = { x: 32.68, y: 70, heading: 90 };
const triangleCorners = (() => {
  const first = walk(triangleStart, 90, 50);
  const second = walk(first, 330, 50);
  return [first, second, walk(second, 210, 50)];
})();

const triangleEvents = (moveIds, turnIds) => [
  event("move", moveIds[0], "Forward draws the first side", { to: triangleCorners[0], iteration: 1 }),
  event("turn", turnIds[0], "Turn right 120 degrees: the turtle rotates but stays at the corner", {
    heading: 330, turnAmount: 120, direction: "right", iteration: 1,
  }),
  event("move", moveIds[1], "Forward draws the second side", { to: triangleCorners[1], iteration: 2 }),
  event("turn", turnIds[1], "Another 120-degree turn prepares the last side", {
    heading: 210, turnAmount: 120, direction: "right", iteration: 2,
  }),
  event("move", moveIds[2], "Forward draws the third side and closes the triangle", {
    to: triangleCorners[2],
    celebrate: "Three sides and two turns complete the triangle.",
  }),
];

export const turtleSimulations = [
  {
    id: 1,
    theme: "turtle-theme-green",
    eyebrow: "01 · MOVE AND DRAW",
    title: "Forward draws a line",
    idea: <>The turtle moves and its pen leaves a solid line behind.</>,
    challenge: "Run one forward instruction",
    start: { x: 50, y: 82, heading: 90 },
    program: [move("move-80", 80)],
    events: [event("move", "move-80", "The turtle moved forward and drew one straight line", {
      to: walk({ x: 50, y: 82 }, 90, 80), celebrate: "One movement produced one line.",
    })],
    footer: "MOVE FORWARD  →  TURTLE MOVES  →  PEN DRAWS",
  },
  {
    id: 2,
    theme: "turtle-theme-mint",
    eyebrow: "02 · TWO LINES AND A TURN",
    title: "A turn creates an angle",
    idea: <>Draw one line, turn without moving, then draw the second line.</>,
    challenge: "Join two lines with a 90-degree turn",
    start: { x: 26, y: 70, heading: 90 },
    program: [move("move-up", 50), turn("turn-right", "right", 90), move("move-right", 60)],
    events: [
      event("move", "move-up", "Forward draws the first line", { to: walk({ x: 26, y: 70 }, 90, 50) }),
      event("turn", "turn-right", "The turtle rotated right 90 degrees but stayed on the same point", {
        heading: 0, turnAmount: 90, direction: "right",
      }),
      event("move", "move-right", "A separate forward block draws in the new direction", {
        to: walk(walk({ x: 26, y: 70 }, 90, 50), 0, 60), celebrate: "Turn changes direction; forward changes position.",
      }),
    ],
    footer: "TURN = ROTATE ONLY  ·  FORWARD = MOVE AND DRAW",
  },
  {
    id: 3,
    theme: "turtle-theme-sky",
    eyebrow: "03 · BUILD A TRIANGLE",
    title: "Give every instruction",
    idea: <>Draw one side, turn 120 degrees, and do that three times.</>,
    challenge: "Build a triangle one block at a time",
    start: triangleStart,
    program: [
      move("tri-move-1", 50), turn("tri-turn-1", "right", 120),
      move("tri-move-2", 50), turn("tri-turn-2", "right", 120),
      move("tri-move-3", 50),
    ],
    events: triangleEvents(
      ["tri-move-1", "tri-move-2", "tri-move-3"],
      ["tri-turn-1", "tri-turn-2"],
    ),
    footer: "MOVE  →  TURN  →  MOVE  →  TURN  →  MOVE",
  },
  {
    id: 4,
    theme: "turtle-theme-gold",
    eyebrow: "04 · REPEAT",
    title: "Repeat draws the same triangle",
    idea: <>Reuse the move-and-turn pair twice, then draw the last side.</>,
    challenge: "Compare this short program with the previous one",
    start: triangleStart,
    loopTimes: 2,
    program: [
      repeat("repeat-twice", 2, [move("loop-move", 50), turn("loop-turn", "right", 120)]),
      move("loop-final-move", 50),
    ],
    events: triangleEvents(
      ["loop-move", "loop-move", "loop-final-move"],
      ["loop-turn", "loop-turn"],
    ).map((item, index) => ({
      ...item,
      resultText: [
        "Iteration 1: move forward",
        "Iteration 1: turn right 120 degrees",
        "Iteration 2: the same move runs again",
        "Iteration 2: the same turn runs again",
        "The final forward block closes the triangle",
      ][index],
      ...(index === 4 ? { celebrate: "The triangle closes without an unnecessary final turn." } : {}),
    })),
    footer: "REPEAT 2 TIMES { MOVE  →  TURN }  →  MOVE",
  },
  {
    id: 5,
    theme: "turtle-theme-coral",
    eyebrow: "05 · PEN UP",
    title: "Lift the pen to stop drawing",
    idea: <>First draw a line. Then lift the pen and move again.</>,
    challenge: "Compare movement with the pen down and up",
    start: { x: 26, y: 70, heading: 90 },
    program: [
      move("draw-first", 50), pen("pen-up", false),
      turn("pen-turn", "right", 90), move("move-without-line", 60),
    ],
    events: [
      event("move", "draw-first", "The turtle moves with its pen down, so a line appears", {
        to: walk({ x: 26, y: 70 }, 90, 50),
      }),
      event("pen", "pen-up", "The pen lifts away from the canvas", { down: false }),
      event("turn", "pen-turn", "The turtle turns while staying on the same point", {
        heading: 0, turnAmount: 90, direction: "right",
      }),
      event("move", "move-without-line", "The turtle moves again, but this time no line appears", {
        to: walk(walk({ x: 26, y: 70 }, 90, 50), 0, 60), celebrate: "Pen up allows movement without drawing.",
      }),
    ],
    footer: "PEN DOWN = MOVE + DRAW  ·  PEN UP = MOVE ONLY",
  },
  {
    id: 6,
    theme: "turtle-theme-violet",
    eyebrow: "06 · COLOUR AND WIDTH",
    title: "Style blocks change the next line",
    idea: <>Colour and width affect lines drawn after those blocks run.</>,
    challenge: "Draw two differently styled lines",
    start: { x: 22, y: 76, heading: 90 },
    program: [
      color("colour-cyan", "#43d5d0", "cyan"), width("width-eight", 8),
      move("thick-line", 65), turn("style-turn", "right", 90),
      color("colour-pink", "#f05c9b", "pink"), width("width-three", 3),
      move("thin-line", 70),
    ],
    events: [
      event("color", "colour-cyan", "The drawing colour becomes cyan", { color: "#43d5d0" }),
      event("width", "width-eight", "The drawing width becomes 8", { width: 8 }),
      event("move", "thick-line", "The turtle draws a thick cyan line", { to: walk({ x: 22, y: 76 }, 90, 65) }),
      event("turn", "style-turn", "The turtle rotates without adding a line", {
        heading: 0, turnAmount: 90, direction: "right",
      }),
      event("color", "colour-pink", "The drawing colour becomes pink", { color: "#f05c9b" }),
      event("width", "width-three", "The drawing width becomes 3", { width: 3 }),
      event("move", "thin-line", "The turtle draws a thin pink line", {
        to: walk(walk({ x: 22, y: 76 }, 90, 65), 0, 70), celebrate: "Style blocks affect the next line drawn.",
      }),
    ],
    footer: "SET COLOUR + SET WIDTH  →  NEXT MOVEMENT USES THAT STYLE",
  },
];
