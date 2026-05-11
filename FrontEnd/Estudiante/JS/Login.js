document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMsg = document.getElementById("error-msg");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // Evitamos que el formulario recargue la página por defecto

            const controlInput = document.getElementById("control").value.trim();
            const passwordInput = document.getElementById("password").value.trim();
            const btnSubmit = loginForm.querySelector(".boton-login");

            try {
                // Damos feedback visual al usuario
                btnSubmit.innerHTML = "<i data-lucide='loader' class='spin'></i> Iniciando...";
                btnSubmit.disabled = true;

                // Hacemos la petición POST hacia nuestro Backend en C#
                const response = await fetch("http://localhost:5067/api/auth/alumno/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        NumeroControl: controlInput,
                        Contrasena: passwordInput
                    })
                });

                const datos = await response.json();

                if (datos.success) {
                    errorMsg.style.display = "none";
                    
                    // Convertimos la URL de la foto a absoluta si viene como ruta relativa
                    if (datos.usuario && datos.usuario.direccionFoto && !datos.usuario.direccionFoto.startsWith("http")) {
                        datos.usuario.direccionFoto = `http://localhost:5067${datos.usuario.direccionFoto}`;
                    }

                    // Guardamos temporalmente los datos del alumno (como Nombre y ID) para usarlos en el Home
                    localStorage.setItem("alumnoSesion", JSON.stringify(datos.usuario));
                    window.location.href = "Home.html"; // Redirigimos al inicio
                } else {
                    errorMsg.textContent = datos.mensaje || "Número de control o contraseña incorrectos.";
                    errorMsg.style.display = "block"; // Mostramos la alerta roja
                }
            } catch (error) {
                console.error("Error en la conexión:", error);
                errorMsg.textContent = "Error al conectar con el servidor. Verifica que tu API esté encendida.";
                errorMsg.style.display = "block";
            } finally {
                // Restauramos el botón
                btnSubmit.innerHTML = "<i></i> Iniciar sesión";
                btnSubmit.disabled = false;
            }
        });
    }
});