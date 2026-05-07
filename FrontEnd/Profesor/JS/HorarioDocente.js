/* ==========================================
   2. ESTADO DE LA APP
   ========================================== */
const AppState = {
    vista: 'horario', // 'horario', 'detalle', 'editar'
    horario: [], // Almacenará los datos del horario obtenidos de la API
    materia: null,
    grupo: null,
    idGrupo: null, // <-- ID del grupo para las llamadas a la API
    tipoEditor: null,
    itemsEditor: [],
    indiceEdicion: -1, // <--- AGREGA ESTA LÍNEA AQUÍ
    idContenedor: 'contenedor-ambar' // El nombre que elegimos
};

/* ==========================================
   3. RENDERIZADOR PRINCIPAL
   ========================================== */
function renderizarApp() {
    const root = document.getElementById(AppState.idContenedor);
    if (!root) return;

    root.innerHTML = ''; // Limpiar pantalla

    if (AppState.vista === 'horario') {
        root.innerHTML = vistaHorario();
    } else if (AppState.vista === 'detalle') {
        root.innerHTML = vistaDetalle();
    } else if (AppState.vista === 'editar') {
        root.innerHTML = vistaEditor();
        renderizarListaItems(); // Inyectar items guardados
    }
}

/* ==========================================
   4. PLANTILLAS DE VISTAS (HTML en JS)
   ========================================== */

// --- VISTA: HORARIO ---
function vistaHorario() {
    const horarioData = AppState.horario || [];

    if (horarioData.length === 0) {
        return `
        <section class="main-content">
            <div class="header-horario">
                <div>
                    <h1>Mi Horario</h1>
                    <p class="periodo">Periodo: <strong>2026 ENE-JUN</strong></p>
                </div>
            </div>
            <div class="card-horario" style="text-align:center; padding: 40px;">
                <p>No tienes un horario asignado para el periodo actual.</p>
            </div>
        </section>`;
    }

    const filas = horarioData.map(f => `
        <tr>
            <td class="hora-col"><strong>${f.hora}</strong></td>
            ${['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map(dia => {
                const c = f[dia];
                return c ? `
                    <td class="${c.color}">
                        <a class="materia-card" onclick="irADetalle('${c.nombre}', '${c.grupo}', ${c.idGrupo})" style="cursor:pointer">
                            <span class="materia-nombre">${c.nombre}</span>
                            <div class="materia-info"><span>${c.grupo}</span></div>
                            <div class="materia-info"><span>Aula ${c.aula}</span></div>
                        </a>
                    </td>` : `<td></td>`;
            }).join('')}
        </tr>
    `).join('');

    return `
        <section class="main-content">
            <div class="header-horario">
                <div>
                    <h1>Mi Horario</h1>
                    <p class="periodo">Periodo: <strong>2026 ENE-JUN</strong></p>
                </div>
                <button class="btn-materia" onclick="exportarPDF()"><i class='bx bx-download'></i> Descargar</button>
            </div>
            <div class="card-horario">
                <table>
                    <thead><tr><th>Hora</th><th>Lunes</th><th>Martes</th><th>Mié</th><th>Jue</th><th>Vie</th></tr></thead>
                    <tbody>${filas}</tbody>
                </table>
            </div>
        </section>`;
}

// --- VISTA: DETALLE ---
function vistaDetalle() {
    const opciones = [
        { t: 'Instrumentación', p: 'Criterios de evaluación.', i: 'bx-file' },
        { t: 'Planeación', p: 'Cronograma y temas.', i: 'bx-calendar-alt' },
        { t: 'Apoyo Didáctico', p: 'Recursos extra.', i: 'bx-folder-open' },
        { t: 'Fuentes de Información', p: 'Bibliografías.', i: 'bx-book-bookmark' }
    ];

    return `
        <main class="main-content">
            <div class="header-top">
                <button class="btn-back-blue" onclick="cambiarVista('horario')"><i class='bx bx-chevron-left'></i></button>
                <div class="header-textos">
                    <h1>${AppState.materia}</h1>
                    <span class="badge-grupo">${AppState.grupo}</span>
                </div>
            </div>
            <div class="grid-gestion">
                ${opciones.map(opt => `
                    <div class="card-gestion">
                        <div class="card-header-gestion">
                            <i class='bx ${opt.i}'></i>
                            <h3>${opt.t}</h3>
                        </div>
                        <p>${opt.p}</p>
                        <button class="btn-editar" onclick="irAEditor('${opt.t}')">Detalles</button>
                    </div>
                `).join('')}
            </div>
        </main>`;
}

