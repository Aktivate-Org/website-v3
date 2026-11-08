/* "Alternative to X" pages for search: /alternatives/ and /alternatives/<competitor>/.
   Each page targets searches like "ShopMy alternative", "African ShopMy", "LTK Nigeria".

   To add a page, add an entry to PAGES. Keep competitor facts to what their own help pages or
   reputable reviews say, note the month they were checked (FACTS_CHECKED), and re-check them
   every few months. Never state a competitor is unavailable somewhere unless they say so. */
const fs = require('fs');
const path = require('path');

const FACTS_CHECKED = 'November 2026';
const SHOP = 'https://shop.useaktivate.com';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '');
const ARROW = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CHECK = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';

/* ShopLink's side of every comparison (keep in line with the ShopLink page and pricing). */
const SHOPLINK = {
  'Built for': 'Creators and brands in Nigeria, Kenya, Ghana and South Africa',
  'Products': 'African fashion, beauty, lifestyle and everyday brands that deliver to your followers',
  'Where your follower pays': 'On your own ShopLink store, at shop.useaktivate.com/@yourname',
  'How your follower pays': 'Card, bank transfer or USSD, in local currency (Paystack)',
  'How you get paid': 'Aktivate wallet, then your local bank account',
  'When you get paid': '7 days after each purchase',
  'Commission': 'Set by each brand per product: 10–50%, or a fixed amount',
  'Who can join': 'Any creator. Free to open your store',
};

