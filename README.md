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
- Hashnode's API is at `https://gql-beta.hashnode.com` (moved in 2026; the old `gql.hashnode.com` redirects to an announcement page) and needs the publication on Hashnode Pro. Optional: `HASHNODE_TOKEN` on Render (and as a GitHub secret) with a Personal Access Token from Hashnode → Settings → Developer; `HASHNODE_GQL` overrides the address if it moves again.
- If Hashnode can't be reached the build uses `build/blog-snapshot.json`, so keep it fresh when the API is down.
- Scheduled posts go live on Hashnode without a webhook, so they aren't built yet. Two things cover that:
  - `/blog/_live/` (built every time) is served by a rewrite in `render.yaml` for any `/blog/<slug>/` that has no page yet. It loads the post from Hashnode in the browser, so readers never see "Not found".
  - The `Blog sync` GitHub workflow checks every 30 minutes for posts still on that fallback and calls the Render deploy hook. It needs the repository secret `RENDER_DEPLOY_HOOK` (Render → aktivate-website → Settings → Deploy Hook). You can also run it by hand from the Actions tab.
- If Hashnode can't be reached, the build fails on purpose and Render keeps the current live site.
- A post's category pill and the filters on `/blog/` come from its Hashnode tags: add `for-brands`, `for-creators`, `case-study` or `news` to set it. Without one, it is guessed from the title.
- Posts without a cover image get an illustration collage made from the site's own artwork.
- Test locally without network access: `BLOG_FIXTURE=path/to/posts.json npm run build` (same shape as the Hashnode API's post nodes).
- The old blog.useaktivate.com address is served by the `aktivate-blog-redirect` service in `render.yaml`, which redirects every old post URL to `/blog/<slug>/`.

## Analytics

- Google Analytics 4 (`G-97WXZ4BH1S`, the same property as shop.useaktivate.com) is loaded directly on every page, after the Consent Mode defaults, so it is measured even if the GTM container has no GA4 tag. Override with `GA_MEASUREMENT_ID` at build time.
- If the GTM container (`GTM-TCDHRD3S`) also has a Google tag for `G-97WXZ4BH1S`, pause it there or page views are counted twice.
- Analytics is `denied` until a visitor accepts cookies; GA then only receives cookieless pings, which reports show only after Google's modelling thresholds are met.
