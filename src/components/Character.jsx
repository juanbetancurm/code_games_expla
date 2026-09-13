import { useEffect, useRef, useState } from "react";
import { directionVectors } from "../simulation/mazeGrid";

// Blockly Games' pegman sprite has 16 facing frames, 22.5° apart, and a turn
// shows the in-between frames one after another. This mirrors that timing.
const STEP_DEGREES = 22.5;
const STEP_MS = 120;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function prefersReducedMotion() {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function mixColor(from, to, amount) {
  const parse = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
  const [a, b] = [parse(from), parse(to)];
  return `rgb(${a.map((channel, index) => Math.round(channel + (b[index] - channel) * amount)).join(",")})`;
}

// Visual-only interpolation: the reducer still owns the final heading.
function useSteppedAngle(target) {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  useEffect(() => {
    const from = shownRef.current;
    const steps = Math.round(Math.abs(target - from) / STEP_DEGREES);
    const show = (angle) => {
      shownRef.current = angle;
      setShown(angle);
    };
    if (steps === 0) return undefined;
    if (steps > 8 || prefersReducedMotion()) {
      show(target);
      return undefined;
    }
    const sign = Math.sign(target - from);
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      show(count >= steps ? target : from + sign * STEP_DEGREES * count);
      if (count >= steps) window.clearInterval(timer);
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [target]);
  return shown;
}

// Screen angle: 0° = east, 90° = south (towards the viewer), -90° = north.
function Pegman({ angle }) {
  const radians = (angle * Math.PI) / 180;
  const across = Math.cos(radians);
  const towardViewer = Math.sin(radians);
  const bodyWidth = 15 + 9 * Math.abs(towardViewer);
  const light = (towardViewer + 1) / 2;
  const bodyFill = mixColor("#d98400", "#ffc21f", light);
  const armFill = mixColor("#b86800", "#eb9a0c", light);
  const chestWidth = bodyWidth * 0.42;
  const chestX = 50 + across * (bodyWidth / 2 - chestWidth / 2 - 1.5) - chestWidth / 2;
  const chestOpacity = clamp((towardViewer + 0.6) / 0.6, 0, 1);
  const armOpacity = clamp((Math.abs(towardViewer) - 0.35) / 0.45, 0, 1);
  const eyes = [25, -25].map((offset) => {
    const eye = radians + (offset * Math.PI) / 180;
    const depth = Math.sin(eye);
    return { x: 50 + 8.2 * Math.cos(eye), width: 2 * clamp(depth, 0.35, 1), opacity: clamp((depth + 0.15) / 0.35, 0, 1) };
  });

  return (
    <svg className="pegman-svg" viewBox="0 0 100 100" aria-hidden="true">
      <path className="pegman-cast-shadow" d="M43 82 L58 82 L85 63 C88 60 85 57 81 58 L68 59 Z" />
      <g transform={`translate(50 82) scale(1 0.5) rotate(${angle})`}>
        <path className="pegman-ground-arrow" d="M5.44 -12.9 L36 0 L5.44 12.9 A14 14 0 1 1 5.44 -12.9 Z" />
      </g>
      <rect className="pegman-outline" x={50 - bodyWidth / 2 - 5} y="46" width="6.5" height="21" rx="3.2" fill={armFill} opacity={armOpacity} />
      <rect className="pegman-outline" x={50 + bodyWidth / 2 - 1.5} y="46" width="6.5" height="21" rx="3.2" fill={armFill} opacity={armOpacity} />
      <rect className="pegman-outline" x={50 - bodyWidth / 2} y="42" width={bodyWidth} height="40" rx={bodyWidth * 0.35} fill={bodyFill} />
      <rect className="pegman-chest" x={chestX} y="47" width={chestWidth} height="27" rx={chestWidth / 2} opacity={chestOpacity} />
      <circle className="pegman-outline" cx="50" cy="31" r="11" fill={bodyFill} />
      {eyes.map((eye, index) => (
        <ellipse className="pegman-eye" key={index} cx={eye.x} cy="30" rx={eye.width} ry="2.4" opacity={eye.opacity} />
      ))}
    </svg>
  );
}

export function Character({ position, direction, headingAngle, bump = false, celebrating = false }) {
  const angle = useSteppedAngle(headingAngle);
  const [dx, dy] = directionVectors[direction];
  return (
    <div
      className={`player ${bump ? "is-bumping" : ""} ${celebrating ? "is-celebrating" : ""}`}
      data-player
      data-facing={direction}
      style={{ "--x": position.x, "--y": position.y, "--bump-x": dx, "--bump-y": dy, "--bump-side": dy === 0 ? 0 : 1 }}
      role="img"
      aria-label={`Character facing ${direction}`}
    >
      <div className="player-motion"><Pegman angle={angle} /></div>
      {bump && <span className="bump-mark" aria-hidden="true">!</span>}
    </div>
  );
}
