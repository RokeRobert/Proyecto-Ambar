using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories; 
using Ambar.Api.DTOs;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioRepository _repo;

        public UsuariosController(IUsuarioRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuarios = await _repo.GetUsuariosAsync();
            return Ok(usuarios);
        }

        [HttpGet("alumnos")]
        public async Task<IActionResult> GetAlumnosLista()
        {
            var alumnos = await _repo.GetAlumnosListaAsync();
            return Ok(alumnos);
        }

        [HttpGet("profesores")]
        public async Task<IActionResult> GetProfesoresLista()
        {
            var profesores = await _repo.GetProfesoresListaAsync();
            return Ok(profesores);
        }

        [HttpGet("carreras")]
        public async Task<IActionResult> GetCarreras()
        {
            var carreras = await _repo.GetCarrerasAsync();
            return Ok(carreras);
        }

        [HttpGet("carrerasDisponibles")]
        public async Task<IActionResult> GetCarrerasDisponibles([FromQuery] int idDepartamento, [FromQuery] int? idProfesor)
        {
            var carreras = await _repo.GetCarrerasDisponiblesAsync(idDepartamento, idProfesor);
            return Ok(carreras);
        }

        [HttpGet("departamentos")]
        public async Task<IActionResult> GetDepartamentos()
        {
            var departamentos = await _repo.GetDepartamentosAsync();
            return Ok(departamentos);
        }

        [HttpGet("periodo")]
        public async Task<IActionResult> GetPeriodoActual()
        {
            int id = await _repo.GetPeriodoActualAsync();
            return Ok(id);
        }

        [HttpGet("periodos")]
        public async Task<IActionResult> GetPeriodos()
        {
            var periodos = await _repo.GetPeriodosAsync();
            return Ok(periodos);
        }

        [HttpPost("alumno")]
        public async Task<IActionResult> CrearAlumno([FromBody] CrearAlumnoDto dto)
        {
            try {
                bool guardado = await _repo.CrearAlumnoAsync(dto);
                if (guardado) return Ok(new { success = true, mensaje = "Alumno registrado correctamente." });
                return BadRequest("No se pudo registrar al alumno.");
            } catch (Exception ex) {
                return StatusCode(500, "Error en Base de Datos: " + ex.Message);
            }
        }

        [HttpPost("profesor")]
        public async Task<IActionResult> CrearProfesor([FromBody] CrearProfesorDto dto)
        {
            try {
                bool guardado = await _repo.CrearProfesorAsync(dto);
                if (guardado) return Ok(new { success = true, mensaje = "Docente/Administrativo registrado correctamente." });
                return BadRequest("No se pudo registrar al profesor.");
            } catch (Exception ex) {
                return StatusCode(500, "Error en Base de Datos: " + ex.Message);
            }
        }

        [HttpGet("alumno/{id}")]
        public async Task<IActionResult> GetAlumno(int id)
        {
            var alumno = await _repo.GetAlumnoByIdAsync(id);
            return alumno != null ? Ok(alumno) : NotFound();
        }

        [HttpGet("profesor/{id}")]
        public async Task<IActionResult> GetProfesor(int id)
        {
            var profesor = await _repo.GetProfesorByIdAsync(id);
            return profesor != null ? Ok(profesor) : NotFound();
        }

        [HttpPut("alumno/{id}")]
        public async Task<IActionResult> ActualizarAlumno(int id, [FromBody] CrearAlumnoDto dto)
        {
            try {
                bool guardado = await _repo.ActualizarAlumnoAsync(id, dto);
                if (guardado) return Ok(new { success = true, mensaje = "Alumno actualizado correctamente." });
                return BadRequest("No se pudo actualizar al alumno.");
            } catch (Exception ex) { return StatusCode(500, "Error en BD: " + ex.Message); }
        }

        [HttpPut("profesor/{id}")]
        public async Task<IActionResult> ActualizarProfesor(int id, [FromBody] CrearProfesorDto dto)
        {
            try {
                bool guardado = await _repo.ActualizarProfesorAsync(id, dto);
                if (guardado) return Ok(new { success = true, mensaje = "Usuario actualizado correctamente." });
                return BadRequest("No se pudo actualizar al profesor.");
            } catch (Exception ex) { return StatusCode(500, "Error en BD: " + ex.Message); }
        }

        [HttpDelete("{tipo}/{id}")]
        public async Task<IActionResult> EliminarUsuario(string tipo, int id)
        {
            try {
                bool eliminado = tipo.ToLower() == "alumno" ? await _repo.EliminarAlumnoAsync(id) : await _repo.EliminarProfesorAsync(id);
                if (eliminado) return Ok(new { success = true, mensaje = "Usuario eliminado correctamente." });
                return BadRequest(new { success = false, mensaje = "No se encontró el usuario." });
            } catch (Exception) {
                // Si SQL Server lanza error por Foreign Keys (Kardex, Recibos, etc.)
                return BadRequest(new { success = false, mensaje = "No se puede eliminar a este usuario porque ya tiene calificaciones, recibos o historial asociado." });
            }
        }
    }
}