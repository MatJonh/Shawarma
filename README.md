# Restaurante Shawarma
MVP educativo: React + TypeScript + Vite, Express + TypeScript, Prisma y PostgreSQL.

## Funciones
Autenticación JWT, roles, categorías/productos, pedidos y estados, cocina, pagos, entregas, incidencias, reportes y auditoría.

## Inicio rápido
1. Copia `.env.example` a `.env` y cambia `JWT_SECRET` y la contraseña de PostgreSQL.
2. Levanta PostgreSQL: `docker compose up -d db`.
3. Backend: `cd backend && npm install && npx prisma generate && npx prisma migrate dev --name init && npm run seed && npm run dev`.
4. Frontend en otra terminal: `cd frontend && npm install && npm run dev`.
5. Abre `http://localhost:5173`. API: `http://localhost:4000/health`.

Usuario inicial del seed: `admin` / `Admin123!`. Cámbialo antes de cualquier despliegue real.

## Nota
Base funcional educativa, no certificada para producción. Antes de producción agregar pruebas automatizadas, rate limiting, política robusta de sesiones, gestión de secretos, backups/restauración probados, monitoreo y revisión de concurrencia en pagos.
# Shawarma
