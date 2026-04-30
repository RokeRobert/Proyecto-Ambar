class SidebarMenu extends HTMLElement {
    connectedCallback() {
        // Renderizamos el HTML del menú
        this.innerHTML = `
            <aside class="sidebar">
                <div class="sidebar-top">
                    <h2 class="logo">ÁMBAR</h2>
                    <nav class="menu">
                        <a href="Home.html" class="menu-item"><i data-lucide="home"></i> Inicio</a>
                        <a href="Horario.html" class="menu-item"><i data-lucide="calendar"></i> Horario</a>
                        <a href="Calificaciones.html" class="menu-item"><i data-lucide="bar-chart-3"></i> Calificaciones</a>
                        <a href="Kardex.html" class="menu-item"><i data-lucide="file-text"></i> Kardex</a>
                        <a href="Credencial.html" class="menu-item"><i data-lucide="id-card"></i> <span>Credencial</span></a>
                        <a href="CargaMaterias.html" class="menu-item"><i data-lucide="receipt"></i> Carga de Materias</a>
                        <a href="Recibos.html" class="menu-item"><i data-lucide="receipt"></i> Recibos</a>
                        <a href="CreditosComplementarios.html" class="menu-item"><i data-lucide="award"></i> Creditos Complementarios</a>
                        <a href="Tickets.html" class="menu-item"><i data-lucide="ticket"></i> Tickets</a>
                    </nav>
                </div>

                <div class="sidebar-bottom">
                    
                    <a href="Guia.html" class="menu-item">
                        <i data-lucide="book-open"></i>
                        <span>Guía de uso</span>
                    </a>
                </div>
            </aside>
        `;

        // Detectar la página actual para marcarla como activa
        const currentPath = window.location.pathname.split('/').pop() || 'Home.html';
        const links = this.querySelectorAll('.menu a');
        
        links.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('activo'); // Tu clase CSS para el enlace seleccionado
            }
        });

        // Inicializar los íconos de Lucide en toda la página
        if (typeof lucide !== 'undefined') {
            // Usamos setTimeout para asegurar que el resto del DOM también cargó
            setTimeout(() => lucide.createIcons(), 0);
        }
    }
}

// Registrar el nuevo componente web
customElements.define('sidebar-menu', SidebarMenu);