using Ambar.Api.DTOs;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using System.Linq;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoordinadorController : ControllerBase
    {
        private readonly IDbConnection _connection;

        public CoordinadorController(IDbConnection connection)
        {
            _connection = connection;
        }

        [HttpGet("grupos-asignacion")]
        public async Task<IActionResult> GetGruposParaAsignacion()
        {
            var query = @"
                SELECT 
                    g.ID_Grupo AS Id,
                    CAST(g.ID_Grupo AS VARCHAR) AS Grupo,
                    m.Nombre_Materia AS Materia,
                    c.Nombre_Carrera AS Carrera,
                    ISNULL(p.Nombre + ' ' + p.Primer_Apellido + ' ' + p.Segundo_Apellido, NULL) AS Profesor
                FROM dbo.grupos g
                JOIN dbo.materias m ON g.ID_Materia = m.ID_Materia
                JOIN dbo.carreras c ON g.ID_Carrera = c.ID_Carrera
                LEFT JOIN dbo.profesores p ON g.ID_Profesor = p.ID_Profesor
                ORDER BY g.ID_Grupo;
            ";

            var grupos = await _connection.QueryAsync<GrupoAsignacionDto>(query);
            return Ok(grupos);
        }

        [HttpGet("docentes")]
        public async Task<IActionResult> GetDocentesSimple()
        {
            var query = @"
                SELECT 
                    ID_Profesor as Id, 
                    Nombre + ' ' + Primer_Apellido + ' ' + Segundo_Apellido as Nombre 
                FROM dbo.profesores 
                WHERE ID_Estatus = 1 -- Activos
                ORDER BY Nombre;
            ";
            var docentes = await _connection.QueryAsync<DocenteSimpleDto>(query);
            return Ok(docentes);
        }

        [HttpPut("grupos/{id}/asignar")]
        public async Task<IActionResult> AsignarProfesor(int id, [FromBody] AsignacionProfesorDto dto)
        {
            try
            {
                var query = "UPDATE dbo.grupos SET ID_Profesor = @IdProfesor WHERE ID_Grupo = @idGrupo";
                var result = await _connection.ExecuteAsync(query, new { IdProfesor = dto.IdProfesor, idGrupo = id });

                if (result > 0)
                {
                    return Ok(new { success = true, mensaje = "Asignación actualizada correctamente." });
                }

                // Si result es 0, puede ser porque el grupo no existe o porque el profesor asignado ya era el mismo.
                // Hacemos una verificación para asegurarnos de que el grupo existe antes de devolver un error.
                var checkQuery = "SELECT COUNT(1) FROM dbo.grupos WHERE ID_Grupo = @idGrupo";
                var groupCount = await _connection.ExecuteScalarAsync<int>(checkQuery, new { idGrupo = id });

                if (groupCount > 0)
                {
                    // El grupo existe, así que la operación fue exitosa aunque no hubo cambios en la fila.
                    // Esto es un éxito desde la perspectiva del usuario.
                    return Ok(new { success = true, mensaje = "Asignación guardada (sin cambios detectados)." });
                }

                // Si llegamos aquí, el grupo realmente no existe.
                return NotFound(new { success = false, mensaje = "Error: El grupo especificado no existe." });
            }
            catch (Exception ex)
            {
                // Capturamos cualquier error inesperado (ej. problemas de conexión, constraints de la BD)
                return StatusCode(500, new { success = false, mensaje = "Ocurrió un error inesperado en el servidor.", error = ex.Message });
            }
        }

        [HttpGet("alumnos/buscar")]
        public async Task<IActionResult> BuscarAlumnos([FromQuery] string termino)
        {
            if (string.IsNullOrWhiteSpace(termino))
            {
                return Ok(new List<AlumnoBusquedaDto>());
            }

            var searchTerm = $"%{termino}%";
            var query = @"
                SELECT 
                    a.ID_Alumno as id, 
                    CAST(a.ID_Alumno AS VARCHAR) as Control, 
                    a.Nombre + ' ' + a.Primer_Apellido + ' ' + ISNULL(a.Segundo_Apellido, '') as Nombre, 
                    c.Nombre_Carrera as Carrera 
                FROM dbo.alumnos a 
                JOIN dbo.carreras c ON a.ID_Carrera = c.ID_Carrera 
                WHERE a.Nombre LIKE @searchTerm 
                   OR a.Primer_Apellido LIKE @searchTerm 
                   OR a.Segundo_Apellido LIKE @searchTerm
                   OR CAST(a.ID_Alumno AS VARCHAR) LIKE @searchTerm 
                   OR c.Nombre_Carrera LIKE @searchTerm;
            ";

            var alumnos = await _connection.QueryAsync(query, new { searchTerm });
            return Ok(alumnos);
        }

        [HttpGet("alumnos/{id:int}")]
        public async Task<IActionResult> GetAlumnoDetalle(int id)
        {
            var alumnoQuery = @"
                SELECT 
                    a.ID_Alumno as Id, 
                    CAST(a.ID_Alumno AS VARCHAR) as Control, 
                    a.Nombre + ' ' + a.Primer_Apellido + ' ' + ISNULL(a.Segundo_Apellido, '') as Nombre, 
                    c.Nombre_Carrera as Carrera, 
                    -- La columna 'Semestre' no existe en la tabla 'alumnos'.
                    -- Se calcula dinámicamente restando el periodo de ingreso del periodo actual.
                    (SELECT MAX(ID_Periodo) FROM dbo.periodos) - a.ID_Periodo_Ingreso + 1 AS Semestre
                FROM dbo.alumnos a 
                JOIN dbo.carreras c ON a.ID_Carrera = c.ID_Carrera 
                WHERE a.ID_Alumno = @id;
            ";
            var alumno = await _connection.QuerySingleOrDefaultAsync<AlumnoDetalleDto>(alumnoQuery, new { id });

            if (alumno == null)
            {
                return NotFound(new { success = false, mensaje = "Alumno no encontrado." });
            }

            var materiasQuery = @"
                SELECT 
                    i.ID_Grupo as IdGrupo, 
                    m.Nombre_Materia as Materia, 
                    ISNULL(p.Nombre + ' ' + p.Primer_Apellido, 'Sin maestro') as Profesor 
                FROM dbo.grupos_alumnos i -- Se corrige el nombre de la tabla de 'inscripciones' a 'grupos_alumnos'
                JOIN dbo.grupos g ON i.ID_Grupo = g.ID_Grupo 
                JOIN dbo.materias m ON g.ID_Materia = m.ID_Materia 
                LEFT JOIN dbo.profesores p ON g.ID_Profesor = p.ID_Profesor 
                WHERE i.ID_Alumno = @id;
            ";
            var materias = await _connection.QueryAsync<MateriaInscritaDto>(materiasQuery, new { id });

            // Se crea un objeto anónimo para asegurar que la respuesta JSON tenga la forma que el frontend espera,
            // incluyendo la propiedad 'id', que parece faltar en el objeto 'alumno' después de la consulta a la base de datos.
            var responseObj = new
            {
                id = id,
                alumno.Control,
                alumno.Nombre,
                alumno.Carrera,
                alumno.Semestre,
                Materias = materias.ToList()
            };

            return Ok(responseObj);
        }

        [HttpGet("oferta-academica")]
        public async Task<IActionResult> GetOfertaAcademica()
        {
            var query = @"
                SELECT 
                    g.ID_Grupo as IdGrupo, 
                    m.Nombre_Materia as Materia, 
                    ISNULL(p.Nombre + ' ' + p.Primer_Apellido, 'Sin maestro') as Profesor,
                    CASE WHEN g.ID_Profesor IS NULL THEN 0 ELSE 1 END as TieneProfesor
                FROM dbo.grupos g 
                JOIN dbo.materias m ON g.ID_Materia = m.ID_Materia 
                LEFT JOIN dbo.profesores p ON g.ID_Profesor = p.ID_Profesor 
                ORDER BY m.Nombre_Materia;
            ";
            var oferta = await _connection.QueryAsync<OfertaAcademicaDto>(query);
            return Ok(oferta);
        }

        [HttpPost("inscripciones")]
        public async Task<IActionResult> InscribirMateria([FromBody] InscripcionDto inscripcion)
        {
            try
            {
                var query = "INSERT INTO dbo.grupos_alumnos (ID_Alumno, ID_Grupo) VALUES (@IdAlumno, @IdGrupo);";
                await _connection.ExecuteAsync(query, new { inscripcion.IdAlumno, inscripcion.IdGrupo });
                return Ok(new { success = true, mensaje = "Alumno inscrito correctamente." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, mensaje = "No se pudo inscribir al alumno. Es posible que ya esté inscrito en este grupo.", error = ex.Message });
            }
        }

        [HttpDelete("inscripciones/{idAlumno:int}/{idGrupo:int}")]
        public async Task<IActionResult> DarDeBajaMateria(int idAlumno, int idGrupo)
        {
            var query = "DELETE FROM dbo.grupos_alumnos WHERE ID_Alumno = @idAlumno AND ID_Grupo = @idGrupo;";
            var result = await _connection.ExecuteAsync(query, new { idAlumno, idGrupo });
            if (result > 0)
            {
                return Ok(new { success = true, mensaje = "Materia dada de baja correctamente." });
            }
            return NotFound(new { success = false, mensaje = "No se encontró la inscripción para dar de baja." });
        }
    }
}