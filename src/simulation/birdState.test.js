import { describe, expect, it } from "vitest";
import { applyBirdEvent, initialBirdState, replayBirdEvents } from "./birdState";

const simulation = { start: { x: 10, y: 20, heading: 90 } };

describe("bird simulation state", () => {
  it("changes heading without moving", () => {
    const initial = initialBirdState(simulation);
    const result = applyBirdEvent(initial, { kind: "heading", blockId: "h", heading: 0, resultText: "East" }, 1);
    expect(result.heading).toBe(0);
    expect(result.position).toEqual(initial.position);
  });

  it("records flight segments and worm collection", () => {
    const initial = initialBirdState(simulation);
    const result = applyBirdEvent(initial, { kind: "fly", blockId: "h", to: { x: 80, y: 20 }, pickup: true, resultText: "Worm" }, 1);
    expect(result.position).toEqual({ x: 80, y: 20 });
    expect(result.trail).toEqual([{ x: 10, y: 20 }, { x: 80, y: 20 }]);
    expect(result.hasWorm).toBe(true);
  });

  it("applies one continuously flying moment with its selected heading", () => {
    const initial = initialBirdState(simulation);
    const result = applyBirdEvent(initial, {
      kind: "tick",
      blockId: "heading-east",
      heading: 0,
      to: { x: 30, y: 20 },
      resultText: "Keep flying east",
    }, 1);
    expect(result.heading).toBe(0);
    expect(result.position).toEqual({ x: 30, y: 20 });
    expect(result.trail).toEqual([{ x: 10, y: 20 }, { x: 30, y: 20 }]);
  });

  it("replays earlier steps deterministically", () => {
    const events = [
      { kind: "heading", blockId: "h", heading: 0, resultText: "East" },
      { kind: "fly", blockId: "h", to: { x: 80, y: 20 }, resultText: "Move" },
    ];
    const result = replayBirdEvents(simulation, events, 1);
    expect(result.heading).toBe(0);
    expect(result.position).toEqual({ x: 10, y: 20 });
  });
});
