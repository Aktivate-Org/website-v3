# Regional blog: Brazil, the Philippines and Indonesia

Every Monday the scheduled task "Regional blog drafts" writes one post per market as a Markdown file in
`content/posts/` and commits it to `main`, dated that Wednesday at 10:15 WAT (`date: <YYYY-MM-DD>T10:15:00+01:00`).
The site leaves a post out until its date, and the Blog schedule workflow publishes it then. To stop a post,
delete its file or add `draft: true` before Wednesday. File format: `content/posts/README.md`.

| Market | Language | Tags (required) | Hub | Country pages |
|---|---|---|---|---|
| Brazil | Brazilian Portuguese | `brasil`, plus `for-brands` or `for-creators` | /blog/brasil/ | /br/ (empresas), /br/criadores/ |
| Philippines | English (Filipino context, peso, local platforms) | `philippines`, plus `for-brands` or `for-creators` | /blog/philippines/ | /ph/, /ph/creators/ |
| Indonesia | Bahasa Indonesia (natural, not formal government style) | `indonesia`, plus `for-brands` or `for-creators` | /blog/indonesia/ | /id/, /id/kreator/ |

## Picking the topic

- Alternate audiences week to week per market: one week businesses (SMEs, small brands), next week creators.
- Target one search people in that country actually make, in their language. If `content/keywords/<market>*.csv`
  exists (Ahrefs exports), pick the highest-volume keyword with low difficulty that hasn't been covered yet.
  Otherwise use the seed list below and real search suggestions.
- Never repeat a topic already published or drafted for that market (check the files in content/posts/
  tagged with the market, and the log at the bottom of this file).

Seed topics (use as starting points, then go longer-tail):
- Brazil: quanto cobra um influenciador / microinfluenciador; como fechar publi; mídia kit para influenciador;
  como ganhar dinheiro no TikTok / Instagram; marketing de influência para pequenas empresas; regras de publi
  (CONAR, #publi); microinfluenciador o que é; UGC creator no Brasil; como achar influenciadores na minha cidade.
- Philippines: how much do influencers charge in the Philippines; how to get brand deals; how to earn on TikTok
  in the Philippines; influencer marketing for small business; micro influencers in Manila / Cebu / Davao;
  media kit; UGC creator Philippines; disclosure rules for sponsored posts.
- Indonesia: rate card influencer; cara dapat endorse; cara jadi content creator / influencer; influencer
  marketing untuk UMKM; cara cari influencer untuk bisnis; nano vs micro influencer; menghasilkan uang dari
  TikTok / Instagram; UGC creator Indonesia; aturan iklan dan endorse.

## Writing rules

- 900–1,500 words, practical, written for that country (local currency, cities, platforms, holidays and
  shopping moments such as Black Friday Brasil, 11.11/12.12 sales, Ramadan/Lebaran, Christmas in the Philippines).
- Title with the keyword near the start; a short subtitle; H2 sections; a FAQ section with 3–4 questions at
  the end. Set `seo_title` (≤60 chars) and `seo_description` (≤155 chars), and name the file with a clean slug in the language.
- Facts, numbers and platform rules must come from sources fetched during the run and be linked in the text.
  No invented statistics, quotes, case studies or customers. If you can't verify it, leave it out.
- Be honest about Aktivate in these markets: it is opening there now. Don't claim local brands, local
  creators, local payouts or local checkout. Don't present Nigerian results as local ones (they can be
  mentioned as Aktivate's track record).
- Link naturally to: the country page for the audience (business or creator page above), the rate calculator
  with the right country (/tools/influencer-rate-calculator/?country=BR|PH|ID, add &mode=brand for businesses),
  and the engagement rate calculator (/tools/engagement-rate-calculator/) when relevant. One closing call to
  action, not a hard sell.
- No cover image needed (the blog draws one); don't use photos of real people.

## Log
(the drafts task appends one line per post: date · market · audience · keyword · title · file; lines before 23 Nov 2026 end with a Hashnode draft id)
- 2026-11-16 · Brazil · creators · regras de publi CONAR · Regras de publi do CONAR em 2026: o guia prático para criadores · 6afacba68adb4f10c80ff861
- 2026-11-16 · Philippines · businesses · influencer marketing for small business philippines · Influencer Marketing for Small Business in the Philippines: A Practical Guide · 6afacbbe952b2ab502a5d188
- 2026-11-16 · Indonesia · creators · cara dapat endorse · Cara Dapat Endorse untuk Kreator Pemula: Panduan Lengkap 2026 · 6afacbde098b82321fd65312
