using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KardexController : ControllerBase
    {
        private readonly IKardexRepository _repo;

        public KardexController(IKardexRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("alumno/{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var kardex = await _repo.GetKardexAlumnoAsync(id);
            return Ok(kardex);
        }
    }
}