using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CalificacionController : ControllerBase
    {
        private readonly ICalificacionRepository _repo;

        public CalificacionController(ICalificacionRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("alumno/{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var calificaciones = await _repo.GetCalificacionesByAlumnoAsync(id);
            return Ok(calificaciones);
        }
    }
}