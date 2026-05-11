// TOPBAR
fetch("/FrontEnd/JefeDepartamento/HTML/Topbar.html")
.then(res => res.text())
.then(data => {
    document.getElementById("topbar").innerHTML = data;

    // Cargar datos de la sesión activa en el Topbar
    const sesion = localStorage.getItem("profesorSesion");
    if (sesion) {
        const adminData = JSON.parse(sesion);
        
        const nombreCompleto = adminData.nombreCompleto || "Usuario";
        const rol = adminData.rol || "Administrador";
        const fotoUrl = adminData.fotoUrl || adminData.FotoUrl;
        
        const elNombre = document.getElementById("topbar-nombre");
        const elRol = document.getElementById("topbar-rol");
        const elAvatar = document.getElementById("topbar-avatar");

        if (elNombre) elNombre.textContent = nombreCompleto;
        if (elRol) elRol.textContent = rol.charAt(0).toUpperCase() + rol.slice(1); // Capitaliza la primera letra
        if (elAvatar) {
            if (fotoUrl) {
                const urlCompleta = fotoUrl.startsWith("http") ? fotoUrl : `http://localhost:5067${fotoUrl}`;
                elAvatar.innerHTML = `<img src="${urlCompleta}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            } else {
                elAvatar.textContent = nombreCompleto.charAt(0).toUpperCase(); // Primera letra del nombre en el círculo
            }
        }
    }
});