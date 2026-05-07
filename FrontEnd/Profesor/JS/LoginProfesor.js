document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm"); // Asumimos que el form tiene id="loginForm"
    const errorMsg = document.getElementById("error-msg");   // Y un div para errores

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const idProfesorInput = document.getElementById("idProfesor").value.trim(); // Asumimos input con id="idProfesor"
            const passwordInput = document.getElementById("password").value.trim();
            const btnSubmit = loginForm.querySelector("button[type='submit']");

            try {
                btnSubmit.textContent = "Iniciando...";
                btnSubmit.disabled = true;

                const response = await fetch("http://localhost:5067/api/profesores/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        IdProfesor: idProfesorInput,
                        Contrasena: passwordInput
                    })
                });

                const datos = await response.json();

                if (datos.success) {
                    // Guardamos los datos del profesor para usarlos en otras pantallas
                    localStorage.setItem("profesorSesion", JSON.stringify(datos.profesor));
                    
                    // Evaluamos el Rol para redirigir a la página correcta
                    const rol = datos.profesor.rol.toLowerCase();

                    if (rol === "administrador" || rol === "jefe de departamento") {
                        // Asumiendo la ruta para el panel de administración
                        window.location.href = "/FrontEnd/JefeDepartamento/HTML/HomeAdmin.html";
                    } else if (rol === "coordinador") {
                        // Asumiendo la ruta para el panel de coordinador
                        window.location.href = "/FrontEnd/Coordinador/HTML/GestionCoordinador.html";
                    } else {
                        // Si es rol "docente" o cualquier otro, va al perfil
                        window.location.href = "/FrontEnd/Profesor/HTML/PerfilDocente.html"; 
                    }
                } else {
                    errorMsg.textContent = datos.mensaje || "Número de empleado o contraseña incorrectos.";
                    errorMsg.style.display = "block";
                }
            } catch (error) {
                console.error("Error en la conexión:", error);
                errorMsg.textContent = "Error al conectar con el servidor. Verifica que tu API esté encendida.";
                errorMsg.style.display = "block";
            } finally {
                btnSubmit.textContent = "Iniciar sesión";
                btnSubmit.disabled = false;
            }
        });
    }
});
