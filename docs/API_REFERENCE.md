# Condor Salud — Complete API Reference

> Auto-generated from official documentation. Last updated: 2025-07.

---

## Table of Contents

1. [Supabase (Database, Auth, Storage, Realtime)](#1-supabase)
2. [Google OAuth 2.0](#2-google-oauth-20)
3. [Google Calendar API v3](#3-google-calendar-api-v3)
4. [Google Places API (New)](#4-google-places-api-new)
5. [Daily.co (Telemedicine Video)](#5-dailyco-telemedicine-video)
6. [Twilio WhatsApp API](#6-twilio-whatsapp-api)
7. [MercadoPago (Payments)](#7-mercadopago-payments)
8. [Resend (Transactional Email)](#8-resend-transactional-email)
9. [Upstash Redis (Rate Limiting / Caching)](#9-upstash-redis)
10. [Sentry (Error Monitoring)](#10-sentry)
11. [Nubix Cloud (RIS/PACS — Medical Imaging)](#11-nubix-cloud)
12. [AFIP WSFE v1 (Electronic Invoicing — Argentina)](#12-afip-wsfe-v1)
13. [PAMI (Public Health Insurance — Argentina)](#13-pami)
14. [Doctoraliar / Docplanner](#14-doctoraliar-docplanner)

---

## 1. Supabase

**SDK**: `@supabase/supabase-js` v2  
**Docs**: <https://supabase.com/docs/reference/javascript>  
**Used for**: Database (PostgreSQL), Authentication, Storage, Realtime, Edge Functions

### 1.1 Client Initialization

```typescript
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 1.2 Database (CRUD)

| Operation  | Method                          | Example                                       |
| ---------- | ------------------------------- | --------------------------------------------- |
| **Select** | `.from('table').select('*')`    | `.select('id, name').eq('status', 'active')`  |
| **Insert** | `.from('table').insert({...})`  | `.insert({ name: 'John', email: 'j@e.com' })` |
| **Update** | `.from('table').update({...})`  | `.update({ name: 'Jane' }).eq('id', 1)`       |
| **Upsert** | `.from('table').upsert({...})`  | `.upsert({ id: 1, name: 'Jane' })`            |
| **Delete** | `.from('table').delete()`       | `.delete().eq('id', 1)`                       |
| **RPC**    | `.rpc('function_name', {args})` | `.rpc('get_stats', { period: '30d' })`        |

### 1.3 Filters

| Filter                  | Description              | Example                                |
| ----------------------- | ------------------------ | -------------------------------------- |
| `.eq(col, val)`         | Equal                    | `.eq('status', 'active')`              |
| `.neq(col, val)`        | Not equal                | `.neq('role', 'admin')`                |
| `.gt(col, val)`         | Greater than             | `.gt('age', 18)`                       |
| `.gte(col, val)`        | Greater than or equal    | `.gte('price', 100)`                   |
| `.lt(col, val)`         | Less than                | `.lt('quantity', 10)`                  |
| `.lte(col, val)`        | Less than or equal       | `.lte('score', 50)`                    |
| `.like(col, pat)`       | LIKE (case-sensitive)    | `.like('name', '%john%')`              |
| `.ilike(col, pat)`      | ILIKE (case-insensitive) | `.ilike('name', '%john%')`             |
| `.is(col, val)`         | IS (null/true/false)     | `.is('deleted_at', null)`              |
| `.in(col, arr)`         | IN array                 | `.in('id', [1, 2, 3])`                 |
| `.contains(col, val)`   | @> contains              | `.contains('tags', ['urgent'])`        |
| `.overlaps(col, val)`   | && overlaps              | `.overlaps('tags', ['a','b'])`         |
| `.textSearch(col, q)`   | Full-text search         | `.textSearch('body', 'health')`        |
| `.match(obj)`           | Multiple eq              | `.match({ city: 'BA', active: true })` |
| `.not(col, op, val)`    | Negate filter            | `.not('status', 'eq', 'draft')`        |
| `.or(filters)`          | OR conditions            | `.or('age.gt.20,age.lt.10')`           |
| `.filter(col, op, val)` | Raw filter               | `.filter('age', 'gte', 21)`            |

### 1.4 Modifiers

| Modifier                     | Description                       |
| ---------------------------- | --------------------------------- |
| `.order(col, { ascending })` | Sort results                      |
| `.limit(count)`              | Limit row count                   |
| `.range(from, to)`           | Pagination (0-indexed)            |
| `.single()`                  | Return one row (error if 0 or 2+) |
| `.maybeSingle()`             | Return one row or null            |
| `.csv()`                     | Return as CSV                     |
| `.abortSignal(signal)`       | Cancellation                      |

### 1.5 Authentication

| Method                                                    | Description                  |
| --------------------------------------------------------- | ---------------------------- |
| `supabase.auth.signUp({ email, password })`               | Register with email/password |
| `supabase.auth.signInWithPassword({ email, password })`   | Email/password login         |
| `supabase.auth.signInWithOAuth({ provider })`             | OAuth (Google, GitHub, etc.) |
| `supabase.auth.signInWithOtp({ email })`                  | Magic link / OTP             |
| `supabase.auth.signOut()`                                 | Sign out                     |
| `supabase.auth.resetPasswordForEmail(email)`              | Password reset               |
| `supabase.auth.updateUser({ data })`                      | Update user metadata         |
| `supabase.auth.getUser()`                                 | Get current user             |
| `supabase.auth.getSession()`                              | Get current session          |
| `supabase.auth.onAuthStateChange(callback)`               | Listen for auth events       |
| `supabase.auth.refreshSession()`                          | Force token refresh          |
| MFA: `supabase.auth.mfa.enroll/challenge/verify/unenroll` | Multi-factor auth            |

### 1.6 Realtime

```typescript
// Subscribe to table changes
supabase
  .channel("changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, handler)
  .subscribe();

// Broadcast (pub/sub)
supabase.channel("room1").send({ type: "broadcast", event: "cursor", payload: { x, y } });

// Presence (who's online)
supabase.channel("room1").on("presence", { event: "sync" }, handler).subscribe();
```

### 1.7 Storage

| Method                                                             | Description    |
| ------------------------------------------------------------------ | -------------- |
| `supabase.storage.from('bucket').upload(path, file)`               | Upload file    |
| `supabase.storage.from('bucket').download(path)`                   | Download file  |
| `supabase.storage.from('bucket').getPublicUrl(path)`               | Get public URL |
| `supabase.storage.from('bucket').createSignedUrl(path, expiresIn)` | Signed URL     |
| `supabase.storage.from('bucket').remove([paths])`                  | Delete files   |
| `supabase.storage.from('bucket').list(folder)`                     | List files     |
| `supabase.storage.createBucket(id, options)`                       | Create bucket  |

---

## 2. Google OAuth 2.0

**Docs**: <https://developers.google.com/identity/protocols/oauth2/web-server>  
**Used for**: User authentication, calendar access authorization

### 2.1 OAuth Flow (Server-side)

| Step                            | Endpoint / Action                                                            |
| ------------------------------- | ---------------------------------------------------------------------------- |
| **1. Authorization URL**        | `https://accounts.google.com/o/oauth2/v2/auth`                               |
| **2. Exchange code for tokens** | `POST https://oauth2.googleapis.com/token`                                   |
| **3. Refresh token**            | `POST https://oauth2.googleapis.com/token` (with `grant_type=refresh_token`) |
| **4. Revoke token**             | `POST https://oauth2.googleapis.com/revoke?token={token}`                    |

### 2.2 Authorization Parameters

| Parameter                | Required    | Description                                |
| ------------------------ | ----------- | ------------------------------------------ |
| `client_id`              | ✅          | From Cloud Console                         |
| `redirect_uri`           | ✅          | Must match registered URI (HTTPS required) |
| `response_type`          | ✅          | Set to `code`                              |
| `scope`                  | ✅          | Space-delimited scopes                     |
| `access_type`            | Recommended | `offline` for refresh tokens               |
| `state`                  | Recommended | CSRF protection                            |
| `include_granted_scopes` | Optional    | `true` for incremental auth                |
| `login_hint`             | Optional    | Pre-fill email                             |
| `prompt`                 | Optional    | `none`, `consent`, `select_account`        |

### 2.3 Token Exchange Request

```http
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

code={auth_code}&
client_id={client_id}&
client_secret={client_secret}&
redirect_uri={redirect_uri}&
grant_type=authorization_code
```

### 2.4 Relevant Scopes for Condor Salud

| Scope                                               | Purpose              |
| --------------------------------------------------- | -------------------- |
| `openid`                                            | OpenID Connect       |
| `profile`                                           | User profile info    |
| `email`                                             | User email           |
| `https://www.googleapis.com/auth/calendar`          | Full calendar access |
| `https://www.googleapis.com/auth/calendar.events`   | Calendar events CRUD |
| `https://www.googleapis.com/auth/calendar.readonly` | Read-only calendar   |

---

## 3. Google Calendar API v3

**Base URL**: `https://www.googleapis.com/calendar/v3`  
**Docs**: <https://developers.google.com/calendar/api/v3/reference>  
**Auth**: OAuth 2.0 Bearer token  
**Used for**: Appointment scheduling, provider availability

### 3.1 Events

| Method   | Endpoint                                             | Description                    |
| -------- | ---------------------------------------------------- | ------------------------------ |
| `GET`    | `/calendars/{calendarId}/events`                     | List events                    |
| `GET`    | `/calendars/{calendarId}/events/{eventId}`           | Get event                      |
| `POST`   | `/calendars/{calendarId}/events`                     | Create event                   |
| `PUT`    | `/calendars/{calendarId}/events/{eventId}`           | Update event                   |
| `PATCH`  | `/calendars/{calendarId}/events/{eventId}`           | Partial update                 |
| `DELETE` | `/calendars/{calendarId}/events/{eventId}`           | Delete event                   |
| `POST`   | `/calendars/{calendarId}/events/{eventId}/move`      | Move event to another calendar |
| `POST`   | `/calendars/{calendarId}/events/quickAdd`            | Quick-add from text string     |
| `POST`   | `/calendars/{calendarId}/events/import`              | Import event                   |
| `GET`    | `/calendars/{calendarId}/events/{eventId}/instances` | List recurring event instances |
| `POST`   | `/calendars/{calendarId}/events/watch`               | Watch for changes              |

### 3.2 Calendars

| Method   | Endpoint                              | Description           |
| -------- | ------------------------------------- | --------------------- |
| `GET`    | `/users/me/calendarList`              | List user's calendars |
| `GET`    | `/users/me/calendarList/{calendarId}` | Get calendar metadata |
| `POST`   | `/calendars`                          | Create calendar       |
| `PUT`    | `/calendars/{calendarId}`             | Update calendar       |
| `DELETE` | `/calendars/{calendarId}`             | Delete calendar       |
| `POST`   | `/calendars/{calendarId}/clear`       | Clear all events      |

### 3.3 Free/Busy

```http
POST https://www.googleapis.com/calendar/v3/freeBusy
{
  "timeMin": "2025-07-01T00:00:00Z",
  "timeMax": "2025-07-07T23:59:59Z",
  "items": [{ "id": "primary" }]
}
```

### 3.4 Settings

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| `GET`  | `/users/me/settings`           | List settings        |
| `GET`  | `/users/me/settings/{setting}` | Get specific setting |

---

## 4. Google Places API (New)

**Base URL**: `https://places.googleapis.com/v1`  
**Docs**: <https://developers.google.com/maps/documentation/places/web-service/overview>  
**Auth**: API Key or OAuth token  
**Used for**: Doctor/clinic directory, provider location search

### 4.1 Endpoints

| Method | Endpoint                                    | Description               |
| ------ | ------------------------------------------- | ------------------------- |
| `POST` | `/places:searchText`                        | Text-based place search   |
| `POST` | `/places:searchNearby`                      | Search by location radius |
| `GET`  | `/places/{placeId}`                         | Place details             |
| `GET`  | `/places/{placeId}/photos/{photoRef}/media` | Place photo               |
| `POST` | `/places:autocomplete`                      | Autocomplete suggestions  |

### 4.2 Request Headers

```http
X-Goog-Api-Key: YOUR_API_KEY
X-Goog-FieldMask: places.displayName,places.formattedAddress,places.location
Content-Type: application/json
```

### 4.3 Text Search Example

```http
POST https://places.googleapis.com/v1/places:searchText
{
  "textQuery": "cardiólogo en Buenos Aires",
  "languageCode": "es",
  "locationBias": {
    "circle": { "center": { "latitude": -34.6037, "longitude": -58.3816 }, "radius": 10000 }
  }
}
```

---

## 5. Daily.co (Telemedicine Video)

**Base URL**: `https://api.daily.co/v1`  
**Docs**: <https://docs.daily.co/reference/rest-api>  
**Auth**: `Authorization: Bearer {DAILY_API_KEY}`  
**Used for**: Video consultations, telemedicine

### 5.1 Rate Limits

| Endpoint          | Limit              |
| ----------------- | ------------------ |
| Most endpoints    | 20 requests/second |
| `DELETE /rooms`   | 2 requests/second  |
| `GET /recordings` | 2 requests/second  |

### 5.2 Rooms

| Method   | Endpoint        | Description        |
| -------- | --------------- | ------------------ |
| `GET`    | `/rooms`        | List rooms         |
| `GET`    | `/rooms/{name}` | Get room           |
| `POST`   | `/rooms`        | Create room        |
| `POST`   | `/rooms/{name}` | Update room config |
| `DELETE` | `/rooms/{name}` | Delete room        |

#### Create Room Example

```http
POST https://api.daily.co/v1/rooms
Authorization: Bearer {DAILY_API_KEY}
Content-Type: application/json

{
  "name": "consulta-12345",
  "privacy": "private",
  "properties": {
    "max_participants": 4,
    "enable_recording": "cloud",
    "exp": 1720000000,
    "nbf": 1719990000,
    "eject_at_room_exp": true,
    "start_video_off": false,
    "start_audio_off": false,
    "enable_screenshare": true
  }
}
```

#### Room Object

```json
{
  "id": "5e3cf703-5547-47d6-a371-37b1f0b4427f",
  "name": "consulta-12345",
  "api_created": true,
  "privacy": "private",
  "url": "https://your-domain.daily.co/consulta-12345",
  "created_at": "2025-07-01T10:00:00.000Z",
  "config": {
    "max_participants": 4,
    "nbf": 1719990000,
    "exp": 1720000000,
    "enable_recording": "cloud"
  }
}
```

### 5.3 Meeting Tokens

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| `POST` | `/meeting-tokens`         | Create meeting token   |
| `GET`  | `/meeting-tokens/{token}` | Validate meeting token |

#### Meeting Token Properties

| Property                   | Type    | Description                                                       |
| -------------------------- | ------- | ----------------------------------------------------------------- |
| `room_name`                | string  | **Always set this** — without it, token allows access to ANY room |
| `exp`                      | number  | Token expiration (Unix timestamp)                                 |
| `nbf`                      | number  | Token not valid before (Unix timestamp)                           |
| `is_owner`                 | boolean | Owner privileges (admin in room)                                  |
| `user_name`                | string  | Display name for participant                                      |
| `user_id`                  | string  | Your system's user ID                                             |
| `enable_screenshare`       | boolean | Allow screen sharing                                              |
| `start_video_off`          | boolean | Join with video off                                               |
| `start_audio_off`          | boolean | Join with audio muted                                             |
| `enable_recording`         | string  | `"cloud"`, `"local"`, `"rtp-tracks"`                              |
| `eject_at_token_exp`       | boolean | Kick user when token expires                                      |
| `eject_after_elapsed`      | number  | Max seconds in meeting                                            |
| `close_tab_on_exit`        | boolean | Close browser tab on leave                                        |
| `redirect_on_meeting_exit` | string  | URL to redirect to after meeting                                  |
| `lang`                     | string  | UI language                                                       |

#### Create Token Example

```http
POST https://api.daily.co/v1/meeting-tokens
Authorization: Bearer {DAILY_API_KEY}
Content-Type: application/json

{
  "properties": {
    "room_name": "consulta-12345",
    "exp": 1720000000,
    "is_owner": false,
    "user_name": "Dr. García",
    "user_id": "doc-uuid-123",
    "enable_screenshare": true
  }
}
```

### 5.4 Recordings

| Method   | Endpoint                       | Description       |
| -------- | ------------------------------ | ----------------- |
| `GET`    | `/recordings`                  | List recordings   |
| `GET`    | `/recordings/{id}`             | Get recording     |
| `DELETE` | `/recordings/{id}`             | Delete recording  |
| `GET`    | `/recordings/{id}/access-link` | Get download link |

### 5.5 Pagination

```text
?limit=50&starting_after={cursor_id}&ending_before={cursor_id}
```

- Max `limit`: 100
- Use cursor-based pagination with `starting_after` / `ending_before`

### 5.6 Error Codes

| Code | Meaning                 |
| ---- | ----------------------- |
| 400  | Bad request             |
| 401  | Invalid/missing API key |
| 403  | Forbidden               |
| 404  | Resource not found      |
| 429  | Rate limit exceeded     |
| 5xx  | Server error            |

### 5.7 Client-side SDK

```typescript
import DailyIframe from "@daily-co/daily-js";

const call = DailyIframe.createCallObject();
await call.join({ url: roomUrl, token: meetingToken });

// Events
call.on("joined-meeting", handler);
call.on("participant-joined", handler);
call.on("participant-left", handler);
call.on("error", handler);

// Actions
call.setLocalAudio(false);
call.setLocalVideo(false);
call.startScreenShare();
call.startRecording();
await call.leave();
await call.destroy();
```

---

## 6. Twilio WhatsApp API

**Base URL**: `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}`  
**Docs**: <https://www.twilio.com/docs/whatsapp>  
**Auth**: Basic Auth (`AccountSid:AuthToken`) or API Key  
**SDK**: `twilio` npm package  
**Used for**: Appointment reminders, result notifications, patient communication

### 6.1 Key Concepts

- **Address format**: `whatsapp:+5491155551234` (E.164 with `whatsapp:` prefix)
- **24-hour window**: After customer messages you, free-form replies allowed for 24h
- **Templates**: Required for business-initiated messages (pre-approved by Meta)
- **Media**: Supports images, PDFs, etc. (max 16MB)

### 6.2 Send Message

```typescript
const twilio = require("twilio");
const client = twilio(accountSid, authToken);

// Free-form (within 24h window)
await client.messages.create({
  body: "Su turno es mañana a las 10:00",
  from: "whatsapp:+14155238886",
  to: "whatsapp:+5491155551234",
});

// Template message (business-initiated)
await client.messages.create({
  contentSid: "HXxxxxx", // Template content SID
  contentVariables: JSON.stringify({ "1": "Dr. García", "2": "10:00" }),
  from: "whatsapp:+14155238886",
  to: "whatsapp:+5491155551234",
});

// With media
await client.messages.create({
  body: "Resultados adjuntos",
  mediaUrl: ["https://example.com/results.pdf"],
  from: "whatsapp:+14155238886",
  to: "whatsapp:+5491155551234",
});
```

### 6.3 Receive Messages (Webhook)

Configure `StatusCallback` URL to receive delivery status updates:

```text
queued → sending → sent → delivered → read → failed
```

Incoming message webhook POST body:

| Field        | Description                   |
| ------------ | ----------------------------- |
| `From`       | `whatsapp:+5491155551234`     |
| `To`         | `whatsapp:+14155238886`       |
| `Body`       | Message text                  |
| `NumMedia`   | Number of media attachments   |
| `MediaUrl0`  | URL of first media attachment |
| `MessageSid` | Unique message ID             |
| `AccountSid` | Your account SID              |

### 6.4 REST API Endpoints

| Method   | Endpoint               | Description                       |
| -------- | ---------------------- | --------------------------------- |
| `POST`   | `/Messages.json`       | Send message                      |
| `GET`    | `/Messages/{Sid}.json` | Get message details               |
| `GET`    | `/Messages.json`       | List messages                     |
| `POST`   | `/Messages/{Sid}.json` | Update message (cancel scheduled) |
| `DELETE` | `/Messages/{Sid}.json` | Delete message record             |

---

## 7. MercadoPago (Payments)

**Base URL**: `https://api.mercadopago.com`  
**Docs**: <https://www.mercadopago.com.ar/developers/en/reference>  
**Auth**: `Authorization: Bearer {ACCESS_TOKEN}`  
**Used for**: Subscription billing, consultation payments, plan upgrades

### 7.1 OAuth

| Method | Endpoint       | Description                |
| ------ | -------------- | -------------------------- |
| `POST` | `/oauth/token` | Create/refresh OAuth token |

### 7.2 Checkout Pro (Hosted Payment Page)

| Method | Endpoint                     | Description               |
| ------ | ---------------------------- | ------------------------- |
| `POST` | `/checkout/preferences`      | Create payment preference |
| `GET`  | `/checkout/preferences/{id}` | Get preference            |
| `PUT`  | `/checkout/preferences/{id}` | Update preference         |

#### Create Preference Example

```json
{
  "items": [
    {
      "title": "Plan Professional - Condor Salud",
      "quantity": 1,
      "unit_price": 15000,
      "currency_id": "ARS"
    }
  ],
  "back_urls": {
    "success": "https://condorsalud.com/dashboard?payment=success",
    "failure": "https://condorsalud.com/dashboard?payment=failure",
    "pending": "https://condorsalud.com/dashboard?payment=pending"
  },
  "auto_return": "approved",
  "notification_url": "https://condorsalud.com/api/webhooks/mercadopago"
}
```

### 7.3 Payments

| Method | Endpoint                    | Description                      |
| ------ | --------------------------- | -------------------------------- |
| `POST` | `/v1/payments`              | Create payment                   |
| `GET`  | `/v1/payments/{id}`         | Get payment                      |
| `GET`  | `/v1/payments/search`       | Search payments                  |
| `PUT`  | `/v1/payments/{id}`         | Update payment (capture, cancel) |
| `POST` | `/v1/payments/{id}/refunds` | Create refund                    |
| `GET`  | `/v1/payments/{id}/refunds` | List refunds                     |

### 7.4 Orders API (New — Checkout API)

| Method   | Endpoint                  | Description   |
| -------- | ------------------------- | ------------- |
| `POST`   | `/v1/orders`              | Create order  |
| `GET`    | `/v1/orders/{id}`         | Get order     |
| `POST`   | `/v1/orders/{id}/capture` | Capture order |
| `POST`   | `/v1/orders/{id}/process` | Process order |
| `GET`    | `/v1/orders/search`       | Search orders |
| `DELETE` | `/v1/orders/{id}`         | Cancel order  |
| `POST`   | `/v1/orders/{id}/refund`  | Refund order  |

### 7.5 Subscriptions (Recurring)

| Method | Endpoint                      | Description          |
| ------ | ----------------------------- | -------------------- |
| `POST` | `/preapproval_plan`           | Create plan          |
| `GET`  | `/preapproval_plan/{id}`      | Get plan             |
| `PUT`  | `/preapproval_plan/{id}`      | Update plan          |
| `GET`  | `/preapproval_plan/search`    | Search plans         |
| `POST` | `/preapproval`                | Create subscription  |
| `GET`  | `/preapproval/{id}`           | Get subscription     |
| `PUT`  | `/preapproval/{id}`           | Update subscription  |
| `GET`  | `/preapproval/search`         | Search subscriptions |
| `GET`  | `/authorized_payments/{id}`   | Get invoice          |
| `GET`  | `/authorized_payments/search` | Search invoices      |

### 7.6 Payment Methods

| Method | Endpoint                   | Description                           |
| ------ | -------------------------- | ------------------------------------- |
| `GET`  | `/v1/payment_methods`      | List available payment methods        |
| `GET`  | `/v1/identification_types` | List document types (DNI, CUIT, etc.) |

### 7.7 Customers

| Method   | Endpoint                            | Description      |
| -------- | ----------------------------------- | ---------------- |
| `POST`   | `/v1/customers`                     | Create customer  |
| `GET`    | `/v1/customers/{id}`                | Get customer     |
| `PUT`    | `/v1/customers/{id}`                | Update customer  |
| `GET`    | `/v1/customers/search`              | Search customers |
| `POST`   | `/v1/customers/{id}/cards`          | Save card        |
| `GET`    | `/v1/customers/{id}/cards`          | List cards       |
| `DELETE` | `/v1/customers/{id}/cards/{cardId}` | Delete card      |

### 7.8 Webhooks

Notification types: `payment`, `plan`, `subscription`, `invoice`, `point_integration_wh`

```json
{
  "id": 12345,
  "live_mode": true,
  "type": "payment",
  "date_created": "2025-07-01T10:00:00Z",
  "action": "payment.created",
  "data": { "id": "67890" }
}
```

### 7.9 Merchant Orders

| Method | Endpoint                  | Description   |
| ------ | ------------------------- | ------------- |
| `POST` | `/merchant_orders`        | Create order  |
| `GET`  | `/merchant_orders/{id}`   | Get order     |
| `PUT`  | `/merchant_orders/{id}`   | Update order  |
| `GET`  | `/merchant_orders/search` | Search orders |

---

## 8. Resend (Transactional Email)

**Base URL**: `https://api.resend.com`  
**Docs**: <https://resend.com/docs/api-reference>  
**Auth**: `Authorization: Bearer re_xxxxxxxxx`  
**Rate Limit**: 2 requests/second/team (increasable)  
**Used for**: Appointment confirmations, password resets, billing notifications

### 8.1 Headers

```http
Authorization: Bearer re_xxxxxxxxx
Content-Type: application/json
User-Agent: condor-salud/1.0
```

> ⚠️ `User-Agent` header is **required** — requests without it get `403` (error 1010)

### 8.2 Emails

| Method  | Endpoint        | Description                     |
| ------- | --------------- | ------------------------------- |
| `POST`  | `/emails`       | Send email                      |
| `POST`  | `/emails/batch` | Send batch emails               |
| `GET`   | `/emails/{id}`  | Get email                       |
| `PATCH` | `/emails/{id}`  | Update email (cancel scheduled) |

#### Send Email Request

```json
{
  "from": "Condor Salud <no-reply@condorsalud.com>",
  "to": ["paciente@email.com"],
  "subject": "Confirmación de turno",
  "html": "<h1>Su turno fue confirmado</h1><p>Fecha: 5 de julio, 10:00</p>",
  "reply_to": "soporte@condorsalud.com",
  "tags": [{ "name": "category", "value": "appointment" }],
  "headers": {
    "X-Entity-Ref-ID": "turno-12345"
  }
}
```

#### With Template

```json
{
  "from": "Condor Salud <no-reply@condorsalud.com>",
  "to": ["paciente@email.com"],
  "subject": "Confirmación de turno",
  "template": {
    "id": "tmpl_xxxxx",
    "variables": {
      "patient_name": "Juan Pérez",
      "appointment_date": "5 de julio, 10:00",
      "doctor_name": "Dr. García"
    }
  }
}
```

#### Send Email Response

```json
{
  "id": "ae2014de-c168-4c61-8267-70d2662a1ce8"
}
```

### 8.3 Attachments

```json
{
  "attachments": [
    {
      "filename": "resultados.pdf",
      "content": "<base64-encoded-content>"
    }
  ]
}
```

- Max total attachment size: **40 MB**

### 8.4 Idempotency

```http
Idempotency-Key: unique-request-id-12345
```

### 8.5 Domains

| Method   | Endpoint               | Description   |
| -------- | ---------------------- | ------------- |
| `POST`   | `/domains`             | Add domain    |
| `GET`    | `/domains`             | List domains  |
| `GET`    | `/domains/{id}`        | Get domain    |
| `DELETE` | `/domains/{id}`        | Remove domain |
| `POST`   | `/domains/{id}/verify` | Verify domain |

### 8.6 Audiences & Contacts

| Method   | Endpoint                                | Description     |
| -------- | --------------------------------------- | --------------- |
| `POST`   | `/audiences`                            | Create audience |
| `GET`    | `/audiences`                            | List audiences  |
| `DELETE` | `/audiences/{id}`                       | Delete audience |
| `POST`   | `/audiences/{id}/contacts`              | Add contact     |
| `GET`    | `/audiences/{id}/contacts`              | List contacts   |
| `PATCH`  | `/audiences/{audienceId}/contacts/{id}` | Update contact  |
| `DELETE` | `/audiences/{audienceId}/contacts/{id}` | Remove contact  |

### 8.7 Response Codes

| Code | Meaning             |
| ---- | ------------------- |
| 200  | Success             |
| 400  | Bad parameters      |
| 401  | Missing API key     |
| 403  | Invalid API key     |
| 404  | Not found           |
| 429  | Rate limit exceeded |
| 5xx  | Server error        |

---

## 9. Upstash Redis

**Docs**: <https://upstash.com/docs/redis/overall/getstarted>  
**Used for**: Rate limiting, caching, session storage

### 9.1 Connection

```typescript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
```

### 9.2 Common Commands

```typescript
// Key-Value
await redis.set("key", "value");
await redis.set("key", "value", { ex: 3600 }); // TTL in seconds
await redis.get("key");
await redis.del("key");
await redis.exists("key");
await redis.expire("key", 3600);
await redis.ttl("key");

// Incrementing (rate limiting)
await redis.incr("rate:user:123");
await redis.incrby("rate:user:123", 5);

// Hash
await redis.hset("user:123", { name: "Juan", role: "doctor" });
await redis.hget("user:123", "name");
await redis.hgetall("user:123");
await redis.hdel("user:123", "name");

// Lists
await redis.lpush("queue", "item");
await redis.rpop("queue");
await redis.lrange("queue", 0, -1);

// Sets
await redis.sadd("online", "user:123");
await redis.smembers("online");
await redis.srem("online", "user:123");

// Sorted Sets (leaderboards, scheduling)
await redis.zadd("schedule", { score: timestamp, member: "task-id" });
await redis.zrangebyscore("schedule", 0, Date.now());
```

### 9.3 Rate Limiting Pattern

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 req per 60s
  analytics: true,
});

const { success, limit, remaining, reset } = await ratelimit.limit("user:123");
```

### 9.4 Features

- **REST API**: Compatible with standard Redis commands over HTTP
- **Multi-region**: Replication for low latency
- **Serverless**: No connection pooling needed
- **99.99% uptime SLA**

---

## 10. Sentry

**Docs**: <https://docs.sentry.io/platforms/javascript/guides/nextjs/>  
**Used for**: Error monitoring, performance tracing, session replay

### 10.1 Setup

```bash
npx @sentry/wizard@latest -i nextjs
```

This creates:

- `instrumentation-client.ts` — Client-side Sentry init
- `sentry.server.config.ts` — Server-side Sentry init
- `sentry.edge.config.ts` — Edge runtime Sentry init
- `instrumentation.ts` — Node.js instrumentation hook

### 10.2 Configuration (`next.config.ts`)

```typescript
import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  org: "condor-salud",
  project: "condor-salud-web",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
```

### 10.3 Features

| Feature                 | Description                                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| **Error Monitoring**    | Automatic capture of unhandled errors + manual `Sentry.captureException()` |
| **Tracing**             | Performance monitoring, transaction traces                                 |
| **Session Replay**      | Replay user sessions to reproduce bugs                                     |
| **Profiling**           | Code-level performance profiling                                           |
| **Crons**               | Monitor scheduled/cron jobs                                                |
| **Logs**                | Structured logging                                                         |
| **AI Agent Monitoring** | Track AI agent behavior                                                    |

### 10.4 Manual Usage

```typescript
import * as Sentry from "@sentry/nextjs";

// Capture error
Sentry.captureException(error);

// Capture message
Sentry.captureMessage("Something happened", "warning");

// Set user context
Sentry.setUser({ id: userId, email: userEmail });

// Custom context
Sentry.setContext("appointment", { id: apptId, doctor: doctorName });

// Breadcrumbs
Sentry.addBreadcrumb({ message: "User clicked pay", category: "ui" });

// Transactions
const transaction = Sentry.startTransaction({ name: "process-payment" });
// ... work
transaction.finish();
```

---

## 11. Nubix Cloud

**Website**: <https://www.nubix.cloud>  
**API Docs**: ⚠️ **No public API documentation** — requires business partnership  
**Used for**: RIS/PACS medical imaging, DICOM viewer, radiology reports

### 11.1 Known Capabilities (from marketing)

- **Solutions**: Radiología, Dental, Cirugía, Cardiología, Neumología, Gastroenterología, etc.
- **Features**: AI analysis, DICOM viewer, WhatsApp result delivery, appointment management
- **Compliance**: HIPAA, DICOM, HL7
- **Scale**: 700M+ files processed, 5+ countries
- **Integrations**: Zapier, custom webhooks

### 11.2 Expected API Endpoints (from our integration code)

Based on our built integration (`src/lib/nubix/client.ts`, `src/lib/services/nubix.ts`):

| Category         | Endpoint                       | Description                         |
| ---------------- | ------------------------------ | ----------------------------------- |
| **Studies**      | `GET /studies`                 | List imaging studies (with filters) |
|                  | `GET /studies/{id}`            | Get study detail                    |
|                  | `GET /studies/{id}/report`     | Get study report (PDF/structured)   |
|                  | `GET /studies/{id}/viewer`     | Get DICOM viewer embed config       |
|                  | `GET /studies/{id}/deliveries` | Get result delivery history         |
|                  | `POST /studies/{id}/deliver`   | Send results via channel            |
| **Reports**      | `GET /reports`                 | List all reports                    |
| **Appointments** | `GET /appointments`            | List imaging appointments           |
|                  | `POST /appointments`           | Create appointment                  |
|                  | `PUT /appointments/{id}`       | Update appointment                  |
| **Analytics**    | `GET /kpis`                    | Dashboard KPIs                      |
| **Deliveries**   | `GET /deliveries`              | List all deliveries                 |

### 11.3 Authentication (Expected)

```http
Authorization: Bearer {NUBIX_API_KEY}
X-Tenant-ID: {NUBIX_TENANT_ID}
Content-Type: application/json
```

### 11.4 Next Steps

- Contact Nubix sales for API documentation: <https://www.nubix.cloud>
- Request sandbox/staging credentials
- Validate our integration types against actual API schema

---

## 12. AFIP WSFE v1

**Docs**: <https://www.afip.gob.ar/ws/documentacion/ws-factura-electronica.asp>  
**Manual**: [WSFEV1 Developer Manual v4.1 (PDF)](https://www.afip.gob.ar/ws/documentacion/manuales/manual-desarrollador-ARCA-COMPG-v4-1.pdf)  
**Protocol**: SOAP/XML  
**Used for**: Electronic invoicing (Factura Electrónica) for billing module

### 12.1 Available Web Services

| Service      | Code      | Description                                                 |
| ------------ | --------- | ----------------------------------------------------------- |
| **WSFE v1**  | `wsfev1`  | Standard invoices A, B, C, M (no item detail) — **Primary** |
| **WSMTXCA**  | `wsmtxca` | Invoices A, B with item detail                              |
| **WSFEXv1**  | `wsfexv1` | Export invoices (type E)                                    |
| **WSCT**     | `wsct`    | Tourism services invoices (type T)                          |
| **WSBFE v1** | `wsbfev1` | Fiscal bonds (Bonos Fiscales)                               |
| **WSSEG**    | `wsseg`   | Insurance policies (Seguros de Caución)                     |

### 12.2 Authentication (WSAA)

Before calling any business WS, authenticate via **WSAA** (Web Service de Autenticación y Autorización):

1. Generate login ticket request (XML signed with X.509 certificate)
2. Call WSAA `loginCms` to get Token + Sign (valid ~12 hours)
3. Include Token + Sign in every business WS call

**WSAA Endpoint**: `https://wsaa.afip.gov.ar/ws/services/LoginCms` (production)  
**WSAA Testing**: `https://wsaahomo.afip.gov.ar/ws/services/LoginCms` (homologación)

### 12.3 WSFEV1 Key Operations

| Operation                 | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| `FECAESolicitar`          | Request CAE (Código de Autorización Electrónico) for invoice |
| `FECAEAConsultar`         | Query CAEA (anticipated authorization)                       |
| `FECompUltimoAutorizado`  | Get last authorized invoice number                           |
| `FECompConsultar`         | Query specific invoice                                       |
| `FEParamGetTiposCbte`     | Get invoice types catalog                                    |
| `FEParamGetTiposConcepto` | Get concept types (products, services, both)                 |
| `FEParamGetTiposDoc`      | Get document types (DNI, CUIT, etc.)                         |
| `FEParamGetTiposIva`      | Get IVA rates                                                |
| `FEParamGetTiposTributos` | Get tribute types                                            |
| `FEParamGetTiposMonedas`  | Get currencies                                               |
| `FEParamGetTiposOpcional` | Get optional data types                                      |
| `FEParamGetPtosVenta`     | Get sale points (Puntos de Venta)                            |

### 12.4 WSFEV1 Endpoints

| Environment      | URL                                                  |
| ---------------- | ---------------------------------------------------- |
| **Production**   | `https://servicios1.afip.gov.ar/wsfev1/service.asmx` |
| **Homologación** | `https://wswhomo.afip.gov.ar/wsfev1/service.asmx`    |

### 12.5 Certificate Setup

1. Generate CSR with CUIT as CN
2. Upload to AFIP portal → get X.509 certificate
3. Authorize the certificate for `wsfe` service in AFIP admin panel
4. Use certificate + private key to sign WSAA login requests

### 12.6 Developer Manual Downloads

- **WSFEV1**: [v4.1 PDF](https://www.afip.gob.ar/ws/documentacion/manuales/manual-desarrollador-ARCA-COMPG-v4-1.pdf)
- **WSMTXCA**: [v0.25.4 PDF](https://www.afip.gob.ar/ws/documentacion/manuales/Web-Service-MTXCA-v25.pdf)
- **WSFEXv1**: [v3.1.1 PDF](https://www.afip.gob.ar/ws/documentacion/manuales/WSFEX-Manualparaeldesarrollador_V3.1.1_ARCA.pdf)
- **WSBFEV1**: [v3.0 PDF](https://www.afip.gob.ar/ws/documentacion/manuales/WSBFEV1-ManualParaElDesarrollador_ARCA_V3_0.pdf)
- **WSCT**: [v1.6.4 PDF](https://www.afip.gob.ar/ws/documentacion/manuales/Manual_Desarrollador_WSCT_v1.6.4.pdf)
- **WSSEG**: [v0.9 PDF](https://www.afip.gob.ar/ws/documentacion/manuales/WSSEG-ManualParaElDesarrollador_ARCA.pdf)

---

## 13. PAMI

**Website**: <https://www.pami.org.ar>  
**API Docs**: ⚠️ **No public API** — government health insurance portal only  
**Used for**: Public health insurance verification, medication coverage

### 13.1 Available Services (Portal)

| Service            | Description                  |
| ------------------ | ---------------------------- |
| Credencial digital | Digital insurance credential |
| Cartilla médica    | Provider directory           |
| Trámites web       | Online procedures            |
| Medicamentos       | Medication coverage lookup   |
| Receta electrónica | Electronic prescriptions     |

### 13.2 Integration Strategy

PAMI does not expose public APIs. Options:

1. **Web scraping** (fragile, not recommended for production)
2. **Credencial lookup** via PAMI portal redirects
3. **Direct partnership** — contact PAMI IT for institutional API access
4. **Manual verification** — staff verifies coverage through PAMI portal
5. **SuperSalud / SISA integration** — Argentina's health information system may provide patient coverage data via API

### 13.3 SISA (Sistema Integrado de Información Sanitaria)

SISA may be a better integration point for coverage verification:

- **REFES**: Federal Registry of Health Establishments
- **REFEPS**: Federal Registry of Health Professionals
- **RUES**: Unified Registry of Health Entities

---

## 14. Doctoraliar (Docplanner)

**Website**: <https://www.doctoraliar.com>
**API Docs**: <https://integrations.docplanner.com/docs/>
**Guide**: <https://integrations.docplanner.com/guide/>
**Used for**: Doctor directory, appointment slots, booking, insurance verification

### 14.1 API Overview

Doctoraliar is the Argentine branch of Docplanner Group (110,000+ professionals).
The REST API v3 uses OAuth2 `client_credentials` flow.

| Detail          | Value                                                       |
| --------------- | ----------------------------------------------------------- |
| Base URL        | `https://www.doctoraliar.com/api/v3/integration/{resource}` |
| Token URL       | `https://www.doctoraliar.com/oauth/v2/token`                |
| Auth            | OAuth2 `client_credentials` (24h token)                     |
| Rate Limit GET  | 8,000 req/hour                                              |
| Rate Limit POST | 40 req/minute (2,400/hour)                                  |
| Content-Type    | `application/vnd.docplanner+json; charset=UTF-8`            |

### 14.2 Resources

| Endpoint                                                              | Method | Description                            |
| --------------------------------------------------------------------- | ------ | -------------------------------------- |
| `/facilities`                                                         | GET    | List partner facilities                |
| `/facilities/{fid}/doctors`                                           | GET    | List doctors in a facility             |
| `/facilities/{fid}/doctors/{did}`                                     | GET    | Doctor detail (profile URL, addresses) |
| `/facilities/{fid}/doctors/{did}/addresses`                           | GET    | Doctor office locations                |
| `/facilities/{fid}/doctors/{did}/addresses/{aid}/services`            | GET    | Services offered at address            |
| `/facilities/{fid}/doctors/{did}/addresses/{aid}/slots`               | GET    | Available appointment slots            |
| `/facilities/{fid}/doctors/{did}/addresses/{aid}/slots/{start}/book`  | POST   | Book a slot                            |
| `/facilities/{fid}/doctors/{did}/addresses/{aid}/bookings`            | GET    | List bookings                          |
| `/facilities/{fid}/doctors/{did}/addresses/{aid}/bookings/{bid}`      | DELETE | Cancel booking                         |
| `/facilities/{fid}/doctors/{did}/addresses/{aid}/bookings/{bid}/move` | POST   | Move booking                           |
| `/insurance-providers`                                                | GET    | List insurance providers               |
| `/insurance-providers/{pid}/plans`                                    | GET    | Plans for a provider                   |
| `/facilities/{fid}/doctors/{did}/addresses/{aid}/insurance-providers` | GET    | Insurance at address                   |
| `/notifications/multiple`                                             | GET    | Pull notification queue                |

### 14.3 Extensions (query param `with`)

- `doctor.profile_url` — Doctor's Doctoraliar profile URL
- `doctor.specializations` — Specialization list
- `doctor.addresses` — All addresses for a doctor
- `address.online_only` — Video consultation flag
- `address.insurance_support` — Insurance type (`private`, `insurance`, `private_and_insurance`)
- `slot.services` — Services attached to slots
- `booking.patient` — Patient data on bookings
- `booking.address_service` — Service details on bookings

### 14.4 Environment Variables

```env
DOCTORALIAR_CLIENT_ID=          # OAuth2 client ID from Docplanner
DOCTORALIAR_CLIENT_SECRET=      # OAuth2 client secret
```

### 14.5 Internal API Route

`/api/doctoraliar` — Proxies requests to Doctoraliar API with auth + rate limiting.

| Param      | GET Resources                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| `resource` | `facilities`, `doctors`, `doctor`, `addresses`, `services`, `slots`, `bookings`, `insurances`, `address-insurances` |

POST actions: `book` (book a slot), `cancel` (cancel a booking).

---

## Quick Reference: Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Daily.co
DAILY_API_KEY=
NEXT_PUBLIC_DAILY_DOMAIN=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=

# Resend
RESEND_API_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Nubix Cloud
NUBIX_API_URL=
NUBIX_API_KEY=
NUBIX_TENANT_ID=

# AFIP
AFIP_CUIT=
AFIP_CERT_PATH=
AFIP_KEY_PATH=
AFIP_WSAA_URL=
AFIP_WSFE_URL=
AFIP_ENVIRONMENT=              # "production" or "homologacion"

# Doctoraliar (Docplanner)
DOCTORALIAR_CLIENT_ID=
DOCTORALIAR_CLIENT_SECRET=
```

---

## Rate Limits Summary

| Service         | Limit                                        | Notes                                    |
| --------------- | -------------------------------------------- | ---------------------------------------- |
| **Daily.co**    | 20 req/s (most), 2 req/s (delete/recordings) | Per API key                              |
| **Resend**      | 2 req/s                                      | Per team, increasable                    |
| **MercadoPago** | Varies by endpoint                           | See MP docs                              |
| **Supabase**    | Depends on plan                              | Free: 500 req/s                          |
| **Google APIs** | Varies by API                                | Calendar: 1M queries/day, Places: varies |
| **Twilio**      | 1 msg/s (WhatsApp sandbox)                   | Higher in production                     |
| **Upstash**     | 1000 req/s (free), higher on paid            | Per database                             |
| **Doctoraliar** | 8,000 GET/hour, 40 POST/minute               | Per OAuth2 client, adjustable on request |

---

## Authentication Summary

| Service           | Method                         | Header/Format                                       |
| ----------------- | ------------------------------ | --------------------------------------------------- |
| **Supabase**      | API Key + JWT                  | `apikey: {anon_key}`, `Authorization: Bearer {jwt}` |
| **Google**        | OAuth 2.0 Bearer               | `Authorization: Bearer {access_token}`              |
| **Google Places** | API Key                        | `X-Goog-Api-Key: {key}`                             |
| **Daily.co**      | API Key                        | `Authorization: Bearer {DAILY_API_KEY}`             |
| **Twilio**        | Basic Auth                     | `Authorization: Basic {base64(sid:token)}`          |
| **MercadoPago**   | Bearer Token                   | `Authorization: Bearer {ACCESS_TOKEN}`              |
| **Resend**        | API Key                        | `Authorization: Bearer re_xxxxxxxxx`                |
| **Upstash**       | REST Token                     | Via SDK config or `Authorization: Bearer {token}`   |
| **Sentry**        | DSN + Auth Token               | DSN in client config, Auth Token for API            |
| **Nubix**         | API Key + Tenant               | `Authorization: Bearer {key}`, `X-Tenant-ID: {id}`  |
| **AFIP**          | X.509 Certificate + WSAA Token | SOAP headers with Token + Sign                      |
| **Doctoraliar**   | OAuth2 Bearer                  | `Authorization: Bearer {access_token}`              |
