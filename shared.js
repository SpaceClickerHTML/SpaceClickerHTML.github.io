/* ============================================================
   NOVA DRIFT — shared engine
   State, rarities, achievements, sound, art, starfield, utils.
   Loaded on every page before the page-specific script.
   ============================================================ */

const STORAGE_KEY = 'novaDriftState';
const MUTE_KEY = 'novaDriftMuted';

/* ---------- Rarity definitions (collected specimens) ---------- */
const RARITIES = {
  planet:      { label: 'Planet',       order: 0, color: '#5fd3c4', glow: '#2dd4bf', weightBase: 500000 },
  star:        { label: 'Star',         order: 1, color: '#fbbf24', glow: '#f59e0b', weightBase: 100000 },
  solarSystem: { label: 'Solar System', order: 2, color: '#fb923c', glow: '#f97316', weightBase: 10000  },
  galaxy:      { label: 'Galaxy',       order: 3, color: '#a78bfa', glow: '#8b5cf6', weightBase: 1000   },
  universe:    { label: 'Universe',     order: 4, color: '#f472b6', glow: '#ec4899', weightBase: 100    },
};
const RARITY_KEYS = Object.keys(RARITIES).sort((a,b)=>RARITIES[a].order-RARITIES[b].order);

/* ---------- Companion (alien) rarity definitions ---------- */
const COMPANION_RARITIES = {
  Common:    { order: 0, color: '#9ca3af', glow: '#d1d5db', luckMultiplier: 1.5, coinRate: 0.1, chance: 60 },
  Uncommon:  { order: 1, color: '#4ade80', glow: '#86efac', luckMultiplier: 2,   coinRate: 0.3, chance: 30 },
  Rare:      { order: 2, color: '#60a5fa', glow: '#93c5fd', luckMultiplier: 2.5, coinRate: 1,   chance: 7  },
  Epic:      { order: 3, color: '#c084fc', glow: '#e9d5ff', luckMultiplier: 5,   coinRate: 5,   chance: 2.5},
  Legendary: { order: 4, color: '#fbbf24', glow: '#fde68a', luckMultiplier: 50,  coinRate: 25,  chance: 0.5},
};
const COMPANION_KEYS = Object.keys(COMPANION_RARITIES).sort((a,b)=>COMPANION_RARITIES[a].order-COMPANION_RARITIES[b].order);

/* ---------- Default state ---------- */
function defaultState() {
  return {
    level: 1,
    rebirths: 0,
    coins: 0,
    totalCoinsEarned: 0,
    totalImagesRequired: 5,
    imageCounts: { planet: 0, star: 0, solarSystem: 0, galaxy: 0, universe: 0 },
    totalCollected: 0,
    companions: [],           // { rarity }
    companionCounts: { Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0 },
    achievements: [],
    lastTick: Date.now(),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed, {
      imageCounts: Object.assign(defaultState().imageCounts, parsed.imageCounts || {}),
      companionCounts: Object.assign(defaultState().companionCounts, parsed.companionCounts || {}),
    });
  } catch (e) {
    console.error('Failed to load state, starting fresh.', e);
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
}

/* ---------- Derived stats ---------- */
function calculateLuckFactor(state) {
  const rebirthLuck = Math.pow(2, state.rebirths);
  const levelLuck = 1 + 0.01 * (state.level - 1);
  const companionLuck = 1 + state.companions.reduce((sum, c) => {
    const m = COMPANION_RARITIES[c.rarity]?.luckMultiplier || 1;
    return sum + (m - 1) * 0.05;
  }, 0);
  return rebirthLuck * levelLuck * companionLuck;
}

function calculatePassiveIncome(state) {
  return state.companions.reduce((sum, c) => sum + (COMPANION_RARITIES[c.rarity]?.coinRate || 0), 0);
}

function getProbabilityThresholds(level, luckFactor) {
  const scale = (level - 1) / 99;
  return {
    universe:    100    * luckFactor + scale * 900,
    galaxy:      1000   * luckFactor + scale * 9000,
    solarSystem: 10000  * luckFactor + scale * 90000,
    star:        100000 * luckFactor + scale * 400000,
    planet:      500000 * luckFactor,
  };
}

function rollRarity(level, luckFactor) {
  const t = getProbabilityThresholds(level, luckFactor);
  const roll = Math.random() * 1000000;
  if (roll < t.universe) return 'universe';
  if (roll < t.galaxy) return 'galaxy';
  if (roll < t.solarSystem) return 'solarSystem';
  if (roll < t.star) return 'star';
  return 'planet';
}

function rollCompanionRarity() {
  const roll = Math.random() * 100;
  let acc = 0;
  for (const key of [...COMPANION_KEYS].reverse()) {
    acc += COMPANION_RARITIES[key].chance;
    if (roll < acc) return key;
  }
  return 'Common';
}

