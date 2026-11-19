import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { auth, roles } from "../../middleware/auth";
const r = Router();
r.use(auth, roles("ADMIN"));
r.get("/", async (_q, res, next) => {
  try {
    const us = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        username: true,
        isActive: true,
        createdAt: true,
        roles: { include: { role: true } },
      },
      orderBy: { id: "desc" },
    });
    res.json(us.map((u) => ({ ...u, roles: u.roles.map((x) => x.role.code) })));
  } catch (e) {
    next(e);
  }
});
r.post("/", async (req, res, next) => {
  try {
    const d = z
      .object({
        fullName: z.string().min(2),
        username: z.string().min(3),
        password: z.string().min(8),
        roleCode: z.string().default("CASHIER"),
      })
      .parse(req.body);
    const role = await prisma.role.findUnique({ where: { code: d.roleCode } });
    if (!role) return res.status(400).json({ error: "Rol desconocido" });
    const u = await prisma.user.create({
      data: {
        fullName: d.fullName,
        username: d.username,
        passwordHash: await bcrypt.hash(d.password, 12),
        roles: { create: { roleId: role.id } },
      },
      select: { id: true, fullName: true, username: true, isActive: true },
    });
    res.status(201).json(u);
  } catch (e) {
    next(e);
  }
});
r.patch("/:id/active", async (req, res, next) => {
  try {
    const d = z.object({ isActive: z.boolean() }).parse(req.body);
    if (Number(req.params.id) === req.user!.id && !d.isActive)
      return res
        .status(400)
        .json({ error: "No puede desactivarse a sí mismo" });
    res.json(
      await prisma.user.update({
        where: { id: Number(req.params.id) },
        data: { isActive: d.isActive },
        select: { id: true, username: true, isActive: true },
      }),
    );
  } catch (e) {
    next(e);
  }
});
export default r;
