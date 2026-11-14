/* Country pages for the markets Aktivate is opening: Brazil, the Philippines and Indonesia.
   Each market gets a business page and a creator page in the local language:
     /br/  /br/criadores/   (Portuguese)      /ph/  /ph/creators/   (English)      /id/  /id/kreator/   (Indonesian)
   The pages are linked to each other and to their English equivalents (/brands/, /creators/collaboration-hub/)
   with hreflang, so Google shows the right one in each country.

   Keep claims honest: these markets are new. Don't promise local creators, local brands, local checkout or a
   payout method we don't have yet. Prices are in US dollars because campaigns there are charged in USD
   (card, or an invoice the team marks as paid). Rates in the examples come from the rate calculator. */
const fs = require('fs');
const path = require('path');
const { CSS, ARROW, CHECK } = require('./compare.js');

const APP = 'https://app.useaktivate.com';
const SALES = 'mailto:sales@useaktivate.com';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '');

/* Paths of each page group in every language. hreflang values follow Google's format. */
const GROUPS = {
  biz: { en: '/brands/', 'pt-BR': '/br/', 'en-PH': '/ph/', id: '/id/' },
  creators: { en: '/creators/collaboration-hub/', 'pt-BR': '/br/criadores/', 'en-PH': '/ph/creators/', id: '/id/kreator/' },
};
function hreflang(SITE_URL, group) {
  const g = GROUPS[group];
  return Object.keys(g).map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE_URL}${g[l]}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${SITE_URL}${g.en}">\n`;
}

