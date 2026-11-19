import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { auth, roles } from "../../middleware/auth";
import { audit } from "../audit/audit.service";
import { Payment } from "@prisma/client";


// la variable r o es el objeto que tiene las rutas de pago
const r = Router();

// controles a las rutas de auth y roles
r.use(auth, roles("ADMIN", "CASHIER"));

//INICIO DE METODO GET
r.get("/", async (_q, res, next) => {
  try {
    res.json(
      await prisma.payment.findMany({
        include: { order: true, recorder: { select: { fullName: true } } },
        orderBy: { recordedAt: "desc" },
        take: 200,
      }),
    );
  } catch (e) {
    next(e);
  }
});
// FIN DE METODO GET

// INCIO DE METODO POST
r.post("/", async (req, res, next) => {
  try {
    const d = z
      .object({
        orderId: z.number().int().positive(),



        method: z.enum(["CASH", "ELECTRONIC",  ]), // Tarjetas de credito, transferencias bancarias o billetera digital.



        amount: z.number().positive(),
        referenceNote: z.string().optional(),
      })
      .parse(req.body);

    const p = await prisma.$transaction(async (tx) => {

      const o = await tx.order.findUnique({
        where: { id: d.orderId },
        include: { items: true, payments: true },

        
      });

      if (!o) throw new Error("Pedido no encontrado");

      if (["CANCELLED", "DELIVERED"].includes(o.status))
        throw new Error("Pedido finalizado");

      // inicio Calidad funcional
      const 
      total = o.items.reduce(
          (s, i) => s + Number(i.unitPrice) * i.quantity,
          0,
        ),

        paid = o.payments
          .filter((x) => x.status === "RECORDED")
          .reduce((s, x) => s + Number(x.amount), 0);

      if (paid + d.amount > total + 0.001)
        throw new Error("El pago supera el saldo pendiente");
      // fin calidad funcional

      return tx.payment.create({
        data: {
          orderId: d.orderId,
          method: d.method,
          amount: d.amount,
          referenceNote: d.referenceNote,
          recordedById: req.user!.id,
        },
      });

    });
    
    await audit(
        req.user?.id, 
        "PAYMENT_RECORDED", 
        "Payment", 
        String(p.id)
    );

    res.status(201).json(p);

  } catch (e) 
  
  {
    next(e);
  }

});
// FIN DE METODO POST


// INICIO DEL PATCH
r.patch("/:id/void", roles("ADMIN"), async (req, res, next) => {
  try {
    const p = await prisma.payment.update({
      where: { id: Number(req.params.id) },
      data: { status: "VOIDED" },
    });


    await audit(
        req.user?.id, 
        "PAYMENT_VOIDED", 
        "Payment", 
        String(p.id)
    );

    res.json(p);
  } catch (e) {
    next(e);
  }
});

export default r;



interface PaymentRepository {
    findById(id: number): Promise<Payment  | null>;

    }

    