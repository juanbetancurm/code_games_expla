import { useReducer, useRef } from "react";
import { ExecutionControls } from "./ExecutionControls";
import { TurtleBoard } from "./TurtleBoard";
import { TurtleProgram } from "./TurtleBlock";
import { useSectionKeyboard } from "./useSectionKeyboard";
import { countBlocks } from "../simulation/blockCount";
import { initialTurtleState, replayTurtleEvents, turtleReducer } from "../simulation/turtleState";

const sleep = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function TurtleSimulationSection({ simulation }) {
  const [state, dispatch] = useReducer(turtleReducer, simulation, initialTurtleState);
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
    const current = simulation.events[index];
    if (!current) return false;
    dispatch({ type: "START", event: current });
    await sleep(320);
    if (generation.current !== runGeneration) return false;
    dispatch({ type: "PREVIEW", event: current });
    await sleep(current.kind === "move" ? 1100 : current.kind === "turn" ? 850 : 560);
    if (generation.current !== runGeneration) return false;
    dispatch({ type: "FINISH", event: current, cursor: index + 1 });
    return true;
  }

  const nextStep = async () => {
    if (state.status !== "idle" || state.cursor >= simulation.events.length) return;
    await executeAt(state.cursor, generation.current);
  };

  const previousStep = () => {
    if (state.status !== "idle" || state.cursor === 0) return;
    generation.current += 1;
    dispatch({ type: "RESTORE", state: replayTurtleEvents(simulation, state.cursor - 1) });
  };

  const togglePlay = async () => {
    if (playingRef.current) {
      playingRef.current = false;
      dispatch({ type: "PLAYING", value: false });
      return;
    }
    if (state.cursor >= simulation.events.length) return;
    playingRef.current = true;
    dispatch({ type: "PLAYING", value: true });
    const runGeneration = generation.current;
    for (let index = state.cursor; index < simulation.events.length && playingRef.current; index += 1) {
      const completed = await executeAt(index, runGeneration);
      if (!completed || generation.current !== runGeneration) break;
      await sleep(260);
    }
    playingRef.current = false;
    if (generation.current === runGeneration) dispatch({ type: "PLAYING", value: false });
  };

  useSectionKeyboard(sectionRef, { next: nextStep, previous: previousStep, reset, play: togglePlay });

  return (
    <section className={`simulation turtle-simulation ${simulation.theme}`} id={`turtle-sim-${simulation.id}`} ref={sectionRef}>
      <div className="section-shell">
        <header className="lesson-heading">
          <div><p className="lesson-number">{simulation.eyebrow}</p><h2>{simulation.title}</h2></div>
          <p className="lesson-idea">{simulation.idea}</p>
        </header>
        <div className="demo-grid">
          <TurtleBoard simulation={simulation} state={state} />
          <article className="program-card turtle-program-card">
            <div className="program-card__head"><span>MY PROGRAM</span><span className="block-budget">{blockCount} {blockCount === 1 ? "block" : "blocks"}</span></div>
            <div className={`program-workspace turtle-program-workspace ${blockCount === 1 ? "program-workspace--roomy" : ""}`}><TurtleProgram program={simulation.program} state={state} /></div>
            <ExecutionControls cursor={state.cursor} total={simulation.events.length} busy={state.status !== "idle"} playing={state.playing} onReset={reset} onPrevious={previousStep} onNext={nextStep} onPlay={togglePlay} />
          </article>
        </div>
        <footer className="concept-strip sequence-text">{simulation.footer}</footer>
      </div>
    </section>
  );
}
