using Microsoft.AspNetCore.Mvc;
using Ambar.Api.DTOs;
using Ambar.Api.Repositories;

namespace Ambar.Api.Controllers
{
    // Esta ruta se convierte en /api/profesores
    [Route("api/[controller]")]
    [ApiController]
    public class ProfesoresController : ControllerBase
    {
        private readonly IProfesorRepository _repo;

        public ProfesoresController(IProfesorRepository repo)
        {
            _repo = repo;
        }

        // Al combinarse con la de arriba, se convierte en /api/profesores/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] ProfesorLoginDto loginDto)
        {
            // 1. Convertir el texto a número porque tu Repositorio (y BD) esperan un entero
            if (!int.TryParse(loginDto.IdProfesor, out int idProfesorInt))
            {
                return BadRequest(new { success = false, mensaje = "El número de empleado debe ser numérico." });
            }

            // 2. Consultar a la base de datos con el número correcto
            var profesorBD = await _repo.LoginAsync(idProfesorInt, loginDto.Contrasena);

            if (profesorBD == null)
            {
                return Unauthorized(new { success = false, mensaje = "Usuario o contraseña incorrectos." });
            }

            // 3. Traducir el ID_Rol numérico a texto para que el Frontend (Login.js) sepa a dónde redirigir
            string nombreRol = "docente";
            if (profesorBD.ID_Rol == 1) nombreRol = "administrador";
            else if (profesorBD.ID_Rol == 2) nombreRol = "coordinador";

            var profesorData = new { 
                Id = profesorBD.ID_Profesor, 
                NombreCompleto = $"{profesorBD.Nombre} {profesorBD.Primer_Apellido} {profesorBD.Segundo_Apellido}".Trim(), 
                Rol = nombreRol 
            };

            return Ok(new { success = true, profesor = profesorData });
        }
    }
}
