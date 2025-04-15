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
var pflanzenDaten = null;
var regionenDaten = null;
var tiereDaten = null;
async function initialize() {
    regionenDaten = await loadJson('regionen.json');
    if (!regionenDaten) return;
    pflanzenDaten = await loadJson('pflanzen.json');
    if (!pflanzenDaten) return;
    tiereDaten = await loadJson('tiere.json');
    if (!tiereDaten) return;
    populateRegions();
    setupRegionChangeListener();
    setupLandscapeChangeListener();
}

function populateRegions() {
    const regionSelect = document.getElementById('region');
    const regions = regionenDaten.regionen.map(region => Object.keys(region)[0]); // Extrahiert Regionennamen
    
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region.toLowerCase();
        option.textContent = region;
        regionSelect.appendChild(option);
    });
}

function setupRegionChangeListener() {
    const regionSelect = document.getElementById('region');
    const landscapeSelect = document.getElementById('landscape');

    regionSelect.addEventListener('change', () => {
        const selectedRegion = regionSelect.value.toLowerCase();
        updateLandscapes(regionenDaten, selectedRegion, landscapeSelect);
    });

    // Initiale Landschaftsbefüllung für die erste Region
    if (regionSelect.options.length > 0) {
        const initialRegion = regionSelect.options[0].value.toLowerCase();
        updateLandscapes(regionenDaten, initialRegion, landscapeSelect);
    }
}

function setupLandscapeChangeListener() {
    const landscapeSelect = document.getElementById('landscape');
    const activitySelect = document.getElementById('activity');

    landscapeSelect.addEventListener('change', () => {
        const selectedActivity = activitySelect.value;

        // Prüfen, ob die Aktivität "Kräutersuche" ist
        if (selectedActivity === 'Kräutersuche') {
            const plants = getPlantsForLandscape();
            generatePlantTable(plants);
            
        }
    });
}

function updateLandscapes(regionenDaten, selectedRegion, landscapeSelect) {
    // Landschaften für die gewählte Region sammeln
    const landscapes = new Set();

    const regionData = regionenDaten.regionen.find(region => 
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
function getPlantsForLandscape() {
    const plants = [];
    const selectedRegion = document.getElementById('region').value.toLowerCase();
    const selectedLandscape = document.getElementById('landscape').value.toLowerCase();
    // Finde die Daten für die ausgewählte Region
    const regionData = regionenDaten.regionen.find(region => 
        Object.keys(region)[0].toLowerCase() === selectedRegion.toLowerCase()
    );

    if (regionData) {
        const regionEntries = Object.values(regionData)[0]; // Extrahiere die Inhalte der Region

        regionEntries.forEach(entry => {
            if (entry.Pflanzen) {
                entry.Pflanzen.forEach(plant => {
                    const plantLandscape = plant.Gebiet ? plant.Gebiet.toLowerCase() : "";

                    // Bedingung: Pflanze gehört zur Region und ist nicht exklusiv für eine andere Landschaft
                    if (!plantLandscape || plantLandscape === selectedLandscape.toLowerCase()) {
                        plants.push(plant);
                    }
                });
            }
        });
    }

    return plants;
}
function generatePlantTable(plants) {
    const contentDiv = document.querySelector('.content');
    contentDiv.innerHTML = ''; // Vorherigen Inhalt entfernen

    // Pflanzen-Daten aus pflanzenDaten ergänzen
    const enrichedPlants = plants.map(plant => {

        const matchingPlant = pflanzenDaten.Pflanzen.find(p => p.Name.toLowerCase() === plant.Name.toLowerCase());
        if (matchingPlant) {
            return {
                Name: matchingPlant.Name,
                Typ: matchingPlant.Typ,
                Häufigkeit: plant.Häufigkeit // Fallback auf Verbreitung
            };
        }

        return plant; // Falls kein Match gefunden wird, bleibt der Eintrag unverändert
    });

    // Tabelle erstellen
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Tabellen-Header hinzufügen
    const headerRow = document.createElement('tr');
    ['Name', 'Typ', 'Häufigkeit'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid #333';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f4f4f4';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Pflanzen-Daten hinzufügen
    enrichedPlants.forEach(plant => {
        const row = document.createElement('tr');
        ['Name', 'Typ', 'Häufigkeit'].forEach(key => {
            const td = document.createElement('td');
            if (key === 'Häufigkeit') {
                td.textContent = calculateFinaldifficulty(plant[key]) || 'N/A';
            } else {
                td.textContent = plant[key] || 'N/A';
            }
            td.style.border = '1px solid #333';
            td.style.padding = '8px';
            row.appendChild(td);
        });
        table.appendChild(row);
    });

    // Tabelle in den Content-Bereich einfügen
    contentDiv.appendChild(table);
}
function calculateFinaldifficulty(frequency) {
    let difficulty = 0; // Initialisierung der Schwierigkeit
    const terraincheck = document.getElementById('terrain');
    const localcheck = document.getElementById('local');

    // Konvertiere die Häufigkeit in eine numerische Schwierigkeit
    switch (frequency.toLowerCase()) {
        case 'sehr häufig':
            difficulty = 1;
            break;
        case 'häufig':
            difficulty = 2;
            break;
        case 'gelegentlich':
            difficulty = 4;
            break;
        case 'selten':
            difficulty = 8;
            break;
        case 'sehr selten':
            difficulty = 16;
            break;
        default:
            difficulty = 0; // Fallback für unbekannte Häufigkeiten
    }

    // Anpassung der Schwierigkeit basierend auf Checkboxen
    if (terraincheck.checked) {
        difficulty -= 3; // Reduktion der Schwierigkeit durch Geländekunde
    }
    if (localcheck.checked) {
        difficulty -= 7; // Reduktion der Schwierigkeit durch Ortskunde
    }

    console.log(`Final difficulty: ${difficulty}`);
    return difficulty;
}
// Start der Initialisierung
initialize();