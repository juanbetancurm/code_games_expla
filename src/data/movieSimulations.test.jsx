import { describe, expect, it } from "vitest";
import { movieSimulations, personTarget } from "./movieSimulations.jsx";
import { containsPoint, renderProgram, shapeBounds } from "../simulation/movieRender";
import { finalProgram } from "../simulation/movieState";

const byId = (id) => movieSimulations.find((simulation) => simulation.id === id);
const eventLists = (simulation) => (simulation.variants
  ? Object.values(simulation.variants).map((variant) => variant.events)
  : [simulation.events ?? []]);
const endOf = (id) => finalProgram(byId(id), eventLists(byId(id))[0]);
const shape = (shapes, id) => shapes.find((item) => item.id === id);

// A shape is hidden when every visible point of it is painted by a later filled shape.
function isHidden(shapes, id) {
  const index = shapes.findIndex((item) => item.id === id);
  const target = shapes[index];
  const later = shapes.slice(index + 1);
  const bounds = shapeBounds(target);
  for (let i = 0; i <= 24; i += 1) {
    for (let j = 0; j <= 24; j += 1) {
      const x = bounds.left + ((bounds.right - bounds.left) * i) / 24;
      const y = bounds.bottom + ((bounds.top - bounds.bottom) * j) / 24;
      const onCanvas = x >= 0 && x <= 100 && y >= 0 && y <= 100;
      if (onCanvas && containsPoint(target, x, y) && !later.some((cover) => containsPoint(cover, x, y))) return false;
    }
  }
  return true;
}

describe("Movie lesson data", () => {
  it("continues each section from the previous section's program", () => {
    expect(byId(2).startProgram).toEqual(endOf(1));
    expect(byId(3).startProgram).toEqual(endOf(2));
    expect(byId(4).startProgram).toEqual(endOf(3));
    expect(byId(6).startProgram).toEqual(endOf(4));
    expect(byId(7).startProgram).toEqual(endOf(6));
    expect(byId(8).startProgram).toEqual(endOf(7));
  });

  it("changes the program by exactly one block per add step", () => {
    for (const simulation of movieSimulations) {
      for (const events of eventLists(simulation)) {
        let program = simulation.startProgram ?? [];
        for (const event of events) {
          const next = finalProgram({ startProgram: program }, [event]);
          expect(next).toHaveLength(program.length + (event.kind === "add" ? 1 : 0));
          program = next;
        }
      }
    }
  });

  it("builds a tidy house: parts inside, door on the ground, roof on the corners", () => {
    const shapes = renderProgram(endOf(4));
    const ground = shapeBounds(shape(shapes, "ground"));
    const house = shapeBounds(shape(shapes, "house"));
    for (const id of ["window-left", "window-right", "door"]) {
      const part = shapeBounds(shape(shapes, id));
      expect(part.left).toBeGreaterThanOrEqual(house.left);
      expect(part.right).toBeLessThanOrEqual(house.right);
      expect(part.bottom).toBeGreaterThanOrEqual(house.bottom);
      expect(part.top).toBeLessThanOrEqual(house.top);
    }
    expect(house.bottom).toBe(ground.top);
    expect(shapeBounds(shape(shapes, "door")).bottom).toBe(ground.top);
    const left = shape(shapes, "roof-left");
    const right = shape(shapes, "roof-right");
    expect([left.x1, left.y1]).toEqual([house.left, house.top]);
    expect([left.x2, left.y2]).toEqual([right.x1, right.y1]);
    expect([right.x2, right.y2]).toEqual([house.right, house.top]);
    const sun = shapeBounds(shape(shapes, "sun"));
    expect(sun.left >= 0 && sun.right <= 100 && sun.bottom >= 0 && sun.top <= 100).toBe(true);
  });

  it("hides the door only when its block comes before the house", () => {
    const simulation = byId(2);
    const after = renderProgram(finalProgram(simulation, simulation.variants.after.events));
    const before = renderProgram(finalProgram(simulation, simulation.variants.before.events));
    expect(isHidden(after, "door")).toBe(false);
    expect(isHidden(before, "door")).toBe(true);
    expect(shape(before, "door").colour).toBe(shape(after, "door").colour);
  });

  it("moves the sun with time", () => {
    const program = endOf(6);
    for (const time of [0, 50, 100]) expect(shape(renderProgram(program, time), "sun").y).toBe(time);
  });

  it("shows the sun in front of the house until its blocks move to the top", () => {
    const simulation = byId(7);
    const bug = renderProgram(finalProgram(simulation, simulation.events.slice(0, 1)), 30);
    const fixed = renderProgram(endOf(7), 0);
    expect(isHidden(bug, "sun")).toBe(false);
    expect(fixed[0].id).toBe("sun");
    expect(isHidden(fixed, "sun")).toBe(true);
  });

  it("keeps the smoke away from the sun and hidden inside the house at first", () => {
    const program = endOf(8);
    for (const time of [0, 25, 50, 75, 100]) {
      const shapes = renderProgram(program, time);
      const sun = shape(shapes, "sun");
      const smoke = shape(shapes, "smoke");
      expect(Math.hypot(sun.x - smoke.x, sun.y - smoke.y)).toBeGreaterThanOrEqual(sun.radius + smoke.radius);
    }
    expect(isHidden(renderProgram(program, 20), "smoke")).toBe(true);
  });

  it("never gives away the person from Movie level 1", () => {
    const [head, body] = personTarget;
    const programs = movieSimulations.flatMap((simulation) => [
      ...eventLists(simulation).map((events) => finalProgram(simulation, events)),
      ...(simulation.demo ? [simulation.demo] : []),
    ]);
    for (const block of programs.flat()) {
      const isHead = block.kind === "circle" && block.x === head.x && block.y === head.y && block.radius === head.radius;
      const isBody = block.kind === "rect" && block.x === body.x && block.y === body.y && block.width === body.width && block.height === body.height;
      expect(isHead || isBody).toBe(false);
    }
    for (const simulation of movieSimulations.filter(({ mode }) => mode === "yourTurn")) {
      expect(simulation.events ?? []).toHaveLength(0);
      expect(simulation.hints.length).toBeGreaterThan(0);
    }
  });
});
