using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;
using Ambar.Api.DTOs;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CreditosController : ControllerBase
    {
        private readonly ICreditoRepository _repo;
        private readonly IWebHostEnvironment _env;

        public CreditosController(ICreditoRepository repo, IWebHostEnvironment env)
        {
            _repo = repo;
            _env = env;
        }

        [HttpGet("alumno/{idAlumno}")]
        public async Task<IActionResult> GetCreditos(int idAlumno)
        {
            var creditos = await _repo.GetByAlumnoAsync(idAlumno);
            return Ok(creditos);
        }

        [HttpGet("disponibles/{idAlumno}")]
        public async Task<IActionResult> GetDisponibles(int idAlumno)
        {
            var disponibles = await _repo.GetActividadesDisponiblesAsync(idAlumno);
            return Ok(disponibles);
        }

        [HttpPost("subir")]
        public async Task<IActionResult> SubirCredito([FromForm] int idAlumno, [FromForm] int idActividad, [FromForm] IFormFile archivo)
        {
            if (archivo == null || archivo.Length == 0) return BadRequest(new { success = false, mensaje = "No se envió ningún archivo." });
            if (archivo.ContentType != "application/pdf") return BadRequest(new { success = false, mensaje = "Solo se permiten archivos PDF." });

            // Crear la ruta donde se guardará el PDF físicamente
            string uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "documentos", "creditos");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            string uniqueFileName = $"{idAlumno}_{idActividad}_{DateTime.Now.Ticks}.pdf";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create)) { await archivo.CopyToAsync(fileStream); }

            bool guardado = await _repo.SubirCreditoAsync(idAlumno, idActividad, $"/uploads/documentos/creditos/{uniqueFileName}");

            if (guardado) return Ok(new { success = true, mensaje = "Archivo subido correctamente para revisión." });
            return StatusCode(500, new { success = false, mensaje = "Error al guardar en base de datos." });
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAdmin()
        {
            return Ok(await _repo.GetCreditosAdminAsync());
        }

        [HttpPut("estatus")]
        public async Task<IActionResult> ActualizarEstatus([FromBody] ActualizarEstatusCreditoDto dto)
        {
            bool ok = await _repo.ActualizarEstatusCreditoAsync(dto);
            return ok ? Ok(new { success = true }) : BadRequest("Error al actualizar el crédito.");
        }
    }
}