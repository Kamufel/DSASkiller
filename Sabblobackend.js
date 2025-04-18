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
    setupActivityAndCheckboxListeners(); // Neue Listener hinzufügen
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

        if (selectedActivity === 'Kräutersuche') {
            const plants = getPlantsForLandscape();
            generatePlantTable(plants);
        } else if (selectedActivity === 'Jagd') {
            const animals = getAnimalsForLandscape();
            generateAnimalTable(animals);
        } else if (selectedActivity === 'Safari') { // Neue Aktivität behandeln
            const animals = getAnimalsWithoutHuntingValue(); // Tiere ohne Jagdwert abrufen
            generateSafariTable(animals); // Tabelle für Safari generieren
        }
    });
}
function setupActivityAndCheckboxListeners() {
    const activitySelect = document.getElementById('activity');
    const terrainCheck = document.getElementById('terrain');
    const localCheck = document.getElementById('local');

    // Listener für die Aktivität
    activitySelect.addEventListener('change', updateTable);

    // Listener für die Checkboxen
    terrainCheck.addEventListener('change', updateTable);
    localCheck.addEventListener('change', updateTable);
}
function updateLandscapes(regionenDaten, selectedRegion, landscapeSelect) {
    const landscapes = new Set();
    const regionData = regionenDaten.regionen.find(region => 
        Object.keys(region)[0].toLowerCase() === selectedRegion
    );

    if (regionData) {
        const regionEntries = Object.values(regionData)[0];
        landscapes.add("ALLE"); // Option "ALLE" hinzufügen
        regionEntries.forEach(entry => {
            if (entry.Tiere) {
                entry.Tiere.forEach(animal => {
                    if (animal.Gebiet) {
                        landscapes.add(animal.Gebiet);
                    }
                });
            }
            if (entry.Pflanzen) {
                entry.Pflanzen.forEach(plant => {
                    if (plant.Gebiet) {
                        landscapes.add(plant.Gebiet);
                    }
                });
            }
        });
    }

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
    const uniqueNames = new Set(); // Set für eindeutige Namen

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

                    // Bedingung: Zeige alle Pflanzen, wenn "ALLE" ausgewählt ist
                    if ((selectedLandscape === "alle" || !plantLandscape || plantLandscape === selectedLandscape) &&
                        !uniqueNames.has(plant.Name.toLowerCase())) {
                        plants.push(plant);
                        uniqueNames.add(plant.Name.toLowerCase()); // Füge den Namen zum Set hinzu
                    }
                });
            }
        });
    }

    return plants;
}
function getAnimalsForLandscape() {
    const animals = [];
    const selectedRegion = document.getElementById('region').value.toLowerCase();
    const selectedLandscape = document.getElementById('landscape').value.toLowerCase();
    const uniqueNames = new Set(); // Set für eindeutige Namen

    // Finde die Daten für die ausgewählte Region
    const regionData = regionenDaten.regionen.find(region => 
        Object.keys(region)[0].toLowerCase() === selectedRegion.toLowerCase()
    );

    if (regionData) {
        const regionEntries = Object.values(regionData)[0]; // Extrahiere die Inhalte der Region

        regionEntries.forEach(entry => {
            if (entry.Tiere) {
                entry.Tiere.forEach(tier => {
                    const animalLandscape = tier.Gebiet ? tier.Gebiet.toLowerCase() : "";

                    // Bedingung: Zeige alle Tiere mit Jagdwert, wenn "ALLE" ausgewählt ist
                    if ((selectedLandscape === "alle" || !animalLandscape || animalLandscape === selectedLandscape) &&
                        !uniqueNames.has(tier.Name.toLowerCase())) {
                        const matchingAnimal = tiereDaten.Tiere.find(a => a.Name.toLowerCase() === tier.Name.toLowerCase());
                        if (matchingAnimal && matchingAnimal.Jagd) {
                            animals.push(tier);
                            uniqueNames.add(tier.Name.toLowerCase()); // Füge den Namen zum Set hinzu
                        }
                    }
                });
            }
        });
    }

    return animals;
}
function getAnimalsWithoutHuntingValue() {
    const animals = [];
    const selectedRegion = document.getElementById('region').value.toLowerCase();
    const selectedLandscape = document.getElementById('landscape').value.toLowerCase();
    const uniqueNames = new Set(); // Set für eindeutige Namen

    // Finde die Daten für die ausgewählte Region
    const regionData = regionenDaten.regionen.find(region =>
        Object.keys(region)[0].toLowerCase() === selectedRegion.toLowerCase()
    );

    if (regionData) {
        const regionEntries = Object.values(regionData)[0]; // Extrahiere die Inhalte der Region

        regionEntries.forEach(entry => {
            if (entry.Tiere) {
                entry.Tiere.forEach(tier => {
                    const animalLandscape = tier.Gebiet ? tier.Gebiet.toLowerCase() : "";

                    // Bedingung: Zeige alle Tiere ohne Jagdwert, wenn "ALLE" ausgewählt ist
                    if ((selectedLandscape === "alle" || !animalLandscape || animalLandscape === selectedLandscape) &&
                        !uniqueNames.has(tier.Name.toLowerCase())) {
                        const matchingAnimal = tiereDaten.Tiere.find(a => a.Name.toLowerCase() === tier.Name.toLowerCase());
                        if (!matchingAnimal || !matchingAnimal.Jagd || matchingAnimal.Jagd.toLowerCase() === 'nein') {
                            animals.push(tier);
                            uniqueNames.add(tier.Name.toLowerCase()); // Füge den Namen zum Set hinzu
                        }
                    }
                });
            }
        });
    }

    return animals;
}
function generatePlantTable(plants) {
    const contentDiv = document.querySelector('.content');
    contentDiv.innerHTML = ''; // Vorherigen Inhalt entfernen

    const enrichedPlants = plants.map(plant => {
        const matchingPlant = pflanzenDaten.Pflanzen.find(p => p.Name.toLowerCase() === plant.Name.toLowerCase());
        if (matchingPlant) {
            return {
                Name: matchingPlant.Name,
                Typ: matchingPlant.Typ,
                Häufigkeit: plant.Häufigkeit
            };
        }
        return plant;
    });

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

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

    enrichedPlants.forEach(plant => {
        const row = document.createElement('tr');
        ['Name', 'Typ', 'Häufigkeit'].forEach(key => {
            const td = document.createElement('td');
            td.textContent = key === 'Häufigkeit' ? calculateFinaldifficulty(plant[key]) || 'N/A' : plant[key] || 'N/A';
            td.style.border = '1px solid #333';
            td.style.padding = '8px';
            row.appendChild(td);
        });
        table.appendChild(row);
    });

    contentDiv.appendChild(table);

    // Tabelle sortierbar machen und standardmäßig nach "Typ" sortieren (Index 1)
    makeTableSortable(table, 1);
}
function generateAnimalTable(animals) {
    const contentDiv = document.querySelector('.content');
    contentDiv.innerHTML = ''; // Vorherigen Inhalt entfernen

    // Filtere Tiere, deren Jagdwert "Ja" ist oder eine Zahl enthält
    const filteredAnimals = animals.filter(animal => {
        const matchingAnimal = tiereDaten.Tiere.find(a => a.Name.toLowerCase() === animal.Name.toLowerCase());
        return matchingAnimal && matchingAnimal.Jagd && !isNaN(parseInt(matchingAnimal.Jagd));
    });

    const enrichedAnimals = filteredAnimals.map(animal => {
        const matchingAnimal = tiereDaten.Tiere.find(a => a.Name.toLowerCase() === animal.Name.toLowerCase());
        let frequencyValue = calculateFinaldifficulty(animal.Häufigkeit);

        if (matchingAnimal && matchingAnimal.Jagd) {
            const jagdValue = parseInt(matchingAnimal.Jagd, 10);
            if (!isNaN(jagdValue)) {
                frequencyValue += jagdValue;
            }
        }

        return {
            Name: animal.Name,
            Jagd: matchingAnimal && matchingAnimal.Jagd ? 'Ja' : 'Nein',
            Angriff: matchingAnimal && matchingAnimal.Angriff ? 'Ja' : 'Nein',
            Beute: matchingAnimal && matchingAnimal.Beute ? matchingAnimal.Beute : 'Keine Beute',
            Gesamterschwernis: frequencyValue
        };
    });

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const headerRow = document.createElement('tr');
    ['Name', 'Angriff', 'Beute', 'Gesamterschwernis'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid #333';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f4f4f4';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    enrichedAnimals.forEach(animal => {
        const row = document.createElement('tr');
        ['Name',  'Angriff', 'Beute', 'Gesamterschwernis'].forEach(key => {
            const td = document.createElement('td');
            td.textContent = animal[key] || 'N/A';
            td.style.border = '1px solid #333';
            td.style.padding = '8px';
            row.appendChild(td);
        });
        table.appendChild(row);
    });

    contentDiv.appendChild(table);

    // Tabelle sortierbar machen und standardmäßig nach "Gesamterschwernis" sortieren (Index 4)
    makeTableSortable(table, 3);
}
function generateSafariTable(animals) {
    const contentDiv = document.querySelector('.content');
    contentDiv.innerHTML = ''; // Vorherigen Inhalt entfernen

    const enrichedAnimals = animals.map(animal => {
        const matchingAnimal = tiereDaten.Tiere.find(a => a.Name.toLowerCase() === animal.Name.toLowerCase());
        return {
            Name: animal.Name,
            Jagd: matchingAnimal && matchingAnimal.Jagd ? matchingAnimal.Jagd : 'Nein',
            Angriff: matchingAnimal && matchingAnimal.Angriff ? 'Ja' : 'Nein',
            Beute: matchingAnimal && matchingAnimal.Beute ? matchingAnimal.Beute : 'Keine Beute'
        };
    });

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const headerRow = document.createElement('tr');
    ['Name',  'Beute'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid #333';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f4f4f4';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    enrichedAnimals.forEach(animal => {
        const row = document.createElement('tr');
        ['Name', 'Beute'].forEach(key => {
            const td = document.createElement('td');
            td.textContent = animal[key] || 'N/A';
            td.style.border = '1px solid #333';
            td.style.padding = '8px';
            row.appendChild(td);
        });
        table.appendChild(row);
    });

    contentDiv.appendChild(table);

    // Tabelle sortierbar machen und standardmäßig nach "Name" sortieren (Index 0)
    makeTableSortable(table, 0);
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


    return difficulty;
}
function updateTable() {
    const selectedActivity = document.getElementById('activity').value;

    if (selectedActivity === 'Kräutersuche') {
        const plants = getPlantsForLandscape();
        generatePlantTable(plants);
    } else if (selectedActivity === 'Jagd') {
        const animals = getAnimalsForLandscape(); // Diese Funktion muss analog zu `getPlantsForLandscape` implementiert werden
        generateAnimalTable(animals); // Diese Funktion muss erstellt werden
    }
    else if (selectedActivity === 'Safari') { // Neue Aktivität behandeln
        const animals = getAnimalsWithoutHuntingValue(); // Tiere ohne Jagdwert abrufen
        generateSafariTable(animals); // Tabelle für Safari generieren
    }
    
}
function makeTableSortable(table, defaultSortIndex = null) {
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        header.style.cursor = 'pointer'; // Zeigt an, dass die Spalte klickbar ist
        header.addEventListener('click', () => {
            const rows = Array.from(table.querySelectorAll('tr:nth-child(n+2)')); // Alle Zeilen außer der Header-Zeile
            const isAscending = header.dataset.sortOrder === 'asc';
            header.dataset.sortOrder = isAscending ? 'desc' : 'asc';

            rows.sort((rowA, rowB) => {
                const cellA = rowA.children[index].textContent.trim();
                const cellB = rowB.children[index].textContent.trim();

                // Sortiere numerisch, falls möglich, ansonsten alphabetisch
                const valueA = isNaN(cellA) ? cellA.toLowerCase() : parseFloat(cellA);
                const valueB = isNaN(cellB) ? cellB.toLowerCase() : parseFloat(cellB);

                if (valueA < valueB) return isAscending ? -1 : 1;
                if (valueA > valueB) return isAscending ? 1 : -1;
                return 0;
            });

            // Sortierte Zeilen neu anordnen
            rows.forEach(row => table.appendChild(row));
        });
    });

    // Standardmäßig nach einer bestimmten Spalte sortieren
    if (defaultSortIndex !== null) {
        const defaultHeader = headers[defaultSortIndex];
        if (defaultHeader) {
            defaultHeader.dataset.sortOrder = 'asc'; // Standardmäßig aufsteigend sortieren
            defaultHeader.click(); // Simuliere einen Klick, um die Tabelle zu sortieren
        }
    }
}
// Start der Initialisierung
initialize();