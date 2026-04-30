using Microsoft.AspNetCore.Mvc;
using Ambar.Api.DTOs;
using Ambar.Api.Repositories;
using Ambar.Api.Models;
using System.Threading.Tasks;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAlumnoRepository _alumnoRepo;
        private readonly IProfesorRepository _profesorRepo;

        public AuthController(IAlumnoRepository alumnoRepo, IProfesorRepository profesorRepo)
        {
            _alumnoRepo = alumnoRepo;
            _profesorRepo = profesorRepo;
        }

        [HttpPost("alumno/login")]
        public async Task<IActionResult> LoginAlumno([FromBody] LoginAlumnoRequest request)
        {
            // En tu BD, el ID_Alumno funciona como el Número de Control (entero)
            if (!int.TryParse(request.NumeroControl, out int idAlumno))
            {
                return BadRequest(new LoginResponse { Success = false, Mensaje = "El número de control debe ser numérico." });
            }

            var alumno = await _alumnoRepo.LoginAsync(idAlumno, request.Contrasena);

            if (alumno == null)
            {
                return Unauthorized(new LoginResponse { Success = false, Mensaje = "Número de control o contraseña incorrectos." });
            }

            return Ok(new LoginResponse 
            { 
                Success = true, 
                Mensaje = "Sesión iniciada correctamente.",
                Usuario = new 
                {
                    Id = alumno.ID_Alumno,
                    NombreCompleto = $"{alumno.Nombre} {alumno.Primer_Apellido} {alumno.Segundo_Apellido}".Trim(),
                    Nombres = alumno.Nombre,
                    Apellidos = $"{alumno.Primer_Apellido} {alumno.Segundo_Apellido}".Trim(),
                    Correo = string.IsNullOrEmpty(alumno.Correo_Institucional) ? alumno.Correo_Personal : alumno.Correo_Institucional,
                    CorreoPersonal = alumno.Correo_Personal,
                    Telefono = alumno.Telefono,
                    Curp = alumno.CURP,
                    Carrera = alumno.Nombre_Carrera ?? "Sin Carrera",
                    Especialidad = alumno.Nombre_Especialidad ?? "Sin Especialidad",
                    Estatus = alumno.Nombre_Estatus ?? "DESCONOCIDO",
                    PeriodoIngreso = alumno.ID_Periodo_Ingreso,
                    PeriodoActual = alumno.Periodo_Actual,
                    FechaNacimiento = alumno.Fecha_Nacimiento.ToString("dd/MM/yyyy"),
                    Ciudad = alumno.Ciudad ?? "No especificada",
                    Colonia = alumno.Colonia ?? "No especificada",
                    Calle = alumno.Calle ?? "No especificada",
                    Cp = alumno.Codigo_Postal ?? "No especificado",
                    DireccionFoto = alumno.Direccion_Foto,
                    Rol = "Alumno"
                }
            });
        }

        [HttpPost("profesor/login")]
        public async Task<IActionResult> LoginProfesor([FromBody] LoginProfesorRequest request)
        {
            // En tu BD, el ID_Profesor funciona como el Número de Empleado
            if (!int.TryParse(request.NumeroEmpleado, out int idProfesor))
            {
                return BadRequest(new LoginResponse { Success = false, Mensaje = "El número de empleado debe ser numérico." });
            }

            var profesor = await _profesorRepo.LoginAsync(idProfesor, request.Contrasena);

            if (profesor == null)
            {
                return Unauthorized(new LoginResponse { Success = false, Mensaje = "Número de empleado o contraseña incorrectos." });
            }

            return Ok(new LoginResponse 
            { 
                Success = true, 
                Mensaje = "Sesión iniciada correctamente.",
                Usuario = new 
                {
                    Id = profesor.ID_Profesor,
                    NombreCompleto = $"{profesor.Nombre} {profesor.Primer_Apellido} {profesor.Segundo_Apellido}".Trim(),
                    IdRol = profesor.ID_Rol // Enviamos el rol para que el JS sepa a qué pantalla redirigir
                }
            });
        }
    }
}