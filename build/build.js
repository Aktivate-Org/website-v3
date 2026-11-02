/* Build the Aktivate website from the design-canvas pages into a static site.
   Usage: node build.js <pages-dir> <out-dir> <asset-map.json> */
const fs = require('fs');
const path = require('path');
const { parseDocument } = require('htmlparser2');
const DC = require('./dc-lite.js');

const [, , PAGES_DIR, OUT, ASSET_MAP] = process.argv;
const assetMap = JSON.parse(fs.readFileSync(ASSET_MAP, 'utf8'));
const SITE_URL = 'https://useaktivate.com';
const APP_URL = 'https://app.useaktivate.com';
const SHOP_URL = 'https://shop.useaktivate.com';
const SALES = 'mailto:sales@useaktivate.com';
const GTM_ID = 'GTM-TCDHRD3S';

const ROUTES = {
  Main: '/', CreatorsCampaigns: '/creators/collaboration-hub/', CreatorsShopLink: '/creators/shoplink/',
  Brands: '/brands/', SMEs: '/smes/', Agencies: '/agencies/', Pricing: '/pricing/', About: '/about/',
  Storefront: '/example-shop/', Hub: APP_URL, EngagementCalculator: '/tools/engagement-rate-calculator/',
};
const META = {
  Main: ['Aktivate — Get paid to create', 'Land paid brand campaigns and run your own shop from one link. Built for creators in Nigeria, Kenya, Ghana and South Africa.'],
  CreatorsCampaigns: ['Collaboration Hub for creators — Aktivate', 'Apply to paid brand campaigns from banks, sportswear, beauty, food and telco brands. Free to join.'],
  CreatorsShopLink: ['ShopLink for creators — Aktivate', 'Turn your link in bio into a real store. Earn 10–50% commission on every sale.'],
  Brands: ['Aktivate for brands', 'Run creator campaigns and turn 50,000+ verified African creators into your sales team.'],
  SMEs: ['Aktivate for SMEs', 'Get creators selling for your business. Pay commission only when you make a sale.'],
  Agencies: ['Aktivate for agencies', 'Source creators for every client and turn post links into client-ready reports.'],
  Pricing: ['Pricing — Aktivate', 'Pay per campaign, per product or per report. No subscriptions.'],
  Storefront: [
    ['style="width: 390px; height: 1560px; box-sizing: border-box; background: #5331E8;', 'style="width: 100%; max-width: 440px; min-height: 100vh; margin: 0 auto; box-sizing: border-box; background: #5331E8;'],
    ['body{margin:0}', 'body{margin:0;background:#3A1FC2}'],
  ],
  About: ['About Aktivate', 'We’re building the payday for Africa’s creators. 51,400+ creators, $3M+ paid out.'],
  EngagementCalculator: ['Free engagement rate calculator for Instagram & TikTok — Aktivate', 'Check any Instagram or TikTok handle and see its engagement rate, average likes and comments, and how it compares to creators the same size. Free, no sign-up.'],
  Storefront: ['Example creator shop — Aktivate', 'See what a creator’s ShopLink storefront looks like.'],
};

/* -------- launch-safe content swaps (production only) -------- */
const SWAPS = {
};

function prep(name, src) {
  for (const [a, b] of SWAPS[name] || []) {
    const before = src;
    src = typeof a === 'string' ? src.split(a).join(b) : src.replace(a, b);
    if (src === before) throw new Error(`swap did not apply on ${name}: ${String(a).slice(0, 60)}`);
  }
  src = src.replace(/([A-Za-z]+)\.dc\.html/g, (m, n) => {
    if (!(n in ROUTES)) throw new Error('unknown route ' + n);
    return ROUTES[n];
  });
  // Links that need a real destination. Edit these in one place.
  const LINKS = {
    signup: APP_URL, login: APP_URL, refer: APP_URL, access: APP_URL,
    'shop-signup': SHOP_URL, claim: SHOP_URL, 'reports-app': 'https://reports.useaktivate.com',
    contact: SALES, sales: SALES, book: SALES + '?subject=Aktivate%20demo', careers: SALES + '?subject=Customer%20Growth%20Associate',
    blog: 'https://blog.useaktivate.com',
    instagram: 'https://www.instagram.com/useaktivate', tiktok: 'https://www.tiktok.com/@useaktivate',
    x: 'https://x.com/useaktivate', linkedin: 'https://www.linkedin.com/company/aktivate-inc/',
  };
  src = src.replace(/href="#([a-z-]+)"/g, (m, k) => (LINKS[k] ? `href="${LINKS[k]}"` : m));
  src = src.replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => {
    if (!assetMap[id]) throw new Error('unmapped asset ' + id + ' in ' + name);
    return '/assets/' + assetMap[id].out;
  });
  return src;
}

