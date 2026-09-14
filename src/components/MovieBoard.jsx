import { useState } from "react";
import { penColour, renderProgram } from "../simulation/movieRender";

export const FRAME_TIMES = [0, 25, 50, 75, 100];
const TICKS = [10, 20, 30, 40, 50, 60, 70, 80, 90];
const LABELS = [20, 40, 60, 80];
const HATCH = [["head", "#ff9f9f"], ["body", "#a3a8ff"], ["arm", "#b9b9b9"]];

// Shapes are drawn in canvas units (y up) inside a flipped group; guides and
// text are drawn in screen units, so they convert y with toScreen.
const toScreen = (y) => 100 - y;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const shown = (value) => Math.round(value);
const FLIP = "translate(0 100) scale(1 -1)";

export function ShapeList({ shapes, focusId = null, pulseKey = 0 }) {
  return shapes.map((shape) => {
    const isNew = shape.id === focusId;
    const key = isNew ? `${shape.id}-${pulseKey}` : shape.id;
    const className = isNew ? "movie-shape is-new" : "movie-shape";
    if (shape.kind === "circle") return <circle key={key} className={className} cx={shape.x} cy={shape.y} r={shape.radius} fill={shape.colour} />;
    if (shape.kind === "rect") {
      return <rect key={key} className={className} x={shape.x - shape.width / 2} y={shape.y - shape.height / 2} width={shape.width} height={shape.height} fill={shape.colour} />;
    }
    return <line key={key} className={className} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke={shape.colour} strokeWidth={shape.width} />;
  });
}

function TargetShapes({ shapes, prefix }) {
  return shapes.map((shape, index) => {
    const paint = `url(#${prefix}-${shape.tone})`;
    if (shape.kind === "circle") return <circle key={index} cx={shape.x} cy={shape.y} r={shape.radius} fill={paint} />;
    if (shape.kind === "rect") return <rect key={index} x={shape.x - shape.width / 2} y={shape.y - shape.height / 2} width={shape.width} height={shape.height} fill={paint} />;
    return <line key={index} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} stroke={paint} strokeWidth={shape.width} />;
  });
}

function Rulers() {
  return (
    <g className="movie-rulers" aria-hidden="true">
      {TICKS.map((tick) => (
        <g key={tick}>
          <line x1="0" y1={toScreen(tick)} x2={tick % 20 === 0 ? 2.2 : 1.2} y2={toScreen(tick)} />
          <line x1={tick} y1="100" x2={tick} y2={tick % 20 === 0 ? 97.8 : 98.8} />
        </g>
      ))}
      {LABELS.map((label) => (
        <g key={label}>
          <text x="3" y={toScreen(label) + 1.2}>{label}</text>
          <text x={label} y="96.4" textAnchor="middle">{label}</text>
        </g>
      ))}
    </g>
  );
}

function GuideLine(props) {
  return <><line {...props} className="guide-halo" /><line {...props} className="guide-line" /></>;
}

function CircleGuide({ shape }) {
  const cx = shape.x;
  const cy = toScreen(shape.y);
  const direction = cx + shape.radius <= 99 ? 1 : -1;
  const edge = cx + direction * shape.radius;
  const labelY = cy + shape.radius + 4.6 <= 97 ? cy + shape.radius + 4.6 : cy - shape.radius - 2.2;
  // Near the top edge the radius label goes under its line, away from the readout.
  const radiusLabelY = cy - 1.6 >= 8 ? cy - 1.6 : cy + 4.2;
  return (
    <g className="movie-guide">
      <GuideLine x1={cx} y1={cy} x2={edge} y2={cy} />
      <GuideLine x1={edge} y1={cy - 1.2} x2={edge} y2={cy + 1.2} />
      <circle cx={cx} cy={cy} r="1" className="guide-dot" />
      <text x={clamp((cx + edge) / 2, 12, 88)} y={clamp(radiusLabelY, 5, 97)}>radius {shown(shape.radius)}</text>
      <text x={clamp(cx, 16, 84)} y={clamp(labelY, 5, 97)}>centre ({shown(shape.x)}, {shown(shape.y)})</text>
    </g>
  );
}

