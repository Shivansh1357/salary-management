/**
 * Money formatting for the UI. Amounts are integer minor units; the number of
 * minor-unit decimal places is taken from the platform's Intl data per currency
 * (so JPY shows no decimals, USD shows two) — no hardcoded currency tables.
 */

const fractionDigitsCache = new Map<string, number>();

function fractionDigits(currency: string): number {
  const cached = fractionDigitsCache.get(currency);
  if (cached !== undefined) return cached;
  const digits =
    new Intl.NumberFormat("en-US", { style: "currency", currency }).resolvedOptions()
      .maximumFractionDigits ?? 2;
  fractionDigitsCache.set(currency, digits);
  return digits;
}

/** Format an amount in a currency's minor units, e.g. (12000000, "USD") → "$120,000.00". */
export function formatMoney(amountMinor: number, currency: string): string {
  const major = amountMinor / 10 ** fractionDigits(currency);
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(major);
}

/** Format USD minor units as USD currency. */
export function formatUsdMinor(amountUsdMinor: number): string {
  return formatMoney(amountUsdMinor, "USD");
}

/** Convert major units (e.g. 120000) to a currency's integer minor units. */
export function majorToMinor(amountMajor: number, currency: string): number {
  return Math.round(amountMajor * 10 ** fractionDigits(currency));
}

/** Convert a currency's integer minor units to major units. */
export function minorToMajor(amountMinor: number, currency: string): number {
  return amountMinor / 10 ** fractionDigits(currency);
}

/** Compact USD for large headline figures, e.g. 1.03e12 minor → "$1B". */
export function formatUsdMinorCompact(amountUsdMinor: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amountUsdMinor / 100);
}
