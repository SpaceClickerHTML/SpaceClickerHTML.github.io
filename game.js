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
    totalImagesRequired: 5 // Initial images required to reach level 2
};

function attemptCollect() {
    // Collect an image and gain coins
    const imageRarity = randomImage();
    player.collectedImages.push(imageRarity);
    player.coins += 5;
    
    // Check if the number of collected images meets the threshold to level up
    if (player.collectedImages.length >= player.totalImagesRequired) {
        if (player.level < 100) {
            player.level++;
            player.totalImagesRequired = player.level * 5; // Set new threshold for the next level
        }
    }

    updateDisplay();
    saveGameState();
}

function randomImage() {
    let thresholds = getProbabilityThresholds(player.level, player.luckFactor);
    let roll = Math.random() * 1000000; // Adjust range based on the most rare chance
    return Object.keys(imagesByRarity).find(rarity => roll < thresholds[rarity]) || 'planet';
}

function updateDisplay() {
    document.getElementById('level').textContent = player.level;
    document.getElementById('coins').textContent = player.coins;
    document.getElementById('rebirths').textContent = player.rebirths;
    
    // Hide or show rebirth button
    const rebirthButton = document.getElementById('rebirthButton');
    rebirthButton.style.display = player.level >= 100 ? 'block' : 'none';

    // Display collected images
    const imagesContainer = document.getElementById('collectedImages');
    imagesContainer.innerHTML = ''; // Clear previous images
    player.collectedImages.forEach(img => {
        let imgElement = document.createElement('img');
        imgElement.src = imagesByRarity[img];
        imgElement.alt = img;
        imgElement.className = 'collected-image';
        imagesContainer.appendChild(imgElement);
    });
}

function confirmRebirth() {
    if (player.rebirths < 10) {
        player.rebirths++;
        player.level = 1;
        player.coins = 0;
        player.collectedImages = [];
        player.totalImagesRequired = 5; // Reset to initial threshold
        player.luckFactor *= 2;
        updateDisplay();
        saveGameState();
    } else {
        alert("Maximum number of rebirths reached.");
    }
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
    let scale = (level - 1) / 99; // Normalize scale between 0 and 1
    return {
        planet: 500000 * luckFactor,
        star: 100000 * luckFactor,
        solarSystem: 10000 * luckFactor,
        galaxy: 1000 * luckFactor,
        universe: 100 * luckFactor
    };
}