function toAst(nodes) {
  const out = [];
  for (const n of nodes) {
    if (n.type === 'text') out.push({ t: 'text', v: n.data });
    else if (n.type === 'tag' || n.type === 'script' || n.type === 'style') {
      out.push({ t: 'el', n: n.name, a: { ...n.attribs }, c: toAst(n.children || []) });
    }
  }
  return out;
}

function load(name) {
  const raw = prep(name, fs.readFileSync(path.join(PAGES_DIR, name + '.dc.html'), 'utf8'));
  const xdc = raw.match(/<x-dc>([\s\S]*)<\/x-dc>/)[1];
  const helmet = (xdc.match(/<helmet>([\s\S]*?)<\/helmet>/) || [, ''])[1];
  const body = xdc.replace(/<helmet>[\s\S]*?<\/helmet>/, '');
  const logic = raw.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
  const doc = parseDocument(body, { lowerCaseAttributeNames: false, recognizeSelfClosing: false, decodeEntities: true });
  const ast = toAst(doc.children);
  const Cls = new Function('DCLogic', logic + '\nreturn Component;')(DC.DCLogic);
  return { name, ast, logic, helmet, Cls, stateful: /setState|forceUpdate/.test(logic) };
}

const comps = { Nav: load('Nav'), Footer: load('Footer') };
const pages = ['Main', 'CreatorsCampaigns', 'CreatorsShopLink', 'EngagementCalculator', 'Brands', 'SMEs', 'Agencies', 'Pricing', 'About', 'Storefront'];

function headStyles(list) {
  const seen = new Set(); let out = '';
  for (const h of list) {
    const parts = h.match(/<style[\s\S]*?<\/style>|<link[^>]*>/g) || [];
    for (const p of parts) { const k = p.trim(); if (!seen.has(k)) { seen.add(k); out += k + '\n'; } }
  }
  return out;
}

function shipDef(c) {
  return `defs[${JSON.stringify(c.name)}]={ast:${JSON.stringify(c.ast)},Cls:(function(DCLogic){${c.logic}\nreturn Component;})(D.DCLogic)};`;
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });

const sitemap = [];
for (const name of pages) {
  const root = load(name);
  const defs = { [name]: root, Nav: comps.Nav, Footer: comps.Footer };
  const page = new DC.Page(defs);
  const html = page.renderInst(name, {}, 'root');
  const usesNav = /"name":"Nav"/.test(JSON.stringify(root.ast));
  const ship = [];
  if (usesNav) ship.push(comps.Nav);
  if (root.stateful) { ship.push(root); if (/name="Footer"|"name":"Footer"/.test(JSON.stringify(root.ast))) ship.push(comps.Footer); }
  const [title, desc] = META[name];
  const url = SITE_URL + ROUTES[name];
  const styles = headStyles([root.helmet, comps.Nav.helmet, comps.Footer.helmet]);
  const scripts = `
<script src="/assets/currency.js"></script>` + (ship.length ? `
<script src="/assets/morphdom.min.js"></script>
<script src="/assets/dc-lite.js"></script>
<script>(function(){var D=window.DCLite,defs={};${ship.map(shipDef).join('\n')}
new D.Page(defs).hydrate();})();</script>` : '');
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');</script>
<!-- End Google Tag Manager -->
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="preload" href="/assets/aileron-800.woff2" as="font" type="font/woff2" crossorigin>
${styles}<style>
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
img{max-width:100%}
@media (max-width:899px){html:not(.dc-ready) [data-dc-name="Nav"] nav{visibility:hidden}}
</style>
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
${html}${scripts}
</body>
</html>
`;
  const dir = name === 'Main' ? OUT : path.join(OUT, ROUTES[name]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), doc);
  if (name !== 'Storefront') sitemap.push(url);
  console.log('built', ROUTES[name], (doc.length / 1024).toFixed(0) + 'KB', ship.map(c => c.name).join(','));
}

/* assets */
for (const id in assetMap) fs.copyFileSync(assetMap[id].src, path.join(OUT, 'assets', assetMap[id].out));
fs.copyFileSync(require.resolve('morphdom/dist/morphdom-umd.min.js'), path.join(OUT, 'assets/morphdom.min.js'));
fs.copyFileSync(path.join(__dirname, 'dc-lite.js'), path.join(OUT, 'assets/dc-lite.js'));
fs.copyFileSync(path.join(__dirname, 'currency.js'), path.join(OUT, 'assets/currency.js'));

fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('done');
