/* Page two: the prompt console, the mountain range, and the cross-section
   of the selected summit. */
(() => {
  'use strict';

  const GOP = window.GOP;
  const { h, svg, $, $$, icon, pad } = GOP;
  const D = GOP.data.mountain;
  const LAYERS = D.layers;
  const SUMMITS = D.summits;
  const N = SUMMITS.length;
  const DEPTH = LAYERS.length;
  const COUNTS = SUMMITS.map((s) => LAYERS.reduce((n, L) => n + s.layers[L.id].length, 0));
  const TOTAL = COUNTS.reduce((a, b) => a + b, 0);

  // At rest: every word lit, the first summit open with all layers visible.
  const M = { lit: N, summit: 0, depth: DEPTH, summary: false };
  let builtSummit = -2;
  let pop = null;
  const kwEls = [];
  const peaks = [];
  const ctl = {};

  const view = () => document.getElementById('view-mountain');
  const presenterOn = () => !!(GOP.presenter && GOP.presenter.isOn());

  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  /* ============================================================ Console */

  function renderConsole() {
    const text = D.prompt;
    const parts = [h('span', { class: 'console__caret', 'aria-hidden': 'true' }, '>')];
    let pos = 0;
    SUMMITS.forEach((s, i) => {
      const at = text.indexOf(s.match, pos);
      if (at < 0) return;
      parts.push(text.slice(pos, at));
      const btn = h('button', {
        class: 'kw',
        type: 'button',
        'aria-pressed': 'false',
        'aria-label': `${s.word}: look inside summit ${i + 1} of ${N}`,
        onclick: () => pick(i)
      }, s.match, h('sup', { 'aria-hidden': 'true' }, pad(i + 1)));
      btn.addEventListener('mouseenter', () => hover(i, true));
      btn.addEventListener('mouseleave', () => hover(i, false));
      kwEls[i] = btn;
      parts.push(btn);
      pos = at + s.match.length;
    });
    parts.push(text.slice(pos));
    parts.push(h('span', { class: 'console__cursor', 'aria-hidden': 'true' }));
    $('#m-prompt').replaceChildren(...parts);
    $('#m-words').textContent = `${GOP.words(text)} words · ${N} technical words`;
  }

  function hover(i, on) {
    if (kwEls[i]) kwEls[i].classList.toggle('is-hover', on);
    if (peaks[i]) peaks[i].g.classList.toggle('is-hover', on);
    $$('#m-connectors [data-i="' + i + '"]').forEach((el) => el.classList.toggle('is-hover', on));
  }

  /* ============================================================== Range */

  const VB_W = 1200;
  const VB_H = 470;
  const GROUND = 470;
  const BANDS = [212, 276, 340, 404, GROUND]; // tops of L1 to L4, then the ground

  function buildRange() {
    const root = $('#m-range');
    root.setAttribute('viewBox', `0 0 ${VB_W} ${VB_H}`);
    root.replaceChildren();
    peaks.length = 0;

    const rand = rng(20260924);
    const maxC = Math.max(...COUNTS);
    const x0 = 120;
    const x1 = VB_W - 120;
    // Peak height is proportional to the number of concepts under the word.
    const tops = SUMMITS.map((s, i) => ({ x: x0 + ((x1 - x0) * i) / (N - 1), y: GROUND - (COUNTS[i] / maxC) * 390 }));
    const saddles = [{ x: 0, y: 318 }];
    for (let i = 1; i < N; i++) {
      saddles.push({ x: (tops[i - 1].x + tops[i].x) / 2 + (rand() - 0.5) * 26, y: 292 + rand() * 40 });
    }
    saddles.push({ x: VB_W, y: 322 });

    const ridge = [];
    const slope = (a, b, steps) => {
      for (let k = 1; k < steps; k++) {
        const t = k / steps;
        const x = a.x + (b.x - a.x) * t + (rand() - 0.5) * 12;
        const y = a.y + (b.y - a.y) * t + (rand() - 0.5) * 26 * Math.sin(Math.PI * t);
        ridge.push([x, y]);
      }
    };
    const ranges = [];
    ridge.push([saddles[0].x, saddles[0].y]);
    for (let i = 0; i < N; i++) {
      const start = ridge.length - 1;
      slope(saddles[i], tops[i], 5);
      ridge.push([tops[i].x, tops[i].y]);
      slope(tops[i], saddles[i + 1], 5);
      ridge.push([saddles[i + 1].x, saddles[i + 1].y]);
      ranges.push([start, ridge.length - 1]);
    }
    const toD = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L');
    const ridgeD = toD(ridge);
    const landD = `${ridgeD} L${VB_W},${VB_H} L0,${VB_H} Z`;

    // A lower, paler range behind for depth.
    const farRand = rng(1999);
    const far = [[0, 250]];
    for (let x = 60; x < VB_W; x += 60) far.push([x, 205 + farRand() * 95]);
    far.push([VB_W, 240]);
    const farD = `${toD(far)} L${VB_W},${VB_H} L0,${VB_H} Z`;

    const minY = Math.min(...tops.map((t) => t.y));
    const defs = svg('defs');
    const clip = svg('clipPath', { id: 'm-clip' });
    clip.appendChild(svg('path', { d: landD }));
    const grad = svg('linearGradient', { id: 'm-snow', x1: '0', y1: String(minY), x2: '0', y2: String(BANDS[0]), gradientUnits: 'userSpaceOnUse' });
    grad.appendChild(svg('stop', { offset: '0', class: 'stop-snow-top' }));
    grad.appendChild(svg('stop', { offset: '1', class: 'stop-snow-bottom' }));
    defs.append(clip, grad);
    root.appendChild(defs);

    root.appendChild(svg('path', { d: farD, class: 'land-far' }));

    const land = svg('g', { 'clip-path': 'url(#m-clip)' });
    land.appendChild(svg('rect', { x: 0, y: 0, width: VB_W, height: BANDS[0], fill: 'url(#m-snow)' }));
    for (let i = 0; i < DEPTH; i++) {
      land.appendChild(svg('rect', { x: 0, y: BANDS[i], width: VB_W, height: BANDS[i + 1] - BANDS[i], class: 'band--' + (i + 1) }));
    }
    for (let k = 1; k <= 14; k++) {
      land.appendChild(svg('path', { d: ridgeD, class: 'ridge-echo', transform: `translate(0 ${k * 15})`, opacity: Math.max(0.05, 0.34 - k * 0.022).toFixed(3) }));
    }
    root.appendChild(land);
    root.appendChild(svg('path', { d: ridgeD, class: 'ridge-line' }));

    // Altitude guides: the layers run at the same height under every summit.
    // Labels sit on small tags so they read over sky and land in both themes.
    const guides = svg('g', { 'aria-hidden': 'true' });
    const tag = (text, baseline) => {
      const w = text.length * 7.9 + 14; // mono glyph + letter-spacing, plus padding
      guides.appendChild(svg('rect', { class: 'guide-tag', x: VB_W - 10 - w, y: baseline - 12, width: w, height: 17 }));
      const t = svg('text', { class: 'guide-label', x: VB_W - 17, y: baseline, 'text-anchor': 'end' });
      t.textContent = text;
      guides.appendChild(t);
    };
    LAYERS.forEach((L, i) => guides.appendChild(svg('line', { x1: 0, x2: VB_W, y1: BANDS[i], y2: BANDS[i], class: 'guide' })));
    tag('L0 SUMMIT', BANDS[0] - 9);
    LAYERS.forEach((L, i) => tag(`${L.code} ${L.name.toUpperCase()}`, BANDS[i] + 19));
    root.appendChild(guides);

    SUMMITS.forEach((s, i) => {
      const [a, b] = ranges[i];
      const top = tops[i];
      const g = svg('g', {
        class: 'peak',
        tabindex: '0',
        role: 'button',
        'data-i': String(i),
        'aria-label': `${s.word}: ${COUNTS[i]} concepts. Look inside summit ${i + 1} of ${N}.`
      });
      const left = saddles[i];
      const right = saddles[i + 1];
      g.appendChild(svg('polygon', {
        class: 'peak__hit',
        points: `${left.x},${GROUND} ${left.x},${left.y} ${top.x},${top.y - 70} ${right.x},${right.y} ${right.x},${GROUND}`
      }));
      g.appendChild(svg('path', { class: 'peak__outline', d: toD(ridge.slice(a, b + 1)) }));
      g.appendChild(svg('line', { class: 'peak__marker', x1: top.x, x2: top.x, y1: top.y + 4, y2: GROUND }));
      const num = svg('text', { class: 'peak__num', x: top.x, y: top.y - 58 });
      num.textContent = pad(i + 1);
      const word = svg('text', { class: 'peak__word', x: top.x, y: top.y - 32 });
      word.textContent = s.word;
      const count = svg('text', { class: 'peak__count', x: top.x, y: top.y - 13 });
      count.textContent = `${COUNTS[i]} CONCEPTS`;
      g.append(num, word, count);
      g.addEventListener('click', () => pick(i));
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          pick(i);
        }
      });
      g.addEventListener('mouseenter', () => hover(i, true));
      g.addEventListener('mouseleave', () => hover(i, false));
      root.appendChild(g);
      peaks.push({ g, num });
    });
  }

  /* ============================================================== Stars */

  function drawStars() {
    const c = $('#m-stars');
    if (!c || view().hidden) return;
    const r = c.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(r.width * dpr);
    c.height = Math.round(r.height * dpr);
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, r.width, r.height);
    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--star').trim() || '220, 235, 255';
    const dim = document.documentElement.getAttribute('data-theme') === 'light' ? 0.35 : 1;
    const rand = rng(7);
    const count = Math.round((r.width * r.height) / 4200);
    for (let i = 0; i < count; i++) {
      const x = rand() * r.width;
      const y = Math.pow(rand(), 1.6) * r.height * 0.75;
      const a = (0.12 + rand() * 0.55) * dim;
      ctx.fillStyle = `rgba(${rgb}, ${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(x, y, rand() < 0.07 ? 1.3 : 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ========================================================= Connectors */

  function drawConnectors() {
    const layer = $('#m-connectors');
    if (view().hidden || window.innerWidth < 900) {
      layer.replaceChildren();
      return;
    }
    const host = $('#m-top');
    const hr = host.getBoundingClientRect();
    layer.setAttribute('width', String(hr.width));
    layer.setAttribute('height', String(hr.height));
    layer.setAttribute('viewBox', `0 0 ${hr.width} ${hr.height}`);
    const cr = $('#m-console').getBoundingClientRect();
    const items = [];
    for (let i = 0; i < N; i++) {
      if (i >= M.lit || !kwEls[i] || !peaks[i]) continue;
      const k = kwEls[i].getBoundingClientRect();
      const t = peaks[i].num.getBoundingClientRect();
      const x1 = k.left + k.width / 2 - hr.left;
      const y1 = cr.bottom - hr.top;
      const x2 = t.left + t.width / 2 - hr.left;
      const y2 = t.top - hr.top - 6;
      if (y2 <= y1 + 12) continue;
      const my = y1 + (y2 - y1) * 0.5;
      const cls = i === M.summit ? ' is-selected' : '';
      items.push(svg('path', { class: 'conn' + cls, 'data-i': String(i), d: `M${x1.toFixed(1)},${y1.toFixed(1)} C${x1.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}` }));
      items.push(svg('circle', { class: 'conn-dot' + cls, 'data-i': String(i), cx: x1.toFixed(1), cy: y1.toFixed(1), r: 3 }));
      items.push(svg('circle', { class: 'conn-dot' + cls, 'data-i': String(i), cx: x2.toFixed(1), cy: y2.toFixed(1), r: 2.5 }));
    }
    layer.replaceChildren(...items);
  }

  let rafConn = 0;
  const queueConnectors = () => {
    cancelAnimationFrame(rafConn);
    rafConn = requestAnimationFrame(drawConnectors);
  };

  /* ====================================================== Cross-section */

  function buildTabs() {
    const tabs = $('#m-tabs');
    SUMMITS.forEach((s, i) => {
      tabs.appendChild(
        h('button', {
          class: 'xs-tab',
          type: 'button',
          role: 'tab',
          id: 'm-tab-' + i,
          'aria-selected': 'false',
          'aria-controls': 'm-xs',
          onclick: () => pick(i, { scroll: false })
        }, h('small', null, pad(i + 1)), s.word)
      );
    });
  }

  function buildControls() {
    ctl.prev = h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => pick(M.summit - 1, { scroll: false }) }, icon('arrow-left'), 'Previous');
    ctl.layer = h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => setDepth(0) }, icon('summit'), 'Layer by layer');
    ctl.descend = h('button', { class: 'btn btn--primary', type: 'button', onclick: () => setDepth(M.depth + 1) }, icon('arrow-down'), 'Descend');
    ctl.all = h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => setDepth(DEPTH) }, icon('layers'), 'Reveal all');
    ctl.next = h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => pick(M.summit + 1, { scroll: false }) }, 'Next', icon('arrow-right'));
    $('#m-controls').append(ctl.prev, ctl.layer, ctl.descend, ctl.all, ctl.next);
  }

  function updateControls() {
    const focused = document.activeElement;
    const none = M.summit < 0;
    ctl.prev.disabled = none || M.summit <= 0;
    ctl.next.disabled = M.summit >= N - 1;
    ctl.descend.hidden = none || M.depth >= DEPTH;
    ctl.all.hidden = none || M.depth >= DEPTH;
    ctl.layer.hidden = none || M.depth < DEPTH;
    if ((focused === ctl.descend || focused === ctl.all) && ctl.descend.hidden) ctl.layer.focus({ preventScroll: true });
    if (focused === ctl.layer && ctl.layer.hidden) ctl.descend.focus({ preventScroll: true });
  }

  function buildXs() {
    closeConcept();
    const wrap = $('#m-xs');
    builtSummit = M.summit;
    if (M.summit < 0) {
      wrap.replaceChildren(h('p', { class: 'xs__empty' }, 'Pick a word in the prompt, or a peak in the range, to look inside it.'));
      return;
    }
    const s = SUMMITS[M.summit];
    wrap.setAttribute('aria-labelledby', 'm-tab-' + M.summit);
    const rows = [
      h('div', { class: 'xs__rule' }, h('b', null, 'L0'), h('span', null, 'Summit'), h('small', null, 'The word you type')),
      h('div', { class: 'xs__top' },
        h('div', { class: 'xs__flag' },
          h('p', { class: 'xs__word' }, s.word),
          h('p', { class: 'xs__tagline' }, s.tagline),
          h('p', { class: 'xs__count' }, `${COUNTS[M.summit]} concepts underneath`)
        ),
        h('div', { class: 'xs__cap', 'aria-hidden': 'true' })
      )
    ];
    LAYERS.forEach((L, li) => {
      rows.push(h('div', { class: 'xs__rule', 'data-li': String(li) }, h('b', null, L.code), h('span', null, L.name), h('small', null, L.sub)));
      rows.push(
        h('div', { class: 'xs__layer', 'data-li': String(li), 'data-fog': `${L.code} · ${L.name}` },
          h('p', { class: 'xs__layer-label' }, `${L.code} · ${L.name}`),
          h('ul', { class: 'xs__chips', 'aria-label': `${L.name}: ${s.layers[L.id].length} concepts` },
            s.layers[L.id].map((c, ci) =>
              h('li', { style: { '--i': String(ci) } },
                h('button', { class: 'chip', type: 'button', 'aria-expanded': 'false', onclick: (e) => openConcept(c, L, e.currentTarget) }, c.name)
              )
            )
          )
        )
      );
    });
    wrap.replaceChildren(...rows);
  }

  // Shows or fogs each layer for the current depth.
  function applyDepth(animateNew) {
    const wrap = $('#m-xs');
    $$('.xs__layer', wrap).forEach((el, li) => {
      const open = li < M.depth;
      const wasFog = el.classList.contains('is-fog');
      el.classList.toggle('is-fog', !open);
      if (open) el.removeAttribute('inert');
      else el.setAttribute('inert', '');
      if (open && wasFog && animateNew) reveal(el, 0);
    });
    $$('.xs__rule[data-li]', wrap).forEach((el, li) => {
      el.classList.toggle('is-fog', li >= M.depth);
      el.classList.toggle('is-current', M.depth < DEPTH && li === M.depth - 1);
    });
  }

  function reveal(el, delay) {
    el.style.setProperty('--layer-delay', delay + 'ms');
    el.classList.remove('is-revealing');
    void el.offsetWidth;
    el.classList.add('is-revealing');
    clearTimeout(el._revealT);
    el._revealT = setTimeout(() => el.classList.remove('is-revealing'), 1300 + delay);
  }

  function revealOpenLayers() {
    $$('.xs__layer', $('#m-xs')).forEach((el, li) => {
      if (li < M.depth) reveal(el, li * 140);
    });
  }

  /* ===================================================== Concept popover */

  function openConcept(c, L, btn) {
    if (pop && pop.btn === btn) {
      closeConcept(true);
      return;
    }
    closeConcept();
    const host = $('#m-xs-host');
    const closeBtn = h('button', { class: 'icon-btn holo__close', type: 'button', 'aria-label': 'Close', title: 'Close (Esc)', onclick: () => closeConcept(true) }, icon('close'));
    const el = h('div', { class: 'cpop holo', role: 'dialog', 'aria-label': c.name },
      GOP.holo.corners(),
      h('span', { class: 'scan', 'aria-hidden': 'true' }),
      closeBtn,
      h('p', { class: 'cpop__kicker' }, `${SUMMITS[M.summit].word} · ${L.code} ${L.name}`),
      h('h4', null, c.name),
      h('p', null, c.note),
      c.code ? h('pre', null, h('code', null, c.code)) : null
    );
    host.appendChild(el);
    const hr = host.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    const w = el.offsetWidth;
    const left = Math.max(8, Math.min(hr.width - w - 8, br.left + br.width / 2 - hr.left - w / 2));
    el.style.left = left + 'px';
    el.style.top = br.bottom - hr.top + 10 + 'px';
    btn.setAttribute('aria-expanded', 'true');
    pop = { el, btn };
    GOP.boot(el, 900);
    GOP.unfold(el, br, 380);
    closeBtn.focus({ preventScroll: true });
    const pr = el.getBoundingClientRect();
    if (pr.bottom > window.innerHeight - 12) el.scrollIntoView({ behavior: GOP.reduced() ? 'auto' : 'smooth', block: 'nearest' });
  }

  function closeConcept(returnFocus) {
    if (!pop) return;
    const { el, btn } = pop;
    pop = null;
    el.remove();
    btn.setAttribute('aria-expanded', 'false');
    if (returnFocus && document.contains(btn)) btn.focus({ preventScroll: true });
  }

  document.addEventListener('pointerdown', (e) => {
    if (pop && !pop.el.contains(e.target) && !pop.btn.contains(e.target)) closeConcept();
  });

  /* ============================================================ Summary */

  function renderSummary() {
    const stat = (value, label) => h('div', { class: 'stat' }, h('dt', null, label), h('dd', null, String(value)));
    $('#m-stats').replaceChildren(
      stat(GOP.words(D.prompt), 'words in the prompt'),
      stat(N, 'technical words'),
      stat(TOTAL, 'concepts underneath')
    );
    $('#m-summary-text').replaceChildren(...D.closing.map((t) => h('p', null, t)));
  }

  /* ============================================================== State */

  function applyAll({ animate = true } = {}) {
    kwEls.forEach((el, i) => {
      el.classList.toggle('is-unlit', i >= M.lit);
      el.classList.toggle('is-selected', i === M.summit);
      el.setAttribute('aria-pressed', String(i === M.summit));
    });
    peaks.forEach((p, i) => {
      p.g.classList.toggle('is-dim', i >= M.lit);
      p.g.classList.toggle('is-selected', i === M.summit);
    });
    $$('.xs-tab').forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === M.summit));
      t.tabIndex = i === M.summit || (M.summit < 0 && i === 0) ? 0 : -1;
    });
    if (builtSummit !== M.summit) {
      buildXs();
      applyDepth(false);
      if (animate) revealOpenLayers();
    } else {
      applyDepth(animate);
    }
    updateControls();
    $('#m-summary').classList.toggle('is-focus', M.summary);
    queueConnectors();
    setTimeout(queueConnectors, 700); // peaks rise with a transition
    GOP.emit('mountain:change');
  }

  function pick(i, { scroll = true } = {}) {
    if (i < 0 || i >= N) return;
    closeConcept();
    M.summary = false;
    M.lit = Math.max(M.lit, i + 1);
    M.summit = i;
    M.depth = presenterOn() ? 0 : DEPTH;
    applyAll();
    if (scroll) showXs();
  }

  function setDepth(d) {
    if (M.summit < 0) return;
    const before = M.depth;
    M.depth = Math.max(0, Math.min(DEPTH, d));
    M.summary = false;
    applyAll();
    if (M.depth > before) {
      const layer = $$('.xs__layer', $('#m-xs'))[M.depth - 1];
      if (layer) GOP.scrollToEl(layer, 'nearest');
    }
  }

  function showXs() {
    const sec = $('#m-xs-section');
    const r = sec.getBoundingClientRect();
    if (r.top > window.innerHeight * 0.45 || r.top < 0) GOP.scrollToEl(sec, 'start');
  }

  function light(from, to) {
    for (let i = from; i < to; i++) {
      const el = kwEls[i];
      if (!el) continue;
      el.classList.remove('is-lighting');
      void el.offsetWidth;
      el.classList.add('is-lighting');
      setTimeout(() => el.classList.remove('is-lighting'), 800);
    }
  }

  /* ==================================================== Presenter steps */

  const FIRST_SUMMIT_STEP = N + 1; // steps 0..N light the words one by one
  const PER_SUMMIT = DEPTH + 1; // L0 plus every layer
  const SUMMARY_STEP = FIRST_SUMMIT_STEP + N * PER_SUMMIT;

  function currentStep() {
    if (M.summary) return SUMMARY_STEP;
    if (M.summit < 0) return Math.min(M.lit, N);
    return FIRST_SUMMIT_STEP + M.summit * PER_SUMMIT + M.depth;
  }

  function goStep(s) {
    s = Math.max(0, Math.min(SUMMARY_STEP, s));
    closeConcept();
    const prevLit = M.lit;
    const prevSummit = M.summit;
    if (s <= N) {
      M.summary = false;
      M.lit = s;
      M.summit = -1;
      M.depth = 0;
      applyAll();
      if (s > prevLit) light(prevLit, s);
      if (s === 0) window.scrollTo({ top: 0, behavior: GOP.reduced() ? 'auto' : 'smooth' });
      else GOP.scrollToEl($('#m-top'), 'start');
      return;
    }
    if (s === SUMMARY_STEP) {
      M.summary = true;
      M.lit = N;
      M.summit = N - 1;
      M.depth = DEPTH;
      applyAll();
      GOP.scrollToEl($('#m-summary'), 'start');
      return;
    }
    const k = s - FIRST_SUMMIT_STEP;
    M.summary = false;
    M.lit = N;
    M.summit = Math.floor(k / PER_SUMMIT);
    M.depth = k % PER_SUMMIT;
    applyAll();
    if (M.summit !== prevSummit) GOP.scrollToEl($('#m-xs-section'), 'start');
    else if (M.depth > 0) {
      const layer = $$('.xs__layer', $('#m-xs'))[M.depth - 1];
      if (layer) GOP.scrollToEl(layer, 'nearest');
    }
  }

  function status() {
    if (M.summary) return { label: 'Summary', pos: `${TOTAL} concepts` };
    if (M.summit < 0) return { label: 'The prompt · technical words', pos: `${M.lit} / ${N}` };
    const where = M.depth === 0 ? 'L0 Summit' : `${LAYERS[M.depth - 1].code} ${LAYERS[M.depth - 1].name}`;
    return { label: `Summit ${M.summit + 1} of ${N} · ${SUMMITS[M.summit].word} · ${where}`, pos: `${currentStep() + 1} / ${SUMMARY_STEP + 1}` };
  }

  /* ============================================================ Keyboard */

  GOP.keys.add((e) => {
    if (view().hidden) return false;
    if (pop && e.key === 'Escape') {
      closeConcept(true);
      return true;
    }
    if (presenterOn()) return false;
    if (e.key === 'ArrowRight' && M.summit < N - 1) {
      pick(M.summit + 1, { scroll: false });
      return true;
    }
    if (e.key === 'ArrowLeft' && M.summit > 0) {
      pick(M.summit - 1, { scroll: false });
      return true;
    }
    return false;
  }, 400);

  /* ================================================================ API */

  function init() {
    renderConsole();
    buildRange();
    buildTabs();
    buildControls();
    renderSummary();
    applyAll({ animate: false });

    window.addEventListener('resize', () => {
      queueConnectors();
      clearTimeout(drawStars._t);
      drawStars._t = setTimeout(drawStars, 150);
    });
    if (window.ResizeObserver) new ResizeObserver(queueConnectors).observe($('#m-top'));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueConnectors);
    GOP.on('theme', () => drawStars());
    GOP.on('layout', () => {
      drawStars();
      queueConnectors();
    });
  }

  GOP.mountainView = {
    init,
    onShow() {
      drawStars();
      queueConnectors();
    },
    pick: (i) => pick(i, { scroll: false }),
    next() {
      const s = currentStep();
      if (s >= SUMMARY_STEP) return false;
      goStep(s + 1);
      return true;
    },
    prev() {
      const s = currentStep();
      if (s <= 0) return false;
      goStep(s - 1);
      return true;
    },
    first: () => goStep(0),
    last: () => goStep(SUMMARY_STEP),
    stepOut() {
      if (pop) closeConcept(true);
    },
    status
  };
})();
