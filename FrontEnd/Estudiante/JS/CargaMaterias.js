let materiasDisponibles = [];
let paquetesDisponibles = []; // Vacío hasta que tengamos base de datos de paquetes

// Paleta de colores para el horario dinámico
const colores = ["#0284c7", "#059669", "#7c3aed", "#e11d48", "#ea580c", "#4f46e5", "#db2777"];

// ==========================================
// 2. VARIABLES DE ESTADO GLOBALES
// ==========================================
let materiasCargadas = [];       // Arreglo que guardará las materias que el alumno elija
const MAX_CREDITOS = 30;         // Límite máximo de créditos permitidos
let materiaSeleccionada = null;  // Guardará temporalmente la materia al abrir el modal de Preview
let paqueteSeleccionado = null;  // Guardará temporalmente el paquete al abrir el modal

// ==========================================
// 3. INICIALIZACIÓN (CUANDO CARGA LA PÁGINA)
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    const sesion = localStorage.getItem("alumnoSesion");
    if (!sesion) return window.location.href = "Login.html";
    const alumnoData = JSON.parse(sesion);

    const pActual = alumnoData.periodoActual || 2; 
    const pIngreso = alumnoData.periodoIngreso || 1;
    
    document.getElementById("alumno-nombre").textContent = alumnoData.nombreCompleto;
    document.getElementById("alumno-carrera").textContent = alumnoData.carrera;
    document.getElementById("alumno-semestre").textContent = `${(pActual - pIngreso) + 1}°`;

    // Petición al Backend para obtener oferta académica
    try {
        const respuesta = await fetch(`http://localhost:5067/api/cargamaterias/disponibles/alumno/${alumnoData.id}?periodo=${pActual}`);
        const data = await respuesta.json();
        
        const contenedorPadre = document.querySelector(".lista-materias").parentNode;
        
        if (data.abierto) {
            // DIBUJAMOS EL SEMÁFORO VERDE
            const semaforo = document.createElement("div");
            semaforo.innerHTML = "<strong>🟢 Período de Inscripciones Abierto</strong> (Simulado para demostración)";
            semaforo.style.cssText = "background:#e8f5e9; color:#1b5e20; padding:12px 20px; border-radius:10px; margin-bottom:20px; font-weight:bold; border-left:5px solid #1bbf5c;";
            contenedorPadre.insertBefore(semaforo, document.querySelector(".lista-materias"));

            // Formateamos los datos para nuestra vista
            materiasDisponibles = data.materias.map(m => {
                let estructurado = [];
                let diasSet = new Set();
                let horaTexto = "Sin horario definido";
                
                if (m.horarioRaw) {
                    m.horarioRaw.split(',').forEach(par => {
                        const [dia, hora] = par.split(':');
                        estructurado.push({ dia: parseInt(dia), hora: parseInt(hora) });
                        diasSet.add(dia);
                        horaTexto = hora + ":00"; 
                    });
                }
                
                const nombresDias = ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
                const diasArray = Array.from(diasSet).map(d => nombresDias[parseInt(d)]).join(", ");
                
                return {
                    id: m.idGrupo, // Usamos ID del Grupo como identificador principal
                    idMateria: m.idMateria,
                    nombre: m.nombre,
                    clave: m.clave,
                    docente: m.docente,
                    creditos: m.creditos,
                    horario: estructurado.length > 0 ? `${diasArray} a las ${horaTexto}` : horaTexto,
                    horarioEstructurado: estructurado
                };
            });

            // 1. GENERAMOS UN PAQUETE DINÁMICO DE PRUEBA
            if (materiasDisponibles.length >= 3) {
                paquetesDisponibles = [{
                    id: 'P1',
                    nombre: 'Paquete Sugerido (Demo)',
                    materias: [materiasDisponibles[0].id, materiasDisponibles[1].id, materiasDisponibles[2].id]
                }];
            }

            // 2. PRE-CARGAMOS LAS MATERIAS EN LAS QUE YA ESTÁ INSCRITO
            const resCalif = await fetch(`http://localhost:5067/api/calificacion/alumno/${alumnoData.id}`);
            if (resCalif.ok) {
                const calificaciones = await resCalif.json();
                const gruposInscritos = calificaciones.filter(c => c.idPeriodo === pActual).map(c => parseInt(c.grupo));
                
                gruposInscritos.forEach(idG => {
                    const mat = materiasDisponibles.find(m => m.id === idG);
                    if (mat && !materiasCargadas.some(mc => mc.id === mat.id)) materiasCargadas.push(mat);
                });
            }
        } else {
            // DIBUJAMOS EL SEMÁFORO ROJO
            const semaforo = document.createElement("div");
            semaforo.innerHTML = `<strong>🔴 ${data.mensaje}</strong>`;
            semaforo.style.cssText = "background:#ffebee; color:#c62828; padding:12px 20px; border-radius:10px; margin-bottom:20px; font-weight:bold; border-left:5px solid #ef4444;";
            contenedorPadre.insertBefore(semaforo, document.querySelector(".lista-materias"));
        }
    } catch (e) {
        console.error(e);
    }

    renderMateriasDisponibles();
    renderMateriasCargadas(); // Mostramos las que ya tiene inscritas
    actualizarDashboard();
    inicializarTabs();
    inicializarEventosTicket();
});

