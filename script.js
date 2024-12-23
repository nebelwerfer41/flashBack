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
            if (!pro.locked) { // Ignora le celle personalizzate
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
            if (pro.department === department && !pro.locked) { // Ignora le celle personalizzate
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
                    const roleCell = document.createElement('td');
                    roleCell.classList.add('role-cell');
                    roleCell.textContent = cellData.role || '';

                    const nameCell = document.createElement('td');
                    nameCell.classList.add('name-cell');
                    nameCell.textContent = cellData.name || '';

                    const timeCell = document.createElement('td');
                    timeCell.classList.add('time-cell');
                    timeCell.dataset.index = professionals.indexOf(cellData);
                    timeCell.style.position = 'relative';

                    if (cellData.locked) {
                        timeCell.classList.add('locked');
                    } else {
                        timeCell.classList.remove('locked');
                    }

                    const span = document.createElement('span');
                    span.textContent = cellData.time || '';
                    span.style.display = 'inline-block';
                    span.style.width = '50px'; // Dimensione fissa
                    span.style.textAlign = 'center';

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = cellData.time || '';
                    input.style.width = '50px'; // Stessa dimensione della cella
                    input.style.textAlign = 'center';
                    input.style.display = 'none';
                    input.maxLength = 5; // Limite di caratteri

                    const lockIcon = document.createElement('span');
                    lockIcon.textContent = cellData.locked ? '🔒' : '🔓';
                    lockIcon.classList.add('lock-icon');
                    lockIcon.style.position = 'absolute';
                    lockIcon.style.top = '50%';
                    lockIcon.style.transform = 'translateY(-50%)';
                    lockIcon.style.display = 'none'; // Mostrato solo con mouseover

                    // Mostra il lucchetto al passaggio del mouse
                    timeCell.addEventListener('mouseenter', () => {
                        lockIcon.style.display = 'inline';
                    });

                    timeCell.addEventListener('mouseleave', () => {
                        lockIcon.style.display = 'none';
                    });

                    // Toggle blocco/sblocco
                    lockIcon.addEventListener('click', (event) => {
                        event.stopPropagation(); // Previeni conflitti con la modifica
                        cellData.locked = !cellData.locked;
                        lockIcon.textContent = cellData.locked ? '🔒' : '🔓';
                        timeCell.classList.toggle('locked', cellData.locked);
                    });

                    // Mostra input per la modifica
                    timeCell.addEventListener('click', () => {
                        if (!cellData.locked) {
                            span.style.display = 'none';
                            input.style.display = 'inline';
                            input.focus();
                        }
                    });

                    // Salva modifica
                    input.addEventListener('blur', () => {
                        cellData.time = input.value.trim();
                        input.style.display = 'none';
                        span.textContent = cellData.time || '';
                        span.style.display = 'inline-block';
                    });

                    input.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter') {
                            cellData.time = input.value.trim();
                            input.style.display = 'none';
                            span.textContent = cellData.time || '';
                            span.style.display = 'inline-block';
                        }
                    });

                    timeCell.appendChild(span);
                    timeCell.appendChild(input);
                    timeCell.appendChild(lockIcon);

                    row.appendChild(roleCell);
                    row.appendChild(nameCell);
                    row.appendChild(timeCell);
                }
            } else {
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



    });
}


// Pulisce il form
function clearForm() {
    document.getElementById('name').value = '';
    document.getElementById('role').value = '';
    document.getElementById('department').value = '';
}