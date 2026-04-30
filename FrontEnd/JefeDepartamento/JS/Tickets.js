let tickets = [
    {
        control: "22211863",
        problema: "Mi horario aparece vacío",
        estado: "abierto",
        imagen: "/img/error1.png"
    },
    {
        control: "22211864",
        problema: "No puedo descargar recibo",
        estado: "proceso",
        imagen: "/img/error2.png"
    }
];

let seleccionado = null;

// INICIO
document.addEventListener("DOMContentLoaded", renderTabla);

// RENDER
function renderTabla(data = tickets){
    let tabla = document.getElementById("tablaTickets");
    tabla.innerHTML = "";

    data.forEach(t => {
        tabla.innerHTML += `
        <tr>
            <td>${t.control}</td>
            <td>${t.problema}</td>
            <td><span class="badge ${t.estado}">${t.estado}</span></td>
            <td>
                <button class="btn-icon" onclick="verDetalle('${t.control}')">
                     Ver detalle
                </button>
            </td>
        </tr>
        `;
    });

    lucide.createIcons();
}

// VER DETALLE
function verDetalle(control){
    let t = tickets.find(x => x.control === control);
    seleccionado = t;

    document.getElementById("detalleTicket").innerHTML = `
        <p><strong>Alumno:</strong> ${t.control}</p>
        <p>${t.problema}</p>

        <div class="imagen-container">
            <img src="${t.imagen}" alt="evidencia">
        </div>
    `;

    document.getElementById("modalTicket").style.display = "flex";
}

// CERRAR
function cerrarModal(){
    document.getElementById("modalTicket").style.display = "none";
}

// CAMBIAR ESTADO
function cambiarEstado(estado){
    if(!seleccionado) return;

    seleccionado.estado = estado;

    let respuesta = document.getElementById("respuesta").value;
    console.log("Enviar respuesta:", respuesta);

    cerrarModal();
    renderTabla();
}

// FILTRAR
function filtrar(){
    let estado = document.getElementById("filtroEstado").value;
    let texto = document.getElementById("busqueda").value.toLowerCase();

    let filtrados = tickets.filter(t => {
        let coincideEstado = estado === "todos" || t.estado === estado;
        let coincideTexto = t.control.toLowerCase().includes(texto);
        return coincideEstado && coincideTexto;
    });

    renderTabla(filtrados);
}