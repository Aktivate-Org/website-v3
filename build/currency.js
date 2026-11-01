/* Local pricing. Rates are USD -> local (Wise mid-market, 1 Nov 2026). Update here and in Pricing.dc.html. */
(function () {
  var FX = {
    USD: { sym: '$', rate: 1, listing: 15, round: 1 },
    NGN: { sym: '₦', rate: 1359, listing: 20500, round: 100 },
    GHS: { sym: 'GH₵', rate: 11.62, listing: 175, round: 1 },
    KES: { sym: 'KSh ', rate: 130, listing: 1950, round: 10 }
  };
  window.AKT_FX = FX;
  function current() {
    var c = null;
    try { c = window.localStorage.getItem('akt-cur'); } catch (e) {}
    if (c && FX[c]) return c;
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz === 'Africa/Lagos') return 'NGN';
      if (tz === 'Africa/Accra') return 'GHS';
      if (tz === 'Africa/Nairobi') return 'KES';
    } catch (e) {}
    return 'USD';
  }
  function fmt(usd, c) {
    var f = FX[c];
    var v = usd === 15 ? f.listing : Math.round(usd * f.rate / f.round) * f.round;
    return f.sym + v.toLocaleString('en-US');
  }
  function apply() {
    var c = current();
    var els = document.querySelectorAll('[data-usd]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.getAttribute('data-cur') !== c) { el.textContent = fmt(+el.getAttribute('data-usd'), c); el.setAttribute('data-cur', c); }
    }
  }
  window.AKT_applyCurrency = apply;
  document.addEventListener('DOMContentLoaded', function () {
    apply();
    try { new MutationObserver(apply).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['data-cur', 'data-usd'] }); } catch (e) {}
  });
})();
