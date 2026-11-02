/* Aktivate cookie banner + Google Consent Mode v2.
   Defaults (set inline in <head>, before GTM) deny analytics and ads storage.
   This file shows the banner, saves the choice to localStorage ('akt-consent')
   and sends gtag('consent','update') plus a dataLayer event 'cookie_consent_update'.
   Any link to #cookie-settings reopens the banner. */
(function () {
  var KEY = 'akt-consent', MAX_AGE = 365 * 24 * 3600 * 1000;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && c.v === 1 && Date.now() - c.ts < MAX_AGE) return c;
    } catch (e) {}
    return null;
  }
  function apply(c, isNew) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
    window.dataLayer.push({ event: 'cookie_consent_update', consent_analytics: !!c.analytics, consent_marketing: !!c.marketing, consent_new: !!isNew });
  }
  function save(analytics, marketing) {
    var c = { v: 1, analytics: analytics, marketing: marketing, ts: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    apply(c, true);
    close();
  }

  var css = '' +
    '#akt-cc{position:fixed;z-index:2147483000;left:16px;bottom:16px;width:min(420px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;' +
    'background:#080611;color:#fff;font-family:Aileron,system-ui,sans-serif;font-size:14px;line-height:1.5;border-radius:20px;padding:20px;' +
    'box-shadow:0 16px 48px rgba(8,6,17,.35);border:1px solid rgba(255,255,255,.12)}' +
    '#akt-cc h2{margin:0 0 6px;font-size:16px;font-weight:800;letter-spacing:-.01em}' +
    '#akt-cc p{margin:0 0 14px;color:rgba(255,255,255,.78)}' +
    '#akt-cc a{color:#9EB3FF}' +
    '#akt-cc .b{display:flex;flex-wrap:wrap;gap:8px}' +
    '#akt-cc button{font:inherit;font-weight:700;border-radius:999px;padding:10px 16px;cursor:pointer;border:1.5px solid rgba(255,255,255,.35);background:transparent;color:#fff;flex:1 1 auto}' +
    '#akt-cc button.p{background:#00C4BC;border-color:#00C4BC;color:#080611}' +
    '#akt-cc button:focus-visible{outline:2px solid #9EB3FF;outline-offset:2px}' +
    '#akt-cc .o{display:none;margin:0 0 14px;padding:12px 0 0;border-top:1px solid rgba(255,255,255,.12)}' +
    '#akt-cc.open .o{display:block}' +
    '#akt-cc label{display:flex;gap:10px;align-items:flex-start;margin:0 0 10px;cursor:pointer}' +
    '#akt-cc label span{color:rgba(255,255,255,.7);font-size:13px}' +
    '#akt-cc label b{color:#fff;display:block;font-size:14px}' +
    '#akt-cc input{accent-color:#00C4BC;width:18px;height:18px;margin:2px 0 0;flex:none}' +
    '#akt-cc .save{display:none}#akt-cc.open .save{display:block}#akt-cc.open .more{display:none}' +
    '@media (max-width:520px){#akt-cc{left:12px;bottom:12px;width:calc(100vw - 24px);padding:18px}}';

  var el = null;
  function build() {
    var c = read() || { analytics: false, marketing: false };
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    el = document.createElement('div');
    el.id = 'akt-cc'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-labelledby', 'akt-cc-t'); el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<h2 id="akt-cc-t">We use cookies 🍪</h2>' +
      '<p>We use essential cookies to make our site work. With your OK, we also use analytics cookies to see how the site is used, and marketing cookies to measure our ads. Read our <a href="/privacy/#cookies">Privacy Policy</a>.</p>' +
      '<div class="o">' +
      '<label><input type="checkbox" checked disabled><span><b>Essential</b>Sign-in, checkout and your currency choice. Always on.</span></label>' +
      '<label><input type="checkbox" id="akt-cc-a"' + (c.analytics ? ' checked' : '') + '><span><b>Analytics</b>Google Analytics, so we can see which pages help people.</span></label>' +
      '<label><input type="checkbox" id="akt-cc-m"' + (c.marketing ? ' checked' : '') + '><span><b>Marketing</b>Ad measurement, such as the Meta Pixel.</span></label>' +
      '</div>' +
      '<div class="b">' +
      '<button type="button" class="p" data-a="all">Accept all</button>' +
      '<button type="button" data-a="none">Reject all</button>' +
      '<button type="button" class="more" data-a="more">Choose</button>' +
      '<button type="button" class="save" data-a="save">Save choices</button>' +
      '</div>';
    el.addEventListener('click', function (e) {
      var a = e.target.getAttribute && e.target.getAttribute('data-a');
      if (a === 'all') save(true, true);
      else if (a === 'none') save(false, false);
      else if (a === 'more') { el.classList.add('open'); el.querySelector('#akt-cc-a').focus(); }
      else if (a === 'save') save(el.querySelector('#akt-cc-a').checked, el.querySelector('#akt-cc-m').checked);
    });
    document.body.appendChild(el);
  }
  function open(prefs) {
    if (el) { el.remove(); el = null; }
    build();
    if (prefs) el.classList.add('open');
  }
  function close() { if (el) { el.remove(); el = null; } }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#cookie-settings"]');
    if (a) { e.preventDefault(); open(true); }
  });
  window.aktCookieSettings = function () { open(true); };

  function init() { if (!read()) open(false); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
