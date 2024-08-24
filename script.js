document.addEventListener('DOMContentLoaded', () => {
    fetch('https://cdn.discordapp.com/attachments/226761368206835712/1277030633977286676/data.json?ex=66cbaef5&is=66ca5d75&hm=11ed061397b243904cfc666d98e37f55abdbde2f8bd068db31d650b125558d84&')
        .then(response => response.json())
        .then(data => {
            populateDropdowns(data);
            setupEventListeners(data);
        })
        .catch(error => console.error('Error loading JSON data:', error));
    populateSidebarComboboxes();
    setupImportExportEventListeners();
});

function populateSidebarComboboxes() {
    // Arrays mit Optionen
    const comboboxOptions = {
        profanVorteile: [
            "", "Akademische Ausbildung (Krieger)", "Beidhändig", "Eidetisches Gedächtnis", "Gutes Gedächtnis",
            "Linkshänder", "Schlangenmensch", "Unstet"
        ],
        profanBegabungen: [
            "", "Kampftalent", "Fernkampftalent", "Nahkampftalent", "Gesellschaftliches Talent", "Handwerkstalent",
            "Körperliches Talent", "Naturtalent", "Sprachen und Schriften", "Wissenstalent"
        ],
        magischVorteile: [
            "", "Akademische Ausbildung (Magier)", "Eigeboren", "Astraler Block", "Elfische Weltsicht (W.I.P)", "Sippenlos"
        ],
        magischBegabungen: [
            "", "Antimagie", "Beschwörung", "Dämonisch", "Dämonisch (Agrimoth)", "Dämonisch (Amazeroth)", "Dämonisch (Belhalhar)",
            "Dämonisch (Blakharaz)", "Dämonisch (Lolgramoth)", "Dämonisch (Mishkara)", "Dämonisch (Thargunitoth)",
            "Eigenschaften", "Einfluss", "Elementar", "Elementar (Eis)", "Elementar (Erz)", "Elementar (Feuer)",
            "Elementar (Humus)", "Elementar (Luft)", "Elementar (Wasser)", "Form", "Geisterwesen", "Heilung", "Hellsicht",
            "Herbeirufung", "Herrschaft", "Illusion", "Kraft", "Limbus", "Metamagie", "Objekt", "Schaden", "Telekinese",
            "Temporal", "Umwelt", "Verständigung"
        ],
        magischMerkmale: [
            "", "Antimagie", "Beschwörung", "Dämonisch", "Dämonisch (Agrimoth)", "Dämonisch (Amazeroth)", "Dämonisch (Belhalhar)",
            "Dämonisch (Blakharaz)", "Dämonisch (Lolgramoth)", "Dämonisch (Mishkara)", "Dämonisch (Thargunitoth)",
            "Eigenschaften", "Einfluss", "Elementar", "Elementar (Eis)", "Elementar (Erz)", "Elementar (Feuer)",
            "Elementar (Humus)", "Elementar (Luft)", "Elementar (Wasser)", "Form", "Geisterwesen", "Heilung", "Hellsicht",
            "Herbeirufung", "Herrschaft", "Illusion", "Kraft", "Limbus", "Metamagie", "Objekt", "Schaden", "Telekinese",
            "Temporal", "Umwelt", "Verständigung"
        ]
    };

    // Mapping der Comboboxen
    const comboboxes = document.querySelectorAll('.sidebar-combobox');

    comboboxes.forEach((combobox, index) => {
        let options = [];
        if (index < 3) {
            options = comboboxOptions.profanVorteile;
        } else if (index < 6) {
            options = comboboxOptions.profanBegabungen;
        } else if (index < 9) {
            options = comboboxOptions.profanBegabungen;  // Unfähigkeiten Profan use the same options as Begabungen Profan
        } else if (index < 12) {
            options = comboboxOptions.magischVorteile;
        } else if (index < 15) {
            options = comboboxOptions.magischBegabungen;
        } else if (index < 18) {
            options = comboboxOptions.magischBegabungen;  // Unfähigkeiten Magisch use the same options as Begabungen Magisch
        } else if (index < 21) {
            options = comboboxOptions.magischMerkmale;
        }
        fillCombobox(combobox, options);
    });
}

