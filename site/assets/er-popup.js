/* Engagement-rate calculator promo pop-up.
   Shows once per visit after a short delay, never on top of the cookie banner,
   and stays away for 7 days after closing (30 days after a click).
   dataLayer events: er_popup_view, er_popup_click, er_popup_close. */
(function () {
  var KEY = 'akt-er-popup', URL = '/tools/engagement-rate-calculator/', DELAY = 6000;
  var path = location.pathname;
  if (/^\/(tools|privacy|terms)\//.test(path) || path.indexOf('/example-shop') === 0) return;
  function get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  var st = get();
  if (st.until && Date.now() < st.until) return;
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  window.dataLayer = window.dataLayer || [];
  function ev(name) { window.dataLayer.push({ event: name, popup: 'engagement_calculator' }); }

  var css = '' +
    '#akt-er{position:fixed;z-index:2147482000;right:20px;bottom:20px;width:min(380px,calc(100vw - 40px));font-family:Aileron,system-ui,sans-serif;color:#080611;' +
    'transform:translateY(24px) scale(.98);opacity:0;transition:transform .35s cubic-bezier(.2,.8,.2,1),opacity .35s}' +
    '#akt-er.in{transform:none;opacity:1}' +
    '#akt-er .c{display:block;position:relative;text-decoration:none;color:inherit;background:#FFD23F;border:3px solid #080611;border-radius:28px;overflow:hidden;box-shadow:8px 8px 0 #080611}' +
    '#akt-er .art{position:relative;height:150px;background:#5331E8;border-bottom:3px solid #080611;overflow:hidden}' +
    '#akt-er .ph{position:absolute;left:26px;top:22px;width:150px;height:150px;background:#fff;border:3px solid #080611;border-radius:22px;transform:rotate(-6deg);padding:12px}' +
    '#akt-er .av{width:34px;height:34px;border-radius:50%;background:#9EB3FF;border:2px solid #080611}' +
    '#akt-er .ln{height:8px;border-radius:4px;background:#ECEBF2;margin-top:8px}' +
    '#akt-er .ic{display:flex;gap:10px;margin-top:12px;font-weight:800;font-size:13px}' +
    '#akt-er .stat{position:absolute;z-index:1;right:62px;top:34px;background:#00C4BC;border:3px solid #080611;border-radius:18px;padding:10px 14px;transform:rotate(4deg);text-align:left}' +
    '#akt-er .stat b{display:block;font-size:34px;line-height:1;letter-spacing:-.03em}' +
    '#akt-er .stat span{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}' +
    '#akt-er .bars{position:absolute;right:18px;bottom:-3px;display:flex;align-items:flex-end;gap:6px}' +
    '#akt-er .bars i{display:block;width:16px;background:#FFD23F;border:3px solid #080611;border-bottom:0;border-radius:6px 6px 0 0}' +
    '#akt-er .tx{padding:18px 20px 20px}' +
    '#akt-er .k{margin:0 0 6px;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase}' +
    '#akt-er h2{margin:0;font-weight:800;font-size:26px;line-height:1;letter-spacing:-.03em}' +
    '#akt-er p.s{margin:8px 0 14px;font-size:15px;line-height:1.45;color:#1C1830}' +
    '#akt-er .cta{display:flex;align-items:center;justify-content:center;gap:8px;min-height:52px;border-radius:14px;background:#080611;color:#fff;font-weight:800;font-size:16px}' +
    '#akt-er .x{position:absolute;z-index:2;right:12px;top:12px;width:36px;height:36px;border-radius:50%;border:2px solid #080611;background:#fff;color:#080611;font:800 18px/1 system-ui,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center}' +
    '#akt-er .x:focus-visible,#akt-er .c:focus-visible{outline:3px solid #00C4BC;outline-offset:3px}' +
    '@media (max-width:520px){#akt-er{right:12px;left:12px;bottom:12px;width:auto}#akt-er .ph{width:124px;height:auto;top:14px;left:18px;padding:10px}#akt-er .ph .ln{margin-top:6px}#akt-er .ic{margin-top:8px}#akt-er .stat{right:56px;top:30px}#akt-er .stat b{font-size:28px}#akt-er .art{height:128px}#akt-er h2{font-size:23px}}' +
    '@media (prefers-reduced-motion:reduce){#akt-er{transition:none}}';

  var el;
  function close(reason) {
    if (!el) return;
    set({ until: Date.now() + (reason === 'click' ? 30 : 7) * 864e5 });
    if (reason !== 'click') { ev('er_popup_close'); el.classList.remove('in'); var e = el; setTimeout(function () { e.remove(); }, 350); }
    el = null;
  }
  function show() {
    if (el || document.getElementById('akt-er')) return;
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    el = document.createElement('aside');
    el.id = 'akt-er'; el.setAttribute('aria-label', 'Free engagement rate calculator');
    el.innerHTML =
      '<button type="button" class="x" aria-label="Close">&#x2715;</button>' +
      '<a class="c" href="' + URL + '">' +
      '<div class="art" aria-hidden="true">' +
      '<div class="ph"><div class="av"></div><div class="ln" style="width:80%"></div><div class="ln" style="width:55%"></div>' +
      '<div class="ic"><span>&#x2764;&#xFE0F; 1.2K</span><span>&#x1F4AC; 86</span></div></div>' +
      '<div class="stat"><b>4.8%</b><span>Engagement</span></div>' +
      '<div class="bars"><i style="height:22px"></i><i style="height:38px"></i><i style="height:30px"></i><i style="height:54px"></i></div>' +
      '</div>' +
      '<div class="tx"><p class="k">Free tool</p><h2>What’s your real engagement rate?</h2>' +
      '<p class="s">Drop your Instagram or TikTok handle and see how you compare to creators your size. Takes 10 seconds.</p>' +
      '<span class="cta">Check mine free <span aria-hidden="true">&rarr;</span></span></div>' +
      '</a>';
    el.querySelector('.x').addEventListener('click', function (e) { e.preventDefault(); close('x'); });
    el.querySelector('.c').addEventListener('click', function () { ev('er_popup_click'); close('click'); });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape' && el) { close('esc'); document.removeEventListener('keydown', k); } });
    document.body.appendChild(el);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el && el.classList.add('in'); }); });
    ev('er_popup_view');
  }
  /* wait for the delay, then for the cookie banner to be gone */
  function tryShow() {
    if (document.getElementById('akt-cc')) { setTimeout(tryShow, 1500); return; }
    show();
  }
  function start() { setTimeout(tryShow, DELAY); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.aktShowErPopup = show;
})();
