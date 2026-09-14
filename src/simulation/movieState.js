// Movie lessons build a program one change at a time. Each event adds a block,
// changes one input (to a number or "time"), or moves blocks. The drawing is
// always derived from the program, so Previous and Reset stay pure replays.
export function eventBlockIds(event) {
  if (event.block) return [event.block.id];
  if (event.blockIds) return event.blockIds;
  return event.blockId ? [event.blockId] : [];
}

export function applyProgramEvent(program, event) {
  if (event.kind === "add") {
    const index = event.index ?? program.length;
    return [...program.slice(0, index), event.block, ...program.slice(index)];
  }
  if (event.kind === "change") {
    return program.map((block) => (block.id === event.blockId ? { ...block, [event.input]: event.value } : block));
  }
  if (event.kind === "move") {
    const moving = program.filter((block) => event.blockIds.includes(block.id));
    const rest = program.filter((block) => !event.blockIds.includes(block.id));
    return [...rest.slice(0, event.toIndex), ...moving, ...rest.slice(event.toIndex)];
  }
  return program;
}

export function initialMovieState(simulation) {
  return {
    cursor: 0,
    program: simulation.startProgram ?? [],
    pending: null,
    activeBlocks: [],
    focusBlockId: null,
    changedInput: null,
    feedback: simulation.intro ?? "Select NEXT STEP to add or change one block.",
    tone: "",
    celebrating: false,
    status: "idle",
    playing: false,
  };
}

export function applyMovieEvent(state, event, cursor) {
  return {
    ...state,
    cursor,
    program: applyProgramEvent(state.program, event),
    pending: null,
    activeBlocks: [],
    focusBlockId: eventBlockIds(event).at(-1) ?? null,
    changedInput: event.kind === "change" ? { blockId: event.blockId, input: event.input } : null,
    feedback: event.celebrate ?? event.resultText,
    tone: event.tone ?? (event.celebrate ? "good" : ""),
    celebrating: Boolean(event.celebrate),
    status: "idle",
  };
}

export function replayMovieEvents(simulation, events, count) {
  return events.slice(0, count).reduce(
    (state, event, index) => applyMovieEvent(state, event, index + 1),
    initialMovieState(simulation),
  );
}

export function finalProgram(simulation, events = simulation.events ?? []) {
  return replayMovieEvents(simulation, events, events.length).program;
}

export function movieReducer(state, action) {
  switch (action.type) {
    case "RESET": return initialMovieState(action.simulation);
    case "RESTORE": return { ...action.state, playing: false };
    case "SET_PLAYING": return { ...state, playing: action.playing };
    case "START": return {
      ...state,
      status: "animating",
      pending: action.event.kind === "add" ? { block: action.event.block, index: action.event.index ?? state.program.length } : null,
      activeBlocks: eventBlockIds(action.event),
      feedback: action.event.startText,
      tone: "",
      celebrating: false,
    };
    case "FINISH": return applyMovieEvent(state, action.event, action.cursor);
    default: return state;
  }
}