const PAGES = [
  {
    slug: 'shopmy', name: 'ShopMy', short: 'ShopMy',
    title: 'The Best ShopMy Alternative for African Creators — ShopLink vs ShopMy',
    desc: 'Looking for an African ShopMy? ShopLink gives creators in Nigeria, Kenya, Ghana and South Africa a shoppable store, products followers can actually buy, and commission 7 days after each sale.',
    h1: ['The ShopMy alternative', 'built for Africa.'],
    lede: 'ShopMy is built around US retailers, Stripe or PayPal payouts, and commissions that can take months to clear. ShopLink gives African creators a real store, local products and fast payouts.',
    answer: 'Yes. <b>ShopLink by Aktivate</b> is a creator storefront like ShopMy, built for Nigeria, Kenya, Ghana and South Africa. You fill a store with products from African brands, share one link, and earn 10–50% commission on every sale, paid 7 days after the purchase.',
    them: {
      'Built for': 'US creators and global retailers',
      'Products': 'Mostly US and European retailers, many of which don’t ship to Africa',
      'Where your follower pays': 'On the retailer’s website, after a redirect',
      'How your follower pays': 'The retailer’s own checkout, usually in dollars',
      'How you get paid': 'Stripe or PayPal',
      'When you get paid': 'Weekly, once commission is confirmed, which typically takes 30–120 days',
      'Commission': 'Set by the retailer, typically 10–30%; you keep 82% on the standard model',
      'Who can join': 'Apply and wait for review (typically 1,000+ followers)',
    },
    features: [
      ['Free for creators', 'Y', 'Y'],
      ['Open to every creator, no application', 'Y', 'N'],
      ['Products from African brands that deliver locally', 'Y', 'N'],
      ['Followers pay by card, transfer or USSD in local currency', 'Y', 'N'],
      ['Paid without needing Stripe or PayPal', 'Y', 'N'],
      ['Commission paid 7 days after each sale', 'Y', '30–120 days'],
      ['Sale made on your own store, not a retailer’s site', 'Y', 'N'],
      ['Products from US and European retailers', 'N', 'Y'],
    ],
    reasons: [
      ['Products your followers can buy', 'A follower in Lagos who taps a US retailer link often hits dollar prices, no delivery or heavy customs. ShopLink is stocked by African brands that deliver locally.'],
      ['Paid where you live', 'No Stripe or PayPal needed. Commission lands in your Aktivate wallet and goes to your local bank account.'],
      ['Paid in a week, not months', 'ShopMy holds commission until the retailer pays, often 30–120 days. ShopLink pays 7 days after each purchase.'],
      ['Every sale is yours', 'Followers buy on your store, not a retailer’s site, so no sale is lost to a cleared cookie or a switched device.'],
    ],
    fair: 'ShopMy is a strong choice if your audience is mostly in the US or Europe and shops at retailers like Nordstrom, Sephora or Revolve. If your followers are in Africa, they need products that deliver to them and a checkout they can use, and you need payouts you can receive.',
    faq: [
      ['Is there an African version of ShopMy?', 'Yes. ShopLink by Aktivate works like ShopMy: you build a shoppable store, share one link, and earn commission when followers buy. It is built for Nigeria, Kenya, Ghana and South Africa, with African brands, local payment methods and payouts to your local bank account.'],
      ['Does ShopMy work in Nigeria?', `ShopMy is a US company. Creators apply and are reviewed, payouts go through Stripe or PayPal, and most of its retailers are US and European stores. Check ShopMy’s own help pages for whether you can join and get paid where you live. Even where you can, many of those retailers don’t deliver to Nigeria, which makes sales hard to close.`],
      ['Is ShopLink free for creators?', 'Yes. Opening your ShopLink store is free. You earn commission on every sale; brands pay to list their products.'],
      ['How much commission can I earn on ShopLink?', 'Each brand sets the commission per product, from 10% to 50% of the price, or a fixed amount for things like restaurant and hotel bookings. You see exactly what you earn before you add a product.'],
      ['How fast does ShopLink pay?', 'Commission lands in your Aktivate wallet 7 days after each purchase, once the refund window has passed.'],
      ['Can I use ShopLink and ShopMy together?', 'Yes. Many creators use ShopMy or LTK for international products and ShopLink for followers in Africa. Put your ShopLink store in your bio for local followers.'],
    ],
    related: [['ShopLink vs ShopMy vs LTK: the full comparison', '/blog/shoplink-vs-shopmy-vs-ltk/'], ['What is ShopLink?', '/blog/what-is-shoplink/'], ['Affiliate marketing in Nigeria', '/blog/affiliate-marketing-in-nigeria/'], ['The LTK alternative for Africa', '/alternatives/ltk/']],
  },
  {
    slug: 'ltk', name: 'LTK (LIKEtoKNOW.it)', short: 'LTK',
    title: 'The Best LTK Alternative for African Creators — ShopLink vs LTK',
    desc: 'LTK (LIKEtoKNOW.it) is invite-only and pays through PayPal once retailers clear commission. ShopLink is open to every African creator, with local brands and commission 7 days after each sale.',
    h1: ['The LTK alternative', 'African creators can actually join.'],
    lede: 'LTK is invite-only, built around global retailers, and pays monthly through PayPal with a $100 minimum. ShopLink is free to open, stocked with African brands, and pays 7 days after each sale.',
    answer: 'The closest LTK alternative for African creators is <b>ShopLink by Aktivate</b>. Any creator can open a free store, add products from African brands, share one link and earn 10–50% commission per sale, paid 7 days after the purchase.',
    them: {
      'Built for': 'Creators shopping global retailers',
      'Products': 'Retailers in many countries, mostly US and European',
      'Where your follower pays': 'On the retailer’s website, after a redirect',
      'How your follower pays': 'The retailer’s own checkout',
      'How you get paid': 'PayPal; direct deposit in some regions',
      'When you get paid': 'Monthly, once the retailer clears commission; $100 minimum',
      'Commission': 'Varies by brand, typically 5–20%',
      'Who can join': 'Invite-only; applicants are vetted',
    },
    features: [
      ['Free for creators', 'Y', 'Y'],
      ['Open to every creator, no invite', 'Y', 'N'],
      ['Products from African brands that deliver locally', 'Y', 'N'],
      ['Followers pay by card, transfer or USSD in local currency', 'Y', 'N'],
      ['Paid without needing PayPal', 'Y', 'Some regions'],
      ['Commission paid 7 days after each sale', 'Y', 'Monthly'],
      ['Sale made on your own store, not a retailer’s site', 'Y', 'N'],
      ['Products from US and European retailers', 'N', 'Y'],
    ],
    reasons: [
      ['Open to every creator', 'No invite or vetting queue. Sign up with your Aktivate account and your store is ready the same day.'],
      ['Paid in a week, not a month', 'LTK pays monthly once retailers clear commission. ShopLink commission lands in your wallet 7 days after each purchase.'],
      ['Higher commission', 'Brands on ShopLink set 10–50% per product to attract creators, and you see your cut before you add anything.'],
      ['Built for local shoppers', 'Naira and local prices, local delivery, and a checkout that takes card, transfer and USSD.'],
    ],
    fair: 'LTK is a good fit for established fashion and home creators with audiences in the US, UK or Europe. If your followers are in Africa, ShopLink gives them products they can receive and gives you payouts you can use.',
    faq: [
      ['Is LTK available in Nigeria?', 'LTK is invite-only and vets applicants. It pays through PayPal, with direct deposit only in some regions, and most of its retailers are outside Africa. Check LTK’s own help pages for whether you can join and get paid where you live.'],
      ['What is the best LTK alternative in Africa?', 'ShopLink by Aktivate is built for creators in Nigeria, Kenya, Ghana and South Africa: a free storefront, African brands that deliver locally, and commission paid 7 days after each sale.'],
      ['Do I need an invite to join ShopLink?', 'No. Any creator can open a ShopLink store for free. Some brands choose to approve or invite the creators who sell their products.'],
      ['How much commission can I earn on ShopLink?', 'Brands set the commission per product, from 10% to 50% of the price, or a fixed amount per sale.'],
    ],
    related: [['ShopLink vs ShopMy vs LTK: the full comparison', '/blog/shoplink-vs-shopmy-vs-ltk/'], ['The ShopMy alternative for Africa', '/alternatives/shopmy/'], ['How to make money as a creator in Nigeria', '/blog/how-to-make-money-as-a-content-creator-in-nigeria/'], ['What is ShopLink?', '/blog/what-is-shoplink/']],
  },
];

