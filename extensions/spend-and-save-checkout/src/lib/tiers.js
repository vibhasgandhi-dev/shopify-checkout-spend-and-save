// Shared tier logic. Tiers come from the shop metafield $app:tiers (JSON, same shape as the
// discount Function's config) and fall back to the demo tiers when the metafield is missing.
export const DEFAULT_TIERS = [
  {threshold: 100, percentage: 5},
  {threshold: 200, percentage: 10},
  {threshold: 500, percentage: 15, freeShipping: true},
];

export function readTiers(appMetafields) {
  const entry = (appMetafields || []).find(
    (m) => m.target?.type === 'shop' && m.metafield?.namespace === '$app' && m.metafield?.key === 'tiers',
  );
  if (!entry) return DEFAULT_TIERS;
  try {
    const parsed = JSON.parse(entry.metafield.value);
    const tiers = (Array.isArray(parsed) ? parsed : parsed?.tiers) || [];
    const clean = tiers
      .map((t) => ({threshold: Number(t.threshold), percentage: Number(t.percentage), freeShipping: t.freeShipping === true}))
      .filter((t) => Number.isFinite(t.threshold) && t.threshold >= 0 && Number.isFinite(t.percentage))
      .sort((a, b) => a.threshold - b.threshold);
    return clean.length ? clean : DEFAULT_TIERS;
  } catch {
    return DEFAULT_TIERS;
  }
}

export function tierStatus(tiers, subtotal) {
  let current = null;
  let next = null;
  for (const t of tiers) {
    if (subtotal >= t.threshold) current = t;
    else if (!next) next = t;
  }
  return {current, next};
}

export function formatMoney(amount, currencyCode) {
  try {
    return new Intl.NumberFormat(undefined, {style: 'currency', currency: currencyCode, maximumFractionDigits: 2}).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }
}
