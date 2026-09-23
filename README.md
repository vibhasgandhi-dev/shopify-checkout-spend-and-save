# Spend & save at checkout — Checkout UI Extensions + Web Pixel

Companion to the [tiered discount Function](https://github.com/vibhasgandhi-dev/shopify-tiered-discount-function). The Function applies the discount; this app tells the shopper about it.

Built by Vibhas Gandhi on Checkout UI Extensions API 2026-07 (Preact + Polaris web components) and Web Pixels API. Runs on Shopify and Shopify Plus.

## What ships

| Piece | Target | What the shopper sees |
|-------|--------|-----------------------|
| `Checkout.jsx` | `purchase.checkout.cart-line-list.render-after` | A "Spend & save" section under the order-summary line items: progress bar to the top tier, current reward, and how much more unlocks the next one. Updates live as the cart changes. |
| `ThankYou.jsx` | `purchase.thank-you.customer-information.render-after` | "You saved $X on this order" banner (summed from discount allocations) plus the next-tier nudge. |
| `spend-and-save-pixel` | Web pixel, `checkout_completed` | Logs subtotal, total, discount applications and the amount saved; optionally POSTs the JSON to an HTTPS endpoint set in the pixel settings. |

Both UI targets are **static**. On a store with a customised checkout configuration (Shopify Plus checkout editor), the block still has to be added once in the editor (Order summary → Add block → the app's block) and the configuration saved; until then the checkout page does not even load the extension bundle. The `purchase.checkout.reductions.render-before` target was the first choice, but that slot does not exist when the store has no discount codes, so the progress block sits under the cart line list instead. Tiers are read from the shop metafield `$app:tiers` (same JSON shape as the Function's config) and fall back to the demo tiers (100/5%, 200/10%, 500/15% + free shipping).

## Layout

```
extensions/spend-and-save-checkout/
  src/lib/tiers.js       read + sanitise tiers, work out current/next tier, money formatting
  src/Checkout.jsx       order-summary progress block
  src/ThankYou.jsx       thank-you savings banner
  shopify.extension.toml two targets, api_access, $app:tiers metafield
extensions/spend-and-save-pixel/
  src/index.ts           checkout_completed → savings payload → console + optional endpoint
```

## Run

```bash
npm install
shopify app dev --store <your-dev-store>.myshopify.com   # live preview with hot reload
shopify app deploy                                        # release a version
```

## Notes that saved time

- The `checkout_ui` template only ships a `preact` flavour; the CLI's `--flavor` flag rejects it, so generate it through a TTY (`script -q /dev/null shopify app generate extension --template checkout_ui …`) and accept the default.
- The web pixel template is `web_pixel`, not `web_pixel_extension`.
- The checkout editor shows `t:name` unless `name` in `shopify.extension.toml` is a literal string.
- Delete the template's `locales/fr.json` (or mirror its keys in `en.default.json`) or `shopify app deploy` fails localization validation.
- Read `shopify.cost.*` and `shopify.discountAllocations` as signals (`.value`) inside the component that renders them so only that component rerenders.
