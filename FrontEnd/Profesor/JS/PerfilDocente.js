const API_BASE_URL = 'http://localhost:5067';

/**
 * Clase que representa el modelo de datos del Docente.
 */
class Docente {
    constructor(datos) {
        this.nombre = datos.nombre;
        this.numControl = datos.numControl;
        this.departamento = datos.departamento;
        this.correo = datos.correo;
        this.fotoUrl = datos.fotoUrl;
        this.activo = true;
    }
}

/**
 * Clase encargada de la renderización de los componentes visuales en el DOM.
 */
class InterfazPerfil {
    /**
     * Genera el HTML basado en la información del docente.
     * @param {Docente} docente 
     * @returns {string} Fragmento HTML
     */
    static generarTemplate(docente) {
        const fotoSrc = docente.fotoUrl ? `${API_BASE_URL}${docente.fotoUrl}` : '';

        return `
        <header class="top-header" style="padding: 20px 30px;">
            <h2 style="font-weight: 600;">Perfil Docente</h2>
        </header>

        <div class="perfil-container-content">
            <div class="perfil-flex-container">
                <div class="card-usuario">
                    <div class="foto-perfil" id="abrir-lightbox">
                        <i class="fas fa-user-tie" id="icono-usuario" style="${fotoSrc ? 'display:none' : 'display:block; font-size: 50px; margin-top: 60px; color: #ccc;'}"></i>
                        <img src="${fotoSrc}" alt="Foto Docente" id="foto-preview" style="${fotoSrc ? 'display:block' : 'display:none'}">
                    </div>
                    <button id="btn-cambiar-foto" class="btn-subir-foto"><i class='bx bx-camera'></i> Cambiar Foto</button>
                    <input type="file" id="input-archivo" accept="image/*" style="display: none;">
                    
                    <h2>${docente.nombre}</h2>
                    <p style="color: #64748b; font-size: 0.9rem;">No. Control: ${docente.numControl}</p>
                    <div style="margin: 20px 0; border-top: 1px solid #eee;"></div>
                    <p><strong>${docente.departamento}</strong></p>
                    <span style="color: #2e7d32; font-size: 0.85rem; font-weight: bold;">● Activo</span>
                </div>

                <div class="detalles-perfil">
                    <div class="card">
                        <h3>Información Personal</h3>
                        <div class="form-group">
                            <label>Correo Institucional</label>
                            <input type="text" value="${docente.correo}" readonly>
                        </div>
                    </div>

                    <div class="card">
                        <h3>Seguridad y Preferencias</h3>
                        <button id="btnCambiarPass" class="btn-primario">Cambiar Contraseña</button>
                        <div style="margin-top: 15px; display: flex; align-items: center; gap: 10px;">
                             <input type="checkbox" checked id="alerta-check">
                             <label for="alerta-check" style="font-size: 0.9rem; color: #64748b; cursor:pointer;">Recibir alertas de pendientes</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="modal-password" class="modal">
            <div class="modal-content">
                <span id="cerrarX" style="position:absolute; right:20px; top:15px; cursor:pointer; font-size: 20px;">&times;</span>
                <h3 style="border:none;">Actualizar Seguridad</h3>
                <div class="form-group">
                    <label>Contraseña Actual</label>
                    <input type="password" id="actualPass" placeholder="••••••••">
                </div>
                <div class="form-group">
                    <label>Nueva Contraseña</label>
                    <input type="password" id="nuevaPass">
                </div>
                <div class="form-group">
                    <label>Confirmar Nueva Contraseña</label>
                    <input type="password" id="confirmarPass">
                </div>
                <div style="display:flex; justify-content: center; gap: 15px; margin-top: 25px;">
                    <button id="guardarPass" class="btn-primario">Guardar</button>
                    <button id="cerrarModal" class="btn-secundario-style">Cancelar</button>
                </div>
            </div>
        </div>

        <div id="modal-lightbox" class="modal" style="background: rgba(0,0,0,0.85);">
            <span class="cerrar-lightbox" style="position:absolute; top:20px; right:30px; color:white; font-size:40px; cursor:pointer;">&times;</span>
            <img id="img-grande" style="max-width: 90%; max-height: 80%; border: 5px solid white; border-radius: 10px;">
        </div>
        `;
    }
}

