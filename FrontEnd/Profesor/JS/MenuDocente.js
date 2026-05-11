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
                <li class="nav-section">
                    <div class="nav-section-title" onclick="this.parentElement.classList.toggle('open')">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <i class='bx bx-chalkboard' title="Docencia" style="font-size: 1.4rem; min-width: 30px; text-align: center;"></i>
                            <span class="title-text">Docencia</span>
                        </div>
                        <i class='bx bx-chevron-down chevron'></i>
                    </div>
                    <ul class="nav-section-items">
                        <li><a href="/FrontEnd/Profesor/HTML/PerfilDocente.html"><i class='bx bx-id-card'></i><span>Perfil</span></a></li>
                        <li><a href="/FrontEnd/Profesor/HTML/HorarioDocente.html"><i class='bx bx-calendar-event'></i><span>Horario</span></a></li>
                        <li><a href="/FrontEnd/Profesor/HTML/Calificaciones.html"><i class='bx bx-task'></i><span>Calificaciones</span></a></li>
                    </ul>
                </li>
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
                // Si el enlace está dentro de una subsección, la abrimos automáticamente
                const parentSection = enlace.closest('.nav-section');
                if (parentSection) {
                    parentSection.classList.add('open');
                }
                const parentSubsection = enlace.closest('.nav-subsection');
                if (parentSubsection) {
                    parentSubsection.classList.add('open');
                }
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
            if (rol === 'administrador' || rol === 'jefe de departamento') nombreUsuarioEl.textContent = 'Jefe de Departamento';
            else if (rol === 'coordinador') nombreUsuarioEl.textContent = 'Coordinador Académico';
            else nombreUsuarioEl.textContent = sesion.nombreCompleto || 'Usuario';
        }

        // Actualizar foto
        const fotoEl = document.getElementById('foto-sidebar-nav');
        const iconoEl = document.getElementById('icono-sidebar');
        const fotoUrl = sesion.fotoUrl || sesion.FotoUrl;
        if (fotoEl && iconoEl && fotoUrl) { // Se mantiene la foto si existe
            const urlCompleta = fotoUrl.startsWith("http") ? fotoUrl : `${this.API_BASE_URL}${fotoUrl}`;
            fotoEl.src = urlCompleta;
            fotoEl.style.display = 'block';
            iconoEl.style.display = 'none';
        }

        // AÑADIR MENÚS EXTRA SEGÚN ROL
        if (rol === 'coordinador') {
            this.agregarMenuCoordinador();
        } else if (rol === 'administrador' || rol === 'jefe de departamento') {
            this.agregarMenuAdministrador();
            // El administrador también necesita las funciones de coordinador
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
                <li class="nav-section">
                    <div class="nav-section-title" onclick="this.parentElement.classList.toggle('open')">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <i class='bx bx-sitemap' title="Coordinación" style="font-size: 1.4rem; min-width: 30px; text-align: center;"></i>
                            <span class="title-text">Coordinación</span>
                        </div>
                        <i class='bx bx-chevron-down chevron'></i>
                    </div>
                    <ul class="nav-section-items">
                        <li><a href="/FrontEnd/Coordinador/HTML/GestionCoordinador.html?view=docentes"><i class='bx bx-user-plus'></i><span>Carga Docente</span></a></li>
                        <li><a href="/FrontEnd/Coordinador/HTML/GestionCoordinador.html?view=alumnos"><i class='bx bx-book-add'></i><span>Carga Alumnos</span></a></li>
                    </ul>
                </li>
            `;
            navLinks.insertAdjacentHTML('beforeend', opcionesCoordinadorHTML);
        }
    }

    /**
     * Añade las opciones del menú de Administrador / Jefe de Departamento al sidebar.
     */
    agregarMenuAdministrador() {
        const navLinks = this.sidebar.querySelector(".nav-links");
        if (navLinks) {
            const opcionesAdminHTML = `
                <li class="nav-section">
                    <div class="nav-section-title" onclick="this.parentElement.classList.toggle('open')">
                        <div style="display:flex; align-items:center; gap:15px;">
                            <i class='bx bx-shield-quarter' title="Administración" style="font-size: 1.4rem; min-width: 30px; text-align: center;"></i>
                            <span class="title-text">Administración</span>
                        </div>
                        <i class='bx bx-chevron-down chevron'></i>
                    </div>
                    <ul class="nav-section-items">
                        <li><a href="/FrontEnd/JefeDepartamento/HTML/HomeAdmin.html"><i class='bx bx-home-alt'></i><span>Dashboard</span></a></li>
                        
                        <li class="nav-subsection">
                            <div class="nav-subsection-title" onclick="this.parentElement.classList.toggle('open')">
                                <div style="display:flex; align-items:center; gap:15px;">
                                    <i class='bx bx-group'></i>
                                    <span>Usuarios</span>
                                </div>
                                <i class='bx bx-chevron-down chevron'></i>
                            </div>
                            <ul class="nav-subsection-items">
                                <li><a href="/FrontEnd/JefeDepartamento/HTML/Alumnos.html"><i class='bx bx-user'></i><span>Alumnos</span></a></li>
                                <li><a href="/FrontEnd/JefeDepartamento/HTML/Profesores.html"><i class='bx bx-user-voice'></i><span>Docentes</span></a></li>
                            </ul>
                        </li>

                        <li class="nav-subsection">
                            <div class="nav-subsection-title" onclick="this.parentElement.classList.toggle('open')">
                                <div style="display:flex; align-items:center; gap:15px;">
                                    <i class='bx bx-support'></i>
                                    <span>Tickets</span>
                                </div>
                                <i class='bx bx-chevron-down chevron'></i>
                            </div>
                            <ul class="nav-subsection-items">
                                <li><a href="/FrontEnd/JefeDepartamento/HTML/Tickets.html"><i class='bx bx-message-square-detail'></i><span>Alumnos</span></a></li>
                                <li><a href="/FrontEnd/JefeDepartamento/HTML/TicketsProfesores.html"><i class='bx bx-headphone'></i><span>Docentes</span></a></li>
                            </ul>
                        </li>

                        <li><a href="/FrontEnd/JefeDepartamento/HTML/Semaforo.html"><i class='bx bx-calendar-event'></i><span>Semáforo Inscripción</span></a></li>
                        <li><a href="/FrontEnd/JefeDepartamento/HTML/Kardex.html"><i class='bx bx-book-content'></i><span>Gestión Materias</span></a></li>
                        <li><a href="/FrontEnd/JefeDepartamento/HTML/Recibos.html"><i class='bx bx-receipt'></i><span>Control de Pagos</span></a></li>
                        <li><a href="/FrontEnd/JefeDepartamento/HTML/Creditos.html"><i class='bx bx-award'></i><span>Validar Créditos</span></a></li>
                    </ul>
                </li>
            `;
            navLinks.insertAdjacentHTML('beforeend', opcionesAdminHTML);
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