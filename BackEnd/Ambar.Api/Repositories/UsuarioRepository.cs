using System.Data;
using Dapper;
using Ambar.Api.DTOs;

namespace Ambar.Api.Repositories
{
    public interface IUsuarioRepository
    {
        Task<IEnumerable<UsuarioListaDto>> GetUsuariosAsync();
        Task<IEnumerable<UsuarioListaDto>> GetAlumnosListaAsync();
        Task<IEnumerable<UsuarioListaDto>> GetProfesoresListaAsync();
        Task<IEnumerable<FiltroCarreraDto>> GetCarrerasAsync();
        Task<IEnumerable<FiltroDepartamentoDto>> GetDepartamentosAsync();
        Task<IEnumerable<FiltroCarreraDto>> GetCarrerasDisponiblesAsync(int idDepartamento, int? idProfesor);
        Task<int> GetPeriodoActualAsync();
        Task<IEnumerable<PeriodoDto>> GetPeriodosAsync();
        Task<bool> CrearAlumnoAsync(CrearAlumnoDto alumno);
        Task<bool> CrearProfesorAsync(CrearProfesorDto profesor);
        Task<CrearAlumnoDto?> GetAlumnoByIdAsync(int id);
        Task<CrearProfesorDto?> GetProfesorByIdAsync(int id);
        Task<bool> ActualizarAlumnoAsync(int id, CrearAlumnoDto alumno);
        Task<bool> ActualizarProfesorAsync(int id, CrearProfesorDto profesor);
        Task<bool> EliminarAlumnoAsync(int id);
        Task<bool> EliminarProfesorAsync(int id);
    }

    public class UsuarioRepository : IUsuarioRepository
    {
        private readonly IDbConnection _connection;
        public UsuarioRepository(IDbConnection connection) => _connection = connection;

        public async Task<IEnumerable<UsuarioListaDto>> GetUsuariosAsync()
        {
            string query = @"
                SELECT 
                    CAST(a.ID_Alumno AS VARCHAR(50)) AS Id,
                    CONCAT(a.Nombre, ' ', a.Primer_Apellido, ' ', a.Segundo_Apellido) AS Nombre,
                    'Alumno' AS Tipo,
                    ISNULL(a.Correo_Institucional, a.Correo_Personal) AS Correo,
                    ISNULL(c.Nombre_Carrera, 'Sin Carrera') AS Carrera
                FROM alumnos a
                LEFT JOIN carreras c ON a.ID_Carrera = c.ID_Carrera
                
                UNION ALL
                
                SELECT 
                    CAST(p.ID_Profesor AS VARCHAR(50)) AS Id,
                    CONCAT(p.Nombre, ' ', p.Primer_Apellido, ' ', p.Segundo_Apellido) AS Nombre,
                    CASE WHEN p.ID_Rol = 1 THEN 'Administrador' WHEN p.ID_Rol = 2 THEN 'Coordinador' ELSE 'Docente' END AS Tipo,
                    p.Correo_Institucional AS Correo,
                    CASE 
                        WHEN p.ID_Rol = 2 THEN ISNULL(cc.Nombre_Carrera, 'Sin Carrera Asignada')
                        WHEN p.ID_Rol = 3 THEN ISNULL(da.Nombre_Departamento, 'Sin Departamento')
                        ELSE 'Administración'
                    END AS Carrera
                FROM profesores p
                LEFT JOIN departamentos_academicos da ON p.ID_Departamento = da.ID_Departamento
                LEFT JOIN departamentos_carreras dc ON p.ID_Profesor = dc.ID_Coordinador
                LEFT JOIN carreras cc ON dc.ID_Carrera = cc.ID_Carrera
                ORDER BY Nombre ASC";

            return await _connection.QueryAsync<UsuarioListaDto>(query);
        }

        public async Task<IEnumerable<UsuarioListaDto>> GetAlumnosListaAsync()
        {
            string query = @"
                SELECT 
                    CAST(a.ID_Alumno AS VARCHAR(50)) AS Id,
                    CONCAT(a.Nombre, ' ', a.Primer_Apellido, ' ', a.Segundo_Apellido) AS Nombre,
                    'Alumno' AS Tipo,
                    ISNULL(a.Correo_Institucional, a.Correo_Personal) AS Correo,
                    ISNULL(c.Nombre_Carrera, 'Sin Carrera') AS Carrera
                FROM alumnos a
                LEFT JOIN carreras c ON a.ID_Carrera = c.ID_Carrera
                ORDER BY Nombre ASC";
            return await _connection.QueryAsync<UsuarioListaDto>(query);
        }

