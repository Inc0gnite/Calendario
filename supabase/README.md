# 🗄️ Setup Base de Datos — Supabase

## Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Elige región **South America (São Paulo)**
3. Guarda tu **database password**

---

## Paso 2: Ejecutar migraciones

En el **SQL Editor** de Supabase, ejecuta los archivos en orden:

```
001_groups_users.sql    → Tablas grupos y usuarios
002_events.sql          → Tabla de eventos + enums
003_reminders.sql       → Recordatorios + resúmenes semanales
004_rls_policies.sql    → Row Level Security
005_functions_cron.sql  → Funciones RPC + cron jobs
```

> ⚠️ Ejecutar en orden estricto. Cada migración depende de la anterior.

---

## Paso 3: Configurar pg_cron

En Supabase Dashboard → **Database → Extensions**:
- Habilitar `pg_cron`
- Habilitar `pg_net` (para HTTP requests desde cron)

Luego en SQL Editor:
```sql
-- Configurar variables para los cron jobs
ALTER DATABASE postgres SET app.edge_function_url = 'https://TU-PROYECTO.supabase.co/functions/v1';
ALTER DATABASE postgres SET app.service_role_key = 'TU_SERVICE_ROLE_KEY';
```

---

## Paso 4: Copiar credenciales

En Supabase Dashboard → **Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Copia estos valores a tu `.env.local`

---

## Estructura de tablas

```
groups
  ├── id (UUID)
  ├── name (TEXT)
  ├── code (TEXT, UNIQUE)       ← código de pareja
  └── created_at

users
  ├── id (UUID)
  ├── group_id → groups.id
  ├── username (TEXT)
  ├── whatsapp_number (TEXT?)
  ├── slot (1 | 2)              ← user1 o user2
  └── created_at

events
  ├── id (UUID)
  ├── group_id → groups.id
  ├── created_by → users.id
  ├── title, date, priority, assigned_to   ← obligatorios
  ├── description?, time?, recurrence, category?  ← opcionales
  └── created_at, updated_at

reminders
  ├── id (UUID)
  ├── event_id → events.id
  ├── offset_type (1_day_before | 1_week_before | ...)
  ├── scheduled_for (TIMESTAMPTZ)
  ├── sent (BOOLEAN)
  └── sent_at

weekly_summaries
  ├── id (UUID)
  ├── group_id → groups.id
  ├── week_start (DATE)         ← anti-spam: 1 por semana por grupo
  └── sent_at
```
