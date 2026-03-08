// @ts-nocheck
// Supabase Edge Function: send-push
// Deploy: supabase functions deploy send-push --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { title, body, targetProfileIds } = await req.json();
    if (!title || !body || !Array.isArray(targetProfileIds)) {
      return new Response(JSON.stringify({ error: 'invalid payload' }), { status: 400 });
    }

    const { data: tokens, error } = await supabaseAdmin
      .from('push_tokens')
      .select('expo_push_token, profile_id')
      .in('profile_id', targetProfileIds);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const messages = (tokens ?? []).map((t) => ({
      to: t.expo_push_token,
      sound: 'default',
      title,
      body,
      data: { profileId: t.profile_id },
    }));

    if (messages.length > 0) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
    }

    await supabaseAdmin.from('notification_logs').insert(
      targetProfileIds.map((profileId: string) => ({
        target_profile_id: profileId,
        title,
        body,
        payload: {},
        sent_at: new Date().toISOString(),
      })),
    );

    return new Response(JSON.stringify({ ok: true, sent: messages.length }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }), { status: 500 });
  }
});
