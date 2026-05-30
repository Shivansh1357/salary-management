import type { Currency } from "@salary/shared";

/**
 * Static FX rates: USD per 1 major unit of the given currency — see ADR 0003.
 * Approximate, fixed as of 2026-05 for deterministic, network-free analytics.
 * Refreshing rates is a one-edit change; swapping in a live provider means
 * implementing the same `toUsdMinor` signature behind a cache.
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

/**
 * Minor-unit decimal places per ISO 4217. Most currencies use 2 (cents); JPY
 * has none. Honoring this keeps native amounts in their true minor units and
 * avoids inflating low-denomination currencies past the storage integer range.
 */
const DECIMALS: Record<Currency, number> = {
  USD: 2,
  GBP: 2,
  EUR: 2,
  INR: 2,
  CAD: 2,
  AUD: 2,
  SGD: 2,
  JPY: 0,
  BRL: 2,
};

export function getUsdRate(currency: string): number {
  const rate = USD_PER_UNIT[currency as Currency];
  if (rate === undefined) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  return rate;
}

export function currencyDecimals(currency: string): number {
  const decimals = DECIMALS[currency as Currency];
  if (decimals === undefined) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  return decimals;
}

/** USD is the reporting currency and always uses 2 decimals (cents). */
const USD_DECIMALS = 2;

/**
 * Convert an amount in a currency's native minor units to USD minor units
 * (cents), rounding once. Scales between the currency's decimals and USD's.
 */
export function toUsdMinor(amountMinor: number, currency: string): number {
  const major = amountMinor / 10 ** currencyDecimals(currency);
  return Math.round(major * getUsdRate(currency) * 10 ** USD_DECIMALS);
}

/**
 * Convert USD minor units (cents) into a currency's native minor units,
 * rounding once. Inverse of `toUsdMinor`.
 */
export function fromUsdMinor(usdMinor: number, currency: string): number {
  const usdMajor = usdMinor / 10 ** USD_DECIMALS;
  const nativeMajor = usdMajor / getUsdRate(currency);
  return Math.round(nativeMajor * 10 ** currencyDecimals(currency));
}
