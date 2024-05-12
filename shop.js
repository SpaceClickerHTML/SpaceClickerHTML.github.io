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
    const imageChoices = imagesByCompanionRarity[rarity];
    const imageIndex = Math.floor(Math.random() * imageChoices.length);
    const selectedImage = imageChoices[imageIndex];

    const newCompanion = {
        rarity: rarity,
        image: selectedImage,
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
        companionDiv.className = 'companion-entry';

        const imgElement = document.createElement('img');
        imgElement.src = comp.image;
        imgElement.alt = comp.rarity;
        imgElement.className = 'companion-image';

        const textDiv = document.createElement('div');
        textDiv.textContent = `${comp.rarity} - Luck: x${comp.luckMultiplier}`;
        textDiv.className = 'companion-info';

        companionDiv.appendChild(imgElement);
        companionDiv.appendChild(textDiv);
        inventory.appendChild(companionDiv);
    });
}


const imagesByCompanionRarity = {
    common: ['images/companions/common/alien1.png', 'images/companions/common/alien2.png'],
    uncommon: ['images/companions/uncommon/alien1.png', 'images/companions/uncommon/alien2.png'],
    rare: ['images/companions/rare/alien1.png', 'images/companions/rare/alien2.png'],
    epic: ['images/companions/epic/alien1.png', 'images/companions/epic/alien2.png'],
    legendary: ['images/companions/legendary/alien1.png', 'images/companions/legendary/alien2.png']
};
