import { describe, expect, it } from "vitest";
import { birdSimulations } from "./birdSimulations";

const reachesEdge = ({ x, y }) => x <= 6 || x >= 94 || y <= 6 || y >= 90;

describe("Bird lesson paths", () => {
  it("continues every final heading to a visible container edge", () => {
    for (const simulation of birdSimulations) {
      expect(reachesEdge(simulation.events.at(-1).to), `simulation ${simulation.id}`).toBe(true);
    }
  });

  it("uses all three branches in simulation 6 as coordinates change", () => {
    const simulation = birdSimulations.find(({ id }) => id === 6);
    expect(simulation.events.map(({ blockId }) => blockId)).toEqual([
      "heading-south",
      "heading-west",
      "heading-north",
    ]);
    expect(simulation.events.map(({ to }) => to)).toEqual([
      { x: 90, y: 68 },
      { x: 28, y: 68 },
      { x: 28, y: 90 },
    ]);
  });

  it("uses worm collection to change the AND condition in simulation 7", () => {
    const simulation = birdSimulations.find(({ id }) => id === 7);
    expect(simulation.worm).toEqual({ x: 60, y: 40 });
    expect(simulation.program[0].branches[0].condition.parts[1].kind).toBe("worm");
    expect(simulation.events[0].pickup).toBe(true);
    expect(simulation.events[1].outcome).toBe(false);
  });
});