/* ---------------- styles ---------------- */
const CSS = `<style>
body{margin:0;background:#ECEBF2}
.cp{font-family:'Aileron',system-ui,sans-serif;color:#080611;background:#ECEBF2;overflow:hidden}
.cp a{color:inherit}
.cp-wrap{max-width:1280px;margin:0 auto;padding:0 clamp(16px,1.7vw,24px)}
.cp-hero{background:#001FFF;color:#fff;padding:clamp(24px,3.3vw,48px) 0 clamp(56px,6vw,96px)}
.cp-hero-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:clamp(24px,4vw,64px);align-items:center}
.cp-crumbs{margin:0 0 22px;font-size:14px;font-weight:700;color:#C9D2FF}.cp-crumbs a{color:#fff;text-decoration:none}
.cp-tag{display:inline-block;margin:0 0 22px;padding:8px 16px;border-radius:999px;background:#fff;color:#001FFF;font-weight:700;font-size:14px}
.cp-hero h1{margin:0;font-weight:800;font-size:clamp(42px,6.2vw,90px);line-height:.94;letter-spacing:-.045em}
.cp-hero h1 span{color:#00C4BC;display:block}
.cp-lede{margin:24px 0 0;max-width:600px;font-size:clamp(17px,1.6vw,21px);line-height:1.5;color:#E6E9FF}
.cp-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}
.cp-btn{display:inline-flex;align-items:center;gap:10px;min-height:56px;padding:0 26px;border-radius:16px;text-decoration:none;font-weight:800;font-size:16px}
.cp-btn--teal{background:#00C4BC;color:#080611!important}.cp-btn--ghost{background:rgba(255,255,255,.12);color:#fff!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.35)}
.cp-btn--blue{background:#001FFF;color:#fff!important}
/* storefront visual */
.cp-phone{justify-self:center;width:min(100%,360px);background:#5331E8;border-radius:36px;padding:22px 18px 18px;box-shadow:0 40px 80px rgba(8,6,17,.35);transform:rotate(2.5deg);position:relative}
.cp-phone-head{display:flex;align-items:center;gap:12px;color:#fff}
.cp-phone-head img{width:52px;height:52px;border-radius:50%;border:3px solid #fff}
.cp-phone-head b{display:block;font-size:17px}.cp-phone-head small{font-size:13px;color:#D9D4FF}
.cp-shop{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}
.cp-item{background:#fff;border-radius:20px;padding:8px 8px 12px;color:#080611}
.cp-item img{width:100%;aspect-ratio:1;border-radius:14px;display:block}
.cp-item b{display:block;font-size:13px;margin:8px 4px 0}
.cp-earn{display:inline-block;margin:6px 4px 0;padding:4px 9px;border-radius:999px;background:#CDF4F2;color:#005B57;font-size:11px;font-weight:800}
.cp-sticker{position:absolute;width:84px;right:-26px;top:-26px;transform:rotate(14deg)}
.cp-paid{position:absolute;left:-30px;bottom:34px;background:#fff;color:#080611;border-radius:18px;padding:12px 14px;box-shadow:0 20px 40px rgba(8,6,17,.25);transform:rotate(-4deg);font-size:13px;line-height:1.3}
.cp-paid b{display:block;font-size:18px;color:#001FFF}
/* feature grid */
.cp-grid{background:#fff;border-radius:28px;padding:8px clamp(8px,1.5vw,16px)}
.cp-grow{display:grid;grid-template-columns:minmax(0,1fr) 140px 140px;align-items:center;gap:10px;padding:14px clamp(8px,1.5vw,16px);border-top:1px solid #ECEBF2;font-size:16px;font-weight:600;line-height:1.35}
.cp-grow>span:not(:first-child){display:flex;justify-content:center;align-items:center;text-align:center}
.cp-ghead{border-top:0;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#5A566A}
.cp-ghead .cp-gus{color:#001FFF;gap:8px;font-size:15px;text-transform:none;letter-spacing:0}
.cp-ghead .cp-gus img{width:22px;height:22px}
.cp-ghead span:last-child{font-size:15px;text-transform:none;letter-spacing:0;color:#080611}
.cp-y,.cp-n{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.cp-y{background:#00C4BC;color:#080611}.cp-n{background:#ECEBF2;color:#8A8698}
.cp-t{font-size:13px;font-weight:700;color:#5A566A}
@media (max-width:560px){.cp-grow{grid-template-columns:minmax(0,1fr) 72px 72px;font-size:14px}.cp-ghead .cp-gus img{display:none}}
/* sections */
.cp-answer{margin-top:clamp(-36px,-3vw,-24px);position:relative;background:#fff;border-radius:28px;padding:clamp(22px,3vw,36px);display:grid;grid-template-columns:auto 1fr;gap:18px;box-shadow:0 24px 50px rgba(8,6,17,.12)}
.cp-answer i{width:48px;height:48px;border-radius:14px;background:#CDF4F2;color:#005B57;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:800;font-size:22px}
.cp-answer h2{margin:0;font-size:20px;font-weight:800;letter-spacing:-.02em}
.cp-answer p{margin:8px 0 0;font-size:17px;line-height:1.6;color:#2A2638}
.cp-sec{margin-top:clamp(56px,7vw,96px)}
.cp-eyebrow{margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5331E8}
.cp-sec h2.cp-h{margin:0 0 24px;font-weight:800;font-size:clamp(32px,4vw,56px);line-height:1;letter-spacing:-.045em;max-width:860px}
.cp-table{background:#fff;border-radius:28px;overflow:hidden;overflow-x:auto}
.cp-table table{width:100%;border-collapse:collapse;min-width:640px;font-size:15px;line-height:1.45}
.cp-table th,.cp-table td{padding:18px 20px;text-align:left;vertical-align:top;border-top:1px solid #ECEBF2}
.cp-table thead th{border-top:0;font-size:15px;font-weight:800}
.cp-table thead th.cp-us{background:#001FFF;color:#fff}
.cp-table tbody th{width:22%;font-weight:700;color:#5A566A;font-size:14px}
.cp-table td.cp-us{background:#F2F4FF;color:#080611;font-weight:600}
.cp-table td.cp-them{color:#4A4658}
.cp-note{margin:12px 4px 0;font-size:13px;color:#5A566A}
.cp-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.cp-card{background:#fff;border-radius:28px;padding:26px}
.cp-card span{width:40px;height:40px;border-radius:12px;background:#001FFF;color:#fff;display:flex;align-items:center;justify-content:center}
.cp-card h3{margin:18px 0 8px;font-size:20px;line-height:1.15;font-weight:800;letter-spacing:-.02em}
.cp-card p{margin:0;font-size:15px;line-height:1.55;color:#4A4658}
.cp-split{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cp-steps{background:#080611;color:#fff;border-radius:32px;padding:clamp(26px,3.5vw,44px)}
.cp-steps h2{margin:0 0 22px;font-weight:800;font-size:clamp(28px,3vw,40px);letter-spacing:-.04em;line-height:1}
.cp-steps ol{margin:0;padding:0;list-style:none;counter-reset:s}
.cp-steps li{counter-increment:s;display:grid;grid-template-columns:44px 1fr;gap:14px;padding:16px 0;border-top:1px solid rgba(255,255,255,.12);font-size:16px;line-height:1.5;color:#C9C6D6}
.cp-steps li::before{content:counter(s,decimal-leading-zero);font-weight:800;color:#00C4BC}
.cp-steps li b{color:#fff}
.cp-fair{background:#fff;border-radius:32px;padding:clamp(26px,3.5vw,44px)}
.cp-fair h2{margin:0 0 14px;font-weight:800;font-size:clamp(28px,3vw,40px);letter-spacing:-.04em;line-height:1}
.cp-fair p{margin:0;font-size:17px;line-height:1.6;color:#2A2638}
.cp-faq{background:#fff;border-radius:32px;padding:clamp(10px,2vw,20px) clamp(20px,3vw,40px)}
.cp-faq details{border-top:1px solid #ECEBF2}.cp-faq details:first-child{border-top:0}
.cp-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:16px;align-items:center;padding:22px 0;font-size:18px;font-weight:800;letter-spacing:-.01em}
.cp-faq summary::-webkit-details-marker{display:none}
.cp-faq summary::after{content:'+';flex:none;width:36px;height:36px;border-radius:50%;background:#ECEBF2;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700}
.cp-faq details[open] summary::after{content:'–';background:#001FFF;color:#fff}
.cp-faq p{margin:0 0 22px;font-size:16px;line-height:1.65;color:#4A4658;max-width:820px}
.cp-related{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.cp-related a{background:#fff;border-radius:22px;padding:22px;text-decoration:none;font-weight:800;font-size:17px;line-height:1.25;display:flex;flex-direction:column;justify-content:space-between;gap:18px;min-height:120px;transition:transform .2s}
.cp-related a:hover{transform:translateY(-3px)}
.cp-related a span{color:#001FFF}
.cp-end{margin:clamp(56px,7vw,96px) 0;background:#5331E8;border-radius:32px;padding:clamp(28px,4vw,56px);color:#fff;display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:space-between}
.cp-end h2{margin:0;font-weight:800;font-size:clamp(30px,3.6vw,52px);line-height:.98;letter-spacing:-.045em;max-width:640px}
.cp-end h2 span{color:#00C4BC}
.cp-end p{margin:12px 0 0;color:#E6E3F5;font-size:17px;line-height:1.5;max-width:560px}
.cp-hub{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cp-hub a{background:#fff;border-radius:28px;padding:clamp(22px,3vw,36px);text-decoration:none;display:flex;flex-direction:column;gap:12px;transition:transform .2s}
.cp-hub a:hover{transform:translateY(-3px)}
.cp-hub small{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5331E8}
.cp-hub b{font-size:clamp(24px,2.6vw,34px);line-height:1.05;letter-spacing:-.035em;font-weight:800}
.cp-hub p{margin:0;font-size:16px;line-height:1.55;color:#4A4658}
.cp-hub span{margin-top:auto;display:inline-flex;align-items:center;gap:8px;font-weight:800;color:#001FFF}
@media (max-width:1023px){.cp-cards,.cp-related{grid-template-columns:1fr 1fr}}
@media (max-width:860px){.cp-answer{margin-top:20px}.cp-hero-grid{grid-template-columns:1fr}.cp-phone{margin-top:20px;transform:rotate(1.5deg);width:min(86%,340px)}.cp-split,.cp-hub{grid-template-columns:1fr}}
@media (max-width:560px){.cp-cards,.cp-related{grid-template-columns:1fr}.cp-answer{grid-template-columns:1fr}.cp-paid{left:-12px}.cp-sticker{right:-10px;width:64px}}
</style>`;

