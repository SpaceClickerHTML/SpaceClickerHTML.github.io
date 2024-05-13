let player = loadPlayerState();  // Initialize the player from saved state or set default

const imagesByCompanionRarity = {
    common: ['images/companions/common/alien.jpg'],
    uncommon: ['images/companions/uncommon/alien.jpg'],
    rare: ['images/companions/rare/alien.jpg'],
    epic: ['images/companions/epic/alien.jpg'],
    legendary: ['images/companions/legendary/alien.jpg']
};

document.addEventListener('DOMContentLoaded', () => {
    updateInventoryDisplay();
    updateDisplay(); // Ensure the display is updated when the document loads
});

function loadPlayerState() {
    const savedState = localStorage.getItem('playerState');
    return savedState ? JSON.parse(savedState) : { coins: 1000, alienCompanions: [] };
}

function buyEggs(quantity) {
    const cost = quantity * 100; // Each egg costs 100 coins
    if (player.coins >= cost) {
        player.coins -= cost;
        for (let i = 0; i < quantity; i++) {
            addCompanionToInventory();
        }
        updateDisplay(); // Update coins and other player info
        updateInventoryDisplay();
        showNotification(`Successfully purchased ${quantity} egg(s)!`, 'success');
    } else {
        showNotification('Not enough coins!', 'error');
    }
}

function addCompanionToInventory() {
    const rarity = determineRarity();
    const imageChoices = imagesByCompanionRarity[rarity];
    if (!imageChoices) {
        console.error("No images found for rarity:", rarity);
        return; // Exit the function if no images available for the determined rarity
    }
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateDisplay() {
    // Ensure this function updates relevant parts of your HTML to reflect the current state
    document.getElementById('coins').textContent = player.coins;
}
