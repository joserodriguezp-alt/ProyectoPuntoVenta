// Configuracion principal de la aplicacion Express: middlewares globales y registro de rutas
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { errorMiddleware, notFoundMiddleware } = require('./middleware/error-middleware');

const authRoutes = require('./modules/users/auth-routes');
const userRoutes = require('./modules/users/user-routes');
const productRoutes = require('./modules/products/product-routes');
const inventoryRoutes = require('./modules/inventory/inventory-routes');
const saleRoutes = require('./modules/sales/sale-routes');
const cashRegisterRoutes = require('./modules/cash-register/cash-register-routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Documentacion interactiva (sin autenticacion)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'TPV Papelería — API Docs' }));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// Endpoint de salud — disponible en /health (Railway) y /api/health
app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/cash-register', cashRegisterRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
