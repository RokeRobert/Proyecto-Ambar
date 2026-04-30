document.addEventListener("DOMContentLoaded", () => {
    // === SIMULACIÓN DE BASE DE DATOS ESTRUCTURADA ===
    const datosPagina = {
        materias: [
            { id: 1, nombre: "Calculo Integral", clave: "2CD-2A" },
            { id: 2, nombre: "Español", clave: "2BD-2B" },
            { id: 3, nombre: "Programación Web", clave: "6AW-3C" }
        ],
        alumnosPorMateria: {
            "2CD-2A": [
                { nombre: "Juan Pérez", control: "20230001", p1: 85, p2: 90, p3: 75 },
                { nombre: "María García", control: "20230002", p1: 60, p2: 40, p3: 65 },
                { nombre: "Carlos Soler", control: "20230003", p1: 100, p2: 95, p3: 100 }
            ],
            "2BD-2B": [
                { nombre: "Ana Martínez", control: "20230004", p1: 95, p2: 100, p3: 90 },
                { nombre: "Luis Fernando", control: "20230005", p1: 50, p2: 60, p3: 55 },
                { nombre: "Sofía Castro", control: "20230006", p1: 88, p2: 85, p3: 92 }
            ],
            "6AW-3C": [
                { nombre: "Kevin Flynn", control: "20230007", p1: 100, p2: 100, p3: 100 },
                { nombre: "Alan Turing", control: "20230008", p1: 40, p2: 50, p3: 30 }
            ]
        }
    };

    const container = document.getElementById("dynamic-render");

    // === FUNCIÓN PARA RENDERIZAR EL MAIN CONTENT ===
    const renderizarPagina = () => {
        container.innerHTML = `
            <h1 class="fade-in">Calificaciones</h1>

            <div class="filters fade-in">
                <div class="select-container">
                    <select id="grupo-select">
                        <option value="" disabled selected>Seleccionar Materia - Clave</option>
                        ${datosPagina.materias.map(m => `<option value="${m.clave}">${m.nombre} - ${m.clave}</option>`).join('')}
                    </select>
                    <i class='bx bx-chevron-down'></i>
                </div>
                <button class="btn-load" id="btn-cargar">
                    <i class='bx bx-refresh'></i> Cargar Datos
                </button>
            </div>

            <section class="card slide-up">
                <h2 id="materia-titulo">Seleccione una materia</h2>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>No. Control</th>
                            <th>Parcial 1</th>
                            <th>Parcial 2</th>
                            <th>Parcial 3</th>
                            <th>Promedio</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-body">
                        <tr><td colspan="7" style="text-align:center;">Seleccione una materia para ver la lista</td></tr>
                    </tbody>
                </table>
            </section>

            <div class="actions fade-in">
                <button class="save"><i class='bx bx-save'></i> Guardar Cambios</button>
                <button class="finalize"><i class='bx bx-check-double'></i> Finalizar</button>
            </div>

            <div class="status-box">
                <i class="fa-solid fa-circle-info"></i>
                <span>Recuerda guardar antes de salir del sistema.</span>
            </div>
        `;

        document.getElementById("btn-cargar").addEventListener("click", actualizarTabla);
    };

    // === FUNCIÓN PARA CAMBIAR LOS ALUMNOS SEGÚN SELECCIÓN ===
    function actualizarTabla() {
        const select = document.getElementById("grupo-select");
        const claveMateria = select.value;
        const tablaBody = document.getElementById("tabla-body");
        const titulo = document.getElementById("materia-titulo");

        if (!claveMateria) return;

        const alumnosMateria = datosPagina.alumnosPorMateria[claveMateria] || [];
        titulo.textContent = `Lista de alumnos - ${claveMateria}`;

        tablaBody.innerHTML = alumnosMateria.map((alumno, index) => `
            <tr>
                <td>${index + 1}</td>
                <td class="student-name">${alumno.nombre}</td>
                <td>${alumno.control}</td>
                <td><input type="number" class="grade-input" min="0" max="100" value="${alumno.p1}" placeholder="0"></td>
                <td><input type="number" class="grade-input" min="0" max="100" value="${alumno.p2}" placeholder="0"></td>
                <td><input type="number" class="grade-input" min="0" max="100" value="${alumno.p3}" placeholder="0"></td>
                <td><span class="status-pill">--</span></td>
            </tr>
        `).join('');

        activarLogicaCalificaciones();
    }

    // === LÓGICA PARA CÁLCULOS ===
    function activarLogicaCalificaciones() {
        const rows = document.querySelectorAll("tbody tr");
        rows.forEach(row => {
            const inputs = row.querySelectorAll(".grade-input");
            const pill = row.querySelector(".status-pill");

            const calcular = () => {
                let suma = 0, contador = 0;
                inputs.forEach(i => {
                    if (i.value !== "") {
                        let valor = parseFloat(i.value);
                        suma += valor;
                        contador++;
                        i.style.color = valor < 70 ? "#e74c3c" : "#2b3a67";
                        i.style.borderColor = valor < 70 ? "#e74c3c" : "#edf2f7";
                    }
                });

                if (contador > 0) {
                    let promedio = (suma / 3).toFixed(1);
                    pill.textContent = promedio;
                    pill.className = promedio < 70 ? "status-pill status-reprobado" : "status-pill status-aprobado";
                } else {
                    pill.textContent = "--";
                    pill.className = "status-pill";
                }
            };

            inputs.forEach(input => input.addEventListener("input", calcular));
            calcular();
        });
    }

    // === INICIO DE LA APLICACIÓN ===
    renderizarPagina();
});