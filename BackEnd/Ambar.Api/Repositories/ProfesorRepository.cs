using System.Data;
using Dapper;
using Ambar.Api.DTOs;
using Ambar.Api.Models;
using System.Threading.Tasks;

namespace Ambar.Api.Repositories
{
    public interface IProfesorRepository
    {
        Task<Profesor?> LoginAsync(int idProfesor, string contrasena);
        Task<Profesor?> GetByIdAsync(int idProfesor);
        Task<IEnumerable<HorarioItemDto>> GetHorarioAsync(int idProfesor);
        Task<IEnumerable<GrupoDocenteDto>> GetGruposByProfesorAsync(int idProfesor);
        Task<IEnumerable<AlumnoCalificacionDto>> GetAlumnosByGrupoAsync(int idGrupo);
        Task<bool> GuardarCalificacionesAsync(int idGrupo, IEnumerable<CalificacionUpdateDto> calificaciones);
        Task<bool> ActualizarFotoAsync(int idProfesor, string fotoUrl);
        Task<bool> CambiarContrasenaAsync(int idProfesor, string nuevaContrasena);
    }

    public class ProfesorRepository : IProfesorRepository
    {
        private readonly IDbConnection _connection;

        public ProfesorRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<Profesor?> LoginAsync(int idProfesor, string contrasena)
        {
            // Se reemplaza SELECT * por una consulta explícita para mayor claridad y para mapear
            // la columna 'Direccion_Foto' a la propiedad 'FotoUrl' del modelo.
            string query = @"
                SELECT 
                    ID_Profesor,
                    Nombre,
                    Primer_Apellido,
                    Segundo_Apellido,
                    Contrasena,
                    ID_Rol,
                    ID_Departamento,
                    Direccion_Foto AS FotoUrl 
                FROM profesores 
                WHERE ID_Profesor = @IdProfesor AND Contrasena = @Contrasena";
            return await _connection.QueryFirstOrDefaultAsync<Profesor>(query, new { IdProfesor = idProfesor, Contrasena = contrasena });
        }

        public async Task<Profesor?> GetByIdAsync(int idProfesor)
        {
            // Se corrige la consulta para eliminar la selección duplicada de 'Direccion_Foto',
            // que confundía a Dapper e impedía que se mapearan correctamente todas las propiedades (como Contrasena).
            string query = @"
                SELECT
                    p.ID_Profesor,
                    p.Nombre,
                    p.Primer_Apellido,
                    p.Segundo_Apellido,
                    p.Contrasena,
                    p.ID_Rol,
                    p.ID_Departamento,
                    d.Nombre_Departamento AS Departamento,
                    p.Direccion_Foto AS FotoUrl
                FROM profesores p
                LEFT JOIN departamentos_academicos d ON p.ID_Departamento = d.ID_Departamento
                WHERE p.ID_Profesor = @IdProfesor";
            return await _connection.QueryFirstOrDefaultAsync<Profesor>(query, new { IdProfesor = idProfesor });
        }

        public async Task<IEnumerable<HorarioItemDto>> GetHorarioAsync(int idProfesor)
        {
            // Asumimos que hay una tabla 'periodos' con una columna 'Activo' para identificar el periodo actual.
            // Se modifica la consulta para usar un subquery en lugar de DECLARE, haciéndola más estándar y robusta.
            string query = @"
                SELECT
                    m.Nombre_Materia AS NombreMateria, 
                    g.ID_Grupo AS IdGrupo,
                    CAST(g.ID_Grupo AS VARCHAR(10)) AS Grupo,
                    ISNULL(CAST(s.ID_Salon AS VARCHAR), 'N/A') AS Aula,                    
                    ISNULL(
                        CASE h.Dia_Semana
                            WHEN 1 THEN 'Lunes'
                            WHEN 2 THEN 'Martes'
                            WHEN 3 THEN 'Miércoles'
                            WHEN 4 THEN 'Jueves'
                            WHEN 5 THEN 'Viernes'
                            WHEN 6 THEN 'Sábado'
                        END, 
                    'Sin asignar') AS DiaSemana,
                    ISNULL(bt.Hora_Inicio, '00:00:00') AS HoraInicio,                    
                    ISNULL(bt.Hora_Final, '00:00:00') AS HoraFin
                FROM grupos g
                INNER JOIN materias m ON g.ID_Materia = m.ID_Materia
                LEFT JOIN horarios h ON g.ID_Grupo = h.ID_Grupo
                LEFT JOIN bloques_tiempo bt ON h.ID_Bloque_Tiempo = bt.ID_Bloque_Tiempo
                LEFT JOIN salones s ON h.ID_Salon = s.ID_Salon
                WHERE g.ID_Profesor = @IdProfesor 
                  AND g.ID_Periodo = ( 
                      -- Se busca el ID de periodo más alto, asumiendo que es el periodo activo.
                      SELECT MAX(ID_Periodo) 
                      FROM periodos 
                  );";
            return await _connection.QueryAsync<HorarioItemDto>(query, new { IdProfesor = idProfesor });
        }

