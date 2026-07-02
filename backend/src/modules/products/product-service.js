// Logica de negocio del catalogo de productos (HU-01 a HU-04)
const ApiError = require('../../utils/api-error');
const productRepository = require('./product-repository');

async function createProduct(data) {
  const { name, categoryId, salePrice, costPrice, unit, initialStock, minStock } = data;

  if (!name || !categoryId || salePrice === undefined || costPrice === undefined || !unit) {
    throw new ApiError(400, 'Nombre, categoria, precio de venta, precio de costo y unidad de medida son obligatorios');
  }

  if (Number(salePrice) <= 0) {
    throw new ApiError(400, 'El precio debe ser mayor a cero');
  }

  if (Number(costPrice) < 0) {
    throw new ApiError(400, 'El precio de costo no puede ser negativo');
  }

  if (!data.barcode && !data.internalCode) {
    throw new ApiError(400, 'Debe proporcionar codigo de barras o codigo interno');
  }

  return productRepository.create({
    ...data,
    initialStock: Number(initialStock) || 0,
    minStock: Number(minStock) || 0
  });
}

async function searchProducts(term) {
  if (!term) {
    return productRepository.listAll();
  }
  return productRepository.search(term);
}

async function getByBarcode(barcode) {
  return productRepository.findByBarcode(barcode);
}

// Actualiza un producto; si cambia el precio de venta, registra el historial
async function updateProduct(id, data, userId) {
  if (data.salePrice !== undefined && Number(data.salePrice) <= 0) {
    throw new ApiError(400, 'El precio debe ser mayor a cero');
  }
  if (data.costPrice !== undefined && Number(data.costPrice) < 0) {
    throw new ApiError(400, 'El precio de costo no puede ser negativo');
  }

  const current = await productRepository.findById(id);
  if (!current) {
    throw new ApiError(404, 'Producto no encontrado');
  }

  const updated = await productRepository.update(id, data);

  const priceChanged =
    data.salePrice !== undefined && Number(data.salePrice) !== Number(current.precio_venta);

  if (priceChanged) {
    await productRepository.insertPriceHistory({
      productId: id,
      oldPrice: current.precio_venta,
      newPrice: data.salePrice,
      userId
    });
  }

  return updated;
}

async function deactivateProduct(id) {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new ApiError(404, 'Producto no encontrado');
  }

  return productRepository.deactivate(id);
}

module.exports = { createProduct, searchProducts, getByBarcode, updateProduct, deactivateProduct };