// ==========================================
// 3.8 MANEJO DE PESTAÑAS (MATERIAS / PAQUETES)
// ==========================================
function inicializarTabs() {
    const tabs = document.querySelectorAll(".subtab");
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            tabs.forEach(t => t.classList.remove("activo"));
            e.target.classList.add("activo");

            const opcion = e.target.textContent.trim();
            if (opcion === "Paquetes") {
                renderPaquetes();
            } else {
                renderMateriasDisponibles();
            }
        });
    });
}

// ==========================================
// 4. FUNCIÓN PARA PINTAR MATERIAS DISPONIBLES
// ==========================================
function renderMateriasDisponibles() {
    const contenedor = document.querySelector(".lista-materias");
    contenedor.innerHTML = ""; // Limpiamos el HTML quemado

    materiasDisponibles.forEach(materia => {
        // Si la materia ya fue cargada por el alumno, la saltamos para que desaparezca de "Disponibles"
        const yaEstaCargada = materiasCargadas.some(m => m.id === materia.id);
        if (yaEstaCargada) return;

        // Creamos la tarjeta HTML de la materia dinámicamente
        const card = document.createElement("div");
        card.className = "card-materia";
        card.innerHTML = `
            <div class="info">
                <h4>${materia.nombre}</h4>
                <span>${materia.clave}</span>
                <p>${materia.docente}</p>
                <p class="creditos">${materia.creditos} créditos</p>
            </div>
            <button class="btn-seleccionar" onclick="abrirPreview(${materia.id})">
                Seleccionar
            </button>
        `;
        contenedor.appendChild(card);
    });
}

// ==========================================
// 4.5 FUNCIÓN PARA PINTAR PAQUETES
// ==========================================
function renderPaquetes() {
    const contenedor = document.querySelector(".lista-materias");
    contenedor.innerHTML = ""; // Limpiamos la vista actual

    paquetesDisponibles.forEach(paquete => {
        const materiasDelPaquete = materiasDisponibles.filter(m => paquete.materias.includes(m.id));
        const totalCreditos = materiasDelPaquete.reduce((acc, m) => acc + m.creditos, 0);

        const card = document.createElement("div");
        card.className = "card-materia";
        card.innerHTML = `
            <div class="info">
                <h4>${paquete.nombre}</h4>
                <span style="display:block; margin:5px 0;">${materiasDelPaquete.length} materias incluidas</span>
                <p class="creditos">${totalCreditos} créditos en total</p>
            </div>
            <button class="btn-seleccionar" onclick="abrirPreviewPaquete('${paquete.id}')">
                Seleccionar
            </button>
        `;
        contenedor.appendChild(card);
    });
}

