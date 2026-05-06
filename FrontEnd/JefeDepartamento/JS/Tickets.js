let ticketsGlobal = [];
let ticketSeleccionado = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarTickets();
    document.getElementById("filtroEstado").addEventListener("change", filtrar);
    document.getElementById("busqueda").addEventListener("input", filtrar);
});

async function cargarTickets() {
    try {
        const res = await fetch("http://localhost:5067/api/tickets/admin/alumnos");
        if(res.ok) {
            ticketsGlobal = await res.json();
        } else { console.error("Error API", await res.text()); }
    } catch(e) { console.error(e); }
    
    // Siempre intentar renderizar, ya sea lleno o vacío
    filtrar();
}

function filtrar() {
    const estado = document.getElementById("filtroEstado").value;
    const busqueda = document.getElementById("busqueda").value.toLowerCase();

    const filtrados = ticketsGlobal.filter(t => {
        let coincideEstado = true;
        if(estado === "abierto") coincideEstado = (t.idEstatus === 1);
        if(estado === "proceso") coincideEstado = (t.idEstatus === 2);
        if(estado === "resuelto") coincideEstado = (t.idEstatus === 3);

        // Protegemos la búsqueda contra valores nulos o vacíos
        let strRemitente = t.remitente ? t.remitente.toString().toLowerCase() : "";
        let strNombre = t.nombreRemitente ? t.nombreRemitente.toLowerCase() : "";
        let coincideTexto = strRemitente.includes(busqueda) || strNombre.includes(busqueda);
        
        return coincideEstado && coincideTexto;
    });

    renderTabla(filtrados);
}

function renderTabla(lista) {
    const tbody = document.getElementById("tablaTickets");
    tbody.innerHTML = "";

    if(lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No hay tickets de alumnos.</td></tr>`;
        return;
    }

    lista.forEach(t => {
        let badgeText = t.idEstatus === 1 ? 'Abierto' : (t.idEstatus === 2 ? 'En Proceso' : 'Resuelto');
        let colorBadge = t.idEstatus === 1 ? '#e53935' : (t.idEstatus === 2 ? '#f59e0b' : '#1bbf5c');
        let bgBadge = t.idEstatus === 1 ? '#ffebee' : (t.idEstatus === 2 ? '#fef3c7' : '#e8f5e9');

        tbody.innerHTML += `
        <tr>
            <td><b>${t.remitente}</b><br><small>${t.nombreRemitente}</small></td>
            <td><b>${t.asunto}</b><br><small>${new Date(t.fecha).toLocaleDateString()}</small></td>
            <td><span style="color: ${colorBadge}; background: ${bgBadge}; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">${badgeText}</span></td>
            <td><button class="btn-icon ver" onclick="verTicket(${t.idTicket})" title="Ver Ticket"><i data-lucide="eye"></i></button></td>
        </tr>`;
    });
    lucide.createIcons();
}

window.verTicket = function(id) {
    ticketSeleccionado = ticketsGlobal.find(t => t.idTicket === id);
    if(!ticketSeleccionado) return;

    let htmlDetalle = `
        <p><strong>Remitente:</strong> ${ticketSeleccionado.nombreRemitente} (${ticketSeleccionado.remitente})</p>
        <p><strong>Fecha:</strong> ${new Date(ticketSeleccionado.fecha).toLocaleString()}</p>
        <p><strong>Asunto:</strong> ${ticketSeleccionado.asunto}</p>
        <div style="background:#f1f5f9; padding:15px; border-radius:8px; margin-top:15px;">
            <p style="margin:0; color:#333;">${ticketSeleccionado.descripcion}</p>
        </div>
    `;

    if(ticketSeleccionado.evidenciaUrl) {
        const urlBase = ticketSeleccionado.evidenciaUrl.startsWith("http") ? "" : "http://localhost:5067";
        const rutaCompleta = urlBase + (ticketSeleccionado.evidenciaUrl.startsWith("/") ? ticketSeleccionado.evidenciaUrl : "/" + ticketSeleccionado.evidenciaUrl);
        htmlDetalle += `<p style="margin-top:15px;"><a href="${rutaCompleta}" target="_blank" style="color:#1a237e; font-weight:bold; text-decoration:none;"><i data-lucide="paperclip"></i> Ver Evidencia Adjunta</a></p>`;
    }

    document.getElementById("detalleTicket").innerHTML = htmlDetalle;
    document.getElementById("modalTicket").style.display = "flex";
    lucide.createIcons();
}

window.cerrarModal = function() {
    document.getElementById("modalTicket").style.display = "none";
    ticketSeleccionado = null;
}

window.cambiarEstado = async function(nuevoEstado) {
    if(!ticketSeleccionado) return;
    let estatusId = nuevoEstado === 'proceso' ? 2 : 3;

    try {
        const res = await fetch("http://localhost:5067/api/tickets/admin/estatus", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ IdTicket: ticketSeleccionado.idTicket, Estatus: estatusId, Tipo: "alumno" })
        });

        if(res.ok) {
            alert("Estado actualizado.");
            cerrarModal();
            cargarTickets();
        } else { alert("Error al actualizar."); }
    } catch(e) { console.error(e); }
}