const imagesByRarity = {
    planet: [],
    star: [],
    solarSystem: [],
    galaxy: [],
    universe: []
};

let player = {
    level: 1,
    rebirths: 0,
    coins: 0,
    collectedImages: [],
    levelThreshold: 5,
    nextLevelThreshold: 5
};

function initializeGame() {
    updateDisplay();
}

function randomImage() {
    // Calculate probability thresholds based on the player's current level
    let thresholds = getProbabilityThresholds(player.level);
    let roll = Math.random() * 1000000; // Adjust range based on the most rare chance

    if (roll < thresholds.universe) return 'universe';
    if (roll < thresholds.galaxy) return 'galaxy';
    if (roll < thresholds.solarSystem) return 'solarSystem';
    if (roll < thresholds.star) return 'star';
    return 'planet'; // Default return if none of the above conditions are met
}

function getProbabilityThresholds(level) {
    // Scale probabilities between level 1 and level 100
    let scale = (level - 1) / 99; // Normalize scale between 0 and 1
    return {
        planet: 1000000 * (1/100 + (1/2 - 1/100) * (1 - scale)), // Scale from 1/2 to 1/100
        star: 1000000 * (1/20 + (1/100 - 1/20) * (1 - scale)), // Scale from 1/100 to 1/20
        solarSystem: 1000000 * (1/50 + (1/1000 - 1/50) * (1 - scale)), // Scale from 1/1000 to 1/50
        galaxy: 1000000 * (1/500 + (1/10000 - 1/500) * (1 - scale)), // Scale from 1/10000 to 1/500
        universe: 1000000 * (1/2500 + (1/1000000 - 1/2500) * (1 - scale)) // Scale from 1/1000000 to 1/2500
    };
}

function attemptCollect() {
    if (player.collectedImages.length >= player.nextLevelThreshold) {
        player.level++;
        player.levelThreshold = player.nextLevelThreshold;
        player.nextLevelThreshold += 5; // Increase threshold for the next level
    }
    const imageRarity = randomImage();
    player.collectedImages.push(imageRarity);
    imagesByRarity[imageRarity].push(imageRarity); // Store image by rarity
    player.coins += 5;
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('level').textContent = player.level;
    document.getElementById('coins').textContent = player.coins;
    document.getElementById('rebirths').textContent = player.rebirths;
}

document.addEventListener('DOMContentLoaded', initializeGame);
