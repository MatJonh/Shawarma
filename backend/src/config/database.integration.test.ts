
import { describe, it, expect, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Integración con PostgreSQL", () => {

  it("debe conectarse correctamente a PostgreSQL", async () => {
    const result = await prisma.$queryRaw<
      Array<{ resultado: number }>
    >`SELECT 1 AS resultado`;

    expect(result[0].resultado).toBe(1);
  });

  it("debe consultar la tabla de usuarios", async () => {
    const totalUsuarios = await prisma.user.count();

    expect(totalUsuarios).toBeGreaterThanOrEqual(0);
  });

  it("debe consultar la tabla de productos", async () => {
    const totalProductos = await prisma.product.count();

    expect(totalProductos).toBeGreaterThanOrEqual(0);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

});
