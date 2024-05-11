document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    updateDisplay();
});

const imagesByRarity = {
    planet: ['Earth.png'],
    star: ['sun.png'],
    solarSystem: ['solarsystem.png'],
    galaxy: ['milkyway.png'],
    universe: ['universe.png']
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
    if (player.collectedImages.length >= player.levelThreshold) {
        if (player.level < 100) {
            player.level++;
        }
        player.levelThreshold += 5; // Increase threshold by 5
    }
    const imageRarity = randomImage();
    player.collectedImages.push(imageRarity);
    player.coins += 5;
    updateDisplay();
    saveGameState();
}

function randomImage() {
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

    // Disable the rebirth button if the maximum rebirths have been reached
    const rebirthButton = document.querySelector('button[onclick="showRebirthConfirmation()"]');
    rebirthButton.disabled = player.rebirths >= 10;
}

function showRebirthConfirmation() {
    if (player.rebirths < 10) {
        document.getElementById('rebirthModal').style.display = 'block';
    } else {
        alert("Maximum rebirth level reached. No more rebirths are allowed.");
    }
}

function hideRebirthConfirmation() {
    document.getElementById('rebirthModal').style.display = 'none';
}

function confirmRebirth() {
    if (player.rebirths < 10) {
        player.rebirths++;
        player.level = 1;
        player.coins = 0;
        player.collectedImages = [];
        player.levelThreshold = 5;
        player.luckFactor *= 2;
        hideRebirthConfirmation();
        updateDisplay();
        saveGameState();
    }
}

function getProbabilityThresholds(level, luckFactor) {
    let scale = (level - 1) / 99; // Normalize scale between 0 and 1
    return {
        planet: 500000 * luckFactor,
        star: 100000 * luckFactor,
        solarSystem: 10000 * luckFactor,
        galaxy: 1000 * luckFactor,
        universe: 100 * luckFactor
    };
}

function saveGameState() {
    localStorage.setItem('playerState', JSON.stringify(player));
}

function loadGameState() {
    const savedState = localStorage.getItem('playerState');
    if (savedState) {
        player = JSON.parse(savedState);
    }
}