// --- VISTA: EDITOR ---
function vistaEditor() {
    return `
        <main class="main-content">
            <div class="header-top">
                <button class="btn-back-blue" onclick="cambiarVista('detalle')"><i class='bx bx-chevron-left'></i></button>
                <div class="header-textos">
                    <h1>${AppState.tipoEditor}</h1>
                    <span class="subtitulo-editar">Editor de contenido</span>
                </div>
            </div>
            <div class="card-horario">
                <div class="form-editar">
                    <input type="text" id="tit-edit" placeholder="Título" style="width:100%; padding:10px; margin-bottom:10px;">
                    <textarea id="cont-edit" placeholder="Contenido..." style="width:100%; height:100px; padding:10px; margin-bottom:10px;"></textarea>
                    <div class="botones-acciones" style="margin-top:10px;">
                        <button onclick="guardarDato()" style="background:#1A237E; color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">Guardar</button>
                        <button onclick="borrarDato()" style="background:#e53935; color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">Eliminar</button>
                    </div>
                </div>
                <ul id="lista-dinamica" style="list-style:none; padding:0; margin-top:20px;"></ul>
            </div>
        </main>`;
        return `
        <main class="main-content">
            </main>

        <div id="modal-confirmar" class="modal-alert">
            <div class="alert-content">
                <div class="alert-icon"><i class='bx bx-error-circle'></i></div>
                <h2>¿Estás seguro?</h2>
                <p id="alert-mensaje">Se eliminarán los elementos seleccionados permanentemente.</p>
                <div class="alert-btns">
                    <button class="btn-cancel" onclick="cerrarAlerta()">Cancelar</button>
                    <button class="btn-confirm" onclick="confirmarEliminacion()">Eliminar</button>
                </div>
            </div>
        </div>`;
}

/* ==========================================
   5. FUNCIONES DE CONTROL
   ========================================== */

/**
 * Transforma la lista plana de items de horario de la API a una estructura agrupada por hora.
 * @param {Array} apiData - Los datos crudos de la API.
 * @returns {Array} - Un arreglo de objetos, donde cada objeto representa una fila de hora.
 */
function transformarHorario(apiData) {
    const horarioAgrupado = {};
    const diasSemana = {
        "Lunes": "lunes",
        "Martes": "martes",
        "Miércoles": "miercoles",
        "Miercoles": "miercoles",
        "Jueves": "jueves",
        "Viernes": "viernes"
    };
    const colorMap = {};
    let colorIndex = 0;
    const coloresDisponibles = ["border-azul", "border-verde"]; // Colores definidos en HorarioDocente.css

    apiData.forEach(item => {
        // Extraer la hora en formato HH:mm del string "HH:mm:ss"
        const hora = item.horaInicio.substring(0, 5);
        const dia = diasSemana[item.diaSemana];

        if (!dia) return; // Ignorar días no válidos como Sábado o Domingo

        // Si es la primera vez que vemos esta hora, creamos la fila
        if (!horarioAgrupado[hora]) {
            horarioAgrupado[hora] = { hora, lunes: null, martes: null, miercoles: null, jueves: null, viernes: null };
        }

        // Asignar un color consistente a cada materia
        if (!colorMap[item.nombreMateria]) {
            colorMap[item.nombreMateria] = coloresDisponibles[colorIndex % coloresDisponibles.length];
            colorIndex++;
        }

        // Crear el objeto de la clase y asignarlo al día y hora correctos
        horarioAgrupado[hora][dia] = {
            idGrupo: item.idGrupo,
            nombre: item.nombreMateria,
            grupo: item.grupo,
            aula: item.aula,
            color: colorMap[item.nombreMateria]
        };
    });

    // Convertir el objeto de horas en un array y ordenarlo cronológicamente
    return Object.values(horarioAgrupado).sort((a, b) => a.hora.localeCompare(b.hora));
}

