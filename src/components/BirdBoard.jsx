import { useContinuousAngle } from "./useContinuousAngle";

function pointStyle(point) {
  return { "--bird-x": point.x, "--bird-y": 100 - point.y };
}

// Top-down bird drawn facing 0° (right). Like Blockly Games' bird sprite, it
// rotates to its heading and flaps while flying.
function BirdSprite({ heading, flapping }) {
  const angle = useContinuousAngle(heading);
  return (
    <svg className={`bird-svg ${flapping ? "is-flapping" : ""}`} viewBox="-60 -60 120 120" style={{ transform: `rotate(${-angle}deg)` }} aria-hidden="true">
      <path className="bird-body" d="M-30 0 L-47 -11 L-41 0 L-47 11 Z" />
      <path className="bird-wing bird-wing--top" d="M-12 -8 C-8 -34 8 -47 24 -45 C14 -31 10 -18 10 -8 Z" />
      <path className="bird-wing bird-wing--bottom" d="M-12 8 C-8 34 8 47 24 45 C14 31 10 18 10 8 Z" />
      <ellipse className="bird-body" cx="-4" cy="0" rx="27" ry="12" />
      <circle className="bird-body" cx="23" cy="0" r="10" />
      <path className="bird-beak" d="M31 -4.5 L43 0 L31 4.5 Z" />
      <circle className="bird-eye" cx="26" cy="-5" r="2.8" /><circle className="bird-pupil" cx="27" cy="-5" r="1.4" />
      <circle className="bird-eye" cx="26" cy="5" r="2.8" /><circle className="bird-pupil" cx="27" cy="5" r="1.4" />
      <path className="bird-heading-tip" d="M49 -7 L60 0 L49 7 Z" />
    </svg>
  );
}

function WormIcon() {
  const d = "M7 27 C11 17 17 33 21 22 S31 13 34 19";
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d={d} fill="none" stroke="#b9506c" strokeWidth="9" strokeLinecap="round" />
      <path d={d} fill="none" stroke="#f08aa4" strokeWidth="6" strokeLinecap="round" />
      <circle cx="34.6" cy="18" r="1.4" fill="#3a2a2f" />
    </svg>
  );
}

function NestIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="20" cy="24" rx="16" ry="9" fill="#8b5e34" stroke="#4d321a" strokeWidth="2" />
      <ellipse cx="20" cy="21" rx="11" ry="5" fill="#5b3b1f" />
      <ellipse cx="16" cy="19.5" rx="3.2" ry="4" fill="#f4efe2" />
      <ellipse cx="23" cy="19" rx="3.2" ry="4" fill="#e9f2f7" />
    </svg>
  );
}

export function BirdBoard({ simulation, state }) {
  const trail = state.trail.map((point) => `${point.x},${100 - point.y}`).join(" ");
  const guides = simulation.guides ?? (simulation.guide ? [simulation.guide] : []);
  const ticks = [0, 20, 40, 60, 80, 100];
  return (
    <article className={`bird-card ${state.celebrating ? "is-celebrating" : ""}`}>
      <div className="maze-topline">
        <span className="challenge-label"><i /> DEMONSTRATION</span>
        <span className="micro-goal">{simulation.challenge}</span>
      </div>
      <div className="bird-stage">
        <div className={`bird-board ${simulation.showAxes ? "bird-board--axes" : ""}`}>
          <svg className="bird-flight-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {simulation.walls?.map((wall, index) => <line className="bird-wall" key={index} x1={wall.x1} y1={100 - wall.y1} x2={wall.x2} y2={100 - wall.y2} />)}
            {guides.map((guide) => guide.axis === "x"
              ? <line className="bird-coordinate-guide" key={guide.label} x1={guide.value} y1="0" x2={guide.value} y2="100" />
              : <line className="bird-coordinate-guide" key={guide.label} x1="0" y1={100 - guide.value} x2="100" y2={100 - guide.value} />)}
            {state.trail.length > 1 && <polyline className="bird-trail" points={trail} />}
          </svg>
          {simulation.showAxes && <>
            <div className="bird-scale bird-scale--x" aria-label="x coordinate scale">{ticks.map((tick) => <span key={tick} style={{ left: `${tick}%` }}>{tick}</span>)}</div>
            <div className="bird-scale bird-scale--y" aria-label="y coordinate scale">{ticks.map((tick) => <span key={tick} style={{ top: `${100 - tick}%` }}>{tick}</span>)}</div>
          </>}
          {guides.map((guide) => <span className={`bird-guide-label bird-guide-label--${guide.axis}`} key={guide.label} style={guide.axis === "x" ? { left: `${guide.value}%` } : { top: `${100 - guide.value}%` }}>{guide.label}</span>)}
          {simulation.worm && !state.hasWorm && <span className="bird-object bird-worm" style={pointStyle(simulation.worm)} role="img" aria-label="Worm"><WormIcon /></span>}
          {simulation.nest && <span className="bird-object bird-nest" style={pointStyle(simulation.nest)} role="img" aria-label="Nest"><NestIcon /></span>}
          <div className="bird-avatar" style={pointStyle(state.position)} role="img" aria-label={`Bird heading ${state.heading} degrees`}>
            <BirdSprite heading={state.heading} flapping={state.status === "animating"} />
          </div>
        </div>
        <aside className="bird-panel" aria-label="Bird status">
          <span className="bird-chip flight-on"><i /> FLIGHT ON</span>
          <span className="bird-chip">HEADING <strong>{state.heading}°</strong></span>
          {simulation.showAxes && <>
            <span className="bird-chip">x <strong>{Math.round(state.position.x)}</strong></span>
            <span className="bird-chip">y <strong>{Math.round(state.position.y)}</strong></span>
          </>}
          {simulation.worm && <span className={`bird-chip ${state.hasWorm ? "has-worm" : ""}`}>WORM <strong>{state.hasWorm ? "✓" : "—"}</strong></span>}
          {state.condition !== null && <div className={`bird-truth ${state.condition === true ? "is-true" : state.condition === false ? "is-false" : ""}`}>
            <small>CONDITION</small><strong>{state.condition === "checking" ? "?" : state.condition ? "TRUE" : "FALSE"}</strong>
          </div>}
        </aside>
      </div>
      <div className={`maze-feedback ${state.tone === "good" ? "is-good" : ""}`} aria-live="polite">{state.feedback}</div>
    </article>
  );
}
