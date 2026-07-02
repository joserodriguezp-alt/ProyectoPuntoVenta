'use strict';

// ─── Componentes reutilizables ────────────────────────────────────────────────
const bearerAuth = {
  bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
};

const schemas = {
  // ── Respuestas genéricas ───────────────────────────────────────────────────
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error:   { type: 'string', example: 'Mensaje de error' },
    },
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  LoginRequest: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', example: 'admin' },
      password: { type: 'string', format: 'password', example: 'admin123' },
    },
  },
  LoginResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: {
            type: 'object',
            properties: {
              id:       { type: 'integer', example: 1 },
              username: { type: 'string',  example: 'admin' },
              fullName: { type: 'string',  example: 'Administrador Principal' },
              role:     { type: 'string',  enum: ['administrador', 'cajero'], example: 'administrador' },
            },
          },
        },
      },
    },
  },

  // ── Usuarios ───────────────────────────────────────────────────────────────
  Usuario: {
    type: 'object',
    properties: {
      id_usuario:      { type: 'integer', example: 1 },
      nombre_completo: { type: 'string',  example: 'Juan Pérez' },
      username:        { type: 'string',  example: 'jperez' },
      rol:             { type: 'string',  enum: ['administrador', 'cajero'] },
      activo:          { type: 'boolean', example: true },
    },
  },
  CreateUserRequest: {
    type: 'object',
    required: ['fullName', 'username', 'password'],
    properties: {
      fullName: { type: 'string',  example: 'Juan Pérez' },
      username: { type: 'string',  example: 'jperez' },
      password: { type: 'string',  format: 'password', example: 'secreta123' },
      role:     { type: 'string',  enum: ['administrador', 'cajero'], default: 'cajero' },
    },
  },
  UpdateUserRequest: {
    type: 'object',
    properties: {
      fullName: { type: 'string',  example: 'Juan Pérez Actualizado' },
      role:     { type: 'string',  enum: ['administrador', 'cajero'] },
      active:   { type: 'boolean', example: true },
      password: { type: 'string',  format: 'password' },
    },
  },

  // ── Productos ──────────────────────────────────────────────────────────────
  Producto: {
    type: 'object',
    properties: {
      id_producto:    { type: 'integer', example: 5 },
      nombre:         { type: 'string',  example: 'Cuaderno universitario' },
      codigo_barras:  { type: 'string',  example: '7501000123456' },
      codigo_interno: { type: 'string',  example: 'CU-001' },
      descripcion:    { type: 'string',  example: '100 hojas, pasta dura' },
      id_categoria:   { type: 'integer', example: 2 },
      precio_venta:   { type: 'number',  example: 45.00 },
      precio_costo:   { type: 'number',  example: 28.00 },
      unidad_medida:  { type: 'string',  example: 'pieza' },
      stock_actual:   { type: 'integer', example: 120 },
      stock_minimo:   { type: 'integer', example: 10 },
      activo:         { type: 'boolean', example: true },
    },
  },
  CreateProductRequest: {
    type: 'object',
    required: ['name', 'categoryId', 'salePrice', 'costPrice', 'unit'],
    properties: {
      name:         { type: 'string',  example: 'Cuaderno universitario' },
      barcode:      { type: 'string',  example: '7501000123456' },
      internalCode: { type: 'string',  example: 'CU-001' },
      description:  { type: 'string',  example: '100 hojas, pasta dura' },
      categoryId:   { type: 'integer', example: 2 },
      salePrice:    { type: 'number',  example: 45.00 },
      costPrice:    { type: 'number',  example: 28.00 },
      unit:         { type: 'string',  example: 'pieza', enum: ['pieza', 'caja', 'paquete', 'rollo', 'metro', 'litro', 'kilogramo'] },
      initialStock: { type: 'integer', example: 50, default: 0 },
      minStock:     { type: 'integer', example: 10, default: 0 },
    },
  },
  UpdateProductRequest: {
    type: 'object',
    properties: {
      name:         { type: 'string' },
      barcode:      { type: 'string' },
      internalCode: { type: 'string' },
      description:  { type: 'string' },
      salePrice:    { type: 'number' },
      costPrice:    { type: 'number' },
      minStock:     { type: 'integer' },
    },
  },

  // ── Inventario ─────────────────────────────────────────────────────────────
  StockInfo: {
    type: 'object',
    properties: {
      productId:    { type: 'integer', example: 5 },
      name:         { type: 'string',  example: 'Cuaderno universitario' },
      currentStock: { type: 'integer', example: 120 },
      minStock:     { type: 'integer', example: 10 },
      unit:         { type: 'string',  example: 'pieza' },
      lowStock:     { type: 'boolean', example: false },
    },
  },
  MovimientoInventario: {
    type: 'object',
    properties: {
      id_movimiento:    { type: 'integer', example: 42 },
      tipo:             { type: 'string',  enum: ['entrada', 'venta', 'devolucion', 'ajuste'] },
      cantidad:         { type: 'integer', example: 10 },
      stock_anterior:   { type: 'integer', example: 110 },
      stock_resultante: { type: 'integer', example: 120 },
      fecha:            { type: 'string',  format: 'date-time' },
      motivo:           { type: 'string',  example: 'Proveedor: Distribuidora ABC' },
    },
  },
  EntradaRequest: {
    type: 'object',
    required: ['productId', 'quantity'],
    properties: {
      productId:   { type: 'integer', example: 5 },
      quantity:    { type: 'integer', example: 50, minimum: 1 },
      supplier:    { type: 'string',  example: 'Distribuidora ABC' },
      invoiceDate: { type: 'string',  format: 'date', example: '2026-07-01' },
    },
  },
  AjusteRequest: {
    type: 'object',
    required: ['productId', 'quantity', 'reason'],
    properties: {
      productId: { type: 'integer', example: 5 },
      quantity:  { type: 'integer', example: -3, description: 'Delta: positivo suma, negativo resta' },
      reason:    { type: 'string',  example: 'Conteo físico — merma detectada' },
      confirm:   { type: 'boolean', example: true, description: 'Requerido si el ajuste resultaría en stock negativo' },
    },
  },

  // ── Caja ───────────────────────────────────────────────────────────────────
  CorteCaja: {
    type: 'object',
    properties: {
      id_corte:          { type: 'integer', example: 7 },
      estado:            { type: 'string',  enum: ['abierto', 'cerrado'] },
      fondo_inicial:     { type: 'number',  example: 500.00 },
      fecha_apertura:    { type: 'string',  format: 'date-time' },
      fecha_cierre:      { type: 'string',  format: 'date-time', nullable: true },
      total_ventas:      { type: 'number',  example: 3200.00 },
      total_devoluciones:{ type: 'number',  example: 150.00 },
      efectivo_esperado: { type: 'number',  example: 3550.00 },
      efectivo_contado:  { type: 'number',  example: 3550.00 },
      diferencia:        { type: 'number',  example: 0.00 },
      nota_diferencia:   { type: 'string',  nullable: true },
    },
  },
  AbrirCajaRequest: {
    type: 'object',
    required: ['initialFund'],
    properties: {
      initialFund: { type: 'number', example: 500.00, minimum: 0 },
    },
  },
  CerrarCajaRequest: {
    type: 'object',
    required: ['cashCounted'],
    properties: {
      cashCounted: { type: 'number', example: 3550.00, minimum: 0 },
      note:        { type: 'string', example: 'Sin diferencias en el turno' },
    },
  },
  CorteCajaDetalle: {
    allOf: [
      { $ref: '#/components/schemas/CorteCaja' },
      {
        type: 'object',
        properties: {
          ventas: {
            type: 'array',
            items: { $ref: '#/components/schemas/VentaResumen' },
          },
        },
      },
    ],
  },

  // ── Ventas ─────────────────────────────────────────────────────────────────
  VentaResumen: {
    type: 'object',
    properties: {
      id_venta:   { type: 'integer', example: 34 },
      folio:      { type: 'string',  example: 'V-000034' },
      total:      { type: 'number',  example: 180.00 },
      fecha_venta:{ type: 'string',  format: 'date-time' },
      estado:     { type: 'string',  enum: ['completada', 'devuelta_parcial', 'cancelada'] },
    },
  },
  VentaCompleta: {
    type: 'object',
    properties: {
      id_venta:        { type: 'integer', example: 34 },
      folio:           { type: 'string',  example: 'V-000034' },
      subtotal:        { type: 'number',  example: 200.00 },
      descuento:       { type: 'number',  example: 20.00 },
      total:           { type: 'number',  example: 180.00 },
      monto_recibido:  { type: 'number',  example: 200.00 },
      cambio:          { type: 'number',  example: 20.00 },
      fecha_venta:     { type: 'string',  format: 'date-time' },
      estado:          { type: 'string',  example: 'completada' },
      detalle: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id_detalle:    { type: 'integer', example: 1 },
            id_producto:   { type: 'integer', example: 5 },
            nombre:        { type: 'string',  example: 'Cuaderno universitario' },
            cantidad:      { type: 'integer', example: 2 },
            precio_unitario:{ type: 'number', example: 45.00 },
            subtotal:      { type: 'number',  example: 90.00 },
          },
        },
      },
    },
  },
  CreateVentaRequest: {
    type: 'object',
    required: ['items', 'amountReceived'],
    properties: {
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'integer', example: 5 },
            quantity:  { type: 'integer', example: 2, minimum: 1 },
          },
        },
      },
      amountReceived:       { type: 'number',  example: 200.00 },
      discountPercent:      { type: 'number',  example: 10, minimum: 0, maximum: 100 },
      discountAmount:       { type: 'number',  example: 20.00 },
      discountAuthUsername: { type: 'string',  example: 'admin', description: 'Requerido si el descuento supera el umbral' },
      discountAuthPassword: { type: 'string',  format: 'password', description: 'Requerido si el descuento supera el umbral' },
    },
  },
  CreateDevolucionRequest: {
    type: 'object',
    required: ['saleFolio', 'items'],
    properties: {
      saleFolio: { type: 'string', example: 'V-000034' },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['saleDetailId', 'quantity'],
          properties: {
            saleDetailId: { type: 'integer', example: 1 },
            quantity:     { type: 'integer', example: 1, minimum: 1 },
          },
        },
      },
      note: { type: 'string', example: 'Producto defectuoso' },
    },
  },
};

