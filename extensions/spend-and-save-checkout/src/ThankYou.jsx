import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {readTiers, tierStatus, formatMoney} from './lib/tiers';

// Thank-you page: what the customer saved, and the nudge for next time.
export default async () => {
  render(<Saved />, document.body);
};

function Saved() {
  const subtotal = shopify.cost.subtotalAmount.value;
  const allocations = shopify.discountAllocations.value || [];
  if (!subtotal) return null;

  const currency = subtotal.currencyCode;
  const saved = allocations.reduce((sum, a) => sum + Number(a.discountedAmount?.amount || 0), 0);
  const tiers = readTiers(shopify.appMetafields.value);
  const {next} = tierStatus(tiers, Number(subtotal.amount));

  if (saved <= 0 && !next) return null;

  return (
    <s-banner heading={saved > 0 ? `You saved ${formatMoney(saved, currency)} on this order` : 'Spend & save'} tone="success">
      <s-stack direction="block" gap="small-200">
        {saved > 0 ? <s-text>Thanks for brewing with us. Your Spend & save tier was applied automatically.</s-text> : null}
        {next ? (
          <s-text type="small">
            Next time, orders over {formatMoney(next.threshold, currency)} get {next.percentage}% off{next.freeShipping ? ' and free shipping' : ''}.
          </s-text>
        ) : null}
      </s-stack>
    </s-banner>
  );
}