const MARKETS = {
  br: {
    lang: 'pt-BR', locale: 'pt_BR', name: 'Brasil', flag: '🇧🇷', rate: 'BR', creatorsPath: 'criadores',
    ui: { home: 'Início', faq: 'Perguntas frequentes', how: 'Como funciona', price: 'Preço', creatorsLink: 'Você é criador? Veja a página para criadores', bizLink: 'Você tem uma empresa? Veja a página para empresas', calc: 'Calcular o orçamento', calcC: 'Quanto devo cobrar?' },
    biz: {
      title: 'Marketing de influência com nano e microinfluenciadores no Brasil — Aktivate',
      desc: 'Publique uma campanha, receba candidaturas de criadores verificados e pague só pelo conteúdo publicado. US$ 15 por campanha + 10% do orçamento. Sem assinatura.',
      tag: 'Para empresas no Brasil',
      h1: ['Criadores que vendem', 'pela sua marca.'],
      lede: 'Publique uma campanha, escolha entre os criadores que se candidatarem e pague só pelo conteúdo que for ao ar. Sem assinatura, sem contrato anual.',
      cta: 'Criar minha campanha', ctaGhost: 'Ver o preço',
      answerQ: 'O que é a Aktivate?',
      answer: 'A <b>Aktivate</b> é uma plataforma de marketing de influência para pequenas e médias empresas. Você publica uma campanha com o briefing e o orçamento, nano e microinfluenciadores verificados se candidatam, você escolhe quem combina com a sua marca e aprova o conteúdo antes de pagar. Já conectamos mais de 51.400 criadores a marcas como Adidas e Burger King, e estamos chegando ao Brasil agora.',
      stepsH: 'Sua primeira campanha em quatro passos',
      steps: [['Crie a campanha', 'Diga o que precisa: produto, formato (Reels, TikTok, Stories), prazo e orçamento.'], ['Receba candidaturas', 'Criadores verificados se candidatam. Você vê seguidores, engajamento e trabalhos anteriores.'], ['Escolha e converse', 'Selecione quem combina com a sua marca e combine os detalhes no chat da campanha.'], ['Aprove e pague', 'Você aprova o conteúdo, ele vai ao ar e só então o pagamento é liberado ao criador.']],
      whyH: 'Por que nano e microinfluenciadores?',
      why: [['Mais confiança', 'Uma recomendação de quem tem 5 mil seguidores soa como a dica de um amigo, não como um anúncio.'], ['Mais engajamento', 'Contas menores costumam ter taxas de engajamento bem maiores que as de celebridades.'], ['Cabe no orçamento', 'Com o valor de um post de celebridade, você ativa dez ou vinte criadores locais.'], ['Conteúdo para anúncios', 'Peça direitos de uso e reaproveite os vídeos nos seus anúncios pagos.']],
      priceH: 'Preço simples, em dólar',
      price: ['<b>US$ 15</b> por campanha publicada', '<b>10%</b> do orçamento dos criadores', 'Sem assinatura e sem mensalidade'],
      priceNote: 'A cobrança é em dólares americanos, no cartão ou por fatura. O orçamento dos criadores é você quem define.',
      example: 'Exemplo: 10 microinfluenciadores com 1 Reels cada custam em média {range} no Brasil.',
      faq: [
        ['Já existem criadores brasileiros na Aktivate?', 'Estamos montando a rede de criadores no Brasil agora. Ao publicar uma campanha, você pode pedir criadores de uma cidade ou nicho, e nós convidamos perfis que combinem com você.'],
        ['Quanto custa uma campanha?', 'US$ 15 para publicar a campanha mais 10% do orçamento que você reservar para os criadores. Você define o orçamento; use a nossa <a href="/tools/influencer-rate-calculator/?country=BR&mode=brand">calculadora</a> para ter uma referência.'],
        ['Como eu pago?', 'Em dólares americanos, no cartão de crédito ou por fatura com transferência. Fale com a equipe em sales@useaktivate.com se preferir fatura.'],
        ['Preciso de contrato ou assinatura?', 'Não. Você paga por campanha, quando quiser rodar uma.'],
        ['E se o conteúdo não ficar bom?', 'Você aprova o conteúdo antes de ele ir ao ar. O pagamento só é liberado ao criador depois que o conteúdo é publicado.'],
      ],
      endH: 'Sua marca na voz de quem o Brasil segue.', endP: 'Crie a sua conta grátis e publique a primeira campanha hoje.',
    },
    creators: {
      title: 'Ganhe dinheiro com publis: campanhas pagas para criadores no Brasil — Aktivate',
      desc: 'Cadastre-se grátis na Aktivate, verifique o seu perfil e candidate-se a campanhas pagas de marcas. Feito para nano e microinfluenciadores.',
      tag: 'Para criadores no Brasil',
      h1: ['Receba de marcas', 'pelo seu conteúdo.'],
      lede: 'A Aktivate conecta nano e microinfluenciadores a marcas que pagam por publis. Cadastre-se grátis agora e seja dos primeiros quando as campanhas no Brasil abrirem.',
      cta: 'Criar minha conta grátis', ctaGhost: 'Quanto devo cobrar?',
      answerQ: 'Como funciona a Aktivate para criadores?',
      answer: 'Você cria a sua conta, verifica o seu Instagram ou TikTok e se candidata às campanhas que combinam com você. A marca escolhe, você publica o conteúdo combinado e recebe depois que ele vai ao ar. Mais de 51.400 criadores já usam a Aktivate, e a rede está chegando ao Brasil agora.',
      stepsH: 'Comece em quatro passos',
      steps: [['Cadastre-se grátis', 'Leva dois minutos. Não cobramos nada para entrar.'], ['Verifique o seu perfil', 'Conecte o Instagram ou o TikTok para mostrar às marcas os seus números reais.'], ['Candidate-se', 'Veja o briefing, o formato e o pagamento antes de se candidatar.'], ['Publique e receba', 'Depois que o conteúdo vai ao ar, o pagamento é liberado para você.']],
      whyH: 'Feito para quem está crescendo',
      why: [['A partir de 1.000 seguidores', 'Você não precisa ser famoso. Marcas buscam nano e microinfluenciadores.'], ['Você escolhe', 'Só se candidata às campanhas que combinam com o seu conteúdo e o seu preço.'], ['Pagamento combinado antes', 'O valor de cada campanha aparece antes de você se candidatar.'], ['Ferramentas grátis', 'Calcule o seu engajamento e quanto cobrar por publi.']],
      faq: [
        ['É grátis?', 'Sim. Criar a conta e se candidatar a campanhas não custa nada.'],
        ['Preciso de quantos seguidores?', 'Recomendamos a partir de 1.000 seguidores reais. Cada marca define o perfil que procura em cada campanha.'],
        ['Já tem campanhas no Brasil?', 'Estamos começando no Brasil agora. Quem se cadastra antes recebe os convites das primeiras campanhas de marcas brasileiras.'],
        ['Como eu recebo?', 'A marca paga a Aktivate antes da campanha começar, e o valor é liberado para você depois que o conteúdo vai ao ar. Vamos confirmar as opções de pagamento no Brasil quando as campanhas abrirem.'],
        ['Quanto devo cobrar por uma publi?', 'Depende dos seus seguidores, do formato e do engajamento. Use a nossa <a href="/tools/influencer-rate-calculator/?country=BR">calculadora de preço</a> grátis, em reais.'],
      ],
      endH: 'O seu conteúdo vale dinheiro.', endP: 'Cadastre-se grátis e entre na fila das primeiras campanhas no Brasil.',
    },
    banner: ['Você está no Brasil?', 'Veja a Aktivate em português'],
  },

  ph: {
    lang: 'en-PH', locale: 'en_PH', name: 'Philippines', flag: '🇵🇭', rate: 'PH', creatorsPath: 'creators',
    ui: { home: 'Home', faq: 'Questions', how: 'How it works', price: 'Pricing', creatorsLink: 'Are you a creator? See the creator page', bizLink: 'Run a business? See the business page', calc: 'Work out a budget', calcC: 'What should I charge?' },
    biz: {
      title: 'Influencer marketing for small businesses in the Philippines — Aktivate',
      desc: 'Post a campaign, get applications from verified nano and micro creators, and pay only for content that goes live. $15 per campaign + 10% of budget. No subscription.',
      tag: 'For businesses in the Philippines',
      h1: ['Creators who sell', 'for your brand.'],
      lede: 'Post a campaign, pick from the creators who apply, and pay only for content that goes live. No subscription, no retainer.',
      cta: 'Start my campaign', ctaGhost: 'See pricing',
      answerQ: 'What is Aktivate?',
      answer: '<b>Aktivate</b> is an influencer marketing platform for small and growing businesses. You post a campaign with your brief and budget, verified nano and micro creators apply, you choose who fits your brand, and you approve the content before anyone is paid. We’ve connected 51,400+ creators with brands like Adidas and Burger King, and we’re opening in the Philippines now.',
      stepsH: 'Your first campaign in four steps',
      steps: [['Post the campaign', 'Say what you need: product, format (Reels, TikTok, Stories), timeline and budget.'], ['Get applications', 'Verified creators apply. See their followers, engagement and past work.'], ['Pick and chat', 'Choose who fits your brand and agree the details in the campaign chat.'], ['Approve and pay', 'You approve the content, it goes live, and only then is the creator paid.']],
      whyH: 'Why nano and micro creators?',
      why: [['More trust', 'A recommendation from someone with 5,000 followers feels like a friend’s tip, not an ad.'], ['More engagement', 'Smaller accounts usually get far higher engagement than celebrity pages.'], ['Fits your budget', 'For the price of one celebrity post, you can work with ten or twenty local creators.'], ['Content for your ads', 'Ask for usage rights and reuse the videos in your paid ads.']],
      priceH: 'Simple pricing, in US dollars',
      price: ['<b>$15</b> per campaign you post', '<b>10%</b> of your creator budget', 'No subscription, no monthly fee'],
      priceNote: 'Charged in US dollars by card, or by invoice. You set the creator budget.',
      example: 'Example: 10 micro creators posting 1 Reel each usually cost {range} in the Philippines.',
      faq: [
        ['Are there Filipino creators on Aktivate?', 'We’re building our creator network in the Philippines now. When you post a campaign you can ask for creators in a city or niche, and we invite profiles that fit.'],
        ['How much does a campaign cost?', '$15 to post the campaign plus 10% of the budget you set aside for creators. Use our <a href="/tools/influencer-rate-calculator/?country=PH&mode=brand">rate calculator</a> to set a realistic budget in pesos.'],
        ['How do I pay?', 'In US dollars by card, or by invoice and bank transfer. Email sales@useaktivate.com if you’d like an invoice.'],
        ['Do I need a contract or subscription?', 'No. You pay per campaign, whenever you want to run one.'],
        ['What if I don’t like the content?', 'You approve content before it goes live, and the creator is paid only after it’s posted.'],
      ],
      endH: 'Your brand, in voices Filipinos trust.', endP: 'Create a free account and post your first campaign today.',
    },
    creators: {
      title: 'Get paid for brand deals: paid campaigns for creators in the Philippines — Aktivate',
      desc: 'Join Aktivate free, verify your account and apply to paid brand campaigns. Built for nano and micro creators in the Philippines.',
      tag: 'For creators in the Philippines',
      h1: ['Get paid by brands', 'for your content.'],
      lede: 'Aktivate connects nano and micro creators with brands that pay for content. Join free now and be first in line when campaigns in the Philippines open.',
      cta: 'Join free', ctaGhost: 'What should I charge?',
      answerQ: 'How does Aktivate work for creators?',
      answer: 'Create your account, verify your Instagram or TikTok, and apply to campaigns that fit you. The brand picks, you post the agreed content, and you’re paid after it goes live. 51,400+ creators already use Aktivate, and we’re opening in the Philippines now.',
      stepsH: 'Get started in four steps',
      steps: [['Join free', 'It takes two minutes. Joining costs nothing.'], ['Verify your account', 'Link Instagram or TikTok so brands see your real numbers.'], ['Apply', 'See the brief, format and pay before you apply.'], ['Post and get paid', 'Once your content is live, your payment is released.']],
      whyH: 'Built for growing creators',
      why: [['From 1,000 followers', 'You don’t need to be famous. Brands are looking for nano and micro creators.'], ['You choose', 'Only apply to campaigns that fit your content and your price.'], ['Pay agreed upfront', 'You see what each campaign pays before you apply.'], ['Free tools', 'Check your engagement rate and what to charge per post.']],
      faq: [
        ['Is it free?', 'Yes. Joining and applying to campaigns costs nothing.'],
        ['How many followers do I need?', 'We recommend at least 1,000 real followers. Each brand sets who it’s looking for in each campaign.'],
        ['Are there campaigns in the Philippines yet?', 'We’re opening in the Philippines now. Creators who join early are first to be invited to campaigns from Filipino brands.'],
        ['How do I get paid?', 'The brand pays Aktivate before the campaign starts, and your payment is released after your content goes live. We’ll confirm payout options in the Philippines when campaigns open.'],
        ['What should I charge per post?', 'It depends on your followers, format and engagement. Try our free <a href="/tools/influencer-rate-calculator/?country=PH">rate calculator</a>, in pesos.'],
      ],
      endH: 'Your content is worth paying for.', endP: 'Join free and get in line for the first campaigns in the Philippines.',
    },
    banner: ['In the Philippines?', 'See Aktivate for the Philippines'],
  },

  id: {
    lang: 'id', locale: 'id_ID', name: 'Indonesia', flag: '🇮🇩', rate: 'ID', creatorsPath: 'kreator',
    ui: { home: 'Beranda', faq: 'Pertanyaan', how: 'Cara kerja', price: 'Harga', creatorsLink: 'Kamu kreator? Lihat halaman untuk kreator', bizLink: 'Punya bisnis? Lihat halaman untuk bisnis', calc: 'Hitung anggaran', calcC: 'Berapa rate card saya?' },
    biz: {
      title: 'Influencer marketing untuk UMKM di Indonesia dengan nano & micro influencer — Aktivate',
      desc: 'Pasang kampanye, terima lamaran dari kreator terverifikasi, dan bayar hanya untuk konten yang tayang. US$15 per kampanye + 10% anggaran. Tanpa langganan.',
      tag: 'Untuk bisnis di Indonesia',
      h1: ['Kreator yang jualan', 'untuk brand kamu.'],
      lede: 'Pasang kampanye, pilih kreator yang melamar, dan bayar hanya untuk konten yang benar-benar tayang. Tanpa langganan, tanpa kontrak tahunan.',
      cta: 'Buat kampanye saya', ctaGhost: 'Lihat harga',
      answerQ: 'Apa itu Aktivate?',
      answer: '<b>Aktivate</b> adalah platform influencer marketing untuk UMKM dan brand yang sedang tumbuh. Kamu memasang kampanye dengan brief dan anggaran, nano dan micro influencer terverifikasi melamar, kamu memilih yang cocok dengan brand kamu, lalu menyetujui konten sebelum ada pembayaran. Kami sudah menghubungkan lebih dari 51.400 kreator dengan brand seperti Adidas dan Burger King, dan sekarang mulai hadir di Indonesia.',
      stepsH: 'Kampanye pertamamu dalam empat langkah',
      steps: [['Buat kampanye', 'Tulis kebutuhanmu: produk, format (Reels, TikTok, Story), jadwal, dan anggaran.'], ['Terima lamaran', 'Kreator terverifikasi melamar. Lihat follower, engagement, dan karya mereka.'], ['Pilih dan ngobrol', 'Pilih yang cocok dan sepakati detailnya lewat chat kampanye.'], ['Setujui lalu bayar', 'Kamu menyetujui konten, konten tayang, baru pembayaran dilepas ke kreator.']],
      whyH: 'Kenapa nano dan micro influencer?',
      why: [['Lebih dipercaya', 'Rekomendasi dari akun dengan 5.000 follower terasa seperti saran teman, bukan iklan.'], ['Engagement lebih tinggi', 'Akun kecil biasanya punya engagement jauh di atas akun selebriti.'], ['Pas di kantong', 'Dengan biaya satu post selebriti, kamu bisa bekerja dengan sepuluh sampai dua puluh kreator lokal.'], ['Konten untuk iklan', 'Minta hak pakai dan gunakan videonya untuk iklan berbayar.']],
      priceH: 'Harga sederhana, dalam dolar AS',
      price: ['<b>US$15</b> per kampanye', '<b>10%</b> dari anggaran kreator', 'Tanpa langganan bulanan'],
      priceNote: 'Ditagih dalam dolar AS lewat kartu atau invoice. Anggaran kreator kamu yang tentukan.',
      example: 'Contoh: 10 micro influencer dengan 1 Reels masing-masing biasanya sekitar {range} di Indonesia.',
      faq: [
        ['Apakah sudah ada kreator Indonesia di Aktivate?', 'Kami sedang membangun jaringan kreator di Indonesia sekarang. Saat memasang kampanye, kamu bisa meminta kreator dari kota atau niche tertentu, dan kami mengundang profil yang cocok.'],
        ['Berapa biaya satu kampanye?', 'US$15 untuk memasang kampanye ditambah 10% dari anggaran untuk kreator. Gunakan <a href="/tools/influencer-rate-calculator/?country=ID&mode=brand">kalkulator rate card</a> kami untuk perkiraan dalam rupiah.'],
        ['Bagaimana cara bayarnya?', 'Dalam dolar AS lewat kartu kredit, atau lewat invoice dan transfer bank. Email sales@useaktivate.com kalau ingin invoice.'],
        ['Apakah perlu kontrak atau langganan?', 'Tidak. Kamu bayar per kampanye, kapan pun kamu mau.'],
        ['Bagaimana kalau kontennya kurang cocok?', 'Kamu menyetujui konten sebelum tayang, dan kreator baru dibayar setelah konten diposting.'],
      ],
      endH: 'Brand kamu, lewat suara yang dipercaya orang Indonesia.', endP: 'Buat akun gratis dan pasang kampanye pertamamu hari ini.',
    },
    creators: {
      title: 'Dapat bayaran dari endorse: kampanye berbayar untuk kreator di Indonesia — Aktivate',
      desc: 'Daftar gratis di Aktivate, verifikasi akunmu, dan lamar kampanye berbayar dari brand. Dibuat untuk nano dan micro influencer di Indonesia.',
      tag: 'Untuk kreator di Indonesia',
      h1: ['Dibayar brand', 'untuk kontenmu.'],
      lede: 'Aktivate menghubungkan nano dan micro influencer dengan brand yang membayar untuk konten. Daftar gratis sekarang dan jadi yang pertama saat kampanye di Indonesia dibuka.',
      cta: 'Daftar gratis', ctaGhost: 'Berapa rate card saya?',
      answerQ: 'Bagaimana Aktivate bekerja untuk kreator?',
      answer: 'Buat akun, verifikasi Instagram atau TikTok-mu, lalu lamar kampanye yang cocok. Brand memilih, kamu posting konten yang disepakati, dan kamu dibayar setelah konten tayang. Lebih dari 51.400 kreator sudah memakai Aktivate, dan sekarang kami mulai hadir di Indonesia.',
      stepsH: 'Mulai dalam empat langkah',
      steps: [['Daftar gratis', 'Cuma dua menit. Tidak ada biaya untuk bergabung.'], ['Verifikasi akun', 'Hubungkan Instagram atau TikTok supaya brand melihat angka aslimu.'], ['Lamar kampanye', 'Lihat brief, format, dan bayaran sebelum melamar.'], ['Posting lalu dibayar', 'Setelah kontenmu tayang, pembayaranmu dilepas.']],
      whyH: 'Dibuat untuk kreator yang sedang tumbuh',
      why: [['Mulai 1.000 follower', 'Tidak perlu terkenal. Brand mencari nano dan micro influencer.'], ['Kamu yang pilih', 'Lamar hanya kampanye yang cocok dengan kontenmu dan rate card-mu.'], ['Bayaran jelas di awal', 'Kamu lihat bayaran tiap kampanye sebelum melamar.'], ['Tools gratis', 'Cek engagement rate dan hitung rate card-mu.']],
      faq: [
        ['Apakah gratis?', 'Ya. Daftar dan melamar kampanye tidak dipungut biaya.'],
        ['Butuh berapa follower?', 'Kami sarankan minimal 1.000 follower asli. Setiap brand menentukan kriteria kreator di tiap kampanye.'],
        ['Sudah ada kampanye di Indonesia?', 'Kami baru mulai di Indonesia. Kreator yang daftar lebih awal akan diundang lebih dulu ke kampanye dari brand Indonesia.'],
        ['Bagaimana cara saya dibayar?', 'Brand membayar Aktivate sebelum kampanye dimulai, dan bayaranmu dilepas setelah konten tayang. Kami akan mengonfirmasi metode pembayaran di Indonesia saat kampanye dibuka.'],
        ['Berapa rate card yang pantas?', 'Tergantung follower, format, dan engagement. Coba <a href="/tools/influencer-rate-calculator/?country=ID">kalkulator rate card</a> gratis kami, dalam rupiah.'],
      ],
      endH: 'Kontenmu layak dibayar.', endP: 'Daftar gratis dan antre untuk kampanye pertama di Indonesia.',
    },
    banner: ['Di Indonesia?', 'Lihat Aktivate untuk Indonesia'],
  },
};

