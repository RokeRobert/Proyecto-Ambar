using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface ITicketRepository
    {
        Task<IEnumerable<TicketDto>> GetByAlumnoAsync(int idAlumno);
        Task<bool> CrearTicketAsync(int idAlumno, string tipoProblema, string observaciones, string evidenciaUrl);
    }

    public class TicketRepository : ITicketRepository
    {
        private readonly IDbConnection _connection;
        public TicketRepository(IDbConnection connection) => _connection = connection;

        public async Task<IEnumerable<TicketDto>> GetByAlumnoAsync(int idAlumno)
        {
            string query = @"
                SELECT 
                    t.ID_Ticket AS IdTicket,
                    ISNULL(t.Asunto, 'Sin especificar') AS TipoProblema,
                    t.Descripcion AS Observaciones,
                    t.Evidencia_Url AS EvidenciaUrl,
                    CASE 
                        WHEN et.ID_Estatus = 3 THEN 'Finalizado' 
                        ELSE 'Abierto' 
                    END AS Estado,
                    t.Fecha AS FechaCreacion
                FROM tickets t
                INNER JOIN estatus_tickets et ON t.ID_Estatus = et.ID_Estatus
                WHERE t.ID_Alumno = @IdAlumno
                ORDER BY t.Fecha DESC";
            return await _connection.QueryAsync<TicketDto>(query, new { IdAlumno = idAlumno });
        }

        public async Task<bool> CrearTicketAsync(int idAlumno, string tipoProblema, string observaciones, string evidenciaUrl)
        {
            string query = "INSERT INTO tickets (ID_Alumno, Asunto, Descripcion, ID_Estatus, Fecha, Evidencia_Url) VALUES (@IdAlumno, @TipoProblema, @Observaciones, 1, GETDATE(), @EvidenciaUrl)";
            return await _connection.ExecuteAsync(query, new { IdAlumno = idAlumno, TipoProblema = tipoProblema, Observaciones = observaciones, EvidenciaUrl = evidenciaUrl }) > 0;
        }
    }
}