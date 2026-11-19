import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/routes";
import productRoutes from "./modules/products/routes";
import orderRoutes from "./modules/orders/routes";
import paymentRoutes from "./modules/payments/routes";
import reportRoutes from "./modules/reports/routes";
import incidentRoutes from "./modules/incidents/routes";
import auditRoutes from "./modules/audit/routes";
import categoryRoutes from "./modules/categories/routes";
import userRoutes from "./modules/users/routes";
import deliveryRoutes from "./modules/deliveries/routes";
export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/health", (_q, r) => r.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/audit", auditRoutes);
app.use((_q, r) => r.status(404).json({ error: "Ruta no encontrada" }));
app.use((e: any, _q: any, r: any, _n: any) => {
  console.error(e);
  r.status(e.status || 500).json({ error: e.message || "Error interno" });
});

app.get("/", (_req, res) => {
  res.json({
    message: "Restaurante Shawarma API",
    status: "online",
    version: "1.0.0",
    documentation: "API en funcionamiento"
  });
});