import { describe, expect, it } from "vitest";
import { blockIds, countBlocks } from "./blockCount";
import { simulations } from "../data/simulations.jsx";
import { birdSimulations } from "../data/birdSimulations.jsx";
import { turtleSimulations } from "../data/turtleSimulations.jsx";

describe("block counting", () => {
  it("counts nested Maze blocks", () => {
    const byId = (id) => simulations.find((simulation) => simulation.id === id);
    expect(countBlocks(byId(6).program)).toBe(4);
    expect(countBlocks(byId(7).program)).toBe(2);
    expect(countBlocks(byId(5).variants.correct.program)).toBe(4);
  });

  it("counts every heading inside every Bird branch", () => {
    expect(birdSimulations.map(({ program }) => countBlocks(program))).toEqual([1, 1, 3, 3, 3, 4, 3]);
  });

  it("counts blocks inside the Turtle repeat", () => {
    expect(turtleSimulations.map(({ program }) => countBlocks(program))).toEqual([1, 3, 5, 4, 4, 7]);
  });

  it("lists nested ids once, depth first", () => {
    const program = [{ id: "a" }, { id: "loop", children: [{ id: "b" }, { id: "c" }] }];
    expect(blockIds(program)).toEqual(["a", "loop", "b", "c"]);
  });
});
