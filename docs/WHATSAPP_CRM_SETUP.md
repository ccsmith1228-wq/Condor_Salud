# WhatsApp Patient CRM — Setup Guide

> **Clinic:** Centro Médico Roca  
> **WhatsApp Number:** +54 11 2775-6496  
> **Updated:** 2 de abril de 2026

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Patient sends WhatsApp message to +54 11 2775-6496         │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Meta Cloud API Webhook                                      │
│  POST https://condorsalud.com/api/webhooks/whatsapp         │
│  (Backup: Twilio webhook, same URL)                          │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  WhatsApp Service (src/lib/services/whatsapp.ts)             │
│                                                              │
│  1. Identify clinic by whatsapp_config.whatsapp_number       │
│  2. Find or create Lead (leads table)                        │
│  3. Find or create Conversation (conversations table)        │
│  4. Store Message (messages table)                           │
│  5. Auto-create Patient profile if first contact             │
│  6. Send auto-reply welcome message                          │
│  7. Handle booking keywords (CONFIRMAR/CANCELAR)             │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  CRM Dashboard (/dashboard/pacientes)                        │
│                                                              │
│  Tab "Consultas" — Lead pipeline (Kanban: nuevo → convertido)│
│  Tab "Mensajes"  — Real-time WhatsApp inbox (5s polling)     │
│  Tab "Pacientes" — Patient list with lead conversion         │
└──────────────────────────────────────────────────────────────┘
```

---

## 1. Database Schema (Migration 006)

Already deployed. Tables:

| Table                 | Purpose                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `whatsapp_config`     | Per-clinic WhatsApp settings (number, auto-reply, business hours)                             |
| `leads`               | CRM funnel pipeline (nuevo → contactado → interesado → turno_agendado → convertido → perdido) |
| `conversations`       | Threaded message conversations (WhatsApp, web_chat, email, telefono)                          |
| `messages`            | Individual messages with direction, sender, status tracking                                   |
| `whatsapp_templates`  | Approved message templates per clinic                                                         |
| `marketing_campaigns` | Bulk WhatsApp outreach campaigns                                                              |
| `campaign_recipients` | Per-recipient delivery tracking                                                               |

All tables have RLS policies + service role bypass for webhook operations.

---

## 2. Seed WhatsApp Config for Centro Médico Roca

```bash
# From the project root:
node scripts/seed-cmr-whatsapp-crm.mjs
```

This script:

- Looks up the clinic by CUIT `20-95140905-8`
- Upserts `whatsapp_config` row with CMR's number, welcome message, business hours
- Seeds 7 message templates (reminders, confirmation, cancellation, reschedule, post-visit, follow-up)

---

## 3. Meta WhatsApp Business Setup

### 3.1 Prerequisites

- [ ] Facebook Business Manager account
- [ ] Meta Developer account
- [ ] WhatsApp Business account linked to **+54 11 2775-6496**
- [ ] The phone number must NOT be registered on regular WhatsApp

### 3.2 Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. **Create App** → Type: **Business**
3. Add **WhatsApp** product
4. Navigate to **WhatsApp** → **Getting Started**

### 3.3 Register Phone Number

1. In the Meta developer console → WhatsApp → **Configuration**
2. Add phone number: `+5491127756496`
3. Verify via SMS/Voice call
4. Set display name: **Centro Médico Roca**

### 3.4 Get Credentials

Note the following values:

| Credential      | Where to find                                                                                  | Env var                                                         |
| --------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Phone Number ID | WhatsApp → Getting Started → "Phone number ID"                                                 | `META_WHATSAPP_PHONE_NUMBER_ID`                                 |
| Access Token    | WhatsApp → Getting Started → "Temporary access token" (generate permanent one via System User) | `META_WHATSAPP_ACCESS_TOKEN`                                    |
| Verify Token    | You choose this (we use `condorsalud-whatsapp-verify-2026`)                                    | `META_WHATSAPP_VERIFY_TOKEN`                                    |
| App Secret      | App Settings → Basic → App Secret                                                              | `META_WHATSAPP_APP_SECRET` (optional, for signature validation) |

### 3.5 Configure Webhook

1. In Meta console → WhatsApp → **Configuration** → **Webhook**
2. Callback URL: `https://condorsalud.com/api/webhooks/whatsapp`
3. Verify token: `condorsalud-whatsapp-verify-2026`
4. Click **Verify and Save**
5. Subscribe to: `messages`, `message_deliveries`, `message_reads`

