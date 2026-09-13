export function initialBirdState(simulation) {
  return {
    cursor: 0,
    position: { x: simulation.start.x, y: simulation.start.y },
    heading: simulation.start.heading,
    trail: [{ x: simulation.start.x, y: simulation.start.y }],
    hasWorm: false,
    condition: null,
    checks: null,
    activeBlock: null,
    completedBlocks: [],
    feedback: "Select NEXT MOMENT to advance time.",
    tone: "",
    celebrating: false,
    status: "idle",
    playing: false,
  };
}

function appendPoint(trail, point) {
  const last = trail.at(-1);
  return last?.x === point.x && last?.y === point.y ? trail : [...trail, point];
}

export function applyBirdEvent(state, event, cursor) {
  const isFlightMoment = event.kind === "fly" || event.kind === "tick";
  const completedBlocks = event.blockId && !state.completedBlocks.includes(event.blockId)
    ? [...state.completedBlocks, event.blockId]
    : state.completedBlocks;
  return {
    ...state,
    cursor,
    position: isFlightMoment ? event.to : state.position,
    heading: event.kind === "heading" || event.kind === "tick" ? event.heading : state.heading,
    trail: isFlightMoment ? appendPoint(state.trail, event.to) : state.trail,
    hasWorm: state.hasWorm || Boolean(event.pickup),
    condition: event.kind === "condition" || event.kind === "tick" ? event.outcome ?? state.condition : state.condition,
    checks: event.kind === "condition" || event.kind === "tick" ? event.checks ?? null : state.checks,
    activeBlock: null,
    completedBlocks,
    feedback: event.celebrate ?? event.resultText,
    tone: event.celebrate ? "good" : "",
    celebrating: Boolean(event.celebrate),
    status: "idle",
  };
}

export function replayBirdEvents(simulation, events, count) {
  return events.slice(0, count).reduce(
    (state, event, index) => applyBirdEvent(state, event, index + 1),
    initialBirdState(simulation),
  );
}

export function birdReducer(state, action) {
  switch (action.type) {
    case "RESET": return initialBirdState(action.simulation);
    case "RESTORE": return action.state;
    case "SET_PLAYING": return { ...state, playing: action.playing };
    case "START_STEP": return {
      ...state,
      status: "animating",
      activeBlock: action.event.conditionBlockId ?? action.event.blockId,
      condition: action.event.kind === "condition" || (action.event.kind === "tick" && action.event.outcome !== undefined) ? "checking" : state.condition,
      checks: action.event.kind === "condition" || action.event.kind === "tick" ? null : state.checks,
      feedback: action.event.startText,
      tone: "",
      celebrating: false,
    };
    case "SET_HEADING": return { ...state, heading: action.heading };
    case "SET_ACTIVE": return { ...state, activeBlock: action.blockId };
    case "RESOLVE_CONDITION": return { ...state, condition: action.outcome, checks: action.checks ?? null };
    case "FLY_TO": return { ...state, position: action.to, trail: appendPoint(state.trail, action.to) };
    case "FINISH_STEP": return applyBirdEvent(state, action.event, action.cursor);
    default: return state;
  }
}
