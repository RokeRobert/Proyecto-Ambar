namespace Ambar.Api.Models
{
    public class TicketProfesor
    {
        public int ID_Ticket { get; set; }
        public int ID_Profesor { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public int ID_Estatus { get; set; }
        public string? Asunto { get; set; }
    }
}