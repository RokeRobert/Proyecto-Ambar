// =============================
// INICIO
// =============================
document.addEventListener("DOMContentLoaded", () => {
    iniciarKardex();
});

function iniciarKardex(){
    document.getElementById("carrera").addEventListener("change", cargarTabla);
    document.getElementById("semestre").addEventListener("change", cargarTabla);
    document.getElementById("busqueda").addEventListener("input", cargarTabla);

    cargarTabla();
}

// =============================
// BASE DE DATOS SIMULADA
// =============================
let materias = {
    "info-1": [
        { clave:"INF101", nombre:"Programación", creditos:5, semestre:"1" },
        { clave:"INF102", nombre:"Matemáticas", creditos:4, semestre:"1" }
    ],
    "info-2": [
        { clave:"INF201", nombre:"Base de Datos", creditos:5, semestre:"2" }
    ]
};

let editIndex = null;
let indexEliminar = null;

// =============================
// OBTENER CLAVE GLOBAL
// =============================
function obtenerClave(){
    let carrera = document.getElementById("carrera").value;
    let semestre = document.getElementById("semestre").value;
    return `${carrera}-${semestre}`;
}

// =============================
// CARGAR TABLA
// =============================
function cargarTabla(){

    let carrera = document.getElementById("carrera").value;
    let semestre = document.getElementById("semestre").value;

    let tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    // VALIDACIÓN
    if(!carrera || !semestre){
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Selecciona carrera y semestre
                </td>
            </tr>
        `;
        return;
    }

    let clave = obtenerClave();
    let data = materias[clave] || [];

    let texto = document.getElementById("busqueda").value.toLowerCase();

    // 🔥 SOLUCIÓN: conservar índice original
    let filtrados = data
        .map((m, i) => ({ ...m, indexReal: i }))
        .filter(m =>
            m.nombre.toLowerCase().includes(texto) ||
            m.clave.toLowerCase().includes(texto)
        );

    // SIN RESULTADOS
    if(filtrados.length === 0){
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No hay materias
                </td>
            </tr>
        `;
        return;
    }

    // RENDER
    filtrados.forEach((m) => {
        tbody.innerHTML += `
            <tr>
                <td>${m.clave}</td>
                <td>${m.nombre}</td>
                <td>${m.creditos}</td>
                <td><span class="badge-semestre">${m.semestre}°</span></td>
                <td class="acciones">

                    <button class="btn-icon editar" onclick="editar(${m.indexReal})">
                        <i data-lucide="pencil"></i>
                    </button> 

                    <button class="btn-icon eliminar" onclick="eliminar(${m.indexReal})">
                        <i data-lucide="trash-2"></i>
                    </button>

                </td>
            </tr>
        `;
    });

    lucide.createIcons();
}

// =============================
// MODAL
// =============================
function abrirModal(){
    document.getElementById("modal").style.display = "flex";
    document.getElementById("modal-titulo").textContent = "Agregar Materia";
}

function cerrarModal(){
    document.getElementById("modal").style.display = "none";
    limpiar();
}

function limpiar(){
    document.getElementById("claveMateria").value = "";
    document.getElementById("nombreMateria").value = "";
    document.getElementById("creditosMateria").value = "";
    document.getElementById("semestreMateria").value = "1";
    editIndex = null;
}

// =============================
// GUARDAR
// =============================
function guardarMateria(){

    let claveMat = document.getElementById("claveMateria").value.trim();
    let nombre = document.getElementById("nombreMateria").value.trim();
    let creditos = document.getElementById("creditosMateria").value;
    let semestre = document.getElementById("semestreMateria").value;

    if(!claveMat || !nombre || !creditos){
        alert("Completa todos los campos");
        return;
    }

    let clave = obtenerClave();

    if(!materias[clave]) materias[clave] = [];

    if(editIndex !== null){
        materias[clave][editIndex] = { clave:claveMat, nombre, creditos, semestre };
    } else {
        materias[clave].push({ clave:claveMat, nombre, creditos, semestre });
    }

    cerrarModal();
    cargarTabla();
}

// =============================
// EDITAR
// =============================
function editar(index){
    let clave = obtenerClave();
    let m = materias[clave][index];

    document.getElementById("claveMateria").value = m.clave;
    document.getElementById("nombreMateria").value = m.nombre;
    document.getElementById("creditosMateria").value = m.creditos;
    document.getElementById("semestreMateria").value = m.semestre;

    editIndex = index;
    document.getElementById("modal-titulo").textContent = "Editar Materia";

    document.getElementById("modal").style.display = "flex";
}

// =============================
// ELIMINAR
// =============================
function eliminar(index){
    let clave = obtenerClave();
    let materia = materias[clave][index];

    document.querySelector("#modalEliminar p").textContent =
        `¿Seguro que deseas eliminar "${materia.nombre}"?`;

    indexEliminar = index;
    document.getElementById("modalEliminar").style.display = "flex";
}

// CONFIRMAR
function confirmarEliminar(){
    let clave = obtenerClave();

    materias[clave].splice(indexEliminar, 1);

    cerrarModalEliminar();
    cargarTabla();
}

// CERRAR MODAL ELIMINAR
function cerrarModalEliminar(){
    document.getElementById("modalEliminar").style.display = "none";
    indexEliminar = null;
}