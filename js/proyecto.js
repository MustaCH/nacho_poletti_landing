// Project page: behaviour of the Claude Design prototype "Proyecto".
// Which project is shown comes from ?p=<id>; prev / next swap it in place.
(() => {
  const i18n = window.npI18n;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const now = () => performance.now();
  const inOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const pad2 = v => String(v).padStart(2, '0');
  const name = x => x ? (x.name || []).join('-') : '';
  const ALL = window.NP_PROJECTS || [];
  const LABELS = {
    es: { back: '<< volver', project: 'proyecto', client: 'cliente', services: 'servicios', status: 'estado', built1: 'lo que', built2: 'hicimos', tools: 'herramientas', prev: 'anterior', next: 'siguiente', allWork: 'todo el trabajo', secs: ['proyecto', 'lo que hicimos', 'stack', 'siguiente'] },
    en: { back: '<< back', project: 'project', client: 'client', services: 'services', status: 'status', built1: 'what we', built2: 'built', tools: 'tools', prev: 'previous', next: 'next', allWork: 'all work', secs: ['project', 'what we built', 'stack', 'next'] }
  };

  const S = { idx: Math.max(0, npFindProject(ALL, new URLSearchParams(location.search).get('p'))), fade: 1, sec: 0, lang: i18n.get() };
  let binds = [], queued = false;
  const set = patch => {
    Object.assign(S, patch);
    if (!queued) { queued = true; queueMicrotask(() => { queued = false; render(); }); }
  };
  const at = i => ALL[(i + ALL.length) % ALL.length] || {};
  const copy = p => p[S.lang === 'en' ? 'en' : 'es'] || {};

  function vals() {
    const L = LABELS[S.lang === 'en' ? 'en' : 'es'], es = S.lang !== 'en', n = ALL.length || 1;
    const p = at(S.idx), t = copy(p), nt = copy(at(S.idx + 1)), mob = innerWidth < 760;
    return {
      esTxt: es ? '[es]' : 'es', enTxt: es ? 'en' : '[en]', esOp: es ? 1 : 0.45, enOp: es ? 0.45 : 1, back: L.back,
      footLeft: '[' + pad2(S.idx + 1) + '/' + pad2(n) + '] ://' + name(p),
      footRight: pad2(S.sec + 1) + '/04 ://' + (L.secs[S.sec] || ''),
      fade: S.fade, fadeF: S.fade ? 'none' : 'blur(8px)',
      model: p.model || 'core', mRefW: mob ? '0.95' : '0.62', mCx: mob ? '0.6' : '0.7',
      labelProject: L.project, field: t.field, year: p.year, metric: t.metric, metricLbl: t.metricLbl,
      nameAria: name(p).split('-').join(' '), lede: t.lede,
      labelClient: L.client, client: t.client, labelServices: L.services, services: t.services, labelStatus: L.status, status: t.status,
      built1: L.built1, built2: L.built2, intro: t.intro,
      stackCount: pad2((p.stack || []).length), labelTools: L.tools,
      hasUrl: !!p.url, url: p.url, urlLbl: p.urlLbl,
      labelPrev: L.prev, prevSlug: name(at(S.idx - 1)), labelNext: L.next,
      nextMetric: nt.metric, nextMetricLbl: nt.metricLbl, labelAllWork: L.allWork
    };
  }

  const el = (tag, css, text) => {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  };
  const list = k => document.querySelector('[data-list="' + k + '"]');
  // big names are split on "-" and stepped to the right line by line
  const lines = (box, p) => box.replaceChildren(...name(p).split('-').filter(Boolean).map((w, i) => el('span', 'padding-left:' + (i ? '.8em' : '0'), w)));
  let listSig = '';
  function renderLists() {
    const sig = S.idx + '|' + S.lang;
    if (sig === listSig) return;
    listSig = sig;
    const p = at(S.idx);
    lines(list('name'), p);
    lines(list('next'), at(S.idx + 1));
    list('built').replaceChildren(...(copy(p).built || []).map((b, i) => {
      const row = el('div'), col = el('div', 'display:flex;flex-direction:column;gap:.3vh'), title = el('span', null, b.t);
      row.className = 'built-item'; title.className = 'bt';
      col.append(title, el('p', 'text-wrap:pretty;max-width:60ch', b.d));
      row.append(el('span', null, '[' + pad2(i + 1) + ']'), col);
      return row;
    }));
    list('stack').replaceChildren(...(p.stack || []).map((s, i, a) => {
      const item = el('span', 'display:flex;align-items:baseline;gap:.35em');
      item.append(el('span', null, s), el('span', 'opacity:.35', i < a.length - 1 ? '/' : ''));
      return item;
    }));
    list('index').replaceChildren(...ALL.map((x, i) => {
      const on = i === S.idx, b = el('button', 'cursor:pointer;text-shadow:inherit;opacity:' + (on ? 1 : 0.45) + ';text-align:right;white-space:nowrap', (on ? '>> ' : '') + '[' + pad2(i + 1) + '] ' + name(x));
      b.type = 'button'; b.dataset.act = 'pick'; b.dataset.i = i;
      return b;
    }));
  }

  function render() {
    const V = vals();
    npBind.apply(binds, V);
    renderLists();
    document.title = 'Ignacio Poletti — ' + (V.nameAria || 'proyecto');
  }

  // ---------------------------------------------------------------- one gesture = one screen
  let busy = false, raf = 0, swap = 0, wheelT = 0, touchY = 0, touchUsed = false;
  function points() {
    const H = innerHeight, out = [];
    $$('main > section').forEach(s => {
      const top = s.offsetTop, end = top + s.offsetHeight - H;
      out.push(top);
      for (let y = top + H * 0.85; y < end - 40; y += H * 0.85) out.push(Math.round(y));
      if (end > top + 40) out.push(end);
    });
    const max = document.documentElement.scrollHeight - H;
    return [...new Set(out.map(p => Math.max(0, Math.min(max, p))))].sort((a, b) => a - b);
  }
  function tween(target, dur = 620) {
    cancelAnimationFrame(raf);
    const y0 = scrollY, t0 = now();
    busy = true;
    const step = ts => {
      const p = Math.min(1, (ts - t0) / dur);
      scrollTo(0, Math.round(y0 + (target - y0) * inOut(p)));
      if (p < 1) raf = requestAnimationFrame(step); else setTimeout(() => { busy = false; }, 200);
    };
    raf = requestAnimationFrame(step);
  }
  function go(dir) {
    if (busy) return;
    const y = scrollY, list = points();
    const t = dir > 0 ? list.find(p => p > y + 4) : [...list].reverse().find(p => p < y - 4);
    if (t != null) tween(t);
  }
  // swap to another project: fade out, jump to the top, fade the new one in
  function pick(i) {
    const n = ALL.length; if (!n) return;
    i = (i + n) % n;
    if (i === S.idx) { tween(0, 700); return; }
    set({ fade: 0 });
    clearTimeout(swap);
    swap = setTimeout(() => {
      scrollTo(0, 0);
      history.replaceState(null, '', location.pathname + '?p=' + npSlug(ALL[i]));
      set({ idx: i, fade: 1 });
    }, 300);
  }

  addEventListener('wheel', e => {
    if (e.cancelable) e.preventDefault();
    const t = now(), gap = t - wheelT; wheelT = t;
    if (gap > 200 && Math.abs(e.deltaY) > 3) go(Math.sign(e.deltaY));
  }, { passive: false });
  addEventListener('touchstart', e => { touchY = e.touches[0].clientY; touchUsed = false; }, { passive: true });
  addEventListener('touchmove', e => {
    if (e.cancelable) e.preventDefault();
    const dy = touchY - e.touches[0].clientY;
    if (!touchUsed && Math.abs(dy) > 28) { touchUsed = true; go(dy > 0 ? 1 : -1); }
  }, { passive: false });
  addEventListener('keydown', e => {
    const d = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
    if (d) { e.preventDefault(); go(d); }
  });
  addEventListener('scroll', () => {
    const mid = scrollY + innerHeight * 0.5;
    let s = 0; $$('main > section').forEach((sec, i) => { if (sec.offsetTop <= mid) s = i; });
    if (s !== S.sec) set({ sec: s });
  }, { passive: true });
  addEventListener('resize', () => set({}));
  addEventListener('np-lang', e => set({ lang: e.detail }));
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-act]'); if (!b) return;
    const a = b.dataset.act;
    if (a === 'toggleLang') i18n.set(S.lang === 'en' ? 'es' : 'en');
    else if (a === 'prev') pick(S.idx - 1);
    else if (a === 'next') pick(S.idx + 1);
    else if (a === 'pick') pick(+b.dataset.i);
  });

  // ---------------------------------------------------------------- boot
  if (ALL[S.idx]) {
    const id = npSlug(ALL[S.idx]);    // canonical id in the URL (legacy ids still resolve)
    if (new URLSearchParams(location.search).get('p') !== id) history.replaceState(null, '', location.pathname + '?p=' + id);
  }
  i18n.apply(document.body);
  binds = npBind.collect(document.body);
  render();
  npCursor.enable(true);
})();
