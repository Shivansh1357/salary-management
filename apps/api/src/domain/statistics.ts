import type { HistogramBucket } from "@salary/shared";

/** Sum of integers (exact — inputs are integer minor units). */
export function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

/**
 * Median of integer minor units. Returns 0 for an empty set; for an even count,
 * averages the two middle values and rounds to the nearest integer.
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[mid]!;
  }
  return Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

/**
 * Bucket values into a histogram. `boundaries` are ascending upper bounds; the
 * result has `boundaries.length + 1` buckets, the last open-ended. A value on a
 * boundary falls into the upper bucket (lower bound inclusive, upper exclusive).
 */
export function buildHistogram(values: number[], boundaries: number[]): HistogramBucket[] {
  const edges = [0, ...boundaries];
  const buckets: HistogramBucket[] = edges.map((fromUsdMinor, i) => ({
    fromUsdMinor,
    toUsdMinor: i < boundaries.length ? boundaries[i]! : null,
    count: 0,
  }));

  for (const value of values) {
    // Last bucket whose lower bound is <= value.
    let index = 0;
    for (let i = 0; i < buckets.length; i++) {
      if (value >= buckets[i]!.fromUsdMinor) index = i;
    }
    buckets[index]!.count += 1;
  }

  return buckets;
}
