using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface IHorarioRepository
    {
        Task<IEnumerable<HorarioDto>> GetHorarioAlumnoAsync(int idAlumno, int idPeriodo);
    }

    public class HorarioRepository : IHorarioRepository
    {
        private readonly IDbConnection _connection;

        public HorarioRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<IEnumerable<HorarioDto>> GetHorarioAlumnoAsync(int idAlumno, int idPeriodo)
        {
            string query = @"
                SELECT 
                    h.Dia_Semana AS Dia,
                    bt.Hora_Inicio AS HoraInicio,
                    bt.Hora_Final AS HoraFin,
                    m.Nombre_Materia AS Materia,
                    CAST(s.ID_Salon AS VARCHAR) AS Aula
                FROM grupos_alumnos ga
                INNER JOIN grupos g ON ga.ID_Grupo = g.ID_Grupo
                INNER JOIN materias m ON g.ID_Materia = m.ID_Materia
                INNER JOIN horarios h ON g.ID_Grupo = h.ID_Grupo
                INNER JOIN bloques_tiempo bt ON h.ID_Bloque_Tiempo = bt.ID_Bloque_Tiempo
                INNER JOIN salones s ON h.ID_Salon = s.ID_Salon
                WHERE ga.ID_Alumno = @IdAlumno AND g.ID_Periodo = @IdPeriodo
                ORDER BY bt.Hora_Inicio, h.Dia_Semana";

            return await _connection.QueryAsync<HorarioDto>(query, new { IdAlumno = idAlumno, IdPeriodo = idPeriodo });
        }
    }
}