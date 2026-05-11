#nullable disable
using Microsoft.AspNetCore.Mvc;
using Ambar.Api.DTOs;
using Ambar.Api.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System.Data;
using Dapper;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlumnosController : ControllerBase
    {
        private readonly IAlumnoRepository _repo;
        private readonly IWebHostEnvironment _env;
        private readonly IDbConnection _connection;

        public AlumnosController(IAlumnoRepository repo, IWebHostEnvironment env, IDbConnection connection)
        {
            _repo = repo;
            _env = env;
            _connection = connection;
        }

        [HttpPost("{id:int}/foto")]
        public async Task<IActionResult> SubirFoto(int id, [FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, mensaje = "No se ha seleccionado ningún archivo." });
            }

            // Se guardarán en wwwroot/images/profiles/alumnos
            var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images", "profiles", "alumnos");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileNameWithoutExt = id.ToString();
            var existingFiles = Directory.EnumerateFiles(uploadsFolder, $"{fileNameWithoutExt}.*");
            foreach (var oldFile in existingFiles)
            {
                System.IO.File.Delete(oldFile);
            }

            var extension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{fileNameWithoutExt}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/images/profiles/alumnos/{uniqueFileName}";
            
            // Actualizamos la base de datos
            var query = "UPDATE dbo.alumnos SET Direccion_Foto = @Url WHERE ID_Alumno = @Id";
            var rowsAffected = await _connection.ExecuteAsync(query, new { Url = fileUrl, Id = id });
            var resultado = rowsAffected > 0;

            if (resultado)
            {
                return Ok(new { success = true, mensaje = "Foto actualizada correctamente.", fotoUrl = fileUrl });
            }

            if (System.IO.File.Exists(filePath)) { System.IO.File.Delete(filePath); }
            return StatusCode(500, new { success = false, mensaje = "Ocurrió un error al guardar la referencia de la foto en BD." });
        }

        [HttpPost("{id:int}/cambiar-contrasena")]
        public async Task<IActionResult> CambiarContrasena(int id, [FromBody] CambiarContrasenaDto dto)
        {
            if (string.IsNullOrEmpty(dto.NuevaContrasena) || dto.NuevaContrasena.Length < 8)
                return BadRequest(new { success = false, mensaje = "La nueva contraseña debe tener al menos 8 caracteres." });

            if (dto.NuevaContrasena != dto.ConfirmarContrasena)
                return BadRequest(new { success = false, mensaje = "Las contraseñas no coinciden." });

            // Validamos que la contraseña actual sea la correcta utilizando el método Login
            var alumnoValido = await _repo.LoginAsync(id, dto.ContrasenaActual);
            if (alumnoValido == null)
                return Unauthorized(new { success = false, mensaje = "La contraseña actual es incorrecta." });

            var query = "UPDATE dbo.alumnos SET Contrasena = @NuevaContrasena WHERE ID_Alumno = @Id";
            var rowsAffected = await _connection.ExecuteAsync(query, new { NuevaContrasena = dto.NuevaContrasena, Id = id });
            var resultado = rowsAffected > 0;

            return resultado ? Ok(new { success = true, mensaje = "Contraseña actualizada correctamente." }) : StatusCode(500, new { success = false, mensaje = "Ocurrió un error al actualizar la contraseña." });
        }
    }
}