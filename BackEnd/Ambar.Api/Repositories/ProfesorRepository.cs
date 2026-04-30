using System.Data;
using Dapper;
using Ambar.Api.Models;
using System.Threading.Tasks;

namespace Ambar.Api.Repositories
{
    public interface IProfesorRepository
    {
        Task<Profesor?> LoginAsync(int idProfesor, string contrasena);
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
            string query = "SELECT * FROM profesores WHERE ID_Profesor = @IdProfesor AND Contrasena = @Contrasena";
            return await _connection.QueryFirstOrDefaultAsync<Profesor>(query, new { IdProfesor = idProfesor, Contrasena = contrasena });
        }
    }
}