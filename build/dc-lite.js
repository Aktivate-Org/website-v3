/* dc-lite: tiny renderer for Aktivate's page templates (works in Node for pre-rendering and in the browser for interactivity). */
(function (root) {
  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }
  function lookup(expr, scope) {
    expr = String(expr).trim();
    if (expr === 'true') return true;
    if (expr === 'false') return false;
    if (expr === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return +expr;
    var parts = expr.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function whole(s) { var m = s == null ? null : String(s).match(/^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/); return m ? m[1] : null; }
  function interp(s, scope) { return String(s).replace(HOLE, function (m, e) { var v = lookup(e, scope); return v == null ? '' : String(v); }); }
  function child(scope, extra) { var s = Object.create(scope); for (var k in extra) s[k] = extra[k]; return s; }

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (o) {
    var next = typeof o === 'function' ? o(this.state, this.props) : o;
    this.state = Object.assign({}, this.state, next);
    if (this.__page) this.__page.schedule(this);
  };
  DCLogic.prototype.forceUpdate = function () { if (this.__page) this.__page.schedule(this); };

  function Page(defs) { this.defs = defs; this.inst = {}; this.mountQ = []; this.pending = []; }

  Page.prototype.renderInst = function (name, props, key, wrapAttrs) {
    var def = this.defs[name];
    if (!def) throw new Error('No component ' + name);
    var inst = this.inst[key];
    if (!inst) {
      inst = new def.Cls(props);
      if (!inst.state) inst.state = {};
      inst.__page = this; inst.__key = key; inst.__name = name;
      this.inst[key] = inst; this.mountQ.push(inst);
    } else { inst.props = props; }
    var vals = inst.renderVals ? (inst.renderVals() || {}) : {};
    var self = this, hid = 0, childIdx = 0;
    inst.__h = {};
    var ctx = {
      reg: function (fn) { var id = 'h' + (hid++); inst.__h[id] = fn; return key + '|' + id; },
      child: function (cname, attrs, scope) {
        var p = {};
        for (var k in attrs) {
          if (k === 'name' || k.indexOf('hint-') === 0) continue;
          var w = whole(attrs[k]);
          var camel = k.replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); });
          p[camel] = w !== null ? lookup(w, scope) : attrs[k];
        }
        return self.renderInst(cname, p, key + '/' + cname + '#' + (childIdx++));
      }
    };
    var inner = renderNodes(def.ast, vals, ctx);
    var safeProps = {};
    for (var pk in props) { if (typeof props[pk] !== 'function' && typeof props[pk] !== 'object') safeProps[pk] = props[pk]; }
    return '<div data-dc-key="' + escAttr(key) + '" data-dc-name="' + escAttr(name) + '" data-dc-props="' + escAttr(JSON.stringify(safeProps)) + '" style="display:contents">' + inner + '</div>';
  };

  function renderNodes(nodes, scope, ctx) { var out = ''; for (var i = 0; i < (nodes || []).length; i++) out += renderNode(nodes[i], scope, ctx); return out; }
  function renderNode(n, scope, ctx) {
    if (n.t === 'text') return esc(interp(n.v, scope));
    var name = n.n, a = n.a || {};
    if (name === 'helmet') return '';
    if (name === 'sc-if') return lookup(whole(a.value) || a.value, scope) ? renderNodes(n.c, scope, ctx) : '';
    if (name === 'sc-for') {
      var list = lookup(whole(a.list) || a.list, scope) || [], as = a.as || 'item', o = '';
      for (var i = 0; i < list.length; i++) { var x = {}; x[as] = list[i]; x.$index = i; o += renderNodes(n.c, child(scope, x), ctx); }
      return o;
    }
    if (name === 'dc-import') return ctx.child(a.name, a, scope);
    var attrs = '';
    for (var k in a) {
      if (k.indexOf('hint-') === 0) continue;
      var v = a[k], w = whole(v);
      if (/^on[A-Z]/.test(k)) {
        var fn = w ? lookup(w, scope) : null;
        if (typeof fn === 'function') { var ev = k.slice(2).toLowerCase(); if (ev === 'change') ev = 'input'; attrs += ' data-on-' + ev + '="' + escAttr(ctx.reg(fn)) + '"'; }
        continue;
      }
      var val = w !== null ? lookup(w, scope) : interp(v, scope);
      if (typeof val === 'boolean' && k.indexOf('aria-') === 0) val = String(val);
      if (val === false || val == null) continue;
      if (val === true) val = '';
      attrs += ' ' + k + '="' + escAttr(String(val)) + '"';
    }
    if (VOID[name]) return '<' + name + attrs + '>';
    return '<' + name + attrs + '>' + renderNodes(n.c, scope, ctx) + '</' + name + '>';
  }

  /* ---------- browser side ---------- */
  Page.prototype.schedule = function (inst) {
    var self = this;
    if (this.pending.indexOf(inst) < 0) this.pending.push(inst);
    if (this.raf) return;
    this.raf = (root.requestAnimationFrame || setTimeout)(function () {
      self.raf = null;
      var list = self.pending.splice(0);
      list.forEach(function (i) { self.update(i); });
    });
  };
  Page.prototype.update = function (inst) {
    var el = document.querySelector('[data-dc-key="' + inst.__key.replace(/"/g, '\\"') + '"]');
    if (!el) return;
    var html = this.renderInst(inst.__name, inst.props, inst.__key);
    root.morphdom(el, html, {
      onBeforeElUpdated: function (from, to) {
        if (from.tagName === 'DETAILS') { if (from.open) to.setAttribute('open', ''); else to.removeAttribute('open'); }
        return true;
      }
    });
    this.flushMounts();
  };
  Page.prototype.flushMounts = function () {
    var q = this.mountQ.splice(0);
    q.forEach(function (i) { if (i.componentDidMount) i.componentDidMount(); });
  };
  Page.prototype.hydrate = function () {
    var self = this;
    var tops = [].slice.call(document.querySelectorAll('[data-dc-key]')).filter(function (el) {
      if (!self.defs[el.getAttribute('data-dc-name')]) return false;
      var p = el.parentElement && el.parentElement.closest('[data-dc-key]');
      while (p) { if (self.defs[p.getAttribute('data-dc-name')]) return false; p = p.parentElement && p.parentElement.closest('[data-dc-key]'); }
      return true;
    });
    tops.forEach(function (el) {
      var key = el.getAttribute('data-dc-key'), name = el.getAttribute('data-dc-name');
      var props = {}; try { props = JSON.parse(el.getAttribute('data-dc-props') || '{}'); } catch (e) {}
      self.renderInst(name, props, key);
      self.update(self.inst[key]);
    });
    ['click', 'input', 'change', 'submit'].forEach(function (type) {
      document.addEventListener(type, function (e) {
        var t = e.target && e.target.closest && e.target.closest('[data-on-' + type + ']');
        if (!t) return;
        var ref = t.getAttribute('data-on-' + type).split('|');
        var inst = self.inst[ref[0]];
        var fn = inst && inst.__h && inst.__h[ref[1]];
        if (fn) fn(e);
      });
    });
    document.documentElement.classList.add('dc-ready');
  };

  var api = { DCLogic: DCLogic, Page: Page, renderNodes: renderNodes };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DCLite = api;
})(typeof window !== 'undefined' ? window : globalThis);
