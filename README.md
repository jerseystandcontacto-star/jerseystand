# Jersey Stand 🏆

Tienda de jerseys y gear deportivo auténtico de fútbol. Construida con Next.js 16, Supabase, Tailwind CSS 4, Cloudinary, Resend y EcartPay.

---

## 🚀 Inicio rápido

### 1. Clonar y configurar

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
```

Llena todas las variables en `.env.local` siguiendo las instrucciones de cada sección.

---

## ⚙️ Configuración de servicios

### 1. Supabase (Base de datos + Auth)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (guarda bien la contraseña)
3. En el menú izquierdo, ve a **SQL Editor**
4. Copia el contenido de `supabase/schema.sql` y ejecútalo completo
5. Ve a **Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret key` → `SUPABASE_SERVICE_ROLE_KEY`

**Crear usuario admin:**
1. Ve a **Authentication → Users**
2. Crea un usuario con tu email
3. Ve a **SQL Editor** y ejecuta:
```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'tu-email@ejemplo.com';
```

---

### 2. Cloudinary (Imágenes de productos)

1. Ve a [cloudinary.com](https://cloudinary.com) y crea una cuenta (gratis)
2. En el Dashboard, copia:
   - `Cloud name` → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `API Key` → `CLOUDINARY_API_KEY`
   - `API Secret` → `CLOUDINARY_API_SECRET`

---

### 3. Resend (Emails transaccionales)

1. Ve a [resend.com](https://resend.com) y crea una cuenta (gratis hasta 100 emails/día)
2. En **API Keys**, crea una nueva key
3. Copia la key → `RESEND_API_KEY`
4. En **Domains**, agrega tu dominio (ej: jerseystand.com) y verifica los DNS
5. Actualiza `EMAIL_FROM` con tu dominio verificado
6. Actualiza `EMAIL_ADMIN` con tu email para recibir notificaciones

> **Durante desarrollo**: usa `onboarding@resend.dev` como `EMAIL_FROM` sin verificar dominio

---

### 4. EcartPay (Pasarela de pagos)

1. Regístrate en [ecartpay.com](https://ecartpay.com)
2. En tu dashboard, ve a **Configuración → Claves API**
3. Copia las claves al `.env.local`:
   - `ECARTPAY_API_KEY`
   - `ECARTPAY_SECRET_KEY`
   - `NEXT_PUBLIC_ECARTPAY_PUBLIC_KEY`
4. Configura el webhook URL en EcartPay: `https://tudominio.com/api/webhooks/ecartpay`
5. Copia el webhook secret → `ECARTPAY_WEBHOOK_SECRET`

> **Modo sandbox**: EcartPay tiene modo de pruebas. Usa las claves de prueba para desarrollo.

---

### 5. Despliegue en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Conecta tu repositorio de GitHub (primero haz `git init && git add . && git commit -m "init"`)
3. En el proyecto en Vercel, ve a **Settings → Environment Variables**
4. Agrega **todas** las variables de `.env.example` con sus valores reales
5. Haz clic en **Deploy**

**Configuración adicional en Vercel:**
- Ve a **Settings → General** y asegúrate que el Framework Preset sea **Next.js**
- En **Settings → Domains**, agrega `jerseystand.com` y configura los DNS en tu registrador

---

## 🗂️ Estructura del proyecto

```
jerseystand/
├── app/
│   ├── page.tsx              # Home
│   ├── productos/
│   │   ├── page.tsx          # Catálogo con filtros
│   │   └── [slug]/page.tsx   # Detalle de producto
│   ├── carrito/page.tsx      # Carrito completo
│   ├── checkout/page.tsx     # Proceso de compra
│   ├── cuenta/
│   │   ├── page.tsx          # Perfil / Login
│   │   └── ordenes/page.tsx  # Historial de pedidos
│   ├── rastrear/page.tsx     # Tracking de orden
│   ├── contacto/page.tsx     # Formulario de contacto
│   ├── admin/                # Panel de administración
│   │   ├── page.tsx          # Dashboard con métricas
│   │   ├── productos/page.tsx
│   │   ├── ordenes/page.tsx
│   │   ├── cupones/page.tsx
│   │   └── newsletter/page.tsx
│   └── api/                  # Rutas de API
├── components/               # Componentes reutilizables
│   ├── layout/               # Navbar, Footer
│   ├── ui/                   # Button, Input, Badge, Loading
│   ├── products/             # ProductCard, Filters
│   ├── cart/                 # CartDrawer
│   └── home/                 # Hero, CategorySection, etc.
├── lib/                      # Utilidades
│   ├── supabase/             # Cliente de Supabase
│   ├── cloudinary.ts         # Gestión de imágenes
│   ├── resend.ts             # Emails transaccionales
│   └── utils.ts              # Funciones helper
├── store/
│   └── cartStore.ts          # Estado del carrito (Zustand)
├── types/
│   └── index.ts              # Tipos TypeScript
└── supabase/
    └── schema.sql            # Schema completo de la BD
```

---

## 🎨 Paleta de colores

| Elemento | Color |
|----------|-------|
| Negro profundo | `#111410` |
| Verde fútbol | `#1a5c2e` |
| Dorado | `#c9a227` |
| Blanco | `#ffffff` |
| Tipografía display | Bebas Neue |
| Tipografía body | DM Sans |
| Tipografía productos | Oswald |

---

## 📧 Emails automáticos configurados

| Evento | Destinatario |
|--------|-------------|
| Orden confirmada | Cliente |
| Nueva orden | Admin |
| Orden enviada (con guía) | Cliente |
| Suscripción newsletter | Suscriptor |
| Formulario de contacto | Admin + Cliente |

---

## 🔐 Seguridad implementada

- Autenticación con Supabase Auth
- Row Level Security (RLS) en todas las tablas
- Panel admin verificado por rol en cada request
- Validación de datos con Zod en todas las APIs
- Variables sensibles nunca expuestas al cliente

---

## 💡 Comandos útiles

```bash
npm run dev     # Desarrollo local en http://localhost:3000
npm run build   # Build de producción
npm run lint    # Verificar código
```

---

## 🚦 Flujo de una compra

1. **Cliente** agrega productos al carrito (guardado en localStorage)
2. **Checkout**: llena datos de envío, elige tipo de entrega, aplica cupón
3. **API `/api/checkout`**: crea la orden en Supabase, genera link de pago EcartPay
4. **EcartPay**: cliente paga de forma segura
5. **Webhook** (pendiente de implementar): EcartPay notifica pago exitoso, se actualiza estado a "pagado"
6. **Admin**: cambia estado a "enviado" y agrega número de guía
7. **Email automático**: cliente recibe email con su guía de rastreo

---

## 📞 Soporte

¿Tienes dudas sobre la configuración? Contacta a través de `hola@jerseystand.com`.
