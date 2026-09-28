// Spanish is the source language: pages ship in Spanish and English is applied by swapping
// text nodes (plus placeholder / aria-label) through this dictionary. Text rendered from code
// lives in [data-t] elements, which the page translates itself, so they are skipped here.
(() => {
  const D = {
    'inicializando...': 'initializing...', 'sobre mí': 'about', 'servicios': 'services', 'trabajo': 'work', 'señal': 'signal', 'tu hora:': 'your time:',
    'todo': 'every', 'tiene': 'has', 'más': 'more', 'ca': 'lay', 'pas': 'ers',
    '>> no ejecuto pedidos': ">> i don't take orders", 'no ejecuto pedidos': "i don't take orders", 'entro en la empresa': 'i step into the company', 'entiendo cómo opera': 'understand how it runs', 'y construyo lo que': 'and build what it', 'necesita': 'actually needs',
    'desarrollador': 'software', 'de software': 'developer', '[23] diagnóstico': '[23] diagnosis', 'diagnóstico': 'diagnosis', 'antes de código': 'before code',
    '[2] no soy freelancer': "[2] i'm not a freelancer", 'no soy freelancer': "i'm not a freelancer", 'que ejecuta pedidos': 'who takes orders', '* entro, entiendo': '* i step in, understand', 'entro, entiendo': 'i step in, understand', 'cómo opera': 'how it runs', 'de verdad': 'for real',
    '>> no pedidos': '>> not orders', 'no pedidos': 'not orders', 'sino problemas': 'but problems', 'antes que código': 'before code',
    'no soy un': "i'm not a", 'programador.': 'developer.', 'soy quien resuelve': "i'm the one who solves", 'el problema real.': 'the real problem.',
    'admito lo que': 'i admit what', 'no sé': "i don't know", '>> releases chicas': '>> small releases', 'releases chicas': 'small releases', 'feedback continuo': 'continuous feedback',
    '[1] el truco es no': '[1] the trick is not', 'el truco es no': 'the trick is not', 'quedarse en la': 'to stay on the', 'superficie': 'surface', 'del problema.': 'of the problem.',
    'lo que': 'what i', 'hago': 'do', '[3] lo que hago': '[3] what i do', 'cuatro ejes': 'four axes', 'cuatro ejes ://': 'four axes ://', 'una forma de trabajar': 'one way of working', 'genérico': 'generic',
    'Software': 'Software', 'IA aplicada': 'Applied AI', 'Operaciones': 'Operations', 'Diagnóstico': 'Diagnosis',
    'Sistemas internos, plataformas y dashboards diseñados para cómo opera tu negocio. No plantillas.': 'Internal systems, platforms and dashboards designed around how your business actually runs. No templates.',
    'Integraciones de LLMs y modelos para procesos reales: clasificación, extracción, automatización.': 'LLM and model integrations for real processes: classification, extraction, automation.',
    'Auditoría de procesos + tecnología para eliminar fricción. Menos herramientas, más control.': 'Process audits + technology to remove friction. Fewer tools, more control.',
    'Entro a tu stack, encuentro deuda técnica y propongo un plan de ejecución realista.': 'I dig into your stack, find the technical debt and propose a realistic execution plan.',
    'diagnóstico · automatización · integración': 'diagnosis · automation · integration', 'code review · arquitectura · roadmap': 'code review · architecture · roadmap',
    'no hay proyectos': 'there are no', 'descartables': 'throwaway projects', 'cada pieza': 'every piece', 'define el criterio.': 'defines the standard.', 'trab': 'wo', 'ajo': 'rk', '[ver proyecto]': '[view project]',
    '[5] diagnóstico ://': '[5] diagnosis ://', 'diagnóstico ://': 'diagnosis ://', '+ ejecución': '+ execution', 'tres fases': 'three phases', 'sin atajos.': 'no shortcuts.',
    'mi valor': 'my value', '>> no está': ">> isn't", 'no está': "isn't", 'no está en el código': "isn't in the code", 'en el código': 'in the code',
    'Trabajo con empresas que necesitan tecnología hecha a medida. Empiezo escuchando el problema que me traen, pero casi siempre descubro que hay algo más profundo detrás.': "I work with companies that need custom-built technology. I start by listening to the problem they bring me, but I almost always find something deeper behind it.",
    '** Trabajo con empresas que necesitan tecnología hecha a medida. Empiezo escuchando el problema que me traen, pero casi siempre descubro que hay algo más profundo detrás.': "** I work with companies that need custom-built technology. I start by listening to the problem they bring me, but I almost always find something deeper behind it.",
    'Está en que entro, entiendo cómo funciona el negocio y construyo lo que necesitan — no lo que pidieron.': "It's in stepping in, understanding how the business works and building what they need — not what they asked for.",
    'años': 'years', 'proyectos': 'projects', 'diagnóstico primero': 'diagnosis first', 'industrias': 'industries',
    'Diseño': 'Design', 'Ejecución': 'Execution', '1—2 sem': '1—2 wks', '2—4 sem': '2—4 wks', '4—12 sem': '4—12 wks',
    'Entro a operar con vos. Mapeo procesos, entrevisto a tu equipo, encuentro el problema real debajo del pedido.': 'I work inside your operation. I map processes, interview your team and find the real problem under the request.',
    'Arquitectura, stack, cronograma. Definimos qué construir y qué NO construir. El 80% del valor es decidir bien acá.': "Architecture, stack, timeline. We define what to build and what NOT to build. 80% of the value is deciding well here.",
    'Releases chicas y feedback continuo. Nada de cajas negras de 6 meses. Ves progreso cada semana.': 'Small releases and continuous feedback. No 6-month black boxes. You see progress every week.',
    'no ejecuto': "i don't take", 'pedidos.': 'orders.', 'resuelvo': 'i solve', 'problemas.': 'problems.',
    'respondo en 48 h': 'i reply within 48 h', 'por e-mail': 'by e-mail', 'respondo en 48 h por e-mail': 'i reply within 48 h by e-mail',
    '? cómo te llamás': "? what's your name", '? tenés un e*(mail)': '? got an e*(mail)', '? qué hay que resolver': '? what needs solving', '? presupuesto(usd)': '? budget(usd)',
    '? contame el contexto real — no solo el feature': '? tell me the real context — not just the feature', 'ia': 'ai', 'operaciones': 'operations',
    '[enviar]': '[send]', 'respuesta() {': 'response() {', 'recibido': 'received', '[volver]': '[back]', '[volver arriba]': '[back to top]', 'créditos ://': 'credits ://', 'diseño inspirado en ://project-cult': 'design inspired by ://project-cult',
    'Leo cada mensaje. Si hay un problema real para resolver, te escribo con los próximos pasos.': "I read every message. If there's a real problem to solve, I'll write back with next steps.",
    '://nombre': '://name', '://contexto': '://context', 'Todo problema tiene más capas': 'Every problem has more layers'
  };
  const KEY = 'np-lang', ATTRS = ['placeholder', 'aria-label'];
  let lang = 'es';
  try { lang = localStorage.getItem(KEY) === 'en' ? 'en' : 'es'; } catch (e) {}

  const src = new WeakMap();    // text node → its Spanish source
  const held = new WeakSet();   // text nodes a typing animation is driving right now

  // translate a Spanish string into the current language (keeps surrounding whitespace)
  const tr = s => {
    if (lang !== 'en' || s == null) return s;
    const v = String(s), k = v.trim(), t = D[k];
    return t ? v.replace(k, t) : v;
  };
  const source = n => { if (!src.has(n)) src.set(n, n.nodeValue); return src.get(n); };
  const text = n => tr(source(n));

  const SKIP = 'script,style,template,[data-t],[data-i18n-skip]';
  const visit = n => {
    if (n.nodeType === 3) {
      if (held.has(n) || !n.parentElement || n.parentElement.closest(SKIP)) return;
      if (!source(n).trim()) return;
      const want = text(n);
      if (n.nodeValue !== want) n.nodeValue = want;
    } else if (n.nodeType === 1) {
      for (const a of ATTRS) {
        const k = 'data-src-' + a;
        if (!n.hasAttribute(k)) { if (!n.hasAttribute(a)) continue; n.setAttribute(k, n.getAttribute(a)); }
        const want = tr(n.getAttribute(k));
        if (n.getAttribute(a) !== want) n.setAttribute(a, want);
      }
    }
  };
  // bring every text node under root to the current language (and remember its source)
  function apply(root = document.body) {
    visit(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: n => n.nodeType === 1 && /^(SCRIPT|STYLE|TEMPLATE)$/.test(n.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    while (w.nextNode()) visit(w.currentNode);
  }

  function set(l) {
    l = l === 'en' ? 'en' : 'es';
    if (l === lang) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    document.documentElement.lang = l;
    apply(document.body);
    window.dispatchEvent(new CustomEvent('np-lang', { detail: l }));
  }

  document.documentElement.lang = lang;
  window.npI18n = {
    get: () => lang, set, tr, apply,
    source,                                   // Spanish text of a node
    text,                                     // what a node should read in the current language
    hold: n => { source(n); held.add(n); },   // typing animations own these nodes until released
    release: n => held.delete(n)
  };
})();
