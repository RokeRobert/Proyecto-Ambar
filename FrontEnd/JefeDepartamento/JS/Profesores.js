let profesoresGlobal = [];
let datosFiltrados = [];
let paginaActual = 1;
const itemsPorPagina = 8;
let editId = null;
let idEliminar = null;
let carrerasGlobal = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarFiltros();
    cargarProfesores();
    document.getElementById("busquedaUsuario").addEventListener("input", filtrar);
    document.getElementById("filtroRol").addEventListener("change", filtrar);
    document.getElementById("filtroDepartamento").addEventListener("change", filtrar);
    
    // Agregamos eventos para actualizar el formulario dinámicamente
    const selectRol = document.getElementById("pr_rol");
    if (selectRol) selectRol.addEventListener("change", cambiarRolProfesor);
    
    const selectDepto = document.getElementById("pr_departamento");
    if (selectDepto) selectDepto.addEventListener("change", cambiarRolProfesor);
});

async function cargarFiltros() {
    try {
        const resD = await fetch("http://localhost:5067/api/usuarios/departamentos");
        if (resD.ok) {
            const depas = await resD.json();
            let opcionesFiltro = '<option value="">Todos los departamentos</option>';
            let opcionesForm = '<option value="">Seleccione un departamento</option>';
            depas.forEach(d => {
                opcionesFiltro += `<option value="${d.nombre}">${d.nombre}</option>`;
                opcionesForm += `<option value="${d.id}">${d.nombre}</option>`;
            });
            document.getElementById("filtroDepartamento").innerHTML = opcionesFiltro;
            document.getElementById("pr_departamento").innerHTML = opcionesForm;
        }

        const resC = await fetch("http://localhost:5067/api/usuarios/carreras");
        if (resC.ok) {
            carrerasGlobal = await resC.json();
        }
    } catch(e) { console.error(e); }
}

async function cargarProfesores() {
    try {
        const res = await fetch("http://localhost:5067/api/usuarios/profesores");
        if (res.ok) {
            profesoresGlobal = await res.json();
            filtrar();
        }
    } catch(e) { console.error(e); }
}

