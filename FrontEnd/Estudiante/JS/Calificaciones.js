document.addEventListener("DOMContentLoaded", async () => {
    // 1. Obtener la sesión actual guardada durante el login
    const sesion = localStorage.getItem("alumnoSesion");
    if (!sesion) {
        window.location.href = "Login.html";
        return;
    }
    const alumnoData = JSON.parse(sesion);

    // 2. Cargar perfil superior (Topbar) usando datos reales
    document.getElementById("topbar-carrera").textContent = alumnoData.carrera || "Ingeniería Informática";
    document.getElementById("topbar-foto").src = alumnoData.direccionFoto || "https://i.pinimg.com/736x/cc/ec/06/ccec06bfcef089196f335c17e837b9eb.jpg";
    document.getElementById("topbar-nombre").textContent = alumnoData.nombreCompleto;
    document.getElementById("topbar-control").textContent = alumnoData.id;

    try {
        // 3. Hacer fetch a nuestra nueva ruta de la API
        const respuesta = await fetch(`http://localhost:5067/api/calificacion/alumno/${alumnoData.id}`);
        if (!respuesta.ok) throw new Error("Error al obtener calificaciones");
        
        const materiasDB = await respuesta.json();
        
        // 4. Filtramos para mostrar SOLO las materias del periodo actual
        // Salvavidas: si alumnoData.periodoActual no existe en el caché, tomamos el periodo más alto de sus materias
        const periodoFiltro = alumnoData.periodoActual || (materiasDB.length > 0 ? Math.max(...materiasDB.map(m => m.idPeriodo)) : 0);
        const materiasPeriodoActual = materiasDB.filter(m => m.idPeriodo === periodoFiltro);

        // 5. Procesar la información de la BD (Limpiar nulos y sacar promedio final)
        const materiasProcesadas = materiasPeriodoActual.map(m => {
            // Extraer solo las unidades que el profesor ya haya calificado (no nulas)
            const unidades = [m.u1, m.u2, m.u3, m.u4, m.u5, m.u6].filter(u => u !== null);
            
            let final = 0;
            if (unidades.length > 0) {
                const suma = unidades.reduce((acc, val) => acc + val, 0);
                final = Math.round(suma / unidades.length);
            }

            return {
                ...m,
                unidades: unidades,
                final: final,
                estado: final >= 70 ? "Aprobado" : "Reprobado" // En México, 70 suele ser aprobatorio
            };
        });

        renderizarBoleta(materiasProcesadas);

    } catch (error) {
        console.error("Error cargando calificaciones:", error);
        document.getElementById("boleta").innerHTML = "<p style='color:red;'>No se pudieron cargar las calificaciones en este momento.</p>";
    }
});

function renderizarBoleta(materias) {
    // Calcular y cargar resumen general
    const totalMaterias = materias.length;
    const sumaCalificaciones = materias.reduce((acc, materia) => acc + materia.final, 0);
    const promedioCalculado = totalMaterias > 0 ? (sumaCalificaciones / totalMaterias).toFixed(1) : 0;
    
    const aprobadas = materias.filter(m => m.estado === 'Aprobado').length;
    const reprobadas = materias.filter(m => m.estado === 'Reprobado').length;

    document.getElementById("resumen-promedio").textContent = promedioCalculado;
    document.getElementById("resumen-aprobadas").textContent = aprobadas;
    document.getElementById("resumen-reprobadas").textContent = reprobadas;

    const boletaContenedor = document.getElementById("boleta");
    boletaContenedor.innerHTML = "";

    if (materias.length === 0) {
        boletaContenedor.innerHTML = "<p>No tienes calificaciones registradas en tu boleta actual.</p>";
        return;
    }

    materias.forEach(materia => {
        const unidadesHtml = materia.unidades.map((calif, index) => 
            `<div>U${index + 1} <span>${calif}</span></div>`
        ).join('');

        const claseEstado = materia.estado === 'Aprobado' ? 'aprobado' : 'reprobado';

        boletaContenedor.innerHTML += `
            <div class="card-materia">
                <div class="materia-header">
                    <h3>${materia.nombre}</h3>
                    <span class="badge ${claseEstado}">${materia.estado}</span>
                </div>
                <div class="materia-info">
                    <span><b>Clave:</b> ${materia.clave}</span>
                    <span><b>Docente:</b> ${materia.docente}</span>
                    <span><b>Grupo:</b> ${materia.grupo}</span>
                    <span><b>Créditos:</b> ${materia.creditos}</span>
                </div>
                <div class="unidades">
                    ${unidadesHtml}
                </div>
                <div class="final-materia">
                    Final: <span>${materia.final}</span>
                </div>
            </div>
        `;
    });
}