/* Nova Drift — Collection page logic */

document.addEventListener('DOMContentLoaded', () => {
  buildNav('collection.html');
  initStarfield('starfield');
  const state = loadState();
  renderHud(state);
  displayCollection(state);
});

function displayCollection(state) {
  const container = document.getElementById('imagesContainer');
  container.innerHTML = '';

  const totalCollected = state.totalCollected || 0;
  if (totalCollected === 0) {
    container.innerHTML = `<div class="empty-state">Nothing collected yet. Head to the <a href="index.html" style="color:var(--nebula-soft)">Collector</a> and tap the singularity to begin.</div>`;
    return;
  }

  RARITY_KEYS.forEach(key => {
    const count = state.imageCounts[key] || 0;
    const meta = RARITIES[key];

    const section = document.createElement('div');
    section.className = 'rarity-section';

    const head = document.createElement('div');
    head.className = 'rarity-section-head';
    head.innerHTML = `<h2 style="color:${meta.color}">${meta.label}</h2><span class="count-badge">${count} collected</span>`;
    section.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'images';

    if (count > 0) {
      const card = document.createElement('div');
      card.className = 'card spec-card';
      card.style.borderColor = meta.color + '55';
      card.innerHTML = `
        <div class="icon-wrap">${svgIconForRarity(key, 56)}</div>
        <div class="spec-label">${meta.label}</div>
        <div class="spec-count">×${count}</div>
      `;
      grid.appendChild(card);
    } else {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1; padding:20px;">Not yet discovered</div>`;
    }

    section.appendChild(grid);
    container.appendChild(section);
  });
}