        public async Task<IEnumerable<GrupoDocenteDto>> GetGruposByProfesorAsync(int idProfesor)
        {
            string query = @"
                SELECT 
                    g.ID_Grupo AS IdGrupo,
                    m.Nombre_Materia + ' (' + CAST(g.ID_Grupo AS VARCHAR) + ')' AS NombreGrupo
                FROM grupos g
                INNER JOIN materias m ON g.ID_Materia = m.ID_Materia
                WHERE g.ID_Profesor = @idProfesor 
                  AND g.ID_Periodo = (SELECT MAX(ID_Periodo) FROM periodos);";
            return await _connection.QueryAsync<GrupoDocenteDto>(query, new { idProfesor });
        }

        public async Task<IEnumerable<AlumnoCalificacionDto>> GetAlumnosByGrupoAsync(int idGrupo)
        {
            // La tabla correcta es 'grupos_alumnos', que vincula alumnos a grupos y contiene sus calificaciones.
            string query = @"
                SELECT 
                    a.ID_Alumno AS IdAlumno,
                    a.Nombre + ' ' + a.Primer_Apellido + ' ' + ISNULL(a.Segundo_Apellido, '') AS Nombre,
                    ga.UNIDAD1 AS P1,
                    ga.UNIDAD2 AS P2,
                    ga.UNIDAD3 AS P3,
                    ga.UNIDAD4 AS P4,
                    ga.UNIDAD5 AS P5,
                    ga.UNIDAD6 AS P6
                FROM grupos_alumnos ga
                INNER JOIN alumnos a ON ga.ID_Alumno = a.ID_Alumno
                WHERE ga.ID_Grupo = @idGrupo;";
            return await _connection.QueryAsync<AlumnoCalificacionDto>(query, new { idGrupo });
        }

        public async Task<bool> GuardarCalificacionesAsync(int idGrupo, IEnumerable<CalificacionUpdateDto> calificaciones)
        {
            // Se utiliza una transacción para garantizar que todas las actualizaciones se completen o ninguna.
            _connection.Open();
            using var transaction = _connection.BeginTransaction();
            try
            {
                // La tabla a actualizar es 'grupos_alumnos'.
                string query = @"
                    UPDATE grupos_alumnos
                    SET UNIDAD1 = @P1,
                        UNIDAD2 = @P2,
                        UNIDAD3 = @P3,
                        UNIDAD4 = @P4,
                        UNIDAD5 = @P5,
                        UNIDAD6 = @P6
                    WHERE ID_Alumno = @IdAlumno AND ID_Grupo = @IdGrupo;";

                foreach (var calif in calificaciones)
                {
                    await _connection.ExecuteAsync(query, new
                    {
                        calif.P1, calif.P2, calif.P3, calif.P4, calif.P5, calif.P6,
                        calif.IdAlumno, IdGrupo = idGrupo
                    }, transaction);
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
                // Asegurarse de cerrar la conexión.
                if (_connection.State == ConnectionState.Open)
                {
                    _connection.Close();
                }
            }
        }

        public async Task<bool> ActualizarFotoAsync(int idProfesor, string fotoUrl)
        {
            string query = "UPDATE profesores SET Direccion_Foto = @FotoUrl WHERE ID_Profesor = @IdProfesor";
            var result = await _connection.ExecuteAsync(query, new { FotoUrl = fotoUrl, IdProfesor = idProfesor });
            return result > 0;
        }

        public async Task<bool> CambiarContrasenaAsync(int idProfesor, string nuevaContrasena)
        {
            string query = "UPDATE profesores SET Contrasena = @NuevaContrasena WHERE ID_Profesor = @IdProfesor";
            var result = await _connection.ExecuteAsync(query, new { NuevaContrasena = nuevaContrasena, IdProfesor = idProfesor });
            return result > 0;
        }
    }
}