function fillCombobox(combobox, items) {
    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        combobox.appendChild(option);
    });
}

// Export-Funktion
function exportComboboxState() {
    const state = {
        profanVorteile: [],
        profanBegabungen: [],
        unfähigkeitenProfan: [],  // New state for Unfähigkeiten Profan
        magischVorteile: [],
        magischBegabungen: [],
        unfähigkeitenMagisch: [],  // New state for Unfähigkeiten Magisch
        magischMerkmale: []
    };

    const comboboxes = document.querySelectorAll('.sidebar-combobox');

    comboboxes.forEach((combobox, index) => {
        const selectedValue = combobox.value || null;
        if (index < 3) {
            state.profanVorteile.push(selectedValue);
        } else if (index < 6) {
            state.profanBegabungen.push(selectedValue);
        } else if (index < 9) {
            state.unfähigkeitenProfan.push(selectedValue);  // Assign values to Unfähigkeiten Profan
        } else if (index < 12) {
            state.magischVorteile.push(selectedValue);
        } else if (index < 15) {
            state.magischBegabungen.push(selectedValue);
        } else if (index < 18) {
            state.unfähigkeitenMagisch.push(selectedValue);  // Assign values to Unfähigkeiten Magisch
        } else if (index < 21) {
            state.magischMerkmale.push(selectedValue);
        }
    });

    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'combobox_state.json';
    a.click();

    URL.revokeObjectURL(url);
}

// Import-Funktion
function importComboboxState(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const state = JSON.parse(content);

        const comboboxes = document.querySelectorAll('.sidebar-combobox');

        comboboxes.forEach((combobox, index) => {
            if (index < 3) {
                combobox.value = state.profanVorteile[index] || '';
            } else if (index >= 3 && index < 6) {
                combobox.value = state.profanBegabungen[index - 3] || ''; 
            } else if (index >= 6 && index < 9) {
                combobox.value = state.unfähigkeitenProfan[index - 6] || '';  
            } else if (index >= 9 && index < 12) {
                combobox.value = state.magischVorteile[index - 9] || '';
            } else if (index >= 12 && index < 15) {
                combobox.value = state.magischBegabungen[index - 12] || '';
            } else if (index >= 15 && index < 18) {
                combobox.value = state.unfähigkeitenMagisch[index - 15] || '';  
            } else if (index >= 18 && index < 21) {
                combobox.value = state.magischMerkmale[index - 18] || '';
            }
        });
    };
    reader.readAsText(file);
}

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
}

