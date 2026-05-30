import { describe, expect, it } from "vitest";
import {
  formatMoney,
  formatUsdMinor,
  formatUsdMinorCompact,
  majorToMinor,
  minorToMajor,
} from "./money.js";

describe("formatMoney", () => {
  it("formats USD minor units with two decimals and a $ symbol", () => {
    expect(formatMoney(120_000_00, "USD")).toBe("$120,000.00");
  });

  it("formats JPY with no decimal places", () => {
    expect(formatMoney(8_000_000, "JPY")).toBe("¥8,000,000");
  });

  it("formats GBP with a £ symbol", () => {
    expect(formatMoney(100_00, "GBP")).toBe("£100.00");
  });
});

describe("formatUsdMinor", () => {
  it("formats USD minor units as USD currency", () => {
    expect(formatUsdMinor(108_387_31)).toBe("$108,387.31");
  });
});

describe("formatUsdMinorCompact", () => {
  it("formats large totals compactly", () => {
    expect(formatUsdMinorCompact(1_030_000_000_00)).toBe("$1.0B");
  });
});

describe("majorToMinor / minorToMajor", () => {
  it("converts major units to minor units for a 2-decimal currency", () => {
    expect(majorToMinor(120_000, "USD")).toBe(120_000_00);
  });

  it("converts major units to minor units for a 0-decimal currency", () => {
    expect(majorToMinor(8_000_000, "JPY")).toBe(8_000_000);
  });

  it("round-trips minor → major → minor", () => {
    expect(majorToMinor(minorToMajor(123_45, "USD"), "USD")).toBe(123_45);
  });
});
