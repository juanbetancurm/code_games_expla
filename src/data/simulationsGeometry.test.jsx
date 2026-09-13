import { describe, expect, it } from "vitest";
import { simulations } from "./simulations.jsx";
import { directionVectors, routePoints, toCell } from "../simulation/mazeGrid";

function isOnSegment(point, start, end) {
  const cross = (point.y - start.y) * (end.x - start.x)
    - (point.x - start.x) * (end.y - start.y);
  if (Math.abs(cross) > 0.0001) return false;
  return point.x >= Math.min(start.x, end.x)
    && point.x <= Math.max(start.x, end.x)
    && point.y >= Math.min(start.y, end.y)
    && point.y <= Math.max(start.y, end.y);
}

function isOnRoutes(point, routes) {
  return routes.some((route) => {
    const points = routePoints(route);
    return points.slice(1).some((end, index) => isOnSegment(point, points[index], end));
  });
}

function configurations(simulation) {
  if (simulation.pathVariants) {
    return Object.entries(simulation.pathVariants).map(([name, variant]) => ({ name, ...variant }));
  }
  if (simulation.variants) {
    return Object.entries(simulation.variants).map(([name, variant]) => ({
      name,
      events: variant.events,
      routes: simulation.routes,
      goal: simulation.goal,
    }));
  }
  return [{ name: "default", events: simulation.events, routes: simulation.routes, goal: simulation.goal }];
}

function tile(point) {
  const { col, row } = toCell(point);
  expect(Math.abs(col - Math.round(col))).toBeLessThan(0.001);
  expect(Math.abs(row - Math.round(row))).toBeLessThan(0.001);
  return { col: Math.round(col), row: Math.round(row) };
}

describe("simulation path geometry", () => {
  for (const simulation of simulations) {
    for (const configuration of configurations(simulation)) {
      it(`stage ${simulation.id} (${configuration.name}) stays on its route`, () => {
        const firstPoint = routePoints(configuration.routes[0])[0];
        const lastRoute = configuration.routes.at(-1);
        const lastPoints = routePoints(lastRoute);

        expect(firstPoint).toEqual({ x: simulation.start.x, y: simulation.start.y });
        expect(lastPoints.at(-1)).toEqual(configuration.goal);

        for (const event of configuration.events.filter((item) => item.kind === "move")) {
          expect(isOnRoutes(event.to, configuration.routes), `${event.blockId} is outside the path`).toBe(true);
        }
      });

      it(`stage ${simulation.id} (${configuration.name}) moves exactly one tile, in the facing direction`, () => {
        let position = tile(simulation.start);
        let direction = simulation.start.direction;
        for (const event of configuration.events) {
          if (event.kind === "turn") direction = event.direction;
          if (event.kind !== "move") continue;
          const next = tile(event.to);
          const [dx, dy] = directionVectors[direction];
          expect({ col: next.col - position.col, row: next.row - position.row }, event.blockId).toEqual({ col: dx, row: dy });
          position = next;
        }
      });
    }
  }
});