/**
 * Clase Controladora que gestiona los eventos y la lógica del perfil.
 */
class GestionPerfil {
    constructor(docente) {
        this.docente = docente;
        this.mainContainer = document.querySelector('.main-content');
        this.init();
    }

    /**
     * Inicializa la interfaz y vincula los eventos.
     */
    init() {
        if (!this.mainContainer) return;
        
        // 1. Renderizar
        this.mainContainer.innerHTML = InterfazPerfil.generarTemplate(this.docente);

        // 2. Referenciar elementos del DOM
        this.cacheDOM();

        // 3. Vincular Eventos
        this.bindEvents();
    }

    cacheDOM() {
        this.modalPass = document.getElementById('modal-password');
        this.lightbox = document.getElementById('modal-lightbox');
        this.imgGrande = document.getElementById('img-grande');
        this.fotoPreview = document.getElementById('foto-preview');
        this.iconoUsuario = document.getElementById('icono-usuario');
        this.inputArchivo = document.getElementById('input-archivo');
    }

    bindEvents() {
        // Apertura y Cierre
        document.getElementById('btnCambiarPass').onclick = () => this.mostrarModal(this.modalPass);
        document.getElementById('abrir-lightbox').onclick = () => this.abrirImagen();
        
        document.getElementById('cerrarX').onclick = () => this.limpiarYcerrar();
        document.getElementById('cerrarModal').onclick = () => this.limpiarYcerrar();
        document.querySelector('.cerrar-lightbox').onclick = () => this.limpiarYcerrar();

        // Lógica de cambio de contraseña
        document.getElementById('guardarPass').onclick = () => this.validarContrasena();

        // Lógica de Foto
        document.getElementById('btn-cambiar-foto').onclick = () => this.inputArchivo.click();
        this.inputArchivo.onchange = (e) => this.procesarNuevaFoto(e);

        // Cierre por clic externo
        window.onclick = (e) => {
            if (e.target === this.modalPass || e.target === this.lightbox) this.limpiarYcerrar();
        };
    }

    /**
     * Muestra un elemento modal configurando el display a flex.
     */
    mostrarModal(modal) {
        modal.style.display = 'flex';
    }

    /**
     * Prepara y muestra el lightbox con la foto actual.
     */
    abrirImagen() {
        if (this.fotoPreview.src) {
            this.imgGrande.src = this.fotoPreview.src;
            this.mostrarModal(this.lightbox);
        }
    }

    /**
     * Cierra todos los modales y limpia los inputs de texto/password.
     */
    limpiarYcerrar() {
        this.modalPass.style.display = 'none';
        this.lightbox.style.display = 'none';
        
        const inputs = this.modalPass.querySelectorAll('input');
        inputs.forEach(i => {
            i.value = "";
            if (i.type === "text" && i.id.includes('Pass')) i.type = "password";
        });
    }

