namespace Ambar.Api.Models
{
    public class Recibo
    {
        public int ID_Recibo { get; set; }
        public int ID_Alumno { get; set; }
        public int ID_Estatus { get; set; }
        public int Referencia_Bancaria { get; set; }
        public int ID_Concepto { get; set; }
        public int ID_Banco { get; set; }
        public int Convenio { get; set; }
        public DateTime Fecha_Emicion { get; set; }
        public DateTime Fecha_Vigencia { get; set; }
    }
}