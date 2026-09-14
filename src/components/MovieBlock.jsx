import { useEffect, useRef } from "react";
import { TIME } from "../simulation/movieRender";

const shapeBlocks = {
  circle: { title: "circle", inputs: [["x", "x"], ["y", "y"], ["radius", "radius"]] },
  rect: { title: "rectangle", inputs: [["x", "x"], ["y", "y"], ["width", "width"], ["height", "height"]] },
  line: { title: "line", inputs: [["x1", "start x"], ["y1", "y"], ["x2", "end x"], ["y2", "y"], ["width", "width"]] },
};

function InputValue({ value, time, changed }) {
  const className = `movie-input ${changed ? "is-changed" : ""}`;
  if (value === TIME) {
    return (
      <span className={className}>
        <span className="movie-time-block">time (0→100)</span>
        <span className="movie-time-value">= {Math.round(time)}</span>
      </span>
    );
  }
  return <span className={className}><span className="movie-number">{value}</span></span>;
}

function MovieBlock({ block, state, time, arriving }) {
  const classes = [
    "movie-block",
    `movie-block--${block.kind}`,
    state.activeBlocks.includes(block.id) ? "is-active" : "",
    arriving ? "is-arriving" : "",
    state.status === "idle" && state.focusBlockId === block.id ? "is-focus" : "",
  ].filter(Boolean).join(" ");

  if (block.kind === "colour") {
    return (
      <div className={classes} data-block-id={block.id}>
        <span className="movie-block__title">set colour to</span>
        <span className="movie-swatch" style={{ background: block.colour }} />
        <span className="movie-colour-name">{block.name}</span>
      </div>
    );
  }

  const shape = shapeBlocks[block.kind];
  return (
    <div className={classes} data-block-id={block.id}>
      <span className="movie-block__title">{shape.title}</span>
      {shape.inputs.map(([input, label]) => (
        <span className="movie-block__field" key={input}>
          <span className="movie-block__label">{label}</span>
          <InputValue
            value={block[input]}
            time={time}
            changed={state.changedInput?.blockId === block.id && state.changedInput.input === input}
          />
        </span>
      ))}
    </div>
  );
}

export function MovieProgram({ program, state, time }) {
  const stackRef = useRef(null);
  const blocks = state.pending
    ? [...program.slice(0, state.pending.index), { ...state.pending.block, arriving: true }, ...program.slice(state.pending.index)]
    : program;
  const target = state.pending?.block.id ?? state.activeBlocks.at(-1) ?? state.focusBlockId;

  // Long programs scroll: keep the block that is changing in view.
  useEffect(() => {
    const stack = stackRef.current;
    const container = stack?.parentElement;
    const element = target && stack ? stack.querySelector(`[data-block-id="${target}"]`) : null;
    if (!container || !element || container.scrollHeight <= container.clientHeight) return;
    const offset = element.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    container.scrollTo({ top: Math.max(0, offset - container.clientHeight / 2 + element.offsetHeight / 2), behavior: reduceMotion ? "auto" : "smooth" });
  }, [target, state.cursor]);

  return (
    <div className="movie-program-stack" ref={stackRef}>
      {blocks.length === 0 && <p className="movie-empty">Empty program: select NEXT STEP</p>}
      {blocks.map((block) => <MovieBlock key={block.id} block={block} state={state} time={time} arriving={Boolean(block.arriving)} />)}
    </div>
  );
}
