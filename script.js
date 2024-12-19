let professionals = [];

// Aggiungi professionista
document.getElementById('add-professional').addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const role = document.getElementById('role').value.trim();
    const department = document.getElementById('department').value.trim();

    if (name && role && department) {
        professionals.push({ name, role, department, time: '' });
        renderTable();
        clearForm();
    } else {
        alert("Compila tutti i campi.");
    }
});

// Importa dati dal textarea
document.getElementById('import-data').addEventListener('click', () => {
    const data = document.getElementById('data-textarea').value.trim();
    if (!data) {
        alert("Nessun dato inserito!");
        return;
    }

    const rows = data.split('\n');
    professionals = rows.map(row => {
        const [role, name, department, time] = row.split(',');
        return { role: role.trim(), name: name.trim(), department: department.trim(), time: (time || '').trim() };
    });

    renderTable();
});

// Esporta dati nel textarea
document.getElementById('export-data').addEventListener('click', () => {
    const data = professionals
        .map(pro => `${pro.role}, ${pro.name}, ${pro.department}, ${pro.time}`)
        .join('\n');
    document.getElementById('data-textarea').value = data;
});

// Imposta orario per tutti
document.getElementById('set-all-time').addEventListener('click', () => {
    const time = document.getElementById('default-time').value;
    if (time) {
        professionals.forEach(pro => {
            if (!pro.custom) { // Ignora le celle personalizzate
                pro.time = time;
            }
        });
        renderTable();
    }
});

// Imposta orario per reparto
document.getElementById('set-department-time').addEventListener('click', () => {
    const time = document.getElementById('default-time').value;
    const department = document.getElementById('set-department').value.trim();
    if (time && department) {
        professionals.forEach(pro => {
            if (pro.department === department && !pro.custom) { // Ignora le celle personalizzate
                pro.time = time;
            }
        });
        renderTable();
    }
});

// Raggruppa per reparto e impagina i blocchi
function groupByDepartment() {
    const departments = {};
    professionals.forEach(pro => {
        if (!departments[pro.department]) departments[pro.department] = [];
        departments[pro.department].push(pro);
    });
    return Object.values(departments);
}

// Render della tabella
function distributeDepartments(columnsCount = 3) {
    const departmentGroups = groupByDepartment();
    const columnHeights = Array(columnsCount).fill(0);
    const columns = Array.from({ length: columnsCount }, () => []);

    departmentGroups.forEach(group => {
        const groupHeight = group.length;

        // Trova la colonna con altezza minima
        let minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights));

        // Aggiungi il gruppo alla colonna e aggiorna l'altezza
        columns[minHeightIndex].push(group);
        columnHeights[minHeightIndex] += groupHeight;
    });

    return columns;
}

// Calcola l'altezza di ogni reparto
function calculateHeights(departmentGroups) {
    return departmentGroups.map(group => group.length);
}

// Distribuisci i reparti nelle colonne
function distributeDepartments(departmentGroups) {
    const columnCount = 3;
    const columns = Array.from({ length: columnCount }, () => []);
    let currentColumn = 0;

    departmentGroups.forEach((group, index) => {
        columns[currentColumn].push({ group, index });
        currentColumn = (currentColumn + 1) % columnCount;
    });

    return columns;
}

