document.addEventListener("DOMContentLoaded", async () => {
    const sesion = localStorage.getItem("alumnoSesion");
    
    // Solo validamos sesión si estamos en la pantalla de Recibos (Referencia Bancaria puede ser pública)
    if (!sesion && document.getElementById("recibos-carrera")) {
        window.location.href = "Login.html";
        return;
    }

    // ==========================================
    // 1. LÓGICA PARA LA PANTALLA "RECIBOS.HTML"
    // ==========================================
    if (document.getElementById("recibos-carrera")) {
        const alumnoData = JSON.parse(sesion);
        document.getElementById("recibos-carrera").textContent = alumnoData.carrera;

        try {
            // 1. Extraemos los recibos reales de la Base de Datos
            const response = await fetch(`http://localhost:5067/api/recibos/alumno/${alumnoData.id}`);
            if (!response.ok) throw new Error("Error al obtener los recibos");
            
            const recibos = await response.json();
            
            // Separamos el recibo que debemos pagar ahora de los que ya pagamos antes
            const reciboPendiente = recibos.find(r => r.estado === "Pendiente");
            const historialPagados = recibos.filter(r => r.estado === "Pagado");

            // 2. Pintar datos del recibo actual
            if (reciboPendiente) {
                document.getElementById("recibo-actual-titulo").textContent = reciboPendiente.concepto;
                document.getElementById("recibo-actual-emision").textContent = new Date(reciboPendiente.fechaEmision).toLocaleDateString('es-ES');
                document.getElementById("recibo-actual-vigencia").textContent = new Date(reciboPendiente.fechaVencimiento).toLocaleDateString('es-ES');
                document.getElementById("recibo-actual-monto").textContent = `$${reciboPendiente.monto.toFixed(2)} MXN`;

                const estadoDiv = document.getElementById("recibo-actual-estado");
                estadoDiv.innerHTML = `<span style="color: #ea580c; background: #ffedd5; padding: 6px 12px; border-radius: 8px; font-weight: bold; font-size: 14px;">Pendiente de pago</span>`;
            } else {
                document.getElementById("recibo-actual-titulo").textContent = "Sin adeudos";
                document.getElementById("recibo-actual-emision").textContent = "-";
                document.getElementById("recibo-actual-vigencia").textContent = "-";
                document.getElementById("recibo-actual-monto").textContent = "$0.00 MXN";
                document.getElementById("recibo-actual-estado").innerHTML = `<span style="color: #1bbf5c; background: #e8f5e9; padding: 6px 12px; border-radius: 8px; font-weight: bold; font-size: 14px;">Al corriente</span>`;
            }

            // 3. Pintar el Histórico de recibos pagados
            const contenedorHistorial = document.getElementById("historial-recibos");
            contenedorHistorial.innerHTML = "";

            historialPagados.forEach(item => {
                const row = document.createElement("div");
                row.style.cssText = "display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 15px; padding: 15px 0; border-bottom: 1px solid #e2e8f0; align-items: center; font-size: 14px;";
                row.innerHTML = `
                    <span style="font-weight: 500; color: #0b2a4a;">${item.concepto}</span>
                    <span style="color: #6c757d;">${item.periodo}</span>
                    <strong style="color: #0b2a4a;">$${item.monto.toFixed(2)}</strong>
                    <span style="color: #1bbf5c; background: #e8f5e9; padding: 5px 10px; border-radius: 6px; text-align: center; font-weight: bold; width: fit-content;">${item.estado}</span>
                `;
                contenedorHistorial.appendChild(row);
            });
        } catch (error) {
            console.error(error);
            document.getElementById("historial-recibos").innerHTML = "<p style='color:red;'>No se pudo cargar el historial de recibos.</p>";
        }
    }

    // ==========================================
    // LÓGICA DE AUTO-LLENADO PARA REFERENCIA BANCARIA
    // ==========================================
    if (document.getElementById("control")) {
        const controlParam = new URLSearchParams(window.location.search).get('control');
        if (controlParam) {
            document.getElementById("control").value = controlParam;
            buscarReferencia(); // Simulamos el clic automáticamente
        }
    }
});

// ==========================================
// 2. LÓGICA PARA "REFERENCIABANCARIA.HTML"
// ==========================================
window.buscarReferencia = async function() {
    const controlInput = document.getElementById("control").value.trim();
    const errorMsg = document.getElementById("error");
    const resultadoDiv = document.getElementById("resultado");

    if (controlInput === "") {
        errorMsg.textContent = "Por favor, ingresa un número de control válido.";
        errorMsg.classList.remove("oculto");
        resultadoDiv.classList.add("oculto");
        return;
    }

    try {
        // Consultamos a la base de datos real
        const response = await fetch(`http://localhost:5067/api/recibos/alumno/${controlInput}`);
        if (!response.ok) throw new Error("Error al consultar recibos");
        
        const recibos = await response.json();
        const reciboPendiente = recibos.find(r => r.estado === "Pendiente");

        if (reciboPendiente) {
            errorMsg.classList.add("oculto");
            document.getElementById("resControl").textContent = controlInput;
            document.getElementById("resReferencia").textContent = reciboPendiente.referenciaBancaria || "No asignada";
            document.getElementById("resMonto").textContent = `$${reciboPendiente.monto.toFixed(2)} MXN`;
            document.getElementById("resConcepto").textContent = reciboPendiente.concepto;
            
            resultadoDiv.classList.remove("oculto");
        } else {
            errorMsg.textContent = "Este número de control no tiene adeudos pendientes.";
            errorMsg.classList.remove("oculto");
            resultadoDiv.classList.add("oculto");
        }
    } catch (error) {
        console.error(error);
        errorMsg.textContent = "Error al conectar con la base de datos.";
        errorMsg.classList.remove("oculto");
        resultadoDiv.classList.add("oculto");
    }
};

// ==========================================
// FUNCIÓN PARA EL BOTÓN "DESCARGAR RECIBO"
// ==========================================
window.descargarRecibo = function() {
    const sesion = localStorage.getItem("alumnoSesion");
    if (sesion) {
        const alumnoData = JSON.parse(sesion);
        // Redirigimos a la pantalla mandando el ID del alumno por la URL
        window.location.href = `ReferenciaBancaria.html?control=${alumnoData.id}`;
    }
};