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
  Storefront: '/example-shop/', Hub: APP_URL, EngagementCalculator: '/tools/engagement-rate-calculator/', RateCalculator: '/tools/influencer-rate-calculator/', Privacy: '/privacy/', Terms: '/terms/',
};
const META = {
  Main: ['Aktivate — Get paid to create | Influencer marketing in Nigeria & Africa', 'Land paid brand campaigns and run your own shop from one link. Built for creators in Nigeria, Kenya, Ghana and South Africa.'],
  CreatorsCampaigns: ['Paid brand deals for creators in Nigeria — Aktivate Collaboration Hub', 'Apply to paid brand campaigns from banks, sportswear, beauty, food and telco brands. Free to join.'],
  CreatorsShopLink: ['ShopLink: turn your link in bio into a store — Aktivate', 'Turn your link in bio into a real store. Earn 10–50% commission on every sale.'],
  Brands: ['Influencer marketing platform for brands in Nigeria & Africa — Aktivate', 'Run creator campaigns and turn 50,000+ verified African creators into your sales team.'],
  SMEs: ['Influencer marketing for SMEs in Nigeria, pay per sale — Aktivate', 'Get creators selling for your business. Pay commission only when you make a sale.'],
  Agencies: ['Influencer sourcing & campaign reports for agencies — Aktivate', 'Source creators for every client and turn post links into client-ready reports.'],
  Pricing: ['Pricing: influencer campaigns, no subscriptions — Aktivate', 'Pay per campaign, per product or per report. No subscriptions.'],
  Storefront: [
    ['style="width: 390px; height: 1560px; box-sizing: border-box; background: #5331E8;', 'style="width: 100%; max-width: 440px; min-height: 100vh; margin: 0 auto; box-sizing: border-box; background: #5331E8;'],
    ['body{margin:0}', 'body{margin:0;background:#3A1FC2}'],
  ],
  About: ['About Aktivate — the creator marketing platform for fast-growing creator markets', 'We’re building the payday for everyday creators. 51,400+ creators and $3M+ paid out across Africa, now opening in Brazil, the Philippines and Indonesia.'],
  EngagementCalculator: ['Free engagement rate calculator for Instagram & TikTok — Aktivate', 'Check any Instagram or TikTok handle and see its engagement rate, average likes and comments, and how it compares to creators the same size. Free, no sign-up.'],
  RateCalculator: ['Influencer rate calculator: what nano & micro creators charge — Aktivate', 'Free influencer rate calculator for creators with 1K–50K followers. See what to charge for a post, Reel, TikTok or Story in naira, shillings, rand, pesos, reais and rupiah.'],
  Terms: ['Terms of Use — Aktivate', 'The terms for using Aktivate: campaigns, ShopLink, Aktivate Reports, fees, payouts and content rights, under Nigerian law.'],
  Privacy: ['Privacy Policy — Aktivate', 'How Aktivate collects, uses and protects personal data, in line with the Nigeria Data Protection Act 2023.'],
  Storefront: ['Example creator shop — Aktivate', 'See what a creator’s ShopLink storefront looks like.'],
};

/* Tells Google who Aktivate is (name, logo, social profiles) so the brand search result shows the right details. */
const ORG_LD = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': SITE_URL + '/#org', name: 'Aktivate', url: SITE_URL + '/', logo: SITE_URL + '/assets/favicon.png',
      areaServed: ['NG', 'KE', 'GH', 'ZA', 'BR', 'PH', 'ID'],
      sameAs: ['https://www.instagram.com/useaktivate', 'https://www.linkedin.com/company/aktivate-inc', 'https://x.com/useaktivate', 'https://www.tiktok.com/@useaktivate'] },
    { '@type': 'WebSite', '@id': SITE_URL + '/#site', name: 'Aktivate', url: SITE_URL + '/', publisher: { '@id': SITE_URL + '/#org' }, inLanguage: 'en' },
  ] })}</script>\n`;

/* -------- announcement bar above the nav, on every page (incl. the blog) --------
   Edit or switch off here. It hides itself after `until`, and stays closed for a visitor who closes it. */
const PROMO = {
  id: 'bf26', // change this for a new promo, so people who closed the last one see it
  until: '2026-11-30T23:00:00Z', // end of Cyber Monday, Lagos time
  text: '<b>Black Friday on ShopLink:</b> creators get <b>₦10,000 extra</b> on their first sale this week. Only 50 spots.',
  short: '<b>+₦10,000</b> on your first ShopLink sale',
  cta: 'Claim yours',
  href: 'https://useaktivate.com/blog/shoplink-black-friday-first-sale-bonus/',
};

function promoBar() {
  if (!PROMO || Date.now() >= Date.parse(PROMO.until)) return '';
  return `<div id="akt-promo" role="region" aria-label="Black Friday offer" style="position:relative;z-index:50;background:#00C4BC;color:#080611;font:400 15px/1.35 Aileron,system-ui,sans-serif">
