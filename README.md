# Aktivate website

Static site for useaktivate.com, built from the page designs in `src/pages`.

- `npm install && npm run build` writes the finished site to `site/`.
- Hosting: Render static site (see `render.yaml`), publish folder `site/`.
- Link destinations (sign up, log in, contact, referrals) are set in the `LINKS` block near the top of `build/build.js`.
- Launch-only text changes (e.g. hiding sections, replacing placeholders) are in the `SWAPS` block in the same file.
- Local prices (NGN, GHS, KES) and exchange rates live in `build/currency.js` and in the Pricing page logic (`src/pages/Pricing.dc.html`). Update both together.
