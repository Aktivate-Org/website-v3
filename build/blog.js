/* Aktivate blog: pulls published posts from Hashnode (headless) at build time and renders
   /blog/, /blog/<slug>/ and /blog/rss.xml in the website's own design.

   Writing still happens in Hashnode. When a post is published or edited there, a Hashnode
   webhook calls the Render deploy hook, which rebuilds the site with the new post.

   Audience/category of a post (shown as a pill and used by the filters on /blog/):
   add one of these tags in Hashnode to set it explicitly, otherwise it is guessed from the title.
     for-brands | for-creators | case-study | news                                              */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const PUBLICATION_ID = '69dcbf84a84fa622cf19f129';
const OLD_HOST = 'blog.useaktivate.com';
const GQL = 'https://gql.hashnode.com';
const SNAPSHOT = path.join(__dirname, 'blog-snapshot.json');

/* ---------------- data ---------------- */
const FIELDS_FULL = `id slug title subtitle brief publishedAt updatedAt readTimeInMinutes canonicalUrl
  coverImage { url } tags { name slug } author { name } content { markdown }
  seo { title description } ogMetaData { image }`;
const FIELDS_SAFE = `id slug title subtitle brief publishedAt readTimeInMinutes tags { name slug } author { name } content { markdown }`;

async function gql(query, variables) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(GQL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/graphql-response+json, application/json',
          'user-agent': 'Mozilla/5.0 (compatible; AktivateSiteBuild/1.0; +https://useaktivate.com)',
        },
        body: JSON.stringify({ query, variables }),
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); }
      catch { throw new Error(`Hashnode API answered HTTP ${res.status} (${res.headers.get('content-type') || 'no content-type'}), not JSON: ${text.replace(/\s+/g, ' ').slice(0, 300)}`); }
      if (json.errors) { const e = new Error(json.errors.map(x => x.message).join('; ')); e.gql = true; throw e; }
      return json.data;
    } catch (e) {
      lastErr = e;
      if (e.gql) throw e;
      console.warn(`blog: Hashnode request failed (attempt ${attempt + 1}/3): ${e.message}`);
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function fetchLive() {
  async function all(fields) {
    const out = []; let after = null;
    do {
      const d = await gql(`query($id: ObjectId, $after: String) { publication(id: $id) { posts(first: 20, after: $after) {
        edges { node { ${fields} } } pageInfo { hasNextPage endCursor } } } }`, { id: PUBLICATION_ID, after });
      if (!d.publication) throw new Error('Hashnode publication not found: ' + PUBLICATION_ID);
      const p = d.publication.posts;
      out.push(...p.edges.map(e => e.node));
      after = p.pageInfo.hasNextPage ? p.pageInfo.endCursor : null;
    } while (after);
    return out;
  }
  try { return await all(FIELDS_FULL); }
  catch (e) {
    if (!e.gql) throw e;
    console.warn('blog: full query rejected (' + e.message + '), retrying with core fields');
    return all(FIELDS_SAFE);
  }
}

/* Live posts from Hashnode when it answers; otherwise the saved copy in build/blog-snapshot.json,
   so a Hashnode outage or block never stops the website from deploying. */
async function fetchPosts() {
  if (process.env.BLOG_FIXTURE) return JSON.parse(fs.readFileSync(process.env.BLOG_FIXTURE, 'utf8'));
  try {
    const posts = await fetchLive();
    if (!posts.length) throw new Error('Hashnode returned no posts');
    console.log(`blog: using ${posts.length} live posts from Hashnode`);
    return posts;
  } catch (e) {
    const snap = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
    console.warn(`blog: WARNING - could not load posts from Hashnode (${e.message}). Using the saved copy from ${snap.savedAt} (${snap.posts.length} posts); new or edited posts will not appear until Hashnode is reachable.`);
    return snap.posts;
  }
}

/* ---------------- helpers ---------------- */
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' });
const slugify = (s) => String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;|&#\d+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CATS = {
  brands: { label: 'For brands', pill: ['#DCE4FF', '#0019C2'], art: ['#001FFF', '#9EB3FF'] },
  creators: { label: 'For creators', pill: ['#E4DEFF', '#3A1FC2'], art: ['#5331E8', '#00C4BC'] },
  case: { label: 'Case study', pill: ['#CDF4F2', '#005B57'], art: ['#080611', '#00C4BC'] },
  news: { label: 'News', pill: ['#FFF3C4', '#6B5200'], art: ['#00C4BC', '#080611'] },
};
function category(p) {
  const tags = (p.tags || []).map(t => t.slug);
  if (tags.includes('for-brands')) return 'brands';
  if (tags.includes('for-creators')) return 'creators';
  if (tags.includes('case-study')) return 'case';
  if (tags.includes('news')) return 'news';
  const t = p.title;
  if (/^how aktivate|what we learned running|^how .+ used an? |^how creator marketing/i.test(t)) return 'case';
  if (/\bpartners? with\b/i.test(t)) return 'news';
  if (tags.some(s => ['make-money-online', 'affiliate-marketing', 'content-creators', 'creator-tips'].includes(s))
    || /make money|get paid|your profile|shoplink|as a creator/i.test(t)) return 'creators';
  return 'brands';
}
const CTA = {
  creators: { eyebrow: 'For creators', title: 'Get paid to create.', body: 'Apply to paid brand campaigns and earn commission with your own ShopLink store. Free to join.', label: 'Join Aktivate free', href: 'https://app.useaktivate.com' },
  brands: { eyebrow: 'For brands', title: 'Make creators your sales team.', body: 'Launch a campaign in minutes and pick from 50,000+ verified creators across Nigeria, Kenya, Ghana and South Africa.', label: 'Launch a campaign', href: 'https://app.useaktivate.com' },
};
const ctaFor = (cat) => (cat === 'creators' ? CTA.creators : CTA.brands);

