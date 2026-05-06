document.addEventListener("DOMContentLoaded", async () => {
    // 1. VERIFICACIÓN DE SESIÓN
    const sesionJSON = localStorage.getItem("profesorSesion");
    if (!sesionJSON) {
        window.location.href = "/FrontEnd/Profesor/HTML/LoginProfesor.html";
        return;
    }
    const sesion = JSON.parse(sesionJSON);
    const profesorId = sesion.id;

    // 2. REFERENCIAS A ELEMENTOS DEL DOM
    const container = document.getElementById("dynamic-render");
    if (!container) return;

    // 3. RENDERIZAR LA ESTRUCTURA INICIAL DE LA PÁGINA
    renderizarEstructura();

    // 4. OBTENER Y CARGAR LOS GRUPOS DEL DOCENTE
    await cargarGrupos(profesorId);

    // 5. ASIGNAR EVENTOS A BOTONES PRINCIPALES
    document.getElementById("btn-cargar").addEventListener("click", cargarAlumnos);
    document.getElementById("btn-guardar").addEventListener("click", guardarCalificaciones);
    document.getElementById("btn-finalizar").addEventListener("click", () => {
        alert("Función para finalizar calificaciones no implementada en este ejemplo.");
    });
});

/**
 * Renderiza el esqueleto HTML de la página de calificaciones.
 */
function renderizarEstructura() {
    const container = document.getElementById("dynamic-render");
    container.innerHTML = `
        <h1 class="fade-in">Calificaciones</h1>

        <div class="filters fade-in">
            <div class="select-container">
                <select id="grupo-select">
                    <option value="" disabled selected>Cargando materias...</option>
                </select>
                <i class='bx bx-chevron-down'></i>
            </div>
            <button class="btn-load" id="btn-cargar">
                <i class='bx bx-refresh'></i> Cargar Alumnos
            </button>
        </div>

        <section class="card slide-up">
            <h2 id="materia-titulo">Seleccione una materia y haga clic en "Cargar Alumnos"</h2>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>No. Control</th>
                        <th>P1</th>
                        <th>P2</th>
                        <th>P3</th>
                        <th>P4</th>
                        <th>P5</th>
                        <th>P6</th>
                        <th>Promedio</th>
                    </tr>
                </thead>
                <tbody id="tabla-body">
                    <tr><td colspan="9" style="text-align:center;">No hay datos para mostrar.</td></tr>
                </tbody>
            </table>
        </section>

        <div class="actions fade-in">
            <button class="save" id="btn-guardar"><i class='bx bx-save'></i> Guardar Cambios</button>
            <button class="finalize" id="btn-finalizar"><i class='bx bx-check-double'></i> Finalizar Captura</button>
        </div>

        <div class="status-box">
            <i class="fa-solid fa-circle-info"></i>
            <span>Recuerda guardar los cambios antes de seleccionar otro grupo o salir.</span>
        </div>
    `;
}

/**
 * Obtiene los grupos del docente desde la API y los carga en el dropdown.
 * @param {number} profesorId - El ID del profesor logueado.
 */
async function cargarGrupos(profesorId) {
    const select = document.getElementById("grupo-select");
    try {
        const response = await fetch(`http://localhost:5067/api/profesores/${profesorId}/grupos`);
        if (!response.ok) {
            throw new Error("No se pudieron cargar los grupos.");
        }
        const grupos = await response.json();

        if (grupos.length > 0) {
            select.innerHTML = '<option value="" disabled selected>Seleccionar Materia - Grupo</option>';
            grupos.forEach(grupo => {
                // El DTO devuelve IdGrupo y NombreGrupo. Usaremos IdGrupo como value.
                select.innerHTML += `<option value="${grupo.idGrupo}">${grupo.nombreGrupo}</option>`;
            });
        } else {
            select.innerHTML = '<option value="" disabled selected>No tienes grupos asignados</option>';
            document.getElementById("btn-cargar").disabled = true;
        }
    } catch (error) {
        console.error("Error al cargar grupos:", error);
        select.innerHTML = `<option value="">${error.message}</option>`;
        document.getElementById("btn-cargar").disabled = true;
    }
}

/**
 * Carga la lista de alumnos para el grupo seleccionado.
 */
