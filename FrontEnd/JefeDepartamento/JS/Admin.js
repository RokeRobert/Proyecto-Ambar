// SIDEBAR
fetch("/FrontEnd/JefeDepartamento/HTML/Sidebar.html")
.then(res => res.text())
.then(data => {
    document.getElementById("sidebar").innerHTML = data;
    lucide.createIcons();
});

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
        
        const elNombre = document.getElementById("topbar-nombre");
        const elRol = document.getElementById("topbar-rol");
        const elAvatar = document.getElementById("topbar-avatar");

        if (elNombre) elNombre.textContent = nombreCompleto;
        if (elRol) elRol.textContent = rol.charAt(0).toUpperCase() + rol.slice(1); // Capitaliza la primera letra
        if (elAvatar) elAvatar.textContent = nombreCompleto.charAt(0).toUpperCase(); // Primera letra del nombre en el círculo

        // Agregar evento para cerrar sesión al dar clic en el perfil
        const contenedorPerfil = document.querySelector(".perfil");
        if (contenedorPerfil) {
            contenedorPerfil.style.cursor = "pointer";
            contenedorPerfil.title = "Cerrar sesión";

            // Inyectar el HTML y CSS del Modal dinámicamente si no existe
            if (!document.getElementById("modalCerrarSesion")) {
                const modalHTML = `
                    <div id="modalCerrarSesion" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:10000; align-items:center; justify-content:center;">
                        <div style="background:white; padding:30px; border-radius:20px; width:90%; max-width:400px; text-align:center; box-shadow:0 10px 40px rgba(0,0,0,0.2); animation:aparecer 0.3s ease;">
                            <div style="font-size:60px; color:#e53935; margin-bottom:15px; display:flex; justify-content:center;">
                                <i data-lucide="log-out" style="width: 60px; height: 60px;"></i>
                            </div>
                            <h2 style="color:#1a237e; margin-bottom:10px; font-weight:600;">Cerrar Sesión</h2>
                            <p style="color:#64748b; margin-bottom:25px; font-size:15px;">¿Estás seguro de que deseas salir del sistema?</p>
                            <div style="display:flex; gap:15px; justify-content:center;">
                                <button id="btnCancelarSesion" style="background:#f1f5f9; color:#64748b; border:none; padding:12px 25px; border-radius:10px; font-weight:600; cursor:pointer; flex:1; transition:0.3s;">Cancelar</button>
                                <button id="btnConfirmarSesion" style="background:#e53935; color:white; border:none; padding:12px 25px; border-radius:10px; font-weight:600; cursor:pointer; flex:1; transition:0.3s;">Salir</button>
                            </div>
                        </div>
                    </div>
                    <style>
                        @keyframes aparecer { from { transform:scale(0.8); opacity:0; } to { transform:scale(1); opacity:1; } }
                        #btnCancelarSesion:hover { background:#e2e8f0 !important; }
                        #btnConfirmarSesion:hover { background:#b71c1c !important; }
                    </style>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }

            const modal = document.getElementById("modalCerrarSesion");

            contenedorPerfil.addEventListener("click", () => {
                modal.style.display = "flex";
            });

            document.getElementById("btnCancelarSesion").addEventListener("click", () => {
                modal.style.display = "none";
            });

            document.getElementById("btnConfirmarSesion").addEventListener("click", () => {
                localStorage.removeItem("profesorSesion");
                window.location.href = "/FrontEnd/Profesor/HTML/Login.html";
            });
            
            // Cerrar el modal al dar clic fuera de la tarjeta
            window.addEventListener("click", (e) => {
                if (e.target === modal) modal.style.display = "none";
            });
        }
    }
});