export function initialTurtleState(simulation) {
  return {
    cursor: 0,
    position: { x: simulation.start.x, y: simulation.start.y },
    heading: simulation.start.heading,
    penDown: true,
    color: "#d7d7d7",
    width: 4,
    segments: [],
    activeBlock: null,
    feedback: "Select NEXT STEP to execute one instruction.",
    loopIteration: 0,
    turning: null,
    status: "idle",
    playing: false,
  };
}

function appendSegment(state, to) {
  if (!state.penDown) return state.segments;
  const from = state.position;
  if (from.x === to.x && from.y === to.y) return state.segments;
  return [...state.segments, { from, to, color: state.color, width: state.width }];
}

export function applyTurtleEvent(state, event, cursor) {
  return {
    ...state,
    cursor,
    position: event.kind === "move" ? event.to : state.position,
    heading: event.kind === "turn" ? event.heading : state.heading,
    penDown: event.kind === "pen" ? event.down : state.penDown,
    color: event.kind === "color" ? event.color : state.color,
    width: event.kind === "width" ? event.width : state.width,
    segments: event.kind === "move" ? appendSegment(state, event.to) : state.segments,
    activeBlock: null,
    feedback: event.celebrate ?? event.resultText,
    loopIteration: event.iteration ?? state.loopIteration,
    turning: null,
    status: "idle",
  };
}

export function replayTurtleEvents(simulation, count) {
  return simulation.events.slice(0, count).reduce(
    (state, event, index) => applyTurtleEvent(state, event, index + 1),
    initialTurtleState(simulation),
  );
}

export function turtleReducer(state, action) {
  switch (action.type) {
    case "RESET": return initialTurtleState(action.simulation);
    case "RESTORE": return { ...action.state, playing: false };
    case "PLAYING": return { ...state, playing: action.value };
    case "START": return {
      ...state,
      activeBlock: action.event.blockId,
      feedback: action.event.startText,
      turning: action.event.kind === "turn" ? action.event : null,
      status: "animating",
    };
    case "PREVIEW": {
      const next = applyTurtleEvent(state, action.event, state.cursor);
      return {
        ...next,
        activeBlock: state.activeBlock,
        feedback: state.feedback,
        turning: state.turning,
        status: "animating",
      };
    }
    case "FINISH": return applyTurtleEvent(state, action.event, action.cursor);
    default: return state;
  }
}
