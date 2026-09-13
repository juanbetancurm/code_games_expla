import { Character } from "./Character";
import { GoalPin } from "./MazeIcons";
import { directionAngles } from "../simulation/reducer";
import { MAZE_COLS, MAZE_ROWS, neighbor, routePoints, toCell } from "../simulation/mazeGrid";

const tilePoints = (path) => routePoints(path)
  .map((point) => {
    const { col, row } = toCell(point);
    return `${col + 0.5},${row + 0.5}`;
  })
  .join(" ");

const polar = (degrees, radius) => {
  const radians = (degrees * Math.PI) / 180;
  return [Math.cos(radians) * radius, Math.sin(radians) * radius];
};

// A 90° arc drawn on the ground around the character while a turn block runs.
function TurnCue({ position, from, turn }) {
  const to = from + (turn === "left" ? -90 : 90);
  const radius = 0.82;
  const [x0, y0] = polar(from, radius);
  const [x1, y1] = polar(to, radius);
  const tangent = to + (turn === "left" ? -90 : 90);
  return (
    <div className={`turn-cue turn-cue--${turn}`} style={{ "--x": position.x, "--y": position.y }} aria-hidden="true">
      <svg viewBox="-1 -1 2 2">
        <path className="turn-cue__arc" pathLength="1" d={`M ${x0} ${y0} A ${radius} ${radius} 0 0 ${turn === "left" ? 0 : 1} ${x1} ${y1}`} />
        <path className="turn-cue__head" d="M -0.02 -0.13 L 0.2 0 L -0.02 0.13 Z" transform={`translate(${x1} ${y1}) rotate(${tangent})`} />
      </svg>
      <b>TURN {turn.toUpperCase()} 90°</b>
    </div>
  );
}

// Sonar waves towards the tile being checked, then a ✓ / × on that tile.
function LookCue({ position, direction, checking, hasPath }) {
  const target = neighbor(position, direction, "left");
  const waveAngle = directionAngles[direction] - 90;
  const state = checking ? "is-checking" : hasPath ? "has-path" : "no-path";
  return (
    <>
      {checking && (
        <div className="look-waves" style={{ "--x": position.x, "--y": position.y, "--angle": `${waveAngle}deg` }} aria-hidden="true">
          <svg viewBox="-1 -1 2 2">
            {[0.34, 0.58, 0.82].map((radius) => {
              const [ax, ay] = polar(-38, radius);
              const [bx, by] = polar(38, radius);
              return <path key={radius} d={`M ${ax} ${ay} A ${radius} ${radius} 0 0 1 ${bx} ${by}`} />;
            })}
          </svg>
        </div>
      )}
      <div className={`look-tile ${state}`} style={{ "--x": target.x, "--y": target.y }}>
        <span aria-hidden="true">{checking ? "?" : hasPath ? "✓" : "×"}</span>
        <b>{checking ? "PATH ON THE LEFT?" : hasPath ? "PATH!" : "NO PATH"}</b>
      </div>
    </>
  );
}

export function MazeBoard({ simulation, state, goal, routes, pathMode, onPathMode, resetKey }) {
  const isCondition = simulation.id === 6;
  const isLoop = simulation.id === 7;
  const checking = state.condition === "checking";
  const look = checking ? { position: state.position, direction: state.direction } : state.look;
  return (
    <article className={`maze-card ${state.celebrating ? "is-celebrating" : ""} ${state.bump ? "is-bumping" : ""}`}>
      <div className="maze-topline">
        <span className="challenge-label"><i /> CHALLENGE</span>
        <span className="micro-goal">{simulation.challenge}</span>
      </div>
      <div className="maze-stage">
        <div className="maze-board">
          <svg className="maze-tiles" viewBox={`0 0 ${MAZE_COLS} ${MAZE_ROWS}`} aria-hidden="true">
            {Array.from({ length: MAZE_COLS - 1 }, (_, index) => <line key={`col-${index}`} x1={index + 1} y1="0" x2={index + 1} y2={MAZE_ROWS} />)}
            {Array.from({ length: MAZE_ROWS - 1 }, (_, index) => <line key={`row-${index}`} x1="0" y1={index + 1} x2={MAZE_COLS} y2={index + 1} />)}
            {routes.map((path, index) => (
              <g key={index}>
                <polyline className="tile-path-edge" points={tilePoints(path)} />
                <polyline className="tile-path-fill" points={tilePoints(path)} />
                <polyline className="tile-path-dashes" points={tilePoints(path)} />
              </g>
            ))}
          </svg>
          <span className="start-tile" style={{ "--x": simulation.start.x, "--y": simulation.start.y }}><b>START</b></span>
          <span className="goal-marker" style={{ "--x": goal.x, "--y": goal.y }}><GoalPin title="Goal" /></span>
          {simulation.marks?.map((mark) => <span className="grid-mark" key={mark.label} style={{ "--x": mark.x, "--y": mark.y }}>{mark.label}</span>)}
          {isCondition && look && <LookCue position={look.position} direction={look.direction} checking={checking} hasPath={look.outcome ?? pathMode === "left"} />}
          {state.turning && state.turnFrom !== null && <TurnCue position={state.position} from={state.turnFrom} turn={state.turning} />}
          <Character key={resetKey} position={state.position} direction={state.direction} headingAngle={state.headingAngle} bump={state.bump} celebrating={state.celebrating} />
          {isCondition && state.condition !== null && <div className={`condition-badge is-visible ${state.condition === true ? "is-true" : state.condition === false ? "is-false" : ""}`}>
            <span>{checking ? "?" : state.condition ? "✓" : "×"}</span>
            {checking ? "CHECKING…" : state.condition ? "TRUE" : "FALSE"}
          </div>}
          {isLoop && <>
            <div className="loop-counter"><span>LOOP</span><b>{state.loopCount}</b></div>
            <div className={`goal-check ${state.goalCheck === true ? "is-yes" : state.goalCheck === false ? "is-no" : ""}`}><span>At the goal?</span><strong>{state.goalCheck === "checking" ? "…" : state.goalCheck === true ? "YES" : state.goalCheck === false ? "NO" : "—"}</strong></div>
          </>}
        </div>
      </div>
      <div className={`maze-feedback ${state.tone === "good" ? "is-good" : state.tone === "alert" ? "is-alert" : ""} ${isCondition ? "maze-feedback--with-switch" : ""}`} aria-live="polite">
        <span>{state.feedback}</span>
        {isCondition && <span className="path-switch">
          <button className={pathMode === "left" ? "is-selected" : ""} type="button" onClick={() => onPathMode("left")} disabled={state.status !== "idle"}>Path on left</button>
          <button className={pathMode === "straight" ? "is-selected" : ""} type="button" onClick={() => onPathMode("straight")} disabled={state.status !== "idle"}>No left path</button>
        </span>}
      </div>
    </article>
  );
}
