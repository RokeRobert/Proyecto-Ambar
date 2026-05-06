let alumnosGlobal = [];
let datosFiltrados = [];
let paginaActual = 1;
const itemsPorPagina = 8;
let editId = null;
let idEliminar = null;
let periodoActualId = 1;

document.addEventListener("DOMContentLoaded", () => {
    cargarFiltros();
    cargarAlumnos();
    document.getElementById("busquedaUsuario").addEventListener("input", filtrar);
    document.getElementById("filtroCarrera").addEventListener("change", filtrar);
});

async function cargarFiltros() {
    try {
        const resC = await fetch("http://localhost:5067/api/usuarios/carreras");
        if (resC.ok) {
            const carreras = await resC.json();
            let opcionesFiltro = '<option value="">Todas las carreras</option>';
            let opcionesForm = '<option value="">Seleccione una carrera</option>';
            carreras.forEach(c => {
                opcionesFiltro += `<option value="${c.nombre}">${c.nombre}</option>`;
                opcionesForm += `<option value="${c.id}">${c.nombre}</option>`;
            });
            document.getElementById("filtroCarrera").innerHTML = opcionesFiltro;
            document.getElementById("al_carrera").innerHTML = opcionesForm;
        }

        const resPs = await fetch("http://localhost:5067/api/usuarios/periodos");
        if (resPs.ok) {
            const periodos = await resPs.json();
            let opcionesPeriodo = '';
            periodos.forEach(p => opcionesPeriodo += `<option value="${p.id}">${p.nombre}</option>`);
            document.getElementById("al_periodo").innerHTML = opcionesPeriodo;
        }

        const resP = await fetch("http://localhost:5067/api/usuarios/periodo");
        if (resP.ok) {
            periodoActualId = await resP.json();
        }
    } catch(e) { console.error(e); }
}

async function cargarAlumnos() {
    try {
        const res = await fetch("http://localhost:5067/api/usuarios/alumnos");
        if (res.ok) {
            alumnosGlobal = await res.json();
            filtrar();
        }
    } catch(e) { console.error(e); }
}

function filtrar() {
    const texto = document.getElementById("busquedaUsuario").value.toLowerCase();
    const carrera = document.getElementById("filtroCarrera").value;

    datosFiltrados = alumnosGlobal.filter(a => {
        const matchTexto = a.nombre.toLowerCase().includes(texto) || a.id.includes(texto);
        const matchCarrera = carrera === "" || a.carrera === carrera;
        return matchTexto && matchCarrera;
    });

    paginaActual = 1;
    renderTablaPaginada();
}

function renderTablaPaginada() {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const paginaDatos = datosFiltrados.slice(inicio, fin);
    
    const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina) || 1;
    document.getElementById("pagina").textContent = `Página ${paginaActual} de ${totalPaginas}`;
    
    renderTabla(paginaDatos);
}

window.cambiarPagina = function(dir) {
    const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina) || 1;
    paginaActual += dir;
    if (paginaActual < 1) paginaActual = 1;
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    renderTablaPaginada();
}

function renderTabla(lista) {
    const tbody = document.getElementById("tablaUsuarios");
    tbody.innerHTML = "";
    
    if(lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No se encontraron alumnos.</td></tr>`;
        return;
    }

    lista.forEach(u => {
        tbody.innerHTML += `
        <tr>
            <td><b>${u.id}</b></td>
            <td>${u.nombre}</td>
            <td>${u.correo}</td>
            <td>${u.carrera}</td>
            <td class="acciones">
                <button class="btn-icon editar" onclick="editarUsuario(${u.id})" title="Editar"><i data-lucide="pencil"></i></button>
                <button class="btn-icon eliminar" onclick="abrirEliminar(${u.id}, '${u.nombre}')" title="Eliminar"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>`;
    });
    lucide.createIcons();
}

window.abrirModal = function() {
    editId = null;
    document.getElementById("al_nombre").value = "";
    document.getElementById("al_apellido1").value = "";
    document.getElementById("al_apellido2").value = "";
    document.getElementById("al_curp").value = "";
    document.getElementById("al_telefono").value = "";
    document.getElementById("al_correo").value = "";
    document.getElementById("al_fechaNac").value = "";
    document.getElementById("al_carrera").value = "";
    document.getElementById("al_periodo").value = periodoActualId;
    document.getElementById("al_pass").value = "";
    document.getElementById("modalUsuario").style.display = "flex";
}

window.cerrarModal = function() { document.getElementById("modalUsuario").style.display = "none"; }

window.guardarUsuario = async function() {
    const dto = {
        nombre: document.getElementById("al_nombre").value,
        primerApellido: document.getElementById("al_apellido1").value,
        segundoApellido: document.getElementById("al_apellido2").value,
        curp: document.getElementById("al_curp").value,
        telefono: document.getElementById("al_telefono").value,
        correoPersonal: document.getElementById("al_correo").value,
        fechaNacimiento: document.getElementById("al_fechaNac").value || new Date().toISOString(),
        idCarrera: parseInt(document.getElementById("al_carrera").value) || 0,
        idPeriodo: parseInt(document.getElementById("al_periodo").value) || 1,
        contrasena: document.getElementById("al_pass").value || document.getElementById("al_curp").value
    };

    const url = editId ? `http://localhost:5067/api/usuarios/alumno/${editId}` : `http://localhost:5067/api/usuarios/alumno`;
    const method = editId ? "PUT" : "POST";

    try {
        const res = await fetch(url, { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(dto) });
        const data = await res.json();
        if(res.ok) { alert(data.mensaje); cerrarModal(); cargarAlumnos(); } 
        else { alert(data.mensaje || "Error al guardar."); }
    } catch(e) { alert("Error de conexión."); }
}

window.editarUsuario = async function(id) {
    try {
        const res = await fetch(`http://localhost:5067/api/usuarios/alumno/${id}`);
        if(res.ok) {
            const a = await res.json();
            editId = id;
            document.getElementById("al_nombre").value = a.nombre;
            document.getElementById("al_apellido1").value = a.primerApellido;
            document.getElementById("al_apellido2").value = a.segundoApellido;
            document.getElementById("al_curp").value = a.curp;
            document.getElementById("al_telefono").value = a.telefono;
            document.getElementById("al_correo").value = a.correoPersonal;
            document.getElementById("al_fechaNac").value = a.fechaNacimiento ? a.fechaNacimiento.split('T')[0] : "";
            document.getElementById("al_carrera").value = a.idCarrera;
            document.getElementById("al_periodo").value = a.idPeriodo;
            document.getElementById("al_pass").value = ""; 
            document.getElementById("modalUsuario").style.display = "flex";
        }
    } catch(e) { console.error(e); }
}

window.abrirEliminar = function(id, nombre) {
    idEliminar = id;
    document.getElementById("textoEliminar").textContent = `¿Estás seguro de eliminar a ${nombre}?`;
    document.getElementById("modalEliminar").style.display = "flex";
}

window.cerrarModalEliminar = function() { document.getElementById("modalEliminar").style.display = "none"; idEliminar = null; }

window.confirmarEliminar = async function() {
    if(!idEliminar) return;
    try {
        const res = await fetch(`http://localhost:5067/api/usuarios/alumno/${idEliminar}`, { method: "DELETE" });
        const data = await res.json();
        alert(data.mensaje);
        if(res.ok) { cerrarModalEliminar(); cargarAlumnos(); }
    } catch(e) { alert("Error de conexión."); }
}