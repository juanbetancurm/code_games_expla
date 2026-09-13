// Upright red map pin, like Blockly Games' maze/marker.png. The tip of the pin
// is at the bottom centre of the SVG so it can stand on a tile centre.
export function GoalPin({ className = "", title }) {
  return (
    <svg className={`goal-pin-svg ${className}`} viewBox="0 0 24 36" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : "true"}>
      <path d="M12 35 C9 27 2 21 2 12 A10 10 0 0 1 22 12 C22 21 15 27 12 35 Z" fill="#ef4f43" stroke="#7d1f19" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" fill="#7d1f19" />
      <ellipse cx="8.5" cy="7.5" rx="2.4" ry="1.5" fill="#ffb3aa" opacity=".8" />
    </svg>
  );
}
