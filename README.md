# Aktivate website

Static site for useaktivate.com, built from the page designs in `src/pages`.

- `npm install && npm run build` writes the finished site to `site/`.
- Hosting: Render static site (see `render.yaml`), publish folder `site/`.
- Link destinations (sign up, log in, contact, referrals) are set in the `LINKS` block near the top of `build/build.js`.
- Launch-only text changes (e.g. hiding sections, replacing placeholders) are in the `SWAPS` block in the same file.
- Local prices (NGN, GHS, KES) and exchange rates live in `build/currency.js` and in the Pricing page logic (`src/pages/Pricing.dc.html`). Update both together.

## Blog (useaktivate.com/blog)

- Posts are Markdown files in `content/posts/` (one file per post; the file name is the address). `build/blog.js` renders `/blog/`, `/blog/<slug>/` and `/blog/rss.xml` from them in the site's design. How to write one: `content/posts/README.md`.
- To publish, merge the file into `main`; Render rebuilds the site. For a browser editor, use Pages CMS (pagescms.org) with GitHub sign-in, or edit the file on GitHub.
- A post with a future `date` is left out until then. The `Blog schedule` GitHub workflow checks every 30 minutes and calls the Render deploy hook when one is due. It needs the repository secret `RENDER_DEPLOY_HOOK` (Render → aktivate-website → Settings → Deploy Hook). You can also run it by hand from the Actions tab.
- Post images live in `content/blog-images/` and are served at `/blog-images/`.
- A post's category pill and the filters on `/blog/` come from its tags: add `for-brands`, `for-creators`, `case-study` or `news` to set it. Without one, it is guessed from the title.
- Posts without a cover image get an illustration collage made from the site's own artwork.
- The blog moved off Hashnode in November 2026. Posts that came from there keep Hashnode's image addresses (cdn.hashnode.com) for now; copy those images into `content/blog-images/` when convenient.
- Test with other data: `BLOG_FIXTURE=path/to/posts.json npm run build` (same shape as the objects `parsePost` in `build/blog.js` returns).
- The old blog.useaktivate.com address is served by the `aktivate-blog-redirect` service in `render.yaml`, which redirects every old post URL to `/blog/<slug>/`.

## Analytics

- Google Analytics 4 (`G-97WXZ4BH1S`, the same property as shop.useaktivate.com) is loaded directly on every page, after the Consent Mode defaults, so it is measured even if the GTM container has no GA4 tag. Override with `GA_MEASUREMENT_ID` at build time.
- If the GTM container (`GTM-TCDHRD3S`) also has a Google tag for `G-97WXZ4BH1S`, pause it there or page views are counted twice.
- Consent defaults by region: in the EEA, UK and Switzerland analytics and ads are `denied` until the visitor accepts; everywhere else analytics starts `granted` (the banner says so and "Reject all" or the Analytics switch turns it off) and ads stay `denied` until accepted. Google applies the region list from the visitor's IP; the banner picks its wording from the browser time zone.
