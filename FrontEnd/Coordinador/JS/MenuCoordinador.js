class GestionCoordinador {
    constructor() {
        this.mainContainer = document.getElementById('contenedor-principal');
        
        // --- BD SIMULADA ---
        const estadoGuardado = localStorage.getItem('ambar_sistemaHabilitado');
        this.sistemaHabilitado = estadoGuardado !== null ? JSON.parse(estadoGuardado) : true;

        this.dbAlumnos = this.cargarDatos('ambar_db_alumnos', [
            { control: "20210401", nombre: "RUIZ CARLOS", carrera: "Sistemas", semestre: "4to", estatus: "Vigente", materias: ["Física General"] },
            { control: "20210402", nombre: "ANA LOPEZ", carrera: "Industrial", semestre: "2do", estatus: "Vigente", materias: ["Cálculo Integral"] },
            { control: "20210403", nombre: "JUAN INFORMATICA", carrera: "Informática", semestre: "1ro", estatus: "Vigente", materias: [] }
        ]);

        this.dbDocentes = this.cargarDatos('ambar_db_docentes', [
            { id: "D-2024-01", nombre: "Armando Casas", estado: "Activo", materias: ["Estructura de Datos"] }
        ]);

        this.dbGrupos = this.cargarDatos('ambar_db_grupos', [
            { id: "G1", grupo: "401-A", materia: "Estructura de Datos", carrera: "Sistemas", profesor: "Armando Casas" },
            { id: "G2", grupo: "402-B", materia: "Física General", carrera: "Industrial", profesor: "Elena Nito" },
            { id: "G3", grupo: "101-A", materia: "Programación Web", carrera: "Sistemas", profesor: null },
            { id: "G4", grupo: "201-C", materia: "Cálculo Integral", carrera: "Mecatrónica", profesor: null }
        ]);
    }

    cargarDatos(llave, datosIniciales) {
        const datos = localStorage.getItem(llave);
        if (datos) return JSON.parse(datos);
        localStorage.setItem(llave, JSON.stringify(datosIniciales));
        return datosIniciales;
    }

    guardarEnBD() {
        localStorage.setItem('ambar_sistemaHabilitado', JSON.stringify(this.sistemaHabilitado));
        localStorage.setItem('ambar_db_alumnos', JSON.stringify(this.dbAlumnos));
        localStorage.setItem('ambar_db_grupos', JSON.stringify(this.dbGrupos));
        localStorage.setItem('ambar_db_docentes', JSON.stringify(this.dbDocentes));
    }

    limpiarPantalla() {
        if (this.mainContainer) { 
            this.mainContainer.innerHTML = ''; 
            this.mainContainer.scrollTop = 0; 
        }
    }

    cargarEstilo(id, archivo) {
        if (!document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id; 
            link.rel = 'stylesheet'; 
            link.href = `../CSS/${archivo}`;
            document.head.appendChild(link);
        }
    }

    renderConfiguracionSistema() {
        PantallasConfig.renderConfiguracion(this);
    }

    toggleSistema() {
        this.sistemaHabilitado = !this.sistemaHabilitado;
        this.guardarEnBD();
        this.renderConfiguracionSistema();
    }

    renderMóduloTickets() {
        this.limpiarPantalla();
        this.mainContainer.innerHTML = `<h2>Tickets de Soporte</h2><p>Módulo en desarrollo...</p>`;
    }
}

const coordinador = new GestionCoordinador();


/**
 * Router simple que se ejecuta en la página GestionCoordinador.html para cargar
 * la vista correcta según el parámetro 'view' en la URL.
 */
function routerCoordinador() {
    // Esta función solo debe ejecutarse en la página de gestión del coordinador.
    if (!window.location.pathname.includes('/GestionCoordinador.html')) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');

    if (view) {
        switch (view) {
            case 'docentes': return coordinador.renderDocentesGestion();
            case 'alumnos': return coordinador.renderAlumnosGestion();
            case 'config': return coordinador.renderConfiguracionSistema();
        }
    }
}


// Se ejecuta cuando el DOM está listo para manejar el enrutamiento en la página del coordinador.
document.addEventListener("DOMContentLoaded", routerCoordinador);