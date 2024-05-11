document.addEventListener('DOMContentLoaded', function() {
    loadGameState();
    updateDisplay();
});

const imagesByRarity = {
    planet: ['images/planet/earth.png'],
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
    luckFactor: 1 // Initialize luck factor
};


function attemptCollect() {
    const imageRarity = randomImage();
    player.collectedImages.push(imageRarity);
    player.coins += 5;

    if (player.collectedImages.length >= player.totalImagesRequired) {
        if (player.level < 100) {
            player.level++;
            player.totalImagesRequired += 5 * player.level;
            let luckMessage = `Congratulations! You've leveled up to Level ${player.level}. Your luck has increased to x${calculateLuckFactor()}!`;
            showNotification(luckMessage);
        }
    }

    updateDisplay();
    saveGameState();
}

function confirmRebirth() {
    if (player.rebirths < 10) {
        player.rebirths++;
        player.level = 1;
        player.coins = 0;
        player.collectedImages = [];
        player.totalImagesRequired = 5;
        player.luckFactor = Math.pow(2, player.rebirths); // Update luck factor
        updateDisplay();
        saveGameState();
        showNotification(`Congratulations! You've rebirthed. Your luck has increased to x${player.luckFactor}!`);
    } else {
        alert("Maximum number of rebirths reached.");
        hideRebirthConfirmation();
    }
}

function calculateLuckFactor() {
    return Math.pow(2, player.rebirths) * (1 + 0.01 * (player.level - 1));
}



function randomImage() {
    let thresholds = getProbabilityThresholds(player.level, player.luckFactor);
    let roll = Math.random() * 1000000;  // Random number from 0 to 999999

    if (roll < thresholds.universe) return 'universe';
    if (roll < thresholds.galaxy) return 'galaxy';
    if (roll < thresholds.solarSystem) return 'solarSystem';
    if (roll < thresholds.star) return 'star';
    return 'planet';  // Most common, highest threshold
}



function updateDisplay() {
    document.getElementById('level').textContent = player.level;
    document.getElementById('coins').textContent = player.coins;
    document.getElementById('rebirths').textContent = player.rebirths;

    // Hide or show rebirth button
    const rebirthButton = document.getElementById('rebirthButton');
    rebirthButton.style.display = player.level >= 100 ? 'block' : 'none';

    // Display the latest collected image only
    const imagesContainer = document.getElementById('collectedImages');
    if (player.collectedImages.length > 0) {
        const latestImageRarity = player.collectedImages[player.collectedImages.length - 1];
        imagesContainer.innerHTML = ''; // Clear previous image
        let imgElement = document.createElement('img');
        imgElement.src = imagesByRarity[latestImageRarity][0];
        imgElement.alt = latestImageRarity;
        imgElement.className = 'collected-image';
        imagesContainer.appendChild(imgElement);
    }
}



function showRebirthConfirmation() {
    // Display the modal that asks for rebirth confirmation
    document.getElementById('rebirthModal').style.display = 'block';
}

function hideRebirthConfirmation() {
    // Hide the rebirth confirmation modal
    document.getElementById('rebirthModal').style.display = 'none';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
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

function getProbabilityThresholds(level, luckFactor) {
    // Normalize scale based on the level, 0 at level 1 and approaching 1 at level 100
    let scale = (level - 1) / 99;

    // Adjust probabilities. These numbers are examples and should be balanced based on gameplay testing.
    return {
        planet: 500000 * luckFactor, // Most common
        star: 100000 * luckFactor + scale * 400000, // Becomes less rare
        solarSystem: 10000 * luckFactor + scale * 90000, // Becomes less rare
        galaxy: 1000 * luckFactor + scale * 9000, // Becomes less rare
        universe: 100 * luckFactor + scale * 900 // Becomes less rare
    };
}