/* ---------------- pieces ---------------- */
function phone() {
  const item = (img, name, earn) => `<div class="cp-item"><img src="/assets/${img}.svg" alt=""><b>${name}</b><span class="cp-earn">You earn ${earn}</span></div>`;
  return `<div class="cp-phone" aria-hidden="true">
<img class="cp-sticker" src="/assets/d-coin.svg" alt="">
<div class="cp-phone-head"><img src="/assets/av-amaka.svg" alt=""><div><b>Amaka’s picks</b><small>shop.useaktivate.com/@amaka</small></div></div>
<div class="cp-shop">${item('p-serum', 'Glow serum', '₦3,200')}${item('p-sneaker', 'Court sneakers', '₦6,800')}${item('p-tote', 'Ankara tote', '₦1,800')}${item('p-earbuds', 'Wireless earbuds', '₦4,500')}</div>
<div class="cp-paid">New sale<b>+₦3,200</b>Paid in 7 days</div>
</div>`;
}
const crumbs = (items) => `<p class="cp-crumbs">${items.map(([t, h]) => (h ? `<a href="${h}">${t}</a>` : esc(t))).join(' &nbsp;/&nbsp; ')}</p>`;
const endCta = (h, p) => `<section class="cp-end"><div><h2>${h}</h2><p>${p}</p></div><a class="cp-btn cp-btn--teal" href="${SHOP}">Open your free store ${ARROW}</a></section>`;

