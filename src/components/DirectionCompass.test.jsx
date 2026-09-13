import { describe, expect, it } from "vitest";
import { angleFromDialPoint } from "./DirectionCompass";

describe("direction compass", () => {
  it.each([
    [280, 80, 45],
    [80, 80, 135],
    [86.03, 214.2, 200],
  ])("selects non-cardinal headings from a dial click", (x, y, angle) => {
    expect(angleFromDialPoint(x, y)).toBe(angle);
  });
});
