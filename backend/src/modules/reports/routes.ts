import { Router } from "express";
import { auth, roles } from "../../middleware/auth";
import { prisma } from "../../config/prisma";

const r = Router();

r.use(auth, roles("ADMIN", "OWNER"));

r.get("/summary", async (_q, res, next) => {
  try {
    const [orders, payments, products, incidents] = await Promise.all([
      prisma.order.count(),
      prisma.payment.aggregate({
        where: { status: "RECORDED" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.paymentIncident.count({
        where: { status: { in: ["OPEN", "IN_REVIEW"] } },
      }),
    ]);
    res.json({
      orders,
      recordedPayments: Number(payments._sum.amount || 0),
      paymentCount: payments._count,
      activeProducts: products,
      openIncidents: incidents,
    });
  } catch (e) {
    next(e);
  }
});
r.get("/sales-by-day", async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 7), 1), 90),
      from = new Date();
    from.setDate(from.getDate() - days);
    const ps = await prisma.payment.findMany({
      where: { status: "RECORDED", recordedAt: { gte: from } },
      select: { amount: true, recordedAt: true },
    });
    const m = new Map<string, number>();
    for (const p of ps) {
      const k = p.recordedAt.toISOString().slice(0, 10);
      m.set(k, (m.get(k) || 0) + Number(p.amount));
    }
    res.json(
      [...m]
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB) )
      .map(([date, total]) => ({ date, total })));
  } catch (e) {
    next(e);
  }
});
export default r;
