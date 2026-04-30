/**
 * Clase que gestiona el Menú Lateral (Sidebar) de la aplicación.
 */
class MenuLateral {
    constructor() {
        // Estructura HTML del Menú
        this.templateHTML = `
        <nav class="sidebar" id="sidebar">
            <div class="toggle-menu" id="toggle-btn">
                <i class='bx bx-menu'></i>
            </div>
            
            <div class="logo-section">
                <span class="brand-side">AMBAR</span>
            </div>

            <div class="user-info-side">
                <div class="foto-contenedor-nav">
                    <i class='bx bx-user-circle' id="icono-sidebar"></i>
                    <img src="" alt="Perfil" id="foto-sidebar-nav" style="display:none;">
                </div>
                <p class="user-name">Profesor Reyes</p>
            </div>

            <ul class="nav-links">     
                <li><a href="PerfilDocente.html"><i class='bx bx-id-card'></i><span>Perfil</span></a></li>
                <li><a href="HorarioDocente.html"><i class='bx bx-calendar-event'></i><span>Horario</span></a></li>
                <li><a href="Calificaciones.html"><i class='bx bx-task'></i><span>Calificaciones</span></a></li>
            </ul>

            <a href="PantallaModulos.html" class="logout-btn-side">
                <i class='bx bx-arrow-back'></i><span> cerrar sesión </span>
            </a>
        </nav>`;

        this.inicializar();
    }

    /**
     * Inyecta el menú en el DOM y activa la lógica de eventos.
     */
    inicializar() {
        // 1. Inyectar en el cuerpo del documento
        document.body.insertAdjacentHTML('afterbegin', this.templateHTML);

        // 2. Cache de elementos del DOM
        this.sidebar = document.getElementById('sidebar');
        this.botonToggle = document.getElementById('toggle-btn');
        this.contenidoPrincipal = document.querySelector('.main-content');

        // 3. Ejecutar configuraciones iniciales
        this.establecerEventos();
        this.marcarEnlaceActivo();
    }

    /**
     * Configura el evento de clic para colapsar/expandir el menú.
     */
    establecerEventos() {
        this.botonToggle.addEventListener('click', () => {
            // Alterna la clase 'close' en el sidebar
            this.sidebar.classList.toggle('close');
            
            // ELIMINA O COMENTA ESTA PARTE:
            // if (this.contenidoPrincipal) {
            //     this.contenidoPrincipal.classList.toggle('expand');
            // }
        });
    }

    /**
     * Identifica la página actual y añade la clase 'active' al enlace correspondiente.
     */
    marcarEnlaceActivo() {
        const rutaActual = window.location.pathname;
        const enlaces = document.querySelectorAll(".nav-links a");

        enlaces.forEach(enlace => {
            const destino = enlace.getAttribute("href");
            if (rutaActual.includes(destino)) {
                enlace.classList.add("active");
            }
        });
    }
}

/**
 * Inicialización al cargar el documento.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Se crea una nueva instancia del menú para ponerlo en marcha
    new MenuLateral();
});