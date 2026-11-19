import { PrismaClient, OrderMode, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Crear el rol ADMIN
  const role = await prisma.role.upsert({
    where: { code: "ADMIN" },
    update: { name: "Administrador" },
    create: {
      code: "ADMIN",
      name: "Administrador",
    },
  });

  // 2. Crear el usuario administrador
  const passwordHash = await bcrypt.hash("Admin123!", 10);

  const user = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      fullName: "Administrador de Prueba",
      passwordHash,
      isActive: true,
    },
    create: {
      fullName: "Administrador de Prueba",
      username: "admin",
      passwordHash,
    },
  });

  // 3. Asignar el rol ADMIN al usuario
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      roleId: role.id,
    },
  });

  // 4. Crear una categoría
  const category = await prisma.category.upsert({
    where: { name: "Bebidas" },
    update: {},
    create: {
      name: "Bebidas",
      description: "Categoría para pruebas de integración",
    },
  });

  // 5. Crear un producto de Q50
  const product = await prisma.product.upsert({
    where: {
      categoryId_name: {
        categoryId: category.id,
        name: "Agua de Prueba",
      },
    },
    update: {
      currentPrice: 50,
      isAvailable: true,
      isActive: true,
    },
    create: {
      categoryId: category.id,
      name: "Agua de Prueba",
      description: "Producto para pruebas",
      currentPrice: 50,
    },
  });

  // 6. Crear un pedido de prueba si todavía no existe
  let order = await prisma.order.findFirst({
    where: {
      createdById: user.id,
      notes: "PEDIDO PARA PRUEBA DE INTEGRACION",
    },
  });

  if (!order) {
    order = await prisma.order.create({
      data: {
        mode: OrderMode.TAKEAWAY,
        status: OrderStatus.REGISTERED,
        createdById: user.id,
        notes: "PEDIDO PARA PRUEBA DE INTEGRACION",
      },
    });
  }

  // 7. Crear el detalle del pedido si todavía no existe
  const existingItem = await prisma.orderItem.findFirst({
    where: {
      orderId: order.id,
      productId: product.id,
    },
  });

  if (!existingItem) {
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        unitPrice: 50,
        notes: "Producto de prueba",
      },
    });
  }

  console.log("================================");
  console.log("DATOS DE PRUEBA CREADOS");
  console.log("================================");
  console.log("Usuario:", user.username);
  console.log("Rol:", role.code);
  console.log("Producto:", product.name);
  console.log("ID del pedido:", order.id);
  console.log("Total del pedido: Q50.00");
  console.log("================================");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });