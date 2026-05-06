using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;
using Ambar.Api.DTOs;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MateriasController : ControllerBase
    {
        private readonly IMateriaRepository _repo;
        public MateriasController(IMateriaRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int? idCarrera)
        {
            var materias = await _repo.GetMateriasAsync(idCarrera);
            return Ok(materias);
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CrearMateriaDto dto)
        {
            try {
                bool ok = await _repo.CrearMateriaAsync(dto);
                return ok ? Ok(new { success = true, mensaje = "Materia creada correctamente." }) : BadRequest("No se pudo crear.");
            } catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] CrearMateriaDto dto)
        {
            try {
                bool ok = await _repo.ActualizarMateriaAsync(id, dto);
                return ok ? Ok(new { success = true, mensaje = "Materia actualizada." }) : BadRequest("No se pudo actualizar.");
            } catch (Exception ex) { return StatusCode(500, ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            try {
                bool ok = await _repo.EliminarMateriaAsync(id);
                return ok ? Ok(new { success = true, mensaje = "Materia eliminada." }) : BadRequest("No se encontró.");
            } catch (Exception) { 
                return BadRequest(new { success = false, mensaje = "No se puede eliminar porque ya tiene calificaciones asignadas." }); 
            }
        }
    }
}