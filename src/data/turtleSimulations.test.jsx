import { describe, expect, it } from "vitest";
import { turtleSimulations } from "./turtleSimulations";
import { replayTurtleEvents } from "../simulation/turtleState";
import { walk } from "../simulation/turtleGeometry";

function findBlock(program, id) {
  for (const block of program) {
    if (block.id === id) return block;
    const nested = block.children && findBlock(block.children, id);
    if (nested) return nested;
  }
  return null;
}

describe("Turtle lesson demonstrations", () => {
  it("reuses move and turn twice, then closes the triangle without a final turn", () => {
    const simulation = turtleSimulations.find(({ id }) => id === 4);
    expect(simulation.events.map(({ blockId }) => blockId)).toEqual([
      "loop-move", "loop-turn", "loop-move", "loop-turn", "loop-final-move",
    ]);
    const result = replayTurtleEvents(simulation, simulation.events.length);
    expect(result.segments).toHaveLength(3);
    expect(result.position).toEqual({ x: simulation.start.x, y: simulation.start.y });
    expect(result.heading).toBe(210);
  });

  it("closes the manual triangle without rotating after the last line", () => {
    const simulation = turtleSimulations.find(({ id }) => id === 3);
    expect(simulation.events).toHaveLength(5);
    expect(simulation.events.at(-1).kind).toBe("move");
    const result = replayTurtleEvents(simulation, simulation.events.length);
    expect(result.segments).toHaveLength(3);
    expect(result.position).toEqual({ x: simulation.start.x, y: simulation.start.y });
    expect(result.heading).toBe(210);
  });

  it("creates no segment during the pen-up movement", () => {
    const simulation = turtleSimulations.find(({ id }) => id === 5);
    const afterDrawing = replayTurtleEvents(simulation, 1);
    const finished = replayTurtleEvents(simulation, simulation.events.length);
    expect(afterDrawing.segments).toHaveLength(1);
    expect(finished.segments).toHaveLength(1);
    expect(finished.position).toEqual({ x: 74, y: 30 });
    expect(finished.penDown).toBe(false);
  });

  it("applies colour and width before each styled movement", () => {
    const simulation = turtleSimulations.find(({ id }) => id === 6);
    const result = replayTurtleEvents(simulation, simulation.events.length);
    expect(result.segments.map(({ color, width }) => ({ color, width }))).toEqual([
      { color: "#43d5d0", width: 8 },
      { color: "#f05c9b", width: 3 },
    ]);
  });

  it("draws every move with the block's distance and the current heading", () => {
    for (const simulation of turtleSimulations) {
      let position = { x: simulation.start.x, y: simulation.start.y };
      let heading = simulation.start.heading;
      for (const item of simulation.events) {
        const block = findBlock(simulation.program, item.blockId);
        if (item.kind === "turn") {
          const expected = (heading + (block.direction === "right" ? -block.angle : block.angle) + 360) % 360;
          expect(item.heading, `${simulation.id}: ${item.blockId}`).toBe(expected);
          heading = item.heading;
        }
        if (item.kind === "move") {
          expect(item.to, `${simulation.id}: ${item.blockId}`).toEqual(walk(position, heading, block.distance));
          position = item.to;
        }
      }
      for (const point of [simulation.start, ...simulation.events.filter((item) => item.to).map((item) => item.to)]) {
        expect(point.x).toBeGreaterThanOrEqual(8);
        expect(point.x).toBeLessThanOrEqual(92);
        expect(point.y).toBeGreaterThanOrEqual(8);
        expect(point.y).toBeLessThanOrEqual(92);
      }
    }
  });
});