/* ---------- Number formatting ---------- */
function formatNumber(n) {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
  let u = 0;
  let val = n;
  while (val >= 1000 && u < units.length - 1) {
    val /= 1000;
    u++;
  }
  return val.toFixed(val < 10 ? 2 : val < 100 ? 1 : 0) + units[u];
}

/* ============================================================
   ACHIEVEMENTS
   ============================================================ */
const ACHIEVEMENTS = [
  { id: 'first_collect', label: 'First Contact', desc: 'Collect your first specimen.', check: s => s.totalCollected >= 1 },
  { id: 'first_star', label: 'Stargazer', desc: 'Collect a Star.', check: s => s.imageCounts.star >= 1 },
  { id: 'first_solar', label: 'System Cartographer', desc: 'Collect a Solar System.', check: s => s.imageCounts.solarSystem >= 1 },
  { id: 'first_galaxy', label: 'Galactic Explorer', desc: 'Collect a Galaxy.', check: s => s.imageCounts.galaxy >= 1 },
  { id: 'first_universe', label: 'Beyond Comprehension', desc: 'Collect a Universe.', check: s => s.imageCounts.universe >= 1 },
  { id: 'level_10', label: 'Rising Star', desc: 'Reach Level 10.', check: s => s.level >= 10 },
  { id: 'level_50', label: 'Cosmic Veteran', desc: 'Reach Level 50.', check: s => s.level >= 50 },
  { id: 'level_100', label: 'Ascendant', desc: 'Reach Level 100.', check: s => s.level >= 100 },
  { id: 'first_rebirth', label: 'Reborn', desc: 'Rebirth for the first time.', check: s => s.rebirths >= 1 },
  { id: 'max_rebirth', label: 'Eternal Cycle', desc: 'Reach the maximum 10 rebirths.', check: s => s.rebirths >= 10 },
  { id: 'coins_1000', label: 'Pocket Change', desc: 'Earn 1,000 coins total.', check: s => s.totalCoinsEarned >= 1000 },
  { id: 'coins_100000', label: 'Cosmic Fortune', desc: 'Earn 100,000 coins total.', check: s => s.totalCoinsEarned >= 100000 },
  { id: 'first_companion', label: 'Not Alone', desc: 'Adopt your first alien companion.', check: s => s.companions.length >= 1 },
  { id: 'companions_10', label: 'Crew of Ten', desc: 'Own 10 alien companions.', check: s => s.companions.length >= 10 },
  { id: 'companions_50', label: 'Small Armada', desc: 'Own 50 alien companions.', check: s => s.companions.length >= 50 },
  { id: 'legendary_companion', label: 'Jackpot', desc: 'Adopt a Legendary companion.', check: s => s.companionCounts.Legendary >= 1 },
  { id: 'collected_100', label: 'Century Club', desc: 'Collect 100 specimens total.', check: s => s.totalCollected >= 100 },
  { id: 'collected_1000', label: 'Hoarder of Worlds', desc: 'Collect 1,000 specimens total.', check: s => s.totalCollected >= 1000 },
];

function checkAchievements(state) {
  const unlocked = [];
  for (const a of ACHIEVEMENTS) {
    if (!state.achievements.includes(a.id) && a.check(state)) {
      state.achievements.push(a.id);
      unlocked.push(a);
    }
  }
  return unlocked;
}

/* ============================================================
   SOUND — tiny WebAudio synth, no external files needed
   ============================================================ */
let _actx = null;
function getAudioCtx() {
  if (!_actx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) _actx = new AC();
  }
  return _actx;
}

function isMuted() {
  return localStorage.getItem(MUTE_KEY) === '1';
}
function setMuted(val) {
  localStorage.setItem(MUTE_KEY, val ? '1' : '0');
}