        public async Task<IEnumerable<UsuarioListaDto>> GetProfesoresListaAsync()
        {
            string query = @"
                SELECT 
                    CAST(p.ID_Profesor AS VARCHAR(50)) AS Id,
                    CONCAT(p.Nombre, ' ', p.Primer_Apellido, ' ', p.Segundo_Apellido) AS Nombre,
                    CASE WHEN p.ID_Rol = 1 THEN 'Administrador' WHEN p.ID_Rol = 2 THEN 'Coordinador' ELSE 'Docente' END AS Tipo,
                    p.Correo_Institucional AS Correo,
                    CASE 
                        WHEN p.ID_Rol = 2 THEN ISNULL(cc.Nombre_Carrera, 'Sin Carrera Asignada')
                        WHEN p.ID_Rol = 3 THEN ISNULL(da.Nombre_Departamento, 'Sin Departamento')
                        ELSE 'Administración'
                    END AS Carrera
                FROM profesores p
                LEFT JOIN departamentos_academicos da ON p.ID_Departamento = da.ID_Departamento
                LEFT JOIN departamentos_carreras dc ON p.ID_Profesor = dc.ID_Coordinador
                LEFT JOIN carreras cc ON dc.ID_Carrera = cc.ID_Carrera
                ORDER BY Nombre ASC";
            return await _connection.QueryAsync<UsuarioListaDto>(query);
        }

        public async Task<IEnumerable<FiltroCarreraDto>> GetCarrerasAsync()
        {
            string query = "SELECT ID_Carrera AS Id, Nombre_Carrera AS Nombre FROM carreras ORDER BY Nombre_Carrera ASC";
            return await _connection.QueryAsync<FiltroCarreraDto>(query);
        }

        public async Task<IEnumerable<FiltroDepartamentoDto>> GetDepartamentosAsync()
        {
            string query = "SELECT ID_Departamento AS Id, Nombre_Departamento AS Nombre FROM departamentos_academicos ORDER BY Nombre_Departamento ASC";
            return await _connection.QueryAsync<FiltroDepartamentoDto>(query);
        }

        public async Task<IEnumerable<FiltroCarreraDto>> GetCarrerasDisponiblesAsync(int idDepartamento, int? idProfesor)
        {
            string query = @"
                SELECT c.ID_Carrera AS Id, c.Nombre_Carrera AS Nombre 
                FROM carreras c
                LEFT JOIN departamentos_carreras dc ON c.ID_Carrera = dc.ID_Carrera
                WHERE (dc.ID_Departamento = @IdDepartamento OR dc.ID_Departamento IS NULL)
                  AND (dc.ID_Coordinador IS NULL OR dc.ID_Coordinador = @IdProfesor)
                ORDER BY c.Nombre_Carrera ASC";
            return await _connection.QueryAsync<FiltroCarreraDto>(query, new { IdDepartamento = idDepartamento, IdProfesor = idProfesor });
        }

        public async Task<int> GetPeriodoActualAsync()
        {
            // Busca el periodo más reciente registrado en el catálogo de periodos
            string query = "SELECT ISNULL(MAX(ID_Periodo), 1) FROM periodos";
            return await _connection.QuerySingleAsync<int>(query);
        }

        public async Task<IEnumerable<PeriodoDto>> GetPeriodosAsync()
        {
            string query = "SELECT ID_Periodo AS Id, Nombre_Periodo AS Nombre FROM periodos ORDER BY ID_Periodo ASC";
            return await _connection.QueryAsync<PeriodoDto>(query);
        }

