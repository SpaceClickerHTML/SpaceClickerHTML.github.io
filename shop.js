/* Nova Drift — Shop page logic */

let state = loadState();

document.addEventListener('DOMContentLoaded', () => {
  buildNav('shop.html');
  initStarfield('starfield');
  document.getElementById('eggVisual').innerHTML = eggSvg();
  updateDisplay();
  updateInventoryDisplay();
});

function eggSvg() {
  return `<svg viewBox="0 0 100 120" width="100%" height="100%">
    <defs>
      <radialGradient id="eggGrad" cx="40%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#fff"/><stop offset="45%" stop-color="#c4b5fd"/><stop offset="100%" stop-color="#6d28d9"/>
      </radialGradient>
    </defs>
    <ellipse cx="50" cy="65" rx="34" ry="45" fill="url(#eggGrad)"/>
    <ellipse cx="38" cy="45" rx="8" ry="12" fill="#fff" opacity="0.35"/>
    <path d="M35 40 L45 55 L38 55 L48 75" stroke="#4c1d95" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>
  </svg>`;
}

function buyEggs(quantity) {
  const cost = quantity * 100;
  if (state.coins < cost) {
    chime('error');
    showNotification('Not enough coins!', 'error');
    return;
  }
  state.coins -= cost;
  const newCompanions = [];
  for (let i = 0; i < quantity; i++) {
    const rarity = rollCompanionRarity();
    const companion = { rarity };
    state.companions.push(companion);
    state.companionCounts[rarity] = (state.companionCounts[rarity] || 0) + 1;
    newCompanions.push(companion);
  }

  const best = newCompanions.reduce((a, b) => COMPANION_RARITIES[b.rarity].order > COMPANION_RARITIES[a.rarity].order ? b : a);
  chime(COMPANION_RARITIES[best.rarity].order >= 3 ? 'legendary' : 'purchase');

  displayNewCompanions(newCompanions);
  const unlocked = checkAchievements(state);
  updateDisplay();
  updateInventoryDisplay();
  showNotification(`Hatched ${quantity} egg${quantity > 1 ? 's' : ''}!`, 'success');
  saveState(state);
  if (unlocked.length) announceAchievements(unlocked);
}

function displayNewCompanions(companions) {
  const area = document.getElementById('newCompanionsDisplay');
  area.innerHTML = '';
  companions.forEach(c => {
    const el = document.createElement('div');
    el.className = 'new-companion-pop';
    el.title = c.rarity;
    el.innerHTML = svgIconForCompanion(c.rarity, 64);
    area.appendChild(el);
  });
  setTimeout(() => { area.innerHTML = ''; }, 5000);
}

function updateInventoryDisplay() {
  const inventory = document.getElementById('inventory');
  inventory.innerHTML = '';
  if (!state.companions.length) {
    inventory.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No companions yet — hatch an egg above to adopt your first one.</div>`;
    document.getElementById('luckTotal').textContent = '';
    return;
  }
  const sorted = [...state.companions].sort((a, b) => COMPANION_RARITIES[b.rarity].order - COMPANION_RARITIES[a.rarity].order);
  sorted.forEach(c => {
    const meta = COMPANION_RARITIES[c.rarity];
    const div = document.createElement('div');
    div.className = 'card companion-entry';
    div.style.borderColor = meta.color + '55';
    div.innerHTML = `
      <div class="icon-wrap">${svgIconForCompanion(c.rarity, 56)}</div>
      <div class="companion-info">
        <div class="rname" style="color:${meta.color}">${c.rarity}</div>
        <div class="rluck">Luck x${meta.luckMultiplier} · ${meta.coinRate}🪙/s</div>
      </div>
    `;
    inventory.appendChild(div);
  });

  const totalRate = calculatePassiveIncome(state);
  document.getElementById('luckTotal').textContent =
    `${state.companions.length} companions · +${totalRate.toFixed(1)} coins/sec`;
}

function updateDisplay() {
  document.getElementById('coins').textContent = formatNumber(state.coins);
  renderHud(state);
}
