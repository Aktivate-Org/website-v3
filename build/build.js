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
// GA4 property the old useaktivate.com (and shop.useaktivate.com) report to. Loaded directly so the site is
// measured even if the GTM container has no GA4 tag. If the container also has a Google tag for this ID,
// pause it there, or every page view is counted twice.
const GA_ID = process.env.GA_MEASUREMENT_ID || 'G-97WXZ4BH1S';

const ROUTES = {
  Main: '/', CreatorsCampaigns: '/creators/collaboration-hub/', CreatorsShopLink: '/creators/shoplink/',
  Brands: '/brands/', SMEs: '/smes/', Agencies: '/agencies/', Pricing: '/pricing/', About: '/about/',
  Storefront: '/example-shop/', Hub: APP_URL, EngagementCalculator: '/tools/engagement-rate-calculator/', Privacy: '/privacy/', Terms: '/terms/',
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
  Terms: ['Terms of Use — Aktivate', 'The terms for using Aktivate: campaigns, ShopLink, Aktivate Reports, fees, payouts and content rights, under Nigerian law.'],
  Privacy: ['Privacy Policy — Aktivate', 'How Aktivate collects, uses and protects personal data, in line with the Nigeria Data Protection Act 2023.'],
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
    blog: '/blog/', alternatives: '/alternatives/',
    instagram: 'https://www.instagram.com/useaktivate', tiktok: 'https://www.tiktok.com/@useaktivate',
    x: 'https://x.com/useaktivate', whatsapp: 'https://chat.whatsapp.com/KyOL3vkMOtLFESGUqSpsqY', linkedin: 'https://www.linkedin.com/company/aktivate-inc/',
  };
  // These leave the site, so they open in a new tab and the visitor keeps their place on useaktivate.com.
  const NEW_TAB = new Set(['instagram', 'tiktok', 'x', 'whatsapp', 'linkedin']);
  src = src.replace(/<a\b[^>]*>/g, (tag) => tag.replace(/href="#([a-z-]+)"/, (m, k) => {
    if (!LINKS[k]) return m;
    return `href="${LINKS[k]}"` + (NEW_TAB.has(k) && !/\btarget=/.test(tag) ? ' target="_blank" rel="noopener"' : '');
  }));
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
const pages = ['Main', 'CreatorsCampaigns', 'CreatorsShopLink', 'EngagementCalculator', 'Brands', 'SMEs', 'Agencies', 'Pricing', 'About', 'Privacy', 'Terms', 'Storefront'];

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
  const doc = shell({ title, desc, url, styles, body: html, scripts: pageScripts(ship, name !== 'EngagementCalculator') });
  const dir = name === 'Main' ? OUT : path.join(OUT, ROUTES[name]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), doc);
  if (name !== 'Storefront') sitemap.push(url);
  console.log('built', ROUTES[name], (doc.length / 1024).toFixed(0) + 'KB', ship.map(c => c.name).join(','));
}

function pageScripts(ship, erPopup) {
  return `
<script src="/assets/currency.js"></script>
<script src="/assets/consent.js" defer></script>` + (erPopup ? `
<script src="/assets/er-popup.js" defer></script>` : '') + (ship.length ? `
<script src="/assets/morphdom.min.js"></script>
<script src="/assets/dc-lite.js"></script>
<script>(function(){var D=window.DCLite,defs={};${ship.map(shipDef).join('\n')}
new D.Page(defs).hydrate();})();</script>` : '');
}

/* The full HTML document every page shares: consent defaults, GTM, meta tags, fonts. */
function shell({ title, desc, url, styles, body, scripts, ogType = 'website', ogImage = SITE_URL + '/assets/og.png', extraHead = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<!-- Consent Mode v2 defaults (must run before GTM): everything off in the EEA, UK and Switzerland until
     the visitor accepts; elsewhere analytics starts on (visitors can turn it off), ads stay off until accepted -->
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500,region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH']});
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',true);
(function(){try{var c=JSON.parse(localStorage.getItem('akt-consent'));if(c&&c.v===1&&Date.now()-c.ts<31536e6){var m=c.marketing?'granted':'denied';gtag('consent','update',{analytics_storage:c.analytics?'granted':'denied',ad_storage:m,ad_user_data:m,ad_personalization:m});}}catch(e){}})();</script>
<!-- Google Analytics 4 (follows the consent state above: cookieless pings until a visitor accepts) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>gtag('js',new Date());gtag('config','${GA_ID}');</script>
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
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="preload" href="/assets/aileron-800.woff2" as="font" type="font/woff2" crossorigin>
${extraHead}${styles}<style>
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
${body}${scripts}
</body>
</html>
`;
}

/* assets */
for (const id in assetMap) fs.copyFileSync(assetMap[id].src, path.join(OUT, 'assets', assetMap[id].out));
fs.copyFileSync(require.resolve('morphdom/dist/morphdom-umd.min.js'), path.join(OUT, 'assets/morphdom.min.js'));
fs.copyFileSync(path.join(__dirname, 'dc-lite.js'), path.join(OUT, 'assets/dc-lite.js'));
fs.copyFileSync(path.join(__dirname, 'currency.js'), path.join(OUT, 'assets/currency.js'));
fs.copyFileSync(path.join(__dirname, 'consent.js'), path.join(OUT, 'assets/consent.js'));
fs.copyFileSync(path.join(__dirname, 'er-popup.js'), path.join(OUT, 'assets/er-popup.js'));

/* blog: posts come from Hashnode at build time (see build/blog.js) */
const chrome = new DC.Page({ Nav: comps.Nav, Footer: comps.Footer });
require('./blog.js').build({
  OUT, SITE_URL, APP_URL, shell,
  styles: headStyles([comps.Nav.helmet, comps.Footer.helmet]),
  nav: chrome.renderInst('Nav', { open: 'none' }, 'blog/Nav#0'),
  footer: chrome.renderInst('Footer', {}, 'blog/Footer#0'),
  scripts: pageScripts([comps.Nav], true),
}).then((blogUrls) => {
  sitemap.push(...blogUrls);
  sitemap.push(...require('./compare.js').build({
    OUT, SITE_URL, shell,
    styles: headStyles([comps.Nav.helmet, comps.Footer.helmet]),
    nav: chrome.renderInst('Nav', { open: 'none' }, 'alt/Nav#0'),
    footer: chrome.renderInst('Footer', {}, 'alt/Footer#0'),
    scripts: pageScripts([comps.Nav], true),
  }));
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  console.log('done');
}).catch((e) => {
  // Fail the build so Render keeps the current live site instead of shipping one without a blog.
  console.error('blog build failed:', e);
  process.exit(1);
});
