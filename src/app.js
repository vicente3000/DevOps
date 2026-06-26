const http = require('node:http');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function validarPersona(persona) {
  const camposRequeridos = ['nombre', 'rut', 'fechaNacimiento', 'ciudad'];
  const stringsValidos = camposRequeridos.every(
    (campo) => typeof persona[campo] === 'string' && persona[campo].trim() !== ''
  );

  const gustosValidos = Array.isArray(persona.gustos) && persona.gustos.every((g) => typeof g === 'string');

  return stringsValidos && gustosValidos;
}

async function resetPersonas() {
  await prisma.gusto.deleteMany();
  await prisma.persona.deleteMany();
}

function createApp() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/') {
      sendJson(res, 200, { mensaje: 'API de personas funcionando' });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/personas') {
      try {
        const personasBD = await prisma.persona.findMany({
          include: { gustos: true },
        });

        const personasFormateadas = personasBD.map((p) => ({
          nombre: p.nombre,
          rut: p.rut,
          fechaNacimiento: p.fechaNacimiento.toISOString().split('T')[0], 
          ciudad: p.ciudad,
          gustos: p.gustos.map((g) => g.nombre),
        }));

        sendJson(res, 200, personasFormateadas);
      } catch (error) {
        console.error(error);
        sendJson(res, 500, { error: 'Error interno al obtener personas' });
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/personas') {
      try {
        const persona = await readJsonBody(req);

        if (!validarPersona(persona)) {
          sendJson(res, 400, {
            error: 'Los campos nombre, rut, fechaNacimiento, ciudad y gustos son obligatorios.',
          });
          return;
        }

        const existePersona = await prisma.persona.findUnique({
          where: { rut: persona.rut },
        });

        if (existePersona) {
          sendJson(res, 409, { error: 'Ya existe una persona con ese RUT.' });
          return;
        }

        const nuevaPersonaBD = await prisma.persona.create({
          data: {
            nombre: persona.nombre,
            rut: persona.rut,
            fechaNacimiento: new Date(persona.fechaNacimiento),
            ciudad: persona.ciudad,
            gustos: {
              create: persona.gustos.map((g) => ({ nombre: g })),
            },
          },
          include: { gustos: true },
        });

        sendJson(res, 201, {
          nombre: nuevaPersonaBD.nombre,
          rut: nuevaPersonaBD.rut,
          fechaNacimiento: nuevaPersonaBD.fechaNacimiento.toISOString().split('T')[0],
          ciudad: nuevaPersonaBD.ciudad,
          gustos: nuevaPersonaBD.gustos.map((g) => g.nombre),
        });
      } catch (error) {
        console.error(error);
        sendJson(res, 400, { error: 'El cuerpo de la solicitud debe ser JSON valido o la fecha tiene un formato incorrecto.' });
      }
      return;
    }

    const deleteMatch = url.pathname.match(/^\/personas\/([^/]+)$/);
    if (req.method === 'DELETE' && deleteMatch) {
      const rut = decodeURIComponent(deleteMatch[1]);

      try {
        const personaEliminada = await prisma.persona.delete({
          where: { rut: rut },
          include: { gustos: true },
        });

        sendJson(res, 200, {
          nombre: personaEliminada.nombre,
          rut: personaEliminada.rut,
          fechaNacimiento: personaEliminada.fechaNacimiento.toISOString().split('T')[0],
          ciudad: personaEliminada.ciudad,
          gustos: personaEliminada.gustos.map((g) => g.nombre),
        });
      } catch (error) {
        if (error.code === 'P2025') {
          sendJson(res, 404, { error: 'Persona no encontrada.' });
        } else {
          console.error(error);
          sendJson(res, 500, { error: 'Error al intentar eliminar a la persona' });
        }
      }
      return;
    }

    sendJson(res, 404, { error: 'Ruta no encontrada.' });
  });
}

module.exports = {
  createApp,
  resetPersonas,
};