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
        const respuesta = await fetch(`http://localhost:5067/api/kardex/alumno/${alumno.id}`);
        if (respuesta.ok) {
            const todasMaterias = await respuesta.json();
            
            // 1. Identificamos cuál es el último periodo (Carga Actual)
            const periodosInscritos = todasMaterias.map(m => m.idPeriodo).filter(p => p !== null);
            const periodoFiltro = periodosInscritos.length > 0 ? Math.max(...periodosInscritos) : (alumno.periodoActual || 2);

            // 2. Pre-procesar materias para sacar su promedio final
            const cursadas = todasMaterias.map(m => {
                const limiteUnidades = m.unidad || m.Unidad || m.unidades || 6;
                const unidades = [];
                for(let i = 1; i <= limiteUnidades; i++) {
                    const val = m[`u${i}`] ?? m[`U${i}`];
                    if (val !== null && val !== undefined && val !== "") unidades.push(parseFloat(val));
                }

                let final = 0;
                if (unidades.length > 0) final = Math.round(unidades.reduce((a, b) => a + b, 0) / unidades.length);
                return { ...m, final };
            }).filter(m => {
                const estaTerminada = (m.idEstatus == 2 || m.id_estatus == 2 || m.estatus == 2 || m.Estatus == 2);
                // Es "Carga Actual" si pertenece al último periodo y NO está terminada
                const esCargaActual = (m.idPeriodo === periodoFiltro) && !estaTerminada;
                
                // Solo conservamos las materias que NO son carga actual y que tienen un periodo válido
                return m.idPeriodo !== null && !esCargaActual;
            });

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

    // Pestaña Carga Académica - Consulta al Semáforo Real
    try {
        const resSemaforo = await fetch(`http://localhost:5067/api/semaforo/alumno/${alumno.id}`);
        if (resSemaforo.ok) {
            const dataTurno = await resSemaforo.json();
            if (dataTurno.tieneTurno) {
                const fInicio = new Date(dataTurno.fechaInicio);
                document.getElementById("home-fecha-carga").textContent = fInicio.toLocaleDateString('es-MX');
                document.getElementById("home-hora-carga").textContent = fInicio.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            } else {
                document.getElementById("home-fecha-carga").textContent = "Sin asignar";
                document.getElementById("home-hora-carga").textContent = "--:--";
            }
        }
    } catch (e) {
        document.getElementById("home-fecha-carga").textContent = "Error de conexión";
        document.getElementById("home-hora-carga").textContent = "--:--";
    }
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

    const API_BASE_URL = 'http://localhost:5067';
    const sesionJSON = localStorage.getItem("alumnoSesion");
    if (!sesionJSON) return; 
    const alumnoSesion = JSON.parse(sesionJSON);

    // ==========================================
    // 📸 LÓGICA PARA CAMBIAR FOTO DE PERFIL
    // ==========================================
    const inputArchivo = document.getElementById('inputFotoPerfil');
    const fotoPreview = document.getElementById('fotoPerfil');

    if (inputArchivo) {
        inputArchivo.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Vista previa local rápida
            const reader = new FileReader();
            reader.onload = (e) => { if (fotoPreview) fotoPreview.src = e.target.result; };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`${API_BASE_URL}/api/alumnos/${alumnoSesion.id}/foto`, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success) {
                    alert(result.mensaje);
                    // Actualizamos memoria y recargamos vista
                    alumnoSesion.direccionFoto = `${API_BASE_URL}${result.fotoUrl}`;
                    localStorage.setItem("alumnoSesion", JSON.stringify(alumnoSesion));
                    cargarDatosHome(alumnoSesion);
                } else throw new Error(result.mensaje);
            } catch (error) {
                alert(`Error al subir foto: ${error.message}`);
                // Si falla, regresamos a la foto anterior
                fotoPreview.src = alumnoSesion.direccionFoto || "https://i.pinimg.com/736x/cc/ec/06/ccec06bfcef089196f335c17e837b9eb.jpg";
            } finally { event.target.value = ''; }
        });
    }

    // ==========================================
    // 🔒 LÓGICA PARA CAMBIAR CONTRASEÑA
    // ==========================================
    const btnGuardarPass = document.getElementById('btnGuardarPassword');
    if (btnGuardarPass) {
        btnGuardarPass.addEventListener('click', async () => {
            const actual = document.getElementById('actual').value.trim();
            const nueva = document.getElementById('nueva').value.trim();
            const confirma = document.getElementById('confirmar').value.trim();

            if (nueva.length < 8) return alert("La nueva contraseña debe tener al menos 8 caracteres.");
            if (nueva !== confirma) return alert("Las contraseñas no coinciden.");
            if (!actual) return alert("Por favor, ingrese su contraseña actual.");

            const textoOriginal = btnGuardarPass.innerText;
            btnGuardarPass.disabled = true;
            btnGuardarPass.innerText = 'Guardando...';

            try {
                const response = await fetch(`${API_BASE_URL}/api/alumnos/${alumnoSesion.id}/cambiar-contrasena`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contrasenaActual: actual, nuevaContrasena: nueva, confirmarContrasena: confirma })
                });
                const result = await response.json();
                if (result.success) { alert(result.mensaje); cerrarPassword(); } 
                else throw new Error(result.mensaje);
            } catch (error) { alert(`Error: ${error.message}`); } 
            finally { btnGuardarPass.disabled = false; btnGuardarPass.innerText = textoOriginal; }
        });
    }
}
window.abrirPassword = () => document.getElementById("modalPassword").style.display = "flex";
window.cerrarPassword = () => { 
    document.getElementById("modalPassword").style.display = "none"; 
    document.getElementById("actual").value = ''; 
    document.getElementById("nueva").value = ''; 
    document.getElementById("confirmar").value = ''; 
}
window.abrirImagen = () => { document.getElementById("imgGrande").src = document.getElementById("fotoPerfil").src; document.getElementById("modalImagen").style.display = "flex"; }
window.cerrarImagen = () => document.getElementById("modalImagen").style.display = "none";

window.togglePass = function(id, icon) {
    const input = document.getElementById(id);
    if(input.type === "password") { input.type = "text"; icon.setAttribute("data-lucide", "eye-off"); } 
    else { input.type = "password"; icon.setAttribute("data-lucide", "eye"); }
    lucide.createIcons(); // Recarga el icono
}