        public async Task<bool> CrearAlumnoAsync(CrearAlumnoDto a)
        {
            string query = @"
                -- 1. Armar el prefijo: Año actual (ej. '26') + '21' = '2621'
                DECLARE @Anio VARCHAR(2) = RIGHT(CAST(YEAR(GETDATE()) AS VARCHAR), 2);
                DECLARE @Prefijo VARCHAR(4) = @Anio + '21';
                
                -- 2. Buscar el consecutivo más alto de los alumnos inscritos este año
                DECLARE @MaxConsecutivo INT;
                SELECT @MaxConsecutivo = ISNULL(MAX(ID_Alumno % 10000), 0)
                FROM alumnos
                WHERE CAST(ID_Alumno AS VARCHAR) LIKE @Prefijo + '%';
                
                -- 3. Generar la nueva Matrícula y el Correo Institucional
                DECLARE @NuevoId INT = CAST(@Prefijo + RIGHT('0000' + CAST(@MaxConsecutivo + 1 AS VARCHAR), 4) AS INT);
                DECLARE @CorreoInst VARCHAR(100) = CAST(@NuevoId AS VARCHAR) + '@tectijuana.edu.mx';

                -- 4. Forzar la inserción de nuestro ID personalizado apagando el seguro de la tabla temporalmente
                SET IDENTITY_INSERT alumnos ON;
                
                BEGIN TRY
                    INSERT INTO alumnos (ID_Alumno, Nombre, Primer_Apellido, Segundo_Apellido, ID_Carrera, ID_Periodo_Ingreso, CURP, Telefono, Correo_Personal, Correo_Institucional, Fecha_Nacimiento, Contrasena, Direccion_Foto, ID_Estatus)
                    VALUES (@NuevoId, @Nombre, @PrimerApellido, @SegundoApellido, @IdCarrera, @IdPeriodo, @Curp, @Telefono, @CorreoPersonal, @CorreoInst, @FechaNacimiento, @Contrasena, '', 1);
                    
                    SET IDENTITY_INSERT alumnos OFF;
                END TRY
                BEGIN CATCH
                    SET IDENTITY_INSERT alumnos OFF;
                    THROW;
                END CATCH;";
                
            return await _connection.ExecuteAsync(query, a) > 0;
        }

        public async Task<bool> CrearProfesorAsync(CrearProfesorDto p)
        {
            string query = @"
                -- 1. Armar el prefijo: Año actual + '00' (en lugar del '21' de los alumnos) = '2600'
                DECLARE @Anio VARCHAR(2) = RIGHT(CAST(YEAR(GETDATE()) AS VARCHAR), 2);
                DECLARE @Prefijo VARCHAR(4) = @Anio + '00';
                
                -- 2. Buscar el consecutivo más alto de los profesores este año
                DECLARE @MaxConsecutivo INT;
                SELECT @MaxConsecutivo = ISNULL(MAX(ID_Profesor % 10000), 0)
                FROM profesores
                WHERE CAST(ID_Profesor AS VARCHAR) LIKE @Prefijo + '%';
                
                -- 3. Generar el nuevo ID de Profesor (Número de Empleado)
                DECLARE @NuevoId INT = CAST(@Prefijo + RIGHT('0000' + CAST(@MaxConsecutivo + 1 AS VARCHAR), 4) AS INT);
                
                -- Generamos un correo automático si el campo viene vacío desde el formulario
                DECLARE @CorreoInst VARCHAR(100) = @CorreoInstitucional;
                IF @CorreoInst = '' OR @CorreoInst IS NULL
                BEGIN
                    SET @CorreoInst = LOWER(REPLACE(@Nombre, ' ', '') + REPLACE(@PrimerApellido, ' ', '') + ISNULL(REPLACE(@SegundoApellido, ' ', ''), '')) + '@tectijuana.edu.mx';
                END

                -- 4. Forzar la inserción apagando el seguro de la tabla temporalmente
                SET IDENTITY_INSERT profesores ON;
                
                BEGIN TRY
                    INSERT INTO profesores (ID_Profesor, Nombre, Primer_Apellido, Segundo_Apellido, ID_Estatus, Fecha_Ingreso, ID_Departamento, Contrasena, ID_Rol, Direccion_Foto, Correo_Institucional) 
                    VALUES (@NuevoId, @Nombre, @PrimerApellido, @SegundoApellido, 1, @FechaIngreso, @IdDepartamento, @Contrasena, @IdRol, '', @CorreoInst);
                    
                    SET IDENTITY_INSERT profesores OFF;
                END TRY
                BEGIN CATCH
                    SET IDENTITY_INSERT profesores OFF;
                    THROW;
                END CATCH;

                IF @IdRol = 2 AND @IdCarreraCoordinada IS NOT NULL
                BEGIN
                    -- Actualiza al coordinador de la carrera, o inserta la relación si es nueva
                    IF EXISTS (SELECT 1 FROM departamentos_carreras WHERE ID_Carrera = @IdCarreraCoordinada)
                        UPDATE departamentos_carreras SET ID_Coordinador = @NuevoId, ID_Departamento = @IdDepartamento WHERE ID_Carrera = @IdCarreraCoordinada;
                    ELSE
                        INSERT INTO departamentos_carreras (ID_Departamento, ID_Carrera, ID_Coordinador) VALUES (@IdDepartamento, @IdCarreraCoordinada, @NuevoId);
                END";
            return await _connection.ExecuteAsync(query, p) > 0;
        }

