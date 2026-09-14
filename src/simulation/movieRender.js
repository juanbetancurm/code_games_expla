// Blockly Games Movie drawing rules. The canvas is 0–100 on both axes with y
// growing upward; circle and rectangle x/y are the centre; blocks run top to
// bottom and later shapes paint on top. An input value is a number or "time".
export const TIME = "time";

export const valueAt = (value, time) => (value === TIME ? time : value);

export const usesTime = (block) => Object.values(block).includes(TIME);

export function renderProgram(program, time = 0) {
  let colour = "#000000";
  const shapes = [];
  for (const block of program) {
    const at = (value) => valueAt(value, time);
    if (block.kind === "colour") {
      colour = block.colour;
    } else if (block.kind === "circle") {
      shapes.push({ id: block.id, kind: "circle", colour, x: at(block.x), y: at(block.y), radius: at(block.radius) });
    } else if (block.kind === "rect") {
      shapes.push({ id: block.id, kind: "rect", colour, x: at(block.x), y: at(block.y), width: at(block.width), height: at(block.height) });
    } else if (block.kind === "line") {
      shapes.push({ id: block.id, kind: "line", colour, x1: at(block.x1), y1: at(block.y1), x2: at(block.x2), y2: at(block.y2), width: at(block.width) });
    }
  }
  return shapes;
}

// Axis-aligned bounds in canvas units (y up).
export function shapeBounds(shape) {
  if (shape.kind === "circle") {
    return { left: shape.x - shape.radius, right: shape.x + shape.radius, bottom: shape.y - shape.radius, top: shape.y + shape.radius };
  }
  if (shape.kind === "rect") {
    return { left: shape.x - shape.width / 2, right: shape.x + shape.width / 2, bottom: shape.y - shape.height / 2, top: shape.y + shape.height / 2 };
  }
  return { left: Math.min(shape.x1, shape.x2), right: Math.max(shape.x1, shape.x2), bottom: Math.min(shape.y1, shape.y2), top: Math.max(shape.y1, shape.y2) };
}

// True when the point is painted by a filled shape (lines are ignored).
export function containsPoint(shape, x, y) {
  if (shape.kind === "circle") return (x - shape.x) ** 2 + (y - shape.y) ** 2 <= shape.radius ** 2;
  if (shape.kind === "rect") {
    const bounds = shapeBounds(shape);
    return x >= bounds.left && x <= bounds.right && y >= bounds.bottom && y <= bounds.top;
  }
  return false;
}

// The pen after the whole program has run: what the next shape would use.
export function penColour(program) {
  const last = [...program].reverse().find((block) => block.kind === "colour");
  return last ? { colour: last.colour, name: last.name } : null;
}
