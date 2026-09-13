import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { BlockStack } from "./BlocklyBlock";
import { MazeBoard } from "./MazeBoard";
import { ExecutionControls } from "./ExecutionControls";
import { useSectionKeyboard } from "./useSectionKeyboard";
import { countBlocks } from "../simulation/blockCount";
import { initialSimulationState } from "../simulation/reducer";
import { replayEvents, simulationReducer } from "../simulation/stateMachine";

const sleep = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function SimulationSection({ simulation }) {
  const [programMode, setProgramMode] = useState("correct");
  const [pathMode, setPathMode] = useState("left");
  const generation = useRef(0);
  const playingRef = useRef(false);
  const sectionRef = useRef(null);

  const selected = useMemo(() => {
    const programVariant = simulation.variants?.[programMode];
    const pathVariant = simulation.pathVariants?.[pathMode];
    return {
      program: programVariant?.program ?? simulation.program,
      events: programVariant?.events ?? pathVariant?.events ?? simulation.events,
      goal: pathVariant?.goal ?? simulation.goal,
      routes: pathVariant?.routes ?? simulation.routes,
      footer: programVariant?.footer ?? pathVariant?.footer ?? simulation.footer,
    };
  }, [simulation, programMode, pathMode]);

  const [state, dispatch] = useReducer(simulationReducer, simulation, initialSimulationState);

  const reset = () => {
    generation.current += 1;
    playingRef.current = false;
    dispatch({ type: "RESET", simulation });
  };

  useEffect(() => { reset(); }, [programMode, pathMode]);

  async function executeAt(index, runGeneration) {
    const event = selected.events[index];
    if (!event) return false;
    dispatch({ type: "START_STEP", event });
    await sleep(320);
    if (generation.current !== runGeneration) return false;

    if (event.kind === "move") {
      dispatch({ type: "PATCH", patch: { position: event.to } });
      await sleep(900);
    } else if (event.kind === "turn") {
      // The character shows four 22.5° frames (~480 ms), then holds the new facing.
      dispatch({ type: "TURN_DIRECTION", direction: event.direction, turn: event.turn });
      await sleep(900);
    } else if (event.kind === "condition") {
      await sleep(550);
      dispatch({ type: "PATCH", patch: { condition: event.outcome } });
      await sleep(650);
    } else if (event.kind === "goalCheck") {
      await sleep(450);
      dispatch({ type: "PATCH", patch: { goalCheck: event.outcome } });
      await sleep(550);
    } else if (event.kind === "bump") {
      dispatch({ type: "PATCH", patch: { bump: true } });
      await sleep(750);
    }

    if (generation.current !== runGeneration) return false;
    dispatch({ type: "FINISH_STEP", event, cursor: index + 1 });
    return true;
  }

  async function nextStep() {
    if (state.status !== "idle" || state.cursor >= selected.events.length) return;
    const runGeneration = generation.current;
    await executeAt(state.cursor, runGeneration);
  }

  function previousStep() {
    if (state.status !== "idle" || state.cursor === 0) return;
    generation.current += 1;
    dispatch({ type: "RESTORE", state: replayEvents(simulation, selected.events, state.cursor - 1) });
  }

  async function togglePlay() {
    if (playingRef.current) {
      playingRef.current = false;
      dispatch({ type: "SET_PLAYING", playing: false });
      return;
    }
    if (state.cursor >= selected.events.length) return;
    playingRef.current = true;
    dispatch({ type: "SET_PLAYING", playing: true });
    const runGeneration = generation.current;
    for (let index = state.cursor; index < selected.events.length && playingRef.current; index += 1) {
      const completed = await executeAt(index, runGeneration);
      if (!completed || generation.current !== runGeneration) break;
      if (index < selected.events.length - 1) await sleep(500);
    }
    playingRef.current = false;
    if (generation.current === runGeneration) dispatch({ type: "SET_PLAYING", playing: false });
  }

  useSectionKeyboard(sectionRef, { next: nextStep, previous: previousStep, reset, play: togglePlay });

  const setMode = (mode) => { if (state.status === "idle") setProgramMode(mode); };
  const setPath = (mode) => { if (state.status === "idle") setPathMode(mode); };
  const blockCount = countBlocks(selected.program);
  const stopped = state.cursor >= selected.events.length && selected.events.at(-1)?.kind === "bump";

  return (
    <section className={`simulation ${simulation.theme}`} id={`sim-${simulation.id}`} ref={sectionRef}>
      <div className="section-shell">
        <header className="lesson-heading">
          <div><p className="lesson-number">{simulation.eyebrow}</p><h2>{simulation.title}</h2></div>
          <p className="lesson-idea">{simulation.idea}</p>
        </header>
        <div className="demo-grid">
          <MazeBoard simulation={simulation} state={state} goal={selected.goal} routes={selected.routes} pathMode={pathMode} onPathMode={setPath} resetKey={generation.current} />
          <article className="program-card program-card--react">
            <div className="program-card__head"><span>MY PROGRAM</span><span className="block-budget">{blockCount} {blockCount === 1 ? "block" : "blocks"}</span></div>
            {simulation.variants && <div className="mode-switch">
              {Object.entries(simulation.variants).map(([key, variant]) => <button type="button" key={key} className={programMode === key ? "is-selected" : ""} onClick={() => setMode(key)} disabled={state.status !== "idle"}>{variant.label}</button>)}
            </div>}
            <div className={`program-workspace ${simulation.id >= 5 ? "program-workspace--compact" : "program-workspace--centered program-workspace--roomy"}`}>
              <BlockStack program={selected.program} state={state} stopped={stopped} />
            </div>
            <ExecutionControls cursor={state.cursor} total={selected.events.length} busy={state.status !== "idle"} playing={state.playing} stopped={stopped} onReset={reset} onPrevious={previousStep} onNext={nextStep} onPlay={togglePlay} />
          </article>
        </div>
        <footer className="concept-strip sequence-text">{selected.footer}</footer>
      </div>
    </section>
  );
}