        public async Task<CrearAlumnoDto?> GetAlumnoByIdAsync(int id)
        {
            string query = "SELECT Nombre, Primer_Apellido AS PrimerApellido, Segundo_Apellido AS SegundoApellido, CURP AS Curp, Telefono, Correo_Personal AS CorreoPersonal, Fecha_Nacimiento AS FechaNacimiento, ID_Carrera AS IdCarrera, ID_Periodo_Ingreso AS IdPeriodo FROM alumnos WHERE ID_Alumno = @Id";
            return await _connection.QueryFirstOrDefaultAsync<CrearAlumnoDto>(query, new { Id = id });
        }

        public async Task<CrearProfesorDto?> GetProfesorByIdAsync(int id)
        {
            string query = @"
                SELECT p.Nombre, p.Primer_Apellido AS PrimerApellido, p.Segundo_Apellido AS SegundoApellido, p.Correo_Institucional AS CorreoInstitucional, p.Fecha_Ingreso AS FechaIngreso, p.ID_Departamento AS IdDepartamento, p.ID_Rol AS IdRol, dc.ID_Carrera AS IdCarreraCoordinada
                FROM profesores p
                LEFT JOIN departamentos_carreras dc ON p.ID_Profesor = dc.ID_Coordinador
                WHERE p.ID_Profesor = @Id";
            return await _connection.QueryFirstOrDefaultAsync<CrearProfesorDto>(query, new { Id = id });
        }

        public async Task<bool> ActualizarAlumnoAsync(int id, CrearAlumnoDto a)
        {
            string updatePass = string.IsNullOrWhiteSpace(a.Contrasena) ? "" : ", Contrasena = @Contrasena";
            string query = $@"
                UPDATE alumnos SET 
                    Nombre = @Nombre, Primer_Apellido = @PrimerApellido, Segundo_Apellido = @SegundoApellido,
                    CURP = @Curp, Telefono = @Telefono, Correo_Personal = @CorreoPersonal,
                    Fecha_Nacimiento = @FechaNacimiento, ID_Carrera = @IdCarrera, ID_Periodo_Ingreso = @IdPeriodo
                    {updatePass}
                WHERE ID_Alumno = @Id";
            var parametros = new DynamicParameters(a);
            parametros.Add("Id", id);
            return await _connection.ExecuteAsync(query, parametros) > 0;
        }

        public async Task<bool> ActualizarProfesorAsync(int id, CrearProfesorDto p)
        {
            string updatePass = string.IsNullOrWhiteSpace(p.Contrasena) ? "" : ", Contrasena = @Contrasena";
            string query = $@"
                UPDATE profesores SET 
                    Nombre = @Nombre, Primer_Apellido = @PrimerApellido, Segundo_Apellido = @SegundoApellido,
                    Correo_Institucional = @CorreoInstitucional, Fecha_Ingreso = @FechaIngreso, 
                    ID_Departamento = @IdDepartamento, ID_Rol = @IdRol
                    {updatePass}
                WHERE ID_Profesor = @Id;

                -- 1. Quitamos a este profesor como coordinador de cualquier carrera que tuviera antes
                UPDATE departamentos_carreras SET ID_Coordinador = NULL WHERE ID_Coordinador = @Id;
                
                -- 2. Si su nuevo rol es Coordinador, lo asignamos a la carrera correspondiente
                IF @IdRol = 2 AND @IdCarreraCoordinada IS NOT NULL
                BEGIN
                    IF EXISTS (SELECT 1 FROM departamentos_carreras WHERE ID_Carrera = @IdCarreraCoordinada)
                        UPDATE departamentos_carreras SET ID_Coordinador = @Id, ID_Departamento = @IdDepartamento WHERE ID_Carrera = @IdCarreraCoordinada;
                    ELSE
                        INSERT INTO departamentos_carreras (ID_Departamento, ID_Carrera, ID_Coordinador) VALUES (@IdDepartamento, @IdCarreraCoordinada, @Id);
                END";
            var parametros = new DynamicParameters(p);
            parametros.Add("Id", id);
            return await _connection.ExecuteAsync(query, parametros) > 0;
        }

        public async Task<bool> EliminarAlumnoAsync(int id)
        {
            return await _connection.ExecuteAsync("DELETE FROM alumnos WHERE ID_Alumno = @Id", new { Id = id }) > 0;
        }

        public async Task<bool> EliminarProfesorAsync(int id)
        {
            string query = @"
                -- Desvinculamos al coordinador para que SQL no marque error de Integridad (Foreign Key)
                UPDATE departamentos_carreras SET ID_Coordinador = NULL WHERE ID_Coordinador = @Id;
                
                DELETE FROM profesores WHERE ID_Profesor = @Id;";
            return await _connection.ExecuteAsync(query, new { Id = id }) > 0;
        }
    }
}