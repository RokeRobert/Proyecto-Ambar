using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface ICalificacionRepository
    {
        Task<IEnumerable<CalificacionDto>> GetCalificacionesByAlumnoAsync(int idAlumno);
    }

    public class CalificacionRepository : ICalificacionRepository
    {
        private readonly IDbConnection _connection;

        public CalificacionRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<IEnumerable<CalificacionDto>> GetCalificacionesByAlumnoAsync(int idAlumno)
        {
            string query = @"
                SELECT 
                    m.Nombre_Materia AS Nombre,
                    CAST(m.ID_Materia AS VARCHAR) AS Clave,
                    ISNULL(p.Nombre + ' ' + p.Primer_Apellido, 'Sin Asignar') AS Docente,
                    CAST(g.ID_Grupo AS VARCHAR) AS Grupo,
                    ISNULL(m.Total_Creditos, 0) AS Creditos,
                    g.ID_Periodo AS IdPeriodo,
                    m.Unidad,
                    ga.UNIDAD1 AS U1, ga.UNIDAD2 AS U2, ga.UNIDAD3 AS U3,
                    ga.UNIDAD4 AS U4, ga.UNIDAD5 AS U5, ga.UNIDAD6 AS U6
                FROM grupos_alumnos ga
                INNER JOIN grupos g ON ga.ID_Grupo = g.ID_Grupo
                INNER JOIN materias m ON g.ID_Materia = m.ID_Materia
                LEFT JOIN profesores p ON g.ID_Profesor = p.ID_Profesor
                WHERE ga.ID_Alumno = @IdAlumno";

            return await _connection.QueryAsync<CalificacionDto>(query, new { IdAlumno = idAlumno });
        }
    }
}