<a href="${PROMO.href}" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:11px 52px;color:inherit;text-decoration:none;text-align:center">
<span aria-hidden="true" style="flex:none;width:8px;height:8px;border-radius:50%;background:#080611;animation:aktPulse 1.6s ease-in-out infinite"></span>
<span class="akt-promo-l">${PROMO.text}</span><span class="akt-promo-s">${PROMO.short}</span>
<span style="flex:none;font-weight:800;white-space:nowrap;text-decoration:underline;text-underline-offset:3px">${PROMO.cta} &rarr;</span></a>
<button type="button" aria-label="Close" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:#080611;font-size:22px;line-height:1;cursor:pointer;padding:6px 10px">&times;</button>
</div>
<style>.akt-promo-s{display:none}#akt-promo b{font-weight:800}@media (max-width:760px){.akt-promo-l{display:none}.akt-promo-s{display:inline}#akt-promo a{font-size:14px;padding:10px 44px 10px 16px;justify-content:flex-start;text-align:left}}@keyframes aktPulse{50%{opacity:.35}}@media (prefers-reduced-motion:reduce){#akt-promo span[aria-hidden]{animation:none}}</style>
<script>(function(){var b=document.getElementById('akt-promo'),k='akt-promo-${PROMO.id}';try{if(Date.now()>=${Date.parse(PROMO.until)}||localStorage.getItem(k)){b.remove();return;}}catch(e){}
b.querySelector('button').onclick=function(){try{localStorage.setItem(k,'1')}catch(e){}b.remove();};})();</script>
`;
}

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
    contact: SALES, sales: SALES, 'creator-help': 'mailto:creators@useaktivate.com', 'sales-help': SALES + '?subject=Campaign%20support', book: SALES + '?subject=Aktivate%20demo', careers: SALES + '?subject=Customer%20Growth%20Associate',
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
const markets = require('./markets.js');
const pages = ['Main', 'CreatorsCampaigns', 'CreatorsShopLink', 'EngagementCalculator', 'RateCalculator', 'Brands', 'SMEs', 'Agencies', 'Pricing', 'About', 'Privacy', 'Terms', 'Storefront'];

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
  const doc = shell({ title, desc, url, styles, body: html, scripts: pageScripts(ship, name !== 'EngagementCalculator' && name !== 'RateCalculator'),
    noindex: name === 'Storefront', extraHead: (name === 'Main' ? ORG_LD : '') + (name === 'Brands' ? markets.hreflang(SITE_URL, 'biz') : name === 'CreatorsCampaigns' ? markets.hreflang(SITE_URL, 'creators') : '') });
  const dir = name === 'Main' ? OUT : path.join(OUT, ROUTES[name]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), doc);
  if (name !== 'Storefront') sitemap.push(url);
  console.log('built', ROUTES[name], (doc.length / 1024).toFixed(0) + 'KB', ship.map(c => c.name).join(','));
}

function pageScripts(ship, erPopup, marketNudge = true) {
  return `