### 3.6 Generate Permanent Access Token

The temporary token expires in 24h. For production:

1. Go to **Business Settings** → **System Users**
2. Create a system user (Admin role)
3. Generate token with permissions: `whatsapp_business_messaging`, `whatsapp_business_management`
4. Save this token — it's the permanent `META_WHATSAPP_ACCESS_TOKEN`

---

## 4. Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```env
# Meta WhatsApp Cloud API (Primary)
META_WHATSAPP_PHONE_NUMBER_ID=123456789012345
META_WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxx...
META_WHATSAPP_VERIFY_TOKEN=condorsalud-whatsapp-verify-2026

# Twilio (Fallback — optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_WHATSAPP_FROM=+14155238886
```

---

## 5. Template Approval

Meta requires pre-approval for template messages (used outside the 24-hour conversation window).

### Templates to Submit

| Template            | Category | Purpose                              |
| ------------------- | -------- | ------------------------------------ |
| `reminder-24h`      | utility  | Appointment reminder 24h before      |
| `reminder-2h`       | utility  | Appointment reminder 2h before       |
| `confirmation`      | utility  | New appointment confirmation         |
| `cancellation`      | utility  | Appointment cancellation notice      |
| `reschedule`        | utility  | Appointment reschedule notice        |
| `post-visit`        | utility  | Post-visit thank you + Google review |
| `follow-up-results` | utility  | Lab/study results ready              |

### How to Submit

1. In Meta console → WhatsApp → **Message Templates**
2. Create each template with the body from our DB (`whatsapp_templates` table)
3. Replace our `{{variable}}` syntax with Meta's `{{1}}`, `{{2}}`, etc.
4. Submit for review (usually approved in minutes for `utility` category)
5. Once approved, update `approved = true` in the DB

---

## 6. Features Available

### Automatic (no staff action required)

| Feature                      | Status   | Description                                                          |
| ---------------------------- | -------- | -------------------------------------------------------------------- |
| **Auto-lead creation**       | ✅ Ready | First WhatsApp message auto-creates a Lead with profile name + phone |
| **Auto-patient creation**    | ✅ Ready | New lead auto-creates a Patient record (staff can enrich later)      |
| **Welcome message**          | ✅ Ready | Auto-reply on first contact with clinic-specific message             |
| **Out-of-hours message**     | ✅ Ready | Auto-reply outside business hours (Lun–Vie 10–18)                    |
| **Booking confirmation**     | ✅ Ready | WhatsApp notification when appointment is booked                     |
| **Booking keyword handling** | ✅ Ready | Patient replies CONFIRMAR/CANCELAR/1/2/3                             |
| **Delivery receipts**        | ✅ Ready | Track sent/delivered/read status on outbound messages                |
| **Blue checkmarks**          | ✅ Ready | Auto-mark inbound messages as read                                   |

### Dashboard Features (staff use)

| Feature              | Location                                 | Description                                                                 |
| -------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| **CRM Inbox**        | `/dashboard/pacientes` → Tab "Mensajes"  | Real-time WhatsApp conversation view (5s polling)                           |
| **Lead Pipeline**    | `/dashboard/pacientes` → Tab "Consultas" | Kanban board: nuevo → contactado → interesado → turno_agendado → convertido |
| **Send Messages**    | CRM Inbox → compose bar                  | Reply to patients directly from dashboard                                   |
| **Lead Details**     | Click any lead                           | View history, tags, notes, convert to patient                               |
| **WhatsApp Config**  | `/dashboard/configuracion/whatsapp`      | Edit templates, toggle reminders, preview messages                          |
| **Template Preview** | WhatsApp Config page                     | Live WhatsApp-style preview with sample data                                |
| **KPI Dashboard**    | WhatsApp Config page                     | Messages today, confirmed, no response, active templates                    |

### Reminder System

| Reminder        | Timing          | Template                           |
| --------------- | --------------- | ---------------------------------- |
| First reminder  | 24 hours before | `reminder-24h`                     |
| Second reminder | 2 hours before  | `reminder-2h`                      |
| Confirmation    | On booking      | `confirmation`                     |
| Cancellation    | On cancel       | `cancellation`                     |
| Reschedule      | On reschedule   | `reschedule`                       |
| Post-visit      | 1 hour after    | `post-visit` (disabled by default) |

---

## 7. Testing

### Local Development

Without Meta/Twilio credentials, the system runs in **dev mode**:

- Incoming messages are logged but not processed
- Outgoing messages are stored in DB but not sent
- Demo conversations appear in the CRM inbox

### Production Testing

1. Set all env vars in Vercel
2. Run `node scripts/seed-cmr-whatsapp-crm.mjs`
3. Go to `/dashboard/configuracion/whatsapp` → Click "Enviar prueba"
4. Send a WhatsApp message from your phone to +54 11 2775-6496
5. Check `/dashboard/pacientes?tab=inbox` — should see your message within 10 seconds
6. Reply from the dashboard inbox — message should arrive on your phone

### Verify Webhook

```bash
# Test Meta webhook verification
curl "https://condorsalud.com/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=condorsalud-whatsapp-verify-2026&hub.challenge=test123"
# Should return: test123
```

---

## 8. CRM Flow for Centro Médico Roca

```
Patient sends WhatsApp → "Hola, necesito turno para cardiología"
                          │
                          ▼