function filtrar() {
    const texto = document.getElementById("busquedaUsuario").value.toLowerCase();
    const rol = document.getElementById("filtroRol").value;
    const depa = document.getElementById("filtroDepartamento").value;

    datosFiltrados = profesoresGlobal.filter(p => {
        const matchTexto = p.nombre.toLowerCase().includes(texto) || p.id.includes(texto);
        const matchRol = rol === "" || p.tipo === rol;
        const matchDepa = depa === "" || p.carrera === depa; 
        return matchTexto && matchRol && matchDepa;
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
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No se encontró personal.</td></tr>`;
        return;
    }

    lista.forEach(u => {
        tbody.innerHTML += `
        <tr>
            <td><b>${u.id}</b></td>
            <td>${u.nombre}</td>
            <td><span class="badge docente">${u.tipo}</span></td>
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
    document.getElementById("pr_nombre").value = "";
    document.getElementById("pr_apellido1").value = "";
    document.getElementById("pr_apellido2").value = "";
    document.getElementById("pr_correo").value = "";
    document.getElementById("pr_fechaIngreso").value = new Date().toISOString().split('T')[0];
    document.getElementById("pr_departamento").value = "";
    document.getElementById("pr_rol").value = "3";
    document.getElementById("pr_carrera").value = "";
    document.getElementById("pr_pass").value = "";
    cambiarRolProfesor();
    document.getElementById("modalUsuario").style.display = "flex";
}

window.cerrarModal = function() { document.getElementById("modalUsuario").style.display = "none"; }

window.generarCorreoProfesor = function() {
    if (editId) return; 
    const n = document.getElementById("pr_nombre").value.split(' ')[0].toLowerCase().trim();
    const a1 = document.getElementById("pr_apellido1").value.toLowerCase().trim();
    const a2 = document.getElementById("pr_apellido2").value.split(' ')[0].toLowerCase().trim();
    if (n || a1) {
        document.getElementById("pr_correo").value = `${n}${a1}${a2}@tectijuana.edu.mx`.replace(/ /g, '');
    }
}

window.cambiarRolProfesor = function() {
    const idRol = document.getElementById("pr_rol").value;
    const idDepto = document.getElementById("pr_departamento").value;
    const contCarrera = document.getElementById("pr_carrera_container");
    const selectCarrera = document.getElementById("pr_carrera");
    
    if (contCarrera) {
        if (idRol == "2") { // 2 = Coordinador
            contCarrera.style.display = "block";
            
            if (selectCarrera) {
                let opciones = '<option value="">Seleccione una carrera</option>';
                
                if (!idDepto) {
                    opciones = '<option value="">Seleccione un departamento primero</option>';
                } else {
                    // Filtramos mostrando las del departamento seleccionado o las que aún no tienen uno asignado
                    const carrerasFiltradas = carrerasGlobal.filter(c => c.idDepartamento == idDepto || c.idDepartamento == null);
                    carrerasFiltradas.forEach(c => {
                        opciones += `<option value="${c.id}">${c.nombre}</option>`;
                    });
                }
                selectCarrera.innerHTML = opciones;
            }
        } else {
            contCarrera.style.display = "none";
            if (selectCarrera) { selectCarrera.value = ""; }
        }
    }
}

window.guardarUsuario = async function() {
    const idRol = parseInt(document.getElementById("pr_rol").value);
    const dto = {
        nombre: document.getElementById("pr_nombre").value,
        primerApellido: document.getElementById("pr_apellido1").value,
        segundoApellido: document.getElementById("pr_apellido2").value,
        correoInstitucional: document.getElementById("pr_correo").value,
        fechaIngreso: document.getElementById("pr_fechaIngreso").value || new Date().toISOString(),
        idDepartamento: parseInt(document.getElementById("pr_departamento").value) || 0,
        idRol: idRol,
        contrasena: document.getElementById("pr_pass").value || "temporal123"
    };
    
    if (idRol === 2) {
        dto.idCarrera = parseInt(document.getElementById("pr_carrera").value) || null;
    }

    const url = editId ? `http://localhost:5067/api/usuarios/profesor/${editId}` : `http://localhost:5067/api/usuarios/profesor`;
    const method = editId ? "PUT" : "POST";

    try {
        const res = await fetch(url, { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(dto) });
        const data = await res.json();
        if(res.ok) { alert(data.mensaje); cerrarModal(); cargarProfesores(); } 
        else { alert(data.mensaje || "Error al guardar."); }
    } catch(e) { alert("Error de conexión."); }
}

window.editarUsuario = async function(id) {
    try {
        const res = await fetch(`http://localhost:5067/api/usuarios/profesor/${id}`);
        if(res.ok) {
            const p = await res.json();
            editId = id;
            document.getElementById("pr_nombre").value = p.nombre;
            document.getElementById("pr_apellido1").value = p.primerApellido;
            document.getElementById("pr_apellido2").value = p.segundoApellido;
            document.getElementById("pr_correo").value = p.correoInstitucional;
            document.getElementById("pr_fechaIngreso").value = p.fechaIngreso ? p.fechaIngreso.split('T')[0] : "";
            document.getElementById("pr_departamento").value = p.idDepartamento;
            document.getElementById("pr_rol").value = p.idRol;
            
            document.getElementById("pr_pass").value = ""; 
            cambiarRolProfesor();
            
            // Asignamos la carrera después de que se generan las opciones en cambiarRolProfesor()
            if (p.idRol == 2 && p.idCarrera) {
                const selectCarrera = document.getElementById("pr_carrera");
                if (selectCarrera) selectCarrera.value = p.idCarrera;
            }
            
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
        const res = await fetch(`http://localhost:5067/api/usuarios/profesor/${idEliminar}`, { method: "DELETE" });
        const data = await res.json();
        alert(data.mensaje);
        if(res.ok) { cerrarModalEliminar(); cargarProfesores(); }
    } catch(e) { alert("Error de conexión."); }
}