function playTone(freq, duration = 0.12, type = 'sine', delay = 0, gainVal = 0.05) {
  if (isMuted()) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = gainVal;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t0 = ctx.currentTime + delay;
  gain.gain.setValueAtTime(gainVal, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

const CHIMES = {
  click: () => playTone(440, 0.06, 'triangle', 0, 0.04),
  common: () => playTone(520, 0.1, 'sine'),
  levelup: () => { playTone(523, 0.1); playTone(659, 0.1, 'sine', 0.1); playTone(784, 0.18, 'sine', 0.2); },
  rare: () => { playTone(660, 0.1, 'triangle'); playTone(880, 0.16, 'triangle', 0.08); },
  legendary: () => { [523,659,784,1046,1318].forEach((f,i)=>playTone(f,0.2,'triangle',i*0.09,0.05)); },
  purchase: () => { playTone(300, 0.08, 'square', 0, 0.03); playTone(450, 0.1, 'square', 0.06, 0.03); },
  achievement: () => { playTone(700, 0.1, 'sine'); playTone(1050, 0.2, 'sine', 0.1); },
  error: () => playTone(160, 0.2, 'sawtooth', 0, 0.04),
};
function chime(name) { (CHIMES[name] || CHIMES.click)(); }

/* ============================================================
   NOTIFICATIONS (toast stack)
   ============================================================ */
function ensureToastRoot() {
  let root = document.getElementById('toastRoot');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toastRoot';
    root.className = 'toast-root';
    document.body.appendChild(root);
  }
  return root;
}

function showNotification(message, type = 'info', opts = {}) {
  const root = ensureToastRoot();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-msg">${message}</span>`;
  root.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-in'));
  const life = opts.life || 3400;
  setTimeout(() => {
    toast.classList.remove('toast-in');
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, life);
}

function announceAchievements(unlocked) {
  unlocked.forEach((a, i) => {
    setTimeout(() => {
      chime('achievement');
      showNotification(`🏆 Achievement unlocked — <strong>${a.label}</strong><br><span class="toast-sub">${a.desc}</span>`, 'achievement', { life: 4200 });
    }, i * 500);
  });
}

/* ============================================================
   SVG ART GENERATORS — procedural, no external image assets
   ============================================================ */
let _uid = 0;
function uid(prefix) { return `${prefix}${(_uid++).toString(36)}`; }

function svgIconForRarity(key, size = 96) {
  const meta = RARITIES[key];
  const g1 = uid('g'), g2 = uid('g'), f = uid('f');
  const c = meta.color, glow = meta.glow;
  switch (key) {
    case 'planet':
      return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <defs>
          <radialGradient id="${g1}" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="${c}"/><stop offset="100%" stop-color="#0a3d3a"/>
          </radialGradient>
          <filter id="${f}"><feGaussianBlur stdDeviation="3"/></filter>
        </defs>
        <circle cx="50" cy="50" r="30" fill="${glow}" opacity="0.35" filter="url(#${f})"/>
        <circle cx="50" cy="50" r="24" fill="url(#${g1})"/>
        <ellipse cx="50" cy="50" rx="38" ry="8" fill="none" stroke="${c}" stroke-width="2" opacity="0.6" transform="rotate(-15 50 50)"/>
      </svg>`;
    case 'star':
      return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <defs>
          <radialGradient id="${g1}" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stop-color="#fff8e1"/><stop offset="45%" stop-color="${c}"/><stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
          </radialGradient>
          <filter id="${f}"><feGaussianBlur stdDeviation="4"/></filter>
        </defs>
        <circle cx="50" cy="50" r="36" fill="${glow}" opacity="0.4" filter="url(#${f})"/>
        <g stroke="${c}" stroke-width="2" opacity="0.7">
          <line x1="50" y1="6" x2="50" y2="24"/><line x1="50" y1="76" x2="50" y2="94"/>
          <line x1="6" y1="50" x2="24" y2="50"/><line x1="76" y1="50" x2="94" y2="50"/>
        </g>
        <circle cx="50" cy="50" r="20" fill="url(#${g1})"/>
      </svg>`;
    case 'solarSystem':
      return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <defs>
          <radialGradient id="${g1}" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stop-color="#fff3e0"/><stop offset="50%" stop-color="${c}"/><stop offset="100%" stop-color="#7c2d12"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="34" fill="none" stroke="${c}" stroke-width="1" opacity="0.35"/>
        <circle cx="50" cy="50" r="22" fill="none" stroke="${c}" stroke-width="1" opacity="0.5"/>
        <circle cx="50" cy="50" r="10" fill="url(#${g1})"/>
        <circle cx="84" cy="50" r="4" fill="${glow}"/>
        <circle cx="50" cy="72" r="2.5" fill="#93c5fd"/>
        <circle cx="20" cy="38" r="3" fill="#fca5a5"/>
      </svg>`;
    case 'galaxy':
      return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <defs>
          <radialGradient id="${g1}" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stop-color="#fff"/><stop offset="30%" stop-color="${c}"/><stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <g opacity="0.85">
          <path d="M50 50 C 65 40, 80 45, 82 60 C 84 72, 70 78, 58 72" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
          <path d="M50 50 C 35 60, 20 55, 18 40 C 16 28, 30 22, 42 28" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
        </g>
        <circle cx="50" cy="50" r="14" fill="url(#${g1})"/>
      </svg>`;
    case 'universe':
    default:
      return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
        <defs>
          <radialGradient id="${g1}" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="${c}"/><stop offset="100%" stop-color="#4c1d95" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="${glow}" opacity="0.25"/>
        <circle cx="30" cy="35" r="8" fill="${c}" opacity="0.8"/>
        <circle cx="70" cy="65" r="10" fill="#a78bfa" opacity="0.8"/>
        <circle cx="65" cy="28" r="5" fill="#fbcfe8"/>
        <circle cx="50" cy="50" r="16" fill="url(#${g1})"/>
        <g fill="#ffffff">
          <circle cx="22" cy="70" r="1.4"/><circle cx="80" cy="42" r="1.4"/><circle cx="55" cy="82" r="1.2"/><circle cx="14" cy="45" r="1.2"/>
        </g>
      </svg>`;
  }
}

function svgIconForCompanion(rarityKey, size = 96) {
  const meta = COMPANION_RARITIES[rarityKey];
  const c = meta.color, glow = meta.glow;
  const g1 = uid('cg'), f = uid('cf');
  const eyeGlow = rarityKey === 'Legendary' || rarityKey === 'Epic';
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
    <defs>
      <radialGradient id="${g1}" cx="40%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="30%" stop-color="${c}"/><stop offset="100%" stop-color="${c}"/>
      </radialGradient>
      <filter id="${f}"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <ellipse cx="50" cy="55" rx="30" ry="26" fill="${glow}" opacity="0.3" filter="url(#${f})"/>
    <path d="M50 20 C 30 20, 20 40, 24 58 C 27 74, 40 84, 50 84 C 60 84, 73 74, 76 58 C 80 40, 70 20, 50 20 Z" fill="url(#${g1})"/>
    <ellipse cx="38" cy="50" rx="7" ry="9" fill="#0a0e1a"/>
    <ellipse cx="62" cy="50" rx="7" ry="9" fill="#0a0e1a"/>
    ${eyeGlow ? `<circle cx="38" cy="50" r="2.6" fill="${glow}"/><circle cx="62" cy="50" r="2.6" fill="${glow}"/>` : `<circle cx="38" cy="50" r="2.2" fill="#fff"/><circle cx="62" cy="50" r="2.2" fill="#fff"/>`}
    <path d="M40 66 Q50 74 60 66" stroke="#0a0e1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M50 20 C 46 10, 40 6, 34 8" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M50 20 C 54 10, 60 6, 66 8" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="34" cy="8" r="3" fill="${glow}"/><circle cx="66" cy="8" r="3" fill="${glow}"/>
  </svg>`;
}

/* ============================================================
   STARFIELD BACKGROUND — canvas twinkling stars + drifting nebula
   ============================================================ */
function initStarfield(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    const count = Math.floor((w * h) / 3800);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
    }));
  }
  window.addEventListener('resize', resize);
  resize();

  let t = 0;
  function frame() {
    t += 0.016;
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
      ctx.globalAlpha = 0.25 + tw * 0.75;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  frame();
}