// Füge Event Listener hinzu, um die Steigerungskategorie automatisch zu setzen
function setupEventListeners(data) {
    document.querySelectorAll('.talent-select, .zauber-select, .anderes-select').forEach(select => {
        select.addEventListener('change', (event) => {
            const selectedName = event.target.value;
            const row = event.target.closest('.talent-row, .zauber-row, .anderes-row');
            const categorySelect = row.querySelector('.steigerungskategorie-select');
            
            let selectedItem = data.talente.find(talent => talent.name === selectedName) ||
                data.zauber.find(zauber => zauber.name === selectedName) ||
                data.andere.find(item => item.name === selectedName); 

            if (selectedItem) {
                categorySelect.value = getRealFactor(selectedItem);
            }
        });
    });
}
function setupImportExportEventListeners() {
    document.getElementById('export-btn').addEventListener('click', exportComboboxState);
    
    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json';
    importInput.style.display = 'none';
    importInput.addEventListener('change', importComboboxState);

    document.getElementById('import-btn').addEventListener('click', () => {
        importInput.click();
    });

    document.body.appendChild(importInput);
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

        <input type="number" class="current-value" placeholder="Start" min="0" max="20">

        <input type="number" class="desired-value" placeholder="Ziel" min="0" max="21">

        <input type="number" class="ap-cost" placeholder="Kosten" readonly>

        <textarea class="note-field" placeholder="Notizen..." rows="1"></textarea>

        <button class="delete-button" onclick="deleteRow(this)">&#x2716;</button>
    `;

    container.appendChild(row);

    // Erneut alle Talente für das neue Dropdown laden
    fetch('https://cdn.discordapp.com/attachments/226761368206835712/1277030633977286676/data.json?ex=66cbaef5&is=66ca5d75&hm=11ed061397b243904cfc666d98e37f55abdbde2f8bd068db31d650b125558d84&')
        .then(response => response.json())
        .then(data => {
            populateDropdowns({ talente: data.talente, zauber: [], andere: []});
            setupEventListeners(data); // Füge Event Listener für neue Zeilen hinzu
        });
}

function addZauberRow() {
    const container = document.getElementById('talent-container');

    const row = document.createElement('div');
    row.className = 'zauber-row';

    row.innerHTML = `
        <select class="zauber-select">
            <option value="" disabled selected>Wähle einen Zauber</option>
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

        <input type="number" class="current-value" placeholder="Start" min="0" max="20">

        <input type="number" class="desired-value" placeholder="Ziel" min="0" max="21">

        <input type="number" class="ap-cost" placeholder="Kosten" readonly>

        <textarea class="note-field" placeholder="Notizen..." rows="1"></textarea>

        <button class="delete-button" onclick="deleteRow(this)">&#x2716;</button>
    `;

    container.appendChild(row);

    // Erneut alle Zauber für das neue Dropdown laden
    fetch('https://cdn.discordapp.com/attachments/226761368206835712/1277030633977286676/data.json?ex=66cbaef5&is=66ca5d75&hm=11ed061397b243904cfc666d98e37f55abdbde2f8bd068db31d650b125558d84&')
        .then(response => response.json())
        .then(data => {
            populateDropdowns({ talente: [], zauber: data.zauber, andere: []});
            setupEventListeners(data); // Füge Event Listener für neue Zeilen hinzu
        });
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

        <input type="number" class="current-value" placeholder="Start" min="0" max="20">

        <input type="number" class="desired-value" placeholder="Ziel" min="0" max="21">

        <input type="number" class="ap-cost" placeholder="Kosten" readonly>

        <textarea class="note-field" placeholder="Notizen..." rows="1"></textarea>

        <button class="delete-button" onclick="deleteRow(this)">&#x2716;</button>
    `;
    container.appendChild(row);

    // Erneut alle Daten für das neue Dropdown laden
    fetch('https://cdn.discordapp.com/attachments/226761368206835712/1277030633977286676/data.json?ex=66cbaef5&is=66ca5d75&hm=11ed061397b243904cfc666d98e37f55abdbde2f8bd068db31d650b125558d84&')
        .then(response => response.json())
        .then(data => {
            populateDropdowns({ talente: [], zauber: [], andere: data.andere});
            setupEventListeners(data); // Füge Event Listener für neue Zeilen hinzu
        });
}

function deleteRow(button) {
    const row = button.parentElement;
    row.remove();
    calculateAP(); // Berechne die Gesamtkosten neu, nachdem eine Zeile gelöscht wurde
}

function calculateAP() {

    fetch('https://cdn.discordapp.com/attachments/226761368206835712/1277030633977286676/data.json?ex=66cbaef5&is=66ca5d75&hm=11ed061397b243904cfc666d98e37f55abdbde2f8bd068db31d650b125558d84&')
            .then(response => response.json())
            .then(data => {
                getRealAPCost(data);
            })
            .catch(error => console.error('Error loading JSON data:', error)); 


}

let isSidebarOpen = false;

function toggleNav() {
    const sidebar = document.getElementById("sidebar");
    const toggleButton = document.getElementById("toggleButton");

    if (isSidebarOpen) {
        sidebar.style.width = "0";
        toggleButton.innerHTML = "&#9776; Menü";
    } else {
        sidebar.style.width = "400px";
        toggleButton.innerHTML = "&#x2716; Schließen";
    }

    isSidebarOpen = !isSidebarOpen;
}

