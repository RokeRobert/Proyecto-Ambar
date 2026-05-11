// ==========================================
// SECCIÓN DOCENTES: GESTIÓN DE GRUPOS Y CARGA
// ==========================================

GestionCoordinador.prototype.renderDocentesGestion = async function() {
    this.cargarEstilo('css-tablas', '../CSS/TablasDocente.css');    
    this.limpiarPantalla();
    
    this.mainContainer.innerHTML = `
        <div class="modulo-header">
            <div>
                <h2 style="color: var(--azul-obscuro); margin-bottom: 5px;">Asignación de Grupos y Materias</h2>
                <p style="color: #777; font-size: 0.9rem;">Consulte qué grupos cuentan con profesor asignado.</p>
            </div>
            <div class="header-actions">
                <div class="search-container">
                    <i class='bx bx-search'></i>
                    <input type="text" id="busqueda-docente-id" placeholder="Buscar materia o grupo..." onkeyup="coordinador.filtrarDocentes()">
                </div>
                </div>
        </div>

        <div class="tabla-container">
            <table class="tabla-gestion">
                <thead>
                    <tr>
                        <th>Grupo</th>
                        <th>Materia</th>
                        <th>Carrera</th>
                        <th>Estado</th>
                        <th>Profesor Asignado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="lista-docentes-body">
                    <tr><td colspan="6" style="text-align:center;">Cargando...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    try {
        const sesion = JSON.parse(localStorage.getItem("profesorSesion") || "{}");
        const idCoordinador = sesion.id || 0;

        const response = await fetch(`http://localhost:5067/api/coordinador/grupos-asignacion/${idCoordinador}`);
        if (!response.ok) {
            throw new Error('No se pudieron cargar los datos de los grupos.');
        }
        const grupos = await response.json();
        this.dbGrupos = grupos; // Guardamos los datos para usarlos en otras funciones

        const tbody = document.getElementById('lista-docentes-body');
        if (grupos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay grupos para mostrar.</td></tr>';
            return;
        }

        tbody.innerHTML = grupos.map(item => {
            const tieneMaestro = item.profesor !== null && item.profesor !== "";
            const statusClass = tieneMaestro ? "status-active" : "status-inactive";
            const statusText = tieneMaestro ? "CON MAESTRO" : "SIN MAESTRO";
            const profesorNombre = tieneMaestro ? item.profesor : "<em>No asignado</em>";

            return `
            <tr>
                <td><strong>${item.grupo}</strong></td>
                <td>${item.materia}</td>
                <td>${item.carrera}</td>
                <td>
                    <span class="status-badge ${statusClass}" style="${!tieneMaestro ? 'background: #ffebee; color: #c62828;' : ''}">
                        ${statusText}
                    </span>
                </td>
                <td>${profesorNombre}</td>
                <td class="acciones-fila">
                    <button class="btn-icon" title="Asignar/Editar Profesor" onclick="coordinador.editarAsignacionGrupo(${item.id})">
                        <i class='bx bx-edit-alt'></i>
                    </button>
                    <button class="btn-icon delete" title="Remover Profesor" onclick="coordinador.removerProfesorGrupo(${item.id})">
                        <i class='bx bx-user-x'></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');

    } catch (error) {
        document.getElementById('lista-docentes-body').innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">${error.message}</td></tr>`;
    }
};

/**
 * Genera un modal con lista desplegable de docentes
 */
GestionCoordinador.prototype.abrirModalAsignacion = async function(grupo) {
    let opcionesDocentes = '';
    try {
        const sesion = JSON.parse(localStorage.getItem("profesorSesion") || "{}");
        const idCoordinador = sesion.id || 0;

        const response = await fetch(`http://localhost:5067/api/coordinador/docentes/${idCoordinador}`);
        if (!response.ok) throw new Error('No se pudo cargar la lista de docentes.');
        const docentes = await response.json();
        this.dbDocentes = docentes; // Cache for later use if needed

        opcionesDocentes = docentes.map(d => 
            `<option value="${d.id}" ${grupo.profesor === d.nombre ? 'selected' : ''}>${d.nombre}</option>`
        ).join('');

    } catch (error) {
        console.error(error);
        opcionesDocentes = `<option value="">Error al cargar docentes</option>`;
    }

    const modalHTML = `
        <div id="modal-asignacion" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:10000; font-family: 'Poppins', sans-serif;">
            <div style="background:white; padding:25px; border-radius:10px; width:350px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <h3 style="margin-bottom:15px; color:#1a237e; border-bottom: 2px solid #eee; padding-bottom:10px;">Asignar Profesor</h3>
                <p style="font-size:0.85rem; color:#555; margin-bottom:15px;">
                    <strong>Grupo:</strong> ${grupo.grupo}<br>
                    <strong>Materia:</strong> ${grupo.materia}
                </p>
                
                <label style="display:block; font-size:0.8rem; font-weight:bold; margin-bottom:5px;">Seleccione un docente:</label>
                <select id="select-docente" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; margin-bottom:20px;">
                    <option value="">-- Sin asignar --</option>
                    ${opcionesDocentes}
                </select>

                <div style="display:flex; justify-content:center; gap:10px;">
                    <button onclick="document.getElementById('modal-asignacion').remove()" style="padding:8px 15px; border:none; background:#ccc; border-radius:5px; cursor:pointer;">Cancelar</button>
                    <button id="btn-confirmar-asignacion" style="padding:8px 15px; border:none; background:#1a237e; color:white; border-radius:5px; cursor:pointer;">Guardar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('btn-confirmar-asignacion').onclick = async () => {
        const idProfesorSeleccionado = document.getElementById('select-docente').value;
        
        try {
            const response = await fetch(`http://localhost:5067/api/coordinador/grupos/${grupo.id}/asignar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    idProfesor: idProfesorSeleccionado ? parseInt(idProfesorSeleccionado) : null 
                })
            });

            if (!response.ok) {
                // Intentamos leer el cuerpo del error para un mensaje más detallado
                let errorMsg = 'Falló la asignación del profesor.';
                let serverDetails = `Status: ${response.status} ${response.statusText}`;
                try {
                    const errorResult = await response.json();
                    console.error("Respuesta de error del servidor:", errorResult);
                    errorMsg = errorResult.mensaje || errorMsg;
                    serverDetails = `Detalles: ${JSON.stringify(errorResult)}`;
                } catch (e) {
                    console.error("No se pudo parsear la respuesta de error como JSON.");
                }
                throw new Error(`${errorMsg}\n\n[${serverDetails}]`);
            }

            const result = await response.json();
            if (result.success) {
                this.renderDocentesGestion(); // Recargar la tabla
            } else {
                alert(result.mensaje || 'Ocurrió un error.');
            }

        } catch (error) {
            alert(error.message);
        } finally {
            document.getElementById('modal-asignacion').remove();
        }
    };
};

