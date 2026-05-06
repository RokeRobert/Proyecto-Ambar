// ModulosCoordinador.js - Solo lógica de pantallas
const PantallasConfig = {
    renderConfiguracion(instancia) {
        instancia.cargarEstilo('css-inscripcion', 'InscripcionAlumnos.css');
        instancia.limpiarPantalla();

        const estado = instancia.sistemaHabilitado;

        instancia.mainContainer.innerHTML = `
            <div class="modulo-header">
                <div>
                    <h2 style="color: var(--azul-obscuro);">Configuración del Periodo</h2>
                    <p style="color: #666;">Control maestro de apertura y cierre de procesos.</p>
                </div>
            </div>

            <div class="panel-doble" style="margin-top: 25px;">
                <div class="card-gestion ${estado ? 'materia-ok' : ''}" 
                     style="border-left: 5px solid ${estado ? '#2e7d32' : '#c62828'}">
                    
                    <h3 style="margin-bottom: 10px;">Carga de Materias</h3>
                    <p style="margin-bottom: 20px; font-size: 0.9rem; color: #555;">
                        Estado actual: <strong>${estado ? 'HABILITADO' : 'DESHABILITADO'}</strong>
                    </p>

                    <button onclick="coordinador.toggleSistema()" 
                            class="btn-gestion" 
                            style="background-color: ${estado ? '#c62828' : '#2e7d32'}; color: white; width: 100%; justify-content: center;">
                        <i class='bx bx-power-off'></i> 
                        ${estado ? 'Apagar Carga de Materias' : 'Encender Carga de Materias'}
                    </button>
                </div>

                <div class="card-gestion">
                    <h3 style="margin-bottom: 10px;">Aviso al Coordinador</h3>
                    <p style="font-size: 0.85rem; color: #666; line-height: 1.6;">
                        Al <b>apagar</b> este interruptor, se restringirá automáticamente la capacidad de alumnos y docentes para realizar cambios en sus cargas académicas.
                    </p>
                </div>
            </div>
        `;
    }
};