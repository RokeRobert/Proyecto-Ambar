namespace Ambar.Api.DTOs
{
    public class ReciboDto
    {
        public int IdRecibo { get; set; }
        public string? ReferenciaBancaria { get; set; }
        public string Concepto { get; set; } = string.Empty;
        public string Periodo { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public DateTime FechaEmision { get; set; }
        public DateTime FechaVencimiento { get; set; }
        public string Estado { get; set; } = string.Empty;
    }
}