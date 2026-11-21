import { describe, it, expect } from "vitest";

describe("Prueba inicial del frontend Shawarma", () => {

  it("debe comprobar que el sistema está funcionando", () => {
    expect(1 + 1).toBe(2);
  });

  it("debe comprobar el nombre del restaurante", () => {
    expect("Shawarma").toBe("Shawarma");
  });

});