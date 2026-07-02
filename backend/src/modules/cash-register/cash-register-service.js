// Logica de negocio de apertura y corte de caja (HU-14 a HU-16)
const ApiError = require('../../utils/api-error');
const cashRegisterRepository = require('./cash-register-repository');

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

async function openRegister({ userId, initialFund }) {
  if (initialFund === undefined || Number(initialFund) < 0) {
    throw new ApiError(400, 'El fondo inicial debe ser un monto valido');
  }

  const existingOpen = await cashRegisterRepository.findOpen();
  if (existingOpen) {
    throw new ApiError(409, 'Ya existe una caja abierta para este turno');
  }

  return cashRegisterRepository.create({ userId, initialFund: round2(initialFund) });
}

async function getCurrentOpen() {
  const open = await cashRegisterRepository.findOpen();
  if (!open) {
    throw new ApiError(404, 'No hay ninguna caja abierta');
  }
  return open;
}

async function closeRegister({ id, cashCounted, note }) {
  if (cashCounted === undefined || Number(cashCounted) < 0) {
    throw new ApiError(400, 'El efectivo contado debe ser un monto valido');
  }

  const register = await cashRegisterRepository.findById(id);
  if (!register) {
    throw new ApiError(404, 'Corte de caja no encontrado');
  }
  if (register.estado === 'cerrado') {
    throw new ApiError(403, 'El corte de caja ya esta cerrado y no puede modificarse');
  }

  const totalSales = await cashRegisterRepository.sumSalesByRegister(id);
  const totalReturns = await cashRegisterRepository.sumReturnsByRegister(id);
  const expectedCash = round2(Number(register.fondo_inicial) + totalSales - totalReturns);
  const difference = round2(Number(cashCounted) - expectedCash);

  const closed = await cashRegisterRepository.close(id, {
    totalSales: round2(totalSales),
    totalReturns: round2(totalReturns),
    expectedCash,
    cashCounted: round2(cashCounted),
    difference,
    note
  });

  return {
    ...closed,
    status: difference === 0 ? 'exacto' : difference > 0 ? 'sobrante' : 'faltante'
  };
}

async function listHistory() {
  return cashRegisterRepository.listHistory();
}

async function getDetail(id) {
  const register = await cashRegisterRepository.findById(id);
  if (!register) {
    throw new ApiError(404, 'Corte de caja no encontrado');
  }
  const sales = await cashRegisterRepository.listSalesByRegister(id);
  return { ...register, ventas: sales };
}

module.exports = { openRegister, getCurrentOpen, closeRegister, listHistory, getDetail };
