using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;
using Ambar.Api.DTOs;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketRepository _repo;
        private readonly IWebHostEnvironment _env;

        public TicketsController(ITicketRepository repo, IWebHostEnvironment env)
        {
            _repo = repo;
            _env = env;
        }

        [HttpGet("alumno/{idAlumno}")]
        public async Task<IActionResult> GetTickets(int idAlumno)
        {
            var tickets = await _repo.GetByAlumnoAsync(idAlumno);
            return Ok(tickets);
        }

        [HttpPost("crear")]
        public async Task<IActionResult> CrearTicket([FromForm] int idAlumno, [FromForm] string tipoProblema, [FromForm] string observaciones, [FromForm] IFormFile? evidencia)
        {
            string? evidenciaUrl = null;

            // Si el alumno subió una imagen de evidencia, la guardamos físicamente
            if (evidencia != null && evidencia.Length > 0)
            {
                string uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "documentos", "tickets");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                string uniqueFileName = $"{idAlumno}_ticket_{DateTime.Now.Ticks}{Path.GetExtension(evidencia.FileName)}";
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create)) { await evidencia.CopyToAsync(fileStream); }
                evidenciaUrl = $"/uploads/documentos/tickets/{uniqueFileName}";
            }

            bool guardado = await _repo.CrearTicketAsync(idAlumno, tipoProblema, observaciones, evidenciaUrl);
            if (guardado) return Ok(new { success = true, mensaje = "Ticket generado correctamente." });
            return StatusCode(500, new { success = false, mensaje = "Error al guardar el ticket en base de datos." });
        }

        [HttpGet("admin/alumnos")]
        public async Task<IActionResult> GetAdminAlumnos()
        {
            return Ok(await _repo.GetTicketsAlumnosAsync());
        }

        [HttpGet("admin/profesores")]
        public async Task<IActionResult> GetAdminProfesores()
        {
            return Ok(await _repo.GetTicketsProfesoresAsync());
        }

        [HttpPut("admin/estatus")]
        public async Task<IActionResult> ActualizarEstatusAdmin([FromBody] ActualizarEstatusTicketDto dto)
        {
            bool ok = await _repo.ActualizarEstatusAdminAsync(dto);
            return ok ? Ok(new { success = true }) : BadRequest("Error al actualizar ticket.");
        }
    }
}