/* Same bands as the rate calculator (one Instagram feed post, average engagement), for the budget example. */
const RATES = { BR: { sym: 'R$', b: [300, 600], c: [900, 1800], step: 50 }, PH: { sym: '₱', b: [4000, 8000], c: [15000, 30000], step: 500 }, ID: { sym: 'Rp', b: [1500000, 3000000], c: [5000000, 10000000], step: 100000 } };
function budgetExample(code, locale) {
  // 10 micro creators around 20K followers, 1 Reel each (Reel = 1.45 × feed post)
  const r = RATES[code], f = 20000;
  const t = (Math.log(f) - Math.log(10000)) / (Math.log(50000) - Math.log(10000));
  const at = (i) => Math.exp(Math.log(r.b[i]) + t * (Math.log(r.c[i]) - Math.log(r.b[i]))) * 1.45 * 10;
  const m = (v) => r.sym + (r.sym === 'Rp' ? ' ' : '') + (Math.round(v / r.step) * r.step).toLocaleString(locale.replace('_', '-'));
  return `${m(at(0))} – ${m(at(1))}`;
}

const MCSS = `<style>
.mk-hero{background:#5331E8}
.mk-hero .cp-crumbs{color:#D9D4FF}
.mk-hero .cp-tag{color:#5331E8}
.mk-card{justify-self:center;width:min(100%,380px);background:#fff;color:#080611;border-radius:30px;padding:22px;box-shadow:0 40px 80px rgba(8,6,17,.35);transform:rotate(2deg);position:relative}
.mk-card small{display:block;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#5331E8}
.mk-card h3{margin:6px 0 4px;font-size:22px;font-weight:800;letter-spacing:-.02em}
.mk-card p{margin:0;color:#5A566A;font-size:14px}
.mk-pills{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}
.mk-pills span{padding:6px 10px;border-radius:999px;background:#ECEBF2;font-size:12px;font-weight:700}
.mk-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #ECEBF2;font-size:14px;font-weight:700}
.mk-row i{flex:none;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:800;color:#fff}
.mk-row em{margin-left:auto;font-style:normal;font-size:12px;padding:5px 9px;border-radius:999px;background:#CDF4F2;color:#005B57}
.mk-pay{position:absolute;left:-26px;bottom:-22px;background:#00C4BC;border-radius:18px;padding:12px 16px;box-shadow:0 20px 40px rgba(8,6,17,.25);transform:rotate(-4deg);font-size:13px;font-weight:700}
.mk-pay b{display:block;font-size:20px}
.mk-price{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}
.mk-price ul{margin:0;padding:0;list-style:none}
.mk-price li{display:flex;gap:12px;align-items:center;padding:14px 0;border-top:1px solid rgba(255,255,255,.14);font-size:18px}
.mk-price li:first-child{border-top:0}
.mk-price li span{flex:none;width:30px;height:30px;border-radius:50%;background:#00C4BC;color:#080611;display:flex;align-items:center;justify-content:center}
.mk-swap{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.mk-swap a{display:inline-flex;align-items:center;gap:8px;padding:12px 16px;border-radius:14px;background:#fff;font-weight:700;text-decoration:none}
@media (max-width:900px){.mk-price{grid-template-columns:1fr}.mk-pay{left:8px}}
</style>`;

