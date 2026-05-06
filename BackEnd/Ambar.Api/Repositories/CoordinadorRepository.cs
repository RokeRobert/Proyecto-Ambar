using Ambar.Api.DTOs;
using Dapper;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Ambar.Api.Repositories

{
    public class CoordinadorRepository : ICoordinadorRepository
    {
        private readonly IDbConnection _connection;

        public CoordinadorRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<IEnumerable<GrupoAsignacionDto>> GetGruposConProfesorAsync()
        {
            string query = @"
                SELECT 
                    g.ID_Grupo AS Id,
                    CAST(g.ID_Grupo AS VARCHAR) AS Grupo,
                    m.Nombre_Materia AS Materia,
                    c.Nombre_Carrera AS Carrera,
                    p.ID_Profesor AS IdProfesor,
                    p.Nombre + ' ' + p.Primer_Apellido AS Profesor
                FROM grupos g
                INNER JOIN materias m ON g.ID_Materia = m.ID_Materia
                INNER JOIN carreras c ON m.ID_Carrera = c.ID_Carrera
                LEFT JOIN profesores p ON g.ID_Profesor = p.ID_Profesor
                WHERE g.ID_Periodo = (SELECT MAX(ID_Periodo) FROM periodos);";
            return await _connection.QueryAsync<GrupoAsignacionDto>(query);
        }

        public async Task<IEnumerable<DocenteSimpleDto>> GetDocentesAsync()
        {
            // Asumimos que el rol de docente es 3. Ajustar si es diferente.
            string query = @"
                SELECT 
                    ID_Profesor AS Id,
                    Nombre + ' ' + Primer_Apellido AS Nombre
                FROM profesores
                WHERE ID_Rol = 3
                ORDER BY Nombre;";
            return await _connection.QueryAsync<DocenteSimpleDto>(query);
        }

        public async Task<bool> AsignarProfesorAsync(int idGrupo, int? idProfesor)
        {
            string query = "UPDATE grupos SET ID_Profesor = @idProfesor WHERE ID_Grupo = @idGrupo;";
            var result = await _connection.ExecuteAsync(query, new { idGrupo, idProfesor });
            return result > 0;
        }

        public async Task<IEnumerable<AlumnoBusquedaDto>> BuscarAlumnosAsync(string termino)
        {
            string query = @"
                SELECT 
                    a.ID_Alumno AS Control,
                    a.Nombre + ' ' + a.Primer_Apellido + ' ' + ISNULL(a.Segundo_Apellido, '') AS Nombre,
                    c.Nombre_Carrera AS Carrera,
                    CAST(a.Semestre AS VARCHAR) + '°' AS Semestre
                FROM alumnos a
                INNER JOIN carreras c ON a.ID_Carrera = c.ID_Carrera
                WHERE a.Nombre LIKE @wildcardTermino 
                   OR a.Primer_Apellido LIKE @wildcardTermino 
                   OR a.ID_Alumno LIKE @wildcardTermino 
                   OR c.Nombre_Carrera LIKE @wildcardTermino;";
            return await _connection.QueryAsync<AlumnoBusquedaDto>(query, new { wildcardTermino = $"%{termino}%" });
        }

        public async Task<AlumnoDetalleDto> GetAlumnoDetallesAsync(string idAlumno)
        {
            string query = @"
                SELECT 
                    a.ID_Alumno AS Control,
                    a.Nombre + ' ' + a.Primer_Apellido + ' ' + ISNULL(a.Segundo_Apellido, '') AS Nombre,
                    c.Nombre_Carrera AS Carrera,
                    CAST(a.Semestre AS VARCHAR) + '°' AS Semestre
                FROM alumnos a
                INNER JOIN carreras c ON a.ID_Carrera = c.ID_Carrera
                WHERE a.ID_Alumno = @idAlumno;

                SELECT 
                    g.ID_Grupo as IdGrupo, 
                    m.Nombre_Materia as Materia,
                    ISNULL(p.Nombre + ' ' + p.Primer_Apellido, 'Sin Asignar') AS Profesor
                FROM grupos_alumnos ga
                JOIN grupos g ON ga.ID_Grupo = g.ID_Grupo
                JOIN materias m ON g.ID_Materia = m.ID_Materia
                LEFT JOIN profesores p ON g.ID_Profesor = p.ID_Profesor
                WHERE ga.ID_Alumno = @idAlumno AND g.ID_Periodo = (SELECT MAX(ID_Periodo) FROM periodos);";

            using (var multi = await _connection.QueryMultipleAsync(query, new { idAlumno }))
            {
                var alumno = await multi.ReadSingleOrDefaultAsync<AlumnoDetalleDto>();
                if (alumno != null)
                {
                    alumno.Materias = (await multi.ReadAsync<MateriaInscritaDto>()).ToList();
                }
                return alumno;
            }
        }

        public async Task<IEnumerable<OfertaAcademicaDto>> GetOfertaAcademicaAsync()
        {
            string query = @"
                SELECT g.ID_Grupo AS IdGrupo, m.Nombre_Materia AS Materia, 
                       ISNULL(p.Nombre + ' ' + p.Primer_Apellido, 'Sin Asignar') AS Profesor,
                       CASE WHEN g.ID_Profesor IS NULL THEN 0 ELSE 1 END AS TieneProfesor
                FROM grupos g
                JOIN materias m ON g.ID_Materia = m.ID_Materia
                LEFT JOIN profesores p ON g.ID_Profesor = p.ID_Profesor
                WHERE g.ID_Periodo = (SELECT MAX(ID_Periodo) FROM periodos);";
            return await _connection.QueryAsync<OfertaAcademicaDto>(query);
        }

        public async Task<bool> InscribirAlumnoAsync(string idAlumno, int idGrupo)
        {
            string query = "INSERT INTO grupos_alumnos (ID_Alumno, ID_Grupo) VALUES (@idAlumno, @idGrupo);";
            var result = await _connection.ExecuteAsync(query, new { idAlumno, idGrupo });
            return result > 0;
        }

        public async Task<bool> DarBajaAlumnoAsync(string idAlumno, int idGrupo)
        {
            string query = "DELETE FROM grupos_alumnos WHERE ID_Alumno = @idAlumno AND ID_Grupo = @idGrupo;";
            var result = await _connection.ExecuteAsync(query, new { idAlumno, idGrupo });
            return result > 0;
        }
    }
}