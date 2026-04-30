let datosGlobal = {
    todas: {
        alumnos: 120,
        pagosPendientes: 35,
        creditosPendientes: 12,
        tickets: 8,
        pagos: { pagados: 85, pendientes: 35 },
        creditos: { aprobados: 60, rechazados: 15, pendientes: 12 }
    },
    info: {
        alumnos: 70,
        pagosPendientes: 20,
        creditosPendientes: 5,
        tickets: 3,
        pagos: { pagados: 50, pendientes: 20 },
        creditos: { aprobados: 40, rechazados: 5, pendientes: 5 }
    },
    ind: {
        alumnos: 50,
        pagosPendientes: 15,
        creditosPendientes: 7,
        tickets: 5,
        pagos: { pagados: 35, pendientes: 15 },
        creditos: { aprobados: 20, rechazados: 10, pendientes: 7 }
    }
};

let chartPagos;
let chartCreditos;

// INICIO
document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard("todas");
});


// =========================
// FILTRO GLOBAL
// =========================
function filtrarDashboard(){
    let carrera = document.getElementById("filtroCarrera").value;
    cargarDashboard(carrera);
}


// =========================
// CARGAR DASHBOARD
// =========================
function cargarDashboard(tipo){

    let datos = datosGlobal[tipo];

    // CARDS
    document.getElementById("totalAlumnos").textContent = datos.alumnos;
    document.getElementById("pagosPendientes").textContent = datos.pagosPendientes;
    document.getElementById("creditosPendientes").textContent = datos.creditosPendientes;
    document.getElementById("tickets").textContent = datos.tickets;

    // DESTRUIR GRÁFICAS
    if(chartPagos) chartPagos.destroy();
    if(chartCreditos) chartCreditos.destroy();

    // =========================
    // GRÁFICA PAGOS
    // =========================
    chartPagos = new Chart(document.getElementById("graficaPagos"), {
        type: "doughnut",
        data: {
            labels: ["Pagados", "Pendientes"],
            datasets: [{
                data: [datos.pagos.pagados, datos.pagos.pendientes],
                backgroundColor: ["#16a34a", "#dc2626"],
                hoverOffset: 15
            }]
        }
    });

    // =========================
    // GRÁFICA CRÉDITOS
    // =========================
    chartCreditos = new Chart(document.getElementById("graficaCreditos"), {
        type: "bar",
        data: {
            labels: ["Aprobados", "Rechazados", "Pendientes"],
            datasets: [{
                data: [
                    datos.creditos.aprobados,
                    datos.creditos.rechazados,
                    datos.creditos.pendientes
                ],
                backgroundColor: ["#16a34a", "#dc2626", "#f59e0b"]
            }]
        }
    });
}