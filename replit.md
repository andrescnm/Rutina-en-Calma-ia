# Rutina Simple - Marketplace de Cuidado Personal

## Descripción del Proyecto
Marketplace multi-vendedor para productos de cuidado personal en Colombia con:
- Ranking inteligente de vendedores
- Pagos divididos vía Stripe Connect
- Sistema de recomendaciones conversacionales (quiz)
- Panel de administración completo
- Recuperación de contraseñas

## Configuración Importante

### Precios y Moneda
- Todos los precios se muestran en COP (pesos colombianos)
- IVA del 19% incluido en todos los precios
- Formato: "$XX,XXX COP IVA incl. (19%)"

### Idioma
- Todo el texto de la aplicación debe estar en español colombiano

### Email (Pendiente de Configuración) ⚠️
**IMPORTANTE**: El sistema de recuperación de contraseñas está implementado pero requiere configuración de envío de emails.

Opciones para configurar:
1. **Resend** (Recomendado) - Servicio de emails transaccionales
   - Crear cuenta en https://resend.com
   - Obtener API key
   - Configurar dominio verificado
   
2. **SendGrid** - Alternativa popular
   - API key necesaria
   
3. **Otro servicio SMTP** - Nodemailer compatible

Una vez tengas el servicio, necesitarás:
- Agregar la API key como secret en el proyecto
- Implementar función de envío de email en `server/auth.ts`
- Actualizar endpoint `/api/auth/request-password-reset` para enviar el correo

**Endpoint actual**: Por ahora devuelve el token y link en la respuesta (solo para desarrollo)

## Credenciales Admin
- Email: admin@rutinasimple.co
- Password: admin123

## Base de Datos
- PostgreSQL (Neon-backed)
- Tablas principales:
  - users (usuarios con roles: user, vendor, admin)
  - vendors (vendedores con métricas de ranking)
  - products (productos con precios en COP)
  - orders (órdenes con pagos Stripe)
  - password_resets (tokens de recuperación)
  - cart_items (carrito de compras)
  - audit_logs (logs de auditoría admin)

## Funcionalidades Implementadas

### Sistema de Autenticación
- Registro e inicio de sesión
- Roles de usuario (user, vendor, admin)
- Recuperación de contraseñas (backend completo, email pendiente)
- Sesiones persistentes

### Panel de Administración (/admin)
- KPIs en tiempo real (GMV, take rate, fill rate, P95 dispatch)
- Gestión de vendedores (aprobar, suspender)
- Gestión de productos (activar, pausar)
- Gestión de usuarios (cambiar roles)
- Visualización de ranking de vendedores
- Logs de auditoría

### Sistema de Carrito
- Seguridad implementada con validación de ownership
- Cálculo automático de precios con IVA

### Productos
- 15 productos de ejemplo seeded
- 6 categorías
- Imágenes por URL (Cloudinary, ImgBB, etc.)

## Secrets Necesarios
- DATABASE_URL ✅
- SESSION_SECRET ✅
- STRIPE_SECRET_KEY (opcional - para pagos)
- VITE_STRIPE_PUBLIC_KEY (opcional - para pagos)
- EMAIL_API_KEY (pendiente - para recuperación de contraseñas)

## Notas de Desarrollo

### Imágenes y Videos
- Usar URLs externas (Cloudinary, ImgBB recomendados)
- Para assets estáticos: carpeta `attached_assets/` con import `@assets/...`
- Para sistema de carga: implementar integración con Cloudinary API

### Sistema de Ranking
- Configuración en `server/ranker.ts`
- Pesos configurables en `client/src/lib/ranker-config.json`
- Actualizable desde admin dashboard

### Seguridad
- Todas las operaciones de carrito validan ownership
- Admin routes protegidos con role checking
- Audit logs para acciones administrativas
- Tokens de password reset expiran en 1 hora

## Próximos Pasos Sugeridos
1. Configurar servicio de email para recuperación de contraseñas
2. Configurar Stripe Connect para pagos multi-vendedor
3. Implementar sistema de carga de imágenes (Cloudinary)
4. Agregar más productos y categorías según necesidad
