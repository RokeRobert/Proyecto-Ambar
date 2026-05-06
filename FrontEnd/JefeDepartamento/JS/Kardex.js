document.addEventListener("DOMContentLoaded", () => {
    // Protección de sesión
    const sesion = localStorage.getItem("profesorSesion");
    if (!sesion) {
        window.location.href = "/FrontEnd/Profesor/HTML/Login.html";
        return;
    }

    cargarCarreras();
    cargarMaterias();
    cargarEspecialidades();

    // Eventos de filtros
    document.getElementById("carrera").addEventListener("change", filtrarTabla);
    document.getElementById("semestre").addEventListener("change", filtrarTabla);
    document.getElementById("busqueda").addEventListener("input", filtrarTabla);
});

let materiasGlobal = [];
let especialidadesGlobal = [];
let editId = null;
let eliminarId = null;
let nombreMateriaEliminar = "";

// ==========================================
// CARGA DE DATOS (API)
// ==========================================
async function cargarCarreras() {
    try {
        const res = await fetch("http://localhost:5067/api/usuarios/carreras");
        if (!res.ok) return;
        const carreras = await res.json();
        
        const selectFiltro = document.getElementById("carrera");
        const selectForm = document.getElementById("carreraMateria");
        
        let opcionesFiltro = '<option value="">Carrera</option>';
        let opcionesForm = '<option value="">Tronco Común (Todas)</option>';

        carreras.forEach(c => {
            opcionesFiltro += `<option value="${c.id}">${c.nombre}</option>`;
            opcionesForm += `<option value="${c.id}">${c.nombre}</option>`;
        });

        if (selectFiltro) selectFiltro.innerHTML = opcionesFiltro;
        if (selectForm) selectForm.innerHTML = opcionesForm;
        
        // Detectar cambio de carrera en el formulario para filtrar especialidades
        if (selectForm) selectForm.addEventListener("change", (e) => actualizarSelectEspecialidades(e.target.value));
    } catch (e) { console.error("Error al cargar carreras:", e); }
}

async function cargarMaterias() {
    try {
        const res = await fetch("http://localhost:5067/api/materias");
        if (!res.ok) throw new Error("Error al obtener materias");
        materiasGlobal = await res.json();
        
        // Llenar el select de requisitos en el Modal
        const selectReq = document.getElementById("requisitoMateria");
        selectReq.innerHTML = '<option value="">Ninguna</option>';
        materiasGlobal.forEach(m => {
            selectReq.innerHTML += `<option value="${m.idMateria}">${m.nombre}</option>`;
        });

        filtrarTabla();
    } catch (e) {
        console.error(e);
        alert("Error de conexión al cargar la malla curricular.");
    }
}

async function cargarEspecialidades() {
    try {
        const res = await fetch("http://localhost:5067/api/especialidades");
        if (res.ok) especialidadesGlobal = await res.json();
    } catch (e) { console.error("Error al cargar especialidades:", e); }
}

function actualizarSelectEspecialidades(idCarrera) {
    const select = document.getElementById("especialidadMateria");
    if (!select) return;
    
    let opciones = '<option value="">Sin Especialidad</option>';
    
    // Si hay carrera, filtramos. Si no (Tronco Común), mostramos todas.
    const filtradas = idCarrera ? especialidadesGlobal.filter(e => e.idCarrera.toString() === idCarrera.toString()) : especialidadesGlobal;
    
    filtradas.forEach(e => {
        // Si mostramos todas, le agregamos el nombre de la carrera a un lado para no confundir
        const textoMostrar = idCarrera ? e.nombre : `${e.nombre} (${e.nombreCarrera})`;
        opciones += `<option value="${e.idEspecialidad}">${textoMostrar}</option>`;
    });
    
    select.innerHTML = opciones;
}

