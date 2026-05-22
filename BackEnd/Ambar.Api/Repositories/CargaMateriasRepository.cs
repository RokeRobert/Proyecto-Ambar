using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface ICargaMateriasRepository
    {
        Task<IEnumerable<GrupoDisponibleDto>> GetMateriasDisponiblesAsync(int idAlumno, int idPeriodo);
        Task<bool> GuardarCargaAsync(int idAlumno, int idPeriodo, List<int> idGrupos);
    }

    public class CargaMateriasRepository : ICargaMateriasRepository
    {
        private readonly IDbConnection _connection;

        public CargaMateriasRepository(IDbConnection connection) => _connection = connection;

        public async Task<bool> GuardarCargaAsync(int idAlumno, int idPeriodo, List<int> idGrupos)
        {
            _connection.Open();
            using var transaction = _connection.BeginTransaction();
            try
            {
                // 1. Limpiamos la carga ACTUAL del alumno para evitar duplicados al hacer pruebas
                string deleteQuery = @"
                    DELETE ga 
                    FROM grupos_alumnos ga
                    INNER JOIN grupos g ON ga.ID_Grupo = g.ID_Grupo
                    WHERE ga.ID_Alumno = @IdAlumno AND g.ID_Periodo = @IdPeriodo";
                
                await _connection.ExecuteAsync(deleteQuery, new { IdAlumno = idAlumno, IdPeriodo = idPeriodo }, transaction);

                // 2. Insertamos la nueva selección de grupos
                if (idGrupos != null && idGrupos.Any())
                {
                    string insertQuery = "INSERT INTO grupos_alumnos (ID_Grupo, ID_Alumno) VALUES (@IdGrupo, @IdAlumno)";
                    var parametros = idGrupos.Select(idGrupo => new { IdGrupo = idGrupo, IdAlumno = idAlumno });
                    await _connection.ExecuteAsync(insertQuery, parametros, transaction);
                }

                transaction.Commit();
                return true;
            }
            catch
            {
                transaction.Rollback();
                return false;
            }
            finally
            {
                _connection.Close();
            }
        }

        public async Task<IEnumerable<GrupoDisponibleDto>> GetMateriasDisponiblesAsync(int idAlumno, int idPeriodo)
        {
            string query = @"
                DECLARE @IdCarrera INT, @IdEspecialidad INT;
                SELECT @IdCarrera = ID_Carrera, @IdEspecialidad = ID_Especialidad FROM alumnos WHERE ID_Alumno = @IdAlumno;

                -- 1. Calculamos las materias que el alumno ya aprobó (Promedio >= 70)
                WITH Promedios AS (
                    SELECT 
                        g.ID_Materia,
                        g.ID_Periodo,
                        (ISNULL(ga.UNIDAD1,0) + ISNULL(ga.UNIDAD2,0) + ISNULL(ga.UNIDAD3,0) + 
                         ISNULL(ga.UNIDAD4,0) + ISNULL(ga.UNIDAD5,0) + ISNULL(ga.UNIDAD6,0)) /
                        CAST(NULLIF(
                            (CASE WHEN ga.UNIDAD1 IS NOT NULL THEN 1 ELSE 0 END) +
                            (CASE WHEN ga.UNIDAD2 IS NOT NULL THEN 1 ELSE 0 END) +
                            (CASE WHEN ga.UNIDAD3 IS NOT NULL THEN 1 ELSE 0 END) +
                            (CASE WHEN ga.UNIDAD4 IS NOT NULL THEN 1 ELSE 0 END) +
                            (CASE WHEN ga.UNIDAD5 IS NOT NULL THEN 1 ELSE 0 END) +
                            (CASE WHEN ga.UNIDAD6 IS NOT NULL THEN 1 ELSE 0 END)
                        , 0) AS FLOAT) AS PromedioFinal
                    FROM grupos_alumnos ga
                    INNER JOIN grupos g ON ga.ID_Grupo = g.ID_Grupo
                    WHERE ga.ID_Alumno = @IdAlumno
                ),
                MateriasAprobadas AS (
                    -- Solo consideramos aprobadas las materias que se hayan cursado en periodos pasados (no el actual)
                    SELECT ID_Materia FROM Promedios WHERE PromedioFinal >= 70 AND ID_Periodo < @IdPeriodo
                )

                SELECT 
                    g.ID_Grupo AS IdGrupo,
                    m.ID_Materia AS IdMateria,
                    m.Nombre_Materia AS Nombre,
                    CAST(m.ID_Materia AS VARCHAR) AS Clave,
                    ISNULL(p.Nombre + ' ' + p.Primer_Apellido, 'Sin Asignar') AS Docente,
                    ISNULL(m.Total_Creditos, 0) AS Creditos,
                    (
                        SELECT STRING_AGG(CAST(h.Dia_Semana AS VARCHAR) + ':' + CAST(DATEPART(HOUR, bt.Hora_Inicio) AS VARCHAR), ',')
                        FROM horarios h
                        INNER JOIN bloques_tiempo bt ON h.ID_Bloque_Tiempo = bt.ID_Bloque_Tiempo
                        WHERE h.ID_Grupo = g.ID_Grupo
                    ) AS HorarioRaw
                FROM grupos g
                INNER JOIN materias m ON g.ID_Materia = m.ID_Materia
                LEFT JOIN profesores p ON g.ID_Profesor = p.ID_Profesor
                LEFT JOIN kardex k ON m.ID_Materia = k.ID_Materia AND (k.ID_Carrera = @IdCarrera OR k.ID_Carrera IS NULL)
                WHERE g.ID_Periodo = @IdPeriodo 
                  AND (m.ID_Carrera = @IdCarrera OR m.ID_Carrera IS NULL OR g.ID_Carrera = @IdCarrera)
                  -- REGLA 1: No mostrar materias que ya aprobó históricamente
                  AND m.ID_Materia NOT IN (SELECT ID_Materia FROM MateriasAprobadas)
                  -- REGLA 2: Si tiene seriación (candado), el requisito debe estar en la lista de aprobadas
                  AND (k.Seriada IS NULL OR k.Seriada IN (SELECT ID_Materia FROM MateriasAprobadas))
                  -- REGLA 3: Mostrar solo materias de Tronco Común o que coincidan con la Especialidad del Alumno
                  AND (m.ID_Especialidad IS NULL OR m.ID_Especialidad = @IdEspecialidad)";
                
            return await _connection.QueryAsync<GrupoDisponibleDto>(query, new { IdAlumno = idAlumno, IdPeriodo = idPeriodo });
        }
    }
}