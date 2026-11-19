import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { auth, roles } from "../../middleware/auth";
import { audit } from "../audit/audit.service";
const r = Router();
r.get("/", async (req, res, next) => {
  try {
    res.json(
      await prisma.product.findMany({
        where: req.query.all === "true" ? {} : { isActive: true },
        include: { category: true },
        orderBy: { name: "asc" },
      }),
    );
  } catch (e) {
    next(e);
  }
});
r.post("/", auth, roles("ADMIN"), async (req, res, next) => {
  try {
    const d = z
      .object({
        categoryId: z.number().int().positive(),
        name: z.string().min(2),
        description: z.string().optional(),
        currentPrice: z.number().nonnegative(),
      })
      .parse(req.body);
    const p = await prisma.product.create({ data: d });
    await audit(req.user?.id, "PRODUCT_CREATED", "Product", String(p.id));
    res.status(201).json(p);
  } catch (e) {
    next(e);
  }
});
r.patch("/:id", auth, roles("ADMIN"), async (req, res, next) => {
  try {
    const d = z
      .object({
        name: z.string().min(2).optional(),
        categoryId: z.number().int().positive().optional(),
        description: z.string().optional(),
        currentPrice: z.number().nonnegative().optional(),
        isActive: z.boolean().optional(),
        isAvailable: z.boolean().optional(),
      })
      .parse(req.body);
    res.json(
      await prisma.product.update({
        where: { id: Number(req.params.id) },
        data: d,
      }),
    );
  } catch (e) {
    next(e);
  }
});
export default r;
