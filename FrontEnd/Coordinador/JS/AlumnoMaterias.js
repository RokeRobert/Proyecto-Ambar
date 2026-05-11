// ==========================================
// SECCIÓN ALUMNOS: CARGA Y BAJA (INSCRIPCIONES)
// ==========================================

GestionCoordinador.prototype.renderAlumnosGestion = function() { 
    this.cargarEstilo('css-tablas', '../CSS/TablasDocente.css'); // Reutilizamos el CSS existente para evitar el error 404
    this.limpiarPantalla();
    
    this.mainContainer.innerHTML = `
        <div class="modulo-header">
            <div>
                <h2 style="color: var(--azul-obscuro); margin-bottom: 5px;">Inscripciones y Carga Académica</h2>
                <p style="color: #777; font-size: 0.9rem;">Gestione el alta y baja de materias por estudiante.</p>
            </div>
            
            <div class="header-actions" style="background: #f0f4f8; padding: 15px; border-radius: 10px; display: flex; gap: 10px; align-items: center;">
                <div class="search-container" style="margin:0; flex-grow: 1;">
                    <input type="text" id="busqueda-alumno-control" 
                           placeholder="Nombre, No. Control o Carrera..." 
                           onkeyup="if(event.key === 'Enter') coordinador.buscarAlumno()"
                           style="width: 100%; border-radius: 8px; border: 1px solid #ccc; padding: 10px 10px;">
                </div>

                <button class="btn-gestion btn-primario" onclick="coordinador.buscarAlumno()" 
                        style="background: #0d2142; color: white; padding: 10px 25px; border-radius: 8px; border: none; cursor: pointer; font-weight: bold;">
                    Buscar
                </button>
            </div>
        </div>

        <div id="lista-sugerencias-busqueda" style="margin-top: 10px;"></div>
        <div id="contenedor-gestion-alumno" style="display: none;"></div>

        <div id="mensaje-bienvenida-gestion" style="text-align: center; padding: 50px; color: #999;">
            <i class='bx bx-search' style="font-size: 3rem; opacity: 0.3;"></i>
            <p>Ingrese los datos del alumno para comenzar la gestión</p>
        </div>
    `;
};

GestionCoordinador.prototype.buscarAlumno = async function() {
    const input = document.getElementById('busqueda-alumno-control').value.trim();
    const panel = document.getElementById('contenedor-gestion-alumno');
    const mensaje = document.getElementById('mensaje-bienvenida-gestion');
    const sugerencias = document.getElementById('lista-sugerencias-busqueda');

    if (input === "") {
        panel.style.display = 'none';
        sugerencias.innerHTML = "";
        mensaje.style.display = 'block';
        mensaje.innerHTML = `<p>Por favor, ingrese un criterio de búsqueda.</p>`;
        return;
    }

    mensaje.style.display = 'block';
    mensaje.innerHTML = `<p>Buscando...</p>`;
    panel.style.display = 'none';
    sugerencias.innerHTML = "";

    try {
        const sesion = JSON.parse(localStorage.getItem("profesorSesion") || "{}");
        const idCoordinador = sesion.id || 0;

        const response = await fetch(`http://localhost:5067/api/coordinador/alumnos/buscar/${idCoordinador}?termino=${encodeURIComponent(input)}`);
        if (!response.ok) {
            throw new Error('Error en la búsqueda de alumnos.');
        }
        const resultados = await response.json();

        if (resultados.length === 0) {
            mensaje.innerHTML = `<p style="color: #c62828;">No se encontraron alumnos que coincidan con "${input}".</p>`;
        } else if (resultados.length === 1 && resultados[0].control === input) {
            sugerencias.innerHTML = "";
            this.mostrarFichaAlumno(resultados[0].id);
        } else {
            mensaje.style.display = 'none';
            sugerencias.innerHTML = `
            <div class="card-gestion" style="max-width: 600px; margin: 10px auto;">
                <p style="font-size: 0.8rem; color: #888; margin-bottom: 10px;">Resultados encontrados (${resultados.length}):</p>
                <ul class="lista-items">
                    ${resultados.map(a => `
                        <li style="cursor:pointer; padding: 12px; border-bottom: 1px solid #eee;" onclick="coordinador.seleccionarAlumno(${a.id})">
                            <div><strong>${a.nombre}</strong><br><small>${a.control} | ${a.carrera}</small></div>
                            <i class='bx bx-chevron-right'></i>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        }
    } catch (error) {
        mensaje.innerHTML = `<p style="color: #c62828;">${error.message}</p>`;
    }
};

GestionCoordinador.prototype.seleccionarAlumno = function(IdAlumno) {
    document.getElementById('lista-sugerencias-busqueda').innerHTML = "";
    this.mostrarFichaAlumno(IdAlumno);
};

