// This assumes that imagesByRarity is globally available or stored
// For example, in localStorage or passed from the main game page
document.addEventListener('DOMContentLoaded', function() {
    displayCollectedImages();
});

function displayCollectedImages() {
    const imageRarities = ['planet', 'star', 'solarSystem', 'galaxy', 'universe'];
    imageRarities.forEach(rarity => {
        const container = document.getElementById(rarity);
        // Assuming `imagesByRarity[rarity]` contains URLs or image names to display
        imagesByRarity[rarity].forEach(image => {
            let imgElement = document.createElement('img');
            imgElement.src = `/path/to/images/${image}`;
            imgElement.alt = `${rarity} image`;
            imgElement.classList.add('collected-image');
            container.appendChild(imgElement);
        });
    });
}
