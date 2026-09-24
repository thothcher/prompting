/* The 3D cross-section of one summit: a layered mountain cut in half and
   drawn with three.js, which loads on demand from js/vendor. The concept
   buttons stay ordinary HTML. Each layer's buttons are mapped onto the cut
   face with a perspective transform, so the text stays sharp and clickable. */
(() => {
  'use strict';

  const GOP = window.GOP;
  const { h } = GOP;

  const DEG = Math.PI / 180;
  const R = 10; // base radius
  const H = 11; // height
  const T_TOP = 0.7; // the four concept layers fill the mountain up to this height
  const LAYERS = 4;
  const BAND = T_TOP / LAYERS;
  const BASE_AZ = -21 * DEG;
  const BASE_EL = 15 * DEG;

  // Layer 0 (L1, framework) is the top band; layer 3 (L4, foundations) sits on the ground.
  const tTop = (li) => T_TOP - BAND * li;
  const tBot = (li) => tTop(li) - BAND;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  function hash(text) {
    let x = 2166136261;
    for (const ch of text) {
      x ^= ch.codePointAt(0);
      x = Math.imul(x, 16777619);
    }
    return x >>> 0;
  }

  // A broad layered massif, cut in half to show its layers, with a complete
  // snowy peak set back on its plateau. Each summit gets its own seed.
  function makeShape(seed) {
    const rnd = rng(seed);
    const waves = [2, 3, 5, 8, 13].map((f, i) => ({ f, ft: 1.5 + rnd() * 4, p: rnd() * Math.PI * 2, a: [0.5, 0.32, 0.22, 0.14, 0.09][i] }));
    const noise = (th, t) => waves.reduce((s, w) => s + w.a * Math.sin(w.f * th + w.ft * t * 3 + w.p), 0) / 1.27;
    // Massif radius for heights t in [0, T_TOP]
    const radius = (th, t) => R * (1 - 0.58 * Math.pow(t, 1.1)) * (1 + 0.075 * noise(th, t));
    const shoulder = R * (1 - 0.58 * Math.pow(T_TOP, 1.1));
    const phase = rnd() * 6;
    const peak = {
      baseY: T_TOP * H - 0.08,
      height: 4.4,
      radius: shoulder * 0.49,
      cz: -shoulder * 0.54,
      noise: (th, t) => noise(th, t * 2.2 + 1.3), // integer frequencies, so the ring closes without a seam
      snowline: (th) => 0.36 + 0.08 * Math.sin(th * 3 + phase) + 0.04 * Math.sin(th * 7 + 1.3)
    };
    return { radius, peak, rnd };
  }

  // Colors come from CSS tokens, so the model follows the light and dark themes.
  function palette(THREE) {
    const cs = getComputedStyle(document.documentElement);
    const c = (name, fallback) => new THREE.Color((cs.getPropertyValue(name) || '').trim() || fallback);
    return {
      rock: [1, 2, 3, 4].map((i) => c(`--m3d-rock-${i}`, '#1b3a6c')),
      cut: [1, 2, 3, 4].map((i) => c(`--m3d-cut-${i}`, '#1d58ad')),
      peak: c('--m3d-peak', '#2a4f8a'),
      snow: c('--m3d-snow', '#eef6ff'),
      fog: c('--m3d-fog', '#0a1830'),
      line: c('--m3d-line', '#7cc4ff'),
      grid: c('--m3d-grid', '#1f4f96'),
      bg: c('--m3d-bg', '#020a18'),
      sky: c('--m3d-sky', '#bcdcff'),
      ground: c('--m3d-ground', '#06224e'),
      shadow: parseFloat(cs.getPropertyValue('--m3d-shadow')) || 0.35
    };
  }

  // Maps a w x h element onto a screen quad (TL, TR, BR, BL) as a CSS matrix3d.
  function quadMatrix(w, hh, q) {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = q;
    const dx1 = x1 - x2;
    const dx2 = x3 - x2;
    const dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2;
    const dy2 = y3 - y2;
    const dy3 = y0 - y1 + y2 - y3;
    const det = dx1 * dy2 - dx2 * dy1;
    if (!isFinite(det) || Math.abs(det) < 1e-9) return null;
    const g = (dx3 * dy2 - dx2 * dy3) / det;
    const k = (dx1 * dy3 - dx3 * dy1) / det;
    const a = x1 - x0 + g * x1;
    const b = x3 - x0 + k * x3;
    const d = y1 - y0 + g * y1;
    const e = y3 - y0 + k * y3;
    const m = [a / w, d / w, 0, g / w, b / hh, e / hh, 0, k / hh, 0, 0, 1, 0, x0, y0, 0, 1];
    return 'matrix3d(' + m.map((v) => +v.toFixed(8)).join(',') + ')';
  }

  let supportCache = null;
  function supported() {
    if (supportCache !== null) return supportCache;
    try {
      const c = document.createElement('canvas');
      supportCache = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      supportCache = false;
    }
    return supportCache;
  }

  let loading = null;
  function load() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'js/vendor/three.min.js';
        s.async = true;
        s.onload = () => (window.THREE ? resolve(window.THREE) : reject(new Error('three.js did not load')));
        s.onerror = () => reject(new Error('three.js did not load'));
        document.head.appendChild(s);
      });
    }
    return loading;
  }

  class Mountain3D {
    constructor(stage, { onChip, onLost } = {}) {
      const THREE = window.THREE;
      this.T = THREE;
      this.stage = stage;
      this.onChip = onChip;
      this.onLost = onLost;
      this.canvas = h('canvas', { class: 'xs3d__canvas', 'aria-hidden': 'true' });
      this.overlay = h('div', { class: 'xs3d__overlay' });
      stage.append(this.canvas, this.overlay);

      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.5, 220);
      this.target = new THREE.Vector3(0, H * 0.47, -1.2);
      this.v = new THREE.Vector3();
      this.az = BASE_AZ;
      this.el = BASE_EL;
      this.goalAz = BASE_AZ;
      this.goalEl = BASE_EL;
      this.dist = 36;
      this.size = { w: 0, h: 0 };
      this.hover = false;
      this.tweens = [];
      this.bands = [];
      this.group = null;
      this.summit = null;
      this.depth = LAYERS;
      this.dirty = true;
      this.running = false;
      this.visible = false;

      this.pal = palette(THREE);
      this.buildStage();

      this.loop = this.loop.bind(this);
      stage.addEventListener('pointermove', (e) => this.onMove(e));
      stage.addEventListener('pointerleave', () => (this.hover = false));
      this.canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        if (this.destroyed) return; // destroy() releases the context on purpose
        this.stop();
        if (this.onLost) this.onLost();
      });

      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(stage);
      this.io = new IntersectionObserver((entries) => {
        this.visible = entries.some((en) => en.isIntersecting);
        if (this.visible && !document.hidden) this.start();
        else this.stop();
      });
      this.io.observe(stage);
      this.onVisibility = () => (document.hidden ? this.stop() : this.visible && this.start());
      document.addEventListener('visibilitychange', this.onVisibility);
      GOP.on('theme', () => !this.destroyed && this.retheme());
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => !this.destroyed && this.layoutPanels());
      this.resize();
    }

    /* ---------------------------------------------------------- scene */

    buildStage() {
      const T = this.T;
      const P = this.pal;
      this.hemi = new T.HemisphereLight(P.sky, P.ground, 0.95);
      this.key = new T.DirectionalLight(0xffffff, 1.0);
      this.key.position.set(-14, 22, 17);
      this.key.target.position.set(0, 3, -2);
      this.key.castShadow = true;
      this.key.shadow.mapSize.set(2048, 2048);
      const sc = this.key.shadow.camera;
      sc.left = -17;
      sc.right = 17;
      sc.top = 17;
      sc.bottom = -8;
      sc.near = 1;
      sc.far = 80;
      this.key.shadow.bias = -0.0006;
      this.key.shadow.normalBias = 0.03;
      this.rim = new T.DirectionalLight(P.line, 0.6);
      this.rim.position.set(14, 10, -18);
      this.fill = new T.DirectionalLight(0x9fc8ff, 0.25);
      this.fill.position.set(18, 6, 12);
      this.scene.add(this.hemi, this.key, this.key.target, this.rim, this.fill);

      this.catcher = new T.Mesh(new T.PlaneGeometry(140, 140), new T.ShadowMaterial({ opacity: P.shadow }));
      this.catcher.rotation.x = -Math.PI / 2;
      this.catcher.receiveShadow = true;
      this.scene.add(this.catcher);
      this.addGrid();
      this.scene.fog = new T.Fog(P.bg, 36, 92);
    }

    addGrid() {
      const T = this.T;
      if (this.grid) {
        this.scene.remove(this.grid);
        this.grid.geometry.dispose();
        this.grid.material.dispose();
      }
      this.grid = new T.GridHelper(140, 70, this.pal.line, this.pal.grid);
      this.grid.material.transparent = true;
      this.grid.material.opacity = 0.32;
      this.grid.position.y = 0.005;
      this.scene.add(this.grid);
    }

    retheme() {
      this.pal = palette(this.T);
      const P = this.pal;
      this.hemi.color.copy(P.sky);
      this.hemi.groundColor.copy(P.ground);
      this.rim.color.copy(P.line);
      this.catcher.material.opacity = P.shadow;
      this.scene.fog.color.copy(P.bg);
      this.addGrid();
      if (this.summit) this.setSummit(this.summit, { animate: false, depth: this.depth });
    }

    /* ---------------------------------------------------------- summit */

    // summit: { key, word, layers: [{ code, name, sub, items: [concept] } x 4] }
    setSummit(summit, { animate = true, depth = this.depth } = {}) {
      const T = this.T;
      const P = this.pal;
      this.summit = summit;
      this.depth = depth;
      this.disposeGroup();
      const shape = (this.shape = makeShape(hash(summit.key + ':' + summit.word)));
      const group = (this.group = new T.Group());

      const surface = new T.Mesh(
        this.surfaceGeometry(shape),
        new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92, metalness: 0.02 })
      );
      surface.castShadow = true;
      surface.receiveShadow = true;
      group.add(surface);

      this.bands = [];
      for (let li = 0; li < LAYERS; li++) {
        const mat = new T.MeshStandardMaterial({ color: P.cut[li].clone(), vertexColors: true, roughness: 0.78, metalness: 0.04 });
        const mesh = new T.Mesh(this.cutGeometry(shape, tBot(li), tTop(li), 12, false), mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        this.bands.push({ li, mesh, mat, open: li < depth, box: { w: 320, h: 80 } });
      }
      const plateau = new T.Mesh(
        this.plateauGeometry(shape),
        new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, metalness: 0 })
      );
      plateau.receiveShadow = true;
      group.add(plateau);
      const peak = new T.Mesh(
        this.peakGeometry(shape),
        new T.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.8, metalness: 0 })
      );
      peak.castShadow = true;
      peak.receiveShadow = true;
      group.add(peak);
      group.add(this.edgeLines(shape));
      this.scene.add(group);

      this.buildOverlay(summit);
      this.bands.forEach((b) => this.paintBand(b, b.open ? 1 : 0, 0));
      this.applyPanelState();
      this.layoutPanels();

      if (animate && !GOP.reduced() && this.running) {
        group.scale.set(1, 0.02, 1);
        this.overlay.classList.add('is-growing');
        this.tween({
          dur: 950,
          ease: easeOut,
          update: (t) => group.scale.set(1, 0.02 + 0.98 * t, 1),
          done: () => this.overlay.classList.remove('is-growing')
        });
      }
      this.dirty = true;
      this.renderNow();
    }

    // Builds a faceted surface from a grid of [x, y, z, angle, t] points.
    gridGeometry(grid, colorOf) {
      const T = this.T;
      const pos = [];
      const col = [];
      const c = new T.Color();
      const tri = (p, q, s) => {
        pos.push(p[0], p[1], p[2], q[0], q[1], q[2], s[0], s[1], s[2]);
        colorOf((p[3] + q[3] + s[3]) / 3, (p[4] + q[4] + s[4]) / 3, c);
        for (let i = 0; i < 3; i++) col.push(c.r, c.g, c.b);
      };
      for (let j = 0; j < grid.length - 1; j++) {
        for (let a = 0; a < grid[j].length - 1; a++) {
          tri(grid[j][a], grid[j][a + 1], grid[j + 1][a]);
          tri(grid[j][a + 1], grid[j + 1][a + 1], grid[j + 1][a]);
        }
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
      g.computeVertexNormals();
      return g;
    }

    // The back half of the massif, banded like its layers.
    surfaceGeometry(shape) {
      const NA = 72;
      const NT = 34;
      const grid = [];
      for (let j = 0; j <= NT; j++) {
        const t = (j / NT) * T_TOP;
        const row = [];
        for (let a = 0; a <= NA; a++) {
          const th = (Math.PI * a) / NA;
          const r = shape.radius(th, t);
          row.push([r * Math.cos(th), t * H, -r * Math.sin(th), th, t]);
        }
        grid.push(row);
      }
      const P = this.pal;
      return this.gridGeometry(grid, (th, t, out) => {
        const li = Math.min(LAYERS - 1, Math.floor((T_TOP - t) / BAND));
        out.copy(P.rock[li]).offsetHSL(0, 0, (shape.rnd() - 0.5) * 0.07 - (t < 0.035 ? 0.05 : 0));
      });
    }

    // The flat top of the massif, gently domed towards the peak.
    plateauGeometry(shape) {
      const T = this.T;
      const NA = 72;
      const y = T_TOP * H;
      const cx = 0;
      const cy = y + 0.25;
      const cz = shape.peak.cz * 0.7;
      const pos = [];
      const col = [];
      const c = new T.Color();
      for (let a = 0; a < NA; a++) {
        const th0 = (Math.PI * a) / NA;
        const th1 = (Math.PI * (a + 1)) / NA;
        const r0 = shape.radius(th0, T_TOP);
        const r1 = shape.radius(th1, T_TOP);
        pos.push(cx, cy, cz, r0 * Math.cos(th0), y, -r0 * Math.sin(th0), r1 * Math.cos(th1), y, -r1 * Math.sin(th1));
        c.copy(this.pal.rock[0]).offsetHSL(0, 0, 0.05 + (shape.rnd() - 0.5) * 0.06);
        for (let i = 0; i < 3; i++) col.push(c.r, c.g, c.b);
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
      g.computeVertexNormals();
      return g;
    }

    // A complete, rugged peak with snow on its upper slopes.
    peakGeometry(shape) {
      const pk = shape.peak;
      const NA = 64;
      const NT = 26;
      const grid = [];
      for (let j = 0; j <= NT; j++) {
        const t = j / NT;
        const row = [];
        for (let a = 0; a <= NA; a++) {
          const th = (Math.PI * 2 * a) / NA;
          const r = pk.radius * Math.pow(1 - t, 1.1) * (1 + 0.1 * pk.noise(th, t) * (1 - t * 0.5));
          row.push([r * Math.cos(th), pk.baseY + t * pk.height, pk.cz - r * Math.sin(th), th, t]);
        }
        grid.push(row);
      }
      const P = this.pal;
      return this.gridGeometry(grid, (th, t, out) => {
        if (t > pk.snowline(th)) out.copy(P.snow).offsetHSL(0, 0, -shape.rnd() * 0.06);
        else out.copy(P.peak).offsetHSL(0, 0, (shape.rnd() - 0.5) * 0.035);
      });
    }

    // The flat cut face between two heights. Layers get thin sediment stripes;
    // the peak fades from rock to ice.
    cutGeometry(shape, t0, t1, steps, isPeak) {
      const T = this.T;
      const P = this.pal;
      const pos = [];
      const col = [];
      const c = new T.Color();
      const shade = (t, k) => {
        if (isPeak) {
          const u = (t - T_TOP) / (1 - T_TOP);
          c.copy(P.peak).lerp(P.snow, Math.min(1, Math.max(0, (u - 0.15) / 0.5)));
          return [c.r, c.g, c.b];
        }
        const s = (k % 2 ? 1 : 0.91) * (0.97 + shape.rnd() * 0.03);
        return [s, s, s];
      };
      for (let k = 0; k < steps; k++) {
        const ta = t0 + ((t1 - t0) * k) / steps;
        const tb = t0 + ((t1 - t0) * (k + 1)) / steps;
        const La = [-shape.radius(Math.PI, ta), ta * H, 0];
        const Ra = [shape.radius(0, ta), ta * H, 0];
        const Lb = [-shape.radius(Math.PI, tb), tb * H, 0];
        const Rb = [shape.radius(0, tb), tb * H, 0];
        const ca = shade(ta, k);
        const cb = isPeak ? shade(tb, k) : ca;
        pos.push(...La, ...Ra, ...Rb, ...La, ...Rb, ...Lb);
        col.push(...ca, ...ca, ...cb, ...ca, ...cb, ...cb);
      }
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
      g.computeVertexNormals();
      return g;
    }

    // Glowing outline of the cut and the boundaries between layers.
    edgeLines(shape) {
      const T = this.T;
      const out = new T.Group();
      const z = 0.035;
      const outline = [];
      for (let j = 0; j <= 48; j++) {
        const t = (j / 48) * T_TOP;
        outline.push(new T.Vector3(-shape.radius(Math.PI, t), t * H, z));
      }
      for (let j = 48; j >= 0; j--) {
        const t = (j / 48) * T_TOP;
        outline.push(new T.Vector3(shape.radius(0, t), t * H, z));
      }
      out.add(new T.Line(new T.BufferGeometry().setFromPoints(outline), new T.LineBasicMaterial({ color: this.pal.line, transparent: true, opacity: 0.9 })));
      const faint = new T.LineBasicMaterial({ color: this.pal.line, transparent: true, opacity: 0.5 });
      for (let li = 1; li < LAYERS; li++) {
        const t = tTop(li);
        const pts = [new T.Vector3(-shape.radius(Math.PI, t), t * H, z), new T.Vector3(shape.radius(0, t), t * H, z)];
        out.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), faint));
      }
      return out;
    }

    disposeGroup() {
      if (!this.group) return;
      this.scene.remove(this.group);
      this.group.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) [].concat(o.material).forEach((m) => m.dispose());
      });
      this.group = null;
      this.tweens = [];
    }

    /* ---------------------------------------------------------- HTML panels */

    buildOverlay(summit) {
      this.overlay.replaceChildren();
      this.overlay.classList.remove('is-growing');
      this.bands.forEach((b) => {
        const L = summit.layers[b.li];
        const panel = h('div', { class: 'xs3d__panel', 'data-li': String(b.li) },
          h('p', { class: 'xs3d__tag' }, h('b', null, L.code), ` ${L.name} · ${L.sub}`),
          h('ul', { class: 'xs__chips', 'aria-label': `${L.name}: ${L.items.length} concepts` },
            L.items.map((c, ci) =>
              h('li', { style: { '--i': String(ci) } },
                h('button', {
                  class: 'chip',
                  type: 'button',
                  'aria-expanded': 'false',
                  onclick: (e) => this.onChip && this.onChip(c, L, e.currentTarget)
                }, c.name)
              )
            )
          ),
          h('p', { class: 'xs3d__fog', 'aria-hidden': 'true' }, `${L.code} · ${L.name}`)
        );
        this.overlay.appendChild(panel);
        b.panel = panel;
      });
    }

    applyPanelState() {
      this.bands.forEach((b) => {
        b.panel.classList.toggle('is-fog', !b.open);
        if (b.open) b.panel.removeAttribute('inert');
        else b.panel.setAttribute('inert', '');
      });
    }

    // Size each panel's box at the resting camera pose. If the buttons do not
    // fit, the box grows and the perspective transform shrinks it back onto
    // the layer, so the text scales down evenly instead of overflowing.
    layoutPanels() {
      if (!this.group || !this.size.w || !this.size.h) return;
      const keep = { az: this.az, el: this.el, sy: this.group.scale.y };
      this.az = BASE_AZ;
      this.el = BASE_EL;
      this.group.scale.y = 1;
      this.placeCamera();
      this.group.updateMatrixWorld(true);
      for (const b of this.bands) {
        const q = this.projectRect(b.li);
        if (!q) continue;
        const wRef = Math.hypot(q[2] - q[0], q[3] - q[1]);
        const hRef = Math.hypot(q[6] - q[0], q[7] - q[1]);
        const p = b.panel;
        p.style.transform = 'none';
        let s = 1;
        for (let i = 0; i < 10; i++) {
          p.style.width = (wRef * s).toFixed(1) + 'px';
          p.style.height = 'auto';
          if (p.scrollHeight <= hRef * s + 1) break;
          s *= 1.07;
        }
        b.box = { w: wRef * s, h: hRef * s };
        p.style.width = b.box.w.toFixed(1) + 'px';
        p.style.height = b.box.h.toFixed(1) + 'px';
      }
      this.az = keep.az;
      this.el = keep.el;
      this.group.scale.y = keep.sy;
      this.placeCamera();
      this.group.updateMatrixWorld(true);
      this.dirty = true;
    }

    // Screen corners (TL, TR, BR, BL) of the rectangle a layer's panel covers.
    projectRect(li) {
      const shape = this.shape;
      const t0 = tBot(li);
      const t1 = tTop(li);
      const bandH = (t1 - t0) * H;
      const yTop = t1 * H - bandH * 0.07;
      const yBot = t0 * H + bandH * 0.07;
      const half = Math.min(shape.radius(0, t1), shape.radius(Math.PI, t1)) * 0.84;
      const out = [];
      for (const [x, y] of [[-half, yTop], [half, yTop], [half, yBot], [-half, yBot]]) {
        this.v.set(x, y, 0.06).applyMatrix4(this.group.matrixWorld).project(this.camera);
        if (this.v.z > 1) return null;
        out.push(((this.v.x + 1) / 2) * this.size.w, ((1 - this.v.y) / 2) * this.size.h);
      }
      return out;
    }

    updateOverlay() {
      if (!this.group) return;
      this.group.updateMatrixWorld(true);
      for (const b of this.bands) {
        const q = this.projectRect(b.li);
        const m = q && quadMatrix(b.box.w, b.box.h, q);
        b.panel.style.transform = m || 'scale(0)';
      }
    }

    /* ---------------------------------------------------------- depth */

    setDepth(d, animate) {
      this.depth = d;
      this.bands.forEach((b) => {
        const open = b.li < d;
        const was = b.open;
        b.open = open;
        if (open && !was && animate && !GOP.reduced() && this.running) this.reveal(b);
        else this.paintBand(b, open ? 1 : 0, 0);
      });
      this.applyPanelState();
      this.dirty = true;
    }

    paintBand(b, k, glow) {
      b.mat.color.copy(this.pal.fog).lerp(this.pal.cut[b.li], k);
      b.mat.emissive.copy(this.pal.line).multiplyScalar(glow);
    }

    reveal(b) {
      this.paintBand(b, 0, 0);
      b.panel.classList.remove('is-revealing');
      void b.panel.offsetWidth;
      b.panel.classList.add('is-revealing');
      setTimeout(() => b.panel.classList.remove('is-revealing'), 1400);
      this.tween({ dur: 820, ease: easeInOut, update: (t) => this.paintBand(b, t, Math.sin(t * Math.PI) * 0.45) });
      this.scan(b.li);
    }

    // A bright line that sweeps down the layer as it is revealed.
    scan(li) {
      const T = this.T;
      const shape = this.shape;
      const group = this.group;
      const t1 = tTop(li);
      const t0 = tBot(li);
      const bar = new T.Mesh(
        new T.PlaneGeometry(1, 0.13),
        new T.MeshBasicMaterial({ color: this.pal.line, transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false })
      );
      group.add(bar);
      this.tween({
        dur: 780,
        ease: easeInOut,
        update: (t) => {
          const tt = t1 - (t1 - t0) * t;
          const left = shape.radius(Math.PI, tt);
          const right = shape.radius(0, tt);
          bar.scale.x = left + right;
          bar.position.set((right - left) / 2, tt * H, 0.08);
          bar.material.opacity = 0.95 * (1 - t * 0.75);
        },
        done: () => {
          group.remove(bar);
          bar.geometry.dispose();
          bar.material.dispose();
        }
      });
    }

    /* ---------------------------------------------------------- camera and loop */

    onMove(e) {
      if (GOP.reduced()) return;
      // Hold the model still while the pointer is over the concepts, so they are easy to click.
      if (e.target.closest && e.target.closest('.xs3d__panel')) return;
      const r = this.stage.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      this.goalAz = BASE_AZ + nx * 7 * DEG;
      this.goalEl = BASE_EL - ny * 3 * DEG;
      this.hover = true;
    }

    placeCamera() {
      const c = this.camera;
      const t = this.target;
      c.position.set(
        t.x + this.dist * Math.cos(this.el) * Math.sin(this.az),
        t.y + this.dist * Math.sin(this.el),
        t.z + this.dist * Math.cos(this.el) * Math.cos(this.az)
      );
      c.lookAt(t);
      c.updateMatrixWorld();
    }

    resize() {
      if (this.destroyed) return;
      const w = this.stage.clientWidth;
      const hh = this.stage.clientHeight;
      if (!w || !hh) return;
      this.size = { w, h: hh };
      this.renderer.setSize(w, hh, false);
      this.camera.aspect = w / hh;
      const vf = (this.camera.fov * DEG) / 2;
      const hf = Math.atan(Math.tan(vf) * this.camera.aspect);
      this.dist = Math.max((R * 1.08) / Math.tan(hf), (H * 0.56) / Math.tan(vf)) + 1.2;
      this.camera.updateProjectionMatrix();
      this.placeCamera();
      this.layoutPanels();
      this.dirty = true;
      this.renderNow();
    }

    tween({ dur, ease = easeOut, update, done }) {
      if (!this.running) {
        update(1);
        if (done) done();
        this.dirty = true;
        return;
      }
      this.tweens.push({ start: performance.now(), dur, ease, update, done });
    }

    runTweens(now) {
      if (!this.tweens.length) return false;
      this.tweens = this.tweens.filter((tw) => {
        const p = Math.min(1, (now - tw.start) / tw.dur);
        tw.update(tw.ease(p));
        if (p < 1) return true;
        if (tw.done) tw.done();
        return false;
      });
      return true;
    }

    start() {
      if (this.running || this.destroyed) return;
      this.running = true;
      this.raf = requestAnimationFrame(this.loop);
    }

    stop() {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }

    loop(now) {
      if (!this.running) return;
      this.raf = requestAnimationFrame(this.loop);
      let moving = this.runTweens(now);
      if (!GOP.reduced()) {
        if (!this.hover) {
          this.goalAz = BASE_AZ + Math.sin(now * 0.0002) * 1.8 * DEG;
          this.goalEl = BASE_EL + Math.sin(now * 0.00016) * 0.6 * DEG;
        }
        const dAz = (this.goalAz - this.az) * 0.06;
        const dEl = (this.goalEl - this.el) * 0.06;
        if (Math.abs(dAz) > 1e-5 || Math.abs(dEl) > 1e-5) {
          this.az += dAz;
          this.el += dEl;
          moving = true;
        }
      }
      if (moving || this.dirty) this.renderNow();
    }

    renderNow() {
      if (!this.size.w || this.destroyed) return;
      this.placeCamera();
      this.renderer.render(this.scene, this.camera);
      this.updateOverlay();
      this.dirty = false;
    }

    destroy() {
      this.destroyed = true;
      this.stop();
      this.ro.disconnect();
      this.io.disconnect();
      document.removeEventListener('visibilitychange', this.onVisibility);
      this.disposeGroup();
      if (this.grid) {
        this.grid.geometry.dispose();
        this.grid.material.dispose();
      }
      this.catcher.geometry.dispose();
      this.catcher.material.dispose();
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.stage.replaceChildren();
    }
  }

  Mountain3D.supported = supported;
  Mountain3D.load = load;
  GOP.Mountain3D = Mountain3D;
})();