    /**
     * Valida los requisitos mínimos de seguridad de la contraseña.
     */
    async validarContrasena() {
        const actual = document.getElementById('actualPass').value.trim();
        const nueva = document.getElementById('nuevaPass').value.trim();
        const confirma = document.getElementById('confirmarPass').value.trim();

        if (nueva.length < 8) {
            alert("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }
        if (nueva !== confirma) {
            alert("Las contraseñas no coinciden.");
            return;
        }
        if (!actual) {
            alert("Por favor, ingrese su contraseña actual.");
            return;
        }

        const btnGuardar = document.getElementById('guardarPass');
        const originalText = btnGuardar.innerText;
        btnGuardar.disabled = true;
        btnGuardar.innerText = 'Guardando...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/profesores/${this.docente.numControl}/cambiar-contrasena`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contrasenaActual: actual,
                    nuevaContrasena: nueva,
                    confirmarContrasena: confirma
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.mensaje || 'Error desconocido del servidor.');
            }

            alert(result.mensaje);
            this.limpiarYcerrar();

        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            alert(`Error: ${error.message}`);
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.innerText = originalText;
        }
    }

    /**
     * Maneja la lectura del archivo de imagen, actualiza la vista previa y lo sube al servidor.
     */
    async procesarNuevaFoto(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 1. Mostrar vista previa inmediatamente para una experiencia de usuario fluida
        const reader = new FileReader();
        reader.onload = (ev) => {
            this.fotoPreview.src = ev.target.result;
            this.imgGrande.src = ev.target.result;
            this.fotoPreview.style.display = 'block';
            this.iconoUsuario.style.display = 'none';
        };
        reader.readAsDataURL(file);

        // 2. Subir el archivo al servidor
        const formData = new FormData();
        formData.append('file', file);

        const btnFoto = document.getElementById('btn-cambiar-foto');
        const originalText = btnFoto.innerHTML;
        btnFoto.disabled = true;
        btnFoto.innerHTML = `<i class='bx bx-loader-alt bx-spin'></i> Subiendo...`;

        try {
            const response = await fetch(`http://localhost:5067/api/profesores/${this.docente.numControl}/foto`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.docente.fotoUrl = result.fotoUrl; // Actualizar el estado con la URL relativa del servidor
                const fullServerUrl = API_BASE_URL + result.fotoUrl;
                this.fotoPreview.src = fullServerUrl; // Actualizar la vista previa con la URL completa del servidor
                alert(result.mensaje);
            } else {
                throw new Error(result.mensaje || 'Error desconocido al subir la foto.');
            }

        } catch (error) {
            console.error('Error al subir la foto:', error);
            alert(`Error: ${error.message}`);
            // Revertir la vista previa a la foto original si la subida falla
            const originalFotoSrc = this.docente.fotoUrl ? `${API_BASE_URL}${this.docente.fotoUrl}` : '';
            this.fotoPreview.src = originalFotoSrc;
            if (!originalFotoSrc) {
                this.fotoPreview.style.display = 'none';
                this.iconoUsuario.style.display = 'block';
            }
        } finally {
            btnFoto.disabled = false;
            btnFoto.innerHTML = originalText;
            event.target.value = ''; // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
        }
    }
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si hay una sesión activa
    const sesionJSON = localStorage.getItem("profesorSesion");
    if (!sesionJSON) {
        // Si no hay sesión, redirigir al login de profesores
        // Usamos una ruta absoluta para más seguridad
        window.location.href = "/FrontEnd/Profesor/HTML/LoginProfesor.html"; 
        return;
    }

    const sesion = JSON.parse(sesionJSON);
    const profesorId = sesion.id; // Obtenemos el ID guardado en el login (debe ser minúscula)

    const mainContainer = document.querySelector('.main-content');
    if (!mainContainer) return;

    try {
        // Mostrar un estado de carga mientras se obtienen los datos
        mainContainer.innerHTML = '<p style="text-align:center; padding: 40px;">Cargando perfil...</p>';

        // 2. Hacer la petición al backend para obtener los detalles completos del perfil
        const response = await fetch(`http://localhost:5067/api/profesores/${profesorId}`);
        
        if (!response.ok) {
            // Intentamos leer el mensaje de error de la API
            const errorData = await response.json().catch(() => null);
            const mensaje = errorData?.mensaje || `Error del servidor: ${response.status}`;
            throw new Error(mensaje);
        }

        const datosPerfil = await response.json();

        // 3. Crear la instancia del modelo con los datos reales y iniciar el controlador
        const profesor = new Docente(datosPerfil);
        new GestionPerfil(profesor);

    } catch (error) {
        console.error("Error al cargar el perfil del docente:", error);
        mainContainer.innerHTML = `<p style="text-align:center; padding: 40px; color: red;">No se pudo cargar la información del perfil. ${error.message}</p>`;
    }
});