// ==========================================
// 5. ACTUALIZAR PANEL SUPERIOR (CRÉDITOS Y BARRA)
// ==========================================
function actualizarDashboard() {
    // Sumamos los créditos de las materias que llevamos cargadas (reduce suma el arreglo)
    const creditosActuales = materiasCargadas.reduce((total, m) => total + m.creditos, 0);
    const creditosDisponibles = MAX_CREDITOS - creditosActuales;
    
    // Calculamos qué porcentaje de la barra debemos llenar
    const porcentaje = (creditosActuales / MAX_CREDITOS) * 100;

    // Actualizamos los números en el HTML
    document.getElementById("creditosActuales").textContent = creditosActuales;
    document.getElementById("creditosDisponibles").textContent = creditosDisponibles;
    
    // Movemos la barra de progreso
    const barra = document.getElementById("barraProgreso");
    if (barra) {
        barra.style.width = `${porcentaje}%`;
        barra.style.height = "100%";
        barra.style.transition = "width 0.4s ease, background-color 0.4s ease";
        
        // Cambiamos el color: Azul (normal), Naranja (cerca del límite), Rojo (lleno)
        barra.style.backgroundColor = porcentaje === 100 ? "#e53935" : (porcentaje > 80 ? "#fb8c00" : "#1b4f8a");
    }
}

// ==========================================
// 6. MODAL DE PREVISUALIZACIÓN DE MATERIA
// ==========================================
window.abrirPreview = function(id) {
    // Buscamos la materia específica usando su ID
    materiaSeleccionada = materiasDisponibles.find(m => m.id === id);
    if (!materiaSeleccionada) return;
    paqueteSeleccionado = null; // Limpiamos selección de paquete

    // Inyectamos sus datos en el modal
    document.getElementById("nombreMateria").textContent = materiaSeleccionada.nombre;
    document.getElementById("infoMateria").innerHTML = `<strong>Clave:</strong> ${materiaSeleccionada.clave} <br> <strong>Docente:</strong> ${materiaSeleccionada.docente}`;
    document.getElementById("creditosMateria").textContent = materiaSeleccionada.creditos;

    // Generamos el grid de horario incluyendo la materia que se previsualiza y las ya cargadas
    const previewLista = [...materiasCargadas, materiaSeleccionada];
    generarHorario("previewHorario", previewLista);

    // Mostramos el modal
    const modal = document.getElementById("modalPreview");
    modal.classList.add("activo");
    modal.style.display = "flex"; // Fallback de diseño
};

// ==========================================
// 6.5 MODAL DE PREVISUALIZACIÓN DE PAQUETE
// ==========================================
window.abrirPreviewPaquete = function(id) {
    paqueteSeleccionado = paquetesDisponibles.find(p => p.id === id);
    if (!paqueteSeleccionado) return;
    materiaSeleccionada = null; // Limpiamos selección individual

    const materiasDelPaquete = materiasDisponibles.filter(m => paqueteSeleccionado.materias.includes(m.id));
    const totalCreditos = materiasDelPaquete.reduce((acc, m) => acc + m.creditos, 0);

    // Inyectamos sus datos en el modal
    document.getElementById("nombreMateria").textContent = paqueteSeleccionado.nombre;
    document.getElementById("infoMateria").innerHTML = materiasDelPaquete.map(m => `• ${m.nombre} (${m.clave})`).join('<br>');
    document.getElementById("creditosMateria").textContent = totalCreditos;

    // Generamos el grid de horario combinando las ya cargadas y las del paquete
    const previewLista = [...materiasCargadas, ...materiasDelPaquete];
    generarHorario("previewHorario", previewLista);

    // Mostramos el modal
    const modal = document.getElementById("modalPreview");
    modal.classList.add("activo");
    modal.style.display = "flex";
};

window.cerrarPreview = function() {
    const modal = document.getElementById("modalPreview");
    modal.classList.remove("activo");
    modal.style.display = "none";
    materiaSeleccionada = null;
    paqueteSeleccionado = null;
};

