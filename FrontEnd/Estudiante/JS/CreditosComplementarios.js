// ==========================================
// 2. INICIALIZACIÓN (AL CARGAR LA PÁGINA)
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    const sesion = localStorage.getItem("alumnoSesion");
    if (!sesion) return window.location.href = "Login.html";
    const alumnoData = JSON.parse(sesion);

    // Cargar Perfil Topbar (Con datos reales)
    document.getElementById("topbar-carrera").textContent = alumnoData.carrera;
    document.getElementById("topbar-foto").src = alumnoData.direccionFoto || "https://i.pinimg.com/736x/cc/ec/06/ccec06bfcef089196f335c17e837b9eb.jpg";
    document.getElementById("topbar-nombre").textContent = alumnoData.nombreCompleto;
    document.getElementById("topbar-control").textContent = alumnoData.id;

    try {
        const res = await fetch(`http://localhost:5067/api/creditos/alumno/${alumnoData.id}`);
        if (!res.ok) throw new Error("Error al obtener los créditos");
        const creditos = await res.json();

        const creditosRequeridos = 5;
        // En tu BD: 'Completado' es el estatus de aprobación final.
        const creditosAprobados = creditos.filter(c => c.estado === "Completado").length;

        // Cargar Progreso
        document.getElementById("creditos-completados").textContent = creditosAprobados;
        document.getElementById("creditos-totales").textContent = creditosRequeridos;
        
        const porcentaje = (creditosAprobados / creditosRequeridos) * 100;
        document.getElementById("barra-progreso").style.width = `${porcentaje}%`;

        // Renderizar Lista de Créditos Reales
        const listaContenedor = document.getElementById("lista-creditos");
        listaContenedor.innerHTML = "";

        if (creditos.length === 0) {
            listaContenedor.innerHTML = "<p style='color:#6c757d; font-size:14px;'>No has enviado ninguna evidencia de créditos complementarios.</p>";
        } else {
            creditos.forEach(credito => {
                const claseEstado = credito.estado === "Completado" ? "completado" : (credito.estado === "Rechazado" ? "reprobado" : "pendiente");
                const icono = credito.estado === "Completado" ? "✔" : (credito.estado === "Rechazado" ? "✖" : "⏳");

                listaContenedor.innerHTML += `
                    <div class="credito-item ${claseEstado}">
                        <span class="tipo" style="max-width: 60%;">${credito.actividad} <small style="display:block; font-size:0.8em; color:#6c757d;">${credito.tipo}</small></span>
                        <span class="estado">${icono} ${credito.estado}</span>
                    </div>
                `;
            });
        }

        // Inyectamos un Dropdown (<select>) dinámicamente arriba del input de archivo para no tocar el HTML
        // Ahora consultamos la nueva ruta de "Actividades Disponibles" (toda la oferta de la escuela)
        const resDisponibles = await fetch(`http://localhost:5067/api/creditos/disponibles/${alumnoData.id}`);
        const disponibles = await resDisponibles.json();
        
        const inputArchivo = document.getElementById("archivo");
        if (inputArchivo && !document.getElementById("actividad-select")) {
            let options = '<option value="">Selecciona la actividad a subir...</option>';
            disponibles.forEach(c => {
                options += `<option value="${c.idActividad}">${c.nombre} (${c.tipo})</option>`;
            });
            
            const selectHtml = `<select id="actividad-select" style="width:100%; padding:12px; margin-bottom:15px; border-radius:10px; border: 1px solid #cbd5e1; background: #f8fafc; font-family: 'Poppins', sans-serif;">${options}</select>`;
            inputArchivo.insertAdjacentHTML('beforebegin', selectHtml);
        }
    } catch (e) {
        console.error(e);
    }
});

// ==========================================
// 3. ENVÍO REAL DE EVIDENCIA PDF (CON MULTIPART FORM-DATA)
// ==========================================
window.enviarEvidencia = async function() {
    const archivoInput = document.getElementById("archivo");
    
    if (!archivoInput.files || archivoInput.files.length === 0) {
        alert("Por favor, selecciona un archivo PDF antes de enviar para evaluación.");
        return;
    }

    const selectActividad = document.getElementById("actividad-select");
    if (!selectActividad || selectActividad.value === "") {
        alert("Por favor, selecciona a qué actividad pertenece el archivo.");
        return;
    }

    const alumnoData = JSON.parse(localStorage.getItem("alumnoSesion"));
    const formData = new FormData();
    formData.append("idAlumno", alumnoData.id);
    formData.append("idActividad", selectActividad.value);
    formData.append("archivo", archivoInput.files[0]);
    
    try {
        const res = await fetch("http://localhost:5067/api/creditos/subir", { method: "POST", body: formData });
        const result = await res.json();
        
        if (result.success) {
            alert("¡Evidencia enviada correctamente! Aparecerá como 'Pendiente' hasta ser revisada.");
            window.location.reload(); // Recargamos para ver el crédito en la lista
        } else {
            alert(result.mensaje);
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión al enviar el archivo.");
    }
};