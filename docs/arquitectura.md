# Arquitectura
React/TypeScript → API REST Express → Prisma → PostgreSQL. JWT Bearer para autenticación; bcrypt para contraseñas; Zod para validación; transacciones para creación de pedidos y cambios de estado.

## Endpoints
POST `/api/auth/login`; GET `/api/auth/me`; GET/POST/PATCH `/api/products`; GET/POST/PATCH `/api/orders`; GET/POST/PATCH `/api/payments`; GET `/api/reports/summary`; GET `/api/reports/sales-by-day`; GET/POST/PATCH `/api/incidents`; GET `/api/audit`.

## Estados
REGISTERED → PREPARING → READY → DELIVERED. REGISTERED/PREPARING pueden cancelarse con motivo. La entrega exige pago completo.

## Producción
El ejemplo simplifica la autorización y guarda el JWT en localStorage. Para producción se recomienda revisión de seguridad, rate limiting, gestión segura de sesión, HTTPS, protección XSS/CSRF según el mecanismo elegido, monitoreo y pruebas de concurrencia.
