        // Funktion, um JSON-Daten zu laden
        async function loadJson(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Fehler beim Laden der JSON: ${response.statusText}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Fehler beim Abrufen der Daten:', error);
                return null;
            }
        }

        async function init() {
            const regionenData = await loadJson('regionen.json');
            if (!regionenData) return;
            const pflanzenData = await loadJson('pflanzen.json');
            if (!pflanzenData) return;
            const tiereData = await loadJson('tiere.json');
            if (!tiereData) return;

            const regionenDropdown = document.getElementById('regionenDropdown');
            const gebietDropdown = document.getElementById('gebietDropdown');
            const aktivitaetDropdown = document.getElementById('aktivitaetDropdown');
            const nameDropdown = document.getElementById('nameDropdown');
            const detailsDiv = document.getElementById('details');

            const aktivitaeten = ["Jagd", "Kräutersuche", "Fallenstellen", "Fischen"];

            // Regionen-Dropdown füllen
            regionenData.regionen.forEach(regionObj => {
                const key = Object.keys(regionObj)[0];
                const option = document.createElement('option');
                option.value = key;
                option.textContent = key;
                regionenDropdown.appendChild(option);
            });

            regionenDropdown.addEventListener('change', () => {
                const selectedRegion = regionenDropdown.value;

                gebietDropdown.innerHTML = '<option value="" disabled selected>-- Gebiet auswählen --</option>';
                aktivitaetDropdown.innerHTML = '<option value="" disabled selected>-- Aktivität auswählen --</option>';
                nameDropdown.innerHTML = '<option value="" disabled selected>-- Namen auswählen --</option>';
                aktivitaetDropdown.disabled = true;
                nameDropdown.disabled = true;

                const selectedRegionData = regionenData.regionen.find(regionObj => Object.keys(regionObj)[0] === selectedRegion)[selectedRegion];

                const gebiete = new Set();
                selectedRegionData.forEach(category => {
                    if (category.Tiere) {
                        category.Tiere.forEach(tier => {
                            if (tier.Gebiet) gebiete.add(tier.Gebiet);
                        });
                    }
                    if (category.Pflanzen) {
                        category.Pflanzen.forEach(pflanze => {
                            if (pflanze.Gebiet) gebiete.add(pflanze.Gebiet);
                        });
                    }
                });

                gebiete.forEach(gebiet => {
                    const option = document.createElement('option');
                    option.value = gebiet;
                    option.textContent = gebiet;
                    gebietDropdown.appendChild(option);
                });

                detailsDiv.innerHTML = `<h2>Region: ${selectedRegion}</h2>`;
            });

            gebietDropdown.addEventListener('change', () => {
                const selectedGebiet = gebietDropdown.value;
                aktivitaetDropdown.disabled = false;

                aktivitaetDropdown.innerHTML = '<option value="" disabled selected>-- Aktivität auswählen --</option>';
                aktivitaeten.forEach(aktivitaet => {
                    const option = document.createElement('option');
                    option.value = aktivitaet;
                    option.textContent = aktivitaet;
                    aktivitaetDropdown.appendChild(option);
                });

                detailsDiv.innerHTML = `<h2>Region: ${regionenDropdown.value}</h2><h3>Gebiet: ${selectedGebiet}</h3>`;
            });

            aktivitaetDropdown.addEventListener('change', async () => {
                const selectedAktivitaet = aktivitaetDropdown.value;
                const selectedRegion = regionenDropdown.value;
                const selectedGebiet = gebietDropdown.value;
                const selectedRegionData = regionenData.regionen.find(regionObj => Object.keys(regionObj)[0] === selectedRegion)[selectedRegion];
                detailsDiv.innerHTML = `
                    <h2>Region: ${regionenDropdown.value}</h2>
                    <h3>Gebiet: ${gebietDropdown.value}</h3>
                    <h4>Aktivität: ${selectedAktivitaet}</h4>
                `;
                let daten;
                nameDropdown.disabled = false;
                nameDropdown.innerHTML = '<option value="" disabled selected>-- Namen auswählen --</option>';
                if (selectedAktivitaet === "Jagd") {
                    daten = selectedRegionData[0];
                
                    daten.Tiere?.forEach(item => 
                        {

                            if(item.Gebiet === selectedGebiet || item.Gebiet === "")
                                {
                                    const option = document.createElement('option');
                                    option.value = item.Name;
                                    option.textContent = item.Name;
                                    nameDropdown.appendChild(option);
                                    let tierdat = tiereData.Tiere.find(tier => tier.Name === item.Name);
                                    console.log(tierdat.Name);
                                    let jagbar;
                                    if(tierdat.Jagd==="")
                                        {
                                            jagbar=true;
                                        }
                                    else
                                    {
                                        jagbar=false
                                    }
                                    detailsDiv.innerHTML += `<h5>Name: ${tierdat.Name} Jagbar: ${jagbar} Jagdschwierigkeit: ${tierdat.Jagd}</h5>`;

                                }
                        
                        }
                    );
                } else if (selectedAktivitaet === "Kräutersuche") {
                    daten = selectedRegionData[1];
                    daten.Pflanzen?.forEach(item => {
                        if(item.Gebiet === selectedGebiet || item.Gebiet === "")
                            {
                                const option = document.createElement('option');
                                option.value = item.Name;
                                option.textContent = item.Name;
                                nameDropdown.appendChild(option);
                            }
                        
                    });
                }

            



            });

            nameDropdown.addEventListener('change', () => {
                const selectedName = nameDropdown.value;
                detailsDiv.innerHTML += `<h5>Ausgewählter Name: ${selectedName}</h5>`;

            });
        }


        init();