function table(rows, themName) {
  return `<div class="cp-table"><table>
<thead><tr><th scope="col"><span class="cp-eyebrow" style="margin:0">Compare</span></th><th scope="col" class="cp-us">ShopLink</th><th scope="col">${esc(themName)}</th></tr></thead>
<tbody>${Object.keys(SHOPLINK).map(k => `<tr><th scope="row">${k}</th><td class="cp-us">${esc(SHOPLINK[k])}</td><td class="cp-them">${esc(rows[k])}</td></tr>`).join('')}</tbody></table></div>
<p class="cp-note">${esc(themName)} details are from its public help pages and independent reviews, checked ${FACTS_CHECKED}. They can change, so check ${esc(themName)} directly before deciding.</p>`;
}

const MARK = { Y: '<span class="cp-y" aria-label="Yes">' + CHECK + '</span>', N: '<span class="cp-n" aria-label="No"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>' };
const mark = (v) => MARK[v] || `<span class="cp-t">${esc(v)}</span>`;
function featureGrid(rows, short) {
  return `<div class="cp-grid" role="table" aria-label="ShopLink vs ${esc(short)} features">
<div class="cp-grow cp-ghead" role="row"><span role="columnheader">Feature</span><span role="columnheader" class="cp-gus"><img src="/assets/logomark.png" alt="">ShopLink</span><span role="columnheader">${esc(short)}</span></div>
${rows.map(([f, a, b]) => `<div class="cp-grow" role="row"><span role="rowheader">${esc(f)}</span><span role="cell" class="cp-gus">${mark(a)}</span><span role="cell">${mark(b)}</span></div>`).join('\n')}
</div>`;
}

