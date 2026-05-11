const PantallasConfig = {
    async renderConfiguracion(instancia) {
        instancia.cargarEstilo('css-inscripcion', 'InscripcionAlumnos.css');
        instancia.limpiarPantalla();

        instancia.mainContainer.innerHTML = `
            <div class="modulo-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h2 style="color: var(--azul-obscuro);">Configuración del Periodo</h2>
                    <p style="color: #666;">Control maestro de turnos de inscripción (Semáforo).</p>
                </div>
                <button onclick="abrirModalTurno()" style="background:#0b2a4a; color:white; padding:10px 20px; border:none; border-radius:10px; cursor:pointer; font-weight:bold; transition:0.3s;">
                    + Nuevo Turno
                </button>
            </div>

            <div class="tabla-container" style="margin-top: 25px;">
                <table class="tabla-gestion">
                    <thead>
                        <tr>
                            <th>Carrera</th>
                            <th>Semestre</th>
                            <th>Apertura (Fecha y Hora)</th>
                            <th>Cierre (Fecha y Hora)</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-turnos">
                        <tr><td colspan="6" style="text-align:center; padding:20px;">Cargando turnos...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Modal Nuevo Turno -->
            <div id="modalTurno" class="modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:2000; align-items:center; justify-content:center;">
                <div style="background:white; padding:25px; border-radius:16px; width:450px; box-shadow:0 15px 40px rgba(0,0,0,0.2);">
                    <h3 style="color:#0b2a4a; margin-bottom:20px;">Programar Turno de Inscripción</h3>
                    
                    <label style="display:block; margin-bottom:5px; font-weight:bold; font-size:14px;">Carrera</label>
                    <select id="turno-carrera" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #ddd; outline:none;">
                        <option value="">Todas las Carreras</option>
                    </select>

                    <label style="display:block; margin-bottom:5px; font-weight:bold; font-size:14px;">Semestre</label>
                    <select id="turno-semestre" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #ddd; outline:none;">
                        <option value="">Todos los Semestres</option>
                        <option value="1">1° Semestre</option>
                        <option value="2">2° Semestre</option>
                        <option value="3">3° Semestre</option>
                        <option value="4">4° Semestre</option>
                        <option value="5">5° Semestre</option>
                        <option value="6">6° Semestre</option>
                        <option value="7">7° Semestre</option>
                        <option value="8">8° Semestre</option>
                        <option value="9">9° Semestre</option>
                    </select>

                    <label style="display:block; margin-bottom:5px; font-weight:bold; font-size:14px;">Fecha y Hora de Apertura</label>
                    <input type="datetime-local" id="turno-inicio" style="width:100%; padding:10px; margin-bottom:15px; border-radius:8px; border:1px solid #ddd; outline:none;">

                    <label style="display:block; margin-bottom:5px; font-weight:bold; font-size:14px;">Fecha y Hora de Cierre</label>
                    <input type="datetime-local" id="turno-fin" style="width:100%; padding:10px; margin-bottom:25px; border-radius:8px; border:1px solid #ddd; outline:none;">

                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button onclick="cerrarModalTurno()" style="background:#e5e7eb; padding:10px 15px; border:none; border-radius:8px; cursor:pointer;">Cancelar</button>
                        <button onclick="guardarTurno()" style="background:#1bbf5c; color:white; padding:10px 15px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">Guardar</button>
                    </div>
                </div>
            </div>
        `;

        // Funciones Globales para Controlar el Modal
        window.cargarCarrerasSemaforo = async function() {
            try {
                const res = await fetch("http://localhost:5067/api/usuarios/carreras");
                const carreras = await res.json();
                const select = document.getElementById("turno-carrera");
                carreras.forEach(c => select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
            } catch (e) { console.error(e); }
        };

        window.cargarTurnos = async function() {
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
                    const estadoHtml = t.activo ? `<span class="status-badge status-active">Activo</span>` : `<span class="status-badge" style="background:#ffebee; color:#c62828;">Inactivo</span>`;
                    const fInicio = new Date(t.fechaInicio).toLocaleString('es-MX', { dateStyle:'short', timeStyle:'short' });
                    const fFin = new Date(t.fechaFin).toLocaleString('es-MX', { dateStyle:'short', timeStyle:'short' });

                    tbody.innerHTML += `
                        <tr>
                            <td><strong>${t.nombreCarrera || "Todas"}</strong></td>
                            <td>${t.semestre ? t.semestre + '°' : 'Todos'}</td>
                            <td>${fInicio}</td>
                            <td>${fFin}</td>
                            <td>${estadoHtml}</td>
                            <td class="acciones-fila">
                                <button class="btn-icon delete" onclick="eliminarTurno(${t.idSemaforo})" title="Eliminar"><i class='bx bx-trash'></i></button>
                            </td>
                        </tr>
                    `;
                });
            } catch(e) {
                document.getElementById("tabla-turnos").innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Falta conectar la API del Semáforo en C#</td></tr>';
            }
        };

        window.abrirModalTurno = function() {
            document.getElementById("turno-carrera").value = ""; document.getElementById("turno-semestre").value = "";
            document.getElementById("turno-inicio").value = ""; document.getElementById("turno-fin").value = "";
            document.getElementById("modalTurno").style.display = "flex";
        };

        window.cerrarModalTurno = function() { document.getElementById("modalTurno").style.display = "none"; };

        window.guardarTurno = async function() {
            const idCarrera = document.getElementById("turno-carrera").value;
            const semestre = document.getElementById("turno-semestre").value;
            const fechaInicio = document.getElementById("turno-inicio").value;
            const fechaFin = document.getElementById("turno-fin").value;

            if(!fechaInicio || !fechaFin) return alert("Debes seleccionar fecha de inicio y fin.");

            const payload = {
                IdCarrera: idCarrera ? parseInt(idCarrera) : null,
                Semestre: semestre ? parseInt(semestre) : null,
                FechaInicio: fechaInicio,
                FechaFin: fechaFin,
                Activo: true
            };

            try {
                const res = await fetch("http://localhost:5067/api/semaforo", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
                });
                const result = await res.json();
                if(result.success) { cerrarModalTurno(); cargarTurnos(); } 
                else { alert(result.mensaje); }
            } catch(e) { alert("Error de servidor."); }
        };

        window.eliminarTurno = async function(id) {
            if(!confirm("¿Seguro que deseas eliminar este turno de inscripción?")) return;
            try {
                await fetch("http://localhost:5067/api/semaforo/" + id, { method: "DELETE" });
                cargarTurnos();
            } catch(e) {}
        };

        // Arrancamos
        cargarCarrerasSemaforo();
        cargarTurnos();
    }
};