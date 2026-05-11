#nullable disable
using Microsoft.AspNetCore.Mvc;
using Ambar.Api.DTOs;
using Ambar.Api.Repositories;
// Asumimos que el modelo completo del profesor está en este namespace
using Ambar.Api.Models;
using System.Data;
using Dapper;
using System.Text.Json;
using System;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace Ambar.Api.DTOs
{
    public class ProfesorPerfilDto
    {
        public string Nombre { get; set; }
        public string NumControl { get; set; }
        public string Departamento { get; set; }
        public string Correo { get; set; }
        public string FotoUrl { get; set; }
    }

    public class HorarioItemDto
    {
        public int IdGrupo { get; set; }
        public string NombreMateria { get; set; }
        public string Grupo { get; set; }
        public string Aula { get; set; }
        public string DiaSemana { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
    }

    // DTOs para la página de Calificaciones
    public class GrupoDocenteDto
    {
        public int IdGrupo { get; set; }
        public string NombreGrupo { get; set; }
        public int Unidad { get; set; }
    }

    public class AlumnoCalificacionDto
    {
        public int IdAlumno { get; set; }
        public string Nombre { get; set; }
        public int? P1 { get; set; }
        public int? P2 { get; set; }
        public int? P3 { get; set; }
        public int? P4 { get; set; }
        public int? P5 { get; set; }
        public int? P6 { get; set; }
    }

    public class CalificacionUpdateDto
    {
        public int IdAlumno { get; set; }
        public int? P1 { get; set; }
        public int? P2 { get; set; }
        public int? P3 { get; set; }
        public int? P4 { get; set; }
        public int? P5 { get; set; }
        public int? P6 { get; set; }
    }

    public class ItemEditorDto
    {
        public int Unidad { get; set; } = 1;
        public string Titulo { get; set; }
        public string Contenido { get; set; }
    }

    public class CambiarContrasenaDto
    {
        public string ContrasenaActual { get; set; }
        public string NuevaContrasena { get; set; }
        public string ConfirmarContrasena { get; set; }
    }

    // DTO para la asignación de profesor a grupo desde la vista del Coordinador
    public class AsignacionProfesorDto
    {
        public int? IdProfesor { get; set; }
    }

    public class InscripcionDto
    {
        public int IdAlumno { get; set; }
        public int IdGrupo { get; set; }
    }

}

namespace Ambar.Api.Controllers
{
    // Esta ruta se convierte en /api/profesores
    [Route("api/[controller]")]
    [ApiController]
    public class ProfesoresController : ControllerBase
    {
        private readonly IProfesorRepository _repo;
        private readonly IDbConnection _connection;
        private readonly IWebHostEnvironment _env;

        public ProfesoresController(IProfesorRepository repo, IDbConnection connection, IWebHostEnvironment env)
        {
            _repo = repo;
            _connection = connection;
            _env = env;
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

            // Consultar foto
            string queryFoto = "SELECT Direccion_Foto FROM dbo.profesores WHERE ID_Profesor = @id";
            string fotoUrl = await _connection.QueryFirstOrDefaultAsync<string>(queryFoto, new { id = idProfesorInt });

            // 3. Traducir el ID_Rol numérico a texto para que el Frontend (Login.js) sepa a dónde redirigir
            string nombreRol = "docente";
            if (profesorBD.ID_Rol == 1) nombreRol = "administrador";
            else if (profesorBD.ID_Rol == 2) nombreRol = "coordinador";

            var profesorData = new { 
                Id = profesorBD.ID_Profesor, 
                NombreCompleto = $"{profesorBD.Nombre} {profesorBD.Primer_Apellido} {profesorBD.Segundo_Apellido}".Trim(), 
                Rol = nombreRol,
                FotoUrl = fotoUrl ?? ""
            };

            return Ok(new { success = true, profesor = profesorData });
        }

        // GET: api/profesores/{id}
        // Este endpoint obtiene los detalles completos de un profesor para su página de perfil.
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetProfesor(int id)
        {
            // Asumimos que el repositorio tiene un método para buscar por ID.
            // Este método debería devolver el modelo completo del profesor desde la BD.
            var profesor = await _repo.GetByIdAsync(id); 

            if (profesor == null)
            {
                return NotFound(new { success = false, mensaje = "Profesor no encontrado." });
            }

            // Realizamos una consulta directa para asegurar que el correo y foto se extraigan de la BD
            string query = "SELECT Correo_Institucional, Direccion_Foto FROM dbo.profesores WHERE ID_Profesor = @id";
            var datosExtras = await _connection.QueryFirstOrDefaultAsync<dynamic>(query, new { id });

            // Mapeamos el modelo de la BD a nuestro DTO para el frontend
            var perfilDto = new ProfesorPerfilDto
            {
                Nombre = $"{profesor.Nombre} {profesor.Primer_Apellido} {profesor.Segundo_Apellido}".Trim(),
                NumControl = profesor.ID_Profesor.ToString(),
                Departamento = "Sistemas y Computación", // Valor por defecto
                Correo = datosExtras != null && !string.IsNullOrEmpty((string)datosExtras.Correo_Institucional) ? (string)datosExtras.Correo_Institucional : "Sin correo registrado",
                FotoUrl = datosExtras != null && datosExtras.Direccion_Foto != null ? (string)datosExtras.Direccion_Foto : ""
            };

            return Ok(perfilDto);
        }

        // GET: api/profesores/{id}/horario
        // Este endpoint obtiene el horario del profesor para el periodo activo.
        [HttpGet("{id:int}/horario")]
        public async Task<IActionResult> GetHorario(int id)
        {
            var horario = await _repo.GetHorarioAsync(id);
            if (horario == null)
            {
                // Devolvemos una lista vacía para que el frontend no falle.
                return Ok(new List<HorarioItemDto>());
            }
            return Ok(horario);
        }

        // POST: api/profesores/{id}/foto
        [HttpPost("{id:int}/foto")]
        public async Task<IActionResult> SubirFoto(int id, [FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, mensaje = "No se ha seleccionado ningún archivo." });
            }

            // 1. Definir la carpeta de destino dentro de wwwroot
            var uploadsFolder = Path.Combine(_env.WebRootPath, "images", "profiles");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // ANTES DE GUARDAR, BORRAMOS CUALQUIER FOTO ANTERIOR DEL USUARIO PARA SOBREESCRIBIR.
            // Usamos el ID del profesor como identificador único para el archivo.
            var fileNameWithoutExt = id.ToString();
            var existingFiles = Directory.EnumerateFiles(uploadsFolder, $"{fileNameWithoutExt}.*");
            foreach (var oldFile in existingFiles)
            {
                System.IO.File.Delete(oldFile);
            }

            // 2. Generar el nuevo nombre de archivo usando el ID del profesor como identificador.
            var extension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{fileNameWithoutExt}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 3. Guardar el archivo físicamente en el servidor
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 4. Crear la URL relativa que se guardará en la base de datos
            var fileUrl = $"/images/profiles/{uniqueFileName}";

            // 5. Actualizar la referencia en la base de datos
            var resultado = await _repo.ActualizarFotoAsync(id, fileUrl);

            if (resultado)
            {
                return Ok(new { success = true, mensaje = "Foto actualizada correctamente.", fotoUrl = fileUrl });
            }

            // Si la actualización de la BD falla, borramos el archivo subido para no dejar basura.
            if (System.IO.File.Exists(filePath)) { System.IO.File.Delete(filePath); }

            return StatusCode(500, new { success = false, mensaje = "Ocurrió un error al guardar la referencia de la foto." });
        }

        // GET: api/profesores/{id}/grupos
        // Obtiene los grupos que imparte un profesor en el periodo actual.
        [HttpGet("{id:int}/grupos")]
        public async Task<IActionResult> GetGrupos(int id)
        {
            // Usamos Dapper directo para asegurar traer la columna Unidades sin depender del repo
            string query = @"
                SELECT 
                    g.ID_Grupo as IdGrupo, 
                    m.Nombre_Materia + ' - Grupo ' + CAST(g.ID_Grupo AS VARCHAR) as NombreGrupo,
                    m.Unidad
                FROM dbo.grupos g
                JOIN dbo.materias m ON g.ID_Materia = m.ID_Materia
                WHERE g.ID_Profesor = @id";
                
            var grupos = await _connection.QueryAsync<GrupoDocenteDto>(query, new { id });
            return Ok(grupos);
        }

        // GET: api/profesores/grupos/{idGrupo}/alumnos
        // Obtiene la lista de alumnos inscritos en un grupo específico.
        [HttpGet("grupos/{idGrupo:int}/alumnos")]
        public async Task<IActionResult> GetAlumnos(int idGrupo)
        {
            var alumnos = await _repo.GetAlumnosByGrupoAsync(idGrupo);
            return Ok(alumnos);
        }

        // POST: api/profesores/grupos/{idGrupo}/calificaciones
        // Guarda o actualiza las calificaciones de los alumnos de un grupo.
        [HttpPost("grupos/{idGrupo:int}/calificaciones")]
        public async Task<IActionResult> GuardarCalificaciones(int idGrupo, [FromBody] List<CalificacionUpdateDto> calificaciones)
        {
            if (calificaciones == null || !calificaciones.Any())
            {
                return BadRequest(new { success = false, mensaje = "No se recibieron datos para guardar." });
            }

            var resultado = await _repo.GuardarCalificacionesAsync(idGrupo, calificaciones);

            if (resultado)
            {
                return Ok(new { success = true, mensaje = "Calificaciones guardadas exitosamente." });
            }

            return StatusCode(500, new { success = false, mensaje = "Ocurrió un error al guardar las calificaciones." });
        }

        // POST: api/profesores/{id}/cambiar-contrasena
        [HttpPost("{id:int}/cambiar-contrasena")]
        public async Task<IActionResult> CambiarContrasena(int id, [FromBody] CambiarContrasenaDto dto)
        {
            if (string.IsNullOrEmpty(dto.NuevaContrasena) || dto.NuevaContrasena.Length < 8)
            {
                return BadRequest(new { success = false, mensaje = "La nueva contraseña debe tener al menos 8 caracteres." });
            }

            if (dto.NuevaContrasena != dto.ConfirmarContrasena)
            {
                return BadRequest(new { success = false, mensaje = "Las contraseñas no coinciden." });
            }

            // 1. Obtener el profesor completo desde la base de datos usando su ID.
            var profesor = await _repo.GetByIdAsync(id);

            // Si no se encuentra el profesor, es un error.
            if (profesor == null)
            {
                return NotFound(new { success = false, mensaje = "Usuario no encontrado." });
            }

            // 2. Comparar la contraseña guardada en la BD (que ahora sí tenemos en el objeto 'profesor')
            //    con la que el usuario escribió en el formulario.
            if (profesor.Contrasena?.Trim() != dto.ContrasenaActual)
            {
                return Unauthorized(new { success = false, mensaje = "La contraseña actual es incorrecta." });
            }

            // 3. Si la contraseña es correcta, procedemos a actualizarla.
            var resultado = await _repo.CambiarContrasenaAsync(id, dto.NuevaContrasena);

            if (resultado)
            {
                return Ok(new { success = true, mensaje = "Contraseña actualizada correctamente." });
            }

            return StatusCode(500, new { success = false, mensaje = "Ocurrió un error al actualizar la contraseña." });
        }

        // GET: api/profesores/grupos/{idGrupo}/contenido/{tipo}
        [HttpGet("grupos/{idGrupo:int}/contenido/{tipo}")]
        public async Task<IActionResult> GetContenido(int idGrupo, string tipo)
        {
            var (tableName, columnName) = GetTableAndColumnNames(tipo);
            if (tableName == null || columnName == null)
            {
                return BadRequest(new { success = false, mensaje = "Tipo de contenido no válido." });
            }

            try
            {
                // Se usan los nombres de columna y tabla del archivo .sql
                string query = $"SELECT {columnName} FROM {tableName} WHERE ID_Grupo = @idGrupo";
                var contenidoJson = await _connection.QueryFirstOrDefaultAsync<string>(query, new { idGrupo });

                if (string.IsNullOrEmpty(contenidoJson))
                {
                    return Ok(new List<ItemEditorDto>()); // Devolver lista vacía si no hay nada
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var contenido = JsonSerializer.Deserialize<List<ItemEditorDto>>(contenidoJson, options);
                return Ok(contenido);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "Error al procesar el contenido.", error = ex.Message });
            }
        }

        // POST: api/profesores/grupos/{idGrupo}/contenido/{tipo}
        [HttpPost("grupos/{idGrupo:int}/contenido/{tipo}")]
        public async Task<IActionResult> GuardarContenido(int idGrupo, string tipo, [FromBody] List<ItemEditorDto> contenido)
        {
            if (contenido == null)
            {
                return BadRequest(new { success = false, mensaje = "No se recibieron datos para guardar." });
            }

            var (tableName, columnName) = GetTableAndColumnNames(tipo);
            if (tableName == null || columnName == null)
            {
                return BadRequest(new { success = false, mensaje = "Tipo de contenido no válido." });
            }

            try
            {
                var contenidoJson = JsonSerializer.Serialize(contenido);
 
                // Alternativa a MERGE: Usar un enfoque de "verificar y luego actuar" para evitar problemas
                // con la sentencia MERGE en ciertos escenarios de inserción.
                string checkQuery = $"SELECT COUNT(1) FROM {tableName} WHERE ID_Grupo = @idGrupo";
                var exists = await _connection.ExecuteScalarAsync<int>(checkQuery, new { idGrupo });
 
                if (exists > 0)
                {
                    // Si el registro ya existe, lo actualizamos.
                    string updateQuery = $"UPDATE {tableName} SET {columnName} = @contenidoJson WHERE ID_Grupo = @idGrupo";
                    await _connection.ExecuteAsync(updateQuery, new { idGrupo, contenidoJson });
                }
                else
                {
                    // Si no existe, creamos uno nuevo.
                    string insertQuery = $"INSERT INTO {tableName} (ID_Grupo, {columnName}) VALUES (@idGrupo, @contenidoJson)";
                    await _connection.ExecuteAsync(insertQuery, new { idGrupo, contenidoJson });
                }
 
                return Ok(new { success = true, mensaje = "Contenido guardado exitosamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "Ocurrió un error al guardar el contenido.", error = ex.Message });
            }
        }

        private (string? TableName, string? ColumnName) GetTableAndColumnNames(string tipo)
        {
            return tipo.ToLower() switch
            {
                "instrumentacion" => ("instrumentacion", "Instrumentacion"),
                "planeacion" => ("planeacion", "Planeacion"),
                "material_didactico" => ("material_didactico", "Materia_Didactico"),
                "fuentes_informacion" => ("fuentes_informacion", "Fuentes_Informacion"),
                _ => (null, null)
            };
        }
    }
}