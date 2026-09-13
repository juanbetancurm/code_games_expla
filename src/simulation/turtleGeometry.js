// The Turtle canvas is square. One distance unit in a "move forward by N"
// block is TURTLE_SCALE canvas percent, so drawn lengths and angles match the
// block values. Headings: 0° = right, 90° = up (screen y grows downwards).
export const TURTLE_SCALE = 0.8;

const round = (value) => Math.round(value * 100) / 100;

export function walk(from, heading, distance) {
  const radians = (heading * Math.PI) / 180;
  return {
    x: round(from.x + Math.cos(radians) * distance * TURTLE_SCALE),
    y: round(from.y - Math.sin(radians) * distance * TURTLE_SCALE),
  };
}
