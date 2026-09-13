import { useReducer, useRef } from "react";
import { BirdBoard } from "./BirdBoard";
import { BirdProgram } from "./BirdBlock";
import { ExecutionControls } from "./ExecutionControls";
import { useSectionKeyboard } from "./useSectionKeyboard";
import { countBlocks } from "../simulation/blockCount";
import { birdReducer, initialBirdState, replayBirdEvents } from "../simulation/birdState";

const sleep = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function BirdSimulationSection({ simulation }) {
  const [state, dispatch] = useReducer(birdReducer, simulation, initialBirdState);
  const generation = useRef(0);
  const playingRef = useRef(false);
  const sectionRef = useRef(null);
  const blockCount = countBlocks(simulation.program);

  const reset = () => {
    generation.current += 1;
    playingRef.current = false;
    dispatch({ type: "RESET", simulation });
  };

  async function executeAt(index, runGeneration) {
    const event = simulation.events[index];
    if (!event) return false;
    dispatch({ type: "START_STEP", event });
    await sleep(300);
    if (generation.current !== runGeneration) return false;

    if (event.kind === "heading") {
      dispatch({ type: "SET_HEADING", heading: event.heading });
      await sleep(650);
    } else if (event.kind === "condition") {
      await sleep(300);
      dispatch({ type: "RESOLVE_CONDITION", outcome: event.outcome, checks: event.checks });
      await sleep(600);
    } else if (event.kind === "fly") {
      dispatch({ type: "FLY_TO", to: event.to });
      await sleep(1000);
    } else if (event.kind === "tick") {
      if (event.outcome !== undefined) {
        await sleep(250);
        dispatch({ type: "RESOLVE_CONDITION", outcome: event.outcome, checks: event.checks });
        await sleep(350);
      }
      dispatch({ type: "SET_ACTIVE", blockId: event.blockId });
      dispatch({ type: "SET_HEADING", heading: event.heading });
      await sleep(400);
      dispatch({ type: "FLY_TO", to: event.to });
      await sleep(1000);
    }

    if (generation.current !== runGeneration) return false;
    dispatch({ type: "FINISH_STEP", event, cursor: index + 1 });
    return true;
  }

  async function nextStep() {
    if (state.status !== "idle" || state.cursor >= simulation.events.length) return;
    await executeAt(state.cursor, generation.current);
  }

  function previousStep() {
    if (state.status !== "idle" || state.cursor === 0) return;
    generation.current += 1;
    dispatch({ type: "RESTORE", state: replayBirdEvents(simulation, simulation.events, state.cursor - 1) });
  }

  async function togglePlay() {
    if (playingRef.current) {
      playingRef.current = false;
      dispatch({ type: "SET_PLAYING", playing: false });
      return;
    }
    if (state.cursor >= simulation.events.length) return;
    playingRef.current = true;
    dispatch({ type: "SET_PLAYING", playing: true });
    const runGeneration = generation.current;
    for (let index = state.cursor; index < simulation.events.length && playingRef.current; index += 1) {
      const completed = await executeAt(index, runGeneration);
      if (!completed || generation.current !== runGeneration) break;
      if (index < simulation.events.length - 1) await sleep(400);
    }
    playingRef.current = false;
    if (generation.current === runGeneration) dispatch({ type: "SET_PLAYING", playing: false });
  }

  useSectionKeyboard(sectionRef, { next: nextStep, previous: previousStep, reset, play: togglePlay });

  return (
    <section className={`simulation bird-simulation ${simulation.theme}`} id={`bird-sim-${simulation.id}`} ref={sectionRef}>
      <div className="section-shell">
        <header className="lesson-heading">
          <div><p className="lesson-number">{simulation.eyebrow}</p><h2>{simulation.title}</h2></div>
          <p className="lesson-idea">{simulation.idea}</p>
        </header>
        <div className="demo-grid">
          <BirdBoard simulation={simulation} state={state} />
          <article className="program-card program-card--react bird-program-card">
            <div className="program-card__head"><span>MY PROGRAM</span><span className="block-budget">{blockCount} {blockCount === 1 ? "block" : "blocks"}</span></div>
            <div className={`program-workspace bird-program-workspace ${blockCount === 1 ? "program-workspace--roomy" : ""}`}><BirdProgram program={simulation.program} state={state} /></div>
            <ExecutionControls
              cursor={state.cursor}
              total={simulation.events.length}
              busy={state.status !== "idle"}
              playing={state.playing}
              onReset={reset}
              onPrevious={previousStep}
              onNext={nextStep}
              onPlay={togglePlay}
              unitLabel="MOMENT"
              nextLabel="NEXT MOMENT"
              completeLabel="DEMO COMPLETE"
            />
          </article>
        </div>
        <footer className="concept-strip sequence-text">{simulation.footer}</footer>
      </div>
    </section>
  );
}
