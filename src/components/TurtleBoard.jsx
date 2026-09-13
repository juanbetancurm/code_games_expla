import { useContinuousAngle } from "./useContinuousAngle";

export function TurtleBoard({ simulation, state }) {
  const heading = useContinuousAngle(state.heading);
  return (
    <article className="turtle-card">
      <div className="maze-topline">
        <span className="challenge-label"><i /> DEMONSTRATION</span>
        <span className="micro-goal">{simulation.challenge}</span>
      </div>
      <div className="turtle-stage">
        <div className="turtle-canvas">
          <svg className="turtle-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Turtle drawing">
            {state.segments.map((segment, index) => (
              <line
                className={index === state.segments.length - 1 && state.status === "animating" ? "is-drawing" : ""}
                key={`${index}-${segment.to.x}-${segment.to.y}`}
                x1={segment.from.x}
                y1={segment.from.y}
                x2={segment.to.x}
                y2={segment.to.y}
                stroke={segment.color}
                strokeWidth={segment.width}
                pathLength="1"
              />
            ))}
          </svg>
          {state.turning && (
            <div className={`turtle-turn-arc turtle-turn-arc--${state.turning.direction}`} style={{ left: `${state.position.x}%`, top: `${state.position.y}%` }}>
              <b>{state.turning.turnAmount}°</b>
            </div>
          )}
          <div
            className="turtle-cursor"
            style={{ "--x": state.position.x, "--y": state.position.y, transform: `translate(-50%,-50%) rotate(${90 - heading}deg)` }}
            aria-label={`Turtle heading ${state.heading} degrees`}
          >
            <i className="turtle-cursor__nose" />
            <span />
            <b className={state.penDown ? "is-down" : ""} />
          </div>
        </div>
        <aside className="turtle-panel" aria-label="Turtle status">
          <span className={`turtle-chip ${state.penDown ? "is-down" : "is-up"}`}>PEN <strong>{state.penDown ? "DOWN" : "UP"}</strong></span>
          <span className="turtle-chip">HEADING <strong>{state.heading}°</strong></span>
          <span className="turtle-chip">COLOUR <i style={{ background: state.color }} /></span>
          <span className="turtle-chip">WIDTH <strong>{state.width}</strong></span>
          {simulation.loopTimes && <span className="turtle-chip turtle-chip--loop">ITERATION <strong>{state.loopIteration} / {simulation.loopTimes}</strong></span>}
        </aside>
      </div>
      <div className="turtle-feedback" aria-live="polite">{state.feedback}</div>
    </article>
  );
}