/* Hashnode markdown → HTML, with Hashnode-specific syntax handled and old blog links moved to /blog/. */
function renderMarkdown(md) {
  md = String(md || '')
    .replace(/(!\[[^\]]*\]\([^)\s]+)\s+align="[^"]*"\)/g, '$1)')
    .replace(/^%\[(https?:\/\/[^\]\s]+)\]\s*$/gm, (m, u) => {
      const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/);
      if (yt) return `<div class="bl-embed"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="YouTube video" loading="lazy" allowfullscreen></iframe></div>`;
      return `[${u}](${u})`;
    });
  let html = marked.parse(md, { gfm: true });
  html = html.replace(new RegExp(`https?://${OLD_HOST.replace(/\./g, '\\.')}/([a-z0-9-]+)/?`, 'g'), '/blog/$1/');
  html = html.replace(/<table>/g, '<div class="bl-table"><table>').replace(/<\/table>/g, '</table></div>');
  html = html.replace(/<img /g, '<img loading="lazy" ');
  html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, (m, u) => (/^https?:\/\/(www\.)?useaktivate\.com/.test(u) ? m : `<a href="${u}" target="_blank" rel="noopener"`));
  const toc = []; const used = {};
  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
    let id = slugify(inner) || 'section'; if (used[id]) id += '-' + (++used[id]); else used[id] = 1;
    if (lvl === '2') toc.push({ id, text: inner.replace(/<[^>]+>/g, '') });
    return `<h${lvl} id="${id}">${inner}</h${lvl}>`;
  });
  return { html, toc };
}

/* ---------------- pieces ---------------- */
const ARROW = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const pill = (cat) => `<span class="bl-pill" style="background:${CATS[cat].pill[0]};color:${CATS[cat].pill[1]}">${CATS[cat].label}</span>`;

/* Posts without a cover image get a collage in the website's illustration style (product tiles,
   a creator avatar and a sticker), picked from the slug so every post looks different but stable. */
const PRODUCTS = ['p-sneaker', 'p-serum', 'p-bag', 'p-bottle', 'p-lipkit', 'p-tote', 'p-earbuds', 'p-brunch', 'p-butter', 'p-pass'];
const AVATARS = ['av-ada', 'av-amaka', 'av-dami', 'av-kemi', 'av-kwame', 'av-thabo', 'av-tolu', 'av-wanjiru', 'av-zaynab'];
const STICKERS = ['d-heart', 'd-coin', 'd-sparkle', 'd-burst', 'd-sparkle-teal'];
const BGS = { brands: ['#001FFF', '#080611', '#9EB3FF'], creators: ['#5331E8', '#00C4BC', '#8F74F7'], case: ['#080611', '#001FFF', '#5331E8'], news: ['#00C4BC', '#9EB3FF', '#080611'] };
function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

