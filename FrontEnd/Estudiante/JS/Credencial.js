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
    
    const urlFoto = alumnoData.direccionFoto || "https://i.pinimg.com/736x/cc/ec/06/ccec06bfcef089196f335c17e837b9eb.jpg";
    const imgFoto = document.getElementById("cred-foto");
    
    // Cargamos la imagen permitiendo CORS
    imgFoto.crossOrigin = "anonymous";
    imgFoto.src = urlFoto;

    // Truco: Convertir la imagen a Base64 dinámicamente. 
    // Esto garantiza que html2pdf la pueda "dibujar" en el documento sin que el navegador la bloquee por seguridad y deje el cuadro vacío.
    fetch(urlFoto)
        .then(res => res.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => { imgFoto.src = reader.result; };
            reader.readAsDataURL(blob);
        })
        .catch(err => console.warn("No se pudo convertir a Base64", err));

    // Convertir también el logo de la institución (y cualquier otra imagen estática) a Base64
    const imagenesEstaticas = document.querySelectorAll("img");
    imagenesEstaticas.forEach(img => {
        if (img.id !== "cred-foto" && img.src && !img.src.startsWith("data:image")) {
            const urlImg = img.src;
            fetch(urlImg)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = () => { img.src = reader.result; };
                    reader.readAsDataURL(blob);
                })
                .catch(err => console.warn("No se pudo convertir imagen a Base64, se conservará la URL original", err));
        }
    });

    document.getElementById("cred-nombre").textContent = alumnoData.nombreCompleto.toUpperCase();
    document.getElementById("cred-nacimiento").textContent = alumnoData.fechaNacimiento;
    document.getElementById("cred-carrera").textContent = alumnoData.carrera;
    document.getElementById("cred-semestre").textContent = `${semestreCalculado > 0 ? semestreCalculado : 1}°`;
    document.getElementById("cred-vigencia").textContent = vigencia;
});