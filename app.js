/* ==========================================================================
   PHANTOM GUIDES · P5R Platinum Trophy Guide — app.js
   Vanilla JS · localStorage saves · P5-style effects (respects reduced motion)
   ========================================================================== */
(function () {
  'use strict';

  const P5R = window.P5R;
  if (!P5R) { console.error('trophies.js must load before app.js'); return; }

  const STORAGE_KEY = 'p5r-platinum-companion-v1';
  const SAVE_VERSION = 1;
  const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;

  /* ---------------------------------------------------------------- utils */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const escapeHTML = (str) => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  function highlight(text, query) {
    const safe = escapeHTML(text);
    if (!query) return safe;
    return safe.replace(new RegExp('(' + escapeRegExp(escapeHTML(query)) + ')', 'ig'), '<mark>$1</mark>');
  }

  /* ================================================================ STATE */
  const defaultState = () => ({ version: SAVE_VERSION, trophies: {}, roadmap: {}, days: {}, revealed: {}, shield: true, theme: 'dark' });
  let state = loadState();

  function loadState() {
    try { return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')) || defaultState(); }
    catch (e) { return defaultState(); }
  }
  function sanitize(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const s = defaultState();
    const copy = (src, ok) => {
      const out = {};
      if (src && typeof src === 'object') Object.keys(src).forEach(k => { if (k.length < 80 && ok(src[k])) out[k] = src[k]; });
      return out;
    };
    s.trophies = copy(raw.trophies, v => v === true || typeof v === 'string');
    s.roadmap = copy(raw.roadmap, v => v === true);
    s.days = copy(raw.days, v => v === true);
    s.revealed = copy(raw.revealed, v => v === true);
    s.shield = raw.shield !== false;
    s.theme = raw.theme === 'light' ? 'light' : 'dark';
    return s;
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch (e) { toast('Couldn\'t save. Browser storage may be full or switched off.'); }
  }

  const ui = { wkTab: 'shadows', wkQuery: '', wkGroup: 'all', wkElems: new Set(), wkHideDlc: false, plannerMonth: null, plannerKey: false, plannerHideDone: false, grade: 'all', status: 'all', tags: new Set(), query: '', classQuery: '', classMonth: 'all', examOnly: false, confQuery: '', confDeadline: false, confRomance: false };

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  /* ================================================================ FX: particles canvas */
  const FX = (() => {
    const canvas = $('#fx');
    const ctx = canvas.getContext('2d');
    let parts = [];
    let running = false;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function star(x, y, r, rot) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 ? r * .45 : r;
        const a = rot + (i * Math.PI) / 5 - Math.PI / 2;
        ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fill();
    }

    function loop() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(p => p.life > 0);
      parts.forEach(p => {
        p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.fillStyle = p.color;
        const s = p.size * (p.shrink ? p.life : 1);
        if (p.shape === 'star') star(p.x, p.y, s, p.rot);
        else {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          if (p.shape === 'diamond') { ctx.rotate(Math.PI / 4); ctx.fillRect(-s / 2, -s / 2, s, s); }
          else ctx.fillRect(-s, -s / 3, s * 2, s / 1.5);
          ctx.restore();
        }
      });
      ctx.globalAlpha = 1;
      if (parts.length) requestAnimationFrame(loop); else running = false;
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }

    const PALETTE = ['#D90429', '#ffffff', '#D4AF37', '#000000', '#ff1f45'];
    return {
      burst(x, y, n = 60, opts = {}) {
        if (REDUCED) return;
        const colors = opts.colors || PALETTE;
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = (opts.speed || 9) * (.35 + Math.random());
          parts.push({
            x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opts.lift || 3),
            g: opts.gravity ?? .28, drag: .985, rot: Math.random() * 6, vr: (Math.random() - .5) * .4,
            size: (opts.size || 7) * (.6 + Math.random()), life: 1, decay: .008 + Math.random() * .012,
            color: colors[(Math.random() * colors.length) | 0],
            shape: ['star', 'diamond', 'rect'][(Math.random() * 3) | 0], shrink: false
          });
        }
        kick();
      },
      trail(x, y) {
        if (REDUCED) return;
        parts.push({
          x, y, vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * 1.2 + .4, g: .02, drag: .96,
          rot: Math.random() * 6, vr: .15, size: 5 + Math.random() * 4, life: 1, decay: .04,
          color: Math.random() < .7 ? '#D90429' : '#D4AF37', shape: 'star', shrink: true
        });
        if (parts.length > 400) parts.splice(0, parts.length - 400);
        kick();
      },
      rain(n = 140) {
        if (REDUCED) return;
        for (let i = 0; i < n; i++) {
          parts.push({
            x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .5, vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 4,
            g: .08, drag: .995, rot: Math.random() * 6, vr: (Math.random() - .5) * .3, size: 6 + Math.random() * 7, life: 1.6, decay: .006,
            color: PALETTE[(Math.random() * PALETTE.length) | 0], shape: ['star', 'diamond', 'rect'][(Math.random() * 3) | 0], shrink: false
          });
        }
        kick();
      }
    };
  })();

  function shake() {
    if (REDUCED) return;
    document.body.classList.remove('shake');
    void document.body.offsetWidth;
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
  }

  /* ================================================================ FX: calling-card intro */
  function runIntro() {
    const intro = $('#intro');
    let seen = false;
    try { seen = sessionStorage.getItem('p5r-intro-seen') === '1'; } catch (e) {}
    if (REDUCED || seen) { intro.hidden = true; return; }
    try { sessionStorage.setItem('p5r-intro-seen', '1'); } catch (e) {}

    document.body.classList.add('no-scroll');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      intro.classList.add('is-out');
      FX.burst(innerWidth / 2, innerHeight / 2, 90, { speed: 14 });
      setTimeout(() => { intro.hidden = true; document.body.classList.remove('no-scroll'); }, 560);
    };
    $('.intro__skip', intro).addEventListener('click', finish);
    intro.addEventListener('click', finish);
    setTimeout(finish, 2300);
  }

  /* ================================================================ FX: All-Out-Attack cut-in */
  let cutinTimer;
  const cutinQueue = [];
  function cutin(t) {
    if (REDUCED) { toast(t.grade === 'platinum' ? 'Platinum earned: The Phenomenal Phantom Thief!' : `Trophy stolen: ${t.label}`); return; }
    cutinQueue.push(t);
    if (cutinQueue.length === 1) playCutin();
  }
  function playCutin() {
    const t = cutinQueue[0];
    if (!t) return;
    const el = $('#cutin');
    const plat = t.grade === 'platinum';
    el.dataset.grade = t.grade;
    $('#cutinKicker').textContent = plat ? 'The show is over' : 'Trophy stolen';
    $('#cutinTitle').textContent = t.label;
    $('#cutinGrade').textContent = plat ? '★ Platinum · All 53 trophies ★' : `★ ${t.grade[0].toUpperCase() + t.grade.slice(1)} trophy`;
    el.classList.remove('is-on', 'is-leaving');
    void el.offsetWidth;
    el.classList.add('is-on');
    shake();
    FX.burst(innerWidth * .5, innerHeight * .5, plat ? 220 : 90, { speed: plat ? 18 : 13, size: plat ? 9 : 7 });
    if (plat) setTimeout(() => FX.rain(220), 400);
    clearTimeout(cutinTimer);
    cutinTimer = setTimeout(endCutin, plat ? 3600 : 1700);
  }
  function endCutin() {
    const el = $('#cutin');
    if (!el.classList.contains('is-on')) return;
    clearTimeout(cutinTimer);
    el.classList.add('is-leaving');
    setTimeout(() => {
      el.classList.remove('is-on', 'is-leaving');
      cutinQueue.shift();
      if (cutinQueue.length) playCutin();
    }, 340);
  }

  /* ================================================================ FX: section wipe navigation */
  function initWipeNav() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const id = a.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      closeToc();
      const go = () => {
        const y = target.getBoundingClientRect().top + scrollY - ($('#sitebar').offsetHeight + 16);
        window.scrollTo({ top: id === 'top' ? 0 : y, behavior: 'instant' });
        history.replaceState(null, '', '#' + id);
        const focusable = target.querySelector('h1, h2') || target;
        focusable.setAttribute('tabindex', '-1');
        focusable.focus({ preventScroll: true });
      };
      if (REDUCED) { go(); return; }
      const wipe = $('#wipe');
      wipe.classList.remove('is-run');
      void wipe.offsetWidth;
      wipe.classList.add('is-run');
      setTimeout(go, 360);
      setTimeout(() => wipe.classList.remove('is-run'), 950);
    });
  }

  /* ================================================================ FX: ransom-note headings */
  function initRansom() {
    const looks = [
      ['#ffffff', '#000000', '#D90429'],
      ['#000000', '#ffffff', '#D90429'],
      ['#D90429', '#ffffff', '#000000'],
      ['#ffffff', '#D90429', '#000000'],
      ['#D4AF37', '#000000', '#000000']
    ];
    $$('[data-ransom]').forEach((h, hi) => {
      const text = h.textContent.trim();
      h.setAttribute('aria-label', text);
      let i = 0;
      h.innerHTML = text.split(' ').map(word => {
        const letters = [...word].map(ch => {
          const seed = Math.sin((hi + 1) * 97.13 + i * 12.9898) * 43758.5453;
          const rnd = seed - Math.floor(seed);
          const look = looks[Math.floor(rnd * looks.length)];
          const r = ((rnd * 14) - 7).toFixed(1);
          const y = ((rnd * 8) - 4).toFixed(1);
          const span = `<span class="rl" style="--i:${i};--r:${r}deg;--y:${y}px;--lb:${look[0]};--lc:${look[1]};--ls:${look[2]}">${escapeHTML(ch)}</span>`;
          i++;
          return span;
        }).join('');
        return `<span class="rw" aria-hidden="true">${letters}</span>`;
      }).join(' ');
    });

    if (REDUCED || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.remove('is-armed');
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: .6 });
    $$('[data-ransom]').forEach(h => { h.classList.add('is-armed'); io.observe(h); });
  }

  /* ================================================================ FX: cursor star trail + click sparks */
  function initPointerFX() {
    if (REDUCED) return;
    if (FINE_POINTER) {
      let last = 0;
      window.addEventListener('mousemove', e => {
        const now = performance.now();
        if (now - last < 28) return;
        last = now;
        FX.trail(e.clientX, e.clientY);
      }, { passive: true });
    }
    document.addEventListener('click', e => {
      const b = e.target.closest('.btn, .pill, .iconbtn, .step__check, .reveal');
      if (b) FX.burst(e.clientX, e.clientY, 18, { speed: 6, size: 5, lift: 1 });
    });
  }

  /* ================================================================ scroll progress */
  function initScrollProgress() {
    const bar = $('#scrollProg');
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ================================================================ THEME + SPOILERS */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const btn = $('#themeToggle');
    const light = state.theme === 'light';
    btn.setAttribute('aria-pressed', String(light));
    btn.title = light ? 'Metaverse High-Contrast Light Mode (switch to dark)' : 'Phantom Thief Dark Mode (switch to light)';
    $('.iconbtn__icon', btn).textContent = light ? '☀' : '☾';
    $('.iconbtn__label', btn).textContent = light ? 'Metaverse Light' : 'Phantom Thief Dark';
  }
  function applyShieldButton() {
    const btn = $('#spoilerToggle');
    btn.setAttribute('aria-pressed', String(!state.shield));
    btn.title = state.shield ? 'Spoiler Shield is on (click to show spoilers)' : 'Spoiler Shield is off (click to hide spoilers)';
    $('.iconbtn__icon', btn).textContent = state.shield ? '🕶' : '👁';
    $('.iconbtn__label', btn).textContent = state.shield ? 'Spoilers hidden' : 'Spoilers shown';
  }
  const isShielded = (t) => t.spoiler && state.shield && !state.revealed[t.id];

  /* ================================================================ PROGRESS */
  const trophyById = (id) => P5R.trophies.find(t => t.id === id);
  const platinum = () => P5R.trophies.find(t => t.grade === 'platinum');

  function syncPlatinum() {
    const plat = platinum();
    if (!plat) return false;
    const othersDone = P5R.trophies.filter(t => t.grade !== 'platinum' && state.trophies[t.id]).length;
    const should = othersDone >= P5R.TOTALS.all - 1;
    const had = !!state.trophies[plat.id];
    if (should && !had) state.trophies[plat.id] = new Date().toISOString();
    if (!should && had) delete state.trophies[plat.id];
    return should && !had;
  }

  function stats() {
    const done = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    P5R.trophies.forEach(t => { if (state.trophies[t.id]) done[t.grade]++; });
    const total = P5R.TOTALS.all;
    const doneAll = GRADES.reduce((n, g) => n + done[g], 0);
    return { done, doneAll, total, pct: Math.min(100, Math.floor((doneAll / total) * 100)) };
  }

  let lastPct = null;
  function updateDashboard() {
    const { done, doneAll, total, pct } = stats();
    GRADES.forEach(g => { $('#cnt-' + g).textContent = `${done[g]}/${P5R.TOTALS[g]}`; });
    $('#pctNum').textContent = pct + '%';
    $('#miniPct').textContent = pct + '%';
    const ring = $('.ring');
    ring.style.setProperty('--p', pct);
    $('#dashBar').style.width = pct + '%';
    $('#miniBar').style.width = pct + '%';
    $('#totalDone').textContent = `${doneAll} / ${total}`;
    const left = 1 - doneAll / total;
    const lo = Math.round(P5R.HOURS.min * left), hi = Math.round(P5R.HOURS.max * left);
    $('#hoursLeft').textContent = doneAll >= total ? 'Done!' : (hi <= 1 ? 'Under 1 hr' : `${lo}–${hi} hrs`);

    if (lastPct !== null && pct !== lastPct && !REDUCED) {
      ring.classList.remove('is-bump'); void ring.offsetWidth; ring.classList.add('is-bump');
    }
    lastPct = pct;

    const rank = P5R.RANKS.filter(r => pct >= r.at).pop() || P5R.RANKS[0];
    const rankEl = $('#rankTitle');
    if (rankEl.textContent !== rank.title) {
      if (rankEl.dataset.ready) {
        toast(`Rank up! You're now ${rank.title}`);
        rankEl.classList.remove('is-new'); void rankEl.offsetWidth; rankEl.classList.add('is-new');
      }
      rankEl.textContent = rank.title;
    }
    rankEl.dataset.ready = '1';
    $('#rankBlurb').textContent = rank.blurb;
  }

  /* ================================================================ ROADMAP */
  function renderRoadmap(justDone) {
    $('#roadmapList').innerHTML = P5R.roadmap.map((s, i) => {
      const done = !!state.roadmap[s.id];
      return `
        <li class="step ${done ? 'is-done' : ''} ${s.critical ? 'step--critical' : ''} ${justDone === s.id ? 'just-done' : ''}" data-step="${escapeHTML(s.id)}">
          <button class="step__check" type="button" aria-pressed="${done}" aria-label="Phase ${i + 1}, ${escapeHTML(s.title)}: mark as ${done ? 'not done' : 'done'}">
            <span>${done ? '✓' : i + 1}</span>
          </button>
          <div class="step__card">
            <p class="step__phase">${escapeHTML(s.phase)}</p>
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
    const nowDone = !state.roadmap[id];
    if (nowDone) state.roadmap[id] = true; else delete state.roadmap[id];
    save();
    renderRoadmap(nowDone ? id : null);
    const again = $(`.step[data-step="${CSS.escape(id)}"] .step__check`);
    if (again) again.focus();
    if (nowDone) toast('Phase cleared!');
  }

  /* ================================================================ DAILY PLANNER */
  const MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February'];
  const MONTH_NUM = { April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12, January: 1, February: 2 };
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthOf = (d) => MONTHS.find(m => MONTH_NUM[m] === Number(d.split('/')[0]));
  function weekday(d) {
    const [m, day] = d.split('/').map(Number);
    return new Date(m >= 4 ? 2016 : 2017, m - 1, day).getDay();
  }
  const isKeyDay = (x) => (x.k || []).some(f => f === 'deadline' || f === 'palace' || f === 'exam' || f === 'key') || (x.tr && x.tr.length);

  function trophyChip(name) {
    const t = P5R.trophies.find(tt => tt.name === name);
    const earned = t && state.trophies[t.id];
    if (t && isShielded(t)) return `<span class="tchip tchip--hidden ${earned ? 'is-earned' : ''}"><span>★ Spoiler trophy</span></span>`;
    return `<span class="tchip ${earned ? 'is-earned' : ''}"><span>★ ${escapeHTML(name)}</span></span>`;
  }

  function renderPlanner(justDone) {
    const plan = P5R.planner || [];
    if (!plan.length) return;
    if (!ui.plannerMonth) {
      const next = plan.find(x => !state.days[x.d]) || plan[plan.length - 1];
      ui.plannerMonth = monthOf(next.d);
    }
    $('#plannerMonths').innerHTML = MONTHS.map(m => {
      const days = plan.filter(x => monthOf(x.d) === m);
      if (!days.length) return '';
      const done = days.filter(x => state.days[x.d]).length;
      const deadline = days.some(x => (x.k || []).includes('deadline'));
      const sel = m === ui.plannerMonth;
      return `<button type="button" role="tab" class="month-tab ${deadline ? 'has-deadline' : ''}" data-month="${m}" aria-selected="${sel}" style="--done:${Math.round(done / days.length * 100)}%">
        ${m.slice(0, 3)}<small>${done}/${days.length}</small><i></i></button>`;
    }).join('');

    $('#plannerIntro').textContent = (P5R.plannerNotes || {})[ui.plannerMonth] || '';

    const list = plan.filter(x => monthOf(x.d) === ui.plannerMonth)
      .filter(x => !ui.plannerKey || isKeyDay(x))
      .filter(x => !ui.plannerHideDone || !state.days[x.d]);

    $('#plannerList').innerHTML = list.length ? list.map((x, i) => {
      const k = x.k || [];
      const wd = weekday(x.d);
      const done = !!state.days[x.d];
      const auto = k.includes('auto') && !k.some(f => f !== 'auto');
      const flags = [
        k.includes('deadline') ? '<span class="flag flag--deadline">Deadline</span>' : '',
        k.includes('palace') ? '<span class="flag flag--palace">Palace</span>' : '',
        k.includes('exam') ? '<span class="flag flag--exam">Exam</span>' : '',
        k.includes('key') ? '<span class="flag flag--key">Important</span>' : '',
        k.includes('auto') ? '<span class="flag">Story</span>' : ''
      ].join('');
      const cls = ['day', done ? 'is-done' : '', justDone === x.d ? 'just-done' : '', auto ? 'day--auto' : '',
        k.includes('deadline') ? 'day--deadline' : '', k.includes('palace') ? 'day--palace' : '',
        wd === 0 ? 'day--sun' : '', wd === 6 ? 'day--sat' : ''].join(' ');
      return `
        <li class="${cls}" data-day="${escapeHTML(x.d)}" id="day-${x.d.replace('/', '-')}" style="animation-delay:${Math.min(i * 25, 500)}ms">
          <div class="day__date">
            <span class="day__num">${escapeHTML(x.d)}</span>
            <span class="day__wd">${WD[wd]}</span>
            <button class="day__check" type="button" aria-pressed="${done}" aria-label="Mark ${escapeHTML(x.d)} as ${done ? 'not played' : 'played'}"><span>✓</span></button>
          </div>
          <div class="day__body">
            ${flags ? `<div class="day__flags">${flags}</div>` : ''}
            <div class="slot"><span class="slot__k">Daytime</span><p>${escapeHTML(x.day)}</p></div>
            <div class="slot slot--eve"><span class="slot__k">Evening</span><p>${escapeHTML(x.eve)}</p></div>
            ${x.tr && x.tr.length ? `<div class="day__trophies">${x.tr.map(trophyChip).join('')}</div>` : ''}
          </div>
        </li>`;
    }).join('') : `<li class="empty"><strong>Nothing to show</strong>Every day here is finished or filtered out. Turn off a filter to see them.</li>`;
  }

  function onPlannerClick(e) {
    const btn = e.target.closest('.day__check');
    if (!btn) return;
    const d = btn.closest('.day').dataset.day;
    const nowDone = !state.days[d];
    if (nowDone) state.days[d] = true; else delete state.days[d];
    save();
    if (nowDone) {
      const r = btn.getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + r.height / 2, 26, { speed: 7, size: 6, lift: 2 });
    }
    renderPlanner(nowDone ? d : null);
    const again = $(`.day[data-day="${CSS.escape(d)}"] .day__check`);
    if (again) again.focus({ preventScroll: true });
    const plan = P5R.planner || [];
    const m = monthOf(d);
    if (nowDone && plan.filter(x => monthOf(x.d) === m).every(x => state.days[x.d])) {
      cutin({ grade: 'gold', label: `${m} cleared` });
    }
  }

  function jumpToDay(d) {
    const entry = (P5R.planner || []).find(x => x.d === d);
    if (!entry) return false;
    ui.plannerMonth = monthOf(d);
    ui.plannerHideDone = false; $('#plannerHideDone').setAttribute('aria-pressed', 'false');
    ui.plannerKey = false; $('#plannerKey').setAttribute('aria-pressed', 'false');
    renderPlanner();
    const el = document.getElementById('day-' + d.replace('/', '-'));
    if (el) {
      const y = el.getBoundingClientRect().top + scrollY - ($('#sitebar').offsetHeight + 24);
      window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
      el.classList.remove('is-target'); void el.offsetWidth; el.classList.add('is-target');
    }
    return true;
  }

  /* ================================================================ TROPHY TRACKER */
  function renderTagFilters() {
    $('#tagFilters').innerHTML = '<span class="filters__label">Tags</span>' + P5R.TAGS.map(tag =>
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

  function trophyRow(t, index) {
    const done = !!state.trophies[t.id];
    const shielded = isShielded(t);
    const q = shielded ? '' : ui.query;
    const isPlat = t.grade === 'platinum';
    const label = shielded ? `spoiler trophy number ${t.num}` : t.name;
    const tags = (t.tags || []).map(tag => `<span class="tag tag--${slug(tag)}">${escapeHTML(tag)}</span>`).join('');
    const hide = shielded ? 'aria-hidden="true"' : '';
    return `
      <article class="tcard ${done ? 'is-done' : ''} ${shielded ? 'is-shielded' : ''}" data-id="${escapeHTML(t.id)}" data-grade="${t.grade}" style="animation-delay:${Math.min(index * 40, 600)}ms">
        <div class="tcard__gem" aria-hidden="true"></div>
        <div class="tcard__main spoilable" ${hide}>
          <div class="tcard__meta">
            <span class="tcard__num">#${String(t.num).padStart(2, '0')}</span>
            <span class="grade">${t.grade}</span>${tags}
          </div>
          <h3 class="tcard__name">${highlight(t.name, q)}</h3>
          <p class="tcard__desc">${highlight(t.description, q)}</p>
          <div class="tcard__when">${highlight(t.when || '', q)}</div>
        </div>
        <button class="steal" type="button" aria-pressed="${done}" ${isPlat ? 'disabled title="Unlocks on its own once the other 52 are done"' : ''}
          aria-label="${done ? 'Unmark' : 'Mark'} ${escapeHTML(label)} as earned">
          <span class="steal__icon" aria-hidden="true">${done ? '✓' : '★'}</span>
        </button>
        <div class="tcard__body spoilable" ${hide}>
          <details ${ui.query && !shielded ? 'open' : ''}>
            <summary>How to unlock it</summary>
            <ol class="tcard__guide">${(t.guide || []).map(g => `<li>${highlight(g, q)}</li>`).join('')}</ol>
            ${t.tip ? `<p class="tcard__tip"><b>Pro tip</b>${highlight(t.tip, q)}</p>` : ''}
          </details>
        </div>
        <span class="tcard__stamp" aria-hidden="true">STOLEN</span>
        ${shielded ? `<button class="reveal" type="button" data-reveal="${escapeHTML(t.id)}"><span>Spoiler: click to reveal</span></button>` : ''}
      </article>`;
  }

  function renderTrophies() {
    const list = P5R.trophies.filter(matchesTrophy);
    $('#trophyGrid').innerHTML = list.length
      ? list.map(trophyRow).join('')
      : `<div class="empty"><strong>No trophies match</strong>Clear a filter or the search box to see more.</div>`;
    const loaded = P5R.trophies.length;
    $('#resultCount').textContent = `Showing ${list.length} of ${loaded} loaded trophies`;
    const note = $('#batchNote');
    note.hidden = loaded >= P5R.TOTALS.all;
    if (!note.hidden) note.textContent = `${loaded} of ${P5R.TOTALS.all} trophies are loaded so far; the rest arrive in the next batches. Your %, counts and rank already count all ${P5R.TOTALS.all}.`;
  }

  function toggleTrophy(id) {
    const t = trophyById(id);
    if (!t || t.grade === 'platinum') return;
    const nowDone = !state.trophies[id];
    if (nowDone) state.trophies[id] = new Date().toISOString(); else delete state.trophies[id];
    const platJust = syncPlatinum();
    save();

    const card = $(`.tcard[data-id="${CSS.escape(id)}"]`);
    if (card) {
      card.classList.toggle('is-done', nowDone);
      const btn = $('.steal', card);
      btn.setAttribute('aria-pressed', String(nowDone));
      btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace(/^(Mark|Unmark)/, nowDone ? 'Unmark' : 'Mark'));
      $('.steal__icon', btn).textContent = nowDone ? '✓' : '★';
      if (nowDone) {
        card.classList.remove('just-done'); void card.offsetWidth; card.classList.add('just-done');
        setTimeout(() => card.classList.remove('just-done'), 1300);
      }
    }
    updateDashboard();
    renderPlanner();

    if (nowDone) cutin({ grade: t.grade, label: isShielded(t) ? `Spoiler trophy #${t.num}` : t.name });
    if (platJust) cutin({ grade: 'platinum', label: platinum().name });

    const plat = platinum();
    const needsRerender = ui.status !== 'all' || platJust || (!nowDone && plat && !state.trophies[plat.id]);
    if (needsRerender) setTimeout(renderTrophies, nowDone ? 1300 : 0);
  }

  function onTrophyGridClick(e) {
    const reveal = e.target.closest('[data-reveal]');
    if (reveal) {
      const id = reveal.dataset.reveal;
      state.revealed[id] = true;
      save();
      renderTrophies();
      const card = $(`.tcard[data-id="${CSS.escape(id)}"]`);
      if (card) { card.style.animation = 'none'; card.classList.add('is-unveiling'); }
      return;
    }
    const steal = e.target.closest('.steal');
    if (steal && !steal.disabled) toggleTrophy(steal.closest('.tcard').dataset.id);
  }

  function setPills(selector, attr, value) {
    $$(selector).forEach(b => {
      const on = b.dataset[attr] === value;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  /* ================================================================ SAVE FILES */
  function exportSave() {
    const payload = { app: 'p5r-platinum-companion', version: SAVE_VERSION, exportedAt: new Date().toISOString(), progress: stats(), data: state };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `p5r-platinum-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Save exported. Keep the file somewhere safe.');
  }
  function importSave(file) {
    if (!file) return;
    if (file.size > 512 * 1024) { toast('That file is too big to be a save.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const data = sanitize(parsed && parsed.data ? parsed.data : parsed);
        if (!data) throw new Error('bad');
        const n = Object.keys(data.trophies).length;
        if (!window.confirm(`Import this save with ${n} trophies checked? It replaces your progress in this browser.`)) return;
        state = data;
        syncPlatinum(); save(); renderAll();
        toast(`Save imported: ${n} trophies restored.`);
        FX.burst(innerWidth / 2, innerHeight / 2, 70);
      } catch (err) {
        toast('Import failed: that file isn\'t a save from this guide.');
      }
    };
    reader.readAsText(file);
  }
  function resetProgress() {
    if (!window.confirm('Reset all trophy and roadmap progress? Export a save first if you might want it back.')) return;
    state.trophies = {}; state.roadmap = {}; state.days = {}; state.revealed = {};
    save(); renderAll();
    toast('Progress reset. Fresh calendar.');
  }

  /* ================================================================ CLASSROOM */
  function initClassroom() {
    const months = [...new Set(P5R.classroom.map(c => c.month))];
    $('#classMonth').insertAdjacentHTML('beforeend', months.map(m => `<option value="${escapeHTML(m)}">${escapeHTML(m)}</option>`).join(''));
  }
  function renderClassroom() {
    const q = ui.classQuery.trim().toLowerCase();
    const isDate = /^\d{1,2}\/\d{1,2}$/.test(q);
    const rows = P5R.classroom.filter(c => {
      if (ui.classMonth !== 'all' && c.month !== ui.classMonth) return false;
      if (ui.examOnly && !c.exam) return false;
      if (!q) return true;
      if (isDate) return c.date === q;
      return [c.date, c.month, c.q, c.a].join(' ').toLowerCase().includes(q);
    });
    const box = $('#classList');
    if (!rows.length) { box.innerHTML = `<div class="empty"><strong>No answers found</strong>Dates use the in-game format, such as <code>7/14</code>.</div>`; return; }
    const byMonth = rows.reduce((acc, r) => ((acc[r.month] = acc[r.month] || []).push(r), acc), {});
    const hq = isDate ? '' : ui.classQuery.trim();
    box.innerHTML = Object.entries(byMonth).map(([month, list]) => `
      <section>
        <h3 class="month__title">${escapeHTML(month)} ${list[0].thirdSemester ? '<span class="month__note">Third Semester only</span>' : ''}</h3>
        <ul class="qa">${list.map(r => `
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
    const raw = ui.confQuery.trim();
    const q = raw.toLowerCase();
    const list = P5R.confidants.filter(c => {
      if (ui.confDeadline && !c.deadline) return false;
      if (ui.confRomance && !c.romance) return false;
      return !q || [c.arcana, c.name, c.where, c.how, c.deadline || ''].join(' ').toLowerCase().includes(q);
    });
    $('#confList').innerHTML = list.length ? list.map(c => `
      <article class="conf ${c.deadline ? 'conf--deadline' : ''}">
        <p class="conf__arcana">${highlight(c.arcana, raw)}</p>
        <h3 class="conf__name">${highlight(c.name, raw)}</h3>
        <p class="conf__where">${highlight(c.where, raw)}</p>
        <p class="conf__how">${highlight(c.how, raw)}</p>
        <div class="conf__badges">
          ${c.deadline ? `<span class="badge badge--deadline">${escapeHTML(c.deadline)}</span>` : ''}
          ${c.romance ? '<span class="badge badge--romance">Romance</span>' : ''}
          ${c.auto ? '<span class="badge badge--auto">Ranks up with the story</span>' : ''}
        </div>
      </article>`).join('')
      : `<div class="empty"><strong>No Confidants found</strong>Try an Arcana like Justice or a place like Shinjuku.</div>`;
  }

  /* ================================================================ WEAKNESS COMPENDIUM */
  const AFF = { w: ['Wk', 'Weak'], s: ['Rs', 'Resist'], n: ['Nu', 'Null'], r: ['Rp', 'Repel'], d: ['Dr', 'Drain'] };
  const arcanaName = (a) => (a === 'Hanged' ? 'Hanged Man' : a);
  const PALACE_ORDER = ['Palace 1', 'Palace 2', 'Palace 3', 'Palace 4', 'Palace 5', 'Palace 6', 'Palace 7', 'Third Semester Palace', 'Mementos depths', 'Final area'];

  function renderWeaknesses(tabChanged) {
    const EL = P5R.ELEMENTS;
    if (!EL || !P5R.personas) return;
    const isShadow = ui.wkTab === 'shadows';
    $('#wkCountShadows').textContent = P5R.shadows.length;
    $('#wkCountPersonas').textContent = P5R.personas.length;
    $('#wkDlc').hidden = isShadow;

    const sel = $('#wkGroup');
    if (tabChanged || !sel.options.length) {
      const groups = isShadow
        ? [...new Set(P5R.shadows.map(s => s[4]))].sort((a, b) => {
            const ia = PALACE_ORDER.indexOf(a), ib = PALACE_ORDER.indexOf(b);
            return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
          })
        : [...new Set(P5R.personas.map(p => p[1]))].sort();
      sel.innerHTML = `<option value="all">${isShadow ? 'All areas' : 'All Arcana'}</option>` +
        groups.map(g => `<option value="${escapeHTML(g)}">${escapeHTML(isShadow ? g : arcanaName(g))}</option>`).join('');
      sel.value = 'all';
    }
    $('#wkElems').innerHTML = '<span class="filters__label">Weak to</span>' + EL.map((n, i) =>
      `<button type="button" class="pill ${ui.wkElems.has(i) ? 'is-active' : ''}" data-elem="${i}" aria-pressed="${ui.wkElems.has(i)}">${n}</button>`).join('');

    const q = ui.wkQuery.toLowerCase();
    const rows = (isShadow ? P5R.shadows : P5R.personas).filter(r => {
      const aff = isShadow ? r[5] : r[3];
      if (ui.wkGroup !== 'all' && (isShadow ? r[4] : r[1]) !== ui.wkGroup) return false;
      if (!isShadow && ui.wkHideDlc && r[5]) return false;
      if (ui.wkElems.size && ![...ui.wkElems].some(i => aff[i] === 'w')) return false;
      if (q) {
        const hay = (isShadow ? [r[0], r[1], r[2], r[4]] : [r[0], r[1], arcanaName(r[1]), r[6], r[7]]).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    $('#wkResult').textContent = `Showing ${rows.length} of ${(isShadow ? P5R.shadows : P5R.personas).length} ${isShadow ? 'Shadows' : 'Personas'}`;
    const head = `<thead><tr><th scope="col">${isShadow ? 'Shadow' : 'Persona'}</th>${EL.map((n, i) => `<th scope="col" class="${ui.wkElems.has(i) ? 'is-hot' : ''}">${n}</th>`).join('')}</tr></thead>`;
    const body = rows.map((r, idx) => {
      const aff = isShadow ? r[5] : r[3];
      const sub = isShadow
        ? `Lv ${r[3]} · ${escapeHTML(arcanaName(r[2]))} · ${escapeHTML(r[4])}<br>Persona: ${highlight(r[1], ui.wkQuery)}`
        : `Lv ${r[2]} · ${highlight(arcanaName(r[1]), ui.wkQuery)}${r[6] ? ` · ${escapeHTML(r[6])}` : ''}`;
      const cells = [...aff].map((c, i) => {
        const a = AFF[c];
        const hot = ui.wkElems.has(i) ? ' class="is-hot"' : '';
        return a ? `<td${hot}><b class="aff aff--${c}" title="${EL[i]}: ${a[1]}">${a[0]}</b></td>`
                 : `<td${hot}><span class="aff aff--x" aria-label="${EL[i]}: neutral">·</span></td>`;
      }).join('');
      return `<tr class="${idx < 30 ? 'is-pop' : ''}" style="${idx < 30 ? `animation-delay:${idx * 15}ms` : ''}"><td><span class="wk-name">${highlight(r[0], ui.wkQuery)}${!isShadow && r[5] ? '<span class="wk-dlc">DLC</span>' : ''}</span><span class="wk-sub">${sub}</span></td>${cells}</tr>`;
    }).join('');
    $('#wkTable').innerHTML = head + `<tbody>${body || `<tr><td colspan="11" class="empty"><strong>No matches</strong>Clear a filter or the search box.</td></tr>`}</tbody>`;
  }

  /* ================================================================ NAV: active section + mobile drawer */
  function initActiveNav() {
    if (!('IntersectionObserver' in window)) return;
    const ids = ['overview', 'roadmap', 'third-semester', 'planner', 'trophies', 'classroom', 'confidants', 'weaknesses'];
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        $$('[data-nav]').forEach(l => {
          const on = l.dataset.nav === en.target.id;
          l.classList.toggle('is-active', on);
          if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
  }
  function openToc() {
    $('#toc').classList.add('is-open');
    $('#tocScrim').hidden = false;
    $('#tocBtn').setAttribute('aria-expanded', 'true');
    const first = $('#toc a'); if (first) first.focus();
  }
  function closeToc() {
    if (!$('#toc').classList.contains('is-open')) return;
    $('#toc').classList.remove('is-open');
    $('#tocScrim').hidden = true;
    $('#tocBtn').setAttribute('aria-expanded', 'false');
  }

  /* ================================================================ EVENTS */
  function bindEvents() {
    $('#themeToggle').addEventListener('click', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      save(); applyTheme();
      if (!REDUCED) { const w = $('#wipe'); w.classList.remove('is-run'); void w.offsetWidth; w.classList.add('is-run'); setTimeout(() => w.classList.remove('is-run'), 950); }
    });
    $('#spoilerToggle').addEventListener('click', () => {
      state.shield = !state.shield;
      if (state.shield) state.revealed = {};
      save(); applyShieldButton(); renderTrophies(); renderPlanner();
      toast(state.shield ? 'Spoiler Shield on' : 'Spoiler Shield off: every trophy is visible');
    });

    $('#roadmapList').addEventListener('click', onRoadmapClick);
    $('#trophyGrid').addEventListener('click', onTrophyGridClick);

    $$('.pill[data-grade]').forEach(b => b.addEventListener('click', () => { ui.grade = b.dataset.grade; setPills('.pill[data-grade]', 'grade', ui.grade); renderTrophies(); }));
    $$('.pill[data-status]').forEach(b => b.addEventListener('click', () => { ui.status = b.dataset.status; setPills('.pill[data-status]', 'status', ui.status); renderTrophies(); }));
    $('#tagFilters').addEventListener('click', e => {
      const b = e.target.closest('[data-tag]');
      if (!b) return;
      ui.tags.has(b.dataset.tag) ? ui.tags.delete(b.dataset.tag) : ui.tags.add(b.dataset.tag);
      renderTagFilters(); renderTrophies();
    });
    let st;
    $('#trophySearch').addEventListener('input', e => { clearTimeout(st); st = setTimeout(() => { ui.query = e.target.value.trim(); renderTrophies(); }, 120); });

    $$('[data-action="export"]').forEach(b => b.addEventListener('click', exportSave));
    $('#importFile').addEventListener('change', e => { importSave(e.target.files[0]); e.target.value = ''; });
    $('#resetBtn').addEventListener('click', resetProgress);

    $('#classSearch').addEventListener('input', e => { ui.classQuery = e.target.value; renderClassroom(); });
    $('#classMonth').addEventListener('change', e => { ui.classMonth = e.target.value; renderClassroom(); });
    $('#examOnly').addEventListener('click', e => { ui.examOnly = !ui.examOnly; e.currentTarget.setAttribute('aria-pressed', String(ui.examOnly)); renderClassroom(); });

    $('#confSearch').addEventListener('input', e => { ui.confQuery = e.target.value; renderConfidants(); });
    $('#confDeadline').addEventListener('click', e => { ui.confDeadline = !ui.confDeadline; e.currentTarget.setAttribute('aria-pressed', String(ui.confDeadline)); renderConfidants(); });
    $('#confRomance').addEventListener('click', e => { ui.confRomance = !ui.confRomance; e.currentTarget.setAttribute('aria-pressed', String(ui.confRomance)); renderConfidants(); });

    $('#plannerMonths').addEventListener('click', e => {
      const b = e.target.closest('[data-month]');
      if (!b) return;
      ui.plannerMonth = b.dataset.month; renderPlanner();
    });
    $('#plannerList').addEventListener('click', onPlannerClick);
    $('#plannerKey').addEventListener('click', e => { ui.plannerKey = !ui.plannerKey; e.currentTarget.setAttribute('aria-pressed', String(ui.plannerKey)); renderPlanner(); });
    $('#plannerHideDone').addEventListener('click', e => { ui.plannerHideDone = !ui.plannerHideDone; e.currentTarget.setAttribute('aria-pressed', String(ui.plannerHideDone)); renderPlanner(); });
    $('#plannerResume').addEventListener('click', () => {
      const next = (P5R.planner || []).find(x => !state.days[x.d]);
      if (next) jumpToDay(next.d); else toast('Every day is ticked off. The show is over!');
    });
    $('#plannerJump').addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const v = e.target.value.trim().replace(/^0/, '').replace(/\/0/, '/');
      if (!jumpToDay(v)) toast(`No entry for ${v}. Use the in-game format, such as 11/17. 12/25–12/30 are skipped by the story.`);
    });

    $$('.wk-tab').forEach(b => b.addEventListener('click', () => {
      ui.wkTab = b.dataset.wktab; ui.wkGroup = 'all';
      $$('.wk-tab').forEach(t => t.setAttribute('aria-selected', String(t === b)));
      renderWeaknesses(true);
    }));
    let wt;
    $('#wkSearch').addEventListener('input', e => { clearTimeout(wt); wt = setTimeout(() => { ui.wkQuery = e.target.value.trim(); renderWeaknesses(); }, 120); });
    $('#wkGroup').addEventListener('change', e => { ui.wkGroup = e.target.value; renderWeaknesses(); });
    $('#wkDlc').addEventListener('click', e => { ui.wkHideDlc = !ui.wkHideDlc; e.currentTarget.setAttribute('aria-pressed', String(ui.wkHideDlc)); renderWeaknesses(); });
    $('#wkElems').addEventListener('click', e => {
      const b = e.target.closest('[data-elem]');
      if (!b) return;
      const i = Number(b.dataset.elem);
      ui.wkElems.has(i) ? ui.wkElems.delete(i) : ui.wkElems.add(i);
      renderWeaknesses();
    });

    $('#tocBtn').addEventListener('click', () => ($('#toc').classList.contains('is-open') ? closeToc() : openToc()));
    $('#tocScrim').addEventListener('click', closeToc);
    $('#cutin').addEventListener('click', endCutin);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeToc(); endCutin(); } });

    window.addEventListener('storage', e => { if (e.key === STORAGE_KEY) { state = loadState(); renderAll(); } });
  }

  function renderAll() {
    applyTheme(); applyShieldButton();
    renderRoadmap(); renderPlanner(); renderTagFilters(); renderTrophies(); updateDashboard();
    renderClassroom(); renderConfidants(); renderWeaknesses();
  }

  P5R.onDataChanged = () => { syncPlatinum(); renderTrophies(); updateDashboard(); };

  document.addEventListener('DOMContentLoaded', () => {
    runIntro();
    syncPlatinum();
    initClassroom();
    initRansom();
    bindEvents();
    renderAll();
    initWipeNav();
    initPointerFX();
    initScrollProgress();
    initActiveNav();
  });
})();