function RectGuide({ shape }) {
  const left = clamp(shape.x - shape.width / 2, 0.5, 99.5);
  const right = clamp(shape.x + shape.width / 2, 0.5, 99.5);
  const top = clamp(toScreen(shape.y + shape.height / 2), 0.5, 99.5);
  const bottom = clamp(toScreen(shape.y - shape.height / 2), 0.5, 99.5);
  const cx = shape.x;
  const cy = clamp(toScreen(shape.y), 1, 99);
  const widthY = top - 2.6 >= 5 ? top - 2.6 : Math.min(bottom + 2.6, 96);
  // Height arrow beside the rectangle; a full-width rectangle gets it beside the centre label.
  let heightX = Math.min(cx + 22, 82);
  if (right + 2.6 <= 97) heightX = right + 2.6;
  else if (left - 2.6 >= 3) heightX = left - 2.6;
  const labelOnRight = heightX >= cx;
  const centreY = cy + 4.6 <= 97 ? cy + 4.6 : cy - 2.4;
  return (
    <g className="movie-guide">
      <GuideLine x1={left} y1={widthY} x2={right} y2={widthY} />
      <GuideLine x1={left} y1={widthY - 1.2} x2={left} y2={widthY + 1.2} />
      <GuideLine x1={right} y1={widthY - 1.2} x2={right} y2={widthY + 1.2} />
      <text x={clamp((left + right) / 2, 12, 88)} y={clamp(widthY - 1.5, 5, 97)}>width {shown(shape.width)}</text>
      <GuideLine x1={heightX} y1={top} x2={heightX} y2={bottom} />
      <GuideLine x1={heightX - 1.2} y1={top} x2={heightX + 1.2} y2={top} />
      <GuideLine x1={heightX - 1.2} y1={bottom} x2={heightX + 1.2} y2={bottom} />
      <text x={labelOnRight ? heightX + 1.6 : heightX - 1.6} y={clamp((top + bottom) / 2 + 1.2, 5, 97)} textAnchor={labelOnRight ? "start" : "end"}>height {shown(shape.height)}</text>
      <circle cx={cx} cy={cy} r="1" className="guide-dot" />
      <text x={clamp(cx, 16, 84)} y={clamp(centreY, 5, 97)}>centre ({shown(shape.x)}, {shown(shape.y)})</text>
    </g>
  );
}

function LineGuide({ shape }) {
  const start = { x: shape.x1, y: toScreen(shape.y1) };
  const end = { x: shape.x2, y: toScreen(shape.y2) };
  const labelY = (point, other) => (point.y <= other.y ? point.y - 2.4 : point.y + 4.8);
  return (
    <g className="movie-guide">
      <circle cx={start.x} cy={start.y} r="1.1" className="guide-dot" />
      <circle cx={end.x} cy={end.y} r="1.1" className="guide-dot" />
      <text x={clamp(start.x, 16, 84)} y={clamp(labelY(start, end), 5, 97)}>start ({shown(shape.x1)}, {shown(shape.y1)})</text>
      <text x={clamp(end.x, 16, 84)} y={clamp(labelY(end, start), 5, 97)}>end ({shown(shape.x2)}, {shown(shape.y2)})</text>
    </g>
  );
}

function Guide({ shape }) {
  if (shape.kind === "circle") return <CircleGuide shape={shape} />;
  if (shape.kind === "rect") return <RectGuide shape={shape} />;
  return <LineGuide shape={shape} />;
}

