# CosMap (Expo + Supabase)

## Local Run

```bash
npm install
npx expo start -c
```

## Environment Variables

Create `.env` in project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Supabase Setup

Run SQL in order:

1. `supabase/cosmap_schema.sql`
2. `supabase/rls_push_admin.sql`

### Create an admin user

1. Create user in Supabase Auth (email/password).
2. Add the user to `public.app_admins`:

```sql
insert into public.app_admins(auth_user_id)
values ('<auth.users.id>');
```

3. Link app profile to auth user (for push token ownership):

```sql
update public.profiles
set auth_user_id = '<auth.users.id>'
where id = '11111111-1111-1111-1111-111111111999';
```

## Push Notifications

### Client side

- App registers Expo Push Token after login flow.
- Token is upserted into `public.push_tokens`.
- Location update demo triggers local notification + optional Edge Function invoke.

### Server side (real push)

Deploy edge function:

```bash
supabase functions deploy send-push --no-verify-jwt
```

Function source:
- `supabase/functions/send-push/index.ts`

This function:
- Reads target tokens from `push_tokens`
- Sends push through Expo Push API
- Saves delivery logs to `notification_logs`

## Event Admin UI

In app profile screen, open `イベント管理`.

- Admin login with Supabase email/password.
- CRUD for `public.events` with RLS (admin-only write).
- Non-admin users can read events but cannot modify.

## Map Styling

- Map tiles themselves are provider-defined (Apple/Google).
- App-level design can still be customized via:
  - marker style
  - callout style
  - overlays/cards
  - region/zoom behavior