async function cargarAlumnos() {
    const select = document.getElementById("grupo-select");
    const idGrupo = select.value;
    const tablaBody = document.getElementById("tabla-body");
    const titulo = document.getElementById("materia-titulo");

    if (!idGrupo) {
        alert("Por favor, selecciona un grupo.");
        return;
    }

    const nombreGrupo = select.options[select.selectedIndex].text;
    titulo.textContent = `Lista de alumnos - ${nombreGrupo}`;
    tablaBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Cargando...</td></tr>';

    try {
        const response = await fetch(`http://localhost:5067/api/profesores/grupos/${idGrupo}/alumnos`);
        if (!response.ok) {
            throw new Error("No se pudieron cargar los alumnos de este grupo.");
        }
        const alumnos = await response.json();

        if (alumnos.length === 0) {
            tablaBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">Este grupo no tiene alumnos inscritos.</td></tr>';
            return;
        }

        tablaBody.innerHTML = alumnos.map((alumno, index) => {
            // Las calificaciones parciales vienen directamente en el DTO.
            // Usamos el operador 'nullish coalescing' (??) para mostrar un string vacío si el valor es null o undefined.
            const p1 = alumno.p1 ?? '';
            const p2 = alumno.p2 ?? '';
            const p3 = alumno.p3 ?? '';
            const p4 = alumno.p4 ?? '';
            const p5 = alumno.p5 ?? '';
            const p6 = alumno.p6 ?? '';

            return `
                <tr data-id-alumno="${alumno.idAlumno}">
                    <td>${index + 1}</td>
                    <td class="student-name">${alumno.nombre}</td>
                    <td>${alumno.idAlumno}</td>
                    <td><input type="number" class="grade-input p1" min="0" max="100" value="${p1}" placeholder="0"></td>
                    <td><input type="number" class="grade-input p2" min="0" max="100" value="${p2}" placeholder="0"></td>
                    <td><input type="number" class="grade-input p3" min="0" max="100" value="${p3}" placeholder="0"></td>
                    <td><input type="number" class="grade-input p4" min="0" max="100" value="${p4}" placeholder="0"></td>
                    <td><input type="number" class="grade-input p5" min="0" max="100" value="${p5}" placeholder="0"></td>
                    <td><input type="number" class="grade-input p6" min="0" max="100" value="${p6}" placeholder="0"></td>
                    <td><span class="status-pill">--</span></td>
                </tr>
            `;
        }).join('');

        activarLogicaCalificaciones();

    } catch (error) {
        console.error("Error al cargar alumnos:", error);
        tablaBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red;">${error.message}</td></tr>`;
    }
}

/**
 * Activa el cálculo de promedios en tiempo real para cada fila de la tabla.
 */
function activarLogicaCalificaciones() {
    const rows = document.querySelectorAll("#tabla-body tr");
    rows.forEach(row => {
        if (!row.dataset.idAlumno) return; // Ignorar filas de mensaje

        const inputs = row.querySelectorAll(".grade-input");
        const pill = row.querySelector(".status-pill");

        const calcularPromedio = () => {
            let suma = 0;
            let contador = 0;
            inputs.forEach(input => {
                const valor = parseFloat(input.value);
                if (!isNaN(valor)) {
                    suma += valor;
                    contador++;
                }
            });

            // Se calcula el promedio solo con las unidades que tienen calificación.
            const promedio = contador > 0 ? (suma / contador).toFixed(1) : 0;

            if (contador === 0) {
                pill.textContent = "--";
                pill.className = "status-pill";
                return;
            }

            pill.textContent = promedio;
            pill.className = promedio < 70 ? "status-pill status-reprobado" : "status-pill status-aprobado";

            // Estilo para inputs individuales
            inputs.forEach(input => {
                const valor = parseFloat(input.value);
                if (!isNaN(valor)) {
                    input.style.color = valor < 70 ? "#e74c3c" : "#2b3a67";
                    input.style.borderColor = valor < 70 ? "#e74c3c" : "#edf2f7";
                } else {
                    input.style.color = "#2b3a67";
                    input.style.borderColor = "#edf2f7";
                }
            });
        };

        inputs.forEach(input => input.addEventListener("input", calcularPromedio));
        calcularPromedio(); // Calcular al cargar
    });
}

/**
 * Recopila los datos de la tabla y los envía a la API para guardarlos.
 */
async function guardarCalificaciones() {
    const select = document.getElementById("grupo-select");
    const idGrupo = select.value;

    if (!idGrupo) {
        alert("No hay un grupo seleccionado para guardar.");
        return;
    }

    const rows = document.querySelectorAll("#tabla-body tr");
    const calificacionesParaGuardar = [];

    rows.forEach(row => {
        if (row.dataset.idAlumno) {
            const idAlumno = parseInt(row.dataset.idAlumno);
            const p1 = row.querySelector(".p1").value;
            const p2 = row.querySelector(".p2").value;
            const p3 = row.querySelector(".p3").value;
            const p4 = row.querySelector(".p4").value;
            const p5 = row.querySelector(".p5").value;
            const p6 = row.querySelector(".p6").value;

            calificacionesParaGuardar.push({
                idAlumno: idAlumno,
                p1: p1 === '' ? null : parseInt(p1, 10),
                p2: p2 === '' ? null : parseInt(p2, 10),
                p3: p3 === '' ? null : parseInt(p3, 10),
                p4: p4 === '' ? null : parseInt(p4, 10),
                p5: p5 === '' ? null : parseInt(p5, 10),
                p6: p6 === '' ? null : parseInt(p6, 10)
            });
        }
    });

    if (calificacionesParaGuardar.length === 0) {
        alert("No hay calificaciones para guardar.");
        return;
    }

    const btnGuardar = document.getElementById("btn-guardar");
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Guardando...`;

    try {
        const response = await fetch(`http://localhost:5067/api/profesores/grupos/${idGrupo}/calificaciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(calificacionesParaGuardar)
        });

        const resultado = await response.json();

        if (resultado.success) {
            alert("¡Calificaciones guardadas exitosamente!");
        } else {
            throw new Error(resultado.mensaje || "Error desconocido al guardar.");
        }

    } catch (error) {
        console.error("Error al guardar calificaciones:", error);
        alert(`Error: ${error.message}`);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = `<i class='bx bx-save'></i> Guardar Cambios`;
    }
}