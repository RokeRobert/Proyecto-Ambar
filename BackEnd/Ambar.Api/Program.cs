using System.Data;
using Microsoft.Data.SqlClient;
using Ambar.Api.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. Inyectar la conexión a SQL Server de forma segura
string connectionString = builder.Configuration.GetConnectionString("AmbarConnection") ?? "";
builder.Services.AddTransient<IDbConnection>((sp) => new SqlConnection(connectionString));

// Inyectar todos los Repositorios del sistema
builder.Services.AddScoped<IAlumnoRepository, AlumnoRepository>();
builder.Services.AddScoped<IProfesorRepository, ProfesorRepository>();
builder.Services.AddScoped<ICalificacionRepository, CalificacionRepository>();
builder.Services.AddScoped<IHorarioRepository, HorarioRepository>();
builder.Services.AddScoped<IKardexRepository, KardexRepository>();
builder.Services.AddScoped<ICargaMateriasRepository, CargaMateriasRepository>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ICreditoRepository, CreditoRepository>();
builder.Services.AddScoped<IReciboRepository, ReciboRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IMateriaRepository, MateriaRepository>();
builder.Services.AddScoped<IEspecialidadRepository, EspecialidadRepository>();

// 2. Agregar soporte para Controladores REST
builder.Services.AddControllers();

// 3. Configurar CORS (Permite que el frontend local se comunique sin bloqueos)
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// Activar CORS
app.UseCors("AllowAll");

// 4. Servir el Frontend (Se despachará desde la carpeta wwwroot que crearemos después)
app.UseDefaultFiles(); 
app.UseStaticFiles();  

app.UseAuthorization();
app.MapControllers();

app.Run();
