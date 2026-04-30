let datos = [
    { control: "22211863", referencia: "REF-893742", estado: "pagado", carrera:"info", semestre:"1" },
    { control: "22211864", referencia: "REF-238912", estado: "pendiente", carrera:"info", semestre:"2" },
    { control: "22211865", referencia: "REF-999111", estado: "pagado", carrera:"ind", semestre:"1" }
];

// INICIO
function iniciarRecibos(){
    renderTabla(datos);
    actualizarResumen(datos);
}

// RENDER TABLA
function renderTabla(lista){
    let tbody = document.querySelector(".tabla-recibos tbody");
    tbody.innerHTML = "";

    lista.forEach((item, index) => {
        tbody.innerHTML += `
        <tr>
            <td>${item.control}</td>
            <td>${item.referencia}</td>
            <td>
                <span class="badge ${item.estado}">
                    ${item.estado === "pagado" ? "Pagado" : "Pendiente"}
                </span>
            </td>
            <td>
                ${
                    item.estado === "pendiente"
                    ? `<button class="btn-icon aprobar" onclick="marcarPagado(${index})">
                            <i data-lucide="check"></i>
                       </button>`
                    : `<button class="btn-icon ver">
                            <i data-lucide="eye"></i>
                       </button>`
                }
            </td>
        </tr>
        `;
    });

    lucide.createIcons();
}

// FILTRAR
function filtrar(){
    let carrera = document.getElementById("filtroCarrera").value;
    let semestre = document.getElementById("filtroSemestre").value;
    let busqueda = document.getElementById("busqueda").value.toLowerCase();

    let filtrados = datos.filter(d => {

        return (
            (carrera === "" || d.carrera === carrera) &&
            (semestre === "" || d.semestre === semestre) &&
            d.control.toLowerCase().includes(busqueda)
        );

    });

    renderTabla(filtrados);
    actualizarResumen(filtrados);
}

// MARCAR PAGADO
function marcarPagado(index){
    datos[index].estado = "pagado";
    renderTabla(datos);
    actualizarResumen(datos);
}

// RESUMEN
function actualizarResumen(lista){
    let pagados = lista.filter(d => d.estado === "pagado").length;
    let pendientes = lista.filter(d => d.estado === "pendiente").length;

    document.querySelector(".pagados").innerHTML = `✔ Pagados: ${pagados}`;
    document.querySelector(".pendientes").innerHTML = `✖ Pendientes: ${pendientes}`;
}