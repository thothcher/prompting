/* Page one: hero letters, origins, rules, and the ten prompt drawers. */
(() => {
  'use strict';

  const GOP = window.GOP;
  const { h, $, icon, rich, words, pad } = GOP;
  const FW = GOP.data.framework;
  const PROMPTS = GOP.data.prompts;
  const PARTS = FW.parts;
  const PART = Object.fromEntries(PARTS.map((p) => [p.key, p]));
  const PRE_STEPS = ['framework', 'origins', 'rules', 'library'];
  const PRE_LABELS = ['Overview', 'Origins', 'Six habits', 'The library'];

  const pcVar = (key) => `var(--p-${key.toLowerCase()})`;
  const wide = window.matchMedia('(min-width: 1100px)');

  const S = { filter: 'all', open: null, explain: null, modal: null, pre: 0 };
  const drawers = [];

  const promptText = (p) => p.blocks.map((b) => b.text).join('\n\n');
  const tokensFor = (n) => Math.round(n * 1.35);

  /* ================================================================ Hero */

  function renderHero() {
    const list = $('#bp-letters');
    PARTS.forEach((p, i) => {
      list.appendChild(
        h('li', { class: 'bp__item', style: { '--pc': pcVar(p.key), '--i': String(i) } },
          h('button', {
            class: 'bp__tile',
            type: 'button',
            'aria-label': `${p.key}, ${p.name}: ${p.question}`,
            onclick: (e) => openPartCard(p, e.currentTarget)
          },
            h('span', { class: 'bp__letter', 'aria-hidden': 'true' }, p.key),
            h('span', { class: 'bp__name', 'aria-hidden': 'true' }, p.name),
            h('span', { class: 'bp__q', 'aria-hidden': 'true' }, p.question)
          )
        )
      );
    });

    const groups = $('#bp-groups');
    Object.entries(FW.groups).forEach(([id, g]) => {
      groups.appendChild(h('div', { class: 'bp-group bp-group--' + id }, g.label));
    });

    const total = PROMPTS.reduce((n, p) => n + p.blocks.length, 0);
    $('#hero-meta').replaceChildren(
      h('span', null, `${PROMPTS.length} prompts`),
      h('span', null, `${PARTS.length} blocks each`),
      h('span', null, `${total} explanations`),
      h('span', null, 'Angular 22'),
      h('span', null, 'Next.js 16.3')
    );
    $('#hero-note').textContent = FW.note;
  }

  // The general card for one BLUEPRINTS block, opened from the hero letters.
  function openPartCard(p, originEl) {
    const index = PARTS.indexOf(p);
    const ex = PROMPTS.find((x) => x.n === p.example) || PROMPTS[0];
    const exIndex = ex.blocks.findIndex((b) => b.part === p.key);

    GOP.holo.open({
      origin: originEl,
      label: `${p.name} block`,
      pc: pcVar(p.key),
      render(body, ctrl) {
        body.appendChild(
          h('div', { class: 'card' },
            h('div', { class: 'card__head' },
              h('span', { class: 'card__letter', 'aria-hidden': 'true' }, p.key),
              h('div', null,
                h('p', { class: 'card__kicker' }, `${FW.groups[p.group].label} · Block ${index + 1} of ${PARTS.length}`),
                h('h2', { class: 'card__name' }, p.name)
              )
            ),
            h('p', { class: 'card__q' }, p.question),
            h('p', { class: 'card__does' }, p.does),
            h('div', { class: 'card__cols' },
              h('div', null,
                h('h4', null, icon('check'), 'Include'),
                h('ul', null, p.include.map((x) => h('li', null, x)))
              ),
              h('div', null,
                h('h4', null, icon('alert'), 'Common mistake'),
                h('p', { class: 'card__mistake' }, p.mistake)
              )
            ),
            p.quote ? h('p', { class: 'card__quote' }, p.quote) : null,
            h('div', { class: 'card__foot' },
              h('p', null, `See it in prompt ${pad(ex.n)}: ${ex.title}`),
              h('button', {
                class: 'btn btn--primary',
                type: 'button',
                'data-autofocus': '',
                onclick: () => {
                  ctrl.close(true);
                  showPromptBlock(PROMPTS.indexOf(ex), exIndex);
                }
              }, 'Open the example', icon('arrow-right'))
            )
          )
        );
      }
    });
  }

  /* ============================================================= Origins */

  function renderOrigins() {
    const cards = $('#origins-cards');
    FW.classics.forEach((c) => {
      cards.appendChild(
        h('article', { class: 'fw' },
          h('div', { class: 'fw__top' }, h('h3', { class: 'fw__name' }, c.name), h('span', { class: 'fw__year' }, c.year)),
          h('ul', { class: 'fw__letters' }, c.letters.map(([l, w]) => h('li', null, h('b', null, l), w))),
          h('p', { class: 'fw__note' }, c.note)
        )
      );
    });
    const cx = FW.context;
    cards.appendChild(
      h('article', { class: 'fw fw--new' },
        h('div', { class: 'fw__top' }, h('h3', { class: 'fw__name' }, cx.name), h('span', { class: 'fw__year' }, cx.year)),
        h('p', { class: 'fw__text' }, cx.text),
        h('p', { class: 'fw__quote' }, cx.quote),
        h('p', { class: 'fw__note' }, cx.note)
      )
    );

    const cols = ['CRAFT', 'CO-STAR', 'RISEN'];
    const covWords = { 2: 'Covered', 1: 'Partly covered', 0: 'Not covered' };
    const table = h('table', { class: 'matrix' },
      h('caption', null, FW.coverageSummary),
      h('thead', null, h('tr', null, h('th', { scope: 'col' }, 'BLUEPRINTS block'), cols.map((c) => h('th', { scope: 'col' }, c)))),
      h('tbody', null,
        PARTS.map((p) => {
          const row = FW.coverage[p.key];
          const gap = cols.every((c) => row[c][0] === 0);
          return h('tr', { class: gap ? 'is-gap' : null, style: { '--pc': pcVar(p.key) } },
            h('th', { scope: 'row' },
              h('span', { class: 'matrix__part' },
                h('span', { class: 'lb lb--sm', style: { '--pc': pcVar(p.key) }, 'aria-hidden': 'true' }, p.key),
                h('span', null, h('b', null, p.name), h('small', null, p.question))
              )
            ),
            cols.map((c) => {
              const [v, label] = row[c];
              return h('td', null,
                h('i', { class: 'cov', 'data-v': String(v), 'aria-hidden': 'true' }),
                h('span', { class: 'sr-only' }, covWords[v] + (label ? ': ' : '')),
                label || h('span', { 'aria-hidden': 'true' }, '-')
              );
            })
          );
        })
      )
    );
    $('#matrix').appendChild(table);
  }

  /* =============================================================== Rules */

  function renderRules() {
    const grid = $('#rules-grid');
    FW.rules.forEach((r) => {
      grid.appendChild(
        h('li', { class: 'rule' },
          h('h3', null, r.title),
          h('p', null, r.text),
          h('p', { class: 'rule__tags' },
            'Lives in',
            r.parts.map((k) => h('span', { class: 'lb lb--sm', style: { '--pc': pcVar(k) }, title: PART[k].name }, k))
          )
        )
      );
    });
  }

  /* ============================================================= Library */

  function renderFilter() {
    const seg = $('#filter');
    const count = (s) => PROMPTS.filter((p) => s === 'all' || p.stack === s).length;
    [['all', 'All'], ['angular', 'Angular'], ['next', 'Next.js']].forEach(([id, label]) => {
      seg.appendChild(
        h('button', { type: 'button', 'aria-pressed': String(id === S.filter), 'data-filter': id, onclick: () => setFilter(id) },
          label, h('small', null, String(count(id)))
        )
      );
    });
  }

  function setFilter(id) {
    S.filter = id;
    $('#filter').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === id)));
    drawers.forEach((d) => {
      d.li.hidden = !(id === 'all' || d.prompt.stack === id);
    });
    if (S.open !== null && drawers[S.open].li.hidden) closePrompt({ instant: true });
    GOP.emit('prompts:change');
  }

  function buildDrawer(prompt, index) {
    const n = pad(prompt.n);
    const total = words(promptText(prompt));
    const headId = 'dh-' + n;
    const panelId = 'dp-' + n;

    const head = h('button', {
      class: 'drawer__head',
      id: headId,
      type: 'button',
      'aria-expanded': 'false',
      'aria-controls': panelId,
      onclick: () => (S.open === index ? closePrompt() : openPrompt(index))
    },
      h('span', { class: 'drawer__num', 'aria-hidden': 'true' }, n),
      h('span', { class: 'drawer__main' },
        h('span', { class: 'drawer__meta' },
          h('span', { class: 'stack stack--' + prompt.stack }, prompt.stackLabel),
          h('span', { class: 'level', title: prompt.levelLabel },
            h('span', { class: 'level__label' }, prompt.levelLabel),
            [1, 2, 3, 4].map((l) => h('i', { class: l <= prompt.level ? 'on' : null, 'aria-hidden': 'true' }))
          )
        ),
        h('span', { class: 'drawer__title' }, h('span', { class: 'sr-only' }, `Prompt ${n}: `), prompt.title),
        h('span', { class: 'drawer__sum' }, prompt.summary)
      ),
      h('span', { class: 'drawer__tech' }, 'Teaches', h('b', null, prompt.technique.name)),
      h('span', { class: 'drawer__chev', 'aria-hidden': 'true' }, icon('chevron'))
    );

    // Title block values decode when the window opens.
    const tbCell = (label, value) => h('div', null, h('dt', null, label), h('dd', { 'data-final': value }, value));
    const tb = h('dl', { class: 'tb' },
      tbCell('Dwg', 'P-' + n),
      tbCell('Sheet', `${n} / ${pad(PROMPTS.length)}`),
      tbCell('Stack', prompt.stackLabel),
      tbCell('Blocks', String(prompt.blocks.length)),
      tbCell('Words', String(total)),
      tbCell('≈ Tokens', String(tokensFor(total)))
    );

    const copyBtn = h('button', { class: 'btn btn--primary', type: 'button' }, icon('copy'), h('span', null, 'Copy prompt'));
    copyBtn.addEventListener('click', () => copyPrompt(prompt, copyBtn));

    const segs = prompt.blocks.map((b, bi) =>
      h('button', {
        class: 'dna__seg',
        type: 'button',
        style: { '--pc': pcVar(b.part), '--w': String(Math.max(1, words(b.text))), '--i': String(bi) },
        title: `${b.part} · ${PART[b.part].name} · ${words(b.text)} words`,
        'aria-label': `Explain block ${b.part}, ${PART[b.part].name}, ${words(b.text)} words`,
        onclick: (e) => showExplain(bi, { origin: e.currentTarget })
      })
    );

    const blocks = prompt.blocks.map((b, bi) => {
      const part = PART[b.part];
      const isTech = prompt.technique.part === b.part;
      const whyBtn = h('button', {
        class: 'blk__why',
        type: 'button',
        'aria-label': `Why block ${b.part}, ${part.name}?`,
        onclick: (e) => {
          e.stopPropagation();
          showExplain(bi, { origin: li });
        }
      }, icon('info'), 'Why?');
      const li = h('li', { class: 'blk', 'data-part': b.part, style: { '--pc': pcVar(b.part), '--i': String(bi) } },
        h('div', { class: 'blk__gutter' },
          h('span', { class: 'blk__label' },
            h('span', { class: 'lb', 'aria-hidden': 'true' }, b.part),
            h('span', { class: 'blk__name' }, part.name)
          ),
          isTech ? h('span', { class: 'blk__tech' }, 'Technique') : null,
          whyBtn
        ),
        h('div', { class: 'blk__body rich', html: rich(b.text) })
      );
      li.addEventListener('click', () => {
        const sel = window.getSelection && String(window.getSelection());
        if (sel) return; // the user is selecting text, not asking for help
        showExplain(bi, { origin: li });
      });
      return li;
    });

    const dockBody = h('div', { class: 'dock__body' });
    const dock = h('aside', { class: 'dock holo', 'aria-label': `Why each block of prompt ${n} is there`, hidden: '' },
      GOP.holo.corners(),
      h('span', { class: 'scan', 'aria-hidden': 'true' }),
      h('button', {
        class: 'icon-btn holo__close',
        type: 'button',
        'aria-label': 'Close explanation',
        title: 'Close (Esc)',
        onclick: () => hideExplain()
      }, icon('close')),
      dockBody
    );

    const techIndex = prompt.blocks.findIndex((b) => b.part === prompt.technique.part);
    const pw = h('div', { class: 'pw' },
      GOP.holo.corners(),
      h('span', { class: 'scan', 'aria-hidden': 'true' }),
      h('div', { class: 'pw__bar' }, tb, h('div', { class: 'pw__actions' }, copyBtn)),
      h('div', { class: 'dna' },
        h('div', { class: 'dna__bar', role: 'group', 'aria-label': 'Prompt DNA: one segment per block, sized by word count' }, segs),
        h('div', { class: 'dna__dim', 'aria-hidden': 'true' }, h('i'), h('span', null, `${total} words · ${prompt.blocks.length} blocks`), h('i'))
      ),
      h('div', { class: 'pw__grid' }, h('ol', { class: 'blocks', 'aria-label': `Blocks of prompt ${n}` }, blocks), dock),
      h('div', { class: 'pw__foot' },
        h('p', null, icon('spark'), h('b', null, `Technique: ${prompt.technique.name}. `), prompt.technique.text),
        h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => showExplain(techIndex, { origin: blocks[techIndex] }) },
          `See block ${prompt.technique.part}`, icon('arrow-right'))
      )
    );

    const panel = h('div', { class: 'drawer__panel', id: panelId, role: 'region', 'aria-labelledby': headId, inert: '' },
      h('div', { class: 'drawer__clip' }, pw)
    );
    const li = h('li', { class: 'drawer', id: 'p' + n, 'data-stack': prompt.stack }, h('h3', { class: 'drawer__h' }, head), panel);

    return { li, head, panel, pw, dock, dockBody, blocks, segs, tb, prompt };
  }

  function renderDrawers() {
    const list = $('#drawers');
    PROMPTS.forEach((p, i) => {
      const d = buildDrawer(p, i);
      drawers.push(d);
      list.appendChild(d.li);
    });
  }

  function copyPrompt(prompt, btn) {
    const label = btn.querySelector('span');
    GOP.copyText(promptText(prompt)).then((ok) => {
      if (!ok) {
        copyFallback(prompt, btn);
        return;
      }
      btn.classList.add('is-done');
      label.textContent = 'Copied';
      btn.querySelector('use').setAttribute('href', '#i-check');
      clearTimeout(btn._t);
      btn._t = setTimeout(() => {
        btn.classList.remove('is-done');
        label.textContent = 'Copy prompt';
        btn.querySelector('use').setAttribute('href', '#i-copy');
      }, 1800);
    });
  }

  // When the browser refuses clipboard access, show the plain text selected.
  function copyFallback(prompt, originEl) {
    GOP.holo.open({
      origin: originEl,
      label: 'Copy the prompt',
      render(body) {
        const box = h('textarea', { class: 'copybox__text', readonly: '', rows: '14', 'aria-label': `Text of prompt ${pad(prompt.n)}`, 'data-autofocus': '' });
        box.value = promptText(prompt);
        body.appendChild(
          h('div', { class: 'copybox' },
            h('h2', null, 'Copy the prompt'),
            h('p', null, 'This browser blocked automatic copying. The text below is selected: press Ctrl+C, or Cmd+C on a Mac.'),
            box
          )
        );
        requestAnimationFrame(() => requestAnimationFrame(() => box.select()));
      }
    });
  }

  /* ======================================================= Open / close */

  function openPrompt(i, { scroll = true } = {}) {
    if (S.open === i) return;
    if (S.open !== null) closePrompt({ instant: true, keepHash: true });
    const d = drawers[i];
    if (d.li.hidden) setFilter('all');
    S.open = i;
    S.explain = null;
    d.li.classList.add('is-open');
    d.head.setAttribute('aria-expanded', 'true');
    d.panel.removeAttribute('inert');
    GOP.boot(d.pw, 1500);
    d.tb.querySelectorAll('dd').forEach((dd) => GOP.decode(dd, dd.dataset.final, 620));
    if (scroll) GOP.scrollToEl(d.li, 'start');
    GOP.setHash('p' + pad(d.prompt.n));
    GOP.emit('prompts:change');
  }

  function closePrompt({ instant = false, keepHash = false } = {}) {
    if (S.open === null) return;
    const d = drawers[S.open];
    hideExplain({ silent: true });
    if (instant) d.panel.classList.add('no-anim');
    d.li.classList.remove('is-open');
    d.head.setAttribute('aria-expanded', 'false');
    d.panel.setAttribute('inert', '');
    if (instant) {
      void d.panel.offsetHeight;
      requestAnimationFrame(() => d.panel.classList.remove('no-anim'));
    }
    S.open = null;
    if (!keepHash) GOP.setHash('library');
    GOP.emit('prompts:change');
  }

  function setActive(d, bi) {
    d.blocks.forEach((b, i) => b.classList.toggle('is-active', i === bi));
    d.segs.forEach((s, i) => s.classList.toggle('is-active', i === bi));
  }

  /* ======================================================== Explanation */

  function renderExplain(container, prompt, bi, { quote = false } = {}) {
    const b = prompt.blocks[bi];
    const part = PART[b.part];
    const n = prompt.blocks.length;
    const isTech = prompt.technique.part === b.part;
    const nameId = `ex-${prompt.n}-${bi}`;
    const focusedRole = document.activeElement && container.contains(document.activeElement) ? document.activeElement.dataset.role : null;

    container.style.setProperty('--pc', pcVar(b.part));

    const sec = (title, text, mod, iconName) =>
      h('section', { class: 'ex__sec' + (mod ? ' ex__sec--' + mod : '') },
        h('h4', null, iconName ? icon(iconName) : null, title),
        h('p', { html: GOP.inline(text) })
      );

    let quoteEl = null;
    if (quote) {
      const box = h('div', { class: 'ex__quote rich', html: rich(b.text) });
      const more = h('button', { class: 'ex__more', type: 'button' }, 'Show the whole block');
      more.addEventListener('click', () => {
        const full = box.classList.toggle('is-full');
        more.textContent = full ? 'Show less' : 'Show the whole block';
      });
      quoteEl = h('div', null, box, words(b.text) > 45 ? more : null);
    }

    const ex = h('div', { class: 'ex' },
      h('div', { class: 'ex__head' },
        h('span', { class: 'ex__letter', 'aria-hidden': 'true' }, b.part),
        h('div', null,
          h('p', { class: 'ex__kicker' }, `${FW.groups[part.group].label} · Block ${bi + 1} of ${n}`),
          h('h3', { class: 'ex__name', id: nameId, tabindex: '-1' }, part.name)
        )
      ),
      isTech ? h('p', { class: 'ex__tech' }, icon('spark'), `Technique of this prompt: ${prompt.technique.name}`) : null,
      h('p', { class: 'ex__does' }, part.does),
      quoteEl,
      sec('Why it is written this way here', b.why, null, 'info'),
      sec('Without it', b.without, 'without', 'alert'),
      b.tip ? sec('Tip', b.tip, 'tip', 'bulb') : null,
      h('div', { class: 'ex__foot' },
        h('button', { class: 'btn btn--ghost', type: 'button', 'data-role': 'prev', disabled: bi === 0 ? '' : null, onclick: () => stepExplain(-1) },
          icon('arrow-left'), 'Previous'),
        h('div', { class: 'ticks', role: 'group', 'aria-label': 'Jump to a block' },
          prompt.blocks.map((x, i) =>
            h('button', {
              class: 'tick',
              type: 'button',
              style: { '--tc': pcVar(x.part) },
              'aria-label': `Block ${x.part}, ${PART[x.part].name}`,
              'aria-current': i === bi ? 'true' : null,
              onclick: () => showExplain(i)
            })
          )
        ),
        h('button', { class: 'btn btn--ghost', type: 'button', 'data-role': 'next', disabled: bi === n - 1 ? '' : null, onclick: () => stepExplain(1) },
          'Next', icon('arrow-right'))
      )
    );

    container.replaceChildren(ex);

    if (focusedRole) {
      const again = container.querySelector(`[data-role="${focusedRole}"]:not([disabled])`);
      (again || container.querySelector('.ex__name')).focus({ preventScroll: true });
    }
    return ex;
  }

  function swapAnim(container, dir) {
    container.style.setProperty('--dir', String(dir || 1));
    container.classList.remove('is-swapping');
    void container.offsetWidth;
    container.classList.add('is-swapping');
    clearTimeout(container._swapT);
    container._swapT = setTimeout(() => container.classList.remove('is-swapping'), 360);
  }

  function showExplain(bi, { origin } = {}) {
    if (S.open === null) return;
    const d = drawers[S.open];
    bi = Math.max(0, Math.min(d.prompt.blocks.length - 1, bi));
    const prev = S.explain;
    S.explain = bi;
    setActive(d, bi);
    const originEl = origin || d.blocks[bi];

    if (wide.matches) {
      if (S.modal) {
        const m = S.modal;
        S.modal = null;
        m.close(true);
      }
      const first = d.dock.hidden || !d.pw.classList.contains('has-dock');
      d.dock.hidden = false;
      d.pw.classList.add('has-dock');
      renderExplain(d.dockBody, d.prompt, bi);
      d.dock.style.setProperty('--pc', pcVar(d.prompt.blocks[bi].part));
      if (first) {
        GOP.boot(d.dock, 1100);
        d.dockBody.querySelector('.ex__name').focus({ preventScroll: true });
      } else if (prev !== bi) {
        swapAnim(d.dockBody, bi > prev ? 1 : -1);
      }
      GOP.decode(d.dockBody.querySelector('.ex__name'), PART[d.prompt.blocks[bi].part].name, 360);
      d.dock.scrollTop = 0;
      setTimeout(() => keepVisible(d.blocks[bi]), first ? 460 : 40);
    } else {
      if (S.modal) {
        renderExplain(S.modal.body, d.prompt, bi, { quote: true });
        S.modal.el.style.setProperty('--pc', pcVar(d.prompt.blocks[bi].part));
        S.modal.returnTo = d.blocks[bi];
        S.modal.el.scrollTop = 0;
        if (prev !== bi) swapAnim(S.modal.body, bi > prev ? 1 : -1);
      } else {
        const ctrl = GOP.holo.open({
          origin: originEl,
          kind: 'explain',
          label: `Why block ${d.prompt.blocks[bi].part} is there`,
          pc: pcVar(d.prompt.blocks[bi].part),
          render: (body) => renderExplain(body, d.prompt, bi, { quote: true }),
          onKey: (e) => {
            if (GOP.presenter && GOP.presenter.isOn()) return false;
            if (e.key === 'ArrowRight') { stepExplain(1); return true; }
            if (e.key === 'ArrowLeft') { stepExplain(-1); return true; }
            return false;
          },
          onClose: (c) => {
            if (S.modal !== c) return;
            S.modal = null;
            S.explain = null;
            if (S.open !== null) setActive(drawers[S.open], -1);
            GOP.emit('prompts:change');
          }
        });
        ctrl.returnTo = d.blocks[bi];
        S.modal = ctrl;
      }
    }
    GOP.emit('prompts:change');
  }

  function stepExplain(delta) {
    if (S.open === null || S.explain === null) return;
    const next = S.explain + delta;
    if (next < 0 || next >= drawers[S.open].prompt.blocks.length) return;
    showExplain(next);
  }

  function hideExplain({ silent = false } = {}) {
    if (S.explain === null || S.open === null) {
      S.explain = null;
      return;
    }
    const d = drawers[S.open];
    const active = d.blocks[S.explain];
    S.explain = null;
    setActive(d, -1);
    if (S.modal) {
      const m = S.modal;
      S.modal = null;
      m.close(true);
    }
    d.pw.classList.remove('has-dock');
    setTimeout(() => {
      if (!d.pw.classList.contains('has-dock')) d.dock.hidden = true;
    }, 440);
    if (!silent && active) active.querySelector('.blk__why').focus({ preventScroll: true });
    GOP.emit('prompts:change');
  }

  function keepVisible(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--topbar-h')) || 64;
    if (r.top < top + 8 || r.bottom > window.innerHeight - 8) GOP.scrollToEl(el, 'center');
  }

  // Opens prompt i and shows the explanation of block bi.
  function showPromptBlock(i, bi) {
    openPrompt(i);
    setTimeout(() => showExplain(bi), GOP.reduced() ? 0 : 480);
  }

  // Move the explanation between dock and modal when the window is resized.
  wide.addEventListener('change', () => {
    if (S.open !== null && S.explain !== null) {
      const bi = S.explain;
      if (wide.matches) showExplain(bi);
      else {
        const d = drawers[S.open];
        d.pw.classList.remove('has-dock');
        d.dock.hidden = true;
        showExplain(bi);
      }
    }
  });

  /* ============================================================ Keyboard */

  const isActive = () => !document.getElementById('view-prompts').hidden;

  GOP.keys.add((e) => {
    if (!isActive() || (GOP.presenter && GOP.presenter.isOn())) return false;
    if (S.explain !== null && !S.modal) {
      if (e.key === 'ArrowRight') { stepExplain(1); return true; }
      if (e.key === 'ArrowLeft') { stepExplain(-1); return true; }
      if (e.key === 'Escape') { hideExplain(); return true; }
    } else if (S.open !== null && e.key === 'Escape') {
      const d = drawers[S.open];
      closePrompt();
      d.head.focus({ preventScroll: true });
      return true;
    }
    return false;
  }, 300);

  /* ===================================================== Presenter steps */

  const visible = () => drawers.map((d, i) => i).filter((i) => !drawers[i].li.hidden);
  const BLOCK_STEPS = 11; // open + ten blocks

  function currentStep() {
    const vis = visible();
    if (S.open !== null) {
      const p = vis.indexOf(S.open);
      if (p >= 0) return PRE_STEPS.length + p * BLOCK_STEPS + (S.explain === null ? 0 : S.explain + 1);
    }
    return Math.min(S.pre, PRE_STEPS.length - 1);
  }

  const lastStep = () => PRE_STEPS.length + visible().length * BLOCK_STEPS - 1;

  function goStep(s) {
    s = Math.max(0, Math.min(lastStep(), s));
    const vis = visible();
    if (s < PRE_STEPS.length) {
      closePrompt({ instant: true });
      S.pre = s;
      const target = document.getElementById(PRE_STEPS[s]);
      if (s === 0) window.scrollTo({ top: 0, behavior: GOP.reduced() ? 'auto' : 'smooth' });
      else GOP.scrollToEl(target, 'start');
      GOP.emit('prompts:change');
      return;
    }
    const k = s - PRE_STEPS.length;
    const i = vis[Math.floor(k / BLOCK_STEPS)];
    const e = k % BLOCK_STEPS;
    if (S.open !== i) openPrompt(i);
    if (e === 0) {
      hideExplain({ silent: true });
      GOP.scrollToEl(drawers[i].li, 'start');
    } else {
      showExplain(e - 1);
    }
  }

  function status() {
    const s = currentStep();
    if (s < PRE_STEPS.length) return { label: PRE_LABELS[s], pos: `${s + 1} / ${PRE_STEPS.length}` };
    const d = drawers[S.open];
    const n = pad(d.prompt.n);
    if (S.explain === null) return { label: `Prompt ${n} · ${d.prompt.title}`, pos: 'open' };
    const b = d.prompt.blocks[S.explain];
    return { label: `Prompt ${n} · ${b.part} ${PART[b.part].name}`, pos: `${S.explain + 1} / ${d.prompt.blocks.length}` };
  }

  /* ================================================================ API */

  function init() {
    renderHero();
    renderOrigins();
    renderRules();
    renderFilter();
    renderDrawers();
  }

  GOP.promptsView = {
    init,
    openByNumber(n) {
      const i = PROMPTS.findIndex((p) => p.n === n);
      if (i >= 0) openPrompt(i);
    },
    showSection(id) {
      closePrompt({ instant: true, keepHash: true });
      GOP.scrollToEl(document.getElementById(id), 'start');
    },
    next() {
      const s = currentStep();
      if (s >= lastStep()) return false;
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
    last: () => goStep(lastStep()),
    stepOut() {
      if (S.explain !== null) hideExplain();
      else if (S.open !== null) closePrompt();
    },
    status
  };
})();