function art(p, cls = '') {
  const img = p.coverImage?.url || p.ogMetaData?.image;
  if (img) return `<div class="bl-art ${cls}"><img src="${esc(img)}" alt="" loading="lazy"></div>`;
  const h = hash(p.slug);
  const pick = (arr, shift) => arr[(h >>> shift) % arr.length];
  const bg = pick(BGS[p.cat], 0);
  let a = pick(PRODUCTS, 3), b = pick(PRODUCTS, 9); if (a === b) b = PRODUCTS[(PRODUCTS.indexOf(a) + 3) % PRODUCTS.length];
  const flip = (h >>> 15) & 1;
  const [l1, l2] = flip ? ['54%', '16%'] : ['14%', '52%'];
  return `<div class="bl-art bl-art--gen ${cls}" style="background:${bg}" aria-hidden="true">
${bg === '#080611' || bg === '#001FFF' || bg === '#5331E8' ? '<img class="bl-dots" src="/assets/d-squiggle.svg" alt="">' : ''}
<img class="bl-tile" src="/assets/${a}.svg" alt="" style="left:${l1};top:14%;transform:rotate(${flip ? 6 : -7}deg)">
<img class="bl-tile bl-tile--b" src="/assets/${b}.svg" alt="" style="left:${l2};top:24%;transform:rotate(${flip ? -5 : 6}deg)">
<img class="bl-ava" src="/assets/${pick(AVATARS, 19)}.svg" alt="" style="left:${flip ? '44%' : '40%'}">
<img class="bl-stk" src="/assets/${pick(STICKERS, 24)}.svg" alt="" style="${flip ? 'left:6%' : 'right:6%'}"></div>`;
}

function card(p) {
  return `<a class="bl-card" href="/blog/${p.slug}/" data-cat="${p.cat}">
${art(p)}
<div class="bl-card-body">${pill(p.cat)}
<h3>${esc(p.title)}</h3>
<p>${esc(p.excerpt)}</p>
<span class="bl-meta">${fmtDate(p.publishedAt)} · ${p.readTimeInMinutes || 3} min read</span></div></a>`;
}

function ctaBand() {
  return `<section class="bl-wrap bl-cta-band">
<div class="bl-cta bl-cta--dark"><p class="bl-eyebrow" style="color:#9EB3FF">${CTA.brands.eyebrow}</p><h2>${CTA.brands.title}</h2><p>${CTA.brands.body}</p><a class="bl-btn bl-btn--teal" href="${CTA.brands.href}">${CTA.brands.label} ${ARROW}</a></div>
<div class="bl-cta bl-cta--purple"><p class="bl-eyebrow" style="color:#D9D4FF">${CTA.creators.eyebrow}</p><h2>${CTA.creators.title}</h2><p>${CTA.creators.body}</p><a class="bl-btn bl-btn--white" href="${CTA.creators.href}">${CTA.creators.label} ${ARROW}</a></div>
</section>`;
}

