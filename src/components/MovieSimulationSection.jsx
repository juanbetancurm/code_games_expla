import { useEffect, useReducer, useRef, useState } from "react";
import { ExecutionControls } from "./ExecutionControls";
import { MovieBoard } from "./MovieBoard";
import { MovieProgram } from "./MovieBlock";
import { useSectionKeyboard } from "./useSectionKeyboard";
import { countBlocks } from "../simulation/blockCount";
import { initialMovieState, movieReducer, replayMovieEvents } from "../simulation/movieState";

const sleep = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
const MOVIE_MS = 5000;

// The movie clock: time runs from 0 to 100 in five seconds. The slider and the
// frame thumbnails jump to a value. It is display state, not part of replay.
function useMovieClock() {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!playing) return undefined;
    let frame = 0;
    let last = performance.now();
    const tick = (now) => {
      const next = Math.min(100, timeRef.current + (Math.max(0, now - last) / MOVIE_MS) * 100);
      last = now;
      timeRef.current = next;
      setTime(next);
      if (next >= 100) setPlaying(false);
      else frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [playing]);

  const jump = (value) => {
    timeRef.current = value;
    setTime(value);
  };

  return {
    time,
    playing,
    play: (from = timeRef.current >= 100 ? 0 : timeRef.current) => {
      jump(from);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    scrub: (value) => {
      setPlaying(false);
      jump(value);
    },
  };
}

