// Punto de entrada del servidor: arranca Express en el puerto configurado
const app = require('./src/app');
const env = require('./src/config/env');

app.listen(env.port, () => {
  console.log(`Servidor TPV Papeleria escuchando en el puerto ${env.port}`);
});