function faqHtml(faq) {
  return `<div class="cp-faq">${faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}</div>`;
}

function pageBody(p, ctx) {
  return `<div class="cp">
<header style="background:#001FFF">${ctx.nav}</header>
<main>
<section class="cp-hero"><div class="cp-wrap cp-hero-grid"><div>
${crumbs([['Home', '/'], ['Alternatives', '/alternatives/'], [p.short]])}
<p class="cp-tag">${esc(p.short)} alternative</p>
<h1>${p.h1[0]} <span>${p.h1[1]}</span></h1>
<p class="cp-lede">${p.lede}</p>
<div class="cp-btns"><a class="cp-btn cp-btn--teal" href="${SHOP}">Open your free store ${ARROW}</a><a class="cp-btn cp-btn--ghost" href="#compare">See the comparison</a></div>
</div>${phone()}</div></section>
<div class="cp-wrap">
<section class="cp-answer"><i aria-hidden="true">?</i><div><h2>Is there an African ${esc(p.short)}?</h2><p>${p.answer}</p></div></section>

<section class="cp-sec" id="compare"><p class="cp-eyebrow">ShopLink vs ${esc(p.short)}</p><h2 class="cp-h">The best ${esc(p.short)} alternative for African creators</h2>${featureGrid(p.features, p.short)}</section>

<section class="cp-sec"><p class="cp-eyebrow">In detail</p><h2 class="cp-h">How ShopLink and ${esc(p.short)} compare</h2>${table(p.them, p.short)}</section>

<section class="cp-sec"><p class="cp-eyebrow">Why creators switch</p><h2 class="cp-h">Why African creators choose ShopLink over ${esc(p.short)}</h2>
<div class="cp-cards">${p.reasons.map(([h, t]) => `<div class="cp-card"><span>${CHECK}</span><h3>${h}</h3><p>${t}</p></div>`).join('')}</div></section>

<section class="cp-sec cp-split">
<div class="cp-steps"><h2>Start earning in three steps</h2><ol>
<li><span><b>Open your store.</b> Sign in at shop.useaktivate.com with your Aktivate account. It’s free.</span></li>
<li><span><b>Add products you love.</b> Pick from African brands and see your commission on each one before you add it.</span></li>
<li><span><b>Share one link.</b> Put shop.useaktivate.com/@yourname in your bio. Commission lands 7 days after each sale.</span></li>
</ol></div>
<div class="cp-fair"><p class="cp-eyebrow">The honest take</p><h2>When ${esc(p.short)} is the better choice</h2><p>${p.fair}</p></div>
</section>

<section class="cp-sec"><p class="cp-eyebrow">FAQ</p><h2 class="cp-h">Questions creators ask</h2>${faqHtml(p.faq)}</section>

<section class="cp-sec"><p class="cp-eyebrow">Keep reading</p><div class="cp-related">${p.related.map(([t, h]) => `<a href="${h}">${esc(t)}<span>${ARROW}</span></a>`).join('')}</div></section>

${endCta(`Your followers already ask where you got it. <span>Get paid for the answer.</span>`, 'Open your ShopLink store for free and earn on the products you already recommend. 51,400+ creators across Nigeria, Kenya, Ghana and South Africa are on Aktivate.')}
</div>
</main>
${ctx.footer}
</div>`;
}