┌─ Auto-Lead Created ──────────────────────────────────┐
│  nombre: "María García" (from WhatsApp profile)       │
│  telefono: +5491155551234                             │
│  fuente: whatsapp                                     │
│  estado: nuevo                                        │
│  motivo: "Hola, necesito turno para cardiología"      │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌─ Auto-Reply Sent ────────────────────────────────────┐
│  "¡Hola! 👋 Gracias por comunicarte con Centro       │
│   Médico Roca..."                                     │
│  [1] Sacar turno [2] Consultar [3] Recepción         │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
┌─ Receptionist Dashboard ─────────────────────────────┐
│  CRM Inbox shows new unread conversation              │
│  Lead appears in "Consultas" → "Nuevo" column         │
│  Staff replies, updates status, assigns doctor        │
│  → Books turno → Lead moves to "turno_agendado"       │
│  → After visit → Convert lead to patient               │
└──────────────────────────────────────────────────────┘
```

---

## 9. File Reference

| File                                                | Purpose                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/lib/services/whatsapp.ts`                      | Core WhatsApp service (1165 lines) — send/receive, CRM pipeline, Meta+Twilio |
| `src/lib/services/whatsapp-booking-confirm.ts`      | Booking keyword handler (CONFIRMAR/CANCELAR)                                 |
| `src/app/api/webhooks/whatsapp/route.ts`            | Webhook endpoint (Meta + Twilio)                                             |
| `src/app/api/whatsapp/config/route.ts`              | WhatsApp config CRUD API                                                     |
| `src/app/api/crm/leads/route.ts`                    | Lead CRUD API                                                                |
| `src/app/api/crm/conversations/route.ts`            | Conversation list API                                                        |
| `src/app/api/crm/conversations/[id]/route.ts`       | Messages + send API                                                          |
| `src/app/api/crm/stats/route.ts`                    | CRM KPI stats API                                                            |
| `src/app/dashboard/pacientes/page.tsx`              | CRM dashboard (leads, patients, inbox)                                       |
| `src/app/dashboard/configuracion/whatsapp/page.tsx` | WhatsApp settings UI                                                         |
| `src/lib/hooks/useCRM.ts`                           | SWR hooks for all CRM data                                                   |
| `src/lib/types.ts`                                  | Lead, Conversation, Message, WhatsAppConfig types                            |
| `supabase/migrations/006_whatsapp_crm.sql`          | Database schema (7 tables, RLS, realtime)                                    |
| `scripts/seed-cmr-whatsapp-crm.mjs`                 | Seed script for CMR config + templates                                       |

---

## 10. Pending Items

- [ ] **Meta Developer Console** — Register webhook URL and phone number
- [ ] **Permanent access token** — Generate via System User (temp token expires 24h)
- [ ] **Template approval** — Submit 7 templates for Meta review
- [ ] **Google Maps short link** — Create `maps.app.goo.gl/cmroca` for CMR
- [ ] **Run seed script** — `node scripts/seed-cmr-whatsapp-crm.mjs`
- [ ] **Cron job for reminders** — Wire `clinic-notifications.ts` to send 24h/2h reminders via WhatsApp
- [ ] **Test end-to-end** — Send test message → verify lead creation → reply from dashboard

---

_Cóndor Salud — Tecnología para la salud argentina_ 🇦🇷
