using System.Collections.Generic;

namespace Ambar.Api.DTOs
{
    // --- DTOs para Asignación de Docentes ---
    public class GrupoAsignacionDto
    {
        public int Id { get; set; } // ID_Grupo
        public string Grupo { get; set; }
        public string Materia { get; set; }
        public string Carrera { get; set; }
        public int? IdProfesor { get; set; }
        public string Profesor { get; set; }
    }

    public class DocenteSimpleDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
    }

    // --- DTOs para Gestión de Alumnos ---
    public class AlumnoBusquedaDto
    {
        public string Control { get; set; }
        public string Nombre { get; set; }
        public string Carrera { get; set; }
        public string Semestre { get; set; }
    }

    public class MateriaInscritaDto
    {
        public int IdGrupo { get; set; }
        public string Materia { get; set; }
        public string Profesor { get; set; }
    }

    public class AlumnoDetalleDto : AlumnoBusquedaDto
    {
        public IEnumerable<MateriaInscritaDto> Materias { get; set; }
    }

    public class OfertaAcademicaDto
    {
        public int IdGrupo { get; set; }
        public string Materia { get; set; }
        public string Profesor { get; set; }
        public bool TieneProfesor { get; set; }
    }
}