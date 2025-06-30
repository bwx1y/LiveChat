using System.Text;
using ChatLive.Context;
using ChatLive.Hub;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Db connection
builder.Services.AddDbContext<ChatLiveContext>(option =>
{
    string connectionString = builder.Configuration.GetConnectionString("DefaultConnection")?? "Server=localhost;Database=chat_live_db;User=root;Password=nedy_888;Port=3306;";

    option.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
});

// Add SignalR
builder.Services.AddSignalR();

// Add Jwt Config
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        byte[] key = Encoding.UTF8.GetBytes(builder.Configuration["JWT:KEY"] ?? "lNi7dgUa6oy8KWZwnZuuNxTszn3IaJhw");
        
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
        
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/hub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

// Add Swagger Config
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "API Backend Shop",
        Version = "v1"
    });

    
    c.CustomSchemaIds(type => type.FullName?.Replace("+", "."));
    
    c.AddSecurityDefinition("bearerAuth", new OpenApiSecurityScheme()
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Description = "Masukkan JWT dengan format: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "bearerAuth"
                }
            },
            new List<string>()
        }
    });
});

// Add Cors
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:8000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // sekarang valid
    });
});

builder.Services.AddSingleton<IUserIdProvider, ChatHubProvider>();
builder.Services.AddSingleton<IChatHubConnectionManager, ChatHubConnectionManager>();

var app = builder.Build();

if (builder.Environment.IsDevelopment()) app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHubController>("/hub").RequireAuthorization();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ChatLiveContext>();
    context.Database.EnsureCreated();
}

app.Run();