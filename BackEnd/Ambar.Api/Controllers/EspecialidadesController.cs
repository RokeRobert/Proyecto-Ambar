using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;
using Ambar.Api.DTOs;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EspecialidadesController : ControllerBase
    {
        private readonly IEspecialidadRepository _repo;
        public EspecialidadesController(IEspecialidadRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var especialidades = await _repo.GetEspecialidadesAsync();
            return Ok(especialidades);
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CrearEspecialidadDto dto)
        {
            try {
                bool ok = await _repo.CrearEspecialidadAsync(dto);
                return ok ? Ok(new { success = true }) : BadRequest("Error al crear especialidad.");
            } catch (Exception ex) { return StatusCode(500, ex.Message); }
        }
    }
}