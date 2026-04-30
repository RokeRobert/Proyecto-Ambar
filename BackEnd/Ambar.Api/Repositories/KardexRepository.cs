using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface IKardexRepository
    {
        Task<IEnumerable<KardexMateriaDto>> GetKardexAlumnoAsync(int idAlumno);
    }

    public class KardexRepository : IKardexRepository
    {
        private readonly IDbConnection _connection;

        public KardexRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<IEnumerable<KardexMateriaDto>> GetKardexAlumnoAsync(int idAlumno)
        {
            string query = @"
                DECLARE @IdCarrera INT, @PeriodoActual INT;
                SELECT @IdCarrera = ID_Carrera FROM alumnos WHERE ID_Alumno = @IdAlumno;
                SELECT @PeriodoActual = ISNULL(MAX(ID_Periodo), 0) FROM periodos;

                SELECT 
                    m.ID_Materia AS IdMateria, m.Nombre_Materia AS Nombre, CAST(m.ID_Materia AS VARCHAR) AS Clave,
                    ISNULL(m.Total_Creditos, 0) AS Creditos, ISNULL(m.Semestre, 1) AS Semestre,
                    k.Seriada AS Requiere, g.ID_Periodo AS IdPeriodo,
                    ga.UNIDAD1 AS U1, ga.UNIDAD2 AS U2, ga.UNIDAD3 AS U3, ga.UNIDAD4 AS U4, ga.UNIDAD5 AS U5, ga.UNIDAD6 AS U6,
                    @PeriodoActual AS PeriodoActual
                FROM materias m
                LEFT JOIN kardex k ON m.ID_Materia = k.ID_Materia AND k.ID_Carrera = @IdCarrera
                LEFT JOIN grupos g ON g.ID_Materia = m.ID_Materia AND g.ID_Grupo IN (SELECT ID_Grupo FROM grupos_alumnos WHERE ID_Alumno = @IdAlumno)
                LEFT JOIN grupos_alumnos ga ON ga.ID_Grupo = g.ID_Grupo AND ga.ID_Alumno = @IdAlumno
                WHERE m.ID_Carrera = @IdCarrera OR m.ID_Carrera IS NULL";
            return await _connection.QueryAsync<KardexMateriaDto>(query, new { IdAlumno = idAlumno });
        }
    }
}