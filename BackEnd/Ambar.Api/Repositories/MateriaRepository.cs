using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface IMateriaRepository
    {
        Task<IEnumerable<MateriaDto>> GetMateriasAsync(int? idCarrera = null);
        Task<bool> CrearMateriaAsync(CrearMateriaDto materia);
        Task<bool> ActualizarMateriaAsync(int id, CrearMateriaDto materia);
        Task<bool> EliminarMateriaAsync(int id);
    }

    public class MateriaRepository : IMateriaRepository
    {
        private readonly IDbConnection _connection;
        public MateriaRepository(IDbConnection connection) => _connection = connection;

        public async Task<IEnumerable<MateriaDto>> GetMateriasAsync(int? idCarrera = null)
        {
            string query = @"
                SELECT 
                    m.ID_Materia AS IdMateria,
                    m.Nombre_Materia AS Nombre,
                    ISNULL(m.Total_Creditos, 0) AS Creditos,
                    ISNULL(m.Semestre, 1) AS Semestre,
                    m.ID_Carrera AS IdCarrera,
                    ISNULL(c.Nombre_Carrera, 'Tronco Común') AS Carrera,
                    m.ID_Especialidad AS IdEspecialidad,
                    ISNULL(e.Nombre_Especialidad, 'Sin Especialidad') AS NombreEspecialidad,
                    k.Seriada AS IdMateriaRequisito,
                    ISNULL(req.Nombre_Materia, '') AS NombreMateriaRequisito,
                    m.Unidad
                FROM materias m
                LEFT JOIN carreras c ON m.ID_Carrera = c.ID_Carrera
                LEFT JOIN especialidades e ON m.ID_Especialidad = e.ID_Especialidad
                LEFT JOIN kardex k ON m.ID_Materia = k.ID_Materia 
                LEFT JOIN materias req ON k.Seriada = req.ID_Materia
                WHERE (@IdCarrera IS NULL OR m.ID_Carrera = @IdCarrera OR m.ID_Carrera IS NULL)
                ORDER BY m.Semestre ASC, m.Nombre_Materia ASC";
            
            return await _connection.QueryAsync<MateriaDto>(query, new { IdCarrera = idCarrera });
        }

        public async Task<bool> CrearMateriaAsync(CrearMateriaDto m)
        {
            string query = @"
                DECLARE @NuevaMateria INT;
                INSERT INTO materias (Nombre_Materia, Total_Creditos, Semestre, ID_Carrera, ID_Especialidad, Unidad) VALUES (@Nombre, @Creditos, @Semestre, @IdCarrera, @IdEspecialidad, @Unidad);
                SET @NuevaMateria = SCOPE_IDENTITY();
                
                IF @IdMateriaRequisito IS NOT NULL
                BEGIN
                    INSERT INTO kardex (ID_Materia, ID_Carrera, Seriada) VALUES (@NuevaMateria, @IdCarrera, @IdMateriaRequisito);
                END";
            return await _connection.ExecuteAsync(query, m) > 0;
        }

        public async Task<bool> ActualizarMateriaAsync(int id, CrearMateriaDto m)
        {
            string query = @"
                UPDATE materias SET Nombre_Materia = @Nombre, Total_Creditos = @Creditos, Semestre = @Semestre, ID_Carrera = @IdCarrera, ID_Especialidad = @IdEspecialidad, Unidad = @Unidad WHERE ID_Materia = @Id;
                DELETE FROM kardex WHERE ID_Materia = @Id;
                
                IF @IdMateriaRequisito IS NOT NULL
                BEGIN
                    INSERT INTO kardex (ID_Materia, ID_Carrera, Seriada) VALUES (@Id, @IdCarrera, @IdMateriaRequisito);
                END";
            var param = new DynamicParameters(m); param.Add("Id", id);
            return await _connection.ExecuteAsync(query, param) > 0;
        }

        public async Task<bool> EliminarMateriaAsync(int id)
        {
            string query = @"
                DELETE FROM kardex WHERE ID_Materia = @Id OR Seriada = @Id;
                DELETE FROM materias WHERE ID_Materia = @Id;";
            return await _connection.ExecuteAsync(query, new { Id = id }) > 0;
        }
    }
}