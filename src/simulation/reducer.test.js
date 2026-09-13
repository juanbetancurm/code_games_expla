import { describe, expect, it } from "vitest";
import { applyEvent, initialSimulationState } from "./reducer";
import { replayEvents } from "./stateMachine";

const simulation = { start: { x: 1, y: 2, direction: "east" } };

describe("simulation execution state", () => {
  it("moves exactly once for one move event", () => {
    const initial = initialSimulationState(simulation);
    const result = applyEvent(initial, { kind: "move", blockId: "forward", to: { x: 2, y: 2 }, resultText: "Moved" }, 1);
    expect(result.position).toEqual({ x: 2, y: 2 });
    expect(result.cursor).toBe(1);
  });

  it("turns without changing the square", () => {
    const initial = initialSimulationState(simulation);
    const result = applyEvent(initial, { kind: "turn", turn: "left", blockId: "left", direction: "north", resultText: "Turned" }, 1);
    expect(result.direction).toBe("north");
    expect(result.headingAngle).toBe(-90);
    expect(result.position).toEqual(initial.position);
  });

  it("keeps both left and right turns to exactly 90 degrees", () => {
    const northSimulation = { start: { x: 1, y: 2, direction: "north" } };
    const initial = initialSimulationState(northSimulation);
    const result = applyEvent(initial, { kind: "turn", turn: "right", blockId: "right", direction: "east", resultText: "Turned" }, 1);
    expect(result.headingAngle).toBe(0);
  });

  it("marks a nested conditional block as skipped when false", () => {
    const initial = initialSimulationState(simulation);
    const result = applyEvent(initial, { kind: "condition", blockId: "if", outcome: false, skipBlockId: "left", resultText: "False" }, 1);
    expect(result.condition).toBe(false);
    expect(result.skippedBlocks).toContain("left");
  });

  it("marks a bumped block as failed instead of completed", () => {
    const initial = initialSimulationState(simulation);
    const result = applyEvent(initial, { kind: "bump", blockId: "forward", resultText: "Bump" }, 1);
    expect(result.failedBlocks).toEqual(["forward"]);
    expect(result.completedBlocks).not.toContain("forward");
    expect(result.bump).toBe(true);
  });

  it("keeps a path check on the board until the character moves", () => {
    const initial = initialSimulationState(simulation);
    const checked = applyEvent(initial, { kind: "condition", blockId: "if", outcome: true, resultText: "True" }, 1);
    expect(checked.look).toEqual({ position: { x: 1, y: 2 }, direction: "east", outcome: true });
    const turned = applyEvent(checked, { kind: "turn", turn: "left", blockId: "left", direction: "north", resultText: "Turned" }, 2);
    expect(turned.look).toEqual(checked.look);
    const moved = applyEvent(turned, { kind: "move", blockId: "forward", to: { x: 1, y: 1 }, resultText: "Moved" }, 3);
    expect(moved.look).toBeNull();
  });

  it("reconstructs the previous step deterministically", () => {
    const events = [
      { kind: "move", blockId: "a", to: { x: 2, y: 2 }, resultText: "One" },
      { kind: "move", blockId: "b", to: { x: 3, y: 2 }, resultText: "Two" },
    ];
    const result = replayEvents(simulation, events, 1);
    expect(result.position).toEqual({ x: 2, y: 2 });
    expect(result.cursor).toBe(1);
  });
});
