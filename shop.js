document.addEventListener('DOMContentLoaded', () => {
    updateInventoryDisplay();
});

function buyEggs(quantity) {
    const cost = quantity * 100; // Each egg costs 100 coins
    if (player.coins >= cost) {
        player.coins -= cost;
        for (let i = 0; i < quantity; i++) {
            addCompanionToInventory();
        }
        updateDisplay(); // Update coins and other player info
        updateInventoryDisplay();
    } else {
        alert('Not enough coins!');
    }
}

function addCompanionToInventory() {
    const rarity = determineRarity();
    const newCompanion = {
        rarity: rarity,
        luckMultiplier: getLuckMultiplierForRarity(rarity)
    };
    player.alienCompanions.push(newCompanion);
}

function determineRarity() {
    const roll = Math.random() * 100;
    if (roll < 0.5) return 'Legendary';
    if (roll < 3) return 'Epic';
    if (roll < 10) return 'Rare';
    if (roll < 40) return 'Uncommon';
    return 'Common';
}

function getLuckMultiplierForRarity(rarity) {
    switch (rarity) {
        case 'Legendary': return 50;
        case 'Epic': return 5;
        case 'Rare': return 2.5;
        case 'Uncommon': return 2;
        default: return 1.5;
    }
}

function updateInventoryDisplay() {
    const inventory = document.getElementById('inventory');
    inventory.innerHTML = '<h2>Your Companions</h2>'; // Clear previous content
    player.alienCompanions.forEach(comp => {
        const companionDiv = document.createElement('div');
        companionDiv.textContent = `${comp.rarity} - Luck: x${comp.luckMultiplier}`;
        inventory.appendChild(companionDiv);
    });
}
