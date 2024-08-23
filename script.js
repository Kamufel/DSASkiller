document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            populateDropdowns(data);
        })
        .catch(error => console.error('Error loading JSON data:', error));
});

function populateDropdowns(data) {
    const talentSelects = document.querySelectorAll('.talent-select');
    const zauberSelects = document.querySelectorAll('.zauber-select');
    const anderesSelects = document.querySelectorAll('.anderes-select');

    // Füllt die Talent-Dropdowns
    data.talente.forEach(talent => {
        const option = document.createElement('option');
        option.value = talent.name;
        option.textContent = talent.name;
        talentSelects.forEach(select => select.appendChild(option.cloneNode(true)));
    });

    // Füllt die Zauber-Dropdowns
    data.zauber.forEach(zauber => {
        const option = document.createElement('option');
        option.value = zauber.name;
        option.textContent = zauber.name;
        zauberSelects.forEach(select => select.appendChild(option.cloneNode(true)));
    });

    // Füllt die Anderes-Dropdowns
    data.andere.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        anderesSelects.forEach(select => select.appendChild(option.cloneNode(true)));
    });
    data.eigenschaften.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        anderesSelects.forEach(select => select.appendChild(option.cloneNode(true)));
    });
}

function addTalentRow() {
    const container = document.getElementById('talent-container');

    const row = document.createElement('div');
    row.className = 'talent-row';

    row.innerHTML = `
        <select class="talent-select">
            <option value="" disabled selected>Wähle ein Talent</option>
        </select>
            <select class="steigerungskategorie-select">
            <option value="A+">A+</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="G">G</option>
            <option value="H">H</option>
        </select>

        <input type="number" class="current-value" placeholder="Aktueller Wert" min="0">

        <input type="number" class="desired-value" placeholder="Gewünschter Wert" min="0">

        <input type="number" class="ap-cost" placeholder="Benötigte AP" readonly>
    `;

    container.appendChild(row);

    // Erneut alle Talente für das neue Dropdown laden
    fetch('data.json')
        .then(response => response.json())
        .then(data => populateDropdowns({ talente: data.talente, zauber: [], andere: [], eigenschaften: [] }));
}

function addZauberRow() {
    const container = document.getElementById('talent-container');

    const row = document.createElement('div');
    row.className = 'zauber-row';

    row.innerHTML = `
        <select class="zauber-select">
            <option value="" disabled selected>Wähle einen Zauber</option>
        </select>

        </select>
            <select class="steigerungskategorie-select">
            <option value="A+">Kategorie A+</option>
            <option value="A">Kategorie A</option>
            <option value="B">Kategorie B</option>
            <option value="C">Kategorie C</option>
            <option value="D">Kategorie D</option>
            <option value="E">Kategorie E</option>
            <option value="F">Kategorie F</option>
            <option value="G">Kategorie G</option>
            <option value="H">Kategorie H</option>
        </select>

        <input type="number" class="current-value" placeholder="Aktueller Wert" min="0">

        <input type="number" class="desired-value" placeholder="Gewünschter Wert" min="0">

        <input type="number" class="ap-cost" placeholder="Benötigte AP" readonly>
    `;

    container.appendChild(row);

    // Erneut alle Zauber für das neue Dropdown laden
    fetch('data.json')
        .then(response => response.json())
        .then(data => populateDropdowns({ talente: [], zauber: data.zauber, andere: [], eigenschaften: [] }));
}

function addAnderesRow() {
    const container = document.getElementById('talent-container');

    const row = document.createElement('div');
    row.className = 'anderes-row';

    row.innerHTML = `
        <select class="anderes-select">
            <option value="" disabled selected>Wähle eine andere Eigenschaft</option>
        </select>
            <select class="steigerungskategorie-select">
            <option value="A+">Kategorie A+</option>
            <option value="A">Kategorie A</option>
            <option value="B">Kategorie B</option>
            <option value="C">Kategorie C</option>
            <option value="D">Kategorie D</option>
            <option value="E">Kategorie E</option>
            <option value="F">Kategorie F</option>
            <option value="G">Kategorie G</option>
            <option value="H">Kategorie H</option>
        </select>

        <input type="number" class="current-value" placeholder="Aktueller Wert" min="0">

        <input type="number" class="desired-value" placeholder="Gewünschter Wert" min="0">

        <input type="number" class="ap-cost" placeholder="Benötigte AP" readonly>
    `;
    container.appendChild(row);

    // Erneut alle Zauber für das neue Dropdown laden
    fetch('data.json')
        .then(response => response.json())
        .then(data => populateDropdowns({ talente: [], zauber: [], andere: data.andere, eigenschaften: data.eigenschaften }));
}

function calculateAP() {
    const talentRows = document.querySelectorAll('.talent-row');
    const zauberRows = document.querySelectorAll('.zauber-row');
    const anderesRows = document.querySelectorAll('.anderes-row');
    let totalCost = 0;

    // Berechnung der AP-Kosten für Talente
    talentRows.forEach(row => {
        const currentValue = parseInt(row.querySelector('.current-value').value, 10) || 0;
        const desiredValue = parseInt(row.querySelector('.desired-value').value, 10) || 0;
        const steigerungskategorie = row.querySelector('.steigerungskategorie-select').value;

        let apCost = 0;

        for (let i = currentValue + 1; i <= desiredValue; i++) {
            apCost += getAPCostForStep(i, steigerungskategorie);
        }

        row.querySelector('.ap-cost').value = apCost;
        totalCost += apCost;
    });

    // Berechnung der AP-Kosten für Zauber
    zauberRows.forEach(row => {
        const currentValue = parseInt(row.querySelector('.current-value').value, 10) || 0;
        const desiredValue = parseInt(row.querySelector('.desired-value').value, 10) || 0;
        const steigerungskategorie = row.querySelector('.steigerungskategorie-select').value;

        let apCost = 0;

        for (let i = currentValue + 1; i <= desiredValue; i++) {
            apCost += getAPCostForStep(i, steigerungskategorie);
        }

        row.querySelector('.ap-cost').value = apCost;
        totalCost += apCost;
    });

    // Berechnung der AP-Kosten für anderes
    anderesRows.forEach(row => {
        const currentValue = parseInt(row.querySelector('.current-value').value, 10) || 0;
        const desiredValue = parseInt(row.querySelector('.desired-value').value, 10) || 0;
        const steigerungskategorie = row.querySelector('.steigerungskategorie-select').value;

        let apCost = 0;

        for (let i = currentValue + 1; i <= desiredValue; i++) {
            apCost += getAPCostForStep(i, steigerungskategorie);
        }

        row.querySelector('.ap-cost').value = apCost;
        totalCost += apCost;
    });

    document.getElementById('total-cost').value = totalCost;
}

function getAPCostForStep(value, category) {
    switch (category) {
        case 'A+':
            return value;
        case 'A':
            return value;
        case 'B':
            return value * 2;
        case 'C':
            return value * 3;
        case 'D':
            return value * 4;
        case 'E':
            return value * 4;  
        case 'F':
            return value * 4; 
        case 'G':
            return value * 4; 
        case 'H':
            return value * 4;
        default:
            return 0;
    }
}
