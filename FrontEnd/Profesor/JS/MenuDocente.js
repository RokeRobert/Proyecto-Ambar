/**
 * Clase que gestiona el Menú Lateral (Sidebar) de la aplicación.
 */
class MenuLateral {
    constructor() {
        this.API_BASE_URL = 'http://localhost:5067';
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
                <p class="user-name">Cargando...</p>
            </div>

            <ul class="nav-links">     
                <li><a href="/FrontEnd/Profesor/HTML/PerfilDocente.html"><i class='bx bx-id-card'></i><span>Perfil</span></a></li>
                <li><a href="/FrontEnd/Profesor/HTML/HorarioDocente.html"><i class='bx bx-calendar-event'></i><span>Horario</span></a></li>
                <li><a href="/FrontEnd/Profesor/HTML/Calificaciones.html"><i class='bx bx-task'></i><span>Calificaciones</span></a></li>
            </ul>

            <a href="/FrontEnd/PantallaModulos.html" class="logout-btn-side">
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
        this.cargarDatosUsuario();
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

    /**
     * Carga los datos del usuario desde localStorage y actualiza la UI del menú.
     * También añade menús adicionales según el rol del usuario.
     */
    cargarDatosUsuario() {
        const sesionJSON = localStorage.getItem("profesorSesion");
        if (!sesionJSON) {
            console.warn("No se encontró sesión de profesor en localStorage.");
            // Si no hay sesión, no se debería mostrar nada, pero por ahora lo dejamos así.
            return;
        }

        const sesion = JSON.parse(sesionJSON);
        const rol = sesion.rol ? sesion.rol.toLowerCase() : '';

        // Actualizar nombre
        const nombreUsuarioEl = this.sidebar.querySelector('.user-name');
        if (nombreUsuarioEl) {
            // Si es coordinador, mostramos un título específico, si no, el nombre del profesor.
            nombreUsuarioEl.textContent = (rol === 'coordinador') ? 'Coordinador Académico' : (sesion.nombreCompleto || 'Usuario');
        }

        // Actualizar foto
        const fotoEl = document.getElementById('foto-sidebar-nav');
        const iconoEl = document.getElementById('icono-sidebar');
        if (fotoEl && iconoEl && sesion.fotoUrl) { // Se mantiene la foto si existe
            fotoEl.src = `${this.API_BASE_URL}${sesion.fotoUrl}`;
            fotoEl.style.display = 'block';
            iconoEl.style.display = 'none';
        }

        // AÑADIR MENÚS EXTRA SEGÚN ROL
        if (rol === 'coordinador') {
            this.agregarMenuCoordinador();
        }
    }

    /**
     * Añade las opciones del menú de Coordinador al sidebar.
     * Los enlaces ahora apuntan a la página de gestión con parámetros para el enrutamiento.
     */
    agregarMenuCoordinador() {
        const navLinks = this.sidebar.querySelector(".nav-links");
        if (navLinks) {
            const opcionesCoordinadorHTML = `
                <li><a href="/FrontEnd/Coordinador/HTML/GestionCoordinador.html?view=docentes"><i class='bx bx-user-plus'></i><span>Carga Docente</span></a></li>
                <li><a href="/FrontEnd/Coordinador/HTML/GestionCoordinador.html?view=alumnos"><i class='bx bx-book-add'></i><span>Carga Alumnos</span></a></li>
                <li><a href="/FrontEnd/Coordinador/HTML/GestionCoordinador.html?view=config"><i class='bx bx-cog'></i><span>Configuración</span></a></li>
            `;
            navLinks.insertAdjacentHTML('beforeend', opcionesCoordinadorHTML);
        }
    }
}

/**
 * Inicialización al cargar el documento.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Se crea una nueva instancia del menú para ponerlo en marcha
    new MenuLateral();
});