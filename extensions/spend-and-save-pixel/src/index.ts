import {register} from '@shopify/web-pixels-extension';

/**
 * Spend & save pixel: on checkout_completed, work out what the automatic tier discount saved
 * and report it. With `endpoint` set in the pixel settings it POSTs a small JSON payload
 * (keepalive, no PII beyond the order id); without it, it only logs to the console.
 */
register(({analytics, settings}) => {
  analytics.subscribe('checkout_completed', (event) => {
    const checkout = event.data.checkout;
    const subtotal = Number(checkout.subtotalPrice?.amount ?? 0);
    const total = Number(checkout.totalPrice?.amount ?? 0);
    const currency = checkout.currencyCode;

    const applications = (checkout.discountApplications ?? []).map((d) => ({
      title: d.title,
      type: d.type,
      target: d.targetType,
      value:
        d.value && 'amount' in d.value
          ? {amount: Number(d.value.amount?.amount ?? 0)}
          : {percentage: Number((d.value as {percentage?: number})?.percentage ?? 0)},
    }));

    // Line-level allocations are the reliable way to sum what a percentage discount actually took off.
    const savedOnLines = (checkout.lineItems ?? []).reduce((sum, line) => {
      const allocations = (line.discountAllocations ?? []) as Array<{amount?: {amount?: number}}>;
      return sum + allocations.reduce((s, a) => s + Number(a.amount?.amount ?? 0), 0);
    }, 0);

    const payload = {
      event: 'spend_and_save_purchase',
      order_id: checkout.order?.id ?? null,
      currency,
      subtotal,
      total,
      saved: Number(savedOnLines.toFixed(2)),
      discounts: applications,
      timestamp: event.timestamp,
    };

    console.log('[spend-and-save]', payload);

    const endpoint = settings?.endpoint;
    if (typeof endpoint === 'string' && /^https:\/\//.test(endpoint)) {
      fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  });
});
