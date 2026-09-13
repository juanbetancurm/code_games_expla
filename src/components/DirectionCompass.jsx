import { useState } from "react";

const DIAL_SIZE = 360;
const DIAL_CENTER = DIAL_SIZE / 2;

const directions = [
  { angle: 0, name: "RIGHT", arrow: "→" },
  { angle: 90, name: "UP", arrow: "↑" },
  { angle: 180, name: "LEFT", arrow: "←" },
  { angle: 270, name: "DOWN", arrow: "↓" },
];

function tickPoint(angle, radius) {
  const radians = (-angle * Math.PI) / 180;
  return {
    x: DIAL_CENTER + Math.cos(radians) * radius,
    y: DIAL_CENTER + Math.sin(radians) * radius,
  };
}

export function angleFromDialPoint(x, y) {
  const degrees = (Math.atan2(DIAL_CENTER - y, x - DIAL_CENTER) * 180) / Math.PI;
  return Math.round((degrees + 360) % 360);
}

function describeDirection(angle) {
  const cardinal = directions.find((direction) => direction.angle === angle);
  if (cardinal) return cardinal;
  if (angle < 90) return { name: "UP-RIGHT", arrow: "↗" };
  if (angle < 180) return { name: "UP-LEFT", arrow: "↖" };
  if (angle < 270) return { name: "DOWN-LEFT", arrow: "↙" };
  return { name: "DOWN-RIGHT", arrow: "↘" };
}

export function DirectionCompass() {
  const [open, setOpen] = useState(false);
  const [heading, setHeading] = useState(0);
  const selected = describeDirection(heading);
  const ticks = Array.from({ length: 24 }, (_, index) => index * 15);

  const chooseFromPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * DIAL_SIZE;
    const y = ((event.clientY - bounds.top) / bounds.height) * DIAL_SIZE;
    setHeading(angleFromDialPoint(x, y));
  };

  const adjustWithKeyboard = (event) => {
    if (!["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    const amount = event.shiftKey ? 10 : 1;
    const direction = event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1;
    setHeading((current) => (current + direction * amount + 360) % 360);
  };

  return (
    <>
      <button className="compass-launcher" type="button" onClick={() => setOpen(true)}>
        <span aria-hidden="true">◎</span>
        COMPASS + PROTRACTOR
      </button>
      {open && (
        <div className="compass-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="compass-panel" role="dialog" aria-modal="true" aria-labelledby="compass-title">
            <button className="compass-close" type="button" onClick={() => setOpen(false)} aria-label="Close direction compass">×</button>
            <p className="compass-kicker">OPEN ANYTIME</p>
            <h2 id="compass-title">Compass + 360° protractor</h2>
            <p className="compass-explanation">Click anywhere on the dial. Every angle from 0° to 359° is available.</p>
            <div className="compass-demo">
              <svg
                className="compass-dial"
                viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
                role="slider"
                tabIndex="0"
                aria-label="Choose a heading angle"
                aria-valuemin="0"
                aria-valuemax="359"
                aria-valuenow={heading}
                aria-valuetext={`${heading} degrees, ${selected.name.toLowerCase()}`}
                onPointerDown={chooseFromPointer}
                onKeyDown={adjustWithKeyboard}
              >
                <circle className="compass-dial__face" cx={DIAL_CENTER} cy={DIAL_CENTER} r="132" />
                <circle className="compass-dial__ring" cx={DIAL_CENTER} cy={DIAL_CENTER} r="122" />
                {ticks.map((angle) => {
                  const outer = tickPoint(angle, 122);
                  const inner = tickPoint(angle, angle % 45 === 0 ? 105 : 114);
                  return <line className={angle % 45 === 0 ? "is-major" : ""} key={angle} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} />;
                })}
                <line className="compass-axis" x1="59" y1={DIAL_CENTER} x2="301" y2={DIAL_CENTER} />
                <line className="compass-axis" x1={DIAL_CENTER} y1="59" x2={DIAL_CENTER} y2="301" />
                <g className="compass-cardinal-label" transform="translate(328 180)"><rect x="-25" y="-15" width="50" height="30" rx="9" /><text y="6">0°</text></g>
                <g className="compass-cardinal-label" transform="translate(180 27)"><rect x="-28" y="-15" width="56" height="30" rx="9" /><text y="6">90°</text></g>
                <g className="compass-cardinal-label" transform="translate(29 180)"><rect x="-31" y="-15" width="62" height="30" rx="9" /><text y="6">180°</text></g>
                <g className="compass-cardinal-label" transform="translate(180 333)"><rect x="-31" y="-15" width="62" height="30" rx="9" /><text y="6">270°</text></g>
                <g className="compass-needle" style={{ transform: `rotate(${-heading}deg)` }}>
                  <line x1="104" y1={DIAL_CENTER} x2="275" y2={DIAL_CENTER} />
                  <path d="M298 180 L269 162 L276 180 L269 198 Z" />
                  <circle cx={DIAL_CENTER} cy={DIAL_CENTER} r="10" />
                </g>
              </svg>
              <div className="compass-reading" aria-live="polite">
                <small>SELECTED ANGLE</small>
                <strong>{heading}°</strong>
                <span>{selected.arrow} {selected.name}</span>
              </div>
            </div>
            <div className="compass-choices" aria-label="Choose a main direction">
              {directions.map((direction) => (
                <button
                  className={heading === direction.angle ? "is-selected" : ""}
                  type="button"
                  key={direction.angle}
                  onClick={() => setHeading(direction.angle)}
                >
                  <b>{direction.angle}°</b>
                  <span>{direction.arrow} {direction.name}</span>
                </button>
              ))}
            </div>
            <p className="compass-tip">Try clicking between the main marks: 45°, 135°, 200°…</p>
          </section>
        </div>
      )}
    </>
  );
}
