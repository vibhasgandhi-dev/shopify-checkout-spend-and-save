import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {readTiers, tierStatus, formatMoney} from './lib/tiers';

// Checkout: "Spend & save" progress, rendered just above the discounts in the order summary.
export default async () => {
  render(<SpendAndSave />, document.body);
};

function SpendAndSave() {
  const subtotal = shopify.cost.subtotalAmount.value;
  const tiers = readTiers(shopify.appMetafields.value);
  if (!subtotal) return null;

  const amount = Number(subtotal.amount);
  const currency = subtotal.currencyCode;
  const {current, next} = tierStatus(tiers, amount);
  const top = tiers[tiers.length - 1];
  const progress = Math.min(amount / top.threshold, 1);

  const reward = (t) => `${t.percentage}% off${t.freeShipping ? ' + free shipping' : ''}`;

  return (
    <s-section heading="Spend & save">
      <s-stack direction="block" gap="small-200">
        <s-progress value={progress} max={1} accessibilityLabel="Progress to the top savings tier" />
        {current ? (
          <s-text>
            You're getting <s-text type="strong">{reward(current)}</s-text> on this order.
          </s-text>
        ) : (
          <s-text>
            Add <s-text type="strong">{formatMoney(tiers[0].threshold - amount, currency)}</s-text> more to unlock {reward(tiers[0])}.
          </s-text>
        )}
        {current && next ? (
          <s-text type="small" color="subdued">
            {formatMoney(next.threshold - amount, currency)} more unlocks {reward(next)}.
          </s-text>
        ) : null}
        {current && !next ? (
          <s-text type="small" color="subdued">Top tier reached. Nice.</s-text>
        ) : null}
      </s-stack>
    </s-section>
  );
}
