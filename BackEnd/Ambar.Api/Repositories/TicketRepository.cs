using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface ITicketRepository
    {
        Task<IEnumerable<TicketDto>> GetByAlumnoAsync(int idAlumno);
        Task<bool> CrearTicketAsync(int idAlumno, string tipoProblema, string observaciones, string evidenciaUrl);
        Task<IEnumerable<TicketAdminDto>> GetTicketsAlumnosAsync();
        Task<IEnumerable<TicketAdminDto>> GetTicketsProfesoresAsync();
        Task<bool> ActualizarEstatusAdminAsync(ActualizarEstatusTicketDto dto);
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

        public async Task<IEnumerable<TicketAdminDto>> GetTicketsAlumnosAsync()
        {
            string query = @"
                SELECT 
                    t.ID_Ticket AS IdTicket,
                    CAST(t.ID_Alumno AS VARCHAR(20)) AS Remitente,
                    ISNULL(a.Nombre, 'Alumno') + ' ' + ISNULL(a.Primer_Apellido, 'Desconocido') AS NombreRemitente,
                    ISNULL(t.Asunto, 'Sin Asunto') AS Asunto,
                    t.Descripcion,
                    t.Fecha,
                    t.ID_Estatus AS IdEstatus,
                    ISNULL(t.Evidencia_Url, '') AS EvidenciaUrl
                FROM tickets t
                LEFT JOIN alumnos a ON t.ID_Alumno = a.ID_Alumno
                ORDER BY t.Fecha DESC";
            return await _connection.QueryAsync<TicketAdminDto>(query);
        }

        public async Task<IEnumerable<TicketAdminDto>> GetTicketsProfesoresAsync()
        {
            string query = @"
                SELECT 
                    t.ID_Ticket AS IdTicket,
                    CAST(t.ID_Profesor AS VARCHAR(20)) AS Remitente,
                    ISNULL(p.Nombre, 'Docente') + ' ' + ISNULL(p.Primer_Apellido, 'Desconocido') AS NombreRemitente,
                    ISNULL(t.Asunto, 'Sin Asunto') AS Asunto,
                    t.Descripcion,
                    t.Fecha,
                    t.ID_Estatus AS IdEstatus,
                    ISNULL(t.Evidencia_Url, '') AS EvidenciaUrl
                FROM tickets_profesores t
                LEFT JOIN profesores p ON t.ID_Profesor = p.ID_Profesor
                ORDER BY t.Fecha DESC";
            return await _connection.QueryAsync<TicketAdminDto>(query);
        }

        public async Task<bool> ActualizarEstatusAdminAsync(ActualizarEstatusTicketDto dto)
        {
            string tabla = dto.Tipo == "profesor" ? "tickets_profesores" : "tickets";
            string query = $"UPDATE {tabla} SET ID_Estatus = @Estatus WHERE ID_Ticket = @IdTicket";
            return await _connection.ExecuteAsync(query, new { Estatus = dto.Estatus, IdTicket = dto.IdTicket }) > 0;
        }
    }
}