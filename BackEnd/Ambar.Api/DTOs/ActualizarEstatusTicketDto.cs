namespace Ambar.Api.DTOs
{
    public class ActualizarEstatusTicketDto
    {
        public int IdTicket { get; set; }
        public int Estatus { get; set; }
        public string Tipo { get; set; } = string.Empty;
    }
}