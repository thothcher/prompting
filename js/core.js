/* Shared helpers. Classic scripts (no modules) so index.html also works
   when opened straight from disk. Everything hangs off window.GOP. */
(() => {
  'use strict';

  const GOP = (window.GOP = window.GOP || {});
  GOP.data = GOP.data || {};

  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---------- DOM ---------- */

  // h('div', { class: 'x', onclick: fn, style: { '--pc': 'red' } }, child, 'text', [more])
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'style' && typeof v === 'object') {
          for (const [p, val] of Object.entries(v)) el.style.setProperty(p, val);
        } else if (k.startsWith('on') && typeof v === 'function') {
          el.addEventListener(k.slice(2), v);
        } else {
          el.setAttribute(k, v === true ? '' : v);
        }
      }
    }
    append(el, kids);
    return el;
  }

  function append(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) {
      kid.forEach((k) => append(el, k));
      return;
    }
    el.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }

  function svg(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
    return el;
  }

  function icon(name, cls = 'icon') {
    const s = svg('svg', { class: cls, 'aria-hidden': 'true', focusable: 'false' });
    s.appendChild(svg('use', { href: '#i-' + name }));
    return s;
  }

  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  /* ---------- Storage (per-viewer conveniences only) ---------- */

  const store = {
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem('gop.' + key);
        return v === null ? fallback : v;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem('gop.' + key, value);
      } catch (e) {
        /* storage can be blocked; the page works without it */
      }
    }
  };

  /* ---------- Motion ---------- */

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => motionQuery.matches;

  // Adds .is-booting for one run of the entrance animations.
  function boot(el, ms = 1000) {
    if (!el) return;
    el.classList.remove('is-booting');
    void el.offsetWidth;
    el.classList.add('is-booting');
    clearTimeout(el._bootTimer);
    el._bootTimer = setTimeout(() => el.classList.remove('is-booting'), ms);
  }

  // Holographic unfold: a thin line grows from the origin, then opens up.
  function unfold(el, originRect, duration = 460) {
    if (!el || !el.animate) return;
    if (reduced() || !originRect) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
      return;
    }
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dx = originRect.left + originRect.width / 2 - (r.left + r.width / 2);
    const dy = originRect.top + originRect.height / 2 - (r.top + r.height / 2);
    const sx = Math.min(1, Math.max(0.06, originRect.width / r.width));
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, 0.02)`, opacity: 0.2 },
        { transform: `translate(${dx * 0.2}px, ${dy * 0.2}px) scale(1, 0.02)`, opacity: 0.95, offset: 0.42 },
        { transform: 'none', opacity: 1 }
      ],
      { duration, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
    );
  }

  // Text that scrambles and settles, for short mono labels.
  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#+-';
  function decode(el, finalText, duration = 520) {
    if (!el) return;
    const text = String(finalText);
    const id = (el._decodeId = (el._decodeId || 0) + 1);
    if (reduced()) {
      el.textContent = text;
      return;
    }
    const start = performance.now();
    const frame = (now) => {
      if (el._decodeId !== id) return;
      const p = Math.min(1, (now - start) / duration);
      const fixed = Math.floor(p * text.length);
      let out = text.slice(0, fixed);
      for (let i = fixed; i < text.length; i++) {
        out += /\s/.test(text[i]) ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = text;
    };
    requestAnimationFrame(frame);
  }

  /* ---------- Text ---------- */

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

  // Inline Markdown after escaping: `code` and **bold**.
  const inline = (s) =>
    esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Renders prompt text: #/## headings, - bullets, 1. lists (with indented
  // continuation lines), ``` code fences, lone <xml> tag lines, paragraphs.
  function rich(text) {
    const lines = String(text).replace(/\r/g, '').split('\n');
    let out = '';
    let para = [];
    let list = null;
    let fence = null;

    const flushPara = () => {
      if (para.length) out += '<p>' + para.map(inline).join('<br>') + '</p>';
      para = [];
    };
    const flushList = () => {
      if (!list) return;
      out += `<${list.tag}>` + list.items.map((it) => '<li>' + it.map(inline).join('<br>') + '</li>').join('') + `</${list.tag}>`;
      list = null;
    };

    for (const raw of lines) {
      if (fence) {
        if (/^\s*```/.test(raw)) {
          out += `<pre class="code"${fence.lang ? ` data-lang="${esc(fence.lang)}"` : ''}><code>${esc(fence.body.join('\n'))}</code></pre>`;
          fence = null;
        } else {
          fence.body.push(raw);
        }
        continue;
      }
      const line = raw.replace(/\s+$/, '');
      let m;
      if ((m = /^\s*```(\w*)/.exec(line))) {
        flushPara();
        flushList();
        fence = { lang: m[1], body: [] };
      } else if (!line.trim()) {
        flushPara();
        flushList();
      } else if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
        flushPara();
        flushList();
        out += `<p class="md-h"><span class="md-mark">${m[1]}</span>${inline(m[2])}</p>`;
      } else if (/^<\/?[a-z_]+>$/.test(line.trim())) {
        flushPara();
        flushList();
        out += `<p class="xml-tag">${esc(line.trim())}</p>`;
      } else if ((m = /^\s*[-*]\s+(.*)$/.exec(line))) {
        flushPara();
        if (!list || list.tag !== 'ul') {
          flushList();
          list = { tag: 'ul', items: [] };
        }
        list.items.push([m[1]]);
      } else if ((m = /^\s*\d+\.\s+(.*)$/.exec(line))) {
        flushPara();
        if (!list || list.tag !== 'ol') {
          flushList();
          list = { tag: 'ol', items: [] };
        }
        list.items.push([m[1]]);
      } else if (list && /^\s{2,}\S/.test(raw)) {
        list.items[list.items.length - 1].push(line.trim());
      } else {
        flushList();
        para.push(line);
      }
    }
    if (fence) out += `<pre class="code"><code>${esc(fence.body.join('\n'))}</code></pre>`;
    flushPara();
    flushList();
    return out;
  }

  const words = (s) => (String(s).match(/\S+/g) || []).length;
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- Clipboard ---------- */

  // Call from inside a click handler: the clipboard API needs the user gesture.
  function copyText(text) {
    const fallback = () => {
      try {
        const ta = h('textarea', { 'aria-hidden': 'true', style: { position: 'fixed', top: '-1000px', left: '0', opacity: '0' } });
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch (e) {
        return false;
      }
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(() => true, () => fallback());
      }
    } catch (e) {
      /* fall through */
    }
    return Promise.resolve(fallback());
  }

  /* ---------- Events and keys ---------- */

  const bus = {};
  const on = (name, fn) => (bus[name] = bus[name] || []).push(fn);
  const emit = (name, data) => (bus[name] || []).forEach((fn) => fn(data));

  // One keydown listener; handlers run from highest priority down and
  // return true when they used the key.
  const keyHandlers = [];
  const keys = {
    add(fn, priority = 0) {
      const entry = { fn, priority };
      keyHandlers.push(entry);
      keyHandlers.sort((a, b) => b.priority - a.priority);
      return () => {
        const i = keyHandlers.indexOf(entry);
        if (i >= 0) keyHandlers.splice(i, 1);
      };
    }
  };

  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.isComposing) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if (typing && e.key !== 'Escape') return;
    for (const entry of keyHandlers.slice()) {
      if (entry.fn(e) === true) {
        e.preventDefault();
        return;
      }
    }
  });

  /* ---------- Misc ---------- */

  function scrollToEl(el, block = 'start') {
    if (!el) return;
    el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block });
  }

  function setHash(hash) {
    try {
      history.replaceState(null, '', '#' + hash);
    } catch (e) {
      /* some embedded viewers block history changes */
    }
  }

  Object.assign(GOP, {
    h, svg, icon, $, $$, store, reduced, motionQuery, boot, unfold, decode,
    esc, inline, rich, words, pad, copyText, on, emit, keys, scrollToEl, setHash
  });
})();
