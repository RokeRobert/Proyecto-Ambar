using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;
using Ambar.Api.DTOs;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CargaMateriasController : ControllerBase
    {
        private readonly ICargaMateriasRepository _repo;

        public CargaMateriasController(ICargaMateriasRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("disponibles/alumno/{idAlumno}")]
        public async Task<IActionResult> GetDisponibles(int idAlumno, [FromQuery] int periodo)
        {
            // ==========================================
            // SEMÁFORO SIMULADO PARA LA DEMOSTRACIÓN
            // (En el futuro, esto se conectará a la tabla de Configuraciones del Coordinador)
            // ==========================================
            bool inscripcionesAbiertas = true;

            if (!inscripcionesAbiertas)
                return Ok(new { abierto = false, mensaje = "El periodo de inscripciones se encuentra cerrado." });

            var materias = await _repo.GetMateriasDisponiblesAsync(idAlumno, periodo);
            return Ok(new { abierto = true, materias = materias });
        }

        [HttpPost("guardar")]
        public async Task<IActionResult> GuardarCarga([FromBody] GuardarCargaRequest request)
        {
            bool exito = await _repo.GuardarCargaAsync(request.IdAlumno, request.IdPeriodo, request.IdGrupos);

            if (exito) return Ok(new { success = true, mensaje = "Carga académica guardada correctamente." });
            else return StatusCode(500, new { success = false, mensaje = "Hubo un error al guardar la carga." });
        }
    }
}