/* ---------- Particle burst (click feedback) ---------- */
function burstParticles(originEl, color = '#8b5cf6', count = 14) {
  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.background = color;
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const dist = 40 + Math.random() * 60;
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    p.style.left = `${cx}px`;
    p.style.top = `${cy}px`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}

/* ---------- Nav / mute button injection (shared header) ---------- */
function buildNav(active) {
  const links = [
    { href: 'index.html', label: 'Collector' },
    { href: 'shop.html', label: 'Shop' },
    { href: 'collection.html', label: 'Collection' },
    { href: 'achievements.html', label: 'Achievements' },
  ];
  const nav = document.createElement('nav');
  nav.className = 'nav-bar';
  nav.innerHTML = `
    <div class="nav-brand">✦ NOVA DRIFT</div>
    <div class="nav-links">
      ${links.map(l => `<a href="${l.href}" class="nav-link${l.href === active ? ' active' : ''}">${l.label}</a>`).join('')}
    </div>
    <button id="muteToggle" class="mute-btn" title="Toggle sound" aria-label="Toggle sound"></button>
  `;
  document.body.prepend(nav);
  const muteBtn = document.getElementById('muteToggle');
  function refreshMuteIcon() { muteBtn.textContent = isMuted() ? '🔇' : '🔊'; }
  refreshMuteIcon();
  muteBtn.addEventListener('click', () => {
    setMuted(!isMuted());
    refreshMuteIcon();
    if (!isMuted()) chime('click');
  });
}

/* ---------- Coin display helper (top-right HUD reused everywhere) ---------- */
function renderHud(state) {
  let hud = document.getElementById('globalHud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'globalHud';
    hud.className = 'global-hud';
    document.body.appendChild(hud);
  }
  hud.innerHTML = `
    <div class="hud-item"><span class="hud-icon">🪙</span><span>${formatNumber(state.coins)}</span></div>
    <div class="hud-item"><span class="hud-icon">🍀</span><span>x${calculateLuckFactor(state).toFixed(2)}</span></div>
  `;
}
