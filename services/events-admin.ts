import { supabase } from '@/lib/supabase';

export type AdminEventRow = {
  id: number;
  name: string;
  venue: string;
  event_tag: '野外' | '室内' | '大規模';
  start_at: string;
  end_at: string;
  ticket_label: string;
  is_free: boolean;
  ticket_price_yen: number | null;
  url: string | null;
  description: string;
  dressing_room_available: boolean;
  photo_allowed: boolean;
  latitude: number | null;
  longitude: number | null;
  event_media?: {
    id: number;
    sort_order: number;
    media_type: 'color' | 'image_url';
    image_url: string | null;
    color_hex: string | null;
  }[];
};

export async function listEvents() {
  if (!supabase) throw new Error('Supabaseが未設定です');
  const { data, error } = await supabase
    .from('events')
    .select('*, event_media(id, sort_order, media_type, image_url, color_hex)')
    .order('start_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as AdminEventRow[];
}

export async function getEventById(id: number) {
  if (!supabase) throw new Error('Supabaseが未設定です');
  const { data, error } = await supabase
    .from('events')
    .select('*, event_media(id, sort_order, media_type, image_url, color_hex)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as AdminEventRow;
}

export async function saveEvent(input: Partial<AdminEventRow>) {
  if (!supabase) throw new Error('Supabaseが未設定です');
  const payload = {
    name: input.name,
    venue: input.venue,
    event_tag: input.event_tag,
    start_at: input.start_at,
    end_at: input.end_at,
    ticket_label: input.ticket_label,
    is_free: input.is_free,
    ticket_price_yen: input.ticket_price_yen,
    url: input.url,
    description: input.description,
    dressing_room_available: input.dressing_room_available,
    photo_allowed: input.photo_allowed,
    latitude: input.latitude,
    longitude: input.longitude,
  };

  if (input.id) {
    const { error } = await supabase.from('events').update(payload).eq('id', input.id);
    if (error) throw error;
    return input.id;
  }
  const { data, error } = await supabase.from('events').insert(payload).select('id').single();
  if (error) throw error;
  return data.id as number;
}

export async function deleteEvent(id: number) {
  if (!supabase) throw new Error('Supabaseが未設定です');
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertPrimaryMedia(eventId: number, imageUrl: string) {
  if (!supabase) throw new Error('Supabaseが未設定です');
  const { error } = await supabase.from('event_media').upsert(
    {
      event_id: eventId,
      sort_order: 1,
      media_type: 'image_url',
      image_url: imageUrl,
      color_hex: null,
    },
    { onConflict: 'event_id,sort_order' },
  );
  if (error) throw error;
}

export async function uploadImageToStorage(uri: string, eventId: number, slot: number = 1) {
  if (!supabase) throw new Error('Supabaseが未設定です');
  const res = await fetch(uri);
  const blob = await res.blob();
  const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const path = `event-${eventId}-s${slot}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('event-media').upload(path, blob, {
    upsert: false,
    contentType: blob.type || 'image/jpeg',
  });
  if (error) throw error;
  const { data } = supabase.storage.from('event-media').getPublicUrl(path);
  return data.publicUrl;
}

export async function replaceEventMediaImages(eventId: number, imageUrls: string[]) {
  if (!supabase) throw new Error('Supabaseが未設定です');

  const cleaned = imageUrls.filter((u) => u.trim().length > 0).slice(0, 3);
  const { error: deleteErr } = await supabase.from('event_media').delete().eq('event_id', eventId).lte('sort_order', 3);
  if (deleteErr) throw deleteErr;

  if (cleaned.length === 0) return;

  const rows = cleaned.map((url, idx) => ({
    event_id: eventId,
    sort_order: idx + 1,
    media_type: 'image_url' as const,
    image_url: url,
    color_hex: null,
  }));
  const { error } = await supabase.from('event_media').insert(rows);
  if (error) throw error;
}
