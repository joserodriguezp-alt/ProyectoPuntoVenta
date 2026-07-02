// Carga y valida las variables de entorno necesarias para arrancar el servidor
require('dotenv').config();

const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'JWT_SECRET'];

const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `Error de configuracion: faltan las variables de entorno: ${missingVars.join(', ')}`
  );
  process.exit(1);
}

const env = {
  port: parseInt(process.env.PORT, 10) || 4000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  timezone: process.env.TZ || 'America/Hermosillo',
  discountAuthThreshold: parseFloat(process.env.DISCOUNT_AUTH_THRESHOLD) || 20
};

module.exports = env;