// ==========================================
// 7. CONFIRMAR Y CARGAR MATERIA (BOTÓN 'CARGAR')
// ==========================================
window.confirmarCarga = function() {
    if (paqueteSeleccionado) {
        cargarPaquete(paqueteSeleccionado.id);
        return;
    }

    if (!materiaSeleccionada) return;

    // Validar si tenemos suficientes créditos para agregar esta materia
    const creditosActuales = materiasCargadas.reduce((total, m) => total + m.creditos, 0);
    if (creditosActuales + materiaSeleccionada.creditos > MAX_CREDITOS) {
        alert("No puedes agregar esta materia, excedes el límite de 30 créditos.");
        cerrarPreview();
        return;
    }

    // Validar choque de horario
    let choque = materiasCargadas.some(m =>
        m.horarioEstructurado.some(h1 =>
            materiaSeleccionada.horarioEstructurado.some(h2 =>
                h1.dia === h2.dia && h1.hora === h2.hora
            )
        )
    );

    if(choque){
        mostrarToast("No se pudo cargar: Hay un choque de horario.", "#ef4444");
        cerrarPreview();
        return;
    }

    // Agregamos al arreglo de materias cargadas y cerramos el modal
    materiasCargadas.push(materiaSeleccionada);
    mostrarToast(`Se agregó ${materiaSeleccionada.nombre} a tu carga.`, "#22c55e");

    cerrarPreview();
    
    // Volvemos a pintar todo con los nuevos datos
    const tabActiva = document.querySelector(".subtab.activo").textContent.trim();
    if (tabActiva === "Paquetes") renderPaquetes();
    else renderMateriasDisponibles();

    renderMateriasCargadas();
    actualizarDashboard();
};

// ==========================================
// 7.5 CONFIRMAR Y CARGAR PAQUETE COMPLETO
// ==========================================
window.cargarPaquete = function(idPaquete) {
    const paquete = paquetesDisponibles.find(p => p.id === idPaquete);
    if(!paquete) return;

    let materiasNuevas = [];
    let creditosNuevos = 0;

    // Evaluamos qué materias de este paquete NO han sido agregadas aún
    paquete.materias.forEach(idMateria => {
        if(!materiasCargadas.some(m => m.id === idMateria)) {
            const mat = materiasDisponibles.find(m => m.id === idMateria);
            if(mat) {
                // Validar choque con cargadas y con las nuevas que se van procesando del paquete
                let choque = materiasCargadas.some(c => c.horarioEstructurado.some(h1 => mat.horarioEstructurado.some(h2 => h1.dia === h2.dia && h1.hora === h2.hora))) || 
                             materiasNuevas.some(c => c.horarioEstructurado.some(h1 => mat.horarioEstructurado.some(h2 => h1.dia === h2.dia && h1.hora === h2.hora)));
                
                if(!choque) {
                    materiasNuevas.push(mat);
                    creditosNuevos += mat.creditos;
                }
            }
        }
    });

    if(materiasNuevas.length === 0) {
        mostrarToast("Materias duplicadas o con choque de horario descartadas.", "#f59e0b");
        cerrarPreview();
        return;
    }

    const creditosActuales = materiasCargadas.reduce((t, m) => t + m.creditos, 0);
    if(creditosActuales + creditosNuevos > MAX_CREDITOS) {
        mostrarToast("No puedes agregar el paquete, excedes los 30 créditos.", "#ef4444");
        cerrarPreview();
        return;
    }

    materiasNuevas.forEach(m => materiasCargadas.push(m));
    mostrarToast(`¡Paquete ${paquete.nombre} cargado (${materiasNuevas.length} materias)!`, "#22c55e");
    
    cerrarPreview();
    renderPaquetes();
    renderMateriasCargadas();
    actualizarDashboard();
};

