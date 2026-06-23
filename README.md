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
