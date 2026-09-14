import { TIME } from "../simulation/movieRender";
import { finalProgram } from "../simulation/movieState";

const colour = (id, name, value) => ({ id, kind: "colour", colour: value, name });
const rect = (id, x, y, width, height) => ({ id, kind: "rect", x, y, width, height });
const circle = (id, x, y, radius) => ({ id, kind: "circle", x, y, radius });
const line = (id, x1, y1, x2, y2, width) => ({ id, kind: "line", x1, y1, x2, y2, width });

const add = (block, startText, resultText, extra = {}) => ({ kind: "add", block, startText, resultText, ...extra });
const change = (blockId, input, value, startText, resultText, extra = {}) => ({ kind: "change", blockId, input, value, startText, resultText, ...extra });
const move = (blockIds, toIndex, startText, resultText, extra = {}) => ({ kind: "move", blockIds, toIndex, startText, resultText, ...extra });

export const palette = {
  green: "#1fa31f",
  orange: "#ffcc44",
  blue: "#4747ff",
  grey: "#9a9a9a",
  yellow: "#ffe51a",
  smoke: "#cfcfcf",
};

// Every block of the house example. Sections add or change these one at a time.
const blocks = {
  green: colour("colour-green", "green", palette.green),
  ground: rect("ground", 50, 0, 100, 8),
  orange: colour("colour-orange", "orange", palette.orange),
  house: rect("house", 40, 19, 50, 30),
  blue: colour("colour-blue", "blue", palette.blue),
  windowLeft: rect("window-left", 25, 21, 6, 6),
  windowRight: rect("window-right", 55, 21, 6, 6),
  grey: colour("colour-grey", "grey", palette.grey),
  door: rect("door", 40, 9, 6, 10),
  roofLeft: line("roof-left", 15, 34, 40, 45, 1),
  roofRight: line("roof-right", 40, 45, 65, 34, 1),
  yellow: colour("colour-yellow", "yellow", palette.yellow),
  sun: circle("sun", 80, 80, 10),
  smokeColour: colour("colour-smoke", "light grey", palette.smoke),
  smoke: circle("smoke", 24, TIME, 3),
  chimney: rect("chimney", 24, 40, 6, 12),
};

// The person that Blockly Games Movie level 1 asks for. Only its striped
// silhouette is shown; no lesson program draws it (a test protects this).
export const personTarget = [
  { kind: "circle", x: 50, y: 70, radius: 10, tone: "head" },
  { kind: "rect", x: 50, y: 40, width: 20, height: 40, tone: "body" },
  { kind: "line", x1: 20, y1: 70, x2: 40, y2: 50, width: 5, tone: "arm" },
  { kind: "line", x1: 60, y1: 50, x2: 80, y2: 70, width: 5, tone: "arm" },
];

const eventsOf = (simulation) => simulation.events ?? Object.values(simulation.variants ?? {})[0]?.events ?? [];
const endOf = (simulation) => finalProgram(simulation, eventsOf(simulation));

const rectangles = {
  id: 1,
  mode: "draw",
  theme: "movie-theme-sky",
  eyebrow: "01 · RECTANGLE",
  title: "Rectangles use their centre",
  idea: <>A rectangle's <strong>x and y are its centre</strong>. Width and height grow to both sides.</>,
  challenge: "Draw the ground and the house",
  tip: "x and y give the centre of the rectangle.",
  startProgram: [],
  events: [
    add(blocks.green, "First choose the pen colour", "The pen is green: shapes below this block will be green"),
    add(blocks.ground, "Rectangle with its centre at x 50, y 0", "Half of it is below the canvas, so we see a strip of ground"),
    add(blocks.orange, "Change the pen colour", "The pen is orange now"),
    add(blocks.house, "Centre x 40, y 19 · width 50 · height 30", "25 to each side, 15 up and 15 down", {
      celebrate: "The centre, width and height place the house on the ground.",
    }),
  ],
  footer: "RECTANGLE = CENTRE (x, y) + WIDTH + HEIGHT",
};

const windowEvents = [
  add(blocks.blue, "Change the pen to blue", "Both windows will be blue"),
  add(blocks.windowLeft, "Window centre at x 25, y 21", "A 6 × 6 blue square on the house"),
  add(blocks.windowRight, "Same size, centre at x 55", "The second window uses the same blue pen"),
];

const colourAndOrder = {
  id: 2,
  mode: "draw",
  theme: "movie-theme-gold",
  eyebrow: "02 · COLOUR AND ORDER",
  title: "Set the colour, then draw",
  idea: <>The pen keeps its colour until the next <strong>set colour</strong>. Later blocks paint on top.</>,
  challenge: "Add the windows and the door",
  tip: "A colour stays until the next set colour block.",
  startProgram: endOf(rectangles),
  variants: {
    after: {
      label: "Door after the house",
      footer: "SET COLOUR → EVERY SHAPE BELOW USES IT · LATER BLOCKS PAINT ON TOP",
      events: [
        ...windowEvents,
        add(blocks.grey, "Change the pen to grey", "The door will be grey"),
        add(blocks.door, "Door centre at x 40, y 9 · height 10", "It is drawn after the house, so it is on top", {
          celebrate: "The door appears because it was drawn after the house.",
        }),
      ],
    },
    before: {
      label: "Door before the house",
      footer: "DOOR BLOCK FIRST → THE HOUSE PAINTS OVER IT",
      events: [
        ...windowEvents,
        add(blocks.grey, "Put set colour grey above the house blocks", "The pen turns grey before the house is drawn", { index: 2 }),
        add(blocks.door, "Put the door block above the house block", "The door is drawn first… and the house paints over it", {
          index: 3,
          tone: "alert",
        }),
      ],
    },
  },
};

const lines = {
  id: 3,
  mode: "draw",
  theme: "movie-theme-mint",
  eyebrow: "03 · LINE",
  title: "A line joins two points",
  idea: <>A line needs a <strong>start point, an end point</strong> and a width.</>,
  challenge: "Add the roof",
  tip: "A line goes from its start point to its end point.",
  startProgram: endOf(colourAndOrder),
  events: [
    add(blocks.roofLeft, "Start at the house corner (15, 34), end at the top (40, 45)", "The pen is still grey, so the roof is grey"),
    add(blocks.roofRight, "Start at the top (40, 45), end at the other corner (65, 34)", "Both lines share the point (40, 45)", {
      celebrate: "Two lines that share a point make the roof.",
    }),
  ],
  footer: "LINE = START (x, y) → END (x, y) + WIDTH",
};

const circles = {
  id: 4,
  mode: "draw",
  theme: "movie-theme-coral",
  eyebrow: "04 · CIRCLE",
  title: "Circles: a centre and a radius",
  idea: <>The <strong>radius</strong> is the distance from the centre to the edge.</>,
  challenge: "Add the sun",
  tip: "The radius goes from the centre to the edge.",
  startProgram: endOf(lines),
  events: [
    add(blocks.yellow, "Change the pen to yellow", "The sun will be yellow"),
    add(blocks.sun, "Circle centre at x 80, y 80 · radius 10", "10 from the centre to every edge", {
      celebrate: "The drawing is complete!",
    }),
  ],
  footer: "CIRCLE = CENTRE (x, y) + RADIUS",
};

const drawPerson = {
  id: 5,
  mode: "yourTurn",
  theme: "movie-theme-violet",
  eyebrow: "05 · YOUR TURN",
  title: "Now draw the person",
  idea: <>Use what you learned in Blockly Games <strong>Movie level 1</strong>. No numbers here.</>,
  challenge: "Draw this person in Blockly Games",
  tip: "Point at the picture to read x and y.",
  target: personTarget,
  feedback: "Build the person in Blockly Games and check each shape against the striped picture.",
  checklist: ["1 circle: the head", "1 rectangle: the body", "2 lines: the arms", "set colour to: before each new colour"],
  hints: [
    "Point at the picture: the corner of the canvas shows x and y.",
    "For circles and rectangles, x and y are the centre.",
    "A line needs the point where it starts and the point where it ends.",
    "Blocks lower in the program paint on top.",
  ],
  link: { href: "https://blockly.games/movie?lang=en&level=1", label: "Open Movie level 1" },
  footer: "PREDICT · PLACE · CHECK",
};

const timeNumber = {
  id: 6,
  mode: "movie",
  theme: "movie-theme-blue",
  eyebrow: "06 · TIME",
  title: "time is a number that changes",
  idea: <>While the movie plays, <strong>time</strong> counts from 0 to 100.</>,
  challenge: "Make the sun move",
  intro: "Press ▶ under the canvas: nothing moves yet. Then select NEXT STEP.",
  startProgram: endOf(circles),
  events: [
    change("sun", "y", TIME, "Replace the number 80 in y with the time block", "y now follows time: 0 at the start, 100 at the end", {
      play: true,
      celebrate: "The sun moves because its y follows time.",
    }),
  ],
  footer: "y = time → AT time 50 THE SUN IS AT y 50",
};

const orderInMovie = {
  id: 7,
  mode: "movie",
  theme: "movie-theme-green",
  eyebrow: "07 · ORDER IN A MOVIE",
  title: "Order hides and reveals",
  idea: <>Blocks at the <strong>top</strong> are painted first, so later shapes can cover them.</>,
  challenge: "Make the sun rise behind the house",
  intro: "The sun already moves. Let's make it rise behind the house.",
  startProgram: endOf(timeNumber),
  events: [
    change("sun", "x", 50, "Change the sun's x from 80 to 50", "Bug: the sun rises in front of the house!", { time: 30, tone: "alert" }),
    move(["colour-yellow", "sun"], 0, "Drag the two sun blocks to the top of the program", "The ground and the house are now painted over the sun", {
      play: true,
      celebrate: "Sunrise behind the house!",
    }),
  ],
  footer: "TOP BLOCKS ARE PAINTED FIRST · LATER BLOCKS COVER THEM",
};

const smoke = {
  id: 8,
  mode: "movie",
  theme: "movie-theme-mint",
  eyebrow: "08 · BONUS",
  title: "Two shapes, one clock",
  idea: <>Every <strong>time</strong> block reads the same clock.</>,
  challenge: "Add smoke from a chimney",
  intro: "The sunrise works. Now add smoke that uses the same time.",
  startProgram: endOf(orderInMovie),
  events: [
    add(blocks.smokeColour, "Choose light grey for the smoke", "The smoke will be light grey", { index: 2 }),
    add(blocks.smoke, "Smoke circle at x 24 with y = time", "It is drawn before the house, so the house hides it at first", { index: 3, time: 30 }),
    add(blocks.chimney, "A chimney on the left side of the roof", "The chimney is drawn last, so the smoke comes out of it", {
      play: true,
      celebrate: "Sun and smoke rise together: same time, same clock.",
    }),
  ],
  footer: "EVERY time BLOCK READS THE SAME CLOCK",
};

const makeMovie = {
  id: 9,
  mode: "yourTurn",
  theme: "movie-theme-orange",
  eyebrow: "09 · YOUR TURN",
  title: "Now make a movie",
  idea: <>Open Blockly Games <strong>Movie level 2</strong> and make something move with time.</>,
  challenge: "Make a shape move in Blockly Games",
  demo: endOf(orderInMovie),
  feedback: "Press ▶ to watch the sunrise again, then make your own movie.",
  checklist: ["Draw the picture first", "Find the number that should change", "Replace it with the time block", "Check time 0, 50 and 100"],
  hints: [
    "Only one input needs the time block to make a shape move.",
    "time is 0 at the start and 100 at the end.",
    "If a shape is hidden, check which blocks are painted after it.",
  ],
  link: { href: "https://blockly.games/movie?lang=en&level=2", label: "Open Movie level 2" },
  footer: "DRAW · REPLACE A NUMBER WITH time · PLAY",
};

export const movieSimulations = [rectangles, colourAndOrder, lines, circles, drawPerson, timeNumber, orderInMovie, smoke, makeMovie];
