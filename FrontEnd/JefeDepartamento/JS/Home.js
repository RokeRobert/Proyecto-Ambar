document.addEventListener("DOMContentLoaded", async () => {
    // 1. Proteger la pantalla con la sesión
    const sesion = localStorage.getItem("profesorSesion");
    if (!sesion) {
        window.location.href = "/FrontEnd/Profesor/HTML/Login.html";
        return;
    }
    
    const adminData = JSON.parse(sesion);
    const rol = adminData.rol.toLowerCase();
    
    if (rol !== "administrador" && rol !== "jefe de departamento") {
        window.location.href = "/FrontEnd/Profesor/HTML/Login.html";
        return;
    }

    // Cargar datos al abrir la página
    await cargarCarrerasFiltro();
    cargarDashboard();
});

window.filtrarDashboard = function() {
    // Se dispara cuando cambias el select de carrera
    cargarDashboard();
};

async function cargarCarrerasFiltro() {
    try {
        const res = await fetch("http://localhost:5067/api/usuarios/carreras");
        if (res.ok) {
            const carreras = await res.json();
            const select = document.getElementById("filtroCarrera");
            let opciones = '<option value="">Todas las Carreras</option>';
            carreras.forEach(c => {
                opciones += `<option value="${c.id}">${c.nombre}</option>`;
            });
            if(select) select.innerHTML = opciones;
        }
    } catch (e) {
        console.error("Error al cargar las carreras:", e);
    }
}

async function cargarDashboard() {
    const carrera = document.getElementById("filtroCarrera").value;

    try {
        const res = await fetch(`http://localhost:5067/api/dashboard/resumen?carrera=${carrera}`);
        
        if (!res.ok) {
            const errorMsg = await res.text();
            throw new Error(errorMsg || "Error al obtener los datos del dashboard");
        }
        
        const data = await res.json();

        // 1. Llenar los conteos de las Tarjetas Superiores
        document.getElementById("totalAlumnos").textContent = data.totalAlumnos;
        document.getElementById("pagosPendientes").textContent = data.pagosPendientes;
        document.getElementById("creditosPendientes").textContent = data.creditosPendientes;
        document.getElementById("tickets").textContent = data.ticketsAbiertos;

    } catch (error) {
        console.error("Error en Dashboard:", error);
        alert("Error al cargar la base de datos. Revisa la terminal de C# (puede haber un error con las columnas).");
    }
}