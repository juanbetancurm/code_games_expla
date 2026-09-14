import { describe, expect, it } from "vitest";
import { applyProgramEvent, finalProgram, replayMovieEvents } from "./movieState";
import { TIME } from "./movieRender";

const yellow = { id: "yellow", kind: "colour", colour: "#ffe51a", name: "yellow" };
const sun = { id: "sun", kind: "circle", x: 80, y: 80, radius: 10 };
const ground = { id: "ground", kind: "rect", x: 50, y: 0, width: 100, height: 8 };
const simulation = { startProgram: [ground, yellow, sun] };

describe("Movie program state", () => {
  it("adds a block at the end or at a requested position", () => {
    const door = { id: "door", kind: "rect", x: 40, y: 9, width: 6, height: 10 };
    expect(applyProgramEvent([ground], { kind: "add", block: door }).map(({ id }) => id)).toEqual(["ground", "door"]);
    expect(applyProgramEvent([ground], { kind: "add", block: door, index: 0 }).map(({ id }) => id)).toEqual(["door", "ground"]);
  });

  it("changes one input to a number or to the time block", () => {
    const moved = applyProgramEvent([sun], { kind: "change", blockId: "sun", input: "y", value: TIME });
    expect(moved[0]).toEqual({ ...sun, y: TIME });
    expect(sun.y).toBe(80);
  });

  it("moves a group of blocks together and keeps their order", () => {
    const program = applyProgramEvent(simulation.startProgram, { kind: "move", blockIds: ["yellow", "sun"], toIndex: 0 });
    expect(program.map(({ id }) => id)).toEqual(["yellow", "sun", "ground"]);
  });

  it("replays events deterministically and focuses the last touched block", () => {
    const events = [
      { kind: "change", blockId: "sun", input: "y", value: TIME, resultText: "y = time" },
      { kind: "move", blockIds: ["yellow", "sun"], toIndex: 0, resultText: "moved" },
    ];
    const afterOne = replayMovieEvents(simulation, events, 1);
    expect(afterOne.cursor).toBe(1);
    expect(afterOne.changedInput).toEqual({ blockId: "sun", input: "y" });
    expect(afterOne.program.map(({ id }) => id)).toEqual(["ground", "yellow", "sun"]);
    const afterTwo = replayMovieEvents(simulation, events, 2);
    expect(afterTwo.focusBlockId).toBe("sun");
    expect(finalProgram(simulation, events).map(({ id }) => id)).toEqual(["yellow", "sun", "ground"]);
    expect(replayMovieEvents(simulation, events, 0).program).toBe(simulation.startProgram);
  });
});
