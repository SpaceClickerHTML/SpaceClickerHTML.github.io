document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    updateDisplay();
});

const imagesByRarity = {
    planet: ['images/planet/Earth.png'],
    star: ['images/star/sun.png'],
    solarSystem: ['images/solarsystem/solarsystem.png'],
    galaxy: ['images/galaxy/milkyway.png'],
    universe: ['images/universe/universe.png']
};

let player = {
    level: 1,
    rebirths: 0,
    coins: 0,
    collectedImages: [],
    totalImagesRequired: 5, // Initial images required to reach level 2
    luckFactor: 1 // Initial luck factor
};

function attemptCollect() {
    const imageRarity = randomImage();
    player.collectedImages.push(imageRarity);
    player.coins += 5;
    
    // Check if the number of collected images meets the threshold to level up
    if (player.collectedImages.length >= player.totalImagesRequired) {
        if (player.level < 100) {
            player.level++;
            player.totalImagesRequired += 5 * player.level; // Increment the image requirement for the next level
        }
    }

    updateDisplay();
    saveGameState();
}

function randomImage() {
    let thresholds = getProbabilityThresholds(player.level, player.luckFactor);
    let roll = Math.random() * 1000000;  // Random number from 0 to 999999
    return Object.keys(imagesByRarity).find(rarity => roll < thresholds[rarity]) || 'planet';
}

function updateDisplay() {
    document.getElementById('level').textContent = player.level;
    document.getElementById('coins').textContent = player.coins;
    document.getElementById('rebirths').textContent = player.rebirths;
    
    const imagesContainer = document.getElementById('collectedImages');
    imagesContainer.innerHTML = ''; // Clear previous images
    if (player.collectedImages.length > 0) {
        let imgElement = document.createElement('img');
        imgElement.src = imagesByRarity[player.collectedImages[player.collectedImages.length - 1]][0];
        imgElement.alt = player.collectedImages[player.collectedImages.length - 1];
        imgElement.className = 'collected-image';
        imagesContainer.appendChild(imgElement);
    }
}

function getProbabilityThresholds(level, luckFactor) {
    // Calculate luck adjustment based on levels and rebirths
    luckFactor = Math.pow(2, player.rebirths) * (1 + 0.01 * (level - 1));
    return {
        planet: 500000 / luckFactor,
        star: 100000 / luckFactor,
        solarSystem: 10000 / luckFactor,
        galaxy: 1000 / luckFactor,
        universe: 100 / luckFactor
    };
}

function saveGameState() {
    localStorage.setItem('playerState', JSON.stringify(player));
}

function loadGameState() {
    const savedState = localStorage.getItem('playerState');
    if (savedState) {
        player = JSON.parse(savedState);
        player.luckFactor = 1; // Reset luck factor, calculate in probability function
    }
}