// Render della tabella
function renderTable() {
    const tbody = document.querySelector('#main-table tbody');
    tbody.innerHTML = '';

    // Raggruppa i professionisti per reparto
    const departmentGroups = groupByDepartment();

    // Calcola la lunghezza totale (numero di righe)
    const totalRows = departmentGroups.reduce((sum, group) => sum + 1 + Math.ceil(group.length / 3), 0);
    const targetRowsPerColumn = Math.ceil(totalRows / 3);

    // Distribuzione dei reparti nelle colonne mantenendo l'ordine
    const columns = [[], [], []];
    let currentCol = 0;
    let currentRowCount = 0;

    departmentGroups.forEach(group => {
        const groupRows = 1 + Math.ceil(group.length / 3); // Include la riga del titolo

        // Se superiamo il target per la colonna corrente, passa alla successiva
        if (currentRowCount + groupRows > targetRowsPerColumn && currentCol < 2) {
            currentCol++;
            currentRowCount = 0;
        }

        // Aggiungi il reparto alla colonna corrente
        columns[currentCol].push({ department: group[0].department, isHeader: true });
        group.forEach(member => {
            columns[currentCol].push(member);
        });

        // Aggiorna il conteggio delle righe nella colonna
        currentRowCount += groupRows;
    });

    // Determina il numero massimo di righe tra tutte le colonne
    const maxRows = Math.max(...columns.map(col => col.length));

    // Costruisce la tabella riga per riga
    for (let i = 0; i < maxRows; i++) {
        const row = document.createElement('tr');

        const cellData = columns.flat()[i]; // Colonna piatta per linearità
        if (cellData && !cellData.isHeader) {
            const index = professionals.findIndex(pro =>
                pro.name === cellData.name &&
                pro.role === cellData.role &&
                pro.department === cellData.department
            );
            row.setAttribute('data-index', index); // Aggiungi l'indice ai dati
        }

        for (let col = 0; col < 3; col++) {
            const cellData = columns[col][i] || null;

            if (cellData) {
                if (cellData.isHeader) {
                    row.innerHTML += `
              <td class="header-cell">
                ${cellData.department}
              </td>
              <td class="header-cell">
              </td>
              <td class="header-cell time-cell">
                CALL
              </td>`;
                } else {
                    row.innerHTML += `
            <td class="role-cell" data-index="${professionals.indexOf(cellData)}">${cellData.role || ''}</td>
            <td class="name-cell" data-index="${professionals.indexOf(cellData)}">${cellData.name || ''}</td>
            <td class="time-cell" data-index="${professionals.indexOf(cellData)}">${cellData.time || ''}</td>`;
                }
            } else {
                // Celle vuote per mantenere l'allineamento
                row.innerHTML += '<td></td><td></td><td></td>';
            }
        }

        tbody.appendChild(row);
    }
    addEventListeners();
}


// Aggiunge eventi di modifica orario
function addEventListeners() {
    const rows = document.querySelectorAll('#main-table tbody tr');
    rows.forEach(row => {
        // Aggiungi listener per ogni cella
        row.querySelectorAll('td').forEach((cell, cellIndex) => {
            // Calcola il blocco (set di 3 colonne)
            const blockIndex = Math.floor(cellIndex / 3);

            cell.addEventListener('mouseover', () => {
                // Evidenzia solo il blocco interessato
                for (let i = blockIndex * 3; i < blockIndex * 3 + 3; i++) {
                    if (row.children[i]) row.children[i].classList.add('highlight');
                }
            });

            cell.addEventListener('mouseout', () => {
                // Rimuovi l'evidenziazione dal blocco interessato
                for (let i = blockIndex * 3; i < blockIndex * 3 + 3; i++) {
                    if (row.children[i]) row.children[i].classList.remove('highlight');
                }
            });
        });

        row.querySelectorAll('td.time-cell:not(.header-cell)').forEach(cell => {
            cell.addEventListener('click', () => {
                const newContent = prompt("Inserisci un nuovo valore (orario o testo):", cell.textContent);
                if (newContent) {
                    const proIndex = parseInt(cell.getAttribute('data-index'), 10); // Usa data-index
        
                    if (!isNaN(proIndex) && professionals[proIndex]) {
                        professionals[proIndex].time = newContent; // Aggiorna il valore nella struttura dati
                        professionals[proIndex].custom = true; // Contrassegna come personalizzato
                        console.log(`Aggiornato professionista:`, professionals[proIndex]); // Log di debug
                        renderTable(); // Rerender con i dati aggiornati
                    } else {
                        console.error("Errore: Indice non valido o professionista non trovato");
                    }
                }
            });
        });        
        
    });
}


// Pulisce il form
function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('role').value = '';
    document.getElementById('department').value = '';
}