function cambiarVista(nuevaVista) {
    AppState.vista = nuevaVista;
    renderizarApp();
}

function irADetalle(materia, grupo, idGrupo) {
    AppState.materia = materia;
    AppState.grupo = grupo;
    AppState.idGrupo = idGrupo;
    cambiarVista('detalle');
}

/**
 * Mapea los nombres de las secciones a un identificador para la API.
 * @param {string} tipo - El nombre de la sección (ej. "Apoyo Didáctico").
 * @returns {string} - El identificador para la API (ej. "material_didactico").
 */
function getTipoApi(tipo) {
    switch (tipo) {
        case 'Instrumentación': return 'instrumentacion';
        case 'Planeación': return 'planeacion';
        case 'Apoyo Didáctico': return 'material_didactico';
        case 'Fuentes de Información': return 'fuentes_informacion';
        default: return tipo.toLowerCase().replace(/\s+/g, '_');
    }
}

async function irAEditor(tipo) {
    // VALIDACIÓN: Asegurarse de que tenemos un ID de grupo válido antes de continuar.
    if (!AppState.idGrupo || AppState.idGrupo <= 0) {
        alert("Error: No se ha podido identificar el grupo. Por favor, recargue la página e intente de nuevo.");
        cambiarVista('detalle'); // Volver a la vista anterior
        return;
    }

    AppState.tipoEditor = tipo;
    AppState.indiceEdicion = -1;
    AppState.itemsEditor = []; // Limpiar datos anteriores
    cambiarVista('editar');

    // Mostrar estado de carga mientras se obtienen los datos
    const listaEl = document.getElementById('lista-dinamica');
    if (listaEl) listaEl.innerHTML = '<p style="color:gray; text-align:center;">Cargando contenido...</p>';

    try {
        const tipoApi = getTipoApi(tipo);
        const url = `http://localhost:5067/api/profesores/grupos/${AppState.idGrupo}/contenido/${tipoApi}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo cargar el contenido.`);
        }

        const data = await response.json();
        AppState.itemsEditor = data || [];
        renderizarListaItems(); // Renderizar la lista con los datos de la API
    } catch (error) {
        console.error('Error al cargar datos del editor:', error);
        if (listaEl) listaEl.innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
        AppState.itemsEditor = []; // Resetear en caso de error
    }
}

function renderizarListaItems() {
    const lista = document.getElementById('lista-dinamica');
    if (!lista) return;

    lista.innerHTML = AppState.itemsEditor.map((item, i) => `
        <div class="fuente-item-container">
            <div class="fuente-item-header">
                <div class="fuente-titulo-seccion">
                    <input type="checkbox" class="check-eliminar" data-index="${i}" style="margin-right: 10px; cursor: pointer;">
                    <strong>${item.titulo}</strong>
                </div>
                <div class="fuente-acciones">
                    <button class="btn-accion-item edit" onclick="cargarParaEditar(${i})" title="Editar">
                        <i class='bx bx-edit-alt'></i>
                    </button>
                    <button class="btn-accion-item toggle" onclick="toggleAcordeon(${i})" title="Ver más">
                        <i class='bx bx-chevron-down' id="icon-ar-bit-${i}"></i>
                    </button>
                </div>
            </div>
            <div class="fuente-item-body" id="body-item-${i}">
                <p>${item.contenido}</p>
            </div>
        </div>
    `).join('') || '<p style="color:gray; text-align:center;">No hay registros aún.</p>';
}

