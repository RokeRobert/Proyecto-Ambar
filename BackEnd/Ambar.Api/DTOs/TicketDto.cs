namespace Ambar.Api.DTOs
{
    public class TicketDto
    {
        public int IdTicket { get; set; }
        public string TipoProblema { get; set; } = string.Empty;
        public string Observaciones { get; set; } = string.Empty;
        public string? EvidenciaUrl { get; set; }
        public string Estado { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
    }
}