export function calculateBalance(
  total: number,
  paid: number
): number {
  if (total < 0 || paid < 0) {
    throw new Error("Los valores no pueden ser negativos");
  }

  if (paid > total) {
    throw new Error("El pago supera el total");
  }

  return Number((total - paid).toFixed(2));
}

