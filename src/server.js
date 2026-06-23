const { createApp } = require('./app');

const port = process.env.PORT || 3000;
const server = createApp();

server.listen(port, () => {
  console.log(`API de personas escuchando en puerto ${port}`);
});
