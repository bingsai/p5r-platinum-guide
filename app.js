/* ==========================================================================
   P5R PLATINUM COMPANION — app.js
   Vanilla JS · localStorage persistence · no dependencies
   ========================================================================== */
(function () {
  'use strict';

  const P5R = window.P5R;
  if (!P5R) { console.error('trophies.js must load before app.js'); return; }

  const STORAGE_KEY = 'p5r-platinum-companion-v1';
  const SAVE_VERSION = 1;
  const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

  /* ---------------------------------------------------------------- utils */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const escapeHTML = (str) => String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  /** Escape text, then wrap query matches in <mark>. */
  function highlight(text, query) {
    const safe = escapeHTML(text);
    if (!query) return safe;
    const re = new RegExp('(' + escapeRegExp(escapeHTML(query)) + ')', 'ig');
    return safe.replace(re, '<mark>$1</mark>');
  }

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  /* ---------------------------------------------------------------- state */
  const defaultState = () => ({
    version: SAVE_VERSION,
    trophies: {},      // { [id]: ISO date earned }
    roadmap: {},       // { [stepId]: true }
    revealed: {},      // { [id]: true } per-card spoiler reveals
    shield: true,      // Spoiler Shield on
    theme: 'dark'
  });

  let state = loadState();

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return sanitize(raw) || defaultState();
    } catch (e) {
      return defaultState();
    }
  }

  /** Accept only the expected shape (protects against bad imports). */
  function sanitize(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const s = defaultState();
    const copyMap = (src, valid) => {
      const out = {};
      if (src && typeof src === 'object') {
        Object.keys(src).forEach(k => { if (typeof k === 'string' && k.length < 80 && valid(src[k])) out[k] = src[k]; });
      }
      return out;
    };
    s.trophies = copyMap(raw.trophies, v => v === true || typeof v === 'string');
    s.roadmap = copyMap(raw.roadmap, v => v === true);
    s.revealed = copyMap(raw.revealed, v => v === true);
    s.shield = raw.shield !== false;
    s.theme = raw.theme === 'light' ? 'light' : 'dark';
    return s;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { toast('Could not save. Is browser storage full or disabled?'); }
  }

  /* ---------------------------------------------------------------- ui state (not persisted) */
  const ui = {
    grade: 'all',
    status: 'all',
    tags: new Set(),
    query: '',
    classQuery: '',
    classMonth: 'all',
    examOnly: false,
    confQuery: '',
    confDeadline: false,
    confRomance: false
  };

  /* ---------------------------------------------------------------- toast */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  /* ================================================================ THEME */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const btn = $('#themeToggle');
    const light = state.theme === 'light';
    btn.setAttribute('aria-pressed', String(light));
    $('.iconbtn__icon', btn).textContent = light ? '☀' : '☾';
    $('.iconbtn__label', btn).textContent = light ? 'Metaverse Light' : 'Phantom Thief Dark';
    btn.title = light ? 'Metaverse High-Contrast Light Mode: click for Dark' : 'Phantom Thief Dark Mode: click for Light';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', light ? '#ffffff' : '#0b0b0d');
  }

  /* ================================================================ SPOILER SHIELD */
  function applyShieldButton() {
    const btn = $('#spoilerToggle');
    btn.setAttribute('aria-pressed', String(!state.shield));
    $('.iconbtn__icon', btn).textContent = state.shield ? '🕶' : '👁';
    btn.title = state.shield ? 'Spoiler Shield is ON: click to show all spoilers' : 'Spoiler Shield is OFF: click to hide spoilers';
    $('.iconbtn__label', btn).textContent = state.shield ? 'Spoilers: Hidden' : 'Spoilers: Shown';
  }

  const isShielded = (t) => t.spoiler && state.shield && !state.revealed[t.id];

  /* ================================================================ PROGRESS */
  function trophyById(id) { return P5R.trophies.find(t => t.id === id); }
  const platinum = () => P5R.trophies.find(t => t.grade === 'platinum');

  /** Platinum is earned automatically when every other trophy is done. */
  function syncPlatinum() {
    const plat = platinum();
    if (!plat) return false;
    const othersDone = P5R.trophies.filter(t => t.grade !== 'platinum' && state.trophies[t.id]).length;
    const shouldHave = othersDone >= P5R.TOTALS.all - 1;
    const had = !!state.trophies[plat.id];
    if (shouldHave && !had) state.trophies[plat.id] = new Date().toISOString();
    if (!shouldHave && had) delete state.trophies[plat.id];
    return shouldHave && !had;
  }

  function stats() {
    const done = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    P5R.trophies.forEach(t => { if (state.trophies[t.id]) done[t.grade]++; });
    const total = P5R.TOTALS.all;
    const doneAll = GRADES.reduce((n, g) => n + done[g], 0);
    const pct = Math.min(100, Math.floor((doneAll / total) * 100));
    return { done, doneAll, total, pct };
  }

  function updateDashboard() {
    const { done, doneAll, total, pct } = stats();

    GRADES.forEach(g => { $('#cnt-' + g).textContent = `${done[g]}/${P5R.TOTALS[g]}`; });
    $('#pctNum').textContent = pct + '%';
    $('.ring').style.setProperty('--p', pct);
    $('#dashBar').style.width = pct + '%';
    $('#totalDone').textContent = `${doneAll} / ${total} trophies`;

    const remaining = 1 - doneAll / total;
    const lo = Math.round(P5R.HOURS.min * remaining);
    const hi = Math.round(P5R.HOURS.max * remaining);
    $('#hoursLeft').textContent = doneAll >= total ? 'Platinum earned!' : (hi <= 1 ? '< 1 hr' : `~${lo}–${hi} hrs`);

    const rank = P5R.RANKS.filter(r => pct >= r.at).pop() || P5R.RANKS[0];
    const rankEl = $('#rankTitle');
    if (rankEl.textContent !== rank.title) {
      if (rankEl.dataset.ready) toast(`Rank up! You are now: ${rank.title}`);
      rankEl.textContent = rank.title;
    }
    rankEl.dataset.ready = '1';
    $('#rankBlurb').textContent = rank.blurb;
  }

  /* ================================================================ ROADMAP */
  function renderRoadmap() {
    const list = $('#roadmapList');
    list.innerHTML = P5R.roadmap.map((s, i) => {
      const done = !!state.roadmap[s.id];
      return `
        <li class="step ${done ? 'is-done' : ''} ${s.critical ? 'step--critical' : ''}" data-step="${escapeHTML(s.id)}">
          <button class="step__check" type="button" aria-pressed="${done}" aria-label="Mark phase ${i + 1} (${escapeHTML(s.title)}) as ${done ? 'not done' : 'done'}">
            <span>${done ? '✓' : String(i + 1).padStart(2, '0')}</span>
          </button>
          <div class="step__card">
            <div class="step__phase">${escapeHTML(s.phase)}</div>
            <h3 class="step__title">${escapeHTML(s.title)}</h3>
            <ul class="step__body">${s.body.map(b => `<li>${escapeHTML(b)}</li>`).join('')}</ul>
          </div>
        </li>`;
    }).join('');
  }

  function onRoadmapClick(e) {
    const btn = e.target.closest('.step__check');
    if (!btn) return;
    const id = btn.closest('.step').dataset.step;
    if (state.roadmap[id]) delete state.roadmap[id]; else state.roadmap[id] = true;
    save();
    renderRoadmap();
    const again = $(`.step[data-step="${CSS.escape(id)}"] .step__check`);
    if (again) again.focus();
  }

  /* ================================================================ TROPHY TRACKER */
  function renderTagFilters() {
    const wrap = $('#tagFilters');
    wrap.innerHTML = '<span class="filters__label">Tags</span>' + P5R.TAGS.map(tag =>
      `<button type="button" class="pill ${ui.tags.has(tag) ? 'is-active' : ''}" data-tag="${escapeHTML(tag)}" aria-pressed="${ui.tags.has(tag)}">${escapeHTML(tag)}</button>`
    ).join('');
  }

  function matchesTrophy(t) {
    if (ui.grade !== 'all' && t.grade !== ui.grade) return false;
    const done = !!state.trophies[t.id];
    if (ui.status === 'completed' && !done) return false;
    if (ui.status === 'remaining' && done) return false;
    if (ui.tags.size && !t.tags.some(tag => ui.tags.has(tag))) return false;
    if (ui.query) {
      const hay = [t.name, t.description, t.when, t.tip, t.grade, ...(t.tags || []), ...(t.guide || [])].join(' ').toLowerCase();
      if (!hay.includes(ui.query.toLowerCase())) return false;
    }
    return true;
  }

  function trophyCard(t, index) {
    const done = !!state.trophies[t.id];
    const shielded = isShielded(t);
    const q = shielded ? '' : ui.query;
    const isPlat = t.grade === 'platinum';
    const label = shielded ? `spoiler trophy number ${t.num}` : t.name;
    const tagsHTML = (t.tags || []).map(tag => `<span class="tag tag--${slug(tag)}">${escapeHTML(tag)}</span>`).join('');

    return `
      <article class="tcard ${done ? 'is-done' : ''} ${shielded ? 'is-shielded' : ''}" data-id="${escapeHTML(t.id)}" data-grade="${t.grade}" style="animation-delay:${Math.min(index * 35, 500)}ms">
        <div class="tcard__top">
          <div class="spoilable" ${shielded ? 'aria-hidden="true"' : ''}>
            <div class="tcard__meta">
              <span class="tcard__num">#${String(t.num).padStart(2, '0')}</span>
              <span class="grade">${t.grade}</span>
              ${tagsHTML}
            </div>
            <h3 class="tcard__name">${highlight(t.name, q)}</h3>
            <p class="tcard__desc">${highlight(t.description, q)}</p>
          </div>
          <button class="steal" type="button" aria-pressed="${done}"
            ${isPlat ? 'disabled title="Unlocks automatically when the other 52 are done"' : ''}
            aria-label="${done ? 'Unmark' : 'Mark'} ${escapeHTML(label)} as earned">
            <span class="steal__icon" aria-hidden="true">${done ? '✓' : '★'}</span>
          </button>
        </div>
        <span class="tcard__stamp" aria-hidden="true">STOLEN</span>
        <div class="tcard__body spoilable" ${shielded ? 'aria-hidden="true"' : ''}>
          <div class="tcard__when">${highlight(t.when || '', q)}</div>
          <details ${ui.query && !shielded ? 'open' : ''}>
            <summary>How to unlock</summary>
            <ol class="tcard__guide">${(t.guide || []).map(g => `<li>${highlight(g, q)}</li>`).join('')}</ol>
            ${t.tip ? `<p class="tcard__tip"><b>Pro tip</b>${highlight(t.tip, q)}</p>` : ''}
          </details>
        </div>
        ${shielded ? `<button class="reveal" type="button" data-reveal="${escapeHTML(t.id)}"><span>⚠ Spoiler · Click to reveal</span></button>` : ''}
      </article>`;
  }

  function renderTrophies() {
    const grid = $('#trophyGrid');
    const list = P5R.trophies.filter(matchesTrophy);

    grid.innerHTML = list.length
      ? list.map(trophyCard).join('')
      : `<div class="empty"><strong>No trophies match</strong>Try clearing a filter or the search box.</div>`;

    const loaded = P5R.trophies.length;
    $('#resultCount').textContent = `Showing ${list.length} of ${loaded} loaded trophies`;

    const note = $('#batchNote');
    if (loaded < P5R.TOTALS.all) {
      note.hidden = false;
      note.textContent = `${loaded} of ${P5R.TOTALS.all} trophies are loaded so far. Paste the remaining batches at the bottom of trophies.js. The dashboard counts, % and rank already track all ${P5R.TOTALS.all}.`;
    } else {
      note.hidden = true;
    }
  }

  function toggleTrophy(id) {
    const t = trophyById(id);
    if (!t || t.grade === 'platinum') return;
    const nowDone = !state.trophies[id];
    if (nowDone) state.trophies[id] = new Date().toISOString();
    else delete state.trophies[id];

    const platJustEarned = syncPlatinum();
    save();

    const card = $(`.tcard[data-id="${CSS.escape(id)}"]`);
    const needsRerender = ui.status !== 'all' || platJustEarned || (!nowDone && platinum() && !state.trophies[platinum().id]);

    if (card) {
      card.classList.toggle('is-done', nowDone);
      const btn = $('.steal', card);
      btn.setAttribute('aria-pressed', String(nowDone));
      $('.steal__icon', btn).textContent = nowDone ? '✓' : '★';
      btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace(/^(Mark|Unmark)/, nowDone ? 'Unmark' : 'Mark'));
      if (nowDone) {
        card.classList.remove('just-done');
        void card.offsetWidth; // restart animation
        card.classList.add('just-done');
        setTimeout(() => card.classList.remove('just-done'), 800);
      }
    }

    updateDashboard();
    if (needsRerender) setTimeout(renderTrophies, nowDone ? 650 : 0);

    if (platJustEarned) toast('★ PLATINUM ★ The Phenomenal Phantom Thief!');
    else if (nowDone) toast(`Stolen: ${isShielded(t) ? 'spoiler trophy #' + t.num : t.name}`);
  }

  function onTrophyGridClick(e) {
    const reveal = e.target.closest('[data-reveal]');
    if (reveal) {
      state.revealed[reveal.dataset.reveal] = true;
      save();
      renderTrophies();
      return;
    }
    const steal = e.target.closest('.steal');
    if (steal && !steal.disabled) toggleTrophy(steal.closest('.tcard').dataset.id);
  }

  function setPillGroup(selector, attr, value) {
    $$(selector).forEach(b => {
      const on = b.dataset[attr] === value;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  /* ================================================================ EXPORT / IMPORT / RESET */
  function exportSave() {
    const payload = {
      app: 'p5r-platinum-companion',
      version: SAVE_VERSION,
      exportedAt: new Date().toISOString(),
      progress: stats(),
      data: state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `p5r-platinum-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Save exported. Keep that file safe!');
  }

  function importSave(file) {
    if (!file) return;
    if (file.size > 512 * 1024) { toast('That file is too large to be a save.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const data = sanitize(parsed && parsed.data ? parsed.data : parsed);
        if (!data) throw new Error('Invalid save');
        const count = Object.keys(data.trophies).length;
        if (!window.confirm(`Import this save (${count} trophies checked)? It will replace your current progress in this browser.`)) return;
        state = data;
        syncPlatinum();
        save();
        renderAll();
        toast(`Save imported: ${count} trophies restored.`);
      } catch (err) {
        toast('Import failed: that file isn\'t a valid P5R companion save.');
      }
    };
    reader.readAsText(file);
  }

  function resetProgress() {
    if (!window.confirm('Reset all trophy and roadmap progress? Export a backup first if you might want it back.')) return;
    state.trophies = {};
    state.roadmap = {};
    state.revealed = {};
    save();
    renderAll();
    toast('Progress reset. New Game, fresh calendar.');
  }

  /* ================================================================ CLASSROOM ANSWERS */
  function initClassroom() {
    const months = [...new Set(P5R.classroom.map(c => c.month))];
    $('#classMonth').insertAdjacentHTML('beforeend', months.map(m => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join(''));
  }

  function renderClassroom() {
    const q = ui.classQuery.trim().toLowerCase();
    const rows = P5R.classroom.filter(c => {
      if (ui.classMonth !== 'all' && c.month !== ui.classMonth) return false;
      if (ui.examOnly && !c.exam) return false;
      if (!q) return true;
      if (/^\d{1,2}\/\d{1,2}$/.test(q)) return c.date === q;
      return [c.date, c.month, c.q, c.a].join(' ').toLowerCase().includes(q);
    });

    const box = $('#classList');
    if (!rows.length) {
      box.innerHTML = `<div class="empty"><strong>No answers found</strong>Dates use the in-game format, e.g. <code>7/14</code>.</div>`;
      return;
    }
    const byMonth = rows.reduce((acc, r) => ((acc[r.month] = acc[r.month] || []).push(r), acc), {});
    const hq = /^\d{1,2}\/\d{1,2}$/.test(q) ? '' : ui.classQuery.trim();

    box.innerHTML = Object.entries(byMonth).map(([month, list]) => `
      <section class="month">
        <h3 class="month__title">${escapeHTML(month)} ${list[0].thirdSemester ? '<span class="month__note">Third Semester only</span>' : ''}</h3>
        <ul class="qa">
          ${list.map(r => `
            <li>
              <span class="qa__date">${escapeHTML(r.date)}</span>
              <span class="qa__q">${highlight(r.q, hq)}${r.exam ? '<span class="qa__exam">Exam</span>' : ''}</span>
              <span class="qa__a">${highlight(r.a, hq)}</span>
            </li>`).join('')}
        </ul>
      </section>`).join('');
  }

  /* ================================================================ CONFIDANTS */
  function renderConfidants() {
    const q = ui.confQuery.trim().toLowerCase();
    const list = P5R.confidants.filter(c => {
      if (ui.confDeadline && !c.deadline) return false;
      if (ui.confRomance && !c.romance) return false;
      if (!q) return true;
      return [c.arcana, c.name, c.where, c.how, c.deadline || ''].join(' ').toLowerCase().includes(q);
    });

    const box = $('#confList');
    box.innerHTML = list.length ? list.map(c => `
      <article class="conf ${c.deadline ? 'conf--deadline' : ''}">
        <div class="conf__arcana">${highlight(c.arcana, ui.confQuery.trim())}</div>
        <h3 class="conf__name">${highlight(c.name, ui.confQuery.trim())}</h3>
        <p class="conf__where">${highlight(c.where, ui.confQuery.trim())}</p>
        <p class="conf__how">${highlight(c.how, ui.confQuery.trim())}</p>
        <div class="conf__badges">
          ${c.deadline ? `<span class="badge badge--deadline">⏰ ${escapeHTML(c.deadline)}</span>` : ''}
          ${c.romance ? '<span class="badge badge--romance">♥ Romance</span>' : ''}
          ${c.auto ? '<span class="badge badge--auto">Auto (story)</span>' : ''}
        </div>
      </article>`).join('')
      : `<div class="empty"><strong>No Confidants found</strong>Try an Arcana like "Justice" or a place like "Shinjuku".</div>`;
  }

  /* ================================================================ NAV: active link + sticky offset */
  function initNav() {
    const deck = $('#deck');
    const setDeckHeight = () => document.documentElement.style.setProperty('--deck-h', deck.offsetHeight + 'px');
    setDeckHeight();
    if ('ResizeObserver' in window) new ResizeObserver(setDeckHeight).observe(deck);
    else window.addEventListener('resize', setDeckHeight);

    const links = $$('[data-nav]');
    const sections = links.map(l => document.getElementById(l.dataset.nav)).filter(Boolean);
    if (!('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(l => {
          const on = l.dataset.nav === entry.target.id;
          l.classList.toggle('is-active', on);
          if (on) {
            l.setAttribute('aria-current', 'true');
            l.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          } else {
            l.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ================================================================ WIRE UP */
  function bindEvents() {
    $('#themeToggle').addEventListener('click', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      save(); applyTheme();
    });

    $('#spoilerToggle').addEventListener('click', () => {
      state.shield = !state.shield;
      if (state.shield) state.revealed = {};
      save(); applyShieldButton(); renderTrophies();
      toast(state.shield ? 'Spoiler Shield on' : 'Spoiler Shield off: all trophies visible');
    });

    $('#roadmapList').addEventListener('click', onRoadmapClick);
    $('#trophyGrid').addEventListener('click', onTrophyGridClick);

    $$('.pill[data-grade]').forEach(b => b.addEventListener('click', () => {
      ui.grade = b.dataset.grade; setPillGroup('[data-grade].pill', 'grade', ui.grade); renderTrophies();
    }));
    $$('[data-status]').forEach(b => b.addEventListener('click', () => {
      ui.status = b.dataset.status; setPillGroup('[data-status]', 'status', ui.status); renderTrophies();
    }));
    $('#tagFilters').addEventListener('click', e => {
      const b = e.target.closest('[data-tag]');
      if (!b) return;
      const tag = b.dataset.tag;
      ui.tags.has(tag) ? ui.tags.delete(tag) : ui.tags.add(tag);
      renderTagFilters(); renderTrophies();
    });

    let searchTimer;
    $('#trophySearch').addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { ui.query = e.target.value.trim(); renderTrophies(); }, 120);
    });

    $('#exportBtn').addEventListener('click', exportSave);
    $('#importFile').addEventListener('change', e => { importSave(e.target.files[0]); e.target.value = ''; });
    $('#resetBtn').addEventListener('click', resetProgress);

    $('#classSearch').addEventListener('input', e => { ui.classQuery = e.target.value; renderClassroom(); });
    $('#classMonth').addEventListener('change', e => { ui.classMonth = e.target.value; renderClassroom(); });
    $('#examOnly').addEventListener('click', e => {
      ui.examOnly = !ui.examOnly;
      e.currentTarget.setAttribute('aria-pressed', String(ui.examOnly));
      renderClassroom();
    });

    $('#confSearch').addEventListener('input', e => { ui.confQuery = e.target.value; renderConfidants(); });
    $('#confDeadline').addEventListener('click', e => {
      ui.confDeadline = !ui.confDeadline;
      e.currentTarget.setAttribute('aria-pressed', String(ui.confDeadline));
      renderConfidants();
    });
    $('#confRomance').addEventListener('click', e => {
      ui.confRomance = !ui.confRomance;
      e.currentTarget.setAttribute('aria-pressed', String(ui.confRomance));
      renderConfidants();
    });

    // Keep tabs in sync if the page is open in two windows
    window.addEventListener('storage', e => {
      if (e.key !== STORAGE_KEY) return;
      state = loadState();
      renderAll();
    });
  }

  function renderAll() {
    applyTheme();
    applyShieldButton();
    renderRoadmap();
    renderTagFilters();
    renderTrophies();
    updateDashboard();
    renderClassroom();
    renderConfidants();
  }

  // If extra trophy batches load after app.js, refresh the tracker.
  P5R.onDataChanged = () => { syncPlatinum(); renderTrophies(); updateDashboard(); };

  document.addEventListener('DOMContentLoaded', () => {
    syncPlatinum();
    initClassroom();
    bindEvents();
    renderAll();
    initNav();
  });
})();