function getRealFactor(item)
{
    const faktoren = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    globalCounter=0;
    const state = {
        profanVorteile: [],
        profanBegabungen: [],
        unfähigkeitenProfan: [],  
        magischVorteile: [],
        magischBegabungen: [],
        unfähigkeitenMagisch: [], 
        magischMerkmale: []
    };

    const comboboxes = document.querySelectorAll('.sidebar-combobox');

    comboboxes.forEach((combobox, index) => {
        const selectedValue = combobox.value || null;
        if (index < 3) {
            state.profanVorteile.push(selectedValue);
        } else if (index < 6) {
            state.profanBegabungen.push(selectedValue);
        } else if (index < 9) {
            state.unfähigkeitenProfan.push(selectedValue); 
        } else if (index < 12) {
            state.magischVorteile.push(selectedValue);
        } else if (index < 15) {
            state.magischBegabungen.push(selectedValue);
        } else if (index < 18) {
            state.unfähigkeitenMagisch.push(selectedValue); 
        } else if (index < 21) {
            state.magischMerkmale.push(selectedValue);
        }
    });
 
if (item.hasOwnProperty("gruppe")) 
    {
        item.gruppe.forEach(gruppe =>
                {
                state.profanBegabungen.forEach(begabung =>
                    {
                    if(gruppe === begabung)
                        {
                            globalCounter-=1;
                            console.log(`Wir haben eine Begabung für ${gruppe}, das Steigern ist um ${globalCounter} Spalten verschoben`);
                        }
                        
                });
                state.unfähigkeitenProfan.forEach(unfähigkeit =>
                    {
                    if(gruppe === unfähigkeit)
                        {
                            globalCounter+=1;
                            console.log(`Wir haben eine Unfähigkeit für ${gruppe}, das Steigern ist um ${globalCounter} Spalten verschoben`);
                        }
                        
                });
                state.profanBegabungen.forEach(begabung =>
                    {
                    if(gruppe==="Sprachen/Schriften" && begabung==="Sprachen und Schriften")
                        {
                            globalCounter-=1;
                            console.log(`Wir haben eine Begabung für Sprachen/Schriften, das Steigern ist um ${globalCounter} Spalten verschoben`);
                        }
                        
                });
                state.profanVorteile.forEach(vorteil =>
                    {
                    if((gruppe==="Wissenstalent"|| gruppe==="Handwerkstalent") && vorteil === "Unstet")
                        {
                            globalCounter+=1;
                            console.log(`Wir sind Unstet! Das Steigern von ${gruppe} ist um ${globalCounter} Spalten verschoben`);
                        }
                        
                });
                state.profanVorteile.forEach(vorteil =>
                    {
                    if((gruppe==="Ringen" || gruppe==="Akrobatik" || gruppe==="Gaukeleien" || gruppe==="Körperbeherrschung" || gruppe==="Schleichen" || gruppe==="Sich Verstecken" || gruppe==="Tanzen" || gruppe==="Fesseln/Entfesseln") && vorteil === "Schlangenmensch")
                        {
                            console.log("yip")
                            globalCounter-=1;
                            console.log(`Wir sind Schlangenmensch! Das Steigern von ${gruppe} ist um ${globalCounter} Spalten verschoben`);
                        }
                        
                });
                state.magischVorteile.forEach(vorteil =>
                    {
                    if(gruppe==="Charisma" && vorteil === "Eigeboren")
                        {
                            globalCounter-=1;
                            console.log(`Wir sind Eigeboren! Das Steigern von Charisma ist um ${globalCounter} Spalten verschoben`);
                        }
                        
                }); 
        });
        
    } 
else
{
    item.merkmale.forEach(merkmale =>
        { 
            state.magischBegabungen.forEach(begabung =>
                {
                    if(merkmale === begabung)
                        {
                            globalCounter-=1;
                            console.log(`Wir haben eine Begabung für ${merkmale}, das Steigern ist um ${globalCounter} Spalten verschoben`);
                        }
                    
                });
            state.magischMerkmale.forEach(begabung =>
                {
                    if(merkmale === begabung)
                        {
                            globalCounter-=1;
                            console.log(`Wir haben eine Merkmalskenntnis für ${merkmale}, das Steigern ist um ${globalCounter} Spalten verschoben`);
                        }
                            
                });
            state.unfähigkeitenMagisch.forEach(unfähigkeit =>
                {
                    if(merkmale === unfähigkeit)
                        {
                            globalCounter+=1;
                            console.log(`Wir haben eine Unfähigkeit für ${merkmale}, das Steigern ist um ${globalCounter} Spalten verschoben`);
                        }
                                
                });
        });
}



    return faktoren[faktoren.indexOf(item.steigerungskategorie)+globalCounter];
}