function YourTurnCard({ simulation, hintsShown, onHint, onHideHints }) {
  const allShown = hintsShown >= simulation.hints.length;
  return (
    <article className="program-card movie-turn-card">
      <div className="program-card__head"><span>YOUR TURN</span><span className="block-budget">no numbers here</span></div>
      <div className="movie-turn-body">
        <h3>Checklist</h3>
        <ul className="movie-checklist">
          {simulation.checklist.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <h3>Hints <small>one at a time</small></h3>
        {hintsShown === 0 && <p className="movie-hint-empty">Try first. Ask for a hint only when you are stuck.</p>}
        <ol className="movie-hints">
          {simulation.hints.slice(0, hintsShown).map((hint) => <li key={hint}>{hint}</li>)}
        </ol>
      </div>
      <div className="movie-turn-actions">
        <button type="button" onClick={onHint} disabled={allShown}>{allShown ? "All hints shown" : `Show hint ${hintsShown + 1} of ${simulation.hints.length}`}</button>
        {hintsShown > 0 && <button type="button" className="is-quiet" onClick={onHideHints}>Hide hints</button>}
        <a href={simulation.link.href} target="_blank" rel="noreferrer">{simulation.link.label} ↗</a>
      </div>
    </article>
  );
}

export function MovieSimulationSection({ simulation }) {
  const variantKeys = simulation.variants ? Object.keys(simulation.variants) : [];
  const [variantKey, setVariantKey] = useState(variantKeys[0] ?? null);
  const variant = variantKey ? simulation.variants[variantKey] : null;
  const events = variant?.events ?? simulation.events ?? [];
  const footer = variant?.footer ?? simulation.footer;
  const yourTurn = simulation.mode === "yourTurn";

  const [state, dispatch] = useReducer(movieReducer, simulation, initialMovieState);
  const [hintsShown, setHintsShown] = useState(0);
  const clock = useMovieClock();
  const generation = useRef(0);
  const playingRef = useRef(false);
  const sectionRef = useRef(null);
  const blockCount = countBlocks(state.program);

  const reset = () => {
    generation.current += 1;
    playingRef.current = false;
    clock.scrub(0);
    setHintsShown(0);
    dispatch({ type: "RESET", simulation });
  };

  const chooseVariant = (key) => {
    if (state.status !== "idle" || key === variantKey) return;
    reset();
    setVariantKey(key);
  };

  async function executeAt(index, runGeneration) {
    const event = events[index];
    if (!event) return false;
    dispatch({ type: "START", event });
    await sleep(event.kind === "add" ? 650 : 800);
    if (generation.current !== runGeneration) return false;
    dispatch({ type: "FINISH", event, cursor: index + 1 });
    if (event.play) clock.play(0);
    else if (event.time !== undefined) clock.scrub(event.time);
    return true;
  }

  const nextStep = async () => {
    if (yourTurn || state.status !== "idle" || state.cursor >= events.length) return;
    await executeAt(state.cursor, generation.current);
  };

  const previousStep = () => {
    if (yourTurn || state.status !== "idle" || state.cursor === 0) return;
    generation.current += 1;
    clock.pause();
    dispatch({ type: "RESTORE", state: replayMovieEvents(simulation, events, state.cursor - 1) });
  };

  const togglePlay = async () => {
    if (playingRef.current) {
      playingRef.current = false;
      dispatch({ type: "SET_PLAYING", playing: false });
      return;
    }
    if (state.cursor >= events.length) return;
    playingRef.current = true;
    dispatch({ type: "SET_PLAYING", playing: true });
    const runGeneration = generation.current;
    for (let index = state.cursor; index < events.length && playingRef.current; index += 1) {
      const completed = await executeAt(index, runGeneration);
      if (!completed || generation.current !== runGeneration) break;
      if (index < events.length - 1) await sleep(events[index].play ? MOVIE_MS + 400 : 550);
    }
    playingRef.current = false;
    if (generation.current === runGeneration) dispatch({ type: "SET_PLAYING", playing: false });
  };

  const toggleMovie = () => (clock.playing ? clock.pause() : clock.play());

  useSectionKeyboard(sectionRef, {
    next: nextStep,
    previous: previousStep,
    reset,
    play: yourTurn ? toggleMovie : togglePlay,
  });

  return (
    <section className={`simulation movie-simulation ${simulation.theme}`} id={`movie-sim-${simulation.id}`} ref={sectionRef}>
      <div className="section-shell">
        <header className="lesson-heading">
          <div><p className="lesson-number">{simulation.eyebrow}</p><h2>{simulation.title}</h2></div>
          <p className="lesson-idea">{simulation.idea}</p>
        </header>
        <div className="demo-grid">
          <MovieBoard simulation={simulation} state={state} time={clock.time} moviePlaying={clock.playing} onToggleMovie={toggleMovie} onScrub={clock.scrub} />
          {yourTurn ? (
            <YourTurnCard simulation={simulation} hintsShown={hintsShown} onHint={() => setHintsShown((count) => count + 1)} onHideHints={() => setHintsShown(0)} />
          ) : (
            <article className={`program-card movie-program-card ${simulation.variants ? "movie-program-card--variants" : ""}`}>
              <div className="program-card__head">
                <span>MY PROGRAM</span>
                <span className="movie-toolbox" title="Toolbox categories in Blockly Games">MOVIE · COLOUR</span>
                <span className="block-budget">{blockCount} {blockCount === 1 ? "block" : "blocks"}</span>
              </div>
              {simulation.variants && (
                <div className="movie-variant-switch" role="group" aria-label="Program version">
                  {variantKeys.map((key) => (
                    <button type="button" key={key} className={key === variantKey ? "is-selected" : ""} onClick={() => chooseVariant(key)} disabled={state.status !== "idle"}>
                      {simulation.variants[key].label}
                    </button>
                  ))}
                </div>
              )}
              <div className="program-workspace movie-program-workspace">
                <MovieProgram program={state.program} state={state} time={clock.time} />
              </div>
              <ExecutionControls
                cursor={state.cursor}
                total={events.length}
                busy={state.status !== "idle"}
                playing={state.playing}
                onReset={reset}
                onPrevious={previousStep}
                onNext={nextStep}
                onPlay={togglePlay}
              />
            </article>
          )}
        </div>
        <footer className="concept-strip sequence-text">{footer}</footer>
      </div>
    </section>
  );
}
