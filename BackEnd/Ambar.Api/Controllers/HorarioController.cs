using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HorarioController : ControllerBase
    {
        private readonly IHorarioRepository _repo;

        public HorarioController(IHorarioRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("alumno/{id}")]
        public async Task<IActionResult> Get(int id, [FromQuery] int periodo)
        {
            var horario = await _repo.GetHorarioAlumnoAsync(id, periodo);
            return Ok(horario);
        }
    }
}