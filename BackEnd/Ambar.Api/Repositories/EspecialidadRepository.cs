using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface IEspecialidadRepository
    {
        Task<IEnumerable<EspecialidadDto>> GetEspecialidadesAsync();
        Task<bool> CrearEspecialidadAsync(CrearEspecialidadDto dto);
    }

    public class EspecialidadRepository : IEspecialidadRepository
    {
        private readonly IDbConnection _connection;
        public EspecialidadRepository(IDbConnection connection) => _connection = connection;

        public async Task<IEnumerable<EspecialidadDto>> GetEspecialidadesAsync()
        {
            string query = @"
                SELECT 
                    e.ID_Especialidad AS IdEspecialidad,
                    e.Nombre_Especialidad AS Nombre,
                    e.ID_Carrera AS IdCarrera,
                    c.Nombre_Carrera AS NombreCarrera
                FROM especialidades e
                INNER JOIN carreras c ON e.ID_Carrera = c.ID_Carrera
                ORDER BY e.Nombre_Especialidad";
            return await _connection.QueryAsync<EspecialidadDto>(query);
        }

        public async Task<bool> CrearEspecialidadAsync(CrearEspecialidadDto dto)
        {
            string query = "INSERT INTO especialidades (Nombre_Especialidad, ID_Carrera) VALUES (@Nombre, @IdCarrera)";
            return await _connection.ExecuteAsync(query, dto) > 0;
        }
    }
}