/* ---------------- styles ---------------- */
const CSS = `<style>
body{margin:0;background:#ECEBF2}
.bl{font-family:'Aileron',system-ui,sans-serif;color:#080611;background:#ECEBF2;overflow:hidden}
.bl a{color:inherit}
.bl-wrap{max-width:1280px;margin:0 auto;padding:0 clamp(16px,1.7vw,24px)}
.bl-hero{background:#001FFF;color:#fff;padding:clamp(24px,3.3vw,48px) 0 clamp(120px,12vw,170px)}
.bl-tag{display:inline-flex;align-items:center;gap:10px;margin:0 0 24px;padding:8px 16px 8px 8px;border-radius:999px;background:#fff;color:#001FFF;font-weight:700;font-size:14px}
.bl-tag i{width:28px;height:28px;border-radius:9px;background:#001FFF;display:flex;align-items:center;justify-content:center}
.bl-hero h1{margin:0;font-weight:800;font-size:clamp(46px,7vw,100px);line-height:.92;letter-spacing:-.045em;max-width:980px}
.bl-hero h1 span{color:#00C4BC}
.bl-hero .bl-sub{margin:26px 0 0;max-width:600px;font-size:clamp(17px,1.6vw,21px);line-height:1.5;color:#E6E9FF}
.bl-feat{margin-top:clamp(-130px,-10vw,-90px);display:grid;grid-template-columns:1.25fr 1fr;gap:0;background:#fff;border-radius:32px;padding:12px;text-decoration:none;box-shadow:0 30px 60px rgba(8,6,17,.18);transition:transform .2s}
.bl-feat:hover{transform:translateY(-3px)}
.bl-feat .bl-art{aspect-ratio:auto;min-height:340px;border-radius:24px}
.bl-feat-body{padding:clamp(20px,3vw,44px);display:flex;flex-direction:column;justify-content:center}
.bl-feat-body .bl-kicker{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5A566A;margin:0 0 14px}
.bl-feat-body h2{margin:14px 0 0;font-weight:800;font-size:clamp(28px,3vw,42px);line-height:1.02;letter-spacing:-.035em}
.bl-feat-body p{margin:16px 0 0;font-size:17px;line-height:1.55;color:#4A4658}
.bl-read{margin-top:26px;display:inline-flex;align-items:center;gap:8px;font-weight:800;color:#001FFF}
.bl-filters{display:flex;flex-wrap:wrap;gap:8px;margin:clamp(40px,5vw,64px) 0 22px}
.bl-filters button{min-height:44px;padding:0 18px;border:0;border-radius:999px;background:#fff;color:#080611;font:700 15px 'Aileron',sans-serif;cursor:pointer}
.bl-filters button[aria-pressed="true"]{background:#080611;color:#fff}
.bl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.bl-card{display:flex;flex-direction:column;background:#fff;border-radius:28px;padding:10px;text-decoration:none;transition:transform .2s,box-shadow .2s}
.bl-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(8,6,17,.10)}
.bl-card[hidden]{display:none}
.bl-card-body{padding:18px 14px 14px;display:flex;flex-direction:column;flex:1}
.bl-card h3{margin:14px 0 0;font-weight:800;font-size:22px;line-height:1.15;letter-spacing:-.02em}
.bl-card p{margin:10px 0 0;font-size:15px;line-height:1.5;color:#4A4658;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.bl-meta{margin-top:auto;padding-top:16px;font-size:13px;font-weight:600;color:#5A566A}
.bl-pill{align-self:flex-start;display:inline-block;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700}
.bl-art{position:relative;aspect-ratio:16/9;border-radius:20px;overflow:hidden;background:#ECEBF2}
.bl-art:not(.bl-art--gen)>img{width:100%;height:100%;object-fit:cover;display:block}
.bl-art--gen{container-type:inline-size}
.bl-art--gen img{position:absolute;display:block;pointer-events:none}
.bl-tile{width:34%;aspect-ratio:1;border-radius:9cqw;border:max(3px,1.1cqw) solid #fff;box-shadow:0 14px 30px rgba(8,6,17,.28);box-sizing:border-box}
.bl-tile--b{width:30%}
.bl-ava{width:17%;bottom:9%;border-radius:50%;border:max(3px,1cqw) solid #fff;box-shadow:0 10px 20px rgba(8,6,17,.25)}
.bl-stk{width:15%;top:8%;transform:rotate(-10deg)}
.bl-dots{width:46%;left:-6%;bottom:8%;opacity:.55;transform:rotate(-6deg)}
.bl-empty{padding:40px;text-align:center;background:#fff;border-radius:28px;color:#4A4658}
.bl-cta-band{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:clamp(56px,7vw,96px);margin-bottom:clamp(56px,7vw,96px)}
.bl-cta{border-radius:32px;padding:clamp(28px,3.5vw,48px);color:#fff}
.bl-cta--dark{background:#080611}.bl-cta--purple{background:#5331E8}
.bl-cta h2{margin:0;font-weight:800;font-size:clamp(30px,3.4vw,46px);line-height:1;letter-spacing:-.04em}
.bl-cta p{margin:14px 0 0;font-size:16px;line-height:1.55;color:#E6E3F5;max-width:440px}
.bl-eyebrow{margin:0 0 12px!important;font-size:12px!important;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.bl-btn{margin-top:26px;display:inline-flex;align-items:center;gap:10px;min-height:56px;padding:0 26px;border-radius:16px;text-decoration:none;font-weight:800;font-size:16px}
.bl-btn--teal{background:#00C4BC;color:#080611!important}.bl-btn--white{background:#fff;color:#080611!important}.bl-btn--blue{background:#001FFF;color:#fff!important}
/* article */
.bl-post-hero{background:#001FFF;color:#fff;padding:clamp(20px,3vw,40px) 0 clamp(110px,11vw,150px)}
.bl-back{display:inline-flex;align-items:center;gap:8px;color:#fff!important;text-decoration:none;font-weight:700;font-size:15px;opacity:.85}
.bl-back svg{transform:rotate(180deg)}
.bl-post-hero .bl-pill{margin-top:28px}
.bl-post-hero h1{margin:18px 0 0;font-weight:800;font-size:clamp(38px,5.6vw,76px);line-height:.98;letter-spacing:-.045em;max-width:1000px}
.bl-post-hero .bl-sub{margin:22px 0 0;max-width:720px;font-size:clamp(17px,1.6vw,21px);line-height:1.5;color:#E6E9FF}
.bl-byline{margin-top:30px;display:flex;align-items:center;gap:12px;font-size:15px;color:#E6E9FF}
.bl-byline img{width:44px;height:44px;border-radius:50%;background:#fff;padding:9px;box-sizing:border-box}
.bl-byline b{color:#fff;font-weight:800;display:block}
.bl-cover{margin-top:clamp(-120px,-9.5vw,-90px);background:#fff;border-radius:32px;padding:10px;box-shadow:0 30px 60px rgba(8,6,17,.18)}
.bl-cover .bl-art{aspect-ratio:21/9;border-radius:24px}
.bl-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:20px;align-items:start;margin-top:20px}
.bl-layout.bl-no-cover{margin-top:clamp(-120px,-9.5vw,-90px)}
.bl-article{background:#fff;border-radius:32px;padding:clamp(24px,4.5vw,64px);min-width:0}
.bl-aside{position:sticky;top:20px;display:flex;flex-direction:column;gap:16px}
.bl-toc{background:#fff;border-radius:28px;padding:22px}
.bl-toc p{margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#5A566A}
.bl-toc a{display:block;padding:9px 12px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:600;line-height:1.35;color:#2A2638}
.bl-toc a:hover{background:#ECEBF2}
.bl-side-cta{border-radius:28px;padding:26px;color:#fff;background:#080611}
.bl-side-cta h3{margin:0;font-weight:800;font-size:26px;line-height:1.05;letter-spacing:-.03em}
.bl-side-cta p{margin:10px 0 0;font-size:14px;line-height:1.5;color:#C9C6D6}
.bl-side-cta .bl-btn{min-height:50px;font-size:15px;margin-top:20px}
.bl-prose{font-size:18px;line-height:1.72;color:#2A2638;max-width:720px;margin:0 auto}
.bl-prose>*:first-child{margin-top:0}
.bl-prose p{margin:0 0 1.15em}
.bl-prose h2{margin:1.9em 0 .55em;font-size:clamp(26px,2.6vw,34px);line-height:1.08;letter-spacing:-.03em;font-weight:800;color:#080611;scroll-margin-top:24px}
.bl-prose h3{margin:1.6em 0 .45em;font-size:22px;line-height:1.2;letter-spacing:-.015em;font-weight:800;color:#080611;scroll-margin-top:24px}
.bl-prose a{color:#5331E8;text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px;text-decoration-color:#C8BEFA}
.bl-prose a:hover{color:#001FFF;text-decoration-color:#001FFF}
.bl-prose strong{color:#080611;font-weight:800}
.bl-prose ul,.bl-prose ol{margin:0 0 1.2em;padding-left:1.3em}
.bl-prose li{margin:.35em 0;padding-left:.3em}
.bl-prose li p{margin:0}
.bl-prose ul li::marker{color:#00C4BC;font-size:1.1em}
.bl-prose ol li::marker{color:#001FFF;font-weight:800}
.bl-prose blockquote{margin:1.6em 0;padding:20px 24px;border-left:4px solid #00C4BC;background:#F5F4FA;border-radius:0 20px 20px 0;color:#080611}
.bl-prose blockquote p:last-child{margin:0}
.bl-prose hr{border:0;height:1px;background:#ECEBF2;margin:2.4em 0}
.bl-prose img{max-width:100%;height:auto;border-radius:20px;display:block;margin:1.6em auto}
.bl-prose code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.86em;background:#ECEBF2;color:#3A1FC2;padding:2px 7px;border-radius:7px}
.bl-prose pre{background:#080611;color:#ECEBF2;padding:20px;border-radius:20px;overflow-x:auto}
.bl-prose pre code{background:none;color:inherit;padding:0}
.bl-table{margin:1.6em 0;overflow-x:auto;border-radius:20px;border:1px solid #ECEBF2}
.bl-prose table{border-collapse:collapse;width:100%;font-size:15px;line-height:1.45}
.bl-prose th{background:#F5F4FA;text-align:left;font-weight:800;color:#080611;padding:14px 16px;white-space:nowrap}
.bl-prose td{padding:13px 16px;border-top:1px solid #ECEBF2;vertical-align:top}
.bl-embed{position:relative;aspect-ratio:16/9;margin:1.6em 0;border-radius:20px;overflow:hidden}
.bl-embed iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.bl-foot{max-width:720px;margin:48px auto 0;padding-top:28px;border-top:1px solid #ECEBF2;display:flex;flex-wrap:wrap;justify-content:space-between;gap:18px;align-items:center}
.bl-tags{display:flex;flex-wrap:wrap;gap:6px}
.bl-tags span{padding:6px 12px;border-radius:999px;background:#ECEBF2;font-size:13px;font-weight:700;color:#4A4658}
.bl-share{display:flex;gap:8px;align-items:center}
.bl-share span{font-size:13px;font-weight:700;color:#5A566A;margin-right:4px}
.bl-share a,.bl-share button{width:44px;height:44px;border-radius:50%;background:#ECEBF2;border:0;display:flex;align-items:center;justify-content:center;color:#080611;cursor:pointer;text-decoration:none}
.bl-share a:hover,.bl-share button:hover{background:#001FFF;color:#fff}
.bl-end-cta{margin:20px 0 0;background:#001FFF;border-radius:32px;padding:clamp(28px,4vw,56px);color:#fff;display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:space-between}
.bl-end-cta h2{margin:0;font-weight:800;font-size:clamp(30px,3.6vw,52px);line-height:.98;letter-spacing:-.045em;max-width:620px}
.bl-end-cta h2 span{color:#00C4BC}
.bl-end-cta p{margin:12px 0 0;color:#E6E9FF;font-size:17px;line-height:1.5;max-width:560px}
.bl-end-cta .bl-btn{margin-top:0}
.bl-more{margin:clamp(56px,7vw,96px) auto}
.bl-more h2{margin:0 0 22px;font-weight:800;font-size:clamp(30px,3.4vw,46px);letter-spacing:-.04em}
@media (max-width:1023px){.bl-layout{grid-template-columns:1fr}.bl-aside{display:none}}
@media (max-width:820px){.bl-feat{grid-template-columns:1fr}.bl-feat .bl-art{min-height:0;aspect-ratio:16/9}.bl-cta-band{grid-template-columns:1fr}.bl-cover .bl-art{aspect-ratio:16/9}}
@media (max-width:640px){.bl-prose{font-size:17px}.bl-article{border-radius:28px}.bl-grid{grid-template-columns:1fr}}
</style>`;

