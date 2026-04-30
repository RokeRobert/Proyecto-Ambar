using System.Data;
using Dapper;
using Ambar.Api.Models;
using System.Threading.Tasks;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface IAlumnoRepository
    {
        Task<AlumnoPerfilDto?> LoginAsync(int idAlumno, string contrasena);
    }

    public class AlumnoRepository : IAlumnoRepository
    {
        private readonly IDbConnection _connection;

        public AlumnoRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<AlumnoPerfilDto?> LoginAsync(int idAlumno, string contrasena)
        {
            string query = @"
                SELECT a.*, 
                       c.Nombre_Carrera, 
                       e.Nombre_Especialidad, 
                       s.Nombre_Estatus,
                       (SELECT MAX(ID_Periodo) FROM periodos) AS Periodo_Actual
                FROM alumnos a
                LEFT JOIN carreras c ON a.ID_Carrera = c.ID_Carrera
                LEFT JOIN especialidades e ON a.ID_Especialidad = e.ID_Especialidad
                LEFT JOIN estatus_alumnos s ON a.ID_Estatus = s.ID_Estatus
                WHERE a.ID_Alumno = @IdAlumno AND a.Contrasena = @Contrasena";
            return await _connection.QueryFirstOrDefaultAsync<AlumnoPerfilDto>(query, new { IdAlumno = idAlumno, Contrasena = contrasena });
        }
    }
}