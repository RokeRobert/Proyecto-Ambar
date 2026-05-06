namespace Ambar.Api.DTOs
{
    public class DashboardDto
    {
        public int TotalAlumnos { get; set; }
        public int PagosPendientes { get; set; }
        public int PagosCompletados { get; set; }
        public int CreditosPendientes { get; set; }
        public int CreditosAprobados { get; set; }
        public int CreditosRechazados { get; set; }
        public int TicketsAbiertos { get; set; }
    }
}