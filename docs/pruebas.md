# Plan de pruebas
- Login válido: token devuelto.
- Login inválido: HTTP 401.
- Sin token: rutas protegidas rechazan acceso.
- Producto con precio negativo: validación rechaza.
- Pedido sin detalles o producto no disponible: rechazo.
- Pago mayor al saldo: rechazo.
- Entrega sin pago completo o antes de READY: rechazo.
- Cancelación sin motivo: rechazo.
- Cambio de estado: historial registrado.
- Usuario sin rol ADMIN intenta crear producto: HTTP 403.
- Reportes/auditoría con rol no autorizado: HTTP 403.

Recomendación Cabrera: añadir pruebas unitarias, integración con PostgreSQL, concurrencia de pagos, seguridad y restauración de respaldos.
