/* Nova Drift — Collector page logic */

let state = loadState();

document.addEventListener('DOMContentLoaded', () => {
  buildNav('index.html');
  initStarfield('starfield');
  applyOfflineProgress();
  updateDisplay();
  startPassiveIncomeLoop();
});

function attemptCollect() {
  const rarity = rollRarity(state.level, calculateLuckFactor(state));
  state.imageCounts[rarity] = (state.imageCounts[rarity] || 0) + 1;
  state.totalCollected += 1;
  const coinsGained = 5;
  state.coins += coinsGained;
  state.totalCoinsEarned += coinsGained;

  const orb = document.getElementById('bigBang');
  burstParticles(orb, RARITIES[rarity].glow, rarity === 'universe' ? 26 : rarity === 'galaxy' ? 20 : 14);
  chime(rarity === 'universe' || rarity === 'galaxy' ? 'legendary' : rarity === 'solarSystem' || rarity === 'star' ? 'rare' : 'common');

  const collectedSoFar = RARITY_KEYS.reduce((sum, k) => sum + state.imageCounts[k], 0);
  if (collectedSoFar >= state.totalImagesRequired) {
    if (state.level < 100) {
      state.level++;
      state.totalImagesRequired += 5 * state.level;
      chime('levelup');
      showNotification(`⭐ Level up! You reached <strong>Level ${state.level}</strong>. Luck is now x${calculateLuckFactor(state).toFixed(2)}.`, 'success');
    }
  }

  showLatestPull(rarity);
  const unlocked = checkAchievements(state);
  updateDisplay();
  saveState(state);
  if (unlocked.length) announceAchievements(unlocked);
}

function showLatestPull(rarity) {
  const wrap = document.getElementById('collectedImages');
  wrap.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'pull-card';
  card.innerHTML = `
    <div class="icon-wrap">${svgIconForRarity(rarity, 72)}</div>
    <div class="rarity-name" style="color:${RARITIES[rarity].color}">${RARITIES[rarity].label}</div>
  `;
  wrap.appendChild(card);
}

function confirmRebirth() {
  if (state.rebirths >= 10) {
    showNotification('Maximum number of rebirths reached.', 'error');
    hideRebirthConfirmation();
    return;
  }
  state.rebirths++;
  state.level = 1;
  state.coins = 0;
  state.imageCounts = { planet: 0, star: 0, solarSystem: 0, galaxy: 0, universe: 0 };
  state.totalImagesRequired = 5;
  chime('legendary');
  showNotification(`✨ You've been reborn. Luck permanently increased — rebirth x${state.rebirths}.`, 'success');
  hideRebirthConfirmation();
  const unlocked = checkAchievements(state);
  updateDisplay();
  saveState(state);
  if (unlocked.length) announceAchievements(unlocked);
}

function showRebirthConfirmation() { document.getElementById('rebirthModal').classList.add('open'); }
function hideRebirthConfirmation() { document.getElementById('rebirthModal').classList.remove('open'); }

function updateDisplay() {
  document.getElementById('level').textContent = state.level;
  document.getElementById('rebirths').textContent = state.rebirths;
  document.getElementById('coins').textContent = formatNumber(state.coins);
  document.getElementById('luck').textContent = 'x' + calculateLuckFactor(state).toFixed(2);

  const rebirthButton = document.getElementById('rebirthButton');
  rebirthButton.style.display = state.level >= 100 ? 'inline-flex' : 'none';

  const collectedSoFar = RARITY_KEYS.reduce((sum, k) => sum + state.imageCounts[k], 0);
  const pct = Math.min(100, (collectedSoFar / state.totalImagesRequired) * 100);
  document.getElementById('levelProgressFill').style.width = pct + '%';
  document.getElementById('levelProgressLabel').textContent =
    state.level >= 100 ? 'Max level reached' : `${collectedSoFar} / ${state.totalImagesRequired} to next level`;

  renderHud(state);
}

/* ---------- Passive income from alien companions ---------- */
function startPassiveIncomeLoop() {
  setInterval(() => {
    const rate = calculatePassiveIncome(state);
    if (rate > 0) {
      state.coins += rate;
      state.totalCoinsEarned += rate;
      document.getElementById('coins').textContent = formatNumber(state.coins);
      renderHud(state);
    }
    state.lastTick = Date.now();
  }, 1000);
  setInterval(() => saveState(state), 4000);
}

function applyOfflineProgress() {
  const rate = calculatePassiveIncome(state);
  if (!state.lastTick || rate <= 0) { state.lastTick = Date.now(); return; }
  const elapsedSec = Math.min(3600 * 6, Math.max(0, (Date.now() - state.lastTick) / 1000));
  if (elapsedSec > 10) {
    const gained = Math.floor(rate * elapsedSec);
    if (gained > 0) {
      state.coins += gained;
      state.totalCoinsEarned += gained;
      showNotification(`Your companions gathered <strong>${formatNumber(gained)}</strong> coins while you were away.`, 'success');
    }
  }
  state.lastTick = Date.now();
  saveState(state);
}