GestionCoordinador.prototype.mostrarAsignacionDocente = function() {
    const idGrupoStr = prompt("Ingrese el ID del Grupo a editar (ej: 1, 2):");
    if (!idGrupoStr) return;

    const id = parseInt(idGrupoStr);
    if (isNaN(id)) {
        alert("Por favor, ingrese un ID numérico.");
        return;
    }

    const grupo = this.dbGrupos.find(g => g.id === id);
    if (grupo) {
        this.abrirModalAsignacion(grupo);
    } else {
        alert("ID de grupo no encontrado.");
    }
};

GestionCoordinador.prototype.editarAsignacionGrupo = function(id) {
    const grupo = this.dbGrupos.find(g => g.id === id);
    if (!grupo) return;
    this.abrirModalAsignacion(grupo);
};

GestionCoordinador.prototype.removerProfesorGrupo = async function(id) {
    if (confirm("¿Desea quitar al profesor asignado y dejar el grupo como vacante?")) {
        try {
            const response = await fetch(`http://localhost:5067/api/coordinador/grupos/${id}/asignar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idProfesor: null })
            });

            if (!response.ok) {
                // Intentamos leer el cuerpo del error para un mensaje más detallado
                let errorMsg = 'Falló la remoción del profesor.';
                let serverDetails = `Status: ${response.status} ${response.statusText}`;
                try {
                    const errorResult = await response.json();
                    console.error("Respuesta de error del servidor:", errorResult);
                    errorMsg = errorResult.mensaje || errorMsg;
                    serverDetails = `Detalles: ${JSON.stringify(errorResult)}`;
                } catch (e) {
                    console.error("No se pudo parsear la respuesta de error como JSON.");
                }
                throw new Error(`${errorMsg}\n\n[${serverDetails}]`);
            }

            const result = await response.json();
            if (result.success) {
                this.renderDocentesGestion(); // Recargar la tabla
            } else {
                alert(result.mensaje || 'Ocurrió un error.');
            }

        } catch (error) {
            alert(error.message);
        }
    }
};

GestionCoordinador.prototype.filtrarDocentes = function() {
    let input = document.getElementById('busqueda-docente-id').value.toLowerCase();
    let rows = document.querySelectorAll('#lista-docentes-body tr');
    rows.forEach(row => {
        let text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? '' : 'none';
    });
};