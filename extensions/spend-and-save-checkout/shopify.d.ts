import '@shopify/ui-extensions';

//@ts-ignore
declare module './src/Checkout.jsx' {
  const shopify: import('@shopify/ui-extensions/purchase.checkout.reductions.render-before').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/ThankYou.jsx' {
  const shopify: import('@shopify/ui-extensions/purchase.thank-you.customer-information.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}

//@ts-ignore
declare module './src/lib/tiers.js' {
  const shopify:
    | import('@shopify/ui-extensions/purchase.checkout.reductions.render-before').Api
    | import('@shopify/ui-extensions/purchase.thank-you.customer-information.render-after').Api;
  const globalThis: { shopify: typeof shopify };
}