/* ---------------- pages ---------------- */
const FILTER_JS = `<script>(function(){var bs=document.querySelectorAll('.bl-filters button'),cs=document.querySelectorAll('.bl-grid .bl-card'),em=document.querySelector('.bl-empty');
function go(c){var n=0;bs.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.f===c?'true':'false')});cs.forEach(function(x){var on=c==='all'||x.dataset.cat===c;x.hidden=!on;if(on)n++});if(em)em.hidden=n>0;}
bs.forEach(function(b){b.addEventListener('click',function(){go(b.dataset.f);try{history.replaceState(null,'',b.dataset.f==='all'?location.pathname:'#'+b.dataset.f)}catch(e){}})});
var h=location.hash.slice(1);if(h&&document.querySelector('.bl-filters [data-f="'+h+'"]'))go(h);})();</script>`;
const SHARE_JS = `<script>(function(){var b=document.querySelector('[data-copy]');if(!b)return;b.addEventListener('click',function(){try{navigator.clipboard.writeText(location.href);b.setAttribute('aria-label','Link copied');b.innerHTML='<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>'}catch(e){}})})();</script>`;

function indexPage(posts, ctx) {
  const [feat, ...rest] = posts;
  const counts = posts.reduce((m, p) => ((m[p.cat] = (m[p.cat] || 0) + 1), m), {});
  const filters = [['all', 'All articles'], ['brands', 'For brands'], ['creators', 'For creators'], ['case', 'Case studies'], ['news', 'News']]
    .filter(([k]) => k === 'all' || counts[k])
    .map(([k, l]) => `<button type="button" data-f="${k}" aria-pressed="${k === 'all'}">${l}</button>`).join('');
  return `<div class="bl">
<header style="background:#001FFF">${ctx.nav}</header>
<main>
<section class="bl-hero"><div class="bl-wrap">
<p class="bl-tag"><i aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2.5zM8 7h6"/></svg></i>Aktivate Blog</p>
<h1>Get smarter about <span>creator marketing.</span></h1>
<p class="bl-sub">Guides, campaign playbooks and real results for brands and creators across Nigeria, Kenya, Ghana and South Africa.</p>
</div></section>
<div class="bl-wrap">
${feat ? `<a class="bl-feat" href="/blog/${feat.slug}/">${art(feat)}<div class="bl-feat-body"><p class="bl-kicker">Latest</p>${pill(feat.cat)}<h2>${esc(feat.title)}</h2><p>${esc(feat.excerpt)}</p>
<span class="bl-meta" style="padding-top:18px">${fmtDate(feat.publishedAt)} · ${feat.readTimeInMinutes || 3} min read</span><span class="bl-read">Read article ${ARROW}</span></div></a>` : ''}
<div class="bl-filters" role="group" aria-label="Filter articles">${filters}</div>
<div class="bl-grid">${rest.map(card).join('\n')}</div>
<p class="bl-empty" hidden>No more articles in this category yet. The latest one is above.</p>
</div>
${ctaBand()}
</main>
${ctx.footer}
</div>${FILTER_JS}`;
}

