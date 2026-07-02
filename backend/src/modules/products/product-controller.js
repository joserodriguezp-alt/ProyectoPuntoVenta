// Controller del catalogo de productos
const ApiError = require('../../utils/api-error');
const productService = require('./product-service');

async function create(req, res) {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al crear producto:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function search(req, res) {
  try {
    const { codigo, q } = req.query;

    if (codigo) {
      const product = await productService.getByBarcode(codigo);
      return res.status(200).json({ success: true, data: product ? [product] : [] });
    }

    const products = await productService.searchProducts(q);
    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    console.error('Error al buscar productos:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body, req.user.id);
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al actualizar producto:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

async function deactivate(req, res) {
  try {
    const { id } = req.params;
    const product = await productService.deactivateProduct(id);
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    console.error('Error al desactivar producto:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

module.exports = { create, search, update, deactivate };
