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

        [HttpGet]
        public async Task<IActionResult> GetAdmin()
        {
            return Ok(await _repo.GetRecibosAdminAsync());
        }

        [HttpPut("pagar/{id}")]
        public async Task<IActionResult> Pagar(int id)
        {
            return await _repo.MarcarPagadoAsync(id) ? Ok(new { success = true }) : BadRequest("Error.");
        }

        [HttpPost("generar/{idAlumno}")]
        public async Task<IActionResult> Generar(int idAlumno)
        {
            return await _repo.GenerarReciboPruebaAsync(idAlumno) ? Ok(new { success = true }) : BadRequest("Error.");
        }
    }
}