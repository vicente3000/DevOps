# API Personas DevOps

Aplicacion backend simple en Node.js para guardar personas en memoria.

## Requisitos

- Node.js 20 o superior

## Ejecutar

```bash
npm start
```

La API queda disponible en:

```text
http://localhost:3000
```

## Probar

```bash
npm test
```

## Ejecutar con Docker

Crear el archivo de variables local:

```bash
cp example.env .env
```

Levantar la aplicacion, PostgreSQL y pgAdmin:

```bash
docker compose up --build
```

Servicios disponibles:

```text
API: http://localhost:3000
pgAdmin: http://localhost:8080
PostgreSQL: localhost:5432
```

Credenciales de pgAdmin:

```text
Correo: admin@admin.com
Contrasena: admin123
```

Para registrar PostgreSQL en pgAdmin:

```text
Host: db
Port: 5432
Username: postgres
Password: postgres
Database: personas_db
```

Si el proyecto usa Prisma en `src/prisma/schema.prisma`, Docker genera el cliente durante el build y ejecuta las migraciones al iniciar el contenedor.
## Rutas

### Agregar persona

```http
POST /personas
Content-Type: application/json
```

```json
{
  "nombre": "Juan Perez",
  "rut": "11111111-1",
  "fechaNacimiento": "2000-05-10",
  "ciudad": "La Serena"
}
```

### Obtener personas

```http
GET /personas
```

### Eliminar persona por RUT

```http
DELETE /personas/11111111-1
```

## Ejemplos con curl

```bash
curl -X POST http://localhost:3000/personas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Perez","rut":"11111111-1","fechaNacimiento":"2000-05-10","ciudad":"La Serena"}'

curl -X POST http://localhost:3000/personas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Maria Soto","rut":"22222222-2","fechaNacimiento":"1998-08-20","ciudad":"Santiago"}'

curl http://localhost:3000/personas

curl -X DELETE http://localhost:3000/personas/11111111-1

curl http://localhost:3000/personas
```

