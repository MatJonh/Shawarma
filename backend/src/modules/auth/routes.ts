import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { auth } from "../../middleware/auth";
const r = Router();
r.post("/login", async (req, res, next) => {
  try {
    const d = z
      .object({ username: z.string().min(1), password: z.string().min(1) })
      .parse(req.body);
    const u = await prisma.user.findUnique({
      where: { username: d.username },
      include: { roles: { include: { role: true } } },
    });
    if (
      !u ||
      !u.isActive ||
      !(await bcrypt.compare(d.password, u.passwordHash))
    )
      return res.status(401).json({ error: "Credenciales incorrectas" });
    const roleCodes = u.roles.map((x) => x.role.code);
    const token = jwt.sign(
      { id: u.id, username: u.username, roles: roleCodes },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "8h") as any },
    );
    res.json({
      token,
      user: {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        roles: roleCodes,
      },
    });
  } catch (e) {
    next(e);
  }
});
r.get("/me", auth, async (req, res) => {
  const u = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, username: true, fullName: true },
  });
  res.json(u);
});
export default r;
