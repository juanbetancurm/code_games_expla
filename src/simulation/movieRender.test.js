import { describe, expect, it } from "vitest";
import { containsPoint, penColour, renderProgram, shapeBounds, TIME, usesTime } from "./movieRender";

const red = { id: "red", kind: "colour", colour: "#ff0000", name: "red" };
const blue = { id: "blue", kind: "colour", colour: "#0000ff", name: "blue" };

describe("Movie drawing rules", () => {
  it("places rectangles and circles by their centre", () => {
    const [rect, circle] = renderProgram([
      { id: "house", kind: "rect", x: 40, y: 19, width: 50, height: 30 },
      { id: "sun", kind: "circle", x: 80, y: 80, radius: 10 },
    ]);
    expect(shapeBounds(rect)).toEqual({ left: 15, right: 65, bottom: 4, top: 34 });
    expect(shapeBounds(circle)).toEqual({ left: 70, right: 90, bottom: 70, top: 90 });
  });

  it("keeps the pen colour until the next set colour block", () => {
    const shapes = renderProgram([
      red,
      { id: "a", kind: "circle", x: 10, y: 10, radius: 2 },
      { id: "b", kind: "line", x1: 0, y1: 0, x2: 5, y2: 5, width: 1 },
      blue,
      { id: "c", kind: "rect", x: 50, y: 50, width: 4, height: 4 },
    ]);
    expect(shapes.map(({ id, colour }) => [id, colour])).toEqual([["a", "#ff0000"], ["b", "#ff0000"], ["c", "#0000ff"]]);
    expect(penColour([red, blue])).toEqual({ colour: "#0000ff", name: "blue" });
  });

  it("paints shapes in block order, so later blocks are on top", () => {
    const shapes = renderProgram([
      { id: "sun", kind: "circle", x: 50, y: 20, radius: 10 },
      { id: "house", kind: "rect", x: 50, y: 20, width: 40, height: 40 },
    ]);
    expect(shapes.map(({ id }) => id)).toEqual(["sun", "house"]);
  });

  it("reads the time block as the current time", () => {
    const sun = { id: "sun", kind: "circle", x: 50, y: TIME, radius: 10 };
    expect(renderProgram([sun], 37)[0].y).toBe(37);
    expect(usesTime(sun)).toBe(true);
    expect(usesTime({ ...sun, y: 80 })).toBe(false);
  });

  it("tells which points a filled shape covers", () => {
    const [rect, circle] = renderProgram([
      { id: "r", kind: "rect", x: 40, y: 19, width: 50, height: 30 },
      { id: "c", kind: "circle", x: 0, y: 0, radius: 5 },
    ]);
    expect(containsPoint(rect, 15, 34)).toBe(true);
    expect(containsPoint(rect, 14, 20)).toBe(false);
    expect(containsPoint(circle, 3, 4)).toBe(true);
    expect(containsPoint(circle, 4, 4)).toBe(false);
  });
});
