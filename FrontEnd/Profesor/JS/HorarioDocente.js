/* ==========================================
   1. DATOS SIMULADOS (Simulando DB)
   ========================================== */
const HORARIO_DATA = [
    {
        hora: "19:00",
        lunes: { nombre: "Análisis Avanzado", grupo: "5CD-2A", aula: "12", color: "border-azul" },
        martes: { nombre: "Desarrollo Software", grupo: "5CF-2A", aula: "12", color: "border-verde" },
        miercoles: null, jueves: null, viernes: null
    },
    {
        hora: "20:00",
        lunes: null, martes: null,
        miercoles: { nombre: "Análisis Avanzado", grupo: "5CD-2A", aula: "12", color: "border-azul" },
        jueves: { nombre: "Desarrollo Software", grupo: "5CF-2A", aula: "12", color: "border-verde" },
        viernes: null
    }
];

/* ==========================================
   2. ESTADO DE LA APP
   ========================================== */
const AppState = {
    vista: 'horario', // 'horario', 'detalle', 'editar'
    materia: null,
    grupo: null,
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
    const filas = HORARIO_DATA.map(f => `
        <tr>
            <td class="hora-col"><strong>${f.hora}</strong></td>
            ${['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map(dia => {
                const c = f[dia];
                return c ? `
                    <td class="${c.color}">
                        <div class="materia-card" onclick="irADetalle('${c.nombre}', '${c.grupo}')" style="cursor:pointer">
                            <span class="materia-nombre">${c.nombre}</span>
                            <div class="materia-info"><span>${c.grupo}</span></div>
                            <div class="materia-info"><span>Aula ${c.aula}</span></div>
                        </div>
                    </td>` : `<td></td>`;
            }).join('')}
        </tr>
    `).join('');

    return `
        <section class="main-content">
            <div class="header-horario">
                <div>
                    <h1>Mi Horario</h1>
                    <p>Periodo: <strong>2026 ENE-JUN</strong></p>
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
                    <textarea id="cont-edit" placeholder="Contenido..." style="width:100%; height:100px; padding:10px;"></textarea>
                    <div style="margin-top:10px;">
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

function cambiarVista(nuevaVista) {
    AppState.vista = nuevaVista;
    renderizarApp();
}

function irADetalle(materia, grupo) {
    AppState.materia = materia;
    AppState.grupo = grupo;
    cambiarVista('detalle');
}

function irAEditor(tipo) {
    AppState.tipoEditor = tipo;
    AppState.indiceEdicion = -1; // Resetear siempre al entrar
    const llave = `${AppState.materia}_${tipo}`;
    AppState.itemsEditor = JSON.parse(localStorage.getItem(llave)) || [];
    cambiarVista('editar');
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

function guardarDato() {
    const t = document.getElementById('tit-edit').value;
    const c = document.getElementById('cont-edit').value;
    
    if (!t || !c) return alert("Por favor llena los campos");

    // REVISAR SI ESTAMOS EDITANDO O CREANDO NUEVO
    if (AppState.indiceEdicion > -1) {
        // EDITAR: Reemplazamos los datos en la posición que ya existe
        AppState.itemsEditor[AppState.indiceEdicion] = { titulo: t, contenido: c };
        // Importante: resetear el índice a -1 después de guardar
        AppState.indiceEdicion = -1;
    } else {
        // NUEVO: Solo si no estamos editando, agregamos uno nuevo al final
        AppState.itemsEditor.push({ titulo: t, contenido: c });
    }

    // Guardar en LocalStorage
    const llave = `${AppState.materia}_${AppState.tipoEditor}`;
    localStorage.setItem(llave, JSON.stringify(AppState.itemsEditor));
    
    // Limpiar los cuadros de texto para el siguiente
    document.getElementById('tit-edit').value = '';
    document.getElementById('cont-edit').value = '';
    
    // Refrescar la lista visualmente
    renderizarApp();
}

function borrarDato() {
    // 1. Buscamos todos los checkboxes que estén marcados
    const checkboxes = document.querySelectorAll('.check-eliminar:checked');
    
    if (checkboxes.length === 0) {
        return alert("Por favor, selecciona al menos un elemento para eliminar.");
    }

    // 2. Confirmación (opcional pero recomendada)
    if (!confirm(`¿Estás seguro de que quieres eliminar ${checkboxes.length} elementos?`)) return;

    // 3. Obtenemos los índices de los seleccionados
    const indicesAEliminar = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));

    // 4. Filtramos el arreglo: "Quédate con los que NO estén en la lista de eliminados"
    AppState.itemsEditor = AppState.itemsEditor.filter((_, index) => !indicesAEliminar.includes(index));

    // 5. Guardamos en LocalStorage y refrescamos la vista
    const llave = `${AppState.materia}_${AppState.tipoEditor}`;
    localStorage.setItem(llave, JSON.stringify(AppState.itemsEditor));
    
    // Si estábamos editando algo que borramos, reseteamos el modo edición
    AppState.indiceEdicion = -1;
    
    renderizarApp();
}

function exportarPDF() {
    const element = document.querySelector(".card-horario");
    html2pdf().set({ margin: 10, filename: 'Horario.pdf' }).from(element).save();
}

// ARRANQUE INICIAL
document.addEventListener('DOMContentLoaded', renderizarApp);