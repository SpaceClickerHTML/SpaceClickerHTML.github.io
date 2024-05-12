document.addEventListener('DOMContentLoaded', function() {
    displayCollectedImages();
});

function displayCollectedImages() {
    const playerState = JSON.parse(localStorage.getItem('playerState'));
    if (!playerState || !playerState.collectedImages) {
        console.log('No image data found.');
        return;
    }

    const imageCounts = playerState.collectedImages.reduce((acc, image) => {
        acc[image] = (acc[image] || 0) + 1;
        return acc;
    }, {});

    const imagesByRarity = {
        planet: ['images/planet/earth.png'],
        star: ['images/star/sun.png'],
        solarSystem: ['images/solarsystem/solarsystem.png'],
        galaxy: ['images/galaxy/milkyway.png'],
        universe: ['images/universe/universe.png']
    };

    Object.keys(imagesByRarity).forEach(rarity => {
        const container = document.getElementById(rarity);
        imagesByRarity[rarity].forEach(image => {
            if (imageCounts[rarity]) {
                let imgElement = document.createElement('img');
                imgElement.src = image;
                imgElement.alt = rarity;
                imgElement.className = 'collected-image';
                container.appendChild(imgElement);

                let countElement = document.createElement('div');
                countElement.textContent = 'Count: ' + imageCounts[rarity];
                countElement.className = 'image-count';
                container.appendChild(countElement);
            }
        });
    });
}
