// Helpers shared by the home and the project page.

// One-way bindings declared in the markup; apply() only writes what changed since the last call.
//   data-t="key"          text content
//   data-s="prop:key;…"   inline style properties
//   data-a="attr:key;…"   attributes (null / undefined removes it)
//   data-show="key"       element is hidden unless the value is truthy
window.npBind = (() => {
  const pairs = s => (s || '').split(';').map(p => p.trim()).filter(Boolean)
    .map(p => { const i = p.indexOf(':'); return [p.slice(0, i).trim(), p.slice(i + 1).trim()]; });
  // keeps the existing text node when there is one, so typing animations holding it stay valid
  const setText = (el, v) => {
    const c = el.firstChild;
    if (c && c.nodeType === 3 && !c.nextSibling) { if (c.nodeValue !== v) c.nodeValue = v; }
    else el.textContent = v;
  };
  const collect = root => [...root.querySelectorAll('[data-t],[data-s],[data-a],[data-show]')].map(el => ({
    el, t: el.getAttribute('data-t'), show: el.getAttribute('data-show'),
    s: pairs(el.getAttribute('data-s')), a: pairs(el.getAttribute('data-a')), last: {}
  }));
  function apply(binds, V) {
    for (const b of binds) {
      const { el, last } = b;
      if (b.t) { const v = String(V[b.t] ?? ''); if (last.t !== v) { setText(el, v); last.t = v; } }
      for (const [p, k] of b.s) { const v = String(V[k] ?? ''); if (last[p] !== v) { el.style.setProperty(p, v); last[p] = v; } }
      for (const [a, k] of b.a) {
        const v = V[k], key = '@' + a;
        if (last[key] === v) continue;
        if (v == null) el.removeAttribute(a); else el.setAttribute(a, String(v));
        last[key] = v;
      }
      if (b.show) { const v = !!V[b.show]; if (last.show !== v) { el.hidden = !v; last.show = v; } }
    }
  }
  return { collect, apply, setText };
})();

// URL id of a project: its display name without accents ("método-cima" → "metodo-cima").
window.npSlug = p => (p.name || []).join('-').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// Accepts the URL id or the legacy data key (p.slug).
window.npFindProject = (list, q) => {
  q = (q || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  return list.findIndex(p => npSlug(p) === q || (p.slug || '').normalize('NFD').replace(/[̀-ͯ]/g, '') === q);
};

// Pixel-art arrow that replaces the system cursor on mouse / trackpad devices.
window.npCursor = (() => {
  const ARROW = ['X', 'XX', 'XoX', 'XooX', 'XoooX', 'XooooX', 'XoooooX', 'XooooooX', 'XoooooooX', 'XooooooooX', 'XoooooXXXXX', 'XooXooX', 'XoX XooX', 'XX  XooX', 'X    XooX', '     XooX', '      XX'];
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  let svg = null, hide = null, on = false, x = -100, y = -100;
  const place = () => { if (svg) svg.style.transform = `translate(${x}px, ${y}px)`; };
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; place(); });
  function build() {
    svg = document.createElementNS(NS, 'svg');
    for (const [k, v] of Object.entries({ width: 22, height: 31, viewBox: '0 0 11 17', 'shape-rendering': 'crispEdges', 'aria-hidden': 'true' })) svg.setAttribute(k, v);
    svg.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:950;filter:drop-shadow(0 0 4px rgba(230,43,30,.7))';
    ARROW.forEach((row, ry) => [...row].forEach((c, rx) => {
      if (c === ' ') return;
      const r = document.createElementNS(NS, 'rect');
      for (const [k, v] of Object.entries({ x: rx, y: ry, width: 1, height: 1, fill: c === 'X' ? '#E62B1E' : '#0A0A0A' })) r.setAttribute(k, v);
      svg.appendChild(r);
    }));
    hide = document.createElement('style');
    hide.textContent = '*{cursor:none!important}';
    place();
    document.body.appendChild(svg);
  }
  function enable(v) {
    v = !!v && fine;
    if (v === on) return;
    on = v;
    if (v && !svg) build();
    if (svg) svg.style.display = v ? '' : 'none';
    if (v) document.head.appendChild(hide); else if (hide) hide.remove();
  }
  return { fine, enable };
})();