function cargarParaEditar(index) {
    const item = AppState.itemsEditor[index];
    document.getElementById('tit-edit').value = item.titulo;
    document.getElementById('cont-edit').value = item.contenido;
    
    // Guardamos el índice en el cerebro de la App
    AppState.indiceEdicion = index; 
    
    // Subir el scroll para que el usuario vea los campos llenos
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Función para el acordeón (desplegar)
function toggleAcordeon(index) {
    const body = document.getElementById(`body-item-${index}`);
    const icon = document.getElementById(`icon-ar-bit-${index}`);
    
    body.classList.toggle('open');
    icon.classList.toggle('rotate');
}

/**
 * Envía el estado actual de `itemsEditor` a la base de datos.
 */
async function sincronizarConBD() {
    const tipoApi = getTipoApi(AppState.tipoEditor);
    const url = `http://localhost:5067/api/profesores/grupos/${AppState.idGrupo}/contenido/${tipoApi}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(AppState.itemsEditor),
        });

        // Leemos el cuerpo de la respuesta, sea exitosa o no.
        const result = await response.json();

        // Si la respuesta no fue OK (status 2xx), o si el cuerpo indica que no fue exitoso.
        if (!response.ok || !result.success) {
            // Construimos un mensaje de error detallado.
            const serverMessage = result.mensaje || 'Error desconocido del servidor.';
            const detailedError = result.error ? ` Detalles: ${result.error}` : '';
            throw new Error(`${serverMessage}${detailedError}`);
        }
        
        console.log('Sincronizado con la BD exitosamente.');

    } catch (error) {
        console.error('Error al sincronizar con la BD:', error);
        alert(`Error al guardar: ${error.message}`);
        // Aquí se podría implementar una lógica para revertir el cambio local si falla el guardado
    }
}

async function guardarDato() {
    const t = document.getElementById('tit-edit').value;
    const c = document.getElementById('cont-edit').value;
    
    if (!t || !c) return alert("Por favor llena los campos");

    if (AppState.indiceEdicion > -1) {
        AppState.itemsEditor[AppState.indiceEdicion] = { titulo: t, contenido: c };
        AppState.indiceEdicion = -1;
    } else {
        AppState.itemsEditor.push({ titulo: t, contenido: c });
    }

    // Limpiar campos del formulario
    document.getElementById('tit-edit').value = '';
    document.getElementById('cont-edit').value = '';
    
    // Actualizar la lista visual y luego sincronizar con la BD
    renderizarListaItems();
    await sincronizarConBD();
}

async function borrarDato() {
    const checkboxes = document.querySelectorAll('.check-eliminar:checked');
    
    if (checkboxes.length === 0) {
        return alert("Por favor, selecciona al menos un elemento para eliminar.");
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar ${checkboxes.length} elementos?`)) return;

    const indicesAEliminar = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));

    AppState.itemsEditor = AppState.itemsEditor.filter((_, index) => !indicesAEliminar.includes(index));

    AppState.indiceEdicion = -1;
    
    // Actualizar la lista visual y luego sincronizar con la BD
    renderizarListaItems();
    await sincronizarConBD();
}

function exportarPDF() {
    const element = document.querySelector(".card-horario");
    html2pdf().set({ margin: 10, filename: 'Horario.pdf' }).from(element).save();
}

// ARRANQUE INICIAL
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si hay una sesión activa
    const sesionJSON = localStorage.getItem("profesorSesion");
    const root = document.getElementById(AppState.idContenedor);

    if (!sesionJSON) {
        if (root) root.innerHTML = `<p style="text-align:center; padding: 40px; color: red;">Error: Sesión no encontrada. Por favor, inicie sesión de nuevo.</p>`;
        // Opcional: redirigir al login tras un momento
        // setTimeout(() => window.location.href = "/FrontEnd/Profesor/HTML/LoginProfesor.html", 2000);
        return;
    }

    const sesion = JSON.parse(sesionJSON);
    const profesorId = sesion.id;

    // 2. Cargar datos del horario desde la API
    try {
        if (root) root.innerHTML = `<p style="text-align:center; padding: 40px;">Cargando horario...</p>`;
        const response = await fetch(`http://localhost:5067/api/profesores/${profesorId}/horario`);
        if (!response.ok) {
            throw new Error(`No se pudo cargar el horario (Error: ${response.status})`);
        }
        const horarioDataAPI = await response.json();

        // 3. Transformar datos y guardarlos en el estado de la app
        AppState.horario = transformarHorario(horarioDataAPI);
        renderizarApp(); // 4. Renderizar la aplicación con los datos reales
    } catch (error) {
        console.error("Error al cargar el horario:", error);
        if (root) root.innerHTML = `<p style="text-align:center; padding: 40px; color: red;">${error.message}</p>`;
    }
});