function visual(m, kind) {
  const ini = (n, bg) => `<i style="background:${bg}">${n}</i>`;
  if (kind === 'biz') {
    const L = { br: ['Nova campanha', 'Lançamento de verão', ['Reels', 'TikTok', 'São Paulo'], 'Candidaturas', ['Ana · 12 mil', 'Lucas · 8 mil', 'Bia · 24 mil'], 'Selecionar'],
      ph: ['New campaign', 'Summer launch', ['Reels', 'TikTok', 'Metro Manila'], 'Applications', ['Jessa · 12K', 'Paolo · 8K', 'Mika · 24K'], 'Shortlist'],
      id: ['Kampanye baru', 'Peluncuran produk', ['Reels', 'TikTok', 'Jakarta'], 'Lamaran', ['Putri · 12rb', 'Dimas · 8rb', 'Sari · 24rb'], 'Pilih'] }[Object.keys(MARKETS).find((k) => MARKETS[k] === m)];
    const bg = ['#5331E8', '#00C4BC', '#001FFF'];
    return `<div class="mk-card" aria-hidden="true"><small>${L[0]}</small><h3>${L[1]}</h3><div class="mk-pills">${L[2].map((x) => `<span>${x}</span>`).join('')}</div>
<p style="font-weight:800;color:#080611;margin-bottom:4px">${L[3]}</p>${L[4].map((x, i) => `<div class="mk-row">${ini(x[0], bg[i])}${x}<em>${L[5]}</em></div>`).join('')}</div>`;
  }
  const L = { br: ['Campanha aprovada', 'Reels para marca de cosméticos', 'Pagamento liberado', 'R$ 650', ['Briefing', 'Conteúdo', 'No ar']], ph: ['Campaign approved', 'Reel for a skincare brand', 'Payment released', '₱6,500', ['Brief', 'Content', 'Live']], id: ['Kampanye disetujui', 'Reels untuk brand skincare', 'Pembayaran dilepas', 'Rp 2.500.000', ['Brief', 'Konten', 'Tayang']] }[Object.keys(MARKETS).find((k) => MARKETS[k] === m)];
  return `<div class="mk-card" aria-hidden="true"><small>${L[0]}</small><h3>${L[1]}</h3><div class="mk-pills"><span>Instagram</span><span>1 × Reels</span></div>
<div class="mk-row">${ini('✓', '#00C4BC')}${L[4][0]}<em>✓</em></div><div class="mk-row">${ini('✓', '#5331E8')}${L[4][1]}<em>✓</em></div><div class="mk-row">${ini('↑', '#001FFF')}${L[4][2]}<em>✓</em></div>
<div class="mk-pay">${L[2]}<b>${L[3]}</b></div></div>`;
}

