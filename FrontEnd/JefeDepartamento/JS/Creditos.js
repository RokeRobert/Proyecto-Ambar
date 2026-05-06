let alumnos = [
    {control:"22211863", carrera:"info", archivo:"/pdf/Repaso.pdf", estado:"pendiente"},
    {control:"22211864", carrera:"ind", archivo:"/pdf/Repaso.pdf", estado:"aprobado"},
    {control:"22211865", carrera:"info", archivo:"/pdf/Repaso.pdf", estado:"rechazado"}
];

let tabActual = "pendiente";
let paginaActual = 1;
let porPagina = 5;
let seleccionado = null;

document.addEventListener("DOMContentLoaded", renderTabla);

// TAB
function cambiarTab(tab, e){
    tabActual = tab;
    paginaActual = 1;

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    e.target.classList.add("active");

    renderTabla();
}

// RENDER
function renderTabla(){
    let carrera = document.getElementById("filtroCarrera").value;
    let texto = document.getElementById("busqueda").value.toLowerCase();

    let filtrados = alumnos.filter(a =>
        (tabActual === "pendiente" ? a.estado==="pendiente" : a.estado!=="pendiente") &&
        (carrera==="" || a.carrera===carrera) &&
        a.control.toLowerCase().includes(texto)
    );

    let inicio = (paginaActual-1)*porPagina;
    let datos = filtrados.slice(inicio, inicio+porPagina);

    let tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    datos.forEach(a=>{
        tbody.innerHTML += `
        <tr>
            <td>${a.control}</td>
            <td>${a.carrera}</td>
            <td><span class="badge ${a.estado}">${a.estado}</span></td>
            <td>
                <button class="btn-icon ver" onclick="abrirPDF('${a.archivo}')">Ver PDF</button>
                ${a.estado==="pendiente" ? `
                <button class="btn-icon aprobar" onclick="aprobar('${a.control}')">Aprobar</button>
                <button class="btn-icon rechazar" onclick="abrirRechazo('${a.control}')">Rechazar</button>
                ` : ""}
            </td>
        </tr>`;
    });

    document.getElementById("pagina").innerText = `Página ${paginaActual}`;
}

// PAGINACIÓN
function cambiarPagina(dir){
    paginaActual += dir;
    if(paginaActual<1) paginaActual=1;
    renderTabla();
}

// PDF (FIX centrado)
function abrirPDF(ruta){
    document.getElementById("visorPDF").src = ruta + "#toolbar=0";
    document.getElementById("modalPDF").style.display = "flex";
}
function cerrarPDF(){
    document.getElementById("modalPDF").style.display = "none";
}

// APROBAR
function aprobar(control){
    let alumno = alumnos.find(a=>a.control===control);
    alumno.estado="aprobado";
    renderTabla();
}

// RECHAZO
function abrirRechazo(control){
    seleccionado = control;
    document.getElementById("modalRechazo").style.display="flex";
}
function cerrarModal(){
    document.getElementById("modalRechazo").style.display="none";
}
function confirmarRechazo(){
    let alumno = alumnos.find(a=>a.control===seleccionado);
    alumno.estado="rechazado";
    cerrarModal();
    renderTabla();
}