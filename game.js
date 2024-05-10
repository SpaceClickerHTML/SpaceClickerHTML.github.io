document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
});

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
    luckFactor: 1
};

function attemptCollect() {
    if (player.collectedImages.length >= player.levelThreshold && player.level < 100) {
        player.level++;
        player.levelThreshold += 5; // Increase threshold by 5
    }
    const imageRarity = randomImage();
    player.collectedImages.push(imageRarity);
    player.coins += 5;
    updateDisplay();
}

function randomImage() {
    // Calculate probabilities with luck modification
    let thresholds = getProbabilityThresholds(player.level, player.luckFactor);
    let roll = Math.random() * 1000000; // Adjust range based on the most rare chance

    if (roll < thresholds.universe) return 'universe';
    if (roll < thresholds.galaxy) return 'galaxy';
    if (roll < thresholds.solarSystem) return 'solarSystem';
    if (roll < thresholds.star) return 'star';
    return 'planet';
}

function updateDisplay() {
    document.getElementById('level').textContent = player.level;
    document.getElementById('coins').textContent = player.coins;
    document.getElementById('rebirths').textContent = player.rebirths;
}

function showRebirthConfirmation() {
    document.getElementById('rebirthModal').style.display = 'block';
}

function hideRebirthConfirmation() {
    document.getElementById('rebirthModal').style.display = 'none';
}

function confirmRebirth() {
    player.rebirths++;
    player.level = 1;
    player.coins = 0;
    player.collectedImages = [];
    player.levelThreshold = 5;
    player.luckFactor *= 2;
    hideRebirthConfirmation();
    updateDisplay();
}

function getProbabilityThresholds(level, luckFactor) {
    // Example probability calculation adjusted for luck and level
    let scale = (level - 1) / 99; // Normalize scale between 0 and 1
    return {
        planet: 500000 * luckFactor,
        star: 100000 * luckFactor,
        solarSystem: 10000 * luckFactor,
        galaxy: 1000 * luckFactor,
        universe: 100 * luckFactor
    };
}
