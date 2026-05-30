import { describe, expect, it } from "vitest";
import { CURRENCIES } from "@salary/shared";
import { currencyDecimals, fromUsdMinor, getUsdRate, toUsdMinor } from "./currency.js";

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

  it("respects a currency's real decimal places (JPY has none)", () => {
    // ¥8,000,000 stored as 8000000 minor (0 decimals); rate 0.0067 -> $53,600.00
    expect(toUsdMinor(8_000_000, "JPY")).toBe(5_360_000);
  });

  it("throws on an unsupported currency", () => {
    expect(() => toUsdMinor(100, "XYZ")).toThrow();
  });
});

describe("currencyDecimals", () => {
  it("is 2 for USD and 0 for JPY", () => {
    expect(currencyDecimals("USD")).toBe(2);
    expect(currencyDecimals("JPY")).toBe(0);
  });
});

describe("fromUsdMinor", () => {
  it("is the identity for USD", () => {
    expect(fromUsdMinor(150_00, "USD")).toBe(150_00);
  });

  it("converts USD minor units into a currency's native minor units", () => {
    // $127.00 / 1.27 = £100.00 -> 10000 minor
    expect(fromUsdMinor(127_00, "GBP")).toBe(100_00);
  });

  it("round-trips back to roughly the original USD amount", () => {
    const native = fromUsdMinor(200_000_00, "JPY");
    expect(toUsdMinor(native, "JPY")).toBe(200_000_00);
  });

  it("keeps low-denomination native salaries within 32-bit INT range", () => {
    // Regression: a $250k salary in JPY/INR must not overflow the SQLite Int column.
    for (const currency of CURRENCIES) {
      expect(fromUsdMinor(250_000_00, currency)).toBeLessThan(2_147_483_647);
    }
  });
});

describe("getUsdRate", () => {
  it("has a rate for every supported currency", () => {
    for (const currency of CURRENCIES) {
      expect(getUsdRate(currency)).toBeGreaterThan(0);
    }
  });
});