function hubBody(ctx) {
  const all = Object.keys(SHOPLINK);
  const pick = ['Products', 'How you get paid', 'When you get paid', 'Commission', 'Who can join'];
  return `<div class="cp">
<header style="background:#001FFF">${ctx.nav}</header>
<main>
<section class="cp-hero"><div class="cp-wrap cp-hero-grid"><div>
${crumbs([['Home', '/'], ['Alternatives']])}
<p class="cp-tag">ShopMy &amp; LTK alternatives</p>
<h1>The African ShopMy <span>is here.</span></h1>
<p class="cp-lede">ShopMy and LTK made creator storefronts big in the US. ShopLink brings them to Africa: a free store, products from African brands, local checkout, and commission paid 7 days after each sale.</p>
<div class="cp-btns"><a class="cp-btn cp-btn--teal" href="${SHOP}">Open your free store ${ARROW}</a><a class="cp-btn cp-btn--ghost" href="#compare">Compare platforms</a></div>
</div>${phone()}</div></section>
<div class="cp-wrap">
<section class="cp-answer"><i aria-hidden="true">?</i><div><h2>What is the best ShopMy alternative in Africa?</h2><p>${PAGES[0].answer}</p></div></section>

<section class="cp-sec"><p class="cp-eyebrow">Compare</p><h2 class="cp-h">Alternatives to the creator platforms you know</h2>
<div class="cp-hub">${PAGES.map(p => `<a href="/alternatives/${p.slug}/"><small>${esc(p.short)} alternative</small><b>The best ${esc(p.short)} alternative</b><p>${esc(strip(p.lede))}</p><span>See the comparison ${ARROW}</span></a>`).join('')}</div></section>

<section class="cp-sec" id="compare"><p class="cp-eyebrow">At a glance</p><h2 class="cp-h">ShopLink vs ShopMy vs LTK</h2>
<div class="cp-table"><table><thead><tr><th scope="col"></th><th scope="col" class="cp-us">ShopLink</th>${PAGES.map(p => `<th scope="col">${esc(p.short)}</th>`).join('')}</tr></thead>
<tbody>${pick.filter(k => all.includes(k)).map(k => `<tr><th scope="row">${k}</th><td class="cp-us">${esc(SHOPLINK[k])}</td>${PAGES.map(p => `<td class="cp-them">${esc(p.them[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
<p class="cp-note">Competitor details are from their public help pages and independent reviews, checked ${FACTS_CHECKED}. They can change, so check each platform directly.</p></section>

<section class="cp-sec"><p class="cp-eyebrow">For brands</p><div class="cp-fair"><h2>Looking for an influencer marketing platform instead?</h2><p>If you’re a brand comparing tools like Aspire, CreatorIQ or Wowzi, read <a href="/blog/the-best-influencer-marketing-platforms-in-nigeria-and-kenya-2026/" style="color:#5331E8;font-weight:700">the best influencer marketing platforms in Nigeria and Kenya</a>, or see <a href="/brands/" style="color:#5331E8;font-weight:700">Aktivate for brands</a>.</p></div></section>

${endCta(`One link. Real products. <span>Paid in 7 days.</span>`, 'Open your ShopLink store for free and start earning commission from African brands your followers already love.')}
</div>
</main>
${ctx.footer}
</div>`;
}

/* ---------------- build ---------------- */
function build(ctx) {
  const { OUT, SITE_URL, shell, styles, scripts } = ctx;
  const urls = [];
  const crumbLd = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) });
  const ld = (objs) => objs.map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n') + '\n';

  // hub
  const hubUrl = `${SITE_URL}/alternatives/`;
  const hubFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [[`What is the best ShopMy alternative in Africa?`, strip(PAGES[0].answer)], ...PAGES[0].faq.slice(0, 2)].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) };
  const hub = shell({
    title: 'ShopMy &amp; LTK Alternatives for African Creators — Aktivate', url: hubUrl, styles, scripts, body: hubBody(ctx),
    desc: 'The African ShopMy: ShopLink gives creators in Nigeria, Kenya, Ghana and South Africa a free store, African brands, local checkout and commission 7 days after each sale. Compare it with ShopMy and LTK.',
    extraHead: CSS + ld([hubFaq, crumbLd([['Home', SITE_URL + '/'], ['Alternatives', hubUrl]])]),
  });
  fs.mkdirSync(path.join(OUT, 'alternatives'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'alternatives', 'index.html'), hub);
  urls.push(hubUrl);

  for (const p of PAGES) {
    const url = `${SITE_URL}/alternatives/${p.slug}/`;
    const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) };
    const doc = shell({
      title: esc(p.title), desc: esc(p.desc), url, styles, scripts, body: pageBody(p, ctx),
      extraHead: CSS + ld([faqLd, crumbLd([['Home', SITE_URL + '/'], ['Alternatives', hubUrl], [p.short + ' alternative', url]])]),
    });
    fs.mkdirSync(path.join(OUT, 'alternatives', p.slug), { recursive: true });
    fs.writeFileSync(path.join(OUT, 'alternatives', p.slug, 'index.html'), doc);
    urls.push(url);
  }
  console.log(`built /alternatives/ with ${PAGES.length} comparison pages`);
  return urls;
}

module.exports = { build, PAGES };
