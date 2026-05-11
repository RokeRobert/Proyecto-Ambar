using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;

namespace Ambar.Api.Controllers
{
    public class CrearSemaforoDto
    {
        public int? IdCarrera { get; set; }
        public int? Semestre { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Activo { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class SemaforoController : ControllerBase
    {
        private readonly IDbConnection _connection;
        public SemaforoController(IDbConnection connection) => _connection = connection;

        [HttpGet]
        public async Task<IActionResult> GetTurnos()
        {
            string query = @"
                SELECT 
                    s.ID_Semaforo as idSemaforo,
                    s.ID_Carrera as idCarrera,
                    c.Nombre_Carrera as nombreCarrera,
                    s.Semestre as semestre,
                    s.Fecha_Inicio as fechaInicio,
                    s.Fecha_Fin as fechaFin,
                    s.Activo as activo
                FROM semaforo_inscripciones s
                LEFT JOIN carreras c ON s.ID_Carrera = c.ID_Carrera
                ORDER BY s.Fecha_Inicio ASC";
            
            var turnos = await _connection.QueryAsync(query);
            return Ok(turnos);
        }

        [HttpPost]
        public async Task<IActionResult> CrearTurno([FromBody] CrearSemaforoDto dto)
        {
            string query = @"
                INSERT INTO semaforo_inscripciones (ID_Carrera, Semestre, Fecha_Inicio, Fecha_Fin, Activo) 
                VALUES (@IdCarrera, @Semestre, @FechaInicio, @FechaFin, @Activo)";
            
            await _connection.ExecuteAsync(query, dto);
            return Ok(new { success = true, mensaje = "Turno programado correctamente." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarTurno(int id)
        {
            string query = "DELETE FROM semaforo_inscripciones WHERE ID_Semaforo = @id";
            await _connection.ExecuteAsync(query, new { id });
            return Ok(new { success = true });
        }

        // RUTAS PARA EL ALUMNO (Home.html y CargaMaterias.js)
        [HttpGet("alumno/{idAlumno}")]
        public async Task<IActionResult> GetTurnoAlumno(int idAlumno)
        {
            // 1. Buscamos de qué carrera es el alumno y calculamos su semestre
            string queryAlumno = @"
                SELECT 
                    ID_Carrera, 
                    ((SELECT MAX(ID_Periodo) FROM periodos) - ID_Periodo_Ingreso + 1) AS Semestre
                FROM alumnos WHERE ID_Alumno = @idAlumno";
            var info = await _connection.QueryFirstOrDefaultAsync(queryAlumno, new { idAlumno });

            if (info == null) return Ok(new { tieneTurno = false });

            // 2. Buscamos si existe alguna regla en el semáforo que aplique para él
            string querySemaforo = @"
                SELECT TOP 1 Fecha_Inicio, Fecha_Fin 
                FROM semaforo_inscripciones 
                WHERE Activo = 1 
                AND (ID_Carrera IS NULL OR ID_Carrera = @IdCarrera)
                AND (Semestre IS NULL OR Semestre = @Semestre)
                ORDER BY Fecha_Inicio ASC";
            
            var turno = await _connection.QueryFirstOrDefaultAsync(querySemaforo, new { IdCarrera = info.ID_Carrera, Semestre = info.Semestre });

            if (turno != null) return Ok(new { tieneTurno = true, fechaInicio = turno.Fecha_Inicio, fechaFin = turno.Fecha_Fin });

            return Ok(new { tieneTurno = false });
        }
    }
}