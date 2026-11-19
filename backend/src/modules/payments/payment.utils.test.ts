import { describe, it, expect } from "vitest";
import { calculateBalance } from "./payment.utils";

describe("calculateBalance", () => {

  it("debe calcular correctamente el saldo pendiente", () => {
    expect(calculateBalance(150, 50)).toBe(100);
  });

  it("debe devolver cero cuando el pedido está pagado", () => {
    expect(calculateBalance(100, 100)).toBe(0);
  });

  it("debe devolver el total cuando no existen pagos", () => {
    expect(calculateBalance(200, 0)).toBe(200);
  });

  it("debe rechazar valores negativos", () => {
    expect(() => calculateBalance(-100, 50))
      .toThrow("Los valores no pueden ser negativos");
  });

  it("debe rechazar pagos superiores al total", () => {
    expect(() => calculateBalance(100, 120))
      .toThrow("El pago supera el total");
  });

  // Ciclo Red-Green-Refactor
    //it("debe calcular el saldo pendiente", () => {
   // expect(calculateBalance(150, 50)).toBe(100);
   // });



});






// "test:watch": "vitest" / "test:coverage": "vitest run --coverage" 