function page(key, m, kind, ctx) {
  const c = m[kind], u = m.ui, home = `/${key}/`, me = kind === 'biz' ? home : `/${key}/${m.creatorsPath}/`;
  const other = kind === 'biz' ? [`/${key}/${m.creatorsPath}/`, u.creatorsLink] : [home, u.bizLink];
  const ctaHref = APP;
  const ghostHref = kind === 'biz' ? '#price' : `/tools/influencer-rate-calculator/?country=${m.rate}`;
  const crumbs = `<p class="cp-crumbs"><a href="/">Aktivate</a> &nbsp;/&nbsp; ${kind === 'biz' ? `${m.flag} ${m.name}` : `<a href="${home}">${m.flag} ${m.name}</a> &nbsp;/&nbsp; ${esc(c.tag)}`}</p>`;
  const price = kind === 'biz' ? `<section class="cp-sec" id="price"><div class="cp-steps mk-price"><div><p class="cp-eyebrow" style="color:#00C4BC">${u.price}</p><h2>${c.priceH}</h2><ul>${c.price.map((x) => `<li><span>${CHECK}</span><span style="all:unset">${x}</span></li>`).join('')}</ul><p style="margin:16px 0 0;color:#C9C6D6;font-size:15px;line-height:1.5">${c.priceNote}</p></div>
<div class="cp-fair" style="background:#fff;color:#080611"><p class="cp-eyebrow">${u.calc}</p><h2>${c.example.replace('{range}', `<span style="color:#5331E8">${budgetExample(m.rate, m.locale)}</span>`)}</h2><div class="mk-swap"><a href="/tools/influencer-rate-calculator/?country=${m.rate}&amp;mode=brand" style="background:#5331E8;color:#fff">${u.calc} ${ARROW}</a></div></div></div></section>` : '';
  return `<div class="cp" lang="${m.lang}">
<header style="background:#5331E8">${ctx.nav}</header>
<main>
<section class="cp-hero mk-hero"><div class="cp-wrap cp-hero-grid"><div>
${crumbs}
<p class="cp-tag">${m.flag} ${esc(c.tag)}</p>
<h1>${c.h1[0]} <span>${c.h1[1]}</span></h1>
<p class="cp-lede">${c.lede}</p>
<div class="cp-btns"><a class="cp-btn cp-btn--teal" href="${ctaHref}">${c.cta} ${ARROW}</a><a class="cp-btn cp-btn--ghost" href="${ghostHref}">${c.ctaGhost}</a></div>
</div>${visual(m, kind)}</div></section>
<div class="cp-wrap">
<section class="cp-answer"><i aria-hidden="true">?</i><div><h2>${c.answerQ}</h2><p>${c.answer}</p></div></section>

<section class="cp-sec"><p class="cp-eyebrow">${u.how}</p><h2 class="cp-h">${c.stepsH}</h2>
<div class="cp-cards">${c.steps.map(([h, t], i) => `<div class="cp-card"><span style="background:${['#5331E8', '#00C4BC', '#001FFF', '#080611'][i]};font-weight:800">${i + 1}</span><h3>${h}</h3><p>${t}</p></div>`).join('')}</div></section>

<section class="cp-sec"><h2 class="cp-h">${c.whyH}</h2>
<div class="cp-cards">${c.why.map(([h, t]) => `<div class="cp-card"><span>${CHECK}</span><h3>${h}</h3><p>${t}</p></div>`).join('')}</div></section>
${price}
<section class="cp-sec"><p class="cp-eyebrow">FAQ</p><h2 class="cp-h">${u.faq}</h2><div class="cp-faq">${c.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><p>${a}</p></details>`).join('')}</div>
<div class="mk-swap"><a href="${other[0]}">${other[1]} ${ARROW}</a></div></section>

