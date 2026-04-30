document.addEventListener("DOMContentLoaded", () => {
    // 1. Recuperar los datos de la sesión guardados en el Login
    const sesion = localStorage.getItem("alumnoSesion");
    if (!sesion) {
        window.location.href = "Login.html";
        return;
    }

    const alumnoData = JSON.parse(sesion);

    // 2. Calcular el semestre dinámicamente como en el Home
    const pActual = alumnoData.periodoActual || 2; 
    const pIngreso = alumnoData.periodoIngreso || 1;
    const semestreCalculado = (pActual - pIngreso) + 1;

    // 3. Calcular Vigencia (Ejemplo: Año actual + 1)
    const anioActual = new Date().getFullYear();
    const vigencia = anioActual + 1;

    // 4. Inyectar los datos en la Credencial
    document.getElementById("cred-folio").textContent = `No. ${alumnoData.id}`;
    document.getElementById("cred-foto").src = alumnoData.direccionFoto || "https://i.pinimg.com/736x/cc/ec/06/ccec06bfcef089196f335c17e837b9eb.jpg";
    document.getElementById("cred-nombre").textContent = alumnoData.nombreCompleto.toUpperCase();
    document.getElementById("cred-nacimiento").textContent = alumnoData.fechaNacimiento;
    document.getElementById("cred-carrera").textContent = alumnoData.carrera;
    document.getElementById("cred-semestre").textContent = `${semestreCalculado > 0 ? semestreCalculado : 1}°`;
    document.getElementById("cred-vigencia").textContent = vigencia;
});