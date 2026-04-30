document.addEventListener("DOMContentLoaded", async () => {
    // 1. Recuperamos la sesión desde la memoria del navegador
    const sesion = localStorage.getItem("alumnoSesion");
    
    // Si por alguna razón intenta entrar al Home sin iniciar sesión, lo expulsamos al Login
    if (!sesion) {
        window.location.href = "Login.html";
        return;
    }

    // Convertimos el string a un objeto JSON
    const alumnoData = JSON.parse(sesion);

    // 2. Inyectamos los datos en la pantalla
    await cargarDatosHome(alumnoData);
    inicializarTabs();
    inicializarEventos();
});

async function cargarDatosHome(alumno) {
    // Perfil Principal
    // Si en la base de datos no tiene foto, ponemos una por defecto
    document.getElementById("fotoPerfil").src = alumno.direccionFoto || "https://i.pinimg.com/736x/cc/ec/06/ccec06bfcef089196f335c17e837b9eb.jpg";
    document.getElementById("home-nombre").textContent = alumno.nombreCompleto.toUpperCase();
    document.getElementById("home-matricula").textContent = alumno.id;
    document.getElementById("home-correo").textContent = alumno.correo.toUpperCase();
    document.getElementById("home-estatus").textContent = alumno.estatus.toUpperCase();

    // Información Académica
    document.getElementById("home-carrera").textContent = alumno.carrera;
    document.getElementById("home-especialidad").textContent = alumno.especialidad;
    
    // CÁLCULO DEL SEMESTRE
    // Si por alguna razón la sesión está desactualizada, usamos valores por defecto (2 y 1)
    const pActual = alumno.periodoActual || 2; 
    const pIngreso = alumno.periodoIngreso || 1;
    const semestreCalculado = (pActual - pIngreso) + 1;
    document.getElementById("home-semestre").textContent = `${semestreCalculado > 0 ? semestreCalculado : 1}°`;

    // CÁLCULO DE PROMEDIOS (Históricos)
    try {
        const respuesta = await fetch(`http://localhost:5067/api/calificacion/alumno/${alumno.id}`);
        if (respuesta.ok) {
            const todasMaterias = await respuesta.json();
            
            // Pre-procesar materias para sacar su promedio final
            const cursadas = todasMaterias.map(m => {
                const unidades = [m.u1, m.u2, m.u3, m.u4, m.u5, m.u6].filter(u => u !== null);
                let final = 0;
                if (unidades.length > 0) final = Math.round(unidades.reduce((a, b) => a + b, 0) / unidades.length);
                return { ...m, final };
            }).filter(m => m.final > 0); // Excluir materias que aún no tienen calificaciones registradas

            // 1. Promedio CON reprobadas (Todas las materias)
            const promCon = cursadas.length > 0 ? (cursadas.reduce((acc, m) => acc + m.final, 0) / cursadas.length) : 0;
            
            // 2. Promedio SIN reprobadas (Solo materias >= 70)
            const aprobadas = cursadas.filter(m => m.final >= 70);
            const promSin = aprobadas.length > 0 ? (aprobadas.reduce((acc, m) => acc + m.final, 0) / aprobadas.length) : 0;

            // 3. Promedio Último Semestre
            const maxPeriodoCursado = cursadas.length > 0 ? Math.max(...cursadas.map(m => m.idPeriodo)) : 0;
            const materiasUltimo = cursadas.filter(m => m.idPeriodo === maxPeriodoCursado);
            const promUlt = materiasUltimo.length > 0 ? (materiasUltimo.reduce((acc, m) => acc + m.final, 0) / materiasUltimo.length) : 0;

            // Pintar promedios
            document.getElementById("home-prom-sin").textContent = promSin.toFixed(2);
            document.getElementById("home-prom-con").textContent = promCon.toFixed(2);
            document.getElementById("home-prom-ult").textContent = promUlt.toFixed(2);
        }
    } catch (e) {
        document.getElementById("home-prom-sin").textContent = "N/A";
        document.getElementById("home-prom-con").textContent = "N/A";
        document.getElementById("home-prom-ult").textContent = "N/A";
    }

    // Pestaña Datos Personales
    document.getElementById("home-curp").textContent = alumno.curp;
    document.getElementById("home-telefono").textContent = alumno.telefono;
    document.getElementById("home-correo-personal").textContent = alumno.correoPersonal;
    document.getElementById("home-nacimiento").textContent = alumno.fechaNacimiento;
    document.getElementById("home-ciudad").textContent = alumno.ciudad;
    document.getElementById("home-colonia").textContent = alumno.colonia;
    document.getElementById("home-calle").textContent = alumno.calle;
    document.getElementById("home-cp").textContent = alumno.cp;

    // Pestaña Carga Académica (Simulado hasta el módulo de Carga)
    document.getElementById("home-fecha-carga").textContent = "16/01/2026";
    document.getElementById("home-hora-carga").textContent = "14:00";
    document.getElementById("home-adeudos").textContent = "No cuenta con adeudos";
}

function inicializarTabs() {
    const tabs = document.querySelectorAll(".tabs-header .tab");
    const contents = document.querySelectorAll(".tabs-body .tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Quitamos la clase 'active' de todas las pestañas y contenidos
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            // Activamos solo la seleccionada
            tab.classList.add("active");
            const target = document.getElementById(tab.dataset.tab);
            if(target) target.classList.add("active");
        });
    });
}

// ==========================================
// 5. FUNCIONALIDAD DE MODALES
// ==========================================
function inicializarEventos() {
    document.querySelector(".logout").addEventListener("click", () => document.getElementById("modalLogout").style.display = "flex");
}
window.cerrarLogout = () => document.getElementById("modalLogout").style.display = "none";
window.ejecutarLogout = () => window.location.href = "Login.html";
window.abrirPassword = () => document.getElementById("modalPassword").style.display = "flex";
window.cerrarPassword = () => document.getElementById("modalPassword").style.display = "none";
window.abrirImagen = () => { document.getElementById("imgGrande").src = document.getElementById("fotoPerfil").src; document.getElementById("modalImagen").style.display = "flex"; }
window.cerrarImagen = () => document.getElementById("modalImagen").style.display = "none";

window.togglePass = function(id, icon) {
    const input = document.getElementById(id);
    if(input.type === "password") { input.type = "text"; icon.setAttribute("data-lucide", "eye-off"); } 
    else { input.type = "password"; icon.setAttribute("data-lucide", "eye"); }
    lucide.createIcons(); // Recarga el icono
}

// CERRAR SESIÓN REAL
window.ejecutarLogout = () => {
    localStorage.removeItem("alumnoSesion"); // Borramos la memoria
    window.location.href = "Login.html"; // Lo sacamos del sistema
}