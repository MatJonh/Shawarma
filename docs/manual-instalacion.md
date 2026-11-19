# Manual de instalación
1. Instale Node.js 20+, npm y PostgreSQL o Docker.
2. Copie `.env.example` como `.env` en la raíz y edite credenciales.
3. Levante la base: `docker compose up -d db`.
4. En `backend`: `npm install`, `npx prisma generate`, `npx prisma migrate dev --name init`, `npm run seed`, `npm run dev`.
5. En `frontend`: `npm install`, `npm run dev`.
6. Abra http://localhost:5173. API http://localhost:4000/health.
Para cambios del esquema, genere y versione migraciones Prisma.
