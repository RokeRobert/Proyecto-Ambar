let aulas = [
    { nombre:"A101", tipo:"aula", bloque:"100", capacidad:30, plantel:"tomas" },
    { nombre:"A102", tipo:"aula", bloque:"100", capacidad:25, plantel:"tomas" },
    { nombre:"Lab A", tipo:"lab", bloque:"300", capacidad:20, plantel:"tomas" },
    { nombre:"O201", tipo:"aula", bloque:"200", capacidad:35, plantel:"otay" }
];

// INICIO
document.addEventListener("DOMContentLoaded", renderAulas);

// RENDER
function renderAulas(){

    let plantel = document.getElementById("plantel").value;
    let tipo = document.getElementById("tipo").value;
    let bloque = document.getElementById("bloque").value;

    let tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    let filtrados = aulas.filter(a => 
        a.plantel === plantel &&
        a.tipo === tipo &&
        (bloque === "" || a.bloque === bloque)
    );

    filtrados.forEach((a, index) => {
        tbody.innerHTML += `
        <tr>
            <td>${a.nombre}</td>
            <td><span class="badge ${a.tipo}">${a.tipo}</span></td>
            <td>${a.bloque}</td>
            <td>${a.capacidad}</td>
            <td>${a.plantel}</td>
            <td>
                <button class="btn-icon eliminar" onclick="eliminar(${index})">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        </tr>
        `;
    });

    lucide.createIcons();
}

// MODAL
function abrirModal(){
    document.getElementById("modal").style.display = "flex";
}

function cerrarModal(){
    document.getElementById("modal").style.display = "none";
}

// GUARDAR
function guardar(){

    let nombre = document.getElementById("nombre").value;
    let tipo = document.getElementById("tipoInput").value;
    let bloque = document.getElementById("bloqueInput").value;
    let capacidad = document.getElementById("capacidad").value;
    let plantel = document.getElementById("plantel").value;

    aulas.push({ nombre, tipo, bloque, capacidad, plantel });

    cerrarModal();
    renderAulas();
}

// ELIMINAR
function eliminar(index){
    if(confirm("¿Eliminar esta aula?")){
        aulas.splice(index,1);
        renderAulas();
    }
}