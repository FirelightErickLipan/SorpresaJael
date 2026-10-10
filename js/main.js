/* ==========================================================================
   Lógica del sitio: pregunta inicial, mapa, páginas, música, fotos ampliadas
   Todo el texto/imágenes viene de js/content.js
   ========================================================================== */
(() => {
  'use strict';

  const S = window.SITE || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const paras = (arr) => (arr || []).map((t) => `<p>${esc(t)}</p>`).join('');
  const node = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const store = {
    get(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* ignorar */ } }
  };
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* =======================================================================
     MÚSICA (un solo reproductor, con fundido entre páginas)
     ======================================================================= */
  const Music = (() => {
    const el = new Audio();
    el.preload = 'auto';
    // WAV vacío: sirve para "desbloquear" el audio con el primer toque (iOS/Android)
    const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    let current = null;
    let failed = false;
    let timer = null;
    let resumeAfterHidden = false;

    const safePlay = () => {
      try { const p = el.play(); if (p && typeof p.catch === 'function') p.catch(() => {}); } catch (e) { /* ignorar */ }
    };
    const setVol = (v) => { try { el.volume = Math.min(1, Math.max(0, v)); } catch (e) { /* iOS ignora volume */ } };
    const getVol = () => { try { return el.volume; } catch (e) { return 1; } };

    function ramp(to, ms, done) {
      clearInterval(timer);
      const from = getVol();
      const steps = Math.max(1, Math.round(ms / 40));
      let i = 0;
      timer = setInterval(() => {
        i += 1;
        setVol(from + (to - from) * (i / steps));
        if (i >= steps) { clearInterval(timer); if (done) done(); }
      }, 40);
    }

    function sync() {
      const playing = current !== null && !failed && !el.paused && !el.ended;
      document.body.classList.toggle('is-playing', playing);
      $$('.pp').forEach((b) => { b.textContent = playing ? '❚❚' : '▶'; });
    }
    ['play', 'playing', 'pause', 'ended'].forEach((ev) => el.addEventListener(ev, sync));
    el.addEventListener('error', () => { failed = true; sync(); });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        resumeAfterHidden = current !== null && !el.paused;
        try { el.pause(); } catch (e) { /* ignorar */ }
      } else if (resumeAfterHidden) {
        resumeAfterHidden = false;
        safePlay();
      }
    });

    return {
      prime() {
        try { el.loop = false; el.src = SILENT; } catch (e) { /* ignorar */ }
        setVol(0);
        current = null;
        failed = false;
        safePlay();
      },
      play(track) {
        if (!track || !track.src) { this.stop(); return; }
        const vol = track.vol == null ? 0.7 : track.vol;
        if (current === track.src) { ramp(vol, 500); if (el.paused) safePlay(); return; }
        ramp(0, 220, () => {
          current = track.src;
          failed = false;
          try { el.loop = true; el.src = track.src; } catch (e) { /* ignorar */ }
          safePlay();
          sync();
          ramp(vol, 900);
        });
      },
      stop() {
        ramp(0, 300, () => {
          try { el.pause(); } catch (e) { /* ignorar */ }
          current = null;
          sync();
        });
      },
      toggle() {
        if (current === null) return;
        if (el.paused) safePlay(); else { try { el.pause(); } catch (e) { /* ignorar */ } }
      },
      setMuted(m) { el.muted = !!m; },
      get muted() { return el.muted; }
    };
  })();

  /* =======================================================================
     EFECTOS: pétalos rojos / copos de nieve en un canvas
     ======================================================================= */
  const FX = (() => {
    const cv = $('#fx');
    const ctx = cv && cv.getContext ? cv.getContext('2d') : null;
    if (!ctx) return { mode() {}, burst() {} };

    let W = 0, H = 0, dpr = 1, kind = 'petals', parts = [];
    const COLORS = ['#5e0b18', '#8a0f24', '#b3122b', '#d3203d'];
    const total = () => (reduceMotion ? 10 : window.innerWidth < 600 ? 32 : 58);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.width = Math.round(window.innerWidth * dpr);
      H = cv.height = Math.round(window.innerHeight * dpr);
      cv.style.width = window.innerWidth + 'px';
      cv.style.height = window.innerHeight + 'px';
    }
    function make(initial, burst) {
      const snow = kind === 'snow';
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : -20 * dpr - Math.random() * 60 * dpr,
        r: (snow ? 1.2 + Math.random() * 2.8 : 5 + Math.random() * 7) * dpr,
        vy: (0.3 + Math.random() * 0.8) * dpr * (snow ? 0.7 : 1) * (burst ? 3 : 1),
        vx: (Math.random() - 0.5) * 0.5 * dpr,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.04,
        sway: Math.random() * 6.28,
        swayS: 0.01 + Math.random() * 0.02,
        a: 0.35 + Math.random() * 0.55,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        temp: !!burst
      };
    }
    function reset() { parts = Array.from({ length: total() }, () => make(true, false)); }
    function draw(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      if (kind === 'snow') {
        ctx.arc(0, 0, p.r, 0, 6.2832);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255,255,255,.85)';
        ctx.shadowBlur = 6 * dpr;
      } else {
        ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.2832);
        ctx.fillStyle = p.c;
      }
      ctx.fill();
      ctx.restore();
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.sway += p.swayS;
        p.x += p.vx + Math.sin(p.sway) * 0.5 * dpr;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > H + 30 * dpr) {
          if (p.temp) { parts.splice(i, 1); continue; }
          parts[i] = make(false, false);
        }
        draw(p);
      }
      window.requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    resize();
    reset();
    window.requestAnimationFrame(tick);

    return {
      mode(k) { if (k && k !== kind) { kind = k; reset(); } },
      burst(n) { for (let i = 0; i < n; i++) parts.push(make(false, true)); }
    };
  })();

  /* =======================================================================
     FOTO AMPLIADA (lightbox con botón X)
     ======================================================================= */
  const Lightbox = (() => {
    const box = $('#lightbox');
    const img = $('#lbImg');
    const cap = $('#lbCap');
    const btn = $('#lbClose');
    let isOpen = false;

    function closeUI() {
      if (!isOpen) return;
      isOpen = false;
      box.classList.remove('open');
      document.body.classList.remove('noscroll');
      setTimeout(() => { if (!isOpen) { box.hidden = true; img.removeAttribute('src'); } }, 220);
    }
    function requestClose() {
      // si abrimos el visor empujando un estado al historial, retrocedemos para sacarlo
      if (isOpen && window.history && window.history.state && window.history.state.lb) window.history.back();
      else closeUI();
    }
    function open(src, caption) {
      img.src = src;
      img.alt = caption || '';
      cap.textContent = caption || '';
      box.hidden = false;
      isOpen = true;
      document.body.classList.add('noscroll');
      window.requestAnimationFrame(() => box.classList.add('open'));
      try { window.history.pushState({ v: currentView, lb: 1 }, '', window.location.href); } catch (e) { /* ignorar */ }
      btn.focus();
    }

    btn.addEventListener('click', requestClose);
    box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lb-fig')) requestClose(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) requestClose(); });

    return { open, closeUI, get isOpen() { return isOpen; } };
  })();

  /* =======================================================================
     ESTADO Y NAVEGACIÓN
     ======================================================================= */
  const PAGES = ['taehyung', 'gustos', 'juegos', 'final'];
  let currentView = 'gate';
  let passed = false;
  let visited = new Set();
  try { visited = new Set(JSON.parse(store.get('visited') || '[]')); } catch (e) { visited = new Set(); }
  const markVisited = (id) => {
    if (PAGES.indexOf(id) === -1) return;
    visited.add(id);
    store.set('visited', JSON.stringify(Array.from(visited)));
  };

  const app = $('#app');
  const muteBtn = $('#muteBtn');

  function go(id, opts) {
    const push = !(opts && opts.push === false);
    if (!$('#view-' + id)) id = 'hub';
    if (id !== 'gate' && !passed) id = 'gate';

    $$('.view').forEach((v) => v.classList.remove('active'));
    const next = $('#view-' + id);
    next.classList.add('active');
    window.scrollTo(0, 0);
    currentView = id;
    document.body.dataset.view = id;

    FX.mode((S.fx && S.fx[id]) || 'petals');
    if (id !== 'gate') Music.play(S.music ? S.music[id] : null);
    muteBtn.hidden = id === 'gate' || !passed;
    if (id === 'hub') updateHub();
    markVisited(id);

    if (push) { try { window.history.pushState({ v: id }, '', '#' + id); } catch (e) { /* ignorar */ } }
  }

  window.addEventListener('popstate', (e) => {
    if (Lightbox.isOpen) { Lightbox.closeUI(); return; }
    const v = (e.state && e.state.v) || (window.location.hash || '').replace('#', '') || 'gate';
    go(v, { push: false });
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest ? e.target.closest('[data-go]') : null;
    if (!t) return;
    if (t.classList.contains('locked')) { lockedTap(t); return; }
    go(t.dataset.go);
  });

  /* =======================================================================
     BLOQUES REUTILIZABLES
     ======================================================================= */
  const viewEl = (id) => {
    const v = node('section', 'view view-' + id);
    v.id = 'view-' + id;
    return v;
  };
  const topbar = (title) =>
    `<div class="topbar"><button class="back" type="button" data-go="hub">← Mapa</button><span class="topbar-t">${esc(title)}</span></div>`;

  function placeholder(src) {
    const d = node('div', 'ph');
    d.textContent = 'Agrega aquí: ' + src;
    return d;
  }

  const FX_ORDER = ['up', 'left', 'right', 'zoom'];
  function mediaFigure(m, i) {
    const fig = node('figure', 'media reveal');
    fig.dataset.fx = FX_ORDER[i % FX_ORDER.length];
    const fail = () => { fig.textContent = ''; fig.append(placeholder(m.src)); };

    if (m.type === 'video') {
      const v = document.createElement('video');
      v.setAttribute('playsinline', '');
      v.preload = 'metadata';
      if (m.autoplay) {
        v.muted = true; v.setAttribute('muted', '');
        v.loop = true; v.autoplay = true;
      } else {
        v.controls = true;
      }
      v.addEventListener('error', fail);
      v.src = m.src;
      fig.append(v);
    } else {
      const img = document.createElement('img');
      img.className = 'zoomable';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = m.caption || '';
      img.addEventListener('error', fail);
      img.addEventListener('click', () => Lightbox.open(m.src, m.caption));
      img.src = m.src;
      fig.append(img, node('span', 'zoom-badge', '⤢'));
    }
    if (m.caption) fig.append(node('figcaption', '', esc(m.caption)));
    return fig;
  }
  function mediaGrid(items) {
    if (!items || !items.length) return null;
    const grid = node('div', 'media-grid');
    items.forEach((m, i) => grid.append(mediaFigure(m, i)));
    return grid;
  }

  /* =======================================================================
     PREGUNTA INICIAL (Flutter)
     ======================================================================= */
  function moonSVG() {
    // Respaldo original (luna roja) por si todavía no pusiste las imágenes de Flutter
    return `<svg viewBox="0 0 300 300" aria-hidden="true">
      <defs><mask id="moonCut"><rect width="300" height="300" fill="#fff"/><circle cx="192" cy="122" r="92" fill="#000"/></mask></defs>
      <circle cx="140" cy="152" r="106" fill="#d9243f" mask="url(#moonCut)"/>
      <g fill="#ffd9de" opacity=".85"><circle cx="228" cy="214" r="3"/><circle cx="196" cy="246" r="2"/><circle cx="246" cy="170" r="2.4"/></g>
    </svg>`;
  }

  function ravenSVG(cls) {
    return `<svg class="raven ${cls || ''}" viewBox="0 0 220 180" aria-hidden="true">
      <path d="M4 130 C50 122 110 134 150 126 C176 121 198 124 216 116" fill="none" stroke="#050203" stroke-width="6" stroke-linecap="round"/>
      <path d="M150 126 l20 -14 M118 130 l-6 12 M66 127 l-10 -10" stroke="#050203" stroke-width="3" stroke-linecap="round"/>
      <path d="M98 108 L96 127 M112 110 L113 127" stroke="#050203" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M91 128 l5 -1 l5 2 M107 128 l5 -1 l5 2" stroke="#050203" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path fill="#050203" d="M14 62 C30 50 48 42 62 40 C66 26 82 18 98 22 C114 26 122 40 134 54 C150 70 164 90 172 108 C180 124 190 146 200 168 L190 162 L190 172 L180 164 L176 174 L166 160 L160 168 L154 150 C140 128 128 118 110 116 C94 114 82 102 80 88 L72 90 L76 82 L64 82 L72 74 L60 72 L58 66 C44 66 30 66 14 62 Z"/>
      <path d="M62 40 C48 46 30 54 14 62" fill="none" stroke="#5a1424" stroke-width="1.2" opacity=".9"/>
      <path d="M100 40 C128 60 154 92 178 134" stroke="#6a1527" stroke-width="2" fill="none" opacity=".8"/>
      <path d="M92 54 C116 72 140 102 160 138" stroke="#6a1527" stroke-width="1.4" fill="none" opacity=".7"/>
      <circle class="r-eye-glow" cx="74" cy="38" r="7" fill="#ff3b55" opacity=".28"/>
      <circle class="r-eye" cx="74" cy="38" r="3" fill="#ff4a5e"/>
    </svg>`;
  }
  function archSVG() {
    return `<svg class="gate-arch" viewBox="0 0 300 600" preserveAspectRatio="none" aria-hidden="true">
      <path d="M14 600 L14 250 C14 140 84 64 150 12 C216 64 286 140 286 250 L286 600" fill="none" stroke="#7a0f24" stroke-width="2"/>
      <path d="M30 600 L30 256 C30 156 92 86 150 40 C208 86 270 156 270 256 L270 600" fill="none" stroke="#5a0b1a" stroke-width="1"/>
      <path d="M150 12 L150 40" stroke="#7a0f24" stroke-width="2"/>
      <circle cx="150" cy="26" r="3" fill="#b3122b"/>
    </svg>`;
  }

  function buildGate() {
    const g = S.gate || {};
    const fl = S.fluttershy || {};
    const v = viewEl('gate');
    v.innerHTML = `
      <div class="gate">
        ${archSVG()}
        <div class="gate-top">
          ${ravenSVG('raven-gate')}
          <h2 class="gate-for">${esc(g.para || 'Para ti')}</h2>
          <div class="orn" aria-hidden="true"><span>✠</span></div>
        </div>
        <p class="kicker">${esc(g.kicker)}</p>
        <div class="fl-stage" id="flStage" data-sad="0">
          <div class="fl-glow"></div>
          <img class="fl-img" id="flImg" alt="" decoding="async">
          <div class="fl-fallback">${moonSVG()}</div>
          <div class="tears" aria-hidden="true"><i></i><i></i><i></i></div>
        </div>
        <h1 class="gate-q" id="gateQ">${esc(g.question)}</h1>
        <p class="gate-sub" id="gateSub"></p>
        <div class="gate-actions">
          <button class="btn btn-yes" id="btnYes" type="button">${esc(g.yes)}</button>
          <button class="btn btn-no" id="btnNo" type="button">${esc(g.no)}</button>
        </div>
      </div>`;
    app.append(v);

    const stage = $('#flStage', v);
    const img = $('#flImg', v);
    const qEl = $('#gateQ', v);
    const subEl = $('#gateSub', v);
    const btnYes = $('#btnYes', v);
    const btnNo = $('#btnNo', v);
    let noCount = 0;
    let entering = false;

    const steps = S.forceYes === false
      ? (g.noSteps || []).slice(0, 3).concat([g.noStepSoft || { q: 'Está bien…', sub: 'Si necesitas tiempo, lo entiendo.' }])
      : (g.noSteps || []);

    function setSad(n) {
      stage.dataset.sad = String(n);
      stage.style.setProperty('--sad', String(n));
      img.dataset.state = n > 0 ? 'sad' : 'happy';
      const src = n > 0 ? fl.sad : fl.happy;
      if (src && img.getAttribute('src') !== src) img.src = src;
    }
    img.addEventListener('load', () => stage.classList.remove('missing'));
    img.addEventListener('error', () => {
      // si falta la imagen triste, usamos la feliz (con el filtro de tristeza)
      if (img.dataset.state === 'sad' && fl.happy && img.getAttribute('src') !== fl.happy) img.src = fl.happy;
      else stage.classList.add('missing');
    });
    setSad(0);
    if (!fl.happy) stage.classList.add('missing');

    function finish(messageText) {
      if (entering) return;
      entering = true;
      Music.prime(); // desbloquea el audio con este toque
      FX.burst(70);
      qEl.textContent = messageText;
      subEl.textContent = '';
      setSad(0);
      stage.classList.remove('shake');
      [btnYes, btnNo].forEach((b) => { b.disabled = true; b.style.opacity = '0'; });
      passed = true;
      setTimeout(() => go('hub'), 1500);
    }

    btnYes.addEventListener('click', () => finish(g.thanks || 'Gracias 🖤'));
    btnNo.addEventListener('click', () => {
      if (btnNo.dataset.mode === 'yes') { finish(g.thanks || 'Gracias 🖤'); return; }
      if (btnNo.dataset.mode === 'soft') { finish(g.soft || 'Está bien 🖤'); return; }

      noCount += 1;
      const step = steps[Math.min(noCount - 1, steps.length - 1)] || { q: g.question, sub: '' };
      qEl.textContent = step.q;
      subEl.textContent = step.sub;
      setSad(Math.min(noCount, 4));
      btnNo.style.setProperty('--s', String(Math.max(0.62, 1 - noCount * 0.1)));
      btnYes.style.setProperty('--s', String(1 + Math.min(noCount, 4) * 0.07));
      restart(stage, 'shake');

      if (noCount >= steps.length) {
        if (S.forceYes === false) { btnNo.textContent = g.noFinalSoft || 'Necesito tiempo'; btnNo.dataset.mode = 'soft'; }
        else { btnNo.textContent = g.noFinalForce || 'Sí'; btnNo.dataset.mode = 'yes'; }
        btnNo.style.setProperty('--s', '1');
      }
    });
  }

  /* =======================================================================
     MAPA (hub)
     ======================================================================= */
  function buildHub() {
    const h = S.hub || {};
    const v = viewEl('hub');
    const cards = (h.cards || []).map((c, i) => `
      <button class="card" type="button" data-go="${esc(c.id)}" data-order="${i + 1}">
        <span class="chip"></span>
        <span class="card-ic" aria-hidden="true">${esc(c.icon)}</span>
        <span class="card-t">${esc(c.title)}</span>
        <span class="card-s">${esc(c.sub)}</span>
      </button>`).join('');
    v.innerHTML = `
      <div class="wrap">
        <div class="center hub-raven">${ravenSVG('raven-hub')}</div>
        <p class="kicker" style="margin-top:6px">♪ mejor con sonido</p>
        <h1 class="title title-gothic">${esc(h.title)}</h1>
        <div class="orn" aria-hidden="true"><span>✠</span></div>
        <div class="hub-intro">${paras(h.intro)}</div>
        <div class="cards">${cards}</div>
        <p class="hub-hint" id="hubHint"></p>
      </div>`;
    app.append(v);
  }

  function updateHub() {
    const h = S.hub || {};
    const need = ['taehyung', 'gustos', 'juegos'];
    const unlocked = S.lockFinal === false || need.every((k) => visited.has(k));
    let nextSet = false;
    $$('#view-hub .card').forEach((c) => {
      const id = c.dataset.go;
      const done = visited.has(id);
      const locked = id === 'final' && !unlocked;
      const isNext = !done && !locked && !nextSet;
      if (isNext) nextSet = true;
      c.classList.toggle('done', done);
      c.classList.toggle('locked', locked);
      c.classList.toggle('next', isNext);
      $('.chip', c).textContent = locked ? '🔒 pronto' : done ? '✓ visto' : isNext ? 'toca aquí' : '';
    });
    $('#hubHint').textContent = unlocked ? (h.hintUnlocked || '') : (h.hintLocked || '');
  }

  function lockedTap(card) {
    restart(card, 'shake');
    const hint = $('#hubHint');
    if (!hint) return;
    hint.textContent = (S.hub && S.hub.hintLocked) || '';
    hint.classList.add('flash');
    setTimeout(() => hint.classList.remove('flash'), 900);
  }

  /* =======================================================================
     TAEHYUNG
     ======================================================================= */
  function buildTaehyung() {
    const t = S.taehyung || {};
    const track = t.track || {};
    const v = viewEl('taehyung');
    v.innerHTML = `
      <div class="wrap">
        ${topbar(t.topbar)}
        <h1 class="title">${esc(t.title)}</h1>
        <p class="subtitle">${esc(t.subtitle)}</p>
        <div class="player reveal" data-fx="zoom">
          <div class="vinyl" aria-hidden="true"></div>
          <div class="np"><span class="np-k">Sonando</span><strong>${esc(track.title)}</strong><span>${esc(track.artist)}</span></div>
          <div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
          <button class="pp" type="button" aria-label="Pausar o reproducir la canción">▶</button>
        </div>
        <div class="dedication reveal">${paras(t.dedication)}</div>
        <div id="taeMedia"></div>
      </div>`;
    app.append(v);
    $('.pp', v).addEventListener('click', () => Music.toggle());
    const grid = mediaGrid(t.media);
    if (grid) $('#taeMedia', v).append(grid);
  }

  /* =======================================================================
     GUSTOS
     ======================================================================= */
  function buildGustos() {
    const g = S.gustos || {};
    const v = viewEl('gustos');
    v.innerHTML = `
      <div class="wrap">
        ${topbar(g.topbar)}
        <h1 class="title">${esc(g.title)}</h1>
        <p class="subtitle">${esc(g.subtitle)}</p>
        <div id="gustosList"></div>
      </div>`;
    app.append(v);
    const list = $('#gustosList', v);
    const musicBlocks = new Map();
    const inView = new Set();
    const applyBlockMusic = () => {
      if (currentView !== 'gustos') return;
      const first = inView.values().next().value;
      Music.play(first ? musicBlocks.get(first) : (S.music ? S.music.gustos : null));
    };
    const mio = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((en) => { if (en.isIntersecting) inView.add(en.target); else inView.delete(en.target); });
          applyBlockMusic();
        }, { threshold: 0.4 })
      : null;
    (g.blocks || []).forEach((b, i) => {
      const art = node('article', `block reveal deco-${esc(b.deco || 'gothic')}`);
      art.dataset.fx = i % 2 ? 'right' : 'left';
      art.innerHTML = `
        <div class="block-n">${String(i + 1).padStart(2, '0')}</div>
        <h2 class="block-t">${esc(b.title)}</h2>
        ${paras(b.text)}
        ${b.music ? '<div class="center"><span class="note">♪ aquí suena algo para esta parte</span></div>' : ''}`;
      const grid = mediaGrid(b.media);
      if (grid) art.append(grid);
      list.append(art);
      if (b.music && mio) { musicBlocks.set(art, b.music); mio.observe(art); }
    });
  }

  /* =======================================================================
     JUEGOS (línea de tiempo)
     ======================================================================= */
  function buildJuegos() {
    const j = S.juegos || {};
    const v = viewEl('juegos');
    const track = j.track && j.track.title
      ? `<div class="center"><span class="note">♪ Sonando: ${esc(j.track.title)}${j.track.artist ? ' · ' + esc(j.track.artist) : ''}</span></div>` : '';
    v.innerHTML = `
      <div class="wrap">
        ${topbar(j.topbar)}
        <h1 class="title">${esc(j.title)}</h1>
        <p class="subtitle">${esc(j.subtitle)}</p>
        ${track}
        <div class="hub-intro reveal">${paras(j.intro)}</div>
        <ol class="timeline" id="timeline"></ol>
      </div>`;
    app.append(v);
    const ol = $('#timeline', v);
    (j.entries || []).forEach((en, i) => {
      const li = node('li', 't-item reveal');
      li.dataset.fx = i % 2 ? 'right' : 'left';
      li.innerHTML = `
        ${en.when ? `<div class="t-when">${esc(en.when)}</div>` : ''}
        <h2 class="t-title">${esc(en.title)}</h2>
        ${paras(en.text)}`;
      const grid = mediaGrid(en.media);
      if (grid) li.append(grid);
      ol.append(li);
    });
  }

  /* =======================================================================
     FINAL: claveles con copos de nieve + carta
     ======================================================================= */
  /* ---- Ramo: claveles rojo oscuro y negros + «copos de nieve» (nube blanca) ---- */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const f1 = (n) => n.toFixed(1);

  // borde de pétalo dentado (como un clavel)
  function serrated(r, teeth, amp, rot) {
    const n = teeth * 6;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2;
      const k = Math.abs(Math.sin((t * teeth) / 2 + rot));
      const rr = r * (1 + amp * (k * 2 - 1));
      d += (i ? 'L' : 'M') + f1(rr * Math.cos(t)) + ' ' + f1(rr * Math.sin(t));
    }
    return d + 'Z';
  }

  const PALETTES = {
    red:   { c: ['#2e040b', '#4a0713', '#690a1d', '#850d27', '#a01232', '#bd1d3f'], rim: 'rgba(0,0,0,.5)',        vein: 'rgba(0,0,0,.35)' },
    wine:  { c: ['#1d0307', '#33050d', '#4d0816', '#650b1f', '#7d1028', '#96153a'], rim: 'rgba(0,0,0,.5)',        vein: 'rgba(0,0,0,.4)' },
    black: { c: ['#030102', '#0b0305', '#150609', '#210a10', '#32101a', '#4d1727'], rim: 'rgba(255,74,94,.7)',    vein: 'rgba(255,74,94,.16)' }
  };
  const LAYERS = [[46, 16], [40, 15], [33, 13], [26, 11], [19, 9], [11, 7]];

  function carnation(cx, cy, s, seed, pal) {
    const P = PALETTES[pal] || PALETTES.red;
    let g = `<g class="cn cn-${pal}" transform="translate(${cx} ${cy}) scale(${s})">`;
    LAYERS.forEach((l, i) => {
      g += `<path d="${serrated(l[0], l[1], 0.1 + i * 0.006, i * 0.9 + seed)}" fill="${P.c[i]}" stroke="${P.rim}" stroke-width="${pal === 'black' ? 1.3 : 1}" stroke-linejoin="round"/>`;
      if (i === 1 || i === 2 || i === 3) {
        let v = '';
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * Math.PI * 2 + i * 0.4 + seed;
          v += `M${f1(Math.cos(a) * l[0] * 0.3)} ${f1(Math.sin(a) * l[0] * 0.3)}L${f1(Math.cos(a) * l[0] * 0.92)} ${f1(Math.sin(a) * l[0] * 0.92)}`;
        }
        g += `<path d="${v}" stroke="${P.vein}" stroke-width=".8" fill="none"/>`;
      }
    });
    g += `<circle r="4" fill="${pal === 'black' ? '#6b1a2e' : '#d8334f'}" opacity=".55"/>`;
    return g + '</g>';
  }

  // rama de «copos de nieve» (gypsophila): tallos finos con florecitas blancas
  function spray(R, x, y, ang, len, depth, out) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    out.stems += `M${f1(x)} ${f1(y)}L${f1(x2)} ${f1(y2)}`;
    if (depth <= 0) {
      const n = 2 + Math.floor(R() * 3);
      for (let i = 0; i < n; i++) out.flowers.push([x2 + (R() - 0.5) * 9, y2 + (R() - 0.5) * 9, 0.7 + R() * 0.5]);
      return;
    }
    const kids = 2 + (R() < 0.5 ? 1 : 0);
    for (let k = 0; k < kids; k++) spray(R, x2, y2, ang + (R() - 0.5) * 1.2, len * (0.3 + R() * 0.14), depth - 1, out);
    spray(R, x + (x2 - x) * 0.55, y + (y2 - y) * 0.55, ang + (R() < 0.5 ? -1 : 1) * (0.5 + R() * 0.4), len * (0.3 + R() * 0.1), depth - 1, out);
  }
  function sprayGroup(seed, list) {
    const R = rng(seed);
    const out = { stems: '', flowers: [] };
    list.forEach((o) => spray(R, o[0], o[1], o[2], o[3], 2, out));
    let g = `<path d="${out.stems}" stroke="#7d9a88" stroke-width=".8" stroke-linecap="round" fill="none" opacity=".85"/>`;
    out.flowers.forEach((f, i) => {
      g += `<use href="#gyp" class="${i % 6 === 0 ? 'tw' : ''}" style="animation-delay:-${(i * 0.37 % 4).toFixed(1)}s" transform="translate(${f1(f[0])} ${f1(f[1])}) scale(${f[2].toFixed(2)})"/>`;
    });
    return g;
  }

  function leaf(x, y, rot, len, fill) {
    const l = len, w = len * 0.36;
    return `<path transform="translate(${x} ${y}) rotate(${rot})" d="M0 0 C ${f1(l * 0.3)} ${f1(-w)}, ${f1(l * 0.75)} ${f1(-w)}, ${l} 0 C ${f1(l * 0.75)} ${f1(w)}, ${f1(l * 0.3)} ${f1(w)}, 0 0Z" fill="${fill}" stroke="rgba(0,0,0,.45)" stroke-width=".6"/>`;
  }

  function bouquetSVG() {
    const GX = 160, GY = 292;
    const flowers = [
      [160, 82, 0.80, 0.6, 'red'],
      [108, 112, 0.76, 3.4, 'black'],
      [214, 112, 0.76, 4.5, 'red'],
      [66, 162, 0.66, 1.1, 'red'],
      [254, 160, 0.66, 2.3, 'black'],
      [136, 152, 0.80, 5.1, 'wine'],
      [188, 154, 0.80, 2.9, 'black'],
      [100, 206, 0.62, 1.7, 'wine'],
      [160, 212, 0.74, 3.9, 'red'],
      [222, 204, 0.62, 0.3, 'black']
    ];
    const back = [];
    for (let i = 0; i < 11; i++) back.push([GX + (i - 5) * 3, 262, -Math.PI / 2 + (i - 5) * 0.25 + (i % 2 ? 0.04 : -0.04), 128 + (i % 3) * 22 - Math.abs(i - 5) * 4]);
    const front = [[GX, 252, -2.5, 66], [GX, 252, -1.95, 72], [GX, 252, -1.2, 70], [GX, 252, -0.6, 66]];

    const sheet = 'M-72 0 L-78 -206 Q-52 -236 -22 -220 Q8 -246 40 -222 Q68 -234 78 -204 L72 0 Z';
    let o = `<svg class="bouquet" id="bouquet" viewBox="0 0 320 430" role="img" aria-label="Ramo de claveles oscuros con copos de nieve">
      <defs>
        <linearGradient id="shA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a0e1b"/><stop offset="1" stop-color="#0c0508"/></linearGradient>
        <linearGradient id="shB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c0a10"/><stop offset="1" stop-color="#070304"/></linearGradient>
        <linearGradient id="shC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0b15"/><stop offset="1" stop-color="#0a0406"/></linearGradient>
        <linearGradient id="shF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1a0a10"/><stop offset=".6" stop-color="#0a0406"/><stop offset="1" stop-color="#3a0a16"/></linearGradient>
        <linearGradient id="rib" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8162f"/><stop offset="1" stop-color="#6e0c1f"/></linearGradient>
        <g id="gyp">
          <circle cx="0" cy="-2.1" r="1.55" fill="#fff"/><circle cx="2" cy="-.65" r="1.55" fill="#fff"/><circle cx="1.25" cy="1.7" r="1.55" fill="#fff"/>
          <circle cx="-1.25" cy="1.7" r="1.55" fill="#fff"/><circle cx="-2" cy="-.65" r="1.55" fill="#fff"/><circle r=".8" fill="#e9d9a6"/>
        </g>
      </defs>
      <g transform="translate(${GX} ${GY + 28})">
        <path transform="rotate(-31) scale(.92)" d="${sheet}" fill="url(#shA)" stroke="#8a0f24" stroke-width="1.4"/>
        <path transform="rotate(31) scale(.92)" d="${sheet}" fill="url(#shC)" stroke="#6e0c1f" stroke-width="1.4"/>
        <path transform="rotate(-11)" d="${sheet}" fill="url(#shB)" stroke="#4a0a17" stroke-width="1.2"/>
        <path transform="rotate(12)" d="${sheet}" fill="url(#shA)" stroke="#a31230" stroke-width="1.2" opacity=".95"/>
      </g>
      <g class="sway" style="animation-delay:-1.4s">${sprayGroup(11, back)}</g>`;

    // tallos y hojas
    flowers.forEach((f, i) => {
      const x = f[0], y = f[1];
      o += `<g class="sway" style="animation-delay:-${(i * 0.9).toFixed(1)}s">
        <path d="M${x} ${y + 10} C ${x} ${y + 70}, ${GX + (x - GX) * 0.25} ${GY - 30}, ${GX} ${GY + 10}" fill="none" stroke="#0e2a1b" stroke-width="4.6" stroke-linecap="round"/>
        <path d="M${x} ${y + 10} C ${x} ${y + 70}, ${GX + (x - GX) * 0.25} ${GY - 30}, ${GX} ${GY + 10}" fill="none" stroke="#2a6a45" stroke-width="1.1" stroke-linecap="round" opacity=".6"/>
      </g>`;
    });
    // hojas verdes oscuras y ramitas plateadas entre las flores
    o += leaf(74, 224, -150, 38, '#173d27') + leaf(246, 220, -30, 38, '#173d27') + leaf(120, 250, -128, 34, '#14331f') + leaf(204, 248, -52, 34, '#14331f');

    // claveles (de arriba hacia abajo, los de abajo quedan encima)
    flowers.slice().sort((a, b) => a[1] - b[1]).forEach((f, i) => {
      o += `<g class="sway" style="animation-delay:-${(i * 0.9).toFixed(1)}s">${carnation(f[0], f[1], f[2], f[3], f[4])}</g>`;
    });

    o += `<g class="sway" style="animation-delay:-2.2s">${sprayGroup(29, front)}</g>`;

    // papel delantero + moño
    o += `
      <path d="M96 292 Q160 262 224 292 L182 424 L138 424 Z" fill="url(#shF)" stroke="#8a0f24" stroke-width="1.5"/>
      <path d="M160 280 L160 424 M128 292 L147 424 M192 292 L173 424" stroke="rgba(255,74,94,.18)" stroke-width="1" fill="none"/>
      <path d="M96 292 Q160 262 224 292" fill="none" stroke="#c8162f" stroke-width="1.6"/>
      <path d="M160 322 C 118 292, 92 336, 126 350 C 146 356, 156 340, 160 322 Z" fill="url(#rib)" stroke="#2a0510" stroke-width="1.2"/>
      <path d="M160 322 C 202 292, 228 336, 194 350 C 174 356, 164 340, 160 322 Z" fill="url(#rib)" stroke="#2a0510" stroke-width="1.2"/>
      <path d="M158 326 L134 386 L152 376 L160 392 Z" fill="#8a0f24" stroke="#2a0510" stroke-width="1.1"/>
      <path d="M162 326 L186 386 L168 376 L160 392 Z" fill="#a31230" stroke="#2a0510" stroke-width="1.1"/>
      <circle cx="160" cy="326" r="7" fill="#c8162f" stroke="#2a0510" stroke-width="1.2"/>
      <path d="M126 330 q10 -8 22 -2 M174 328 q10 -8 22 2" stroke="rgba(255,255,255,.25)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    </svg>`;
    return o;
  }

  function buildFinal() {
    const f = S.final || {};
    const v = viewEl('final');
    const phone = String(S.whatsapp || '').replace(/\D/g, '');
    const wa = phone
      ? `<a class="btn btn-yes" id="waBtn" target="_blank" rel="noopener" href="https://wa.me/${phone}?text=${encodeURIComponent(S.whatsappTexto || '')}">${esc(f.whatsappLabel)}</a>`
      : '';
    v.innerHTML = `
      <div class="wrap">
        ${topbar(f.topbar)}
        <h1 class="title">${esc(f.title)}</h1>
        <p class="subtitle">${esc(f.subtitle)}</p>
        <div class="reveal" data-fx="zoom">${bouquetSVG()}</div>
        <p class="center" style="margin:0 0 18px;color:var(--mute);font-style:italic">(tócalos y caerán copos de nieve ❄️)</p>
        <div class="frame reveal" id="finalPhoto"></div>
        <div class="letter reveal">
          ${paras(f.letter)}
          <p class="closing">${esc(f.closing)}</p>
          <p class="signature">${esc(f.signature)}</p>
        </div>
        <div class="final-actions">
          ${wa}
          <button class="btn btn-ghost" type="button" data-go="hub">${esc(f.backLabel)}</button>
        </div>
      </div>`;
    app.append(v);
    if (f.photo) $('#finalPhoto', v).append(mediaFigure(f.photo, 0));
    const bq = $('#bouquet', v);
    bq.addEventListener('click', () => { FX.burst(60); restart(bq, 'pop'); });
  }

  /* =======================================================================
     APARICIÓN AL HACER SCROLL
     ======================================================================= */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })
    : null;
  function observeReveals() {
    $$('.reveal').forEach((el) => { if (io) io.observe(el); else el.classList.add('in'); });
  }

  /* =======================================================================
     INICIO
     ======================================================================= */
  function init() {
    document.title = 'Para Jael 🖤';
    buildGate();
    buildHub();
    buildTaehyung();
    buildGustos();
    buildJuegos();
    buildFinal();
    observeReveals();

    muteBtn.addEventListener('click', () => {
      const m = !Music.muted;
      Music.setMuted(m);
      muteBtn.classList.toggle('off', m);
      muteBtn.setAttribute('aria-pressed', String(m));
    });

    try { window.history.replaceState({ v: 'gate' }, '', '#gate'); } catch (e) { /* ignorar */ }
    go('gate', { push: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
