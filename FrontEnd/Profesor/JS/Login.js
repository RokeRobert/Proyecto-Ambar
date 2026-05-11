document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("formLoginDocente"); // Asegúrate de que tu etiqueta <form> en el HTML tenga este ID
    
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Asegúrate de que tus inputs en HTML tengan id="idProfesor" e id="contrasena"
            const idProfesor = document.getElementById("idProfesor").value.trim();
            const contrasena = document.getElementById("contrasena").value.trim();
            const mensajeError = document.getElementById("mensajeError"); // Un <p> o <div> para mostrar errores

            if (!idProfesor || !contrasena) {
                mensajeError.textContent = "Por favor, ingresa tu usuario y contraseña.";
                mensajeError.style.display = "block";
                return;
            }

            try {
                const response = await fetch("http://localhost:5067/api/profesores/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idProfesor, contrasena })
                });

                // Leemos el texto crudo para evitar que se rompa si el servidor devuelve algo vacío o HTML
                const textResult = await response.text();
                
                if (!textResult) {
                    throw new Error("El servidor no devolvió respuesta (Posible error 404). Asegúrate de haber reiniciado tu API.");
                }

                let result;
                try {
                    result = JSON.parse(textResult);
                } catch (e) {
                    console.error("Respuesta cruda del servidor:", textResult);
                    throw new Error("Error interno. Revisa la terminal de tu API.");
                }

                if (result.success) {
                    // 1. Guardamos la sesión (igual que con el alumno)
                    localStorage.setItem("profesorSesion", JSON.stringify(result.profesor));

                    // 2. Evaluamos el Rol y redirigimos
                    const rol = result.profesor.rol.toLowerCase();
                    
                    if (rol === "administrador" || rol === "jefe de departamento") {
                        window.location.href = "/FrontEnd/JefeDepartamento/HTML/HomeAdmin.html";
                    } else {
                        // Coordinadores y Docentes van directamente a su Perfil
                        window.location.href = "/FrontEnd/Profesor/HTML/PerfilDocente.html"; 
                    }
                } else {
                    mensajeError.textContent = result.mensaje || "Credenciales incorrectas.";
                    mensajeError.style.display = "block";
                }
            } catch (error) {
                console.error("Error en login:", error);
                mensajeError.textContent = error.message || "Error al conectar con el servidor.";
                mensajeError.style.display = "block";
            }
        });
    }
});