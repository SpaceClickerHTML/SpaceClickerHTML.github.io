document.addEventListener('DOMContentLoaded', () => {
    player = loadPlayerState();  // Initialize the player from saved state or set default
    updateInventoryDisplay();
    updateDisplay(); // Ensure the display is updated when the document loads
});

function loadPlayerState() {
    const savedState = localStorage.getItem('playerState');
    const defaultState = { coins: 1000, alienCompanions: [] };
    const loadedState = savedState ? JSON.parse(savedState) : defaultState;
    
    // Ensure alienCompanions is an array
    if (!Array.isArray(loadedState.alienCompanions)) {
        loadedState.alienCompanions = [];
    }
    
    return loadedState;
}

const imagesByCompanionRarity = {
    Common: ['images/companions/common/alien.jpg'],
    Uncommon: ['images/companions/uncommon/alien.jpg'],
    Rare: ['images/companions/rare/alien.jpg'],
    Epic: ['images/companions/epic/alien.jpg'],
    Legendary: ['images/companions/legendary/alien.jpg']
};

function buyEggs(quantity) {
    const cost = quantity * 100;
    if (player.coins >= cost) {
        player.coins -= cost;
        let newCompanions = [];
        for (let i = 0; i < quantity; i++) {
            const newCompanion = addCompanionToInventory();
            if (newCompanion) {
                newCompanions.push(newCompanion); // Only push valid companions
            } else {
                console.error("Failed to add new companion.");
            }
        }
        displayNewCompanions(newCompanions);
        updateDisplay();
        updateInventoryDisplay();
        showNotification(`Successfully purchased ${quantity} egg(s)!`, 'success');
        savePlayerState(); // Save the updated state
    } else {
        showNotification('Not enough coins!', 'error');
    }
}

function displayNewCompanions(companions) {
    const displayArea = document.getElementById('newCompanionsDisplay');
    displayArea.innerHTML = ''; // Clear previous display
    companions.forEach(comp => {
        if (comp && comp.image) { // Check if companion is valid
            const imgElement = document.createElement('img');
            imgElement.src = comp.image;
            imgElement.alt = comp.rarity;
            imgElement.className = 'companion-image';
            displayArea.appendChild(imgElement);
        } else {
            console.error("Invalid companion:", comp);
        }
    });

    // Optionally, set a timeout to clear this display after a while or move to inventory
    setTimeout(() => {
        displayArea.innerHTML = ''; // Clear the display after showing new companions
    }, 5000); // Adjust time as needed
}

function addCompanionToInventory() {
    const rarity = determineRarity();
    const imageChoices = imagesByCompanionRarity[rarity];
    if (!imageChoices) {
        console.error("No images found for rarity:", rarity);
        return null; // Return null if no images available for the determined rarity
    }
    const imageIndex = Math.floor(Math.random() * imageChoices.length);
    const selectedImage = imageChoices[imageIndex];

    const newCompanion = {
        rarity: rarity,
        image: selectedImage,
        luckMultiplier: getLuckMultiplierForRarity(rarity)
    };

    if (!player.alienCompanions) {
        player.alienCompanions = []; // Initialize the array if it doesn't exist
    }

    player.alienCompanions.push(newCompanion);
    return newCompanion; // Return the new companion for display
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
    if (player.alienCompanions && player.alienCompanions.length > 0) {
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
    } else {
        console.log("No companions to display.");
    }
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
    const coinsDisplay = document.getElementById('coins');
    if (coinsDisplay) {
        coinsDisplay.textContent = player.coins;
    } else {
        console.error("Element with id 'coins' not found.");
    }
}

function savePlayerState() {
    localStorage.setItem('playerState', JSON.stringify(player));
}