function getRealAPCost(data)
{
            
    const talentRows = document.querySelectorAll('.talent-row');
    const zauberRows = document.querySelectorAll('.zauber-row');
    const anderesRows = document.querySelectorAll('.anderes-row');
    let totalCost = 0;

    const state = {
        profanVorteile: [],
        profanBegabungen: [],
        unfähigkeitenProfan: [],  
        magischVorteile: [],
        magischBegabungen: [],
        unfähigkeitenMagisch: [], 
        magischMerkmale: []
    };

    const comboboxes = document.querySelectorAll('.sidebar-combobox');

    comboboxes.forEach((combobox, index) => {
        const selectedValue = combobox.value || null;
        if (index < 3) {
            state.profanVorteile.push(selectedValue);
        } else if (index < 6) {
            state.profanBegabungen.push(selectedValue);
        } else if (index < 9) {
            state.unfähigkeitenProfan.push(selectedValue); 
        } else if (index < 12) {
            state.magischVorteile.push(selectedValue);
        } else if (index < 15) {
            state.magischBegabungen.push(selectedValue);
        } else if (index < 18) {
            state.unfähigkeitenMagisch.push(selectedValue); 
        } else if (index < 21) {
            state.magischMerkmale.push(selectedValue);
        }
    });

    // Berechnung der AP-Kosten für Talente
    talentRows.forEach(row => {
        const currentValue = parseInt(row.querySelector('.current-value').value, 10) || 0;
        const desiredValue = parseInt(row.querySelector('.desired-value').value, 10) || 0;
        const steigerungskategorie = row.querySelector('.steigerungskategorie-select').value;



        document.querySelectorAll('.talent-select').forEach(select => {
            apCost = 0;

            for (let i = currentValue + 1; i <= desiredValue; i++) {
                apCost += getAPCostForStep(i, steigerungskategorie);
            }
            console.log(data);
            selectedItem = data.talente.find(talent => talent.name === select.value);

                    console.log(selectedItem);

                    state.profanVorteile.forEach(vorteil =>
                        {
                            console.log(selectedItem);
                            selectedItem.gruppe.forEach(gruppe =>
                                { 
                                    if(vorteil === "Gutes Gedächtnis" && gruppe === "Sprachen/Schriften")
                                        {
                                            apCost = Math.round(apCost*0.75);
                                        }
                                    else if (vorteil === "Eidetisches Gedächtnis" && gruppe === "Sprachen/Schriften")
                                        {
                                            apCost = Math.round(apCost*0.50);
                                        }
                                    
                            });                      
        });
        row.querySelector('.ap-cost').value = apCost;

    });
    totalCost += apCost;
    document.getElementById('total-cost').value = totalCost;

    });

    // Berechnung der AP-Kosten für Zauber
    zauberRows.forEach(row => {
        const currentValue = parseInt(row.querySelector('.current-value').value, 10) || 0;
        const desiredValue = parseInt(row.querySelector('.desired-value').value, 10) || 0;
        const steigerungskategorie = row.querySelector('.steigerungskategorie-select').value;

        

        document.querySelectorAll('.zauber-select').forEach(select => {
            apCost = 0;

        for (let i = currentValue + 1; i <= desiredValue; i++) {
            apCost += getAPCostForStep(i, steigerungskategorie);
        }

            selectedItem = data.zauber.find(zauber => zauber.name === select.value);

                    state.profanVorteile.forEach(vorteil =>
                        {
                            console.log(selectedItem);
                            selectedItem.merkmale.forEach(merkmal =>
                                { 
                                    if(vorteil === "Gutes Gedächtnis" && merkmal === "Zauber")
                                        {
                                            apCost = Math.round(apCost*0.75);
                                        }
                                    else if(vorteil === "Eidetisches Gedächtnis" && merkmal === "Zauber")
                                        {
                                            apCost = Math.round(apCost*0.50);
                                        }
                                    
                            });                      
        });
        row.querySelector('.ap-cost').value = apCost;
    });
    totalCost += apCost;
    document.getElementById('total-cost').value = totalCost;

    });

    // Berechnung der AP-Kosten für anderes
    anderesRows.forEach(row => {
        const currentValue = parseInt(row.querySelector('.current-value').value, 10) || 0;
        const desiredValue = parseInt(row.querySelector('.desired-value').value, 10) || 0;
        const steigerungskategorie = row.querySelector('.steigerungskategorie-select').value;



        document.querySelectorAll('.anderes-select').forEach(select => {
            apCost = 0;

            for (let i = currentValue + 1; i <= desiredValue; i++) {
                apCost += getAPCostForStep(i, steigerungskategorie);
            }
            console.log(data);
            selectedItem = data.andere.find(andere => andere.name === select.value);

                    state.profanVorteile.forEach(vorteil =>
                        {
                            console.log(selectedItem);
                            selectedItem.gruppe.forEach(gruppe =>
                                { 
                                    if(vorteil === "Gutes Gedächtnis" && (gruppe === "Ritualkenntnis allgemein"|| gruppe === "Ritualkenntnis Alchimist"|| gruppe === "Ritualkenntnis Scharlatan"|| gruppe === "Liturgiekenntnis"))
                                        {
                                            apCost = Math.round(apCost*0.75);
                                        }
                                    else if(vorteil === "Eidetisches Gedächtnis" && (gruppe === "Ritualkenntnis allgemein"|| gruppe === "Ritualkenntnis Alchimist"|| gruppe === "Ritualkenntnis Scharlatan"|| gruppe === "Liturgiekenntnis"))
                                        {
                                            apCost = Math.round(apCost*0.50);
                                        }      
                            });                      
        });

        row.querySelector('.ap-cost').value = apCost;
    });
    totalCost += apCost;
    document.getElementById('total-cost').value = totalCost;
    });

    

}

