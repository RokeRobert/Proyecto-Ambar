let mallaCurricular = [];

document.addEventListener("DOMContentLoaded", async () => {
    const sesion = localStorage.getItem("alumnoSesion");
    if (!sesion) return window.location.href = "Login.html";
    const alumnoData = JSON.parse(sesion);

    const elCarrera = document.getElementById("kardex-carrera");
    if(elCarrera) elCarrera.textContent = alumnoData.carrera;
    
    const elFoto = document.getElementById("kardex-foto");
    if(elFoto) elFoto.src = alumnoData.direccionFoto || "https://i.pinimg.com/736x/cc/ec/06/ccec06bfcef089196f335c17e837b9eb.jpg";
    
    const elNombre = document.getElementById("kardex-nombre");
    if(elNombre) elNombre.textContent = alumnoData.nombreCompleto;
    
    const elControl = document.getElementById("kardex-control");
    if(elControl) elControl.textContent = alumnoData.id;

    const pActual = alumnoData.periodoActual || 2; 
    const pIngreso = alumnoData.periodoIngreso || 1;
    const semestreCalculado = (pActual - pIngreso) + 1;

    const elEspecialidad = document.getElementById("kardex-especialidad");
    if(elEspecialidad) elEspecialidad.textContent = alumnoData.especialidad;

    const elSemestre = document.getElementById("kardex-semestre");
    if(elSemestre) elSemestre.textContent = `${semestreCalculado > 0 ? semestreCalculado : 1}°`;

    const elSituacion = document.getElementById("kardex-situacion");
    if(elSituacion) elSituacion.textContent = alumnoData.estatus;

    const elIngreso = document.getElementById("kardex-ingreso");
    if(elIngreso) elIngreso.textContent = `Periodo ${pIngreso}`;

    try {
        const respuesta = await fetch(`http://localhost:5067/api/kardex/alumno/${alumnoData.id}`);
        if (!respuesta.ok) throw new Error("Error al obtener kardex");
        const materiasDB = await respuesta.json();

        // Encontrar el periodo más reciente real del alumno para marcar la "carga actual" correctamente
        const periodosInscritos = materiasDB.map(m => m.idPeriodo).filter(p => p !== null);
        const periodoFiltro = periodosInscritos.length > 0 ? Math.max(...periodosInscritos) : (alumnoData.periodoActual || 2);

        // Agrupar materias repetidas por si las recursó, tomar la de periodo más reciente
        const materiasMap = new Map();
        materiasDB.forEach(m => {
            if (!materiasMap.has(m.idMateria) || materiasMap.get(m.idMateria).idPeriodo < m.idPeriodo) {
                materiasMap.set(m.idMateria, m);
            }
        });

        let creditosAcumulados = 0;
        let creditosTotales = 0;

        materiasMap.forEach(m => {
            creditosTotales += m.creditos;
            const unidades = [m.u1, m.u2, m.u3, m.u4, m.u5, m.u6].filter(u => u !== null);
            let final = 0;
            if (unidades.length > 0) final = Math.round(unidades.reduce((a, b) => a + b, 0) / unidades.length);

            let estado = "futura";
            if (m.idPeriodo && m.idPeriodo === periodoFiltro) {
                estado = "actual";
            } else if (final >= 70) {
                estado = "aprobado";
                creditosAcumulados += m.creditos;
            } else if (m.idPeriodo) {
                estado = "reprobado";
            }

            let sem = mallaCurricular.find(s => s.semestre === m.semestre);
            if (!sem) {
                sem = { semestre: m.semestre, materias: [] };
                mallaCurricular.push(sem);
            }
            sem.materias.push({
                id: `M${m.idMateria}`, nombre: m.nombre, clave: m.clave, creditos: m.creditos, calificacion: final > 0 ? final : "-", estado: estado, requiere: m.requiere ? `M${m.requiere}` : null
            });
        });

        mallaCurricular.sort((a, b) => a.semestre - b.semestre);

        const porcentaje = creditosTotales > 0 ? ((creditosAcumulados / creditosTotales) * 100).toFixed(2) : 0;
        
        document.getElementById("kardex-cred-acumulados").textContent = creditosAcumulados;
        document.getElementById("kardex-cred-totales").textContent = creditosTotales;
        document.getElementById("kardex-porcentaje").textContent = `${porcentaje}%`;
        document.getElementById("kardex-barra-progreso").style.width = `${porcentaje}%`;

        renderMalla();
    } catch (error) {
        console.error(error);
        document.getElementById("malla-curricular").innerHTML = "<p style='color:red; font-weight:bold;'>No se pudo cargar la malla curricular desde la base de datos.</p>";
    }
});

