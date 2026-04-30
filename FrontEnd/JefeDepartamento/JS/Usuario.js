let usuarios = [
    {
        control: "22211863",
        nombre: "Juan",
        paterno: "Pérez",
        materno: "Lopez",
        tipo: "Alumno",
        correo: "juan@email.com",
        carrera: "info"
    },
    {
        control: "22211864",
        nombre: "Ana",
        paterno: "Gomez",
        materno: "Ruiz",
        tipo: "Docente",
        correo: "ana@email.com",
        carreras: ["info", "ind"]
    }
];

let editIndex = null;
let eliminarIndex = null;

let paginaActual = 1;
const registrosPorPagina = 5;

// 🚀 INICIO
document.addEventListener("DOMContentLoaded", () => {
    renderTabla();

    document.getElementById("busquedaUsuario").addEventListener("input", () => {
        paginaActual = 1;
        renderTabla();
    });

    document.getElementById("filtroCarrera").addEventListener("change", () => {
        paginaActual = 1;
        renderTabla();
    });

    document.getElementById("filtroTipo").addEventListener("change", () => {
        paginaActual = 1;
        renderTabla();
    });
});

// 📊 RENDER TABLA
function renderTabla(){

    let texto = document.getElementById("busquedaUsuario").value.toLowerCase();
    let filtroCarrera = document.getElementById("filtroCarrera").value;
    let filtroTipo = document.getElementById("filtroTipo").value;

    let filtrados = usuarios.filter(u => {

        let nombreCompleto = `${u.control} ${u.nombre} ${u.paterno} ${u.materno}`.toLowerCase();

        let coincideTexto =
            nombreCompleto.includes(texto) ||
            u.correo.toLowerCase().includes(texto);

        let coincideTipo = filtroTipo ? u.tipo === filtroTipo : true;

        let coincideCarrera = true;

        if(filtroCarrera){
            if(u.tipo === "Alumno"){
                coincideCarrera = u.carrera === filtroCarrera;
            }
            if(u.tipo === "Docente"){
                coincideCarrera = u.carreras.includes(filtroCarrera);
            }
        }

        return coincideTexto && coincideCarrera && coincideTipo;
    });

    // 🔢 PAGINACIÓN
    let inicio = (paginaActual - 1) * registrosPorPagina;
    let paginados = filtrados.slice(inicio, inicio + registrosPorPagina);

    let tbody = document.getElementById("tablaUsuarios");
    tbody.innerHTML = "";

    paginados.forEach(u => {

        let indexReal = usuarios.indexOf(u);

        let clase = u.tipo === "Alumno" ? "alumno" : "docente";

        let carreraTexto =
            u.tipo === "Alumno"
            ? u.carrera
            : u.carreras.join(", ");

        tbody.innerHTML += `
            <tr>
                <td>${u.control}</td>
                <td>${u.nombre} ${u.paterno} ${u.materno}</td>
                <td><span class="badge ${clase}">${u.tipo}</span></td>
                <td>${u.correo}</td>
                <td>${carreraTexto}</td>

                <td class="acciones">
                    <button class="btn-icon editar" onclick="editar(${indexReal})">
                        <i data-lucide="pencil"></i>
                    </button>

                    <button class="btn-icon eliminar" onclick="eliminar(${indexReal})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById("pagina").textContent =
        `${paginaActual} / ${Math.max(1, Math.ceil(filtrados.length / registrosPorPagina))}`;

    lucide.createIcons();
}

// 📄 CAMBIAR PÁGINA
function cambiarPagina(direccion){
    let totalPaginas = Math.ceil(usuarios.length / registrosPorPagina);

    paginaActual += direccion;

    if(paginaActual < 1) paginaActual = 1;
    if(paginaActual > totalPaginas) paginaActual = totalPaginas;

    renderTabla();
}

// 🔄 CAMBIAR TIPO
function cambiarTipo(){
    let tipo = document.getElementById("tipo").value;

    document.getElementById("carreraAlumno").style.display =
        tipo === "Alumno" ? "block" : "none";

    document.getElementById("carrerasDocente").style.display =
        tipo === "Docente" ? "block" : "none";
}

// 🟢 MODAL
function abrirModal(){
    limpiar();

    document.getElementById("modalTitulo").textContent = "Agregar Usuario";
    document.getElementById("modalUsuario").style.display = "flex";
}

function cerrarModal(){
    document.getElementById("modalUsuario").style.display = "none";
}

function limpiar(){
    document.getElementById("control").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("paterno").value = "";
    document.getElementById("materno").value = "";
    document.getElementById("correo").value = "";
    document.getElementById("tipo").value = "Alumno";

    document.getElementById("carreraAlumno").value = "info";

    let selectDoc = document.getElementById("carrerasDocente");
    for(let option of selectDoc.options){
        option.selected = false;
    }

    cambiarTipo();

    editIndex = null;
}

// 💾 GUARDAR
function guardarUsuario(){

    let control = document.getElementById("control").value;
    let nombre = document.getElementById("nombre").value;
    let paterno = document.getElementById("paterno").value;
    let materno = document.getElementById("materno").value;
    let correo = document.getElementById("correo").value;
    let tipo = document.getElementById("tipo").value;

    let nuevo = { control, nombre, paterno, materno, correo, tipo };

    if(tipo === "Alumno"){
        nuevo.carrera = document.getElementById("carreraAlumno").value;
    } else {
        let select = document.getElementById("carrerasDocente");
        let seleccionadas = [...select.selectedOptions].map(o => o.value);
        nuevo.carreras = seleccionadas;
    }

    if(editIndex !== null){
        usuarios[editIndex] = nuevo;
    } else {
        usuarios.push(nuevo);
    }

    cerrarModal();
    renderTabla();
}

// ✏️ EDITAR
function editar(index){

    let u = usuarios[index];

    document.getElementById("control").value = u.control;
    document.getElementById("nombre").value = u.nombre;
    document.getElementById("paterno").value = u.paterno;
    document.getElementById("materno").value = u.materno;
    document.getElementById("correo").value = u.correo;
    document.getElementById("tipo").value = u.tipo;

    cambiarTipo();

    if(u.tipo === "Alumno"){
        document.getElementById("carreraAlumno").value = u.carrera;
    } else {
        let select = document.getElementById("carrerasDocente");

        for(let option of select.options){
            option.selected = u.carreras.includes(option.value);
        }
    }

    editIndex = index;

    document.getElementById("modalTitulo").textContent = "Editar Usuario";
    document.getElementById("modalUsuario").style.display = "flex";
}

// ❌ ELIMINAR
function eliminar(index){
    eliminarIndex = index;

    document.getElementById("textoEliminar").textContent =
        `¿Eliminar a ${usuarios[index].nombre}?`;

    document.getElementById("modalEliminar").style.display = "flex";
}

// CONFIRMAR
function confirmarEliminar(){
    usuarios.splice(eliminarIndex, 1);
    cerrarModalEliminar();
    renderTabla();
}

function cerrarModalEliminar(){
    document.getElementById("modalEliminar").style.display = "none";
}