let datos = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("filtroCarrera").addEventListener("change", filtrar);
    document.getElementById("filtroSemestre").addEventListener("change", filtrar);
    document.getElementById("busqueda").addEventListener("input", filtrar);
});

// INICIO
async function iniciarRecibos(){
    await cargarCarrerasFiltro();
    await cargarRecibos();
}

// Ejecutar automáticamente al abrir la página
iniciarRecibos();

async function cargarRecibos() {
    try {
        const res = await fetch("http://localhost:5067/api/recibos");
        if (res.ok) {
            datos = await res.json();
            actualizarSelectSemestres();
            renderTabla(datos);
            actualizarResumen(datos);
        }
    } catch (e) { console.error("Error al cargar recibos", e); }
}

// ==========================================
// CARGA DINÁMICA DE FILTROS
// ==========================================
async function cargarCarrerasFiltro() {
    try {
        const res = await fetch("http://localhost:5067/api/usuarios/carreras");
        if (res.ok) {
            const carreras = await res.json();
            let select = document.getElementById("filtroCarrera");
            let opciones = '<option value="">Carrera</option>';
            carreras.forEach(c => opciones += `<option value="${c.nombre.toLowerCase()}">${c.nombre}</option>`);
            select.innerHTML = opciones;
        }
    } catch (e) { console.error("Error al cargar carreras", e); }
}

function actualizarSelectSemestres() {
    const select = document.getElementById("filtroSemestre");
    const valorActual = select.value;
    // Extraemos valores únicos de semestre de los datos, quitamos vacíos y ordenamos
    const semestres = [...new Set(datos.map(d => d.semestre))].filter(Boolean).sort((a,b) => parseInt(a) - parseInt(b));
    
    let opciones = '<option value="">Semestre</option>';
    semestres.forEach(s => opciones += `<option value="${s}">${s}°</option>`);
    select.innerHTML = opciones;
    select.value = valorActual; // Mantiene seleccionado el filtro si cambia
}

// RENDER TABLA
function renderTabla(lista){
    let tbody = document.querySelector(".tabla-recibos tbody");
    tbody.innerHTML = "";

    lista.forEach((item, index) => {
        tbody.innerHTML += `
        <tr>
            <td>${item.control}</td>
            <td>${item.referencia}</td>
            <td>
                <span class="badge ${item.estado}">
                    ${item.estado === "pagado" ? "Pagado" : "Pendiente"}
                </span>
            </td>
            <td>
                ${
                    item.estado === "pendiente"
                    ? `<button class="btn-icon aprobar" onclick="marcarPagado(${item.idRecibo})" title="Marcar como pagado">
                            <i data-lucide="check"></i>
                       </button>`
                    : `<button class="btn-icon ver" onclick="verRecibo(${item.idRecibo})" title="Ver detalles">
                            <i data-lucide="eye"></i>
                       </button>`
                }
            </td>
        </tr>
        `;
    });

    lucide.createIcons();
}

// FILTRAR
function filtrar(){
    let carrera = document.getElementById("filtroCarrera").value.toLowerCase();
    let semestre = document.getElementById("filtroSemestre").value;
    let busqueda = document.getElementById("busqueda").value.toLowerCase();

    let filtrados = datos.filter(d => {
        let carreraItem = d.carrera ? d.carrera.toLowerCase() : "";
        return (
            (carrera === "" || carreraItem.includes(carrera)) &&
            (semestre === "" || d.semestre === semestre) &&
            d.control.toLowerCase().includes(busqueda)
        );
    });

    renderTabla(filtrados);
    actualizarResumen(filtrados);
}

// MARCAR PAGADO
async function marcarPagado(idRecibo){
    if(!confirm("¿Seguro que deseas marcar este recibo como pagado?")) return;
    
    try {
        const res = await fetch(`http://localhost:5067/api/recibos/pagar/${idRecibo}`, { method: "PUT" });
        if (res.ok) {
            alert("El recibo ha sido pagado.");
            await cargarRecibos(); // Recargamos de la base de datos
        }
    } catch (e) { console.error("Error al marcar como pagado", e); }
}

// RESUMEN
function actualizarResumen(lista){
    let pagados = lista.filter(d => d.estado === "pagado").length;
    let pendientes = lista.filter(d => d.estado === "pendiente").length;

    document.querySelector(".pagados").innerHTML = `✔ Pagados: ${pagados}`;
    document.querySelector(".pendientes").innerHTML = `✖ Pendientes: ${pendientes}`;
}

// ==========================================
// MODAL Y GENERACIÓN DE RECIBOS
// ==========================================
window.abrirModalRecibo = function() {
    document.getElementById("idAlumnoRecibo").value = "";
    document.getElementById("modalRecibo").style.display = "flex";
}

window.cerrarModalRecibo = function() {
    document.getElementById("modalRecibo").style.display = "none";
}

window.generarRecibo = async function() {
    let idAlumno = document.getElementById("idAlumnoRecibo").value.trim();
    if(!idAlumno) return alert("Ingresa el ID del alumno.");
    
    try {
        const res = await fetch(`http://localhost:5067/api/recibos/generar/${idAlumno}`, { method: "POST" });
        if(res.ok) {
            alert("Recibo generado con éxito.");
            cerrarModalRecibo();
            await cargarRecibos();
        } else { alert("Error al generar. Verifica que el ID del alumno exista en tu base de datos."); }
    } catch(e) { console.error(e); }
}

// ==========================================
// VER DETALLES DEL RECIBO PAGADO
// ==========================================
window.verRecibo = function(idRecibo) {
    const recibo = datos.find(r => r.idRecibo === idRecibo);
    if (!recibo) return;
    
    document.getElementById("detControl").textContent = recibo.control;
    document.getElementById("detReferencia").textContent = recibo.referencia;
    document.getElementById("detCarrera").textContent = recibo.carrera;
    document.getElementById("detSemestre").textContent = recibo.semestre;
    
    document.getElementById("modalDetalleRecibo").style.display = "flex";
}

window.cerrarModalDetalle = function() {
    document.getElementById("modalDetalleRecibo").style.display = "none";
}