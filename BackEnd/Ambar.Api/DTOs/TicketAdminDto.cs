namespace Ambar.Api.DTOs
{
    public class TicketAdminDto
    {
        public int IdTicket { get; set; }
        public string Remitente { get; set; } = string.Empty;
        public string NombreRemitente { get; set; } = string.Empty;
        public string Asunto { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public int IdEstatus { get; set; }
        public string EvidenciaUrl { get; set; } = string.Empty;
    }
}