GestionCoordinador.prototype.mostrarFichaAlumno = async function(IdAlumno) {
    const panel = document.getElementById('contenedor-gestion-alumno');
    const mensaje = document.getElementById('mensaje-bienvenida-gestion');

    mensaje.style.display = 'none';
    panel.style.display = 'block';
    panel.innerHTML = `<div class="card-gestion" style="text-align:center;">Cargando datos del alumno...</div>`;

    try {
        // Cargar datos del alumno y la oferta académica en paralelo
        const [alumnoResponse, ofertaResponse] = await Promise.all([
            fetch(`http://localhost:5067/api/coordinador/alumnos/${IdAlumno}`),
            fetch(`http://localhost:5067/api/coordinador/oferta-academica`)
        ]);

        if (!alumnoResponse.ok) throw new Error('No se pudo cargar la información del alumno.');
        if (!ofertaResponse.ok) throw new Error('No se pudo cargar la oferta académica.');

        const alumno = await alumnoResponse.json();
        const oferta = await ofertaResponse.json();
        // Asumimos que el sistema siempre está habilitado para el coordinador
        const sistemaHabilitado = true; 

        panel.innerHTML = `
            <div class="panel-doble">
                <div class="card-gestion">
                    <div class="card-header-gestion" style="border-bottom: 1px solid #eee; margin-bottom: 15px; padding-bottom: 10px;">
                        <h3>${alumno.nombre}</h3>
                        <p style="font-size: 0.85rem; color: #666;">${alumno.carrera}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Control:</strong> ${alumno.control} | <strong>Semestre:</strong> ${alumno.semestre}
                    </div>
                    <h4 style="font-size:0.9rem; margin-bottom:10px;">Materias Inscritas</h4>
                    <ul class="lista-items">
                        ${alumno.materias.length > 0 
                            ? alumno.materias.map(m => `
                                <li>
                                    <div>
                                        <strong>${m.materia}</strong><br>
                                        <small style="color: #444;">${m.profesor}</small>
                                    </div>
                                    <button class="btn-delete-item" onclick="coordinador.bajaMateria(${alumno.id}, ${m.idGrupo})"><i class='bx bx-x'></i></button>
                                </li>`).join('')
                            : '<li style="color:#999; font-style:italic;">Sin materias inscritas</li>'}
                    </ul>
                </div>

                <div class="card-gestion">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0;">Oferta Académica</h3>
                        <div style="position: relative; width: 150px;">
                            <i class='bx bx-search' style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); color: #888; font-size: 0.9rem;"></i>
                            <input type="text" id="buscar-grupo-oferta" placeholder="Buscar grupo..." 
                                   onkeyup="coordinador.filtrarGruposOferta()"
                                   style="width: 100%; padding: 5px 5px 5px 28px; border-radius: 15px; border: 1px solid #ddd; font-size: 0.75rem; outline: none;">
                        </div>
                    </div>

                    <ul class="lista-items" id="lista-oferta-grupos">
                        ${oferta.map(g => {
                            const inscrita = alumno.materias.some(m => m.idGrupo === g.idGrupo);
                            return `
                            <li class="item-oferta" style="${!g.tieneProfesor ? 'opacity: 0.7;' : ''}">
                                <div>
                                    <strong>${g.materia}</strong><br>
                                    <small style="color: ${g.tieneProfesor ? '#666' : '#c62828'}">
                                        ${g.profesor}
                                    </small>
                                </div>
                                ${inscrita 
                                    ? `<i class='bx bx-check-circle' style="color:green; font-size: 1.2rem;"></i>` 
                                    : (g.tieneProfesor && sistemaHabilitado
                                        ? `<button class="btn-add" onclick="coordinador.altaMateria(${alumno.id}, ${g.idGrupo})"><i class='bx bx-plus'></i></button>`
                                        : `<i class='bx bx-lock' title="No disponible"></i>`
                                    )
                                }
                            </li>`;
                        }).join('')}
                    </ul>
                </div>
            </div>`;
    } catch (error) {
        panel.innerHTML = `<div class="card-gestion" style="text-align:center; color: #c62828;">${error.message}</div>`;
    }
};

// --- FUNCIÓN DE FILTRADO PARA LA OFERTA ---
GestionCoordinador.prototype.filtrarGruposOferta = function() {
    const input = document.getElementById('buscar-grupo-oferta').value.toLowerCase();
    const items = document.querySelectorAll('#lista-oferta-grupos .item-oferta');
    
    items.forEach(item => {
        const texto = item.innerText.toLowerCase();
        item.style.display = texto.includes(input) ? 'flex' : 'none';
    });
};

// --- MÉTODOS DE ALTA/BAJA ---
GestionCoordinador.prototype.altaMateria = async function(idAlumno, idGrupo) {
    try {
        const response = await fetch('http://localhost:5067/api/coordinador/inscripciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idAlumno, idGrupo })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.mensaje || 'No se pudo inscribir la materia.');
        }
        // Recargar la vista del alumno para reflejar el cambio
        this.mostrarFichaAlumno(idAlumno);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};

GestionCoordinador.prototype.bajaMateria = async function(idAlumno, idGrupo) {
    if (confirm("¿Está seguro de que desea dar de baja esta materia para el alumno?")) {
        try {
            const response = await fetch(`http://localhost:5067/api/coordinador/inscripciones/${idAlumno}/${idGrupo}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.mensaje || 'No se pudo dar de baja la materia.');
            }
            // Recargar la vista del alumno para reflejar el cambio
            this.mostrarFichaAlumno(idAlumno);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
};