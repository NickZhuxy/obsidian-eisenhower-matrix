import { describe, it, expect } from "vitest";
import { generateId, positionToColor, pixelToNormalized, normalizedToPixel } from "../utils";

describe("generateId", () => {
  it("returns a non-empty string", () => {
    expect(generateId().length).toBeGreaterThan(0);
  });

  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("positionToColor", () => {
  it("returns blue-ish hue at (0, 0)", () => {
    const color = positionToColor(0, 0);
    expect(color).toBe("hsl(220, 70%, 65%)");
  });

  it("returns red-ish hue at (1, 1)", () => {
    const color = positionToColor(1, 1);
    expect(color).toBe("hsl(0, 70%, 65%)");
  });

  it("returns mid hue at (0.5, 0.5)", () => {
    const color = positionToColor(0.5, 0.5);
    expect(color).toBe("hsl(110, 70%, 65%)");
  });
});

describe("pixelToNormalized", () => {
  it("converts top-left corner to (0, 1)", () => {
    const result = pixelToNormalized(0, 0, 400, 400);
    expect(result).toEqual({ x: 0, y: 1 });
  });

  it("converts bottom-right corner to (1, 0)", () => {
    const result = pixelToNormalized(400, 400, 400, 400);
    expect(result).toEqual({ x: 1, y: 0 });
  });

  it("converts center to (0.5, 0.5)", () => {
    const result = pixelToNormalized(200, 200, 400, 400);
    expect(result).toEqual({ x: 0.5, y: 0.5 });
  });

  it("clamps out-of-bounds values", () => {
    const result = pixelToNormalized(-50, 500, 400, 400);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });
});

describe("normalizedToPixel", () => {
  it("is inverse of pixelToNormalized", () => {
    const width = 400;
    const height = 300;
    const norm = pixelToNormalized(120, 90, width, height);
    const pixel = normalizedToPixel(norm.x, norm.y, width, height);
    expect(pixel.px).toBeCloseTo(120);
    expect(pixel.py).toBeCloseTo(90);
  });
});
