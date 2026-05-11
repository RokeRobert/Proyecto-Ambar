using Microsoft.AspNetCore.Mvc;
using Ambar.Api.Repositories;
using Ambar.Api.DTOs;
using System.Data;
using Dapper;

namespace Ambar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CargaMateriasController : ControllerBase
    {
        private readonly ICargaMateriasRepository _repo;
        private readonly IDbConnection _connection;

        public CargaMateriasController(ICargaMateriasRepository repo, IDbConnection connection)
        {
            _repo = repo;
            _connection = connection;
        }

        [HttpGet("disponibles/alumno/{idAlumno}")]
        public async Task<IActionResult> GetDisponibles(int idAlumno, [FromQuery] int periodo)
        {
            // 1. Obtener la carrera y semestre del alumno
            string queryAlumno = @"
                SELECT 
                    ID_Carrera, 
                    ((SELECT MAX(ID_Periodo) FROM periodos) - ID_Periodo_Ingreso + 1) AS Semestre
                FROM alumnos WHERE ID_Alumno = @idAlumno";
            var info = await _connection.QueryFirstOrDefaultAsync(queryAlumno, new { idAlumno });

            if (info == null) 
                return Ok(new { abierto = false, mensaje = "Alumno no encontrado en el sistema." });

            // 2. Buscar si tiene un turno activo asignado en el Semáforo
            string querySemaforo = @"
                SELECT TOP 1 Fecha_Inicio, Fecha_Fin 
                FROM semaforo_inscripciones 
                WHERE Activo = 1 
                AND (ID_Carrera IS NULL OR ID_Carrera = @IdCarrera)
                AND (Semestre IS NULL OR Semestre = @Semestre)
                ORDER BY Fecha_Inicio ASC";
            
            var turno = await _connection.QueryFirstOrDefaultAsync(querySemaforo, new { IdCarrera = info.ID_Carrera, Semestre = info.Semestre });

            // 3. Validar los tiempos exactos del turno
            if (turno == null)
                return Ok(new { abierto = false, mensaje = "No hay un periodo de inscripción programado para tu carrera y semestre." });

            DateTime ahora = DateTime.Now;

            if (ahora < turno.Fecha_Inicio)
                return Ok(new { abierto = false, mensaje = $"Tu turno de inscripción comienza el {turno.Fecha_Inicio:dd/MM/yyyy} a las {turno.Fecha_Inicio:HH:mm} hrs." });

            if (ahora > turno.Fecha_Fin)
                return Ok(new { abierto = false, mensaje = "Tu turno de inscripción ya ha finalizado." });

            var materias = await _repo.GetMateriasDisponiblesAsync(idAlumno, periodo);
            return Ok(new { abierto = true, materias = materias });
        }

        [HttpPost("guardar")]
        public async Task<IActionResult> GuardarCarga([FromBody] GuardarCargaRequest request)
        {
            bool exito = await _repo.GuardarCargaAsync(request.IdAlumno, request.IdPeriodo, request.IdGrupos);

            if (exito) return Ok(new { success = true, mensaje = "Carga académica guardada correctamente." });
            else return StatusCode(500, new { success = false, mensaje = "Hubo un error al guardar la carga." });
        }
    }
}