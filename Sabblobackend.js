async function loadJson(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fehler beim Laden von ${url}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function initialize() {
    const regionenData = await loadJson('regionen.json');
    if (!regionenData) return;

    populateRegions(regionenData);
    setupRegionChangeListener(regionenData);
}

function populateRegions(regionenData) {
    const regionSelect = document.getElementById('region');
    const regions = regionenData.regionen.map(region => Object.keys(region)[0]); // Extrahiert Regionennamen
    
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.toLowerCase();
        option.textContent = region;
        regionSelect.appendChild(option);
    });
}

function setupRegionChangeListener(regionenData) {
    const regionSelect = document.getElementById('region');
    const landscapeSelect = document.getElementById('landscape');

    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value.toLowerCase();
        updateLandscapes(regionenData, selectedRegion, landscapeSelect);
    });

    // Initiale Landschaftsbefüllung für die erste Region
    if (regionSelect.options.length > 0) {
        const initialRegion = regionSelect.options[0].value.toLowerCase();
        updateLandscapes(regionenData, initialRegion, landscapeSelect);
    }
}

function updateLandscapes(regionenData, selectedRegion, landscapeSelect) {
    // Landschaften für die gewählte Region sammeln
    const landscapes = new Set();

    const regionData = regionenData.regionen.find(region => 
        Object.keys(region)[0].toLowerCase() === selectedRegion
    );

    if (regionData) {
        const regionEntries = Object.values(regionData)[0]; // Extrahiert die Inhalte der Region
        regionEntries.forEach(entry => {
            if (entry.Tiere) {
                entry.Tiere.forEach(animal => {
                    if (animal.Gebiet && animal.Gebiet.trim() !== "") {
                        landscapes.add(animal.Gebiet);
                    }
                });
            }
            if (entry.Pflanzen) {
                entry.Pflanzen.forEach(plant => {
                    if (plant.Gebiet && plant.Gebiet.trim() !== "") {
                        landscapes.add(plant.Gebiet);
                    }
                });
            }
        });
    }

    // Landschafts-Combobox aktualisieren
    landscapeSelect.innerHTML = ""; // Vorherige Einträge entfernen
    Array.from(landscapes).forEach(landscape => {
        const option = document.createElement('option');
        option.value = landscape.toLowerCase();
        option.textContent = landscape;
        landscapeSelect.appendChild(option);
    });
}

// Start der Initialisierung
initialize();