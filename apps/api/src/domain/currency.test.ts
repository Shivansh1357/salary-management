import { describe, expect, it } from "vitest";
import { CURRENCIES } from "@salary/shared";
import { getUsdRate, toUsdMinor } from "./currency.js";

describe("toUsdMinor", () => {
  it("returns the same amount for USD (identity)", () => {
    expect(toUsdMinor(150_00, "USD")).toBe(150_00);
  });

  it("converts a foreign currency using its rate", () => {
    // GBP rate is 1.27 USD per £1; £100.00 -> $127.00
    expect(toUsdMinor(100_00, "GBP")).toBe(127_00);
  });

  it("treats zero as zero", () => {
    expect(toUsdMinor(0, "EUR")).toBe(0);
  });

  it("rounds to the nearest USD minor unit", () => {
    // INR rate 0.012: 12345 minor * 0.012 = 148.14 -> 148
    expect(toUsdMinor(12_345, "INR")).toBe(148);
  });

  it("handles large JPY amounts (scaling cancels across minor units)", () => {
    // ¥8,000,000 stored as 800000000 minor; rate 0.0067 -> $53,600.00
    expect(toUsdMinor(800_000_000, "JPY")).toBe(5_360_000);
  });

  it("throws on an unsupported currency", () => {
    expect(() => toUsdMinor(100, "XYZ")).toThrow();
  });
});

describe("getUsdRate", () => {
  it("has a rate for every supported currency", () => {
    for (const currency of CURRENCIES) {
      expect(getUsdRate(currency)).toBeGreaterThan(0);
    }
  });
});
