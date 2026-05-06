let creditosGlobal = [];
let datosFiltrados = [];
let tabActual = 'pendiente';

// Paginación
let paginaActual = 1;
const itemsPorPagina = 8;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("filtroCarrera").addEventListener("change", filtrar);
    document.getElementById("busqueda").addEventListener("input", filtrar);
    iniciarCreditos();
});

async function iniciarCreditos() {
    await cargarCarrerasFiltro();
    await cargarCreditos();
}

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

async function cargarCreditos() {
    try {
        const res = await fetch("http://localhost:5067/api/creditos/admin");
        if (res.ok) {
            creditosGlobal = await res.json();
            filtrar();
        }
    } catch (e) { console.error(e); }
}

// ==========================================
// TABS, FILTROS Y RENDERIZADO
// ==========================================
window.cambiarTab = function(tab, event) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    tabActual = tab;
    filtrar();
}

function filtrar() {
    let carrera = document.getElementById("filtroCarrera").value.toLowerCase();
    let busqueda = document.getElementById("busqueda").value.toLowerCase();

    datosFiltrados = creditosGlobal.filter(c => {
        let esDeTab = tabActual === 'pendiente' ? (c.idEstatus === 1) : (c.idEstatus === 2 || c.idEstatus === 3);
        let carreraItem = c.carrera ? c.carrera.toLowerCase() : "";
        
        return esDeTab &&
               (carrera === "" || carreraItem.includes(carrera)) &&
               (c.control.includes(busqueda) || c.nombreAlumno.toLowerCase().includes(busqueda));
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
    const tbody = document.getElementById("tabla-body");
    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay créditos en esta sección.</td></tr>`;
        return;
    }

    lista.forEach(item => {
        let badgeText = item.idEstatus === 1 ? 'Por revisar' : (item.idEstatus === 2 ? 'Aprobado' : 'Rechazado');
        let colorBadge = item.idEstatus === 1 ? '#ea580c' : (item.idEstatus === 2 ? '#1bbf5c' : '#e53935');
        let bgBadge = item.idEstatus === 1 ? '#ffedd5' : (item.idEstatus === 2 ? '#e8f5e9' : '#ffebee');

        let botones = `<button class="btn-icon ver" onclick="abrirPDF('${item.rutaPdf}')" title="Ver Documento"><i data-lucide="eye"></i></button>`;
        
        if (item.idEstatus === 1) {
            botones += `
                <button class="btn-icon aprobar" onclick="aprobarCredito(${item.idAlumno}, ${item.idActividad})" title="Aprobar"><i data-lucide="check"></i></button>
                <button class="btn-icon eliminar" onclick="abrirRechazo(${item.idAlumno}, ${item.idActividad})" title="Rechazar"><i data-lucide="x"></i></button>
            `;
        }

        tbody.innerHTML += `
        <tr>
            <td>
                <b>${item.control}</b><br>
                <small style="color:#64748b;">${item.nombreAlumno}</small>
            </td>
            <td>${item.carrera}<br><small>${item.actividad}</small></td>
            <td>
                <span style="color: ${colorBadge}; background: ${bgBadge}; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                    ${badgeText}
                </span>
            </td>
            <td class="acciones">${botones}</td>
        </tr>`;
    });
    
    lucide.createIcons();
}

// ==========================================
// GESTIÓN DE PDF Y ESTATUS
// ==========================================
window.abrirPDF = function(ruta) {
    if (!ruta || ruta.trim() === "") return alert("El alumno aún no ha adjuntado ningún archivo o la ruta no es válida.");
    // NOTA: Se asume que el backend expone los archivos estáticos. 
    // Si tienes "http://localhost:5067" o similar, la URL debe ser absoluta
    const urlBase = ruta.startsWith("http") ? "" : "http://localhost:5067";
    document.getElementById("visorPDF").src = urlBase + (ruta.startsWith("/") ? ruta : "/" + ruta);
    document.getElementById("modalPDF").style.display = "flex";
}

window.cerrarPDF = function() {
    document.getElementById("modalPDF").style.display = "none";
    document.getElementById("visorPDF").src = "";
}

let alumnoRechazo = null;
let actividadRechazo = null;

window.abrirRechazo = function(idAlumno, idActividad) {
    alumnoRechazo = idAlumno;
    actividadRechazo = idActividad;
    document.getElementById("motivo").value = "";
    document.getElementById("modalRechazo").style.display = "flex";
}

window.cerrarModal = function() {
    document.getElementById("modalRechazo").style.display = "none";
}

window.confirmarRechazo = async function() {
    const motivo = document.getElementById("motivo").value.trim();
    if (!motivo) return alert("Por favor ingresa un motivo para el rechazo.");
    
    await cambiarEstatusCredito(alumnoRechazo, actividadRechazo, 3);
    cerrarModal();
}

window.aprobarCredito = async function(idAlumno, idActividad) {
    if(!confirm("¿Seguro que deseas dar este crédito por validado?")) return;
    await cambiarEstatusCredito(idAlumno, idActividad, 2);
}

async function cambiarEstatusCredito(idAlumno, idActividad, estatus) {
    try {
        const res = await fetch(`http://localhost:5067/api/creditos/estatus`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ IdAlumno: idAlumno, IdActividad: idActividad, Estatus: estatus })
        });

        if (res.ok) {
            alert(estatus === 2 ? "Crédito validado con éxito." : "Crédito rechazado.");
            await cargarCreditos();
        } else { alert("Error al actualizar el crédito."); }
    } catch (e) { console.error(e); }
}