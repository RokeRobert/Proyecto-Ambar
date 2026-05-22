class SidebarMenu extends HTMLElement {
    connectedCallback() {
        // 1. Renderizamos SOLO el HTML del menú lateral
        this.innerHTML = `
            <aside class="sidebar" style="z-index: 2147483647;">
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
                    <a href="#" class="menu-item" id="btn-cerrar-sesion-menu" style="color: #e53935; margin-top: 10px; position: relative; z-index: 2147483647; cursor: pointer;">
                        <i data-lucide="log-out"></i>
                        <span>Cerrar Sesión</span>
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

        // 2. Crear o recuperar el Modal Global de Cerrar Sesión directamente en el body
        let modalLogoutGlobal = document.getElementById('modalLogoutGlobal');

        if (!modalLogoutGlobal) {
            modalLogoutGlobal = document.createElement('div');
            modalLogoutGlobal.id = 'modalLogoutGlobal';
            modalLogoutGlobal.className = 'modal';
            // Se usó el max z-index permitido en CSS (2147483647) para que NADA pueda taparlo
            modalLogoutGlobal.style.cssText = 'display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2147483647; align-items: center; justify-content: center; backdrop-filter: blur(4px);';
            modalLogoutGlobal.innerHTML = `
                <div class="modal-content" style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 350px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div style="margin-bottom: 15px; color: #e53935; display: flex; justify-content: center;">
                        <i data-lucide="log-out" style="width: 50px; height: 50px;"></i>
                    </div>
                    <h3 style="color: #0b2a4a; margin-bottom: 10px; font-size: 1.3rem;">Cerrar Sesión</h3>
                    <p style="color: #666; margin-bottom: 25px; font-size: 0.95rem;">¿Estás seguro de que deseas salir de tu cuenta?</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="btn-cancelar-logout" style="flex: 1; padding: 12px; border: none; border-radius: 8px; background: #f1f5f9; color: #333; cursor: pointer; font-weight: 600;">Cancelar</button>
                        <button id="btn-confirmar-logout" style="flex: 1; padding: 12px; border: none; border-radius: 8px; background: #e53935; color: white; cursor: pointer; font-weight: 600;">Sí, salir</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalLogoutGlobal);

            // Asignar los eventos a los botones del modal una sola vez
            document.getElementById('btn-cancelar-logout').addEventListener('click', () => {
                modalLogoutGlobal.style.display = 'none';
            });

            document.getElementById('btn-confirmar-logout').addEventListener('click', () => {
                localStorage.removeItem("alumnoSesion");
                window.location.href = "Login.html";
            });

            // Cerrar modal al hacer clic afuera de la caja
            modalLogoutGlobal.addEventListener('click', (e) => {
                if (e.target === modalLogoutGlobal) {
                    modalLogoutGlobal.style.display = 'none';
                }
            });
        }

        // 3. Conectar el botón usando DELEGACIÓN y FASE DE CAPTURA
        // Garantiza que el clic funcione aunque otras pantallas recarguen el DOM o bloqueen eventos
        if (!window.logoutEventDelegado) {
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('#btn-cerrar-sesion-menu');
                if (btn) {
                    e.preventDefault();
                    e.stopPropagation(); 
                    const modal = document.getElementById('modalLogoutGlobal');
                    if (modal) modal.style.display = 'flex';
                }
            }, true); // El 'true' obliga al navegador a escuchar esto ANTES que a cualquier otra pantalla
            window.logoutEventDelegado = true;
        }

        // 4. Inicializar los íconos de Lucide en toda la página
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 0);
        }
    }
}

// Registrar el nuevo componente web si no existe
if (!customElements.get('sidebar-menu')) {
    customElements.define('sidebar-menu', SidebarMenu);
}