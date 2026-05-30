import { describe, expect, it } from "vitest";
import { buildHistogram, median, sum } from "./statistics.js";

describe("sum", () => {
  it("is zero for an empty array", () => {
    expect(sum([])).toBe(0);
  });
  it("adds integers exactly", () => {
    expect(sum([100, 250, 1])).toBe(351);
  });
});

describe("median", () => {
  it("is zero for an empty array", () => {
    expect(median([])).toBe(0);
  });

  it("returns the middle value for an odd count", () => {
    expect(median([30, 10, 20])).toBe(20); // sorts internally
  });

  it("averages the two middle values for an even count", () => {
    expect(median([10, 20, 30, 40])).toBe(25);
  });

  it("rounds the averaged median to an integer (minor units)", () => {
    expect(median([10, 25])).toBe(18); // 17.5 -> 18
  });
});

describe("buildHistogram", () => {
  const boundaries = [100, 200]; // -> [0,100) [100,200) [200,∞)

  it("creates one more bucket than boundaries, with an open top", () => {
    const buckets = buildHistogram([], boundaries);
    expect(buckets).toHaveLength(3);
    expect(buckets[0]).toMatchObject({ fromUsdMinor: 0, toUsdMinor: 100, count: 0 });
    expect(buckets[2]).toMatchObject({ fromUsdMinor: 200, toUsdMinor: null, count: 0 });
  });

  it("counts values into the right buckets", () => {
    const buckets = buildHistogram([50, 150, 150, 999], boundaries);
    expect(buckets[0]!.count).toBe(1); // 50
    expect(buckets[1]!.count).toBe(2); // 150,150
    expect(buckets[2]!.count).toBe(1); // 999
  });

  it("places a value equal to a boundary in the upper bucket (from inclusive)", () => {
    const buckets = buildHistogram([100, 200], boundaries);
    expect(buckets[0]!.count).toBe(0);
    expect(buckets[1]!.count).toBe(1); // 100
    expect(buckets[2]!.count).toBe(1); // 200
  });
});
