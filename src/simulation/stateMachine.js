import { applyEvent, initialSimulationState } from "./reducer";

export function replayEvents(simulation, events, count) {
  let state = initialSimulationState(simulation);
  for (let index = 0; index < count; index += 1) state = applyEvent(state, events[index], index + 1);
  return { ...state, playing: false, status: "idle", activeBlock: null, turning: null };
}

export function simulationReducer(state, action) {
  switch (action.type) {
    case "RESET": return initialSimulationState(action.simulation);
    case "RESTORE": return action.state;
    case "SET_PLAYING": return { ...state, playing: action.playing };
    case "START_STEP": {
      const { event } = action;
      return {
        ...state,
        status: "animating",
        activeBlock: event.blockId,
        feedback: event.startText,
        tone: "",
        bump: false,
        celebrating: false,
        turning: event.kind === "turn" ? event.turn : null,
        turnFrom: event.kind === "turn" ? state.headingAngle : null,
        condition: event.kind === "condition" ? "checking" : state.condition,
        goalCheck: event.kind === "goalCheck" ? "checking" : state.goalCheck,
      };
    }
    case "TURN_DIRECTION": return {
      ...state,
      direction: action.direction,
      headingAngle: state.headingAngle + (action.turn === "left" ? -90 : 90),
    };
    case "PATCH": return { ...state, ...action.patch };
    case "FINISH_STEP": return applyEvent(state, action.event, action.cursor);
    default: return state;
  }
}
