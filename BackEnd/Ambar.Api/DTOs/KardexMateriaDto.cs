namespace Ambar.Api.DTOs
{
    public class KardexMateriaDto
    {
        public int IdMateria { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Clave { get; set; } = string.Empty;
        public int Creditos { get; set; }
        public int Semestre { get; set; }
        public int? Requiere { get; set; }
        public int? IdPeriodo { get; set; }
        public int? U1 { get; set; }
        public int? U2 { get; set; }
        public int? U3 { get; set; }
        public int? U4 { get; set; }
        public int? U5 { get; set; }
        public int? U6 { get; set; }
        public int PeriodoActual { get; set; }
        public int Unidad { get; set; }
    }
}