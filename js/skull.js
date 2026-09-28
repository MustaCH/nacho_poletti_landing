// <np-skull> — procedural point-cloud skull on a 2D canvas (no deps).
// Follows the cursor; scatters with window.__npIntroT (0..1) from the hero exit animation.
(() => {
  if (customElements.get('np-skull')) return;
  const RED = [230, 43, 30];
  const len = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
  const ell = (x, y, z, cx, cy, cz, rx, ry, rz) => {
    x -= cx; y -= cy; z -= cz;
    const k0 = len(x / rx, y / ry, z / rz), k1 = len(x / (rx * rx), y / (ry * ry), z / (rz * rz));
    return k1 === 0 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1;
  };
  const rbox = (x, y, z, cx, cy, cz, bx, by, bz, r) => {
    const qx = Math.abs(x - cx) - bx, qy = Math.abs(y - cy) - by, qz = Math.abs(z - cz) - bz;
    return len(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
  };
  const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
  const ssub = (base, cut, k) => -smin(-base, cut, k);
  const sdf = (x, y, z, baseOnly) => {
    const ax = Math.abs(x);
    let d = ell(x, y, z, 0, 0.28, -0.12, 0.8, 0.82, 0.98);                         // cranium
    d = smin(d, rbox(x, y, z, 0, -0.32, 0.34, 0.38, 0.3, 0.32, 0.1), 0.3);        // maxilla / face
    d = smin(d, ell(ax, y, z, 0.46, -0.18, 0.3, 0.2, 0.14, 0.26), 0.12);           // cheekbones
    d = smin(d, rbox(x, y, z, 0, -0.8, 0.26, 0.3, 0.12, 0.3, 0.07), 0.14);        // mandible
    d = smin(d, rbox(ax, y, z, 0.38, -0.58, 0.0, 0.07, 0.26, 0.14, 0.04), 0.12);   // rami
    d = ssub(d, ell(ax, y, z, 0.86, 0.02, 0.08, 0.2, 0.32, 0.34), 0.12);           // temples
    if (baseOnly) return d;
    d = ssub(d, ell(ax, y, z, 0.25, -0.06, 0.66, 0.17, 0.15, 0.22), 0.06);         // eye sockets
    d = ssub(d, ell(x, y, z, 0, -0.33, 0.7, 0.07, 0.13, 0.2), 0.04);               // nasal cavity
    d = ssub(d, rbox(x, y, z, 0, -0.63, 0.6, 0.3, 0.018, 0.22, 0), 0.02);          // mouth line
    for (let tx = -0.24; tx <= 0.2401; tx += 0.08) d = Math.max(d, -rbox(x, y, z, tx, -0.63, 0.64, 0.006, 0.1, 0.1, 0)); // teeth gaps
    return d;
  };
  const build = n => {
    const pts = [];
    let guard = 0;
    while (pts.length < n && guard++ < n * 400) {
      let x = (Math.random() * 2 - 1) * 1.0, y = Math.random() * 2.2 - 1.1, z = (Math.random() * 2 - 1) * 1.15;
      let d = sdf(x, y, z);
      if (Math.abs(d) > 0.12) continue;
      for (let it = 0; it < 3; it++) {
        const e = 0.004;
        const gx = sdf(x + e, y, z) - sdf(x - e, y, z), gy = sdf(x, y + e, z) - sdf(x, y - e, z), gz = sdf(x, y, z + e) - sdf(x, y, z - e);
        const gl = len(gx, gy, gz) || 1;
        x -= gx / gl * d; y -= gy / gl * d; z -= gz / gl * d;
        d = sdf(x, y, z);
      }
      if (Math.abs(d) > 0.006) continue;
      const cav = sdf(x, y, z, true) < -0.025 ? 0.12 : 1;
      const e2 = 0.004;
      let nx = sdf(x + e2, y, z) - sdf(x - e2, y, z), ny = sdf(x, y + e2, z) - sdf(x, y - e2, z), nz = sdf(x, y, z + e2) - sdf(x, y, z - e2);
      const nl = len(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
      const a = Math.random() * Math.PI * 2, b = Math.acos(Math.random() * 2 - 1);
      pts.push({ x, y, z, dx: Math.sin(b) * Math.cos(a) + x * 0.6, dy: Math.cos(b) + y * 0.6, dz: Math.sin(b) * Math.sin(a) + z * 0.6, s: 0.6 + Math.random() * 0.8, dl: Math.random() * 0.4, nx, ny, nz, cav });
    }
    return pts;
  };
  const fromData = D => {
    const dec = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u.buffer; };
    const P = new Int16Array(dec(D.p)), Nn = new Int8Array(dec(D.nrm)), pts = [];
    let out = 0;
    for (let k = 0; k < D.n; k++) {
      const x = P[k * 3] / D.scale, y = P[k * 3 + 1] / D.scale, z = P[k * 3 + 2] / D.scale;
      const nx = Nn[k * 3] / 127, ny = Nn[k * 3 + 1] / 127, nz = Nn[k * 3 + 2] / 127;
      out += nx * x + ny * y + nz * z;
      const a = Math.random() * Math.PI * 2, b = Math.acos(Math.random() * 2 - 1);
      pts.push({ x, y, z, nx, ny, nz, cav: 1, s: 0.6 + Math.random() * 0.8, dl: Math.random() * 0.4, dx: Math.sin(b) * Math.cos(a) + x * 0.6, dy: Math.cos(b) + y * 0.6, dz: Math.sin(b) * Math.sin(a) + z * 0.6 });
    }
    if (out < 0) pts.forEach(p => { p.nx = -p.nx; p.ny = -p.ny; p.nz = -p.nz; });
    // auto-orient: the face/jaw sits forward of the cranium in the lower half — rotate it to +z (toward viewer)
    let ax = 0, az = 0, lx = 0, lz = 0, ln = 0;
    pts.forEach(p => { ax += p.x; az += p.z; if (p.y < -0.3) { lx += p.x; lz += p.z; ln++; } });
    if (ln) {
      const fx = lx / ln - ax / pts.length, fz = lz / ln - az / pts.length, ang = Math.atan2(fx, fz), c = Math.cos(-ang), s = Math.sin(-ang);
      pts.forEach(p => {
        const x = p.x * c + p.z * s, z = -p.x * s + p.z * c; p.x = x; p.z = z;
        const nx = p.nx * c + p.nz * s, nz = -p.nx * s + p.nz * c; p.nx = nx; p.nz = nz;
        const dx = p.dx * c + p.dz * s, dz = -p.dx * s + p.dz * c; p.dx = dx; p.dz = dz;
      });
    }
    // cavity shading: compare each point's radius to the max radius of its angular neighbourhood
    const BU = 64, BV = 32, R = new Float32Array(BU * BV), bin = p => {
      const r = len(p.x, p.y, p.z) || 1e-6;
      const u = Math.floor((Math.atan2(p.z, p.x) / (2 * Math.PI) + 0.5) * BU) % BU, v = Math.min(BV - 1, Math.floor(Math.acos(Math.max(-1, Math.min(1, p.y / r))) / Math.PI * BV));
      return [u, v, r];
    };
    pts.forEach(p => { const [u, v, r] = bin(p); p._u = u; p._v = v; p._r = r; if (r > R[v * BU + u]) R[v * BU + u] = r; });
    const D2 = new Float32Array(BU * BV), K = 3;
    for (let v = 0; v < BV; v++) for (let u = 0; u < BU; u++) {
      let m = 0; for (let dv = -K; dv <= K; dv++) { const vv = v + dv; if (vv < 0 || vv >= BV) continue; for (let du = -K; du <= K; du++) m = Math.max(m, R[vv * BU + ((u + du + BU) % BU)]); }
      D2[v * BU + u] = m;
    }
    pts.forEach(p => { p.cav = 1; });
    return pts;
  };
  const dataReady = new Promise(res => {
    if (window.NP_SKULL) return res(window.NP_SKULL);
    const src = (document.currentScript && document.currentScript.src) ? new URL('skull-data.js?v=5', document.currentScript.src).href : 'skull-data.js?v=5';
    const s = document.createElement('script'); s.src = src; s.onload = () => res(window.NP_SKULL); s.onerror = () => res(null); document.head.appendChild(s);
  });
  class NpSkull extends HTMLElement {
    connectedCallback() {
      this.style.display = 'block'; this.style.width = '100%'; this.style.height = '100%';
      this.cv = document.createElement('canvas');
      this.cv.style.cssText = 'width:100%;height:100%;display:block;filter:drop-shadow(0 0 5px rgba(230,43,30,.55))';
      this.appendChild(this.cv);
      this.ctx = this.cv.getContext('2d');
      this.pts = [];
      dataReady.then(D => { this.pts = D ? fromData(D) : build(+(this.getAttribute('points') || 14000)); });
      this.mx = 0; this.my = 0; this.yaw = 0; this.pitch = 0;
      this.onMove = e => { this.mx = e.clientX / innerWidth * 2 - 1; this.my = e.clientY / innerHeight * 2 - 1; };
      addEventListener('mousemove', this.onMove);
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this); this.resize();
      this.localT = this.hasAttribute('assemble') ? 1 : 0;
      this.io = new IntersectionObserver(([en]) => {
        const was = this.visible; this.visible = en.isIntersecting;
        const firstIo = !this._ioSeen;
        if ((this.hasAttribute('lookup') || this.hasAttribute('look-up')) && this.visible && (!was || !this._ioSeen)) { this._upUntil = performance.now() + 1600; this.yaw = 0; this.pitch = -0.65; }
        this._ioSeen = true; void firstIo;
        if (this.hasAttribute('assemble')) {
          if (this.visible && !was && performance.now() > (this._noAsmUntil || 0)) { this.asmStart = performance.now(); }
          if (!this.visible) { this.localT = 1; this.asmStart = 0; }
        }
      }, { threshold: 0.2 }); this.io.observe(this);
      this.visible = true;
      const loop = now => { this.raf = requestAnimationFrame(loop); if (this.visible) this.draw(now); };
      this.raf = requestAnimationFrame(loop);
    }
    clearNow() { this.ctx && this.cv && this.ctx.clearRect(0, 0, this.cv.width, this.cv.height); }
    showNow() { this.localT = 0; this.asmStart = 0; this.outStart = 0; }
    disconnectedCallback() { cancelAnimationFrame(this.raf); removeEventListener('mousemove', this.onMove); this.ro && this.ro.disconnect(); this.io && this.io.disconnect(); }
    resize() {
      const r = this.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      this.cv.width = Math.max(1, Math.round(r.width * dpr)); this.cv.height = Math.max(1, Math.round(r.height * dpr)); this.dpr = dpr;
    }
    draw(now) {
      const { ctx, cv, dpr } = this, W = cv.width, H = cv.height;
      const waitA = this.hasAttribute('wait') && !this._wDone;
      if (waitA) { if (!window.__npHeroGo) { this.localT = 1; this.asmStart = 0; } else if (!this.asmStart && this.localT >= 1) this.asmStart = now; }
      if (this.getAttribute('out') === '1') {
        if (!this.outStart) { this.outStart = now; this.out0 = this.localT || 0; this.asmStart = 0; }
        const p = Math.min(1, (now - this.outStart) / 700), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        this.localT = this.out0 + (0.3 - this.out0) * e;
      } else if (this.outStart) { this.outStart = 0; this.asmStart = now; }
      if (this.asmStart) { const p = Math.min(1, (now - this.asmStart) / 1100); this.localT = 1 - (1 - Math.pow(1 - p, 3)); if (p >= 1) this.asmStart = 0; }
      if (waitA && window.__npHeroGo && !this.asmStart && this.localT <= 0.001) this._wDone = true;
      const own = this.hasAttribute('assemble') || this.hasAttribute('static') || (waitA && !this._wDone);
      const t = own ? this.localT : Math.max(0, Math.min(1, window.__npIntroT || 0)), te = t * t;
      ctx.clearRect(0, 0, W, H);
      if (t >= 0.999) return;
      const hidden = this.getAttribute('hide') === '1';
      let lx = this.mx, ly = this.my;
      // no mouse (touch / narrow screens): slow, organic drift instead of cursor tracking
      if (innerWidth < 760 || matchMedia('(hover: none)').matches) {
        const tt = now / 1000;
        lx = Math.sin(tt * 0.23) * 0.55 + Math.sin(tt * 0.61 + 1.3) * 0.18;
        ly = Math.sin(tt * 0.17 + 0.8) * 0.4 + Math.sin(tt * 0.47 + 2.1) * 0.12;
      }
      const sel = this.getAttribute('look-at') || this.getAttribute('lookat') || this.lookAt;
      if (sel) {
        const el = document.querySelector(sel), me = this.getBoundingClientRect();
        lx = 0; ly = 0;
        if (el) { const r = el.getBoundingClientRect(); const tc = this.toC || [0.5, 0.5], mcx = me.left + me.width * tc[0], mcy = me.top + me.height * tc[1];
          lx = Math.max(-1.4, Math.min(1.4, ((r.left + r.width / 2) - mcx) / (innerWidth * 0.3))); ly = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - mcy) / (innerHeight * 0.35))); }
      }
      if (this._upUntil && now < this._upUntil) { lx = 0; ly = -1.3; }
      const ay = +(this.getAttribute('aimyaw') || 0), ap = +(this.getAttribute('aimpitch') || 0);
      const ty = lx * 0.8 + ay + Math.sin(now / 2600) * 0.05, tp = ly * 0.5 + ap;
      const ease = sel ? 0.035 : 0.06; this.yaw += (ty - this.yaw) * ease; this.pitch += (tp - this.pitch) * ease;
      const mesh = !!window.NP_SKULL, yw = this.yaw + (this.hasAttribute('yaw-offset') ? +this.getAttribute('yaw-offset') : 0), pt0 = this.hasAttribute('pitch-offset') ? +this.getAttribute('pitch-offset') : (mesh ? 0.18 : 0); const roll = this.hasAttribute('roll') ? +this.getAttribute('roll') : (mesh ? -0.08 : 0), cr = Math.cos(roll), sr = Math.sin(roll); const cy = Math.cos(yw + (mesh ? 0.12 : 0)), sy = Math.sin(yw + (mesh ? 0.12 : 0)), cp = Math.cos(this.pitch + pt0), sp = Math.sin(this.pitch + pt0);
      const tcx = this.hasAttribute('cx') ? +this.getAttribute('cx') : 0.5, tcy = this.hasAttribute('cy') ? +this.getAttribute('cy') : 0.5, tsc = this.hasAttribute('scale') ? +this.getAttribute('scale') : 0.95;
      if (!this.toC) { this.toC = [tcx, tcy, tsc]; this.fromC = [tcx, tcy, tsc]; this.trStart = 0; }
      if (tcx !== this.toC[0] || tcy !== this.toC[1] || tsc !== this.toC[2]) { this.fromC = this.toC; this.toC = [tcx, tcy, tsc]; this.trStart = now; }
      const TR = this.trStart ? Math.min(1, (now - this.trStart) / 850) : 1; if (TR >= 1) this.trStart = 0;
      const inTr = TR < 1, eio = q => q < .5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
      const MWH = Math.min(W * (+(this.getAttribute('refw') || 1)), H * (+(this.getAttribute('refh') || 1))), S = MWH * this.toC[2], cam = 3.4, grid = Math.max(2, Math.round(2.5 * dpr)), px = Math.max(1, Math.round(2 * dpr));
      const fade = 1 - t;
      const gw = Math.ceil(W / grid) + 1, gh = Math.ceil(H / grid) + 1, n = gw * gh;
      if (!this.zb || this.zb.length !== n) { this.zb = new Float32Array(n); this.ab = new Float32Array(n); }
      const zb = this.zb, ab = this.ab; zb.fill(-1e9); ab.fill(0);
      const scat = t > 0.05 || inTr;
      const mr = this.getBoundingClientRect(), snapOn = Math.abs(mr.top) < 1 && this.getAttribute('hide') !== '1';
      if (snapOn && (!this.snap || this.snap.length !== this.pts.length * 2)) { this.snap = new Float32Array(this.pts.length * 2); this.snapC = new Int32Array(this.pts.length); this.snapZ = new Float32Array(this.pts.length); this.snapA = new Float32Array(this.pts.length); }
      let si = 0;
      for (const p of this.pts) {
        let q = 1, fly = 0;
        if (inTr) { q = eio(Math.max(0, Math.min(1, (TR - p.dl) / 0.6))); fly = Math.sin(Math.PI * q) * 1.1; }
        const ccx = W * (this.fromC[0] + (this.toC[0] - this.fromC[0]) * q), ccy = H * (this.fromC[1] + (this.toC[1] - this.fromC[1]) * q);
        const Sq = MWH * (this.fromC[2] + (this.toC[2] - this.fromC[2]) * q);
        const sc = te * 2.4 + fly;
        const x = p.x + p.dx * sc, y = p.y + p.dy * sc, z = p.z + p.dz * sc;
        const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        const k = Sq / (cam - z2) * 0.9;
        const xr = x1 * cr - y2 * sr, yr = x1 * sr + y2 * cr;
        const pk = si >> 1;
        if (snapOn) { this.snap[si++] = mr.left + (ccx + xr * k) / dpr; this.snap[si++] = mr.top + (ccy - yr * k) / dpr; this.snapC[pk] = -1; this.snapZ[pk] = z2; }
        const gx = Math.round((ccx + xr * k) / grid), gy = Math.round((ccy - yr * k) / grid);
        if (gx < 0 || gy < 0 || gx >= gw || gy >= gh) continue;
        const i = gy * gw + gx;
        if (snapOn) this.snapC[pk] = i;
        if (!scat && z2 <= zb[i]) continue;
        const nx1 = p.nx * cy + p.nz * sy, nz1 = -p.nx * sy + p.nz * cy;
        const ny2 = p.ny * cp - nz1 * sp, nz2 = p.ny * sp + nz1 * cp;
        const sg = nz2 < 0 ? -1 : 1, lit = Math.max(0, Math.abs(nz2) * 0.75 + sg * ny2 * 0.3 - sg * nx1 * 0.12);
        const dep = Math.max(0, Math.min(1, (z2 + 0.9) / 1.9));
        zb[i] = z2;
        ab[i] = (0.04 + 0.96 * Math.pow(lit, 1.3)) * dep * dep * 1.7 * p.s + (scat ? 0.12 : 0);
      }
      if (snapOn) for (let k = 0; k < this.pts.length; k++) { const c = this.snapC[k]; this.snapA[k] = c >= 0 && zb[c] === this.snapZ[k] ? Math.min(1, ab[c] * fade) : 0; }
      if (hidden) return;
      for (let i = 0; i < n; i++) {
        const al = ab[i] * fade; if (al < 0.02) continue;
        ctx.fillStyle = 'rgba(' + RED[0] + ',' + RED[1] + ',' + RED[2] + ',' + Math.min(1, al).toFixed(3) + ')';
        ctx.fillRect((i % gw) * grid, ((i / gw) | 0) * grid, px, px);
      }
    }
  }
  customElements.define('np-skull', NpSkull);
})();
