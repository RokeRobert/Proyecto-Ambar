namespace Ambar.Api.Models
{
    public class DepartamentoAcademico
    {
        public int ID_Departamento { get; set; }
        public string Nombre_Departamento { get; set; } = string.Empty;
        public int ID_Jefe_Departamento { get; set; }
    }
}