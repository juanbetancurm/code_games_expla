const heading = (id, angle) => ({ id, kind: "heading", angle });
const wormCondition = { kind: "worm", label: "does not have worm" };
const coordinateCondition = (axis, operator, value) => ({ kind: "coordinate", axis, operator, value });
const andCondition = (...parts) => ({ kind: "and", parts });
const branch = (label, condition, children) => ({ label, condition, children });
const conditional = (id, branches) => ({ id, kind: "if", branches });
const moment = (blockId, headingValue, to, text, extra = {}) => ({
  kind: "tick",
  blockId,
  heading: headingValue,
  to,
  startText: "Slow-motion moment: evaluate the program",
  resultText: text,
  ...extra,
});

export const birdSimulations = [
  {
    id: 1, theme: "bird-theme-violet", eyebrow: "01 · STEERING WHILE FLYING",
    title: "The bird is always moving",
    idea: <>A heading changes steering; it does not create one movement step.</>,
    challenge: "Set 0°, then watch continuous flight",
    start: { x: 18, y: 50, heading: 90 },
    program: [heading("heading-east", 0)],
    events: [
      moment("heading-east", 0, { x: 94, y: 50 }, "With no new direction, the bird continues to the edge", { celebrate: "One heading continuously steered the whole flight." }),
    ],
    footer: "THE PROGRAM REPEATS  ·  THE BIRD KEEPS FLYING",
  },
  {
    id: 2, theme: "bird-theme-sky", eyebrow: "02 · ONE HEADING OVER TIME",
    title: "Angles steer continuous motion",
    idea: <>One heading remains active until the program selects another.</>,
    challenge: "Set 270°, then watch continuous flight",
    start: { x: 50, y: 82, heading: 0 },
    program: [heading("heading-south", 270)],
    events: [
      moment("heading-south", 270, { x: 50, y: 6 }, "Heading 270° points down, so the bird continues to the edge", { celebrate: "No extra movement blocks were needed." }),
    ],
    footer: "0° RIGHT  ·  90° UP  ·  180° LEFT  ·  270° DOWN",
  },
  {
    id: 3, theme: "bird-theme-mint", eyebrow: "03 · IF AND ELSE",
    title: "Each moment chooses one heading",
    idea: <>The condition is rechecked as the bird's situation changes.</>,
    challenge: "Observe the choice before and after pickup",
    start: { x: 20, y: 45, heading: 90 }, worm: { x: 50, y: 45 },
    program: [conditional("if-worm", [
      branch("if", wormCondition, [heading("heading-east", 0)]),
      branch("else", null, [heading("heading-north", 90)]),
    ])],
    events: [
      moment("heading-east", 0, { x: 50, y: 45 }, "TRUE selects 0°; the bird keeps flying until it reaches the worm", { conditionBlockId: "if-worm", outcome: true, pickup: true }),
      moment("heading-north", 90, { x: 50, y: 90 }, "Now FALSE selects ELSE; 90° continues to the upper edge", { conditionBlockId: "if-worm", outcome: false, celebrate: "The direction changed only when the situation changed." }),
    ],
    footer: "CHECK CONDITION  →  SELECT ONE HEADING  →  KEEP FLYING",
  },
  {
    id: 4, theme: "bird-theme-gold", eyebrow: "04 · X COORDINATE",
    title: "x changes during continuous flight",
    idea: <>The condition is recalculated as the bird crosses the ruler.</>,
    challenge: "Watch the decision change at x = 80",
    start: { x: 20, y: 50, heading: 90 }, showAxes: true,
    guide: { axis: "x", value: 80, label: "x = 80" },
    program: [conditional("if-x", [
      branch("if", coordinateCondition("x", "<", 80), [heading("heading-east", 0)]),
      branch("else", null, [heading("heading-north", 90)]),
    ])],
    events: [
      moment("heading-east", 0, { x: 80, y: 50 }, "While x < 80, heading 0° keeps the bird moving right", { conditionBlockId: "if-x", outcome: true }),
      moment("heading-north", 90, { x: 80, y: 90 }, "At x = 80 the condition is false; 90° continues to the edge", { conditionBlockId: "if-x", outcome: false, celebrate: "The live x value changed the selected heading." }),
    ],
    footer: "EACH MOMENT: READ x  →  CHOOSE HEADING  →  CONTINUE FLYING",
  },
  {
    id: 5, theme: "bird-theme-coral", eyebrow: "05 · Y COORDINATE",
    title: "y changes during continuous flight",
    idea: <>Moving upward increases the live y value.</>,
    challenge: "Watch the decision change at y = 80",
    start: { x: 50, y: 20, heading: 0 }, showAxes: true,
    guide: { axis: "y", value: 80, label: "y = 80" },
    program: [conditional("if-y", [
      branch("if", coordinateCondition("y", "<", 80), [heading("heading-north", 90)]),
      branch("else", null, [heading("heading-east", 0)]),
    ])],
    events: [
      moment("heading-north", 90, { x: 50, y: 80 }, "While y < 80, heading 90° keeps the bird moving upward", { conditionBlockId: "if-y", outcome: true }),
      moment("heading-east", 0, { x: 94, y: 80 }, "At y = 80 the condition is false; 0° continues to the edge", { conditionBlockId: "if-y", outcome: false, celebrate: "The live y value changed the selected heading." }),
    ],
    footer: "EACH MOMENT: READ y  →  CHOOSE HEADING  →  CONTINUE FLYING",
  },
  {
    id: 6, theme: "bird-theme-blue", eyebrow: "06 · ELSE IF",
    title: "Every branch changes the journey",
    idea: <>Changing x and y makes all three branches useful.</>,
    challenge: "Down, then left, then up",
    start: { x: 90, y: 90, heading: 0 }, showAxes: true,
    guides: [
      { axis: "x", value: 30, label: "x = 30" },
      { axis: "y", value: 70, label: "y = 70" },
    ],
    program: [conditional("if-three", [
      branch("if", coordinateCondition("x", "<", 30), [heading("heading-north", 90)]),
      branch("else if", coordinateCondition("y", "<", 70), [heading("heading-west", 180)]),
      branch("else", null, [heading("heading-south", 270)]),
    ])],
    events: [
      moment("heading-south", 270, { x: 90, y: 68 }, "Both questions are false, so ELSE sends the bird down", { conditionBlockId: "if-three", outcome: false }),
      moment("heading-west", 180, { x: 28, y: 68 }, "Now y < 70 is true, so ELSE IF sends the bird left", { conditionBlockId: "if-three", outcome: true }),
      moment("heading-north", 90, { x: 28, y: 90 }, "Now x < 30 is true, so IF sends the bird to the upper edge", { conditionBlockId: "if-three", outcome: true, celebrate: "All three branches changed the continuous journey." }),
    ],
    footer: "ELSE: DOWN  →  ELSE IF: LEFT  →  IF: UP TO THE EDGE",
  },
  {
    id: 7, theme: "bird-theme-violet", eyebrow: "07 · AND",
    title: "The worm can change a condition",
    idea: <>The program checks both x and whether the bird has the worm.</>,
    challenge: "Collect the worm, then watch the decision change",
    start: { x: 40, y: 40, heading: 90 }, showAxes: true, worm: { x: 60, y: 40 },
    guide: { axis: "x", value: 60, label: "x = 60" },
    program: [conditional("if-and", [
      branch("if", andCondition(coordinateCondition("x", "<", 60), wormCondition), [heading("heading-east", 0)]),
      branch("else", null, [heading("heading-north", 90)]),
    ])],
    events: [
      moment("heading-east", 0, { x: 60, y: 40 }, "x < 60 and no worm are both TRUE, so the bird flies right", { conditionBlockId: "if-and", outcome: true, checks: [true, true], pickup: true }),
      moment("heading-north", 90, { x: 60, y: 90 }, "The bird now has the worm, so the AND condition is FALSE", { conditionBlockId: "if-and", outcome: false, checks: [false, false], celebrate: "Collecting the worm changed the selected heading." }),
    ],
    footer: "CHECK x AND WORM  →  COLLECT WORM  →  CHANGE HEADING",
  },
];
