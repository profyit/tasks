using Microsoft.EntityFrameworkCore;
using TaskManagement.Middleware;
using TaskManagement.Middleware.TaskManagerApi.Middleware;
using TaskManagementBLLayer.Services;
using TaskManagementDBLayer;
using TaskManagementDBLayer.Entities.TaskManagerApi.Data;





var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

RegisterObjects(builder);
CreateDB(builder);

AddCors(builder);

var app = builder.Build();
using (var scope = app.Services.CreateScope()) // Create a service scope
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<TaskDbContext>(); 

       
        dbContext.Database.EnsureCreated();
        Console.WriteLine("Database checked/created successfully.");
    }
    catch (Exception ex)
    {
        // Log the error if database creation fails
        var logger = services.GetRequiredService<ILogger<Program>>(); 
        logger.LogError(ex, "An error occurred creating the DB.");

    }
}
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();



app.Run();


void RegisterObjects(WebApplicationBuilder builder)
{
    builder.Services.AddScoped<ICustomLogService, CustomLogService>();
    builder.Services.AddTransient<ITasksDBService, TasksDBService>();
    builder.Services.AddTransient<ITasksService, TasksService>();
   

}

app.UseMiddleware<DeveloperNameMiddleware>();
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();



app.Run();

static void CreateDB(WebApplicationBuilder builder)
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
             ?? "Server=(localdb)\\mssqllocaldb;Database=TasksDB;Trusted_Connection=True;MultipleActiveResultSets=true";

    builder.Services.AddDbContext<TaskDbContext>(options =>
             options.UseSqlServer(connectionString));
}

static void AddCors(WebApplicationBuilder builder)
{
    var MyAllowSpecificOrigins = "_myCorsAllowSpecificOrigins";

    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: MyAllowSpecificOrigins,
                          policy =>
                          {
                              policy.AllowAnyOrigin()
                                    .AllowAnyHeader()
                                    .AllowAnyMethod();

                          });
    });
}