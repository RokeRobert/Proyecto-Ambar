using System.Collections.Generic;

namespace Ambar.Api.DTOs
{
    public class GuardarCargaRequest
    {
        public int IdAlumno { get; set; }
        public int IdPeriodo { get; set; }
        public List<int> IdGrupos { get; set; } = new List<int>();
    }
}