// ==========================================
// 3. RENDERIZADO DINÁMICO DE LA MALLA
// ==========================================
function renderMalla() {
    const contenedor = document.getElementById("malla-curricular");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    mallaCurricular.forEach(sem => {
        // Creamos una columna contenedora para que las materias se apilen hacia abajo
        const colDiv = document.createElement("div");
        colDiv.className = "columna-semestre";
        colDiv.style.display = "flex";
        colDiv.style.flexDirection = "column";
        colDiv.style.gap = "15px";

        // Agregamos un pequeño título indicando qué semestre es
        const tituloSem = document.createElement("div");
        tituloSem.style.textAlign = "center";
        tituloSem.style.fontWeight = "bold";
        tituloSem.style.color = "#0b2a4a";
        tituloSem.textContent = `Sem. ${sem.semestre}`;
        colDiv.appendChild(tituloSem);

        sem.materias.forEach(mat => {
            const matDiv = document.createElement("div");
            matDiv.className = `materia ${mat.estado}`;
            matDiv.dataset.id = mat.id;
            if(mat.requiere) matDiv.dataset.requiere = mat.requiere;

            matDiv.innerHTML = `
                ${mat.clave}<br>
                <span>${mat.nombre}</span>
                ${mat.requiere ? '<div class="icono-serie">🔗</div>' : ''}
            `;
            
            colDiv.appendChild(matDiv);
        });
        
        contenedor.appendChild(colDiv);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();

    aplicarLogicaSeriacion();
    inicializarEventosResaltado();
}

// ==========================================
// 4. LÓGICA ORIGINAL DE BLOQUEO DE MATERIAS
// ==========================================
function aplicarLogicaSeriacion() {
    const materias = document.querySelectorAll(".materia");
    materias.forEach(materia => {
        // Si el alumno ya la aprobó o la está cursando actualmente, evitamos bloquearla visualmente
        if (materia.classList.contains("aprobado") || materia.classList.contains("actual")) {
            return;
        }

        const requisito = materia.dataset.requiere;
        if (requisito && requisito !== "null") {
            const materiaBase = document.querySelector(`[data-id="${requisito}"]`);
            if (materiaBase && !materiaBase.classList.contains("aprobado")) {
                materia.classList.add("bloqueada");
                materia.classList.remove("aprobado", "actual", "futura");
            } else {
                materia.classList.remove("bloqueada");
                materia.classList.add("desbloqueada");
                const candado = materia.querySelector(".candado");
                if (candado) candado.remove();
            }
        }
    });
}

// ==========================================
// 5. LÓGICA ORIGINAL DE RESALTAR SERIACIÓN
// ==========================================
function inicializarEventosResaltado() {
    const iconos = document.querySelectorAll(".icono-serie");
    const materias = document.querySelectorAll(".materia");

    iconos.forEach(icono => {
        icono.addEventListener("click", (e) => {
            e.stopPropagation();
            const materiaActual = icono.parentElement;
            const idActual = materiaActual.dataset.id;

            materias.forEach(m => { m.classList.remove("resaltada", "atenuada"); });
            materias.forEach(m => { m.classList.add("atenuada"); });

            materiaActual.classList.remove("atenuada");
            materiaActual.classList.add("resaltada");

            materias.forEach(m => {
                if (m.dataset.requiere === idActual) {
                    m.classList.remove("atenuada");
                    m.classList.add("resaltada");
                }
                if (materiaActual.dataset.requiere === m.dataset.id) {
                    m.classList.remove("atenuada");
                    m.classList.add("resaltada");
                }
            });
        });
    });

    document.addEventListener("click", () => {
        materias.forEach(m => {
            m.classList.remove("resaltada", "atenuada");
        });
    });
}