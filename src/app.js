const http = require('node:http');

const personas = [];

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
  return camposRequeridos.every((campo) => typeof persona[campo] === 'string' && persona[campo].trim() !== '');
}

function resetPersonas() {
  personas.length = 0;
}

function createApp() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/') {
      sendJson(res, 200, { mensaje: 'API de personas funcionando' });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/personas') {
      sendJson(res, 200, personas);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/personas') {
      try {
        const persona = await readJsonBody(req);

        if (!validarPersona(persona)) {
          sendJson(res, 400, {
            error: 'Los campos nombre, rut, fechaNacimiento y ciudad son obligatorios.',
          });
          return;
        }

        const existePersona = personas.some((item) => item.rut === persona.rut);
        if (existePersona) {
          sendJson(res, 409, { error: 'Ya existe una persona con ese RUT.' });
          return;
        }

        const nuevaPersona = {
          nombre: persona.nombre,
          rut: persona.rut,
          fechaNacimiento: persona.fechaNacimiento,
          ciudad: persona.ciudad,
        };

        personas.push(nuevaPersona);
        sendJson(res, 201, nuevaPersona);
      } catch (error) {
        sendJson(res, 400, { error: 'El cuerpo de la solicitud debe ser JSON valido.' });
      }
      return;
    }

    const deleteMatch = url.pathname.match(/^\/personas\/([^/]+)$/);
    if (req.method === 'DELETE' && deleteMatch) {
      const rut = decodeURIComponent(deleteMatch[1]);
      const index = personas.findIndex((persona) => persona.rut === rut);

      if (index === -1) {
        sendJson(res, 404, { error: 'Persona no encontrada.' });
        return;
      }

      const [personaEliminada] = personas.splice(index, 1);
      sendJson(res, 200, personaEliminada);
      return;
    }

    sendJson(res, 404, { error: 'Ruta no encontrada.' });
  });
}

module.exports = {
  createApp,
  resetPersonas,
};
