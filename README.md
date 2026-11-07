# Aktivate website

Static site for useaktivate.com, built from the page designs in `src/pages`.

- `npm install && npm run build` writes the finished site to `site/`.
- Hosting: Render static site (see `render.yaml`), publish folder `site/`.
- Link destinations (sign up, log in, contact, referrals) are set in the `LINKS` block near the top of `build/build.js`.
- Launch-only text changes (e.g. hiding sections, replacing placeholders) are in the `SWAPS` block in the same file.
- Local prices (NGN, GHS, KES) and exchange rates live in `build/currency.js` and in the Pricing page logic (`src/pages/Pricing.dc.html`). Update both together.

## Blog (useaktivate.com/blog)

- Posts are written and published in Hashnode (headless mode). `build/blog.js` fetches them from the Hashnode API at build time and renders `/blog/`, `/blog/<slug>/` and `/blog/rss.xml` in the site's design.
- New or edited posts appear after a rebuild. A Hashnode webhook (post published / updated / deleted) calls the Render deploy hook, so this happens automatically.
- If Hashnode can't be reached, the build fails on purpose and Render keeps the current live site.
- A post's category pill and the filters on `/blog/` come from its Hashnode tags: add `for-brands`, `for-creators`, `case-study` or `news` to set it. Without one, it is guessed from the title.
- Posts without a cover image get an illustration collage made from the site's own artwork.
- Test locally without network access: `BLOG_FIXTURE=path/to/posts.json npm run build` (same shape as the Hashnode API's post nodes).
- The old blog.useaktivate.com address is served by the `aktivate-blog-redirect` service in `render.yaml`, which redirects every old post URL to `/blog/<slug>/`.
