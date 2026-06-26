const assert = require('node:assert/strict');
const test = require('node:test');
const { createApp, resetPersonas } = require('../src/app');

async function startTestServer() {
  const server = createApp();

  await new Promise((resolve) => {
    server.listen(0, resolve);
  });

  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test('POST /personas agrega una persona', async () => {
  await resetPersonas(); 
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/personas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Juan Perez',
        rut: '11111111-1',
        fechaNacimiento: '2000-05-10',
        ciudad: 'La Serena',
        gustos: ['leer', 'viajar'],
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 201);
    assert.deepEqual(body, {
      nombre: 'Juan Perez',
      rut: '11111111-1',
      fechaNacimiento: '2000-05-10',
      ciudad: 'La Serena',
      gustos: ['leer', 'viajar'],
    });
  } finally {
    await server.close();
  }
});

test('GET /personas obtiene todas las personas', async () => {
  await resetPersonas();
  const server = await startTestServer();

  try {
    const personaUno = {
      nombre: 'Juan Perez',
      rut: '11111111-1',
      fechaNacimiento: '2000-05-10',
      ciudad: 'La Serena',
      gustos: ['leer', 'viajar'],
    };
    const personaDos = {
      nombre: 'Maria Soto',
      rut: '22222222-2',
      fechaNacimiento: '1998-08-20',
      ciudad: 'Santiago',
      gustos: ['cocinar', 'bailar'],
    };

    await fetch(`${server.baseUrl}/personas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personaUno),
    });
    await fetch(`${server.baseUrl}/personas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personaDos),
    });

    const response = await fetch(`${server.baseUrl}/personas`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, [personaUno, personaDos]);
  } finally {
    await server.close();
  }
});

test('DELETE /personas/:rut elimina una persona por RUT', async () => {
  await resetPersonas();
  const server = await startTestServer();

  try {
    const personaUno = {
      nombre: 'Juan Perez',
      rut: '11111111-1',
      fechaNacimiento: '2000-05-10',
      ciudad: 'La Serena',
      gustos: ['leer', 'viajar'],
    };
    const personaDos = {
      nombre: 'Maria Soto',
      rut: '22222222-2',
      fechaNacimiento: '1998-08-20',
      ciudad: 'Santiago',
      gustos: ['cocinar', 'bailar'],
    };

    await fetch(`${server.baseUrl}/personas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personaUno),
    });
    await fetch(`${server.baseUrl}/personas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personaDos),
    });

    const deleteResponse = await fetch(`${server.baseUrl}/personas/${encodeURIComponent(personaUno.rut)}`, {
      method: 'DELETE',
    });
    const deleteBody = await deleteResponse.json();

    const getResponse = await fetch(`${server.baseUrl}/personas`);
    const getBody = await getResponse.json();

    assert.equal(deleteResponse.status, 200);
    assert.deepEqual(deleteBody, personaUno);
    assert.deepEqual(getBody, [personaDos]);
  } finally {
    await server.close();
  }
});

test('POST /personas rechaza datos incompletos', async () => {
  await resetPersonas();
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/personas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Persona sin ciudad',
        rut: '33333333-3',
        fechaNacimiento: '2001-01-01',
      }),
    });

    assert.equal(response.status, 400);
  } finally {
    await server.close();
  }
});