document.addEventListener("DOMContentLoaded", () => {
    const sesion = localStorage.getItem("profesorSesion");
    if (!sesion) {
        window.location.href = "/FrontEnd/Profesor/HTML/Login.html";
        return;
    }
    cargarCarrerasSemaforo();
    cargarTurnos();
});

async function cargarCarrerasSemaforo() {
    const modalBody = document.getElementById("cuerpo-modal-turnos");
    
    let opcionesSemestres = '<option value="">Todos los Semestres</option>';
    for (let i = 1; i <= 15; i++) {
        opcionesSemestres += `<option value="${i}">${i}°</option>`;
    }

    modalBody.innerHTML = `
        <label>Carrera</label>
        <select id="turno-carrera"><option value="">Todas las Carreras</option></select>
        
        <label>Semestre</label>
        <select id="turno-semestre">
            ${opcionesSemestres}
        </select>

        <label>Fecha y Hora de Apertura</label>
        <input type="datetime-local" id="turno-inicio">

        <label>Fecha y Hora de Cierre</label>
        <input type="datetime-local" id="turno-fin">
    `;

    try {
        const res = await fetch("http://localhost:5067/api/usuarios/carreras");
        const carreras = await res.json();
        const select = document.getElementById("turno-carrera");
        carreras.forEach(c => select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
    } catch (e) { console.error(e); }
}

async function cargarTurnos() {
    try {
        const res = await fetch("http://localhost:5067/api/semaforo");
        if(!res.ok) throw new Error();
        const turnos = await res.json();
        const tbody = document.getElementById("tabla-turnos");
        tbody.innerHTML = "";

        if(turnos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No hay turnos programados.</td></tr>';
            return;
        }

        turnos.forEach(t => {
            const ahora = new Date();
            const fInicioDate = new Date(t.fechaInicio);
            const fFinDate = new Date(t.fechaFin);
            
            let estadoHtml = "";
            if (!t.activo) {
                estadoHtml = `<span class="status-badge status-inactive">Inactivo</span>`;
            } else if (ahora > fFinDate) {
                estadoHtml = `<span class="status-badge" style="background:#f1f5f9; color:#64748b;">Finalizado</span>`;
            } else if (ahora >= fInicioDate && ahora <= fFinDate) {
                estadoHtml = `<span class="status-badge status-active">En Curso</span>`;
            } else {
                estadoHtml = `<span class="status-badge" style="background:#e0f2fe; color:#1e40af;">Programado</span>`;
            }

            const fInicio = fInicioDate.toLocaleString('es-MX', { dateStyle:'short', timeStyle:'short' });
            const fFin = fFinDate.toLocaleString('es-MX', { dateStyle:'short', timeStyle:'short' });

            tbody.innerHTML += `
                <tr>
                    <td><strong>${t.nombreCarrera || "Todas"}</strong></td>
                    <td>${t.semestre ? t.semestre + '°' : 'Todos'}</td>
                    <td>${fInicio}</td>
                    <td>${fFin}</td>
                    <td>${estadoHtml}</td>
                    <td class="acciones-col">
                        <button class="btn-icon delete" onclick="eliminarTurno(${t.idSemaforo})" title="Eliminar"><i class='bx bx-trash'></i></button>
                    </td>
                </tr>
            `;
        });
    } catch(e) {
        document.getElementById("tabla-turnos").innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error de conexión con la BD</td></tr>';
    }
}

window.abrirModalTurno = function() {
    document.getElementById("modalTurno").style.display = "flex";
}
window.cerrarModalTurno = function() { 
    document.getElementById("modalTurno").style.display = "none"; 
}

window.guardarTurno = async function() {
    const idCarrera = document.getElementById("turno-carrera").value;
    const semestre = document.getElementById("turno-semestre").value;
    const fechaInicio = document.getElementById("turno-inicio").value;
    const fechaFin = document.getElementById("turno-fin").value;

    if(!fechaInicio || !fechaFin) return alert("Debes seleccionar fecha de inicio y fin.");
    const payload = { IdCarrera: idCarrera ? parseInt(idCarrera) : null, Semestre: semestre ? parseInt(semestre) : null, FechaInicio: fechaInicio, FechaFin: fechaFin, Activo: true };
    try { const res = await fetch("http://localhost:5067/api/semaforo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const result = await res.json(); if(result.success) { cerrarModalTurno(); cargarTurnos(); } else alert(result.mensaje); } catch(e) { alert("Error de servidor."); }
}

window.eliminarTurno = async function(id) {
    if(!confirm("¿Seguro que deseas eliminar este turno de inscripción?")) return;
    try { await fetch("http://localhost:5067/api/semaforo/" + id, { method: "DELETE" }); cargarTurnos(); } catch(e) {}
}