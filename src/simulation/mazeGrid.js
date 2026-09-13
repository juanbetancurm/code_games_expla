// The Maze board is a grid of square tiles, like Blockly Games. Simulation data
// is written in tile coordinates and stored as board percentages so the
// reducer, renderer and tests share one positioning model.
export const MAZE_COLS = 6;
export const MAZE_ROWS = 4;

const round = (value) => Math.round(value * 1000) / 1000;

export const directionVectors = { east: [1, 0], south: [0, 1], west: [-1, 0], north: [0, -1] };
const leftOf = { north: "west", west: "south", south: "east", east: "north" };

// Centre of the tile at (col, row), as board percentages.
export function cell(col, row) {
  return { x: round(((col + 0.5) * 100) / MAZE_COLS), y: round(((row + 0.5) * 100) / MAZE_ROWS) };
}

// Board percentages back to tile coordinates (not rounded).
export function toCell({ x, y }) {
  return { col: (x * MAZE_COLS) / 100 - 0.5, row: (y * MAZE_ROWS) / 100 - 0.5 };
}

// SVG path string through tile centres, in board percentages.
export function route(...cells) {
  return cells.map(([col, row], index) => {
    const point = cell(col, row);
    return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
  }).join(" ");
}

export function routePoints(path) {
  return [...path.matchAll(/[ML]\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g)]
    .map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
}

// The tile next to `position`: straight ahead, or on the character's left.
export function neighbor(position, direction, side = "ahead") {
  const [dx, dy] = directionVectors[side === "left" ? leftOf[direction] : direction];
  const { col, row } = toCell(position);
  return cell(Math.round(col) + dx, Math.round(row) + dy);
}