// ==========================================
// 7.8 FUNCIÓN PARA MOSTRAR NOTIFICACIONES (TOAST)
// ==========================================
function mostrarToast(mensaje, color = "#1bbf5c") {
    const toast = document.getElementById("toast");
    if (toast) {
        toast.innerHTML = `<strong>Notificación:</strong> ${mensaje}`;
        toast.style.position = "fixed"; toast.style.top = "30px"; toast.style.bottom = "auto"; toast.style.right = "30px";
        toast.style.width = "max-content"; toast.style.maxWidth = "350px"; toast.style.height = "auto";
        toast.style.background = color;
        toast.style.color = "#ffffff";
        toast.style.padding = "15px 25px"; toast.style.borderRadius = "10px";
        toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
        toast.style.zIndex = "10000"; toast.style.transition = "all 0.3s ease";
        toast.style.transform = "translateY(0)";
        toast.style.opacity = "1"; toast.style.display = "block";

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-20px)";
            setTimeout(() => { toast.style.display = "none"; }, 300);
        }, 3000);
    } else {
        alert(mensaje);
    }
}

// ==========================================
// 8. PINTAR LAS MATERIAS QUE YA CARGAMOS
// ==========================================
function renderMateriasCargadas() {
    const contenedor = document.getElementById("listaCargadas");
    contenedor.innerHTML = "";

    if (materiasCargadas.length === 0) {
        contenedor.innerHTML = "<p style='color: #6c757d; font-size: 14px;'>No tienes materias seleccionadas actualmente.</p>";
        return;
    }

    materiasCargadas.forEach(materia => {
        const card = document.createElement("div");
        card.className = "card-materia"; // Reutilizamos el diseño CSS
        card.innerHTML = `
            <div class="info">
                <h4>${materia.nombre}</h4>
                <span>${materia.clave}</span>
                <p>${materia.docente}</p>
                <p class="creditos" style="margin-top:5px; color:#1b4f8a; font-weight:bold;">${materia.horario}</p>
            </div>
            <button class="btn-seleccionar" onclick="removerMateria(${materia.id})" style="background:#ffebee; color:#c62828; border:1px solid #ffcdd2;">
                Quitar
            </button>
        `;
        contenedor.appendChild(card);
    });
}

// ==========================================
// 9. REMOVER MATERIA DE NUESTRA CARGA
// ==========================================
window.removerMateria = function(id) {
    // Filtramos el arreglo para quedarnos con todas MENOS la que queremos quitar
    materiasCargadas = materiasCargadas.filter(m => m.id !== id);
    
    mostrarToast("Materia removida de tu carga académica.");

    // Volvemos a actualizar toda la interfaz
    const tabActiva = document.querySelector(".subtab.activo").textContent.trim();
    if (tabActiva === "Paquetes") renderPaquetes();
    else renderMateriasDisponibles();

    renderMateriasCargadas();
    actualizarDashboard();
};

// ==========================================
// 10. VER HORARIO FINAL
// ==========================================
window.verHorario = function() {
    if (materiasCargadas.length === 0) {
        alert("No tienes materias en tu carga académica aún.");
        return;
    }

    const contenedorHorario = document.getElementById("horarioFinal");
    
    // Generamos el grid dinámico estilo calendario
    generarHorario("horarioFinal", materiasCargadas);
    
    const modal = document.getElementById("modalHorario");
    modal.classList.add("activo");
    modal.style.display = "flex";
};

window.cerrarHorario = function() {
    const modal = document.getElementById("modalHorario");
    modal.classList.remove("activo");
    modal.style.display = "none";
};