<script src="/assets/currency.js"></script>
<script src="/assets/consent.js" defer></script>` + (marketNudge ? `
<script src="/assets/market-banner.js" defer></script>` : '') + (erPopup ? `
<script src="/assets/er-popup.js" defer></script>` : '') + (ship.length ? `
<script src="/assets/morphdom.min.js"></script>
<script src="/assets/dc-lite.js"></script>
<script>(function(){var D=window.DCLite,defs={};${ship.map(shipDef).join('\n')}
new D.Page(defs).hydrate();})();</script>` : '');
}

/* A small bar for visitors in Brazil, the Philippines or Indonesia (by time zone) pointing to their country page.
   Dismissable; remembered for 30 days. Never shown on the country pages themselves. */
function marketBanner() {
  return `(function(){try{
var M=${JSON.stringify(markets.bannerConfig())};
var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'',k=null;for(var c in M){if(new RegExp(M[c].tz).test(tz))k=c;}
if(!k||location.pathname.indexOf('/'+k+'/')===0)return;
var seen=+localStorage.getItem('akt-mk')||0;if(Date.now()-seen<2592e6)return;
var m=M[k],b=document.createElement('div');b.setAttribute('role','region');b.setAttribute('aria-label',m.text[0]);b.lang=m.lang;
b.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:12px;max-width:calc(100% - 24px);box-sizing:border-box;padding:10px 10px 10px 18px;border-radius:18px;background:#080611;color:#fff;font:600 15px Aileron,system-ui,sans-serif;box-shadow:0 20px 40px rgba(8,6,17,.35)';
b.innerHTML='<span>'+m.text[0]+'</span><a href="'+m.path+'" style="padding:10px 14px;border-radius:12px;background:#00C4BC;color:#080611;text-decoration:none;font-weight:800;white-space:nowrap">'+m.text[1]+' &rarr;</a><button type="button" aria-label="Close" style="border:0;background:transparent;color:#fff;font-size:22px;cursor:pointer;padding:4px 8px">&times;</button>';
var close=function(){localStorage.setItem('akt-mk',Date.now());b.remove();};
b.querySelector('button').onclick=close;b.querySelector('a').onclick=function(){localStorage.setItem('akt-mk',Date.now());};
var show=function(){if(!document.getElementById('akt-cc')||!document.getElementById('akt-cc').isConnected||document.getElementById('akt-cc').hidden)document.body.appendChild(b);else setTimeout(show,4000);};setTimeout(show,2500);
}catch(e){}})();`;
}

/* The full HTML document every page shares: consent defaults, GTM, meta tags, fonts. */
function shell({ title, desc, url, styles, body, scripts, ogType = 'website', ogImage = SITE_URL + '/assets/og.png', extraHead = '', noindex = false, lang = 'en', locale = 'en_NG' }) {
  return `<!doctype html>
<html lang="${lang}">
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
${noindex ? '<meta name="robots" content="noindex, follow">\n' : ''}<meta property="og:site_name" content="Aktivate">
<meta property="og:locale" content="${locale}">
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
${lang === 'en' && !/\/(br|ph|id)\/|\/blog\/(brasil|philippines|indonesia)/.test(url) ? promoBar() : ''}${body}${scripts}
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

/* blog: posts are Markdown files in content/posts/ (see build/blog.js) */
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
  sitemap.push(...markets.build({
    OUT, SITE_URL, shell,
    styles: headStyles([comps.Nav.helmet, comps.Footer.helmet]),
    nav: chrome.renderInst('Nav', { open: 'none' }, 'mk/Nav#0'),
    footer: chrome.renderInst('Footer', {}, 'mk/Footer#0'),
    scripts: pageScripts([comps.Nav], false, false),
  }));
  fs.writeFileSync(path.join(OUT, 'assets', 'market-banner.js'), marketBanner());
  // Images for blog posts that we host ourselves : content/blog-images → /blog-images/
  const BI = path.join(__dirname, '..', 'content', 'blog-images');
  if (fs.existsSync(BI)) { fs.mkdirSync(path.join(OUT, 'blog-images'), { recursive: true }); for (const f of fs.readdirSync(BI)) if (/\.(png|jpe?g|webp|gif)$/i.test(f)) fs.copyFileSync(path.join(BI, f), path.join(OUT, 'blog-images', f)); }
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  console.log('done');
}).catch((e) => {
  // Fail the build so Render keeps the current live site instead of shipping one without a blog.
  console.error('blog build failed:', e);
  process.exit(1);
});
