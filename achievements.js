/* Nova Drift — Achievements page logic */

document.addEventListener('DOMContentLoaded', () => {
  buildNav('achievements.html');
  initStarfield('starfield');
  const state = loadState();
  renderHud(state);
  renderAchievements(state);
});

function renderAchievements(state) {
  const grid = document.getElementById('achGrid');
  grid.innerHTML = '';
  const unlockedCount = state.achievements.length;
  document.getElementById('achSummary').textContent = `${unlockedCount} / ${ACHIEVEMENTS.length} unlocked`;

  ACHIEVEMENTS.forEach(a => {
    const isUnlocked = state.achievements.includes(a.id);
    const card = document.createElement('div');
    card.className = 'card ach-card' + (isUnlocked ? ' unlocked' : '');
    card.innerHTML = `
      <div class="ach-icon">${isUnlocked ? '🏆' : '🔒'}</div>
      <div>
        <div class="ach-title">${a.label}</div>
        <div class="ach-desc">${a.desc}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}
