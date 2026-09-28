// <np-morph model="key"> — red pixel point-cloud of window.NP_MODELS[key]; particles morph between models.
(() => {
  if (customElements.get('np-morph')) return;
  const RED = '230,43,30';
  const dec = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; };
  const cache = {};
  const MODEL_VIEW = { taliya: { d: 0.5, a: 0.18, g: 1.3, s: 1.3 }, spikit: { d: 0.5, a: 0.18, g: 1.3, s: 1.3 }, vintage: { d: 0.5, a: 0.18, g: 1.3, s: 1.3 }, brain: { yaw: 1.35, sway: 0.45, pitch: 0.06, s: 1.35, d: 0.6, a: 0.18, g: 1.25 }, core: { d: 0.6, a: 0.18, g: 1.25 }, van: { yaw: 0.95, sway: 0.25, pitch: 0.2, s: 1.55, d: 0.5, a: 0.24, g: 1.3 }, phone: { yaw: 0.6, sway: 0.4, pitch: 0.38, s: 1.35, g: 1.5, d: 0.5, a: 0.24 }, clinic: { s: 1.4, g: 1.55, d: 0.5, a: 0.24 } };
  const getModel = k => {
    if (cache[k]) return cache[k];
    const D = window.NP_MODELS && window.NP_MODELS[k]; if (!D) return null;
    const P = new Int16Array(dec(D.p)), Nn = new Int8Array(dec(D.nrm)), n = D.n;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) { pos[i] = P[i] / D.scale; nor[i] = Nn[i] / 127; }
    const vs = MODEL_VIEW[k] && MODEL_VIEW[k].s; if (vs) for (let i = 0; i < n * 3; i++) pos[i] *= vs;
    // per-model orientation fix: rz = roll about z (radians), rx = about x
    const fix = (window.NP_MODEL_FIX || {})[k];
    if (fix) {
      const rot = (arr, i, ax, ang) => { const c = Math.cos(ang), s = Math.sin(ang), a = arr[i], b = arr[i + 1], d = arr[i + 2];
        if (ax === 'z') { arr[i] = a * c - b * s; arr[i + 1] = a * s + b * c; } else if (ax === 'x') { arr[i + 1] = b * c - d * s; arr[i + 2] = b * s + d * c; } else { arr[i] = a * c + d * s; arr[i + 2] = -a * s + d * c; } };
      for (let i = 0; i < n; i++) for (const [ax, ang] of fix) { rot(pos, i * 3, ax, ang); rot(nor, i * 3, ax, ang); }
    }
    // align every model's projected bottom (under the fixed camera pitch, over a full turn) to the house's
    const cam = 3.4, cp = Math.cos(0.28), sp = Math.sin(0.28);
    const bottom = (arr, cnt, dy) => {
      let b = -1e9;
      for (let a = 0; a < 12; a++) {
        const yw = a / 12 * Math.PI * 2, cy = Math.cos(yw), sy = Math.sin(yw);
        for (let i = 0; i < cnt; i += 4) {
          const x = arr[i * 3], y = arr[i * 3 + 1] + dy, z = arr[i * 3 + 2];
          const z1 = -x * sy + z * cy, y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
          const v = -y2 / (cam - z2); if (v > b) b = v;
        }
      }
      return b;
    };
    if (k === 'core') cache._coreBottom = bottom(pos, n, 0);
    else {
      if (cache._coreBottom == null) getModel('core');
      const bT = cache._coreBottom != null ? cache._coreBottom - 0.05 : null;
      if (bT != null) {
        let dy = 0;
        for (let it = 0; it < 6; it++) dy += (bottom(pos, n, dy) - bT) / 0.3;
        for (let i = 0; i < n; i++) pos[i * 3 + 1] += dy;
      }
    }
    // shuffle so index-matched morphs look organic
    for (let i = n - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; for (let c = 0; c < 3; c++) { let t = pos[i * 3 + c]; pos[i * 3 + c] = pos[j * 3 + c]; pos[j * 3 + c] = t; t = nor[i * 3 + c]; nor[i * 3 + c] = nor[j * 3 + c]; nor[j * 3 + c] = t; } }
    return (cache[k] = { n, pos, nor });
  };
  const dataReady = new Promise(res => {
    if (window.NP_MODELS) return res();
    const src = document.currentScript && document.currentScript.src ? new URL('models-data.js?v=12', document.currentScript.src).href : 'models-data.js?v=12';
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = res; document.head.appendChild(s);
  });
  class NpMorph extends HTMLElement {
    connectedCallback() {
      this.style.display = 'block'; this.style.width = '100%'; this.style.height = '100%';
      this.cv = document.createElement('canvas');
      this.cv.style.cssText = 'width:100%;height:100%;display:block;filter:drop-shadow(0 0 5px rgba(230,43,30,.55))';
      this.appendChild(this.cv); this.ctx = this.cv.getContext('2d');
      this.N = 18000;
      this.cur = new Float32Array(this.N * 3); this.curN = new Float32Array(this.N * 3);
      this.from = new Float32Array(this.N * 3);
      this.rnd = new Float32Array(this.N * 4);
      for (let i = 0; i < this.N; i++) { const a = Math.random() * 6.283, b = Math.acos(Math.random() * 2 - 1); this.rnd[i * 4] = Math.sin(b) * Math.cos(a); this.rnd[i * 4 + 1] = Math.cos(b); this.rnd[i * 4 + 2] = Math.sin(b) * Math.sin(a); this.rnd[i * 4 + 3] = Math.random(); }
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this); this.resize();
      this.io = new IntersectionObserver(([en]) => {
        const was = this.visible; this.visible = en.isIntersecting;
        if (this.visible && !was && !this._seen) { this._seen = true; this.assemble(); }
      }, { threshold: 0.15 }); this.io.observe(this);
      dataReady.then(() => { this.ready = true; if (!this.target) { const hold = this._holdAsm; this._holdAsm = 0; this.assemble(); this._holdAsm = hold; if (!this.visible) this.t0 = -1e9; } });
      const loop = now => { this.raf = requestAnimationFrame(loop); if (this.visible && this.ready) this.draw(now); };
      this.raf = requestAnimationFrame(loop);
    }
    disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); this.io && this.io.disconnect(); }
    resize() { const r = this.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); this.dpr = d; this.cv.width = Math.max(1, Math.round(r.width * d)); this.cv.height = Math.max(1, Math.round(r.height * d)); }
    // start from a scattered cloud around the target model
    assemble() {
      if (performance.now() < (this._holdAsm || 0)) return;
      const m = getModel(this.getAttribute('model')); if (!m) return;
      this.key = this.getAttribute('model');
      for (let i = 0; i < this.N; i++) { const j = i % m.n; for (let c = 0; c < 3; c++) this.from[i * 3 + c] = m.pos[j * 3 + c] + this.rnd[i * 4 + c] * 2.6; }
      this.wd = null; this.fz = null; this.syT = null; this.key = this.getAttribute('model'); this.target = m; this.t0 = performance.now(); this.dur = 1100; this.fly = 0.4;
    }
    _proj() {
      const key = this.key || this.getAttribute('model'), now = performance.now(), W = this.cv.width, H = this.cv.height;
      const vw = (window.NP_MODEL_VIEW || {})[key] || MODEL_VIEW[key];
      const Y = this.fz ? this.fz.yaw : (vw && vw.yaw != null ? vw.yaw + Math.sin(now * 0.0004) * vw.sway : now * 0.00022 + 0.5), Pt = this.fz ? this.fz.pitch : (vw && vw.pitch != null ? vw.pitch : 0.28);
      const rw = +(this.getAttribute('refw') || 1), rh = +(this.getAttribute('refh') || 1);
      return { Y, Pt, CX: W * +(this.getAttribute('cx') || 0.5), CY: H * +(this.getAttribute('cy') || 0.5), S: Math.min(W * rw, H * rh) * (+(this.getAttribute('scale') || 0.9)), cam: 3.4 };
    }
    // reverse: fly current particles into viewport-space points (e.g. the skull), riding with the page toward scroll position syT
    toScreen(pts, dur, syT, alpha) {
      if (!this.target || !pts || !pts.length) return false;
      this.resize();
      const r = this.getBoundingClientRect(), d = this.dpr, now = performance.now();
      const P = this._proj(); this.fz = { yaw: P.Y, pitch: P.Pt };
      const cy = Math.cos(P.Y), sy = Math.sin(P.Y), cp = Math.cos(P.Pt), sp = Math.sin(P.Pt), cnt = pts.length / 2;
      this.from.set(this.cur);
      const pos = new Float32Array(this.N * 3), nor = new Float32Array(this.N * 3), al = alpha ? new Float32Array(this.N) : null;
      // visible skull points first, so every lit cell of the final skull gets a particle
      let vis = null; if (alpha) { vis = []; for (let k = 0; k < alpha.length; k++) if (alpha[k] > 0.02) vis.push(k); if (!vis.length) vis = null; }
      for (let i = 0; i < this.N; i++) {
        const s = (vis ? vis[i % vis.length] : Math.floor(i * cnt / this.N)) * 2, z2 = this.rnd[i * 4 + 2] * 0.25, kk = P.S / (P.cam - z2) * 0.9;
        if (al) al[i] = alpha[s >> 1];
        const x1 = ((pts[s] - r.left) * d - P.CX) / kk, y2 = (P.CY - (pts[s + 1] - r.top) * d) / kk;
        const y = y2 * cp + z2 * sp, z1 = -y2 * sp + z2 * cp;
        pos[i * 3] = x1 * cy - z1 * sy; pos[i * 3 + 1] = y; pos[i * 3 + 2] = x1 * sy + z1 * cy;
        const ny = sp, nz1 = cp; nor[i * 3] = -nz1 * sy; nor[i * 3 + 1] = ny; nor[i * 3 + 2] = nz1 * cy;
      }
      let mn = 1e9, mx = -1e9; for (let i = 0; i < this.N; i++) { const v = this.from[i * 3]; if (v < mn) mn = v; if (v > mx) mx = v; }
      this.wd = new Float32Array(this.N); for (let i = 0; i < this.N; i++) this.wd[i] = 1 - (this.from[i * 3] - mn) / ((mx - mn) || 1);
      this.sy0 = window.scrollY; this.syT = syT; this.kk0 = P.S / P.cam * 0.9;
      this.target = { n: this.N, pos, nor, al }; this.vFrom = null; this.t0 = now; this.dur = dur || 1600; this.fly = 0.1;
      this.visible = true; this._holdAsm = now + (dur || 1600) + 400;
      return true;
    }
    // take over particles from viewport-space points (e.g. another canvas) and fly them into the model
    fromScreen(pts, dur) {
      const key = this.getAttribute('model'), m = getModel(key); if (!m || !pts || !pts.length) return false;
      this.resize();
      const r = this.getBoundingClientRect(), d = this.dpr, W = this.cv.width, H = this.cv.height, now = performance.now();
      const vw = (window.NP_MODEL_VIEW || {})[key] || MODEL_VIEW[key];
      const Y = vw && vw.yaw != null ? vw.yaw + Math.sin(now * 0.0004) * vw.sway : now * 0.00022 + 0.5, Pt = vw && vw.pitch != null ? vw.pitch : 0.28;
      const cy = Math.cos(Y), sy = Math.sin(Y), cp = Math.cos(Pt), sp = Math.sin(Pt);
      const rw = +(this.getAttribute('refw') || 1), rh = +(this.getAttribute('refh') || 1), CX = W * +(this.getAttribute('cx') || 0.5), CY = H * +(this.getAttribute('cy') || 0.5);
      const S = Math.min(W * rw, H * rh) * (+(this.getAttribute('scale') || 0.9)), cam = 3.4, cnt = pts.length / 2;
      for (let i = 0; i < this.N; i++) {
        const s = Math.floor(i * cnt / this.N) * 2, z2 = (this.rnd[i * 4 + 2]) * 0.25, kk = S / (cam - z2) * 0.9;
        const x1 = ((pts[s] - r.left) * d - CX) / kk, y2 = (CY - (pts[s + 1] - r.top) * d) / kk;
        const y = y2 * cp + z2 * sp, z1 = -y2 * sp + z2 * cp;
        this.from[i * 3] = x1 * cy - z1 * sy; this.from[i * 3 + 1] = y; this.from[i * 3 + 2] = x1 * sy + z1 * cy;
      }
      let mn = 1e9, mx = -1e9; for (let i = 0; i < this.N; i++) { const v = this.from[i * 3]; if (v < mn) mn = v; if (v > mx) mx = v; }
      this.sy0 = window.scrollY; this.syT = null; this.fz = null; this.kk0 = S / cam * 0.9;
      this.wd = new Float32Array(this.N); for (let i = 0; i < this.N; i++) this.wd[i] = (this.from[i * 3] - mn) / ((mx - mn) || 1);
      this.key = key; this.target = m; this.vFrom = null; this.t0 = now; this.dur = dur || 1600; this.fly = 0.1;
      this.visible = true; this._seen = true; this._holdAsm = now + 700;
      return true;
    }
    morphTo(key) {
      const m = getModel(key); if (!m) return;
      this.wd = null; this.fz = null; this.syT = null; this.from.set(this.cur); this.vFrom = this.lastView ? { ...this.lastView } : null; this.key = key; this.target = m; this.t0 = performance.now(); this.dur = 1000; this.fly = 1.2;
    }
    draw(now) {
      const k = this.getAttribute('model');
      if (k && k !== this.key) { if (this.target) this.morphTo(k); else this.assemble(); }
      const m = this.target; if (!m) return;
      const { ctx, cv, dpr, N } = this, W = cv.width, H = cv.height;
      const T = Math.min(1, (now - this.t0) / this.dur), moving = T < 1;
      const eio0 = q => q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
      const vw = (window.NP_MODEL_VIEW || {})[this.key] || MODEL_VIEW[this.key];
      const gain = (vw && vw.g) || 1;
      const yaw = vw && vw.yaw != null ? vw.yaw + Math.sin(now * 0.0004) * vw.sway : now * 0.00022 + 0.5, pitch = vw && vw.pitch != null ? vw.pitch : 0.28;
      let Y = this.fz ? this.fz.yaw : yaw, Pt = this.fz ? this.fz.pitch : pitch, G = gain;
      if (moving && this.vFrom) {
        const e = eio0(T); let d = ((yaw - this.vFrom.yaw) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        Y = this.vFrom.yaw + d * e; Pt = this.vFrom.pitch + (pitch - this.vFrom.pitch) * e; G = this.vFrom.gain + (gain - this.vFrom.gain) * e;
      } else if (!moving) this.vFrom = null;
      this.lastView = { yaw: Y, pitch: Pt, gain: G };
      const cy = Math.cos(Y), sy = Math.sin(Y), cp = Math.cos(Pt), sp = Math.sin(Pt);
      const rw = +(this.getAttribute('refw') || 1), rh = +(this.getAttribute('refh') || 1), CX = W * +(this.getAttribute('cx') || 0.5), CY = H * +(this.getAttribute('cy') || 0.5);
      const S = Math.min(W * rw, H * rh) * (+(this.getAttribute('scale') || 0.9)), cam = 3.4;
      const grid = Math.max(2, Math.round(2.5 * dpr)), px = Math.max(1, Math.round(2 * dpr));
      const gw = Math.ceil(W / grid) + 1, gh = Math.ceil(H / grid) + 1, n = gw * gh;
      if (!this.zb || this.zb.length !== n) { this.zb = new Float32Array(n); this.ab = new Float32Array(n); }
      const zb = this.zb, ab = this.ab; zb.fill(-1e9); ab.fill(0);
      const eio = q => q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
      // particles not yet departed ride up with the page (they belong to the section being scrolled away)
      const sh = moving && this.wd && this.sy0 != null ? (window.scrollY - this.sy0) * dpr / this.kk0 : 0;
      const Vx = sh * sp * sy, Vy = sh * cp, Vz = -sh * sp * cy;
      const shT = moving && this.wd && this.syT != null ? (window.scrollY - this.syT) * dpr / this.kk0 : 0;
      const Tx = shT * sp * sy, Ty = shT * cp, Tz = -shT * sp * cy;
      for (let i = 0; i < N; i++) {
        const j = i % m.n, i3 = i * 3, j3 = j * 3;
        let q = 1, fl = 0;
        if (moving) {
          if (this.wd) q = eio(Math.max(0, Math.min(1, (T - this.wd[i] * 0.38 - this.rnd[i * 4 + 3] * 0.08) / 0.54)));
          else q = eio(Math.max(0, Math.min(1, (T - this.rnd[i * 4 + 3] * 0.35) / 0.65)));
          fl = Math.sin(Math.PI * q) * this.fly;
        }
        let x = this.from[i3] + (m.pos[j3] - this.from[i3]) * q + this.rnd[i * 4] * fl;
        let y = this.from[i3 + 1] + (m.pos[j3 + 1] - this.from[i3 + 1]) * q + this.rnd[i * 4 + 1] * fl;
        let z = this.from[i3 + 2] + (m.pos[j3 + 2] - this.from[i3 + 2]) * q + this.rnd[i * 4 + 2] * fl;
        if (sh) { const r = 1 - q; x += Vx * r; y += Vy * r; z += Vz * r; }
        if (shT) { x += Tx * q; y += Ty * q; z += Tz * q; }
        if (moving && this.wd) {
          // dissolve the source shape at once, then travel as a wave front
          const sc = Math.min(1, T / 0.1) * (1 - q * q), env = Math.sin(Math.PI * q);
          x += this.rnd[i * 4] * 0.45 * sc; z += this.rnd[i * 4 + 2] * 0.45 * sc;
          y += this.rnd[i * 4 + 1] * 0.2 * sc + (0.18 * sc + 0.32 * env) * Math.sin(q * Math.PI * 2.5 + this.wd[i] * 10);
        }
        this.cur[i3] = x; this.cur[i3 + 1] = y; this.cur[i3 + 2] = z;
        const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        const kk = S / (cam - z2) * 0.9;
        const gx = Math.round((CX + x1 * kk) / grid), gy = Math.round((CY - y2 * kk) / grid);
        if (gx < 0 || gy < 0 || gx >= gw || gy >= gh) continue;
        const c = gy * gw + gx;
        const landed = !moving || q > 0.97;
        if (m.al && landed && m.al[j] <= 0.02) continue;
        if (landed && z2 <= zb[c] && !m.al) continue;
        const nx = m.nor[j3], ny = m.nor[j3 + 1], nz = m.nor[j3 + 2];
        const nx1 = nx * cy + nz * sy, nz1 = -nx * sy + nz * cy, ny2 = ny * cp - nz1 * sp, nz2 = ny * sp + nz1 * cp;
        const sg = nz2 < 0 ? -1 : 1, lit = Math.max(0, Math.abs(nz2) * 0.75 + sg * ny2 * 0.3 - sg * nx1 * 0.12);
        const dep = Math.max(0, Math.min(1, (z2 + 0.9) / 1.9));
        zb[c] = z2;
        const vwk = MODEL_VIEW[this.key] || {}, dS = vwk.d != null ? vwk.d : 1, amb = vwk.a != null ? vwk.a : 0.06;
        const shaded = Math.min(1, (amb + (1 - amb) * Math.pow(lit, 1.3)) * (1 - dS * (1 - dep * dep)) * 1.7 * G * (dS < 1 ? 0.75 : 1));
        const shd = m.al ? m.al[j] : shaded;
        if (!moving) ab[c] = m.al ? Math.max(ab[c], shd) : shd;
        else { const w = q * q * (3 - 2 * q), flyA = 0.22 + 0.18 * dep; const v = flyA + (shd - flyA) * w; ab[c] = landed && !m.al ? v : Math.max(ab[c], v); }
      }
      ctx.clearRect(0, 0, W, H);
      for (let c = 0; c < n; c++) { const al = ab[c]; if (al < 0.02) continue; ctx.fillStyle = 'rgba(' + RED + ',' + Math.min(1, al).toFixed(3) + ')'; ctx.fillRect((c % gw) * grid, ((c / gw) | 0) * grid, px, px); }
    }
  }
  customElements.define('np-morph', NpMorph);
})();
