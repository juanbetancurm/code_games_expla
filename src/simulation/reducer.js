// Keep adjacent directions 90 degrees apart so turns never take the long way.
export const directionAngles = { east: 0, south: 90, west: 180, north: -90 };
export const directionArrows = { east: "→", south: "↓", west: "←", north: "↑" };

export function initialSimulationState(simulation) {
  return {
    cursor: 0,
    position: { x: simulation.start.x, y: simulation.start.y },
    direction: simulation.start.direction,
    headingAngle: directionAngles[simulation.start.direction],
    activeBlock: null,
    completedBlocks: [],
    skippedBlocks: [],
    failedBlocks: [],
    feedback: "Select NEXT STEP to execute one instruction.",
    tone: "",
    condition: null,
    goalCheck: null,
    loopCount: 0,
    turning: null,
    turnFrom: null,
    look: null,
    bump: false,
    celebrating: false,
    status: "idle",
    playing: false,
  };
}

export function applyEvent(state, event, cursor) {
  const isBump = event.kind === "bump";
  const completed = isBump || event.complete === false || state.completedBlocks.includes(event.blockId)
    ? state.completedBlocks
    : [...state.completedBlocks, event.blockId];
  const skipped = event.skipBlockId && !state.skippedBlocks.includes(event.skipBlockId)
    ? [...state.skippedBlocks, event.skipBlockId]
    : state.skippedBlocks;
  const failed = isBump && !state.failedBlocks.includes(event.blockId)
    ? [...state.failedBlocks, event.blockId]
    : state.failedBlocks;
  // A path check is shown on the board until the character moves away.
  const look = event.kind === "condition"
    ? { position: state.position, direction: state.direction, outcome: event.outcome }
    : event.kind === "move" ? null : state.look;
  return {
    ...state,
    cursor,
    position: event.to ?? state.position,
    direction: event.direction ?? state.direction,
    headingAngle: event.kind === "turn" && state.direction !== event.direction
      ? state.headingAngle + (event.turn === "left" ? -90 : 90)
      : state.headingAngle,
    completedBlocks: completed,
    skippedBlocks: skipped,
    failedBlocks: failed,
    look,
    turnFrom: null,
    feedback: event.celebrate ?? event.resultText,
    tone: event.tone ?? (event.celebrate ? "good" : ""),
    condition: event.kind === "condition" ? event.outcome : state.condition,
    goalCheck: event.kind === "goalCheck" ? event.outcome : state.goalCheck,
    loopCount: event.iteration ?? state.loopCount,
    bump: event.kind === "bump",
    celebrating: Boolean(event.celebrate),
    activeBlock: null,
    turning: null,
    status: "idle",
  };
}

export function replayEvents(simulation, events, count) {
  return events.slice(0, count).reduce((state, event, index) => applyEvent(state, event, index + 1), initialSimulationState(simulation));
}

export function simulationReducer(state, action) {
  switch (action.type) {
    case "RESET": return { ...action.state };
    case "START": return {
      ...state,
      status: "animating",
      activeBlock: action.event.blockId,
      feedback: action.event.startText,
      tone: "",
      bump: false,
      celebrating: false,
      turning: action.event.turn ?? null,
      condition: action.event.kind === "condition" ? "checking" : state.condition,
      goalCheck: action.event.kind === "goalCheck" ? "checking" : state.goalCheck,
    };
    case "PATCH": return { ...state, ...action.patch };
    case "FINISH": return applyEvent(state, action.event, action.cursor);
    case "RESTORE": return { ...action.state, playing: false };
    case "PLAYING": return { ...state, playing: action.value };
    default: return state;
  }
}
