namespace Ambar.Api.Models
{
    public class MaterialDidactico
    {
        public int ID_Material_Didactico { get; set; }
        public int ID_Grupo { get; set; }
        public string Materia_Didactico { get; set; } = string.Empty;
    }
}