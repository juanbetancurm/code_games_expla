import { describe, expect, it } from "vitest";
import { applyTurtleEvent, initialTurtleState } from "./turtleState";

const simulation = { start: { x: 20, y: 70, heading: 90 } };

describe("Turtle simulation state", () => {
  it("draws a styled segment when the pen is down", () => {
    const state = initialTurtleState(simulation);
    const result = applyTurtleEvent(state, { kind: "move", to: { x: 20, y: 30 }, resultText: "move" }, 1);
    expect(result.segments[0]).toEqual({ from: { x: 20, y: 70 }, to: { x: 20, y: 30 }, color: "#d7d7d7", width: 4 });
  });

  it("moves without drawing when the pen is up", () => {
    const up = applyTurtleEvent(initialTurtleState(simulation), { kind: "pen", down: false, resultText: "up" }, 1);
    const moved = applyTurtleEvent(up, { kind: "move", to: { x: 60, y: 70 }, resultText: "move" }, 2);
    expect(moved.position).toEqual({ x: 60, y: 70 });
    expect(moved.segments).toEqual([]);
  });

  it("turns without changing position", () => {
    const state = initialTurtleState(simulation);
    const result = applyTurtleEvent(state, { kind: "turn", heading: 0, resultText: "turn" }, 1);
    expect(result.position).toEqual({ x: 20, y: 70 });
    expect(result.heading).toBe(0);
  });
});