function postPage(p, related, ctx) {
  const url = `${ctx.SITE_URL}/blog/${p.slug}/`;
  const { html, toc } = renderMarkdown(p.content?.markdown || p.brief);
  const cta = ctaFor(p.cat);
  const hasCover = !!(p.coverImage?.url || p.ogMetaData?.image);
  const enc = encodeURIComponent;
  const shareText = enc(p.title);
  const ICON = {
    x: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>',
    in: '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3V9.75zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.9c0-1.17-.02-2.68-1.63-2.68-1.64 0-1.89 1.28-1.89 2.6V21h-4V9.75z"/></svg>',
    wa: '<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3z"/></svg>',
    link: '<svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  };
  return `<div class="bl">
<header style="background:#001FFF">${ctx.nav}</header>
<main>
<section class="bl-post-hero"><div class="bl-wrap">
<a class="bl-back" href="/blog/">${ARROW} All articles</a><br>
${pill(p.cat)}
<h1>${esc(p.title)}</h1>
${p.subtitle ? `<p class="bl-sub">${esc(p.subtitle)}</p>` : ''}
<div class="bl-byline"><img src="/assets/logomark.png" alt=""><span><b>${esc(p.author?.name || 'Aktivate')}</b>${fmtDate(p.publishedAt)} · ${p.readTimeInMinutes || 3} min read</span></div>
</div></section>
<div class="bl-wrap">
${hasCover ? `<div class="bl-cover">${art(p)}</div>` : ''}
<div class="bl-layout${hasCover ? '' : ' bl-no-cover'}">
<article class="bl-article"><div class="bl-prose">${html}</div>
<div class="bl-foot">
<div class="bl-tags">${(p.tags || []).filter(t => !['for-brands', 'for-creators', 'case-study', 'news'].includes(t.slug)).slice(0, 5).map(t => `<span>${esc(t.name)}</span>`).join('')}</div>
<div class="bl-share"><span>Share</span>
<a href="https://x.com/intent/post?text=${shareText}&url=${enc(url)}" target="_blank" rel="noopener" aria-label="Share on X">${ICON.x}</a>
<a href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">${ICON.in}</a>
<a href="https://wa.me/?text=${enc(p.title + ' ' + url)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">${ICON.wa}</a>
<button type="button" data-copy aria-label="Copy link">${ICON.link}</button></div>
</div></article>
<aside class="bl-aside">
${toc.length >= 3 ? `<nav class="bl-toc" aria-label="On this page"><p>On this page</p>${toc.map(t => `<a href="#${t.id}">${t.text}</a>`).join('')}</nav>` : ''}
<div class="bl-side-cta" style="background:${p.cat === 'creators' ? '#5331E8' : '#080611'}"><p class="bl-eyebrow" style="color:${p.cat === 'creators' ? '#D9D4FF' : '#9EB3FF'}">${cta.eyebrow}</p><h3>${cta.title}</h3><p>${cta.body}</p>
<a class="bl-btn ${p.cat === 'creators' ? 'bl-btn--white' : 'bl-btn--teal'}" href="${cta.href}">${cta.label} ${ARROW}</a></div>
</aside>
</div>
<section class="bl-end-cta"><div><h2>${p.cat === 'creators' ? 'Ready to start <span>earning?</span>' : 'Ready to run your <span>next campaign?</span>'}</h2><p>${cta.body}</p></div>
<a class="bl-btn bl-btn--teal" href="${cta.href}">${cta.label} ${ARROW}</a></section>
${related.length ? `<section class="bl-more"><h2>Keep reading</h2><div class="bl-grid">${related.map(card).join('\n')}</div></section>` : ''}
</div>
</main>
${ctx.footer}
</div>${SHARE_JS}`;
}

function rss(posts, SITE_URL) {
  const items = posts.slice(0, 30).map(p => `<item><title>${esc(p.title)}</title><link>${SITE_URL}/blog/${p.slug}/</link><guid isPermaLink="true">${SITE_URL}/blog/${p.slug}/</guid><pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate><description>${esc(p.excerpt)}</description></item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Aktivate Blog</title><link>${SITE_URL}/blog/</link><description>Creator marketing guides, playbooks and results for African brands and creators.</description><language>en</language>\n${items}\n</channel></rss>\n`;
}

/* ---------------- build ---------------- */
async function build(ctx) {
  const { OUT, SITE_URL, shell, styles, scripts } = ctx;
  const raw = await fetchPosts();
  const posts = raw
    .filter(p => p && p.slug && p.title && p.publishedAt)
    .map(p => ({ ...p, cat: category(p), excerpt: String(p.subtitle || p.seo?.description || p.brief || '').replace(/\s+/g, ' ').trim().slice(0, 220) }))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  if (!posts.length) throw new Error('Hashnode returned no posts; refusing to publish an empty blog');
  const listed = posts;
  const urls = [];
  const head = (extra) => CSS + extra;

  // /blog/
  const blogUrl = SITE_URL + '/blog/';
  const idx = shell({
    title: 'Aktivate Blog — Creator marketing guides for African brands and creators',
    desc: 'Guides, campaign playbooks and real results for brands and creators across Nigeria, Kenya, Ghana and South Africa.',
    url: blogUrl, styles, scripts, body: indexPage(listed, ctx),
    extraHead: head(`<link rel="alternate" type="application/rss+xml" title="Aktivate Blog" href="${SITE_URL}/blog/rss.xml">\n`),
  });
  fs.mkdirSync(path.join(OUT, 'blog'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'blog', 'index.html'), idx);
  fs.writeFileSync(path.join(OUT, 'blog', 'rss.xml'), rss(listed, SITE_URL));
  urls.push(blogUrl);

  // /blog/<slug>/
  for (const p of posts) {
    const url = `${SITE_URL}/blog/${p.slug}/`;
    const canonical = p.canonicalUrl && !p.canonicalUrl.includes(OLD_HOST) ? p.canonicalUrl : url;
    const pool = listed.filter(x => x.slug !== p.slug);
    const related = [...pool.filter(x => x.cat === p.cat), ...pool.filter(x => x.cat !== p.cat)].slice(0, 3);
    const title = p.seo?.title || p.title;
    const desc = (p.seo?.description || p.excerpt).replace(/"/g, '&quot;');
    const image = p.ogMetaData?.image || p.coverImage?.url || SITE_URL + '/assets/og.png';
    const ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.seo?.description || p.excerpt, image, datePublished: p.publishedAt, dateModified: p.updatedAt || p.publishedAt, author: { '@type': 'Organization', name: 'Aktivate', url: SITE_URL }, publisher: { '@type': 'Organization', name: 'Aktivate', logo: { '@type': 'ImageObject', url: SITE_URL + '/assets/logo.png' } }, mainEntityOfPage: url };
    let doc = shell({
      title: esc(title) + (title.length < 50 ? ' — Aktivate Blog' : ''), desc, url: canonical, styles, scripts, ogType: 'article', ogImage: esc(image),
      body: postPage(p, related, ctx),
      extraHead: head(`<meta property="article:published_time" content="${p.publishedAt}">\n<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n`),
    });
    if (canonical !== url) doc = doc.replace(`<meta property="og:url" content="${canonical}">`, `<meta property="og:url" content="${url}">`);
    const dir = path.join(OUT, 'blog', p.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), doc);
    if (canonical === url) urls.push(url);
  }
  console.log(`built /blog/ with ${posts.length} posts (${listed.length} listed)`);
  return urls;
}

module.exports = { build, category, renderMarkdown };