// ─── Spec OpenAPI 3.0 ─────────────────────────────────────────────────────────
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'TPV Papelería — API REST',
    version: '1.0.0',
    description: `
## Sistema de Punto de Venta para Papelería

API REST para gestión de ventas, inventario, caja y usuarios.

### Autenticación
Todos los endpoints (excepto \`/health\` y \`/auth/login\`) requieren un **JWT Bearer token**.

\`\`\`
Authorization: Bearer <token>
\`\`\`

### Roles
| Rol | Permisos |
|-----|----------|
| \`administrador\` | Acceso total |
| \`cajero\` | Ventas, devoluciones, apertura/cierre de caja |

### Códigos de error comunes
| Código | Significado |
|--------|-------------|
| 400 | Datos inválidos o regla de negocio violada |
| 401 | Token ausente, expirado o inválido |
| 403 | Sin permisos para esta operación |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej. caja ya abierta) |
| 500 | Error interno del servidor |
    `,
    contact: { name: 'ITH — Curso Desarrollo Asistido IA', email: 'jose.rodriguezp@hermosillo.tecnm.mx' },
  },
  servers: [
    { url: 'http://localhost:4000/api', description: 'Desarrollo local' },
  ],
  components: {
    securitySchemes: bearerAuth,
    schemas,
    responses: {
      Unauthorized: {
        description: 'Token ausente o inválido',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Token requerido' } } },
      },
      Forbidden: {
        description: 'Sin permisos para esta operación',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Acceso denegado' } } },
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      InternalError: {
        description: 'Error interno del servidor',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Error interno del servidor' } } },
      },
    },
  },
  security: [{ bearerAuth: [] }],

  paths: {
    // ── Health ──────────────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Verificar estado del servidor',
        description: 'Endpoint público para confirmar que el servidor está en línea.',
        security: [],
        responses: {
          200: {
            description: 'Servidor operativo',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } } } },
              },
            },
          },
        },
      },
    },

    // ── Auth ────────────────────────────────────────────────────────────────
    '/auth/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar sesión',
        description: 'Autentica un usuario y devuelve un JWT con expiración de 12 horas.',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: {
            description: 'Login exitoso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          400: { description: 'Usuario o contraseña no proporcionados', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Usuario y contraseña requeridos' } } } },
          401: { description: 'Credenciales incorrectas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Credenciales inválidas' } } } },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ── Usuarios ────────────────────────────────────────────────────────────
    '/users': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios',
        description: 'Devuelve todos los usuarios registrados. **Requiere rol administrador.**',
        responses: {
          200: {
            description: 'Lista de usuarios',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } } } } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario',
        description: 'Crea un nuevo usuario cajero o administrador. **Requiere rol administrador.**',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } } },
        },
        responses: {
          201: {
            description: 'Usuario creado',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Usuario' } } } } },
          },
          400: { description: 'Datos inválidos o username duplicado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/users/{id}': {
      patch: {
        tags: ['Usuarios'],
        summary: 'Actualizar usuario',
        description: 'Actualiza nombre, rol, contraseña o estado activo. Solo se actualizan los campos enviados. **Requiere rol administrador.**',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } },
        },
        responses: {
          200: { description: 'Usuario actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Usuario' } } } } } },
          400: { description: 'Rol inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ── Productos ───────────────────────────────────────────────────────────
    '/products': {
      get: {
        tags: ['Productos'],
        summary: 'Buscar / listar productos',
        description: 'Sin parámetros devuelve todos los productos activos. Con `q` busca por nombre o código. Con `codigo` busca por código de barras exacto.',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, example: 'cuaderno', description: 'Búsqueda por nombre, código de barras o código interno' },
          { name: 'codigo', in: 'query', schema: { type: 'string' }, example: '7501000123456', description: 'Código de barras exacto' },
        ],
        responses: {
          200: { description: 'Lista de productos', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Producto' } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
      post: {
        tags: ['Productos'],
        summary: 'Crear producto',
        description: 'Registra un nuevo producto con stock inicial. Se requiere al menos código de barras o código interno. **Requiere rol administrador.**',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductRequest' } } },
        },
        responses: {
          201: { description: 'Producto creado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Producto' } } } } } },
          400: { description: 'Campos obligatorios faltantes o precio inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Debe proporcionar codigo de barras o codigo interno' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/products/{id}': {
      patch: {
        tags: ['Productos'],
        summary: 'Actualizar producto',
        description: 'Actualiza los campos enviados. Si cambia `salePrice`, registra historial de precio automáticamente. **Requiere rol administrador.**',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 5 }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProductRequest' } } } },
        responses: {
          200: { description: 'Producto actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Producto' } } } } } },
          400: { description: 'Precio inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/products/{id}/deactivate': {
      patch: {
        tags: ['Productos'],
        summary: 'Desactivar producto',
        description: 'Marca el producto como inactivo. No aparece en búsquedas de venta. **Requiere rol administrador.**',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 5 }],
        responses: {
          200: { description: 'Producto desactivado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Producto' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ── Inventario ──────────────────────────────────────────────────────────
    '/inventory/{productId}': {
      get: {
        tags: ['Inventario'],
        summary: 'Consultar stock de un producto',
        description: 'Devuelve el stock actual, mínimo y si está en nivel bajo.',
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' }, example: 5 }],
        responses: {
          200: { description: 'Stock del producto', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/StockInfo' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/inventory/{productId}/movements': {
      get: {
        tags: ['Inventario'],
        summary: 'Historial de movimientos de un producto',
        description: 'Lista entradas, salidas por venta, devoluciones y ajustes. Filtrable por rango de fechas.',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'integer' }, example: 5 },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-07-01' },
          { name: 'to',   in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-07-31' },
        ],
        responses: {
          200: { description: 'Lista de movimientos', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/MovimientoInventario' } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/inventory/entries': {
      post: {
        tags: ['Inventario'],
        summary: 'Registrar entrada de mercancía',
        description: 'Incrementa el stock del producto. Registra el movimiento con proveedor y número de factura. **Requiere rol administrador.**',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EntradaRequest' } } } },
        responses: {
          201: {
            description: 'Entrada registrada',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { previousStock: { type: 'integer', example: 70 }, resultingStock: { type: 'integer', example: 120 } } } } } } },
          },
          400: { description: 'Cantidad inválida o producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/inventory/adjustments': {
      post: {
        tags: ['Inventario'],
        summary: 'Ajuste de inventario',
        description: 'Aplica un delta (positivo o negativo) al stock. El campo `quantity` es la **diferencia**, no el valor final. Si el resultado sería negativo, enviar `confirm: true`. **Requiere rol administrador.**',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AjusteRequest' } } } },
        responses: {
          201: {
            description: 'Ajuste aplicado',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { previousStock: { type: 'integer', example: 120 }, resultingStock: { type: 'integer', example: 117 } } } } } } },
          },
          400: { description: 'Cantidad cero o motivo faltante', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { description: 'El ajuste resultaría en stock negativo (enviar confirm: true para forzar)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ── Caja ────────────────────────────────────────────────────────────────
    '/cash-register/open': {
      post: {
        tags: ['Caja'],
        summary: 'Abrir caja (inicio de turno)',
        description: 'Registra el fondo inicial del turno. Solo puede haber una caja abierta a la vez.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AbrirCajaRequest' } } } },
        responses: {
          201: { description: 'Caja abierta', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/CorteCaja' } } } } } },
          400: { description: 'Fondo inicial inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          409: { description: 'Ya existe una caja abierta', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Ya existe una caja abierta para este turno' } } } },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/cash-register/current': {
      get: {
        tags: ['Caja'],
        summary: 'Obtener caja abierta actual',
        description: 'Devuelve los datos del turno en curso. Error 404 si no hay caja abierta.',
        responses: {
          200: { description: 'Caja en turno', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/CorteCaja' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { description: 'No hay ninguna caja abierta', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'No hay ninguna caja abierta' } } } },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/cash-register/{id}/close': {
      patch: {
        tags: ['Caja'],
        summary: 'Cerrar caja (corte de turno)',
        description: 'Registra el efectivo contado, calcula ventas, devoluciones, efectivo esperado y diferencia.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'id_corte de la caja a cerrar', example: 7 }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CerrarCajaRequest' } } } },
        responses: {
          200: { description: 'Caja cerrada', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { allOf: [{ $ref: '#/components/schemas/CorteCaja' }, { type: 'object', properties: { status: { type: 'string', enum: ['exacto', 'sobrante', 'faltante'], example: 'exacto' } } }] } } } } } },
          400: { description: 'Efectivo contado inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'La caja ya está cerrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/cash-register/history': {
      get: {
        tags: ['Caja'],
        summary: 'Historial de cortes',
        description: 'Lista todos los cortes cerrados ordenados por fecha descendente. **Requiere rol administrador.**',
        responses: {
          200: { description: 'Lista de cortes', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/CorteCaja' } } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/cash-register/{id}': {
      get: {
        tags: ['Caja'],
        summary: 'Detalle de un corte',
        description: 'Devuelve el corte con el listado de todas las ventas del turno. **Requiere rol administrador.**',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 7 }],
        responses: {
          200: { description: 'Detalle del corte', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/CorteCajaDetalle' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },

    // ── Ventas ──────────────────────────────────────────────────────────────
    '/sales': {
      post: {
        tags: ['Ventas'],
        summary: 'Registrar venta',
        description: `
Cobra una venta en caja. Requiere caja abierta.

**Descuentos:**
- \`discountPercent\`: porcentaje (0–100)
- \`discountAmount\`: monto fijo en pesos
- Si el descuento supera el umbral configurado (default 20%), se requiere \`discountAuthUsername\` y \`discountAuthPassword\` de un administrador

**Stock:** verifica y descuenta automáticamente el inventario de cada producto.
        `,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateVentaRequest' } } } },
        responses: {
          201: {
            description: 'Venta registrada exitosamente',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/VentaCompleta' } } } } },
          },
          400: {
            description: 'Error de negocio: lista vacía, stock insuficiente, monto insuficiente, caja cerrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, examples: {
              sinProductos:   { value: { success: false, error: 'La venta debe incluir al menos un producto' } },
              stockInsuficiente: { value: { success: false, error: 'Stock insuficiente para Cuaderno. Disponible: 3' } },
              montoInsuficiente: { value: { success: false, error: 'Monto insuficiente' } },
              sinCaja:        { value: { success: false, error: 'Debe abrir la caja antes de realizar ventas' } },
            } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { description: 'Producto no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/sales/{folio}': {
      get: {
        tags: ['Ventas'],
        summary: 'Consultar venta por folio',
        description: 'Obtiene el detalle completo de una venta incluyendo sus renglones.',
        parameters: [{ name: 'folio', in: 'path', required: true, schema: { type: 'string' }, example: 'V-000034' }],
        responses: {
          200: { description: 'Venta encontrada', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/VentaCompleta' } } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { description: 'Folio no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, error: 'Folio de venta no encontrado' } } } },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/sales/returns': {
      post: {
        tags: ['Ventas'],
        summary: 'Registrar devolución',
        description: `
Procesa la devolución parcial o total de una venta.

**Reglas:**
- Solo se permiten devoluciones del día actual o del día anterior
- La cantidad a devolver no puede superar lo disponible (vendido − ya devuelto)
- Requiere caja abierta
- El inventario se incrementa automáticamente
        `,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDevolucionRequest' } } } },
        responses: {
          201: {
            description: 'Devolución registrada',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { id_devolucion: { type: 'integer', example: 3 }, total_devuelto: { type: 'number', example: 45.00 } } } } } } },
          },
          400: {
            description: 'Error de negocio',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, examples: {
              fueraDePlazo:     { value: { success: false, error: 'Solo se pueden devolver ventas del día actual o del día anterior' } },
              cantidadExcedida: { value: { success: false, error: 'Cantidad a devolver excede lo disponible. Disponible: 1' } },
              sinCaja:          { value: { success: false, error: 'Debe abrir la caja antes de registrar devoluciones' } },
            } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { description: 'Folio de venta no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          500: { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
