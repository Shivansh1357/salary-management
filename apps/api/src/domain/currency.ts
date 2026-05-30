import type { Currency } from "@salary/shared";

/**
 * Static FX rates: USD per 1 unit of the given currency — see ADR 0003.
 * Approximate, fixed as of 2026-05 for deterministic, network-free analytics.
 * Refreshing rates is a one-edit change; swapping in a live provider means
 * implementing the same `toUsdMinor` signature behind a cache.
 *
 * Amounts are uniform 2-decimal minor units (cents). The 100x scaling is
 * identical on both sides of a conversion, so a per-unit FX rate applies
 * directly to minor units (verified by the JPY test).
 */
const USD_PER_UNIT: Record<Currency, number> = {
  USD: 1,
  GBP: 1.27,
  EUR: 1.08,
  INR: 0.012,
  CAD: 0.73,
  AUD: 0.66,
  SGD: 0.74,
  JPY: 0.0067,
  BRL: 0.2,
};

export function getUsdRate(currency: string): number {
  const rate = USD_PER_UNIT[currency as Currency];
  if (rate === undefined) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  return rate;
}

/**
 * Convert an amount in a currency's minor units to USD minor units,
 * rounding once to the nearest cent.
 */
export function toUsdMinor(amountMinor: number, currency: string): number {
  return Math.round(amountMinor * getUsdRate(currency));
}
