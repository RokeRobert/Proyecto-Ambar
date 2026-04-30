using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecibosController : ControllerBase
    {
        private readonly IReciboRepository _repo;
        public RecibosController(IReciboRepository repo) => _repo = repo;

        [HttpGet("alumno/{idAlumno}")]
        public async Task<IActionResult> GetRecibos(int idAlumno)
        {
            var recibos = await _repo.GetRecibosByAlumnoAsync(idAlumno);
            return Ok(recibos);
        }
    }
}