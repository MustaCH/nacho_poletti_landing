// Home: behaviour of the Claude Design prototype "Portfolio v4 Digital".
// The desktop layout (≥ 760px) is in the markup; below that #tpl-mob is mounted in its place.
(() => {
  const i18n = window.npI18n, tr = i18n.tr;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const now = () => performance.now();
  const inOut = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const out = p => 1 - Math.pow(1 - p, 3);
  const MOB = 760;
  const isMob = () => innerWidth < MOB;
  const on = () => innerWidth >= MOB;          // desktop scroll choreography

  const SERVICES = [
    { desc: 'Sistemas internos, plataformas y dashboards diseñados para cómo opera tu negocio. No plantillas.', tags: 'react · node · python · postgres' },
    { desc: 'Integraciones de LLMs y modelos para procesos reales: clasificación, extracción, automatización.', tags: 'openai · rag · langchain · embeddings' },
    { desc: 'Auditoría de procesos + tecnología para eliminar fricción. Menos herramientas, más control.', tags: 'diagnóstico · automatización · integración' },
    { desc: 'Entro a tu stack, encuentro deuda técnica y propongo un plan de ejecución realista.', tags: 'code review · arquitectura · roadmap' }
  ];
  // how the services skull is framed while each service is active
  const SKULL = { cx: [0.56, 0.87, 0.885, 0.62], cy: [0.36, 0.74, 0.3, 0.66], s: [0.72, 0.55, 0.38, 0.95], ay: [0, -0.45, -0.55, -0.35], ap: [0, -0.3, 0.05, -0.35] };
  const TYPES = ['software', 'ia', 'operaciones', 'diagnóstico'];
  const BUDGETS = ['< 5k', '5—15k', '15—40k', '40k+'];
  const FORM_URL = 'https://formsubmit.co/ajax/polettiignacio7@gmail.com';

  // ---------------------------------------------------------------- state & render
  const S = {
    ba: '--:--', local: '--:--', pct: 0, loading: true, loadOp: 1,
    hover: 0, work: 0, t: scrollY < 5 ? 0 : 1, s2op: 1,
    goo: 0, h2op: 1, hgoo: 0, hop: 1, wpc: null, brR: null, brOpen: false,
    name: '', email: '', msg: '', type: null, budget: null, sent: false, sending: false, formErr: null,
    signal: true, cursorOn: true, lang: i18n.get(), mob: isMob()
  };
  let P = [];                                  // projects in the current language
  let binds = [], lists = [];
  let queued = false, after = [];
  function set(patch, cb) {
    Object.assign(S, patch);
    if (cb) after.push(cb);
    if (!queued) { queued = true; queueMicrotask(flush); }
  }
  function flush() {
    queued = false;
    render();
    const cbs = after; after = [];
    onHoverChange();
    cbs.forEach(f => f());
  }

  function projects() {
    const en = S.lang === 'en';
    P = (window.NP_PROJECTS || []).map(p => {
      const t = p[en ? 'en' : 'es'] || p.es;
      return {
        slug: (p.name || []).join('-'), model: p.model, tag: t.tag, year: p.year, metric: t.metric, metricLabel: t.metricLbl,
        stack: p.stack.slice(0, 3).join(' · ').toLowerCase(), desc: t.lede, href: 'proyecto.html?p=' + encodeURIComponent(npSlug(p))
      };
    });
  }

  function vals() {
    const es = S.lang !== 'en', h = S.hover || 0, w = S.work || 0, cur = P[w] || {};
    const t = S.t || 0, H = innerHeight, k = v => 'translateY(' + (v * t * H).toFixed(1) + 'px)';
    const cursorOn = !S.mob && S.cursorOn;
    const svc = SERVICES[h];
    const c = S.wpc == null ? 1e9 : S.wpc, ty = (x, n) => n >= x.length ? x : (n <= 0 ? '' : x.slice(0, n) + '_');
    const desc = cur.desc || '', stack = cur.stack || '';
    const V = {
      loading: S.loading, loadOp: S.loadOp, pct: S.pct, signal: S.signal, cursorOn,
      signalLbl: S.signal ? '[on]' : '[off]', cursorLbl: cursorOn ? '[on]' : '[off]',
      clockBA: S.ba, clockLocal: S.local,
      esTxt: es ? '[es]' : 'es', enTxt: es ? 'en' : '[en]', esOp: es ? 1 : 0.45, enOp: es ? 0.45 : 1,
      talkLbl: es ? '.hablemos' : '.talk',
      // hero: t 0→1 separates the layers (negative exits top, positive exits bottom)
      pxTodo: k(-1.2), pxProblema: k(-1.35), pxTiene: k(-1.5), pxMas: k(1.0), pxCa: k(1.15), pxPas: k(0.3), pxSmall: k(0.08),
      pxSmallOp: Math.max(0, 1 - t * 2.2).toFixed(3),
      h1f: S.hgoo > 0.05 ? 'url(#np-goo-h)' : 'blur(' + (0.6 + t * t * 14).toFixed(2) + 'px)',
      h1op: (Math.max(0, 1 - Math.max(0, t - 0.45) / 0.45) * S.hop).toFixed(3),
      hGooBlur: S.hgoo.toFixed(2), gooBlur: S.goo.toFixed(2),
      s2op: S.s2op, s2f: S.goo > 0.05 ? 'url(#np-goo)' : 'blur(.5px)', s2h2op: S.h2op.toFixed(3),
      skCx: SKULL.cx[h], skCy: SKULL.cy[h], skS: SKULL.s[h], skAy: SKULL.ay[h], skAp: SKULL.ap[h],
      svcNum: h + 1, svcDesc: tr(svc.desc), svcTags: tr(svc.tags),
      brR: S.brR || '100%', brLx: S.brOpen ? 'translateX(-.45em)' : 'translateX(0)', brRx: S.brOpen ? 'translateX(.45em)' : 'translateX(0)',
      svcShift: 'translateY(' + (-(h * 0.86 + 0.43)).toFixed(3) + 'em)',
      curHref: cur.href, curModel: cur.model, workIdx: w, workTotal: P.length,
      curSlug: cur.slug, curTag: cur.tag, curYear: cur.year, curMetric: cur.metric, curMetricLabel: cur.metricLabel,
      curDesc: desc, curStack: stack, wDesc: ty(desc, c), wStack: ty(stack, c - desc.length - 8),
      notSent: !S.sent, sent: S.sent, greet: S.name ? ', ' + S.name.split(' ')[0] : '',
      sendLbl: S.sending ? (es ? '[enviando…]' : '[sending…]') : (es ? '[enviar]' : '[send]'),
      formMsg: !S.formErr ? '' : S.formErr === 'invalid'
        ? (es ? 'completá tu nombre, un e-mail válido y el contexto.' : 'fill in your name, a valid e-mail and the context.')
        : (es ? 'no se pudo enviar. escribime a polettiignacio7@gmail.com' : "couldn't send it. email me at polettiignacio7@gmail.com")
    };
    SERVICES.forEach((_, i) => { V['svcOp' + i] = h === i ? 1 : 0.85; V['svcF' + i] = h === i ? 'blur(.5px)' : 'blur(7px)'; });
    for (let i = 0; i < 20; i++) {
      const lit = S.pct >= (i + 1) * 5;
      V['lbOp' + i] = lit ? 1 : 0.14; V['lbGlow' + i] = '0 0 ' + (lit ? 8 : 0) + 'px rgba(230,43,30,.7)';
    }
    const chips = (p, key, list) => list.forEach((label, i) => {
      const sel = S[key] === label;
      V[p + 'L' + i] = sel ? '[' : ''; V[p + 'R' + i] = sel ? ']' : ''; V[p + 'Op' + i] = sel || !S[key] ? 1 : 0.45;
    });
    chips('t', 'type', TYPES); chips('b', 'budget', BUDGETS);
    return V;
  }

  function render() {
    const V = vals();
    npBind.apply(binds, V);
    const w = S.work || 0;
    for (const box of lists) {
      const mob = box.dataset.list === 'mob', sig = w + '|' + S.lang;
      if (box._sig === sig) continue;
      box._sig = sig;
      [...box.children].forEach((b, i) => {
        b.style.opacity = i === w ? 1 : 0.4;
        b.textContent = (!mob && i === w ? '>> ' : '') + '[' + i + '] ' + P[i].slug;
      });
    }
    window.__npIntroT = S.t || 0;              // the hero skull scatters with the intro
    npCursor.enable(V.cursorOn);
  }

  // project index buttons (desktop jumps to the project, mobile picks it)
  function buildLists() {
    lists = $$('[data-list]');
    for (const box of lists) {
      const mob = box.dataset.list === 'mob';
      box.textContent = ''; box._sig = null;
      P.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'btn';
        b.dataset.act = mob ? 'pickWork' : 'goWork'; b.dataset.i = i;
        b.style.cssText = mob ? 'padding:6px 0;white-space:nowrap' : 'transition:opacity .35s ease;text-align:left;white-space:nowrap';
        box.appendChild(b);
      });
    }
  }

  // ---------------------------------------------------------------- typewriter
  // text nodes under root, counted by their source text so emptied nodes still qualify
  function textNodes(root, keep) {
    if (!root) return [];
    const out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const n = w.currentNode; if (i18n.source(n).trim() && (!keep || keep(n))) out.push(n); }
    return out;
  }
  const blank = n => { i18n.hold(n); n.nodeValue = ''; };
  const restore = n => { i18n.release(n); n.nodeValue = i18n.text(n); };
  // node i starts `delay + i·gap` ms in and types one char every `ch` ms with "_" as caret
  function typeFrame(nodes, el, delay, gap, ch) {
    let busy = false;
    nodes.forEach((n, i) => {
      const txt = i18n.text(n), c = Math.max(0, Math.floor((el - delay - i * gap) / ch));
      const v = c >= txt.length ? txt : txt.slice(0, c) + (c > 0 ? '_' : '');
      if (c < txt.length) { busy = true; i18n.hold(n); } else i18n.release(n);
      if (n.nodeValue !== v) n.nodeValue = v;
    });
    return busy;
  }

  // hero: small texts type in, the big words resolve from goo, then the skull assembles
  let heroDone = false, heroRaf = 0;
  const heroNodes = () => textNodes($('[data-hero-type]'));
  function heroPrep() { S.hgoo = 28; S.hop = 0.2; heroNodes().forEach(blank); }
  function heroReveal() {
    if (heroDone) return;
    heroDone = true;
    const nodes = heroNodes();
    if (scrollY > 5) { set({ hgoo: 0, hop: 1 }); nodes.forEach(restore); window.__npHeroGo = true; return; }
    const t0 = now();
    const step = ts => {
      const el = ts - t0, busy = typeFrame(nodes, el, 80, 22, 9);
      const p = Math.min(1, el / 700), e = out(p);
      set({ hgoo: 28 * (1 - e), hop: 0.2 + 0.8 * Math.min(1, p * 1.4) });
      if (!window.__npHeroGo && el > 380) window.__npHeroGo = true;
      if (busy || p < 1) heroRaf = requestAnimationFrame(step);
      else { set({ hgoo: 0, hop: 1 }); window.__npHeroGo = true; }
    };
    heroRaf = requestAnimationFrame(step);
  }

  // section 2: small texts type like a screen, the central title resolves from gooey blobs
  let s2Raf = 0, s2Going = false, s2Done = false;
  const sec2 = () => document.getElementById('posicion');
  const s2Nodes = () => textNodes(sec2(), n => !n.parentElement.closest('[data-no-type]'));
  function s2Prep() {
    cancelAnimationFrame(s2Raf); s2Going = false; s2Done = false;
    s2Nodes().forEach(blank);
    set({ goo: 28, h2op: 0.2 });
  }
  function s2Reveal() {
    if (s2Going || s2Done) return;
    s2Going = true;
    const nodes = s2Nodes(), t0 = now();
    const step = ts => {
      const el = ts - t0, busy = typeFrame(nodes, el, 80, 22, 9);
      const p = Math.min(1, el / 700), e = out(p);
      set({ goo: 28 * (1 - e), h2op: 0.2 + 0.8 * Math.min(1, p * 1.4) });
      if (busy || p < 1) s2Raf = requestAnimationFrame(step);
      else { s2Going = false; s2Done = true; set({ goo: 0, h2op: 1 }); }
    };
    s2Raf = requestAnimationFrame(step);
  }

  // sobre mí: texts type once on entry
  let sbRaf = 0, sbGoing = false, sbDone = false;
  const sbNodes = () => $$('#sobre [data-sb]').flatMap(r => textNodes(r));
  function sbPrep() { cancelAnimationFrame(sbRaf); sbDone = false; sbGoing = false; sbNodes().forEach(blank); }
  function sbType() {
    if (sbDone || sbGoing) return;
    sbGoing = true;
    const nodes = sbNodes(), t0 = now();
    const step = ts => {
      if (typeFrame(nodes, ts - t0, 120, 30, 7)) sbRaf = requestAnimationFrame(step);
      else { sbGoing = false; sbDone = true; }
    };
    sbRaf = requestAnimationFrame(step);
  }

  // services panel retypes whenever the active service changes (its texts are bound, not static)
  let tpRaf = 0, tpNodes = [];
  function typePanel() {
    const root = $('[data-svc-panel]'); if (!root) return;
    cancelAnimationFrame(tpRaf);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    tpNodes = [];
    while (w.nextNode()) tpNodes.push([w.currentNode, w.currentNode.nodeValue.replace(/_$/, '')]);
    tpNodes.forEach(([n]) => { n.nodeValue = ''; });
    const t0 = now();
    const step = ts => {
      const el = ts - t0; let busy = false;
      tpNodes.forEach(([n, txt], i) => {
        const c = Math.max(0, Math.floor((el - i * 60) / 7));
        const v = c >= txt.length ? txt : txt.slice(0, c) + (c > 0 ? '_' : '');
        if (c < txt.length) busy = true;
        if (n.nodeValue !== v) n.nodeValue = v;
      });
      if (busy) tpRaf = requestAnimationFrame(step);
    };
    tpRaf = requestAnimationFrame(step);
  }
  const finishPanel = () => { cancelAnimationFrame(tpRaf); tpNodes.forEach(([n, txt]) => { n.nodeValue = txt; }); };

  // trabajo: description + stack type in when the project changes
  let wpRaf = 0;
  function typeWork() {
    cancelAnimationFrame(wpRaf);
    const t0 = now();
    set({ wpc: 0 });
    const step = ts => {
      const c = Math.floor((ts - t0) / 7);
      set({ wpc: c });
      if (c < 600) wpRaf = requestAnimationFrame(step); else set({ wpc: null });
    };
    wpRaf = requestAnimationFrame(step);
  }

  // ---------------------------------------------------------------- servicios brackets
  const svcList = () => $('[data-svc-list]');
  function maxBr() {
    const list = svcList(); if (!list) return null;
    const fs = parseFloat(getComputedStyle(list).fontSize) || 100;
    const w = Math.max(...$$('[data-svc]', list).map(s => s.getBoundingClientRect().width));
    return (list.offsetLeft + w + fs * 0.1).toFixed(1) + 'px';
  }
  function measureBr() {
    const list = svcList(); if (!list) return;
    const sp = list.querySelector('[data-svc="' + ((S.hover || 0) + 1) + '"]'); if (!sp) return;
    const fs = parseFloat(getComputedStyle(list).fontSize) || 100;
    const r = (list.offsetLeft + sp.getBoundingClientRect().width + fs * 0.1).toFixed(1) + 'px';
    if (r !== S.brR) set({ brR: r });
  }
  // brackets open to the widest title, then hug the new one
  let lastHover, brT = 0;
  function onHoverChange() {
    const h = S.hover || 0;
    if (lastHover === undefined) { lastHover = h; return; }
    if (lastHover === h) return;
    lastHover = h;
    requestAnimationFrame(typePanel);
    clearTimeout(brT);
    set({ brOpen: true, brR: maxBr() || S.brR });
    brT = setTimeout(() => { measureBr(); set({ brOpen: false }); }, 300);
  }

  // ---------------------------------------------------------------- layouts
  const deskTpl = document.createElement('template');
  deskTpl.content.append(...$$('body > [data-layout]').map(n => n.cloneNode(true)));   // pristine copy for later swaps
  const mobTpl = document.getElementById('tpl-mob');
  let io2 = null, ioSb = null;

  function mount(mob) {
    const old = $$('body > [data-layout]');
    old[0].before((mob ? mobTpl : deskTpl).content.cloneNode(true));
    old.forEach(n => n.remove());
    ready();
  }
  function ready() {
    i18n.apply(document.body);
    binds = npBind.collect(document.body);
    buildLists();
    syncForm();
    for (const f of $$('form')) { f.addEventListener('submit', onSubmit); f.addEventListener('input', onInput); }
    if (!heroDone && scrollY <= 5) heroPrep();
    io2 && io2.disconnect(); ioSb && ioSb.disconnect();
    cancelAnimationFrame(s2Raf); cancelAnimationFrame(sbRaf);
    s2Going = s2Done = sbGoing = sbDone = false;
    io2 = new IntersectionObserver(([en]) => {
      if (en.intersectionRatio >= 0.55) s2Reveal();
      else if (en.intersectionRatio === 0) s2Prep();
    }, { threshold: [0, 0.55] });
    ioSb = new IntersectionObserver(([en]) => {
      if (en.intersectionRatio >= 0.45) sbType();
      else if (en.intersectionRatio === 0 && !sbDone && !sbGoing) sbPrep();
    }, { threshold: [0, 0.45] });
    requestAnimationFrame(() => {
      const s = sec2(); if (s) { if (s.getBoundingClientRect().top > innerHeight) s2Prep(); io2.observe(s); }
      const sb = document.getElementById('sobre'); if (sb) { if (sb.getBoundingClientRect().top > innerHeight) sbPrep(); ioSb.observe(sb); }
      measureBr();
    });
    render();
  }

  addEventListener('resize', () => {
    const m = isMob();
    if (m !== S.mob) { S.mob = m; mount(m); }
    measureBr();
  });

  addEventListener('np-lang', e => {
    finishPanel();
    S.lang = e.detail;
    projects();
    set({});
    requestAnimationFrame(measureBr);
  });

  // ---------------------------------------------------------------- loader & navigation
  let navBusy = false, opening = false;
  // nav links: cover with the loader, jump, reveal — no visible scrolling through sections
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href').slice(1), el = id && document.getElementById(id); if (!el) return;
    e.preventDefault();
    if (navBusy) return;
    navBusy = true;
    cancelAnimationFrame(svRaf); cancelAnimationFrame(introRaf); busy = false;
    set({ loading: true, loadOp: 0, pct: 0 });
    requestAnimationFrame(() => requestAnimationFrame(() => set({ loadOp: 1 })));
    const t0 = now(); let jumped = false;
    const step = ts => {
      const el2 = ts - t0, p = Math.min(1, el2 / 700);
      set({ pct: Math.round(p * 100) });
      if (!jumped && el2 > 260) {
        jumped = true;
        const html = document.documentElement, snap = html.style.scrollSnapType;
        html.style.scrollSnapType = 'none';
        set({ t: id === 'inicio' ? 0 : 1, s2op: 1 });
        scrollTo({ top: id === 'inicio' ? 0 : el.offsetTop, behavior: 'instant' });
        requestAnimationFrame(() => { html.style.scrollSnapType = snap; });
      }
      if (p < 1) { requestAnimationFrame(step); return; }
      setTimeout(() => {
        set({ loadOp: 0 });
        setTimeout(() => { set({ loading: false }); navBusy = false; lock = svLock = now() + 500; }, 240);
      }, 120);
    };
    requestAnimationFrame(step);
  }, true);

  function openProject(href) {
    if (opening) return;
    opening = true;
    set({ loading: true, loadOp: 0, pct: 0 });
    requestAnimationFrame(() => requestAnimationFrame(() => set({ loadOp: 1 })));
    const t0 = now();
    const step = ts => {
      const p = Math.min(1, (ts - t0) / 520);
      set({ pct: Math.round(p * 100) });
      if (p < 1) requestAnimationFrame(step); else location.href = href;
    };
    requestAnimationFrame(step);
  }
  addEventListener('pageshow', e => { if (e.persisted) { opening = false; set({ loading: false }); } });

  // ---------------------------------------------------------------- desktop scroll choreography
  let introRaf = 0, busy = false, lock = 0, svRaf = 0, svLock = 0, tlBusy = false, tlLock = 0;
  const jump = top => scrollTo({ top, behavior: 'instant' });
  function intro(from, to, dur, done) {
    cancelAnimationFrame(introRaf);
    const t0 = now();
    const step = ts => {
      const p = Math.min(1, (ts - t0) / dur);
      set({ t: from + (to - from) * inOut(p) });
      if (p < 1) introRaf = requestAnimationFrame(step); else done && done();
    };
    introRaf = requestAnimationFrame(step);
  }
  // hero ⇄ section 2: the hero layers fly apart instead of scrolling
  function forward() {
    busy = true;
    set({ s2op: 0 });
    intro(0, 1, 950, () => {
      jump(sec2().offsetTop);
      requestAnimationFrame(() => { set({ s2op: 1 }); busy = false; lock = now() + 800; });
    });
  }
  function backward() {
    busy = true;
    set({ s2op: 0 });
    setTimeout(() => {
      set({ t: 1 }); jump(0); set({ s2op: 1 });
      intro(1, 0, 850, () => { busy = false; lock = now() + 800; });
    }, 380);
  }
  function decide(dir, e) {
    if (!on()) return;
    const y = scrollY, s2 = sec2().offsetTop, inZone = y < s2 + 5;
    if (S.loading || busy || now() < lock) { if (inZone && e.cancelable) e.preventDefault(); return; }
    if (dir > 0 && y < 5 && S.t < 0.5) { if (e.cancelable) e.preventDefault(); forward(); }
    else if (dir < 0 && y > s2 * 0.5 && y <= s2 + 5) { if (e.cancelable) e.preventDefault(); backward(); }
  }

  function tweenTo(target, done) {
    cancelAnimationFrame(svRaf);
    const y0 = scrollY, t0 = now(), html = document.documentElement;
    html.style.scrollSnapType = 'none';
    const step = ts => {
      const p = Math.min(1, (ts - t0) / 620);
      scrollTo({ top: Math.round(y0 + (target - y0) * inOut(p)), behavior: 'instant' });
      if (p < 1) svRaf = requestAnimationFrame(step);
      else { scrollTo({ top: target, behavior: 'instant' }); requestAnimationFrame(() => { html.style.scrollSnapType = ''; }); done(); }
    };
    svRaf = requestAnimationFrame(step);
  }
  // the morph canvas is pinned to the viewport while particles travel between sections
  const pinMorph = mo => {
    const r = (mo.parentElement || mo).getBoundingClientRect();
    Object.assign(mo.style, { position: 'fixed', left: '0', top: '0', width: r.width + 'px', height: r.height + 'px' });
  };
  const unpinMorph = mo => Object.assign(mo.style, { position: '', left: '', top: '', width: '100%', height: '100%' });

  // servicios + trabajo: one gesture = one item (and in / out of the sections)
  function stepSvc(dir, e) {
    const sv = document.getElementById('servicios'), s2 = sec2(), tw = document.getElementById('trabajo');
    if (!sv || !s2 || !tw || busy) return false;
    const y = scrollY, h = innerHeight, s0 = sv.offsetTop, t0 = tw.offsetTop;
    const stops = [s2.offsetTop, s0, s0 + h, s0 + 2 * h, s0 + 3 * h];
    P.forEach((_, i) => stops.push(t0 + i * h));
    const LAST = stops.length - 1;
    if (y < stops[0] - 8 || y > stops[LAST] + 8) return false;
    const locked = now() < Math.max(svLock, lock);
    if (!locked && Math.abs(y - stops[0]) < 8 && dir < 0) return false;
    if (!locked && Math.abs(y - stops[LAST]) < 8 && dir > 0) return false;
    if (e.cancelable) e.preventDefault();
    if (locked) return true;
    let n = 0; stops.forEach((v, i) => { if (Math.abs(v - y) < Math.abs(stops[n] - y)) n = i; });
    const target = Math.abs(stops[n] - y) > 8
      ? (dir > 0 ? stops.find(v => v > y + 8) : [...stops].reverse().find(v => v < y - 8))
      : stops[Math.max(0, Math.min(LAST, n + dir))];
    if (target == null) return true;
    svLock = Infinity;
    const sk = $('#servicios np-skull'), mo = $('#trabajo np-morph');
    if (dir > 0 && target === stops[5] && Math.abs(y - stops[4]) < 8) {
      // scrolling down normally; only the skull's particles travel (viewport-fixed) into the first model
      const snap = sk && sk.snap ? sk.snap.slice() : null;
      const go = () => {
        if (snap && mo && mo.fromScreen) { pinMorph(mo); mo.fromScreen(snap, 1700); sk.setAttribute('hide', '1'); }
        tweenTo(target, () => {
          if (mo) { const left = (mo.t0 || 0) + (mo.dur || 0) - now(); if (left > 0) setTimeout(() => unpinMorph(mo), left + 30); else unpinMorph(mo); }
          if (sk) { sk.removeAttribute('hide'); sk.clearNow && sk.clearNow(); }
          svLock = now() + 450;
        });
      };
      if (S.work !== 0) set({ work: 0 }, () => requestAnimationFrame(go)); else go();
      return true;
    }
    if (dir < 0 && target === stops[4] && Math.abs(y - stops[5]) < 8) {
      // reverse: the project's particles flow back up into the skull
      const snap = sk && sk.snap ? sk.snap.slice() : null, snapA = sk && sk.snapA ? sk.snapA.slice() : null, DUR = 1700;
      let ok = false;
      if (snap && mo && mo.toScreen) {
        pinMorph(mo);
        ok = mo.toScreen(snap, DUR, target, snapA);
        if (ok) { sk.setAttribute('hide', '1'); sk.clearNow && sk.clearNow(); sk._noAsmUntil = now() + DUR + 500; }
        else unpinMorph(mo);
      }
      tweenTo(target, () => {
        const fin = () => {
          if (ok) { sk.showNow(); sk.removeAttribute('hide'); unpinMorph(mo); mo.visible = false; }
          svLock = now() + 450;
        };
        const left = ok ? (mo.t0 || 0) + (mo.dur || 0) - now() : 0;
        if (left > 0) setTimeout(fin, left + 30); else fin();
      });
      svLock = Infinity;
      return true;
    }
    tweenTo(target, () => { svLock = now() + 450; });
    return true;
  }
  // sobre → contacto → cierre: one gesture = one section, landing exactly on the title
  function stepTail(dir, e) {
    const sb = document.getElementById('sobre'), ct = document.getElementById('contacto'), ft = $('main > footer');
    if (!sb || !ct || !ft) return false;
    const y = scrollY, stops = [sb.offsetTop, ct.offsetTop, ft.offsetTop];
    if (y < stops[0] - 8 || y > stops[2] + 8) return false;
    if (dir < 0 && Math.abs(y - stops[0]) < 8 && now() > tlLock) return false;
    if (e.cancelable) e.preventDefault();
    if (tlBusy || now() < tlLock) return true;
    const target = dir > 0 ? stops.find(p => p > y + 8) : [...stops].reverse().find(p => p < y - 8);
    if (target == null) return true;
    tlBusy = true;
    tweenTo(target, () => { tlBusy = false; tlLock = now() + 550; });
    return true;
  }
  const gesture = (d, e) => { if (on() && stepSvc(d, e)) return; if (on() && stepTail(d, e)) return; decide(d, e); };
  let touchY = 0;
  addEventListener('wheel', e => {
    if (navBusy) { if (e.cancelable) e.preventDefault(); return; }
    if (Math.abs(e.deltaY) > 2) gesture(Math.sign(e.deltaY), e);
  }, { passive: false });
  addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchmove', e => { const dy = touchY - e.touches[0].clientY; if (Math.abs(dy) > 24) gesture(Math.sign(dy), e); }, { passive: false });
  addEventListener('keydown', e => {
    const down = ['ArrowDown', 'PageDown', ' '].includes(e.key), up = ['ArrowUp', 'PageUp'].includes(e.key);
    if ((down || up) && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) gesture(down ? 1 : -1, e);
  });
  addEventListener('scroll', () => {
    if (!on() || busy) return;
    if (scrollY < 2 && S.t > 0.99) { busy = true; intro(1, 0, 850, () => { busy = false; }); }
    else if (scrollY > innerHeight * 0.9 && S.t < 0.01) set({ t: 1 });
  }, { passive: true });
  // active service / project follow the scroll position inside their pinned sections
  addEventListener('scroll', () => {
    const sv = document.getElementById('servicios');
    if (sv) {
      const idx = Math.max(0, Math.min(3, Math.floor(-sv.getBoundingClientRect().top / innerHeight + 0.4)));
      if (idx !== S.hover) set({ hover: idx });
    }
    if (!on()) return;
    const tw = document.getElementById('trabajo'); if (!tw) return;
    const idx = Math.max(0, Math.min(P.length - 1, Math.floor(-tw.getBoundingClientRect().top / innerHeight + 0.4)));
    if (idx !== S.work) { set({ work: idx }); typeWork(); }
  }, { passive: true });

  // ---------------------------------------------------------------- mobile: one swipe / wheel = one screen
  let mBusy = false, mY = 0, mUsed = false, mWt = 0;
  function mPoints() {
    const H = innerHeight, pts = [];
    $$('main > section, main > footer').forEach(s => {
      const top = s.offsetTop, end = top + s.offsetHeight - H;
      pts.push(top);
      for (let y = top + H * 0.85; y < end - 40; y += H * 0.85) pts.push(Math.round(y));
      if (end > top + 40) pts.push(end);
    });
    const max = document.documentElement.scrollHeight - H;
    return [...new Set(pts.map(p => Math.max(0, Math.min(max, p))))].sort((a, b) => a - b);
  }
  function mGo(dir) {
    if (mBusy || S.loading) return;
    const y = scrollY, tw = $('main #trabajo');
    if (tw && Math.abs(y - tw.offsetTop) < 8) {      // inside trabajo a swipe changes the project first
      const next = (S.work || 0) + dir;
      if (next >= 0 && next < P.length) { mBusy = true; set({ work: next }); setTimeout(() => { mBusy = false; }, 750); return; }
    }
    const pts = mPoints();
    const target = dir > 0 ? pts.find(p => p > y + 4) : [...pts].reverse().find(p => p < y - 4);
    if (target == null) return;
    mBusy = true;
    const html = document.documentElement;
    html.style.scrollSnapType = 'none'; html.style.scrollBehavior = 'auto';
    const y0 = y, t0 = now();
    const step = ts => {
      const p = Math.min(1, (ts - t0) / 560);
      scrollTo(0, Math.round(y0 + (target - y0) * out(p)));
      if (p < 1) requestAnimationFrame(step);
      else { html.style.scrollSnapType = ''; html.style.scrollBehavior = ''; setTimeout(() => { mBusy = false; }, 180); }
    };
    requestAnimationFrame(step);
  }
  const inForm = t => t && t.closest && t.closest('input, textarea, select');
  addEventListener('touchstart', e => { if (isMob()) { mY = e.touches[0].clientY; mUsed = false; } }, { passive: true });
  addEventListener('touchmove', e => {
    if (!isMob() || inForm(e.target)) return;
    if (e.cancelable) e.preventDefault();
    const dy = mY - e.touches[0].clientY;
    if (!mUsed && Math.abs(dy) > 28) { mUsed = true; mGo(dy > 0 ? 1 : -1); }
  }, { passive: false });
  addEventListener('wheel', e => {
    if (!isMob()) return;
    if (e.cancelable) e.preventDefault();
    const t = now(), gap = t - mWt; mWt = t;
    if (gap > 220 && Math.abs(e.deltaY) > 4) mGo(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  // ---------------------------------------------------------------- sobre mí parallax (mouse + scroll)
  let sbMx = 0, sbMy = 0, sbx = 0, sby = 0, sbp = null, sbEls = null;
  addEventListener('mousemove', e => { sbMx = e.clientX / innerWidth * 2 - 1; sbMy = e.clientY / innerHeight * 2 - 1; });
  (function parallax() {
    requestAnimationFrame(parallax);
    const sb = document.getElementById('sobre'); if (!sb) return;
    const r = sb.getBoundingClientRect();
    if (r.bottom < -50 || r.top > innerHeight + 50) { sbp = null; return; }
    if (!sbEls || !sbEls[0] || !sbEls[0][0].isConnected) sbEls = $$('[data-depth]', sb).map(el => { el.style.willChange = 'translate'; return [el, +el.dataset.depth]; });
    const pt = r.top / innerHeight;
    sbp = sbp == null ? pt : sbp + (pt - sbp) * 0.14;
    sbx += (sbMx - sbx) * 0.06; sby += (sbMy - sby) * 0.06;
    for (const [el, d] of sbEls) el.style.translate = (-sbx * d * 22).toFixed(2) + 'px ' + (-sby * d * 16 + sbp * d * 140).toFixed(2) + 'px';
  })();

  // ---------------------------------------------------------------- contact form
  function syncForm() {
    for (const f of $$('form')) { f.elements.name.value = S.name; f.elements.email.value = S.email; f.elements.message.value = S.msg; }
  }
  function onInput(e) {
    const k = { name: 'name', email: 'email', message: 'msg' }[e.target.name];
    if (k) set({ [k]: e.target.value, formErr: null });
  }
  async function onSubmit(e) {
    e.preventDefault();
    if (S.sending) return;
    const form = e.currentTarget;
    const name = S.name.trim(), email = S.email.trim(), msg = S.msg.trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !msg) { set({ formErr: 'invalid' }); return; }
    set({ sending: true, formErr: null });
    try {
      const res = await fetch(FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name, email, tipo: S.type || '—', presupuesto: S.budget ? S.budget + ' usd' : '—', message: msg,
          _honey: form.elements._honey.value,
          _subject: 'Nuevo contacto desde nachopoletti.com — ' + name, _template: 'table', _captcha: 'false'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === 'false') throw new Error(data.message || 'HTTP ' + res.status);
      set({ sending: false, sent: true });
    } catch (err) {
      set({ sending: false, formErr: 'network' });
    }
  }

  // ---------------------------------------------------------------- click actions
  const pick = (key, v) => set({ [key]: S[key] === v ? null : v, formErr: null });
  const ACTIONS = {
    toggleLang: () => i18n.set(S.lang === 'en' ? 'es' : 'en'),
    toggleSignal: () => set({ signal: !S.signal }),
    toggleCursor: () => set({ cursorOn: !S.cursorOn }),
    goSvc: (e, el) => { const sv = document.getElementById('servicios'); if (sv) scrollTo({ top: sv.offsetTop + el.dataset.i * innerHeight, behavior: 'smooth' }); },
    goWork: (e, el) => { const tw = document.getElementById('trabajo'); if (tw) scrollTo({ top: tw.offsetTop + el.dataset.i * innerHeight, behavior: 'smooth' }); },
    pickWork: (e, el) => set({ work: +el.dataset.i }),
    openCur: e => {
      const c = P[S.work || 0];
      if (!c || !c.href || e.metaKey || e.ctrlKey || e.shiftKey) return;   // let the browser open new tabs
      e.preventDefault();
      openProject(c.href);
    },
    pickType: (e, el) => pick('type', el.dataset.v),
    pickBudget: (e, el) => pick('budget', el.dataset.v),
    reset: () => { set({ sent: false, name: '', email: '', msg: '', type: null, budget: null, formErr: null }); syncForm(); }
  };
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[data-act]');
    const f = el && ACTIONS[el.dataset.act];
    if (f) f(e, el);
  });

  // ---------------------------------------------------------------- boot
  // deep links (#trabajo from a project page, a shared #contacto…) jump under the loader;
  // the browser's own fragment scroll is unreliable with the pinned sections and scroll-snap
  const deep = decodeURIComponent(location.hash.slice(1));
  if (deep) history.replaceState(null, '', location.pathname + location.search);
  window.__npHeroGo = false;
  projects();
  if (S.mob) mount(true); else ready();
  const target = deep && document.getElementById(deep);
  if (target && deep !== 'inicio') {
    const html = document.documentElement;
    html.style.scrollSnapType = 'none';
    S.t = 1;
    scrollTo({ top: target.offsetTop, behavior: 'instant' });
    requestAnimationFrame(() => { html.style.scrollSnapType = ''; });
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(measureBr));

  const fmt = tz => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()).toLowerCase();
  const tick = () => set({ ba: fmt('America/Argentina/Buenos_Aires'), local: fmt(undefined) });
  tick(); setInterval(tick, 1000);

  const l0 = now();
  const loader = setInterval(() => {
    const p = Math.min(100, Math.round((now() - l0) / 12));
    set({ pct: p });
    if (p >= 100) {
      clearInterval(loader);
      setTimeout(() => { set({ loading: false }); setTimeout(heroReveal, 250); }, 200);
    }
  }, 30);
})();