export function MovieBoard({ simulation, state, time, moviePlaying, onToggleMovie, onScrub }) {
  const [pointer, setPointer] = useState(null);
  const yourTurn = simulation.mode === "yourTurn";
  const program = yourTurn ? simulation.demo ?? [] : state.program;
  const hasTimeline = simulation.mode === "movie" || Boolean(simulation.demo);
  const shapes = renderProgram(program, time);
  const focus = !yourTurn && !moviePlaying ? shapes.find((shape) => shape.id === state.focusBlockId) : null;
  const pen = penColour(program);
  const prefix = `movie-hatch-${simulation.id}`;
  const nearestFrame = FRAME_TIMES.reduce((best, frame) => (Math.abs(frame - time) < Math.abs(best - time) ? frame : best), 0);
  const feedback = yourTurn ? simulation.feedback : state.feedback;
  const tone = yourTurn ? "" : state.tone;

  const readPointer = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - box.left) / box.width) * 100);
    const y = Math.round(100 - ((event.clientY - box.top) / box.height) * 100);
    setPointer({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
  };

  return (
    <article className={`movie-card ${hasTimeline ? "movie-card--timeline" : ""} ${!yourTurn && state.celebrating ? "is-celebrating" : ""}`}>
      <div className="maze-topline">
        <span className="challenge-label"><i /> {yourTurn ? "YOUR TURN" : "DEMONSTRATION"}</span>
        <span className="micro-goal">{simulation.challenge}</span>
      </div>
      <div className="movie-stage">
        <div className="movie-canvas" onPointerMove={readPointer} onPointerLeave={() => setPointer(null)}>
          <svg viewBox="0 0 100 100" role="img" aria-label={simulation.target ? "Striped picture to draw" : "Movie canvas"}>
            <defs>
              {HATCH.map(([tone, paint]) => (
                <pattern key={tone} id={`${prefix}-${tone}`} width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="1.2" height="2.4" fill={paint} />
                </pattern>
              ))}
            </defs>
            {simulation.target && <g transform={FLIP}><TargetShapes shapes={simulation.target} prefix={prefix} /></g>}
            <g transform={FLIP}><ShapeList shapes={shapes} focusId={focus?.id} pulseKey={state.cursor} /></g>
            <Rulers />
            {focus && <Guide shape={focus} />}
          </svg>
          <div className={`movie-readout ${pointer ? "" : "is-idle"}`} aria-hidden="true">
            {pointer ? `x = ${pointer.x}   y = ${pointer.y}` : "point to read x, y"}
          </div>
        </div>
        <aside className="movie-panel" aria-label="Canvas status">
          {hasTimeline ? (
            <>
              <span className="movie-chip movie-chip--time">TIME <strong>{shown(time)}</strong></span>
              <div className="movie-frames" role="group" aria-label="Movie frames">
                <small>FRAMES</small>
                {FRAME_TIMES.map((frame) => (
                  <button type="button" key={frame} className={`movie-frame ${frame === nearestFrame ? "is-current" : ""}`} onClick={() => onScrub(frame)} aria-label={`Show time ${frame}`}>
                    <svg viewBox="0 0 100 100" aria-hidden="true"><g transform={FLIP}><ShapeList shapes={renderProgram(program, frame)} /></g></svg>
                    <span>{frame}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {!yourTurn && <span className="movie-chip">PEN {pen ? <i style={{ background: pen.colour }} title={pen.name} /> : <strong>—</strong>}</span>}
              {!yourTurn && <span className="movie-chip">SHAPES <strong>{shapes.length}</strong></span>}
              {simulation.tip && <p className="movie-tip">{simulation.tip}</p>}
            </>
          )}
        </aside>
      </div>
      {hasTimeline && (
        <div className="movie-timeline">
          <button type="button" className={`movie-play ${moviePlaying ? "is-playing" : ""}`} onClick={onToggleMovie} aria-label={moviePlaying ? "Pause the movie" : "Play the movie"} title={moviePlaying ? "Pause the movie" : "Play the movie"}>
            {moviePlaying ? "❚❚" : "▶"}
          </button>
          <input type="range" min="0" max="100" step="1" value={shown(time)} onChange={(event) => onScrub(Number(event.target.value))} aria-label="time" />
          <output>time = {shown(time)}</output>
        </div>
      )}
      <div className={`maze-feedback movie-feedback ${tone === "good" ? "is-good" : tone === "alert" ? "is-alert" : ""}`} aria-live="polite">{feedback}</div>
    </article>
  );
}
