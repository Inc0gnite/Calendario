# 🚀 Guía de Deploy — Agenda Compartida

## Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind + shadcn/ui + Framer Motion
- **Backend**: Supabase (PostgreSQL + RLS + Edge Functions)
- **WhatsApp**: Twilio API
- **Deploy**: Vercel

---

## Paso 1: Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
   - Región: **South America (São Paulo)**

2. En el **SQL Editor**, ejecutar en orden:
   ```
   supabase/migrations/001_groups_users.sql
   supabase/migrations/002_events.sql
   supabase/migrations/003_reminders.sql
   supabase/migrations/004_rls_policies.sql
   supabase/migrations/005_functions_cron.sql
   ```

3. Habilitar extensiones en **Database → Extensions**:
   - `pg_cron`
   - `pg_net`

4. Configurar variables de cron (SQL Editor):
   ```sql
   ALTER DATABASE postgres
     SET app.edge_function_url = 'https://TU-PROYECTO.supabase.co/functions/v1';
   ALTER DATABASE postgres
     SET app.service_role_key = 'TU_SERVICE_ROLE_KEY';
   ```

---

## Paso 2: Configurar Twilio

1. Crear cuenta en [twilio.com](https://twilio.com)
2. Activar **WhatsApp Sandbox** en Console → Messaging → Try it out
3. Anotar:
   - `Account SID`
   - `Auth Token`
   - Número sandbox: `+14155238886`

---

## Paso 3: Deploy en Vercel

1. Subir el proyecto a GitHub

2. Importar en [vercel.com](https://vercel.com)

3. Agregar variables de entorno en Vercel Dashboard → Settings → Environment Variables:

   | Variable | Valor |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` |
   | `TWILIO_ACCOUNT_SID` | `ACxxx...` |
   | `TWILIO_AUTH_TOKEN` | `xxx...` |
   | `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` |

4. Hacer deploy → Vercel genera URL automáticamente

---

## Paso 4: Configurar cron jobs en Supabase

Con la URL de Vercel ya disponible, actualizar en SQL Editor:

```sql
-- Recordatorios cada hora
SELECT cron.schedule(
  'send-reminders',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://TU-APP.vercel.app/api/scheduler/send-reminders',
      headers := '{"Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);

-- Resumen semanal — viernes 09:00 Chile (UTC-4 → 13:00 UTC)
SELECT cron.schedule(
  'weekly-summary',
  '0 13 * * 5',
  $$
    SELECT net.http_post(
      url := 'https://TU-APP.vercel.app/api/scheduler/weekly-summary',
      headers := '{"Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
```

---

## Paso 5: Verificar Twilio Sandbox

Para recibir mensajes del sandbox, cada usuario debe enviar primero:
```
join <sandbox-keyword>
```
al número `+14155238886` de WhatsApp.

> En producción con número Twilio verificado este paso no es necesario.

---

## Estructura final del proyecto

```
agenda-app/
├── app/
│   ├── auth/login/         → Pantalla de login
│   ├── home/               → Pantalla principal + calendario
│   ├── events/
│   │   ├── create/         → Crear evento
│   │   └── edit/           → Editar/eliminar evento
│   ├── settings/           → Configuración
│   └── api/scheduler/
│       ├── send-reminders/ → Cron recordatorios
│       └── weekly-summary/ → Cron resumen semanal
├── components/
│   ├── ui/                 → Design system
│   ├── layout/             → Header, Nav, Auth
│   ├── calendar/           → Calendario
│   └── events/             → Tarjetas y formularios
├── hooks/                  → useEvents, useSession, useHolidays
├── lib/
│   ├── supabase/           → Cliente, tipos, auth, reminders
│   ├── twilio/             → WhatsApp service
│   └── utils/              → Helpers, constantes, schemas
├── supabase/
│   ├── migrations/         → SQL schemas
│   └── functions/          → Edge Functions (alternativa a API routes)
└── types/                  → TypeScript types
```

---

## Checklist antes de ir a producción

- [ ] Migraciones SQL ejecutadas en Supabase
- [ ] Variables de entorno en Vercel
- [ ] Twilio sandbox activo y número registrado
- [ ] Cron jobs configurados con URL de Vercel
- [ ] Número de WhatsApp propio registrado en app
- [ ] Prueba de login con código de pareja
- [ ] Prueba de creación de evento y recordatorio manual
