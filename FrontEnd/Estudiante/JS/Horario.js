document.addEventListener("DOMContentLoaded", async () => {
    const sesion = localStorage.getItem("alumnoSesion");
    if (!sesion) return window.location.href = "Login.html";
    
    const alumnoData = JSON.parse(sesion);

    // Inyectar datos reales del perfil
    document.getElementById("horario-carrera").textContent = alumnoData.carrera;
    document.getElementById("horario-foto").src = alumnoData.direccionFoto || "https://i.pinimg.com/736x/cc/ec/06/ccec06bfcef089196f335c17e837b9eb.jpg";
    document.getElementById("horario-nombre").textContent = alumnoData.nombreCompleto;
    document.getElementById("horario-control").textContent = alumnoData.id;

    // Renderizar la tabla de horario
    const tbody = document.getElementById("cuerpo-horario");

    try {
        const periodoActual = alumnoData.periodoActual || 2;
        const respuesta = await fetch(`http://localhost:5067/api/horario/alumno/${alumnoData.id}?periodo=${periodoActual}`);
        
        if (!respuesta.ok) throw new Error("Error al obtener horario");
        const horarioDB = await respuesta.json();
        
        if (horarioDB.length === 0) {
            tbody.innerHTML = "<tr><td colspan='6' style='text-align:center'>No tienes horario registrado para este periodo.</td></tr>";
            return;
        }

        // Paleta de colores para asignar a cada materia
        const paleta = ["azul", "verde", "naranja", "morado", "rojo", "teal"];
        const coloresAsignados = {};
        let colorIndex = 0;

        // Generar las filas dinámicamente de 7:00 a 21:00 (Matriz Fija)
        for (let h = 7; h <= 21; h++) {
            let tr = document.createElement("tr");
            let rango = `${h}:00 - ${h+1}:00`;
            let htmlCeldas = `<td class="hora">${rango}</td>`;

            // Recorrer de Lunes (1) a Viernes (5)
            for (let dia = 1; dia <= 5; dia++) {
                const clase = horarioDB.find(c => parseInt(c.horaInicio.split(':')[0], 10) === h && c.dia === dia);
                
                if (clase) {
                    // Asignar color si la materia no lo tiene aún
                    if (!coloresAsignados[clase.materia]) {
                        coloresAsignados[clase.materia] = paleta[colorIndex % paleta.length];
                        colorIndex++;
                    }
                    htmlCeldas += `<td class="materia ${coloresAsignados[clase.materia]}">${clase.materia}<br><span>Aula: ${clase.aula}</span></td>`;
                } else {
                    htmlCeldas += `<td class="materia gris">—</td>`;
                }
            }

            tr.innerHTML = htmlCeldas;
            tbody.appendChild(tr);
        }

    } catch (error) {
        console.error(error);
        tbody.innerHTML = "<tr><td colspan='6' style='text-align:center; color:red;'>No se pudo cargar el horario en este momento.</td></tr>";
    }
});