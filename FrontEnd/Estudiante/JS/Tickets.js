document.addEventListener("DOMContentLoaded", () => {
    const sesion = localStorage.getItem("alumnoSesion");
    if (!sesion) return window.location.href = "Login.html";
    const alumnoData = JSON.parse(sesion);

    // Cargar Perfil Topbar
    document.getElementById("topbar-carrera").textContent = alumnoData.carrera;
    document.getElementById("topbar-foto").src = alumnoData.direccionFoto || "https://i.pinimg.com/736x/cc/ec/06/ccec06bfcef089196f335c17e837b9eb.jpg";
    document.getElementById("topbar-nombre").textContent = alumnoData.nombreCompleto;
    document.getElementById("topbar-control").textContent = alumnoData.id;

    cargarTickets(alumnoData.id);
    inicializarModal();
    inicializarTabs(alumnoData.id);
});

let ticketsGlobal = [];

async function cargarTickets(idAlumno) {
    try {
        const res = await fetch(`http://localhost:5067/api/tickets/alumno/${idAlumno}`);
        if (!res.ok) throw new Error("Error al obtener tickets");
        ticketsGlobal = await res.json();
        renderTickets("Abierto"); // Por defecto mostramos la pestaña de abiertos
    } catch (e) {
        console.error(e);
        document.getElementById("contenedor-tickets").innerHTML = "<p style='color:red;'>No se pudieron cargar los tickets.</p>";
    }
}

function renderTickets(filtroEstado) {
    const contenedor = document.getElementById("contenedor-tickets");
    contenedor.innerHTML = "";

    const filtrados = ticketsGlobal.filter(t => t.estado === filtroEstado);

    if (filtrados.length === 0) {
        contenedor.innerHTML = `<p style='color:#6c757d;'>No tienes tickets en estado: <b>${filtroEstado}</b>.</p>`;
        return;
    }

    filtrados.forEach(ticket => {
        const fecha = new Date(ticket.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });
        const colorBorde = ticket.estado === 'Abierto' ? '#f59e0b' : '#1bbf5c';
        const colorFondo = ticket.estado === 'Abierto' ? '#fffbeb' : '#e8f5e9';
        
        let htmlEvidencia = "";
        if(ticket.evidenciaUrl) {
            htmlEvidencia = `<a href="http://localhost:5067${ticket.evidenciaUrl}" target="_blank" style="color: #0b2a4a; font-size: 13px; text-decoration: none; display: flex; align-items: center; gap: 5px; margin-top: 10px; font-weight: 500;"><i data-lucide="image" style="width:16px; height:16px;"></i> Ver evidencia subida</a>`;
        }

        const div = document.createElement("div");
        div.className = "ticket-card";
        div.style.cssText = `background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 15px; border-left: 5px solid ${colorBorde};`;
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <h3 style="margin:0; color:#0b2a4a; font-size: 16px;">${ticket.tipoProblema}</h3>
                <span style="background:${colorFondo}; color:${colorBorde}; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: bold;">${ticket.estado}</span>
            </div>
            <p style="color:#4a5568; font-size: 14px; margin-bottom: 10px;">${ticket.observaciones}</p>
            <small style="color:#8a92a6; font-size: 12px;">Reportado el: ${fecha}</small>
            ${htmlEvidencia}
        `;
        contenedor.appendChild(div);
    });
    lucide.createIcons();
}

function inicializarTabs() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            tabs.forEach(t => t.classList.remove("activa"));
            e.target.classList.add("activa");
            
            const estado = e.target.textContent.trim() === "Abiertos" ? "Abierto" : "Finalizado";
            renderTickets(estado);
        });
    });
}

function inicializarModal() {
    const modal = document.getElementById("modalTicket");
    const btnAbrir = document.getElementById("btnAbrirModal");
    const btnCerrar = document.getElementById("cerrarModal");
    const btnCancelar = document.getElementById("btnCancelar");
    const btnConfirmar = document.getElementById("btnConfirmar");

    const cerrar = () => {
        modal.classList.remove("activo");
        modal.style.display = "none";
        document.getElementById("tipoTicket").value = "";
        document.getElementById("observaciones").value = "";
        document.getElementById("evidencia").value = "";
        document.getElementById("preview").style.display = "none";
        document.getElementById("preview").src = "";
    };

    btnAbrir.addEventListener("click", () => { modal.classList.add("activo"); modal.style.display = "flex"; });
    btnCerrar.addEventListener("click", cerrar);
    btnCancelar.addEventListener("click", cerrar);

    btnConfirmar.addEventListener("click", async () => {
        const tipo = document.getElementById("tipoTicket").value.trim();
        const obs = document.getElementById("observaciones").value;
        const archivoInput = document.getElementById("evidencia");
        
        if (tipo === "") return alert("Por favor, ingresa el asunto o título del ticket.");
        if (obs.trim() === "") return alert("Por favor, describe tu problema en las observaciones.");

        const alumnoData = JSON.parse(localStorage.getItem("alumnoSesion"));
        const formData = new FormData();
        formData.append("idAlumno", alumnoData.id);
        formData.append("tipoProblema", tipo);
        formData.append("observaciones", obs);
        if (archivoInput.files.length > 0) formData.append("evidencia", archivoInput.files[0]);

        btnConfirmar.innerHTML = "Enviando..."; btnConfirmar.disabled = true;
        try {
            const res = await fetch("http://localhost:5067/api/tickets/crear", { method: "POST", body: formData });
            const result = await res.json();
            if (result.success) { alert(result.mensaje); cerrar(); cargarTickets(alumnoData.id); } 
            else { alert(result.mensaje); }
        } catch (e) { alert("Error de conexión."); } 
        finally { btnConfirmar.innerHTML = "Confirmar"; btnConfirmar.disabled = false; }
    });
}

window.mostrarImagen = function(event) {
    const preview = document.getElementById("preview");
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { preview.src = e.target.result; preview.style.display = "block"; }
        reader.readAsDataURL(file);
    } else { preview.style.display = "none"; }
};