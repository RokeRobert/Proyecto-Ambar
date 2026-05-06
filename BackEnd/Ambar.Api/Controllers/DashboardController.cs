using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardRepository _repo;

        public DashboardController(IDashboardRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("resumen")]
        public async Task<IActionResult> GetResumen([FromQuery] string carrera = "todas")
        {
            var resumen = await _repo.GetResumenAsync(carrera);
            return Ok(resumen);
        }
    }
}