function getAPCostForStep(value, category) {
    switch (category) {
        case 'A+':
        apvalue = Math.round(0.8*1*(Math.pow(value,1.2)))-2;
        if(apvalue<=0){apvalue=1}

        return apvalue;

        case 'A':
        apvalue = Math.round(0.8*1*(Math.pow(value,1.2)));
        if(apvalue==49){apvalue=50}

            return apvalue;

        case 'B':
        apvalue = Math.round(0.8*2*(Math.pow(value,1.2)));
        if(apvalue==99){apvalue=100}

            return apvalue;

        case 'C':
        apvalue = Math.round(0.8*3*(Math.pow(value,1.2)));
        if(apvalue==52){apvalue=51}
        if(apvalue==57){apvalue=55}
        if(apvalue==62){apvalue=60}
        if(apvalue==67){apvalue=65}
        if(apvalue==72){apvalue=70}
        if(apvalue==77){apvalue=75}
        if(apvalue==82){apvalue=80}
        if(apvalue==87){apvalue=85}
        if(apvalue==93){apvalue=95}

            return apvalue;

        case 'D':
        apvalue = Math.round(0.8*4*(Math.pow(value,1.2)));
        if(apvalue==51){apvalue=50}
        if(apvalue==57){apvalue=55}
        if(apvalue==63){apvalue=65}
        if(apvalue==69){apvalue=70}
        if(apvalue==76){apvalue=75}
        if(apvalue==83){apvalue=85}
        if(apvalue==89){apvalue=90}
        if(apvalue==96){apvalue=95}
        if(apvalue==103){apvalue=105}
        if(apvalue==117){apvalue=115}
        if(apvalue==124){apvalue=125}
        if(apvalue==174){apvalue=170}
        if(apvalue==197){apvalue=200}

            return apvalue;

        case 'E':
        apvalue = Math.round(0.8*5*(Math.pow(value,1.2)));
        if(apvalue==49){apvalue=48}
        if(apvalue==56){apvalue=55}
        if(apvalue==63){apvalue=65}
        if(apvalue==71){apvalue=70}
        if(apvalue==79){apvalue=80}
        if(apvalue==87){apvalue=85}
        if(apvalue==95){apvalue=95}
        if(apvalue==103){apvalue=105}
        if(apvalue==111){apvalue=110}
        if(apvalue==128){apvalue=130}
        if(apvalue==137){apvalue=135}
        if(apvalue==146){apvalue=145}
        if(apvalue==154){apvalue=155}

            return apvalue;  

        case 'F':
        apvalue = Math.round(0.8*8*(Math.pow(value,1.2)));
        if(apvalue==15){apvalue=14}
        if(apvalue==24){apvalue=22}
        if(apvalue==34){apvalue=32}
        if(apvalue==44){apvalue=41}
        if(apvalue==55){apvalue=50}
        if(apvalue==66){apvalue=60}
        if(apvalue==78){apvalue=75}
        if(apvalue==89){apvalue=85}
        if(apvalue==101){apvalue=95}
        if(apvalue==114){apvalue=105}
        if(apvalue==126){apvalue=120}
        if(apvalue==139){apvalue=130}
        if(apvalue==152){apvalue=140}
        if(apvalue==165){apvalue=155}
        if(apvalue==178){apvalue=165}
        if(apvalue==192){apvalue=180}
        if(apvalue==205){apvalue=195}
        if(apvalue==219){apvalue=210}
        if(apvalue==233){apvalue=220}
        if(apvalue==247){apvalue=230}

            return apvalue; 

        case 'G':
        apvalue = Math.round(0.8*10*(Math.pow(value,1.2)));
        if(apvalue==69){apvalue=70}
        if(apvalue==83){apvalue=85}
        if(apvalue==97){apvalue=95}
        if(apvalue==112){apvalue=110}
        if(apvalue==127){apvalue=125}
        if(apvalue==142){apvalue=140}
        if(apvalue==158){apvalue=160}
        if(apvalue==174){apvalue=175}
        if(apvalue==190){apvalue=190}
        if(apvalue==206){apvalue=210}
        if(apvalue==223){apvalue=220}
        if(apvalue==240){apvalue=240}
        if(apvalue==257){apvalue=260}
        if(apvalue==274){apvalue=270}
        if(apvalue==291){apvalue=290}
        if(apvalue==309){apvalue=310}
        if(apvalue==474){apvalue=480}
        if(apvalue==493){apvalue=500}

            return apvalue; 

        case 'H':
        apvalue = Math.round(0.8*20*(Math.pow(value,1.2)));
        if(apvalue==37){apvalue=35}
        if(apvalue==84){apvalue=85}
        if(apvalue==137){apvalue=140}
        if(apvalue==194){apvalue=195}
        if(apvalue==223){apvalue=220}
        if(apvalue==254){apvalue=250}
        if(apvalue==284){apvalue=280}
        if(apvalue==316){apvalue=320}
        if(apvalue==347){apvalue=350}
        if(apvalue==413){apvalue=410}
        if(apvalue==446){apvalue=450}
        if(apvalue==479){apvalue=480}
        if(apvalue==513){apvalue=510}
        if(apvalue==548){apvalue=550}
        if(apvalue==583){apvalue=580}
        if(apvalue==618){apvalue=620}
        if(apvalue==725){apvalue=720}
        if(apvalue==835){apvalue=830}
        if(apvalue==986){apvalue=1000}

            return apvalue;

        default:
            return 0;
    }
    
}