<section class="cp-end"><div><h2>${c.endH}</h2><p>${c.endP}</p></div><a class="cp-btn cp-btn--teal" href="${ctaHref}">${c.cta} ${ARROW}</a></section>
</div>
</main>
${ctx.footer}
</div>`;
}

function build(ctx) {
  const { OUT, SITE_URL, shell, styles, scripts } = ctx;
  const urls = [];
  const ld = (objs) => objs.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n') + '\n';
  for (const [key, m] of Object.entries(MARKETS)) {
    for (const kind of ['biz', 'creators']) {
      const c = m[kind];
      const rel = kind === 'biz' ? `/${key}/` : `/${key}/${m.creatorsPath}/`;
      const url = SITE_URL + rel;
      const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: m.lang, mainEntity: c.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: strip(a) } })) };
      const doc = shell({
        title: esc(c.title), desc: esc(c.desc), url, styles, scripts, lang: m.lang, locale: m.locale,
        body: page(key, m, kind, ctx),
        extraHead: CSS + MCSS + hreflang(SITE_URL, kind === 'biz' ? 'biz' : 'creators') + ld([faqLd]),
      });
      fs.mkdirSync(path.join(OUT, rel), { recursive: true });
      fs.writeFileSync(path.join(OUT, rel, 'index.html'), doc);
      urls.push(url);
    }
  }
  console.log(`built ${urls.length} country pages (${Object.keys(MARKETS).join(', ')})`);
  return urls;
}

/* For the site-wide nudge (assets/market-banner.js): time zones → country page. */
function bannerConfig() {
  return {
    br: { tz: '^America/(Sao_Paulo|Bahia|Fortaleza|Recife|Belem|Manaus|Maceio|Cuiaba|Campo_Grande|Araguaina|Porto_Velho|Boa_Vista|Rio_Branco|Santarem|Noronha)$', path: '/br/', lang: 'pt-BR', text: MARKETS.br.banner },
    ph: { tz: '^Asia/Manila$', path: '/ph/', lang: 'en', text: MARKETS.ph.banner },
    id: { tz: '^Asia/(Jakarta|Pontianak|Makassar|Jayapura)$', path: '/id/', lang: 'id', text: MARKETS.id.banner },
  };
}

module.exports = { build, hreflang, GROUPS, MARKETS, bannerConfig };
