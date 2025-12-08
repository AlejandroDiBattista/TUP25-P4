# Python + FastAPI


```python
from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float
    is_offer: Union[bool, None] = None

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_name": item.name, "item_id": item_id}
```

📌 **Resumen rápido:**

-   `FastAPI()` levanta el servidor.
-   `Item` es un modelo de datos validado automáticamente gracias a **Pydantic**.
-   `/` responde con un simple JSON de saludo.
-   `/items/{item_id}` permite leer un ítem y pasar un query param opcional `q`.
-   `PUT /items/{item_id}` actualiza un ítem validando el body contra el modelo `Item`.
  
---

# JavaScript/TypeScript + Express 


### 🧠 `src/app.ts`

```typescript
import express, { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const app = express();
const port = 3000;

app.use(express.json());

/**
 * 📘 Esquema de validación con Joi (como Pydantic)
 */
const itemSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  is_offer: Joi.boolean().optional().allow(null)
});

interface Item {
  name: string;
  price: number;
  is_offer?: boolean | null;
}

/**
 * 📜 Configuración Swagger
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Express TypeScript (FastAPI Style)',
      version: '1.0.0',
      description: 'Clon funcional de la API FastAPI usando Express + Joi + Swagger'
    },
    servers: [{ url: `http://localhost:${port}` }]
  },
  apis: ['./src/app.ts']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Devuelve un saludo de prueba
 *     responses:
 *       200:
 *         description: Saludo exitoso
 */
app.get('/', (req: Request, res: Response) => {
  res.json({ Hello: 'World' });
});

/**
 * @openapi
 * /items/{item_id}:
 *   get:
 *     summary: Obtiene un item por ID
 *     parameters:
 *       - name: item_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: q
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item encontrado
 */
app.get('/items/:item_id', (req: Request, res: Response) => {
  const itemId: number = parseInt(req.params.item_id, 10);
  const q: string | null = req.query.q ? String(req.query.q) : null;
  res.json({ item_id: itemId, q });
});

/**
 * @openapi
 * /items/{item_id}:
 *   put:
 *     summary: Actualiza un item
 *     parameters:
 *       - name: item_id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               is_offer:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Item actualizado
 *       400:
 *         description: Datos inválidos
 */
app.put('/items/:item_id', (req: Request, res: Response, next: NextFunction) => {
  const itemId: number = parseInt(req.params.item_id, 10);
  const { error, value } = itemSchema.validate(req.body);

  if (error) {
    return next({ status: 400, message: error.details[0].message });
  }

  const item: Item = value;
  res.json({ item_name: item.name, item_id: itemId });
});

/**
 * 🧯 Middleware global de errores (tipo HTTPException de FastAPI)
 */
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('⚠️ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// 🚀 Iniciar servidor
app.listen(port, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${port}`);
  console.log(`📚 Swagger UI disponible en http://localhost:${port}/docs`);
});
```

---

# C# + Minimal API


## 📄 `Item.cs`

```csharp
namespace ProyectoMinimalApi;

public class Item
{
    public string Name { get; set; } = string.Empty;
    public double Price { get; set; }
    public bool? IsOffer { get; set; } = null;
}
```

---

## 🧪 `ItemValidator.cs`

```csharp
using FluentValidation;

namespace ProyectoMinimalApi;

public class ItemValidator : AbstractValidator<Item>
{
    public ItemValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("El nombre es obligatorio.");
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("El precio debe ser mayor a 0.");
    }
}
```

---

## 🚀 `Program.cs`

```csharp
using FluentValidation;
using FluentValidation.Results;
using ProyectoMinimalApi;

var builder = WebApplication.CreateBuilder(args);

// 👇 Swagger y FluentValidation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IValidator<Item>, ItemValidator>();

var app = builder.Build();

// 🌍 Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

/*
 * @route GET /
 * Devuelve un saludo básico
 */
app.MapGet("/", () =>
{
    return Results.Json(new { Hello = "World" });
})
.WithName("Root")
.WithTags("Root")
.WithOpenApi();

/*
 * @route GET /items/{item_id}
 * Devuelve un item con query opcional
 */
app.MapGet("/items/{item_id}", (int item_id, string? q) =>
{
    return Results.Json(new { item_id, q });
})
.WithName("GetItem")
.WithTags("Items")
.WithOpenApi();

/*
 * @route PUT /items/{item_id}
 * Valida y actualiza un item
 */
app.MapPut("/items/{item_id}", async (int item_id, Item item, IValidator<Item> validator) =>
{
    ValidationResult validation = await validator.ValidateAsync(item);
    if (!validation.IsValid)
    {
        var errors = validation.Errors.Select(e => e.ErrorMessage);
        return Results.BadRequest(new { error = errors });
    }

    return Results.Json(new { item_name = item.Name, item_id });
})
.WithName("UpdateItem")
.WithTags("Items")
.WithOpenApi();

/*
 * 🧯 Middleware global de errores (opcional)
 */
app.UseExceptionHandler(exceptionApp =>
{
    exceptionApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            error = "Error interno del servidor"
        });
    });
});

app.Run();
```