// ==========================================
// 10.5 GENERADOR DE GRID (HORARIO DINÁMICO)
// ==========================================
function generarHorario(id, lista) {
    const cont = document.getElementById(id);
    cont.innerHTML = "";
    
    // Estructura grid mediante CSS en línea para garantizar su apariencia
    cont.style.display = "grid";
    cont.style.gridTemplateColumns = "repeat(6, 1fr)";
    cont.style.gap = "1px";
    cont.style.background = "#cbd5e1"; // Color de los bordes
    cont.style.border = "1px solid #cbd5e1";
    cont.style.borderRadius = "8px";
    cont.style.overflow = "hidden";
    cont.style.marginTop = "15px";

    const dias = ["", "Lun", "Mar", "Mié", "Jue", "Vie"];

    // Cabecera de los días
    for (let i = 0; i < 6; i++) {
        let c = document.createElement("div");
        c.style.background = "#0b2a4a";
        c.style.color = "white";
        c.style.padding = "8px";
        c.style.textAlign = "center";
        c.style.fontWeight = "bold";
        c.style.fontSize = "13px";
        c.innerText = dias[i];
        cont.appendChild(c);
    }

    // Filas (Horas del día)
    for (let h = 7; h <= 21; h++) {
        let hora = document.createElement("div");
        hora.style.background = "#f1f5f9";
        hora.style.color = "#0b2a4a";
        hora.style.fontWeight = "bold";
        hora.style.fontSize = "12px";
        hora.style.display = "flex";
        hora.style.alignItems = "center";
        hora.style.justifyContent = "center";
        hora.innerText = h + ":00";
        cont.appendChild(hora);

        for (let d = 1; d <= 5; d++) {
            let celda = document.createElement("div");
            celda.style.background = "white";
            celda.style.minHeight = "45px";
            celda.style.padding = "2px";
            celda.style.display = "flex";
            
            lista.forEach((m, index) => {
                m.horarioEstructurado.forEach(hor => {
                    if (hor.dia === d && hor.hora === h) {
                        let color = colores[index % colores.length];
                        celda.innerHTML = `
                            <div style="width:100%; height:100%; border-radius:4px; padding:4px; text-align:center; display:flex; flex-direction:column; justify-content:center; background:${color}; color:white;">
                                <strong style="font-size:10px; line-height:1.1;">${m.nombre}</strong>
                                <small style="font-size:9px; margin-top:2px; opacity:0.9;">${m.clave}</small>
                            </div>
                        `;
                    }
                });
            });

            cont.appendChild(celda);
        }
    }
}

// ==========================================
// 12. GUARDAR CARGA EN LA BASE DE DATOS (FINALIZAR)
// ==========================================
window.finalizarCarga = async function() {
    if (materiasCargadas.length === 0) {
        alert("No tienes materias seleccionadas para guardar.");
        return;
    }

    const sesion = localStorage.getItem("alumnoSesion");
    const alumnoData = JSON.parse(sesion);
    const pActual = alumnoData.periodoActual || 2; 

    // Extraemos solo los IDs de los grupos que el alumno seleccionó
    const idGrupos = materiasCargadas.map(m => m.id);

    try {
        mostrarToast("Guardando carga académica, por favor espera...", "#f59e0b");

        const response = await fetch("http://localhost:5067/api/cargamaterias/guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                IdAlumno: alumnoData.id,
                IdPeriodo: pActual,
                IdGrupos: idGrupos
            })
        });

        const result = await response.json();
        
        if (result.success) {
            mostrarToast(result.mensaje, "#22c55e");
        } else {
            mostrarToast(result.mensaje, "#ef4444");
        }
    } catch (error) {
        console.error(error);
        mostrarToast("Error de conexión al intentar guardar.", "#ef4444");
    }
};

// ==========================================
// 11. INICIALIZAR EVENTOS DEL TICKET
// ==========================================
function inicializarEventosTicket() {
    const modalTicket = document.getElementById("modalTicket");
    const btnAbrir = document.getElementById("btnAbrirModal");
    const btnCerrar = document.getElementById("cerrarModal");
    const btnCancelar = document.getElementById("btnCancelar");
    const btnConfirmar = document.getElementById("btnConfirmar");

    if(!modalTicket || !btnAbrir) return;

    btnAbrir.addEventListener("click", () => {
        modalTicket.classList.add("activo");
        modalTicket.style.display = "flex";
    });

    const cerrarTicket = () => {
        modalTicket.classList.remove("activo");
        modalTicket.style.display = "none";
    };

    if(btnCerrar) btnCerrar.addEventListener("click", cerrarTicket);
    if(btnCancelar) btnCancelar.addEventListener("click", cerrarTicket);
    
    if(btnConfirmar) {
        btnConfirmar.addEventListener("click", () => {
            const tipo = document.getElementById("tipoTicket").value;
            if(tipo === "") {
                alert("Selecciona un tipo de ticket");
                return;
            }
            mostrarToast("Ticket de sistema generado correctamente");
            cerrarTicket();
        });
    }
}