// ==========================================
// RENDER Y FILTROS
// ==========================================
function filtrarTabla() {
    const filtroCarrera = document.getElementById("carrera").value;
    const filtroSemestre = document.getElementById("semestre").value;
    const texto = document.getElementById("busqueda").value.toLowerCase().trim();

    let tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    const filtradas = materiasGlobal.filter(m => {
        const coincideTexto = m.nombre.toLowerCase().includes(texto) || m.idMateria.toString().includes(texto);
        
        // Si es tronco común (!m.idCarrera), siempre se muestra sin importar la carrera seleccionada
        const coincideCarrera = filtroCarrera ? (!m.idCarrera || m.idCarrera.toString() === filtroCarrera) : true;
        const coincideSemestre = filtroSemestre ? m.semestre.toString() === filtroSemestre : true;
        
        return coincideTexto && coincideCarrera && coincideSemestre;
    });

    if (filtradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No se encontraron materias.</td></tr>`;
        return;
    }

    filtradas.forEach(m => {
        const seriacionTexto = m.idMateriaRequisito ? `<br><small style="color:#e53935; font-size:11px;">Req: ${m.nombreMateriaRequisito}</small>` : "";
        tbody.innerHTML += `
            <tr>
                <td><b>${m.idMateria}</b></td>
                <td>${m.nombre} ${seriacionTexto}</td>
                <td>${m.creditos}</td>
                <td><span class="badge-semestre">${m.semestre}°</span></td>
                <td>${m.carrera}</td>
                <td class="acciones">
                    <button class="btn-icon editar" onclick="editar(${m.idMateria})">
                        <i data-lucide="pencil"></i>
                    </button> 
                    <button class="btn-icon eliminar" onclick="eliminar(${m.idMateria}, '${m.nombre}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    if (typeof lucide !== "undefined") lucide.createIcons();
}

// ==========================================
// GESTIÓN DE MATERIAS (CRUD)
// ==========================================
window.abrirModal = function() {
    editId = null;
    document.getElementById("modal").style.display = "flex";
    document.getElementById("modal-titulo").textContent = "Agregar Materia";
    limpiar();
}

window.cerrarModal = function() {
    document.getElementById("modal").style.display = "none";
    limpiar();
}

function limpiar(){
    document.getElementById("claveMateria").value = "";
    document.getElementById("nombreMateria").value = "";
    document.getElementById("creditosMateria").value = "";
    document.getElementById("semestreMateria").value = "1";
    document.getElementById("carreraMateria").value = "";
    document.getElementById("especialidadMateria").value = "";
    actualizarSelectEspecialidades("");
    document.getElementById("requisitoMateria").value = "";
}

window.guardarMateria = async function() {
    const nombre = document.getElementById("nombreMateria").value.trim();
    const creditos = document.getElementById("creditosMateria").value;
    const semestre = document.getElementById("semestreMateria").value;
    const idCarrera = document.getElementById("carreraMateria").value;
    const idEspecialidad = document.getElementById("especialidadMateria").value;
    const idRequisito = document.getElementById("requisitoMateria").value;

    if(!nombre || !creditos || !semestre){
        alert("Por favor, completa el nombre y los créditos.");
        return;
    }

    const datos = {
        Nombre: nombre,
        Creditos: parseInt(creditos),
        Semestre: parseInt(semestre),
        IdCarrera: idCarrera ? parseInt(idCarrera) : null,
        IdEspecialidad: idEspecialidad ? parseInt(idEspecialidad) : null,
        IdMateriaRequisito: idRequisito ? parseInt(idRequisito) : null
    };

    try {
        const url = editId ? `http://localhost:5067/api/materias/${editId}` : `http://localhost:5067/api/materias`;
        const method = editId ? "PUT" : "POST";
        
        const res = await fetch(url, { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) });
        if (!res.ok) throw new Error(await res.text());
        
        alert(editId ? "Materia actualizada." : "Materia creada correctamente.");
        cerrarModal();
        cargarMaterias();
    } catch(e) {
        alert("Error: " + e.message);
    }
}

window.editar = function(id) {
    const m = materiasGlobal.find(mat => mat.idMateria === id);
    if (!m) return;

    editId = id;
    document.getElementById("modal-titulo").textContent = "Editar Materia";
    document.getElementById("claveMateria").value = m.idMateria;
    document.getElementById("nombreMateria").value = m.nombre;
    document.getElementById("creditosMateria").value = m.creditos;
    document.getElementById("semestreMateria").value = m.semestre;
    document.getElementById("carreraMateria").value = m.idCarrera || "";
    actualizarSelectEspecialidades(m.idCarrera || "");
    document.getElementById("especialidadMateria").value = m.idEspecialidad || "";
    document.getElementById("requisitoMateria").value = m.idMateriaRequisito || "";

    document.getElementById("modal").style.display = "flex";
}

window.eliminar = function(id, nombre) {
    eliminarId = id;
    document.querySelector("#modalEliminar p").textContent = `¿Seguro que deseas eliminar "${nombre}"?`;
    document.getElementById("modalEliminar").style.display = "flex";
}

window.confirmarEliminar = async function() {
    if (!eliminarId) return;
    try {
        const res = await fetch(`http://localhost:5067/api/materias/${eliminarId}`, { method: "DELETE" });
        const result = await res.json();
        alert(result.mensaje);
        if (result.success) {
            cerrarModalEliminar();
            cargarMaterias();
        }
    } catch(e) {
        alert("Error al eliminar la materia. Puede que esté asignada a alumnos.");
    }
}

window.cerrarModalEliminar = function() {
    document.getElementById("modalEliminar").style.display = "none";
    eliminarId = null;
}

// ==========================================
// GESTIÓN DE ESPECIALIDADES
// ==========================================
window.abrirModalEspecialidad = function() {
    const idCarrera = document.getElementById("carreraMateria").value;
    if (!idCarrera) {
        alert("Primero debes seleccionar a qué Carrera pertenece para crearle su especialidad.");
        return;
    }
    document.getElementById("nombreNuevaEsp").value = "";
    document.getElementById("modalEspecialidad").style.display = "flex";
}

window.cerrarModalEspecialidad = function() {
    document.getElementById("modalEspecialidad").style.display = "none";
}

window.guardarEspecialidad = async function() {
    const nombre = document.getElementById("nombreNuevaEsp").value.trim();
    const idCarrera = parseInt(document.getElementById("carreraMateria").value);
    
    if (!nombre) return alert("Ingresa el nombre de la especialidad.");

    try {
        const res = await fetch("http://localhost:5067/api/especialidades", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Nombre: nombre, IdCarrera: idCarrera }) });
        if (!res.ok) throw new Error(await res.text());
        
        alert("Especialidad creada con éxito.");
        cerrarModalEspecialidad();
        await cargarEspecialidades(); // Recargamos las especialidades en la lista global
        actualizarSelectEspecialidades(idCarrera); // Pintamos el nuevo <select>
    } catch(e) { alert("Error: " + e.message); }
}