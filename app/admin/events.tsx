import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { hasSupabaseEnv, supabase } from '@/lib/supabase';
import { AdminEventRow, deleteEvent, listEvents, replaceEventMediaImages, saveEvent, uploadImageToStorage } from '@/services/events-admin';

const C = {
  bg: '#EFF2FF',
  white: '#FFFFFF',
  ink: '#16134A',
  mid: '#6B6899',
  soft: '#AAA8C8',
  line: '#E4E2F4',
  blue: '#2B5BFF',
  rose: '#FF3D5C',
};

type FormState = {
  id: string;
  name: string;
  venue: string;
  event_tag: '野外' | '室内';
  start_at: string;
  end_at: string;
  ticket_label: string;
  is_free: boolean;
  ticket_price_yen: string;
  url: string;
  description: string;
  dressing_room_available: boolean;
  photo_allowed: boolean;
  latitude: string;
  longitude: string;
  image_urls: string[];
};

const emptyForm: FormState = {
  id: '',
  name: '',
  venue: '',
  event_tag: '野外',
  start_at: '2026-03-20T10:00',
  end_at: '2026-03-20T17:00',
  ticket_label: '無料',
  is_free: true,
  ticket_price_yen: '',
  url: '',
  description: '',
  dressing_room_available: true,
  photo_allowed: true,
  latitude: '35.6812',
  longitude: '139.7671',
  image_urls: ['', '', ''],
};

function toDatetimeLocal(v: string) {
  if (!v) return '';
  return v.replace('Z', '').slice(0, 16);
}

function toIsoWithJst(v: string) {
  if (!v) return '';
  return `${v}:00+09:00`;
}

function toForm(row: AdminEventRow): FormState {
  const imgs = (row.event_media ?? [])
    .filter((m) => m.media_type === 'image_url')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => m.image_url ?? '');
  return {
    id: String(row.id),
    name: row.name,
    venue: row.venue,
    event_tag: row.event_tag === '室内' ? '室内' : '野外',
    start_at: toDatetimeLocal(row.start_at),
    end_at: toDatetimeLocal(row.end_at),
    ticket_label: row.ticket_label,
    is_free: row.is_free,
    ticket_price_yen: row.ticket_price_yen == null ? '' : String(row.ticket_price_yen),
    url: row.url ?? '',
    description: row.description,
    dressing_room_available: row.dressing_room_available,
    photo_allowed: row.photo_allowed,
    latitude: row.latitude == null ? '' : String(row.latitude),
    longitude: row.longitude == null ? '' : String(row.longitude),
    image_urls: [imgs[0] ?? '', imgs[1] ?? '', imgs[2] ?? ''],
  };
}

function DateField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  if (Platform.OS === 'web') {
    return React.createElement('input', {
      type: 'datetime-local',
      value,
      placeholder,
      onChange: (e: any) => onChange(e.target.value),
      style: {
        minHeight: 44,
        borderRadius: 12,
        border: `2px solid ${C.line}`,
        background: C.bg,
        color: C.ink,
        padding: '0 10px',
        fontSize: 14,
        width: '100%',
        boxSizing: 'border-box',
      },
    });
  }
  return <TextInput value={value} onChangeText={onChange} placeholder={placeholder} style={styles.input} />;
}

export default function AdminEventsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ k?: string; key?: string; token?: string }>();
  const requiredEntryKey = (process.env.EXPO_PUBLIC_ADMIN_ENTRY_KEY ?? '').trim();
  const incomingEntryKey = String(params.k ?? params.key ?? params.token ?? '').trim();
  const canOpenAdmin = requiredEntryKey.length > 0 && incomingEntryKey.length > 0 && incomingEntryKey === requiredEntryKey;
  const [rows, setRows] = useState<AdminEventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listEvents();
      setRows(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'イベント取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const check = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      const has = Boolean(data.session?.user);
      setSignedIn(has);
      if (has) refresh();
    };
    check();
  }, []);

  const signInAdmin = async () => {
    if (!supabase) return;
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: mail, password: pass });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSignedIn(true);
    refresh();
  };

  const signOutAdmin = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSignedIn(false);
    setRows([]);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const pickImage = async (slot: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      selectionLimit: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setForm((f) => {
        const next = [...f.image_urls];
        next[slot] = result.assets[0].uri;
        return { ...f, image_urls: next };
      });
    }
  };

  const clearImage = (slot: number) => {
    setForm((f) => {
      const next = [...f.image_urls];
      next[slot] = '';
      return { ...f, image_urls: next };
    });
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const id = await saveEvent({
        id: form.id ? Number(form.id) : undefined,
        name: form.name,
        venue: form.venue,
        event_tag: form.event_tag,
        start_at: toIsoWithJst(form.start_at),
        end_at: toIsoWithJst(form.end_at),
        ticket_label: form.ticket_label,
        is_free: form.is_free,
        ticket_price_yen: form.is_free || form.ticket_price_yen === '' ? null : Number(form.ticket_price_yen),
        url: form.url || null,
        description: form.description,
        dressing_room_available: form.dressing_room_available,
        photo_allowed: form.photo_allowed,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      });

      const eventId = id ?? Number(form.id);
      const uploaded: string[] = [];
      for (let i = 0; i < form.image_urls.length; i += 1) {
        const u = form.image_urls[i];
        if (!u) continue;
        if (u.startsWith('http')) {
          uploaded.push(u);
        } else {
          const url = await uploadImageToStorage(u, eventId, i + 1);
          uploaded.push(url);
        }
      }
      await replaceEventMediaImages(eventId, uploaded);

      setEditorOpen(false);
      setForm(emptyForm);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const visibleRows = useMemo(() => {
    const now = new Date().toISOString();
    if (showPast) return rows;
    return rows.filter((r) => r.end_at >= now);
  }, [rows, showPast]);

  if (!hasSupabaseEnv) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.page}>
          <Text style={styles.title}>イベント管理</Text>
          <Text style={styles.help}>Supabase環境変数が未設定です（EXPO_PUBLIC_SUPABASE_URL / ANON_KEY）。</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!canOpenAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.page}>
          <Text style={styles.title}>アクセス不可</Text>
          <Text style={styles.help}>このページは専用URLからのみ開けます。</Text>
          <Pressable onPress={() => router.replace('/(tabs)')} style={styles.smallBtn}>
            <Text style={styles.smallBtnText}>ホームに戻る</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={editorOpen} animationType="slide" transparent onRequestClose={() => setEditorOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.headRow}>
              <Text style={styles.title}>{form.id ? 'イベント編集' : 'イベント新規作成'}</Text>
              <Pressable onPress={() => setEditorOpen(false)} style={styles.iconBtn}><Ionicons name="close" size={18} color={C.mid} /></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
              <TextInput value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="イベント名" style={styles.input} />
              <TextInput value={form.venue} onChangeText={(v) => setForm((f) => ({ ...f, venue: v }))} placeholder="会場" style={styles.input} />

              <View style={styles.tagRow}>
                {(['野外', '室内'] as const).map((tag) => (
                  <Pressable key={tag} onPress={() => setForm((f) => ({ ...f, event_tag: tag }))} style={[styles.tagChip, form.event_tag === tag && styles.tagChipOn]}>
                    <Text style={[styles.tagChipText, form.event_tag === tag && styles.tagChipTextOn]}>{tag}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>開始日時</Text>
              <DateField value={form.start_at} onChange={(v) => setForm((f) => ({ ...f, start_at: v }))} placeholder="開始日時" />
              <Text style={styles.fieldLabel}>終了日時</Text>
              <DateField value={form.end_at} onChange={(v) => setForm((f) => ({ ...f, end_at: v }))} placeholder="終了日時" />

              <TextInput value={form.ticket_label} onChangeText={(v) => setForm((f) => ({ ...f, ticket_label: v }))} placeholder="料金表示（例: 1500円）" style={styles.input} />
              {!form.is_free ? (
                <TextInput value={form.ticket_price_yen} onChangeText={(v) => setForm((f) => ({ ...f, ticket_price_yen: v }))} placeholder="価格（円）" style={styles.input} keyboardType="numeric" />
              ) : null}
              <TextInput value={form.url} onChangeText={(v) => setForm((f) => ({ ...f, url: v }))} placeholder="公式URL" style={styles.input} autoCapitalize="none" />
              <TextInput value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="説明" style={[styles.input, { minHeight: 80 }]} multiline />

              <Text style={styles.fieldLabel}>地図の位置（緯度・経度）</Text>
              <Text style={styles.fieldSub}>この値でマップのピン位置が決まります（例: 東京駅 35.6812 / 139.7671）</Text>
              <View style={styles.row2}>
                <TextInput value={form.latitude} onChangeText={(v) => setForm((f) => ({ ...f, latitude: v }))} placeholder="緯度 例: 35.6812" style={[styles.input, { flex: 1 }]} />
                <TextInput value={form.longitude} onChangeText={(v) => setForm((f) => ({ ...f, longitude: v }))} placeholder="経度 例: 139.7671" style={[styles.input, { flex: 1 }]} />
              </View>

              <Text style={styles.fieldLabel}>画像（最大3枚・スライド表示）</Text>
              <View style={styles.imgGrid}>
                {[0, 1, 2].map((slot) => (
                  <View key={slot} style={styles.imgSlotWrap}>
                    <Pressable onPress={() => pickImage(slot)} style={styles.uploadBtn}>
                      <Ionicons name="image-outline" size={15} color={C.blue} />
                      <Text style={styles.uploadText}>{form.image_urls[slot] ? `画像${slot + 1}を変更` : `画像${slot + 1}を選ぶ`}</Text>
                    </Pressable>
                    {form.image_urls[slot] ? (
                      <>
                        <Image source={{ uri: form.image_urls[slot] }} style={styles.previewImg} />
                        <Pressable onPress={() => clearImage(slot)} style={styles.clearBtn}><Text style={styles.clearBtnText}>削除</Text></Pressable>
                      </>
                    ) : null}
                  </View>
                ))}
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>料金区分</Text>
                <View style={styles.tagRow}>
                  {[{ label: '無料', value: true }, { label: '有料', value: false }].map((x) => (
                    <Pressable key={x.label} onPress={() => setForm((f) => ({ ...f, is_free: x.value }))} style={[styles.tagChip, form.is_free === x.value && styles.tagChipOn]}>
                      <Text style={[styles.tagChipText, form.is_free === x.value && styles.tagChipTextOn]}>{x.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>更衣室</Text>
                <View style={styles.tagRow}>
                  {[{ label: '更衣室あり', value: true }, { label: '更衣室なし', value: false }].map((x) => (
                    <Pressable key={x.label} onPress={() => setForm((f) => ({ ...f, dressing_room_available: x.value }))} style={[styles.tagChip, form.dressing_room_available === x.value && styles.tagChipOn]}>
                      <Text style={[styles.tagChipText, form.dressing_room_available === x.value && styles.tagChipTextOn]}>{x.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable onPress={submit} style={styles.primaryBtn}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>保存する</Text>}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← 戻る</Text>
        </Pressable>
        <View style={styles.headRow}>
          <Text style={styles.title}>イベント管理</Text>
          {signedIn ? <Pressable onPress={signOutAdmin} style={styles.smallBtn}><Text style={styles.smallBtnText}>ログアウト</Text></Pressable> : null}
        </View>

        {!signedIn ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>管理者ログイン</Text>
            <TextInput value={mail} onChangeText={setMail} placeholder="admin@example.com" style={styles.input} autoCapitalize="none" />
            <TextInput value={pass} onChangeText={setPass} placeholder="password" style={styles.input} secureTextEntry />
            <Pressable onPress={signInAdmin} style={styles.primaryBtn}><Text style={styles.primaryBtnText}>ログイン</Text></Pressable>
          </View>
        ) : (
          <>
            <View style={styles.toolbar}>
              <Pressable onPress={openCreate} style={styles.primaryBtnSmall}><Text style={styles.primaryBtnText}>+ 新規イベント</Text></Pressable>
              <Pressable onPress={() => setShowPast((v) => !v)} style={styles.toggleBtn}><Text style={styles.toggleText}>{showPast ? '過去イベントを隠す' : '過去イベントを表示'}</Text></Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>イベント一覧</Text>
              {loading ? <ActivityIndicator color={C.blue} /> : null}
              {visibleRows.map((r) => {
                const thumb = r.event_media?.find((m) => m.sort_order === 1)?.image_url;
                return (
                  <View key={r.id} style={styles.listRow}>
                    {thumb ? <Image source={{ uri: thumb }} style={styles.thumb} /> : <View style={styles.thumbFallback}><Ionicons name="image-outline" size={16} color={C.soft} /></View>}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listTitle}>{r.name}</Text>
                      <Text style={styles.listSub}>{r.venue}</Text>
                      <Text style={styles.listSub2}>{r.start_at.slice(0, 10)} ・ {r.event_tag}</Text>
                    </View>
                    <Pressable onPress={() => { setForm(toForm(r)); setEditorOpen(true); }} style={styles.iconBtn}><Ionicons name="create-outline" size={16} color={C.mid} /></Pressable>
                    <Pressable onPress={() => deleteEvent(r.id).then(refresh)} style={styles.iconBtn}><Ionicons name="trash-outline" size={16} color={C.rose} /></Pressable>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  page: { padding: 16, gap: 10, paddingBottom: 30 },
  back: { color: C.blue, fontSize: 13, fontFamily: 'Nunito_700Bold' },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: C.ink, fontSize: 22, fontFamily: 'Nunito_900Black' },
  help: { color: C.mid, fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  card: { backgroundColor: C.white, borderRadius: 18, padding: 14, gap: 8 },
  cardTitle: { color: C.ink, fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  fieldBlock: { gap: 6 },
  fieldLabel: { color: C.mid, fontSize: 11, fontFamily: 'Nunito_700Bold' },
  fieldSub: { color: C.soft, fontSize: 10, fontFamily: 'Nunito_600SemiBold', marginTop: -4 },
  input: { minHeight: 44, borderRadius: 12, borderWidth: 2, borderColor: C.line, backgroundColor: C.bg, paddingHorizontal: 10, color: C.ink },
  tagRow: { flexDirection: 'row', gap: 6 },
  tagChip: { flex: 1, minHeight: 36, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  tagChipOn: { backgroundColor: C.blue },
  tagChipText: { color: C.mid, fontSize: 12, fontFamily: 'Nunito_700Bold' },
  tagChipTextOn: { color: C.white },
  row2: { flexDirection: 'row', gap: 8 },
  imgGrid: { gap: 8 },
  imgSlotWrap: { gap: 6 },
  uploadBtn: { minHeight: 40, borderRadius: 12, backgroundColor: C.bg, borderWidth: 2, borderColor: C.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  uploadText: { color: C.blue, fontSize: 12, fontFamily: 'Nunito_700Bold' },
  previewImg: { height: 130, borderRadius: 14, backgroundColor: C.bg },
  clearBtn: { alignSelf: 'flex-end', borderRadius: 8, backgroundColor: '#FFE9ED', paddingHorizontal: 8, paddingVertical: 5 },
  clearBtnText: { color: C.rose, fontSize: 11, fontFamily: 'Nunito_700Bold' },

  primaryBtn: { minHeight: 44, borderRadius: 12, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  primaryBtnSmall: { minHeight: 40, borderRadius: 10, backgroundColor: C.blue, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: C.white, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  smallBtn: { minHeight: 34, borderRadius: 10, backgroundColor: '#E8EDFF', paddingHorizontal: 10, justifyContent: 'center' },
  smallBtnText: { color: C.blue, fontSize: 12, fontFamily: 'Nunito_700Bold' },
  toolbar: { flexDirection: 'row', gap: 8 },
  toggleBtn: { minHeight: 40, borderRadius: 10, backgroundColor: C.white, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  toggleText: { color: C.mid, fontSize: 12, fontFamily: 'Nunito_700Bold' },
  listRow: { borderRadius: 14, backgroundColor: C.bg, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: C.line },
  thumbFallback: { width: 56, height: 56, borderRadius: 12, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  listTitle: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  listSub: { color: C.mid, fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  listSub2: { color: C.soft, fontSize: 10, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(22,19,74,0.58)', justifyContent: 'flex-end' },
  modalSheet: { maxHeight: '92%', backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  error: { color: C.rose, fontSize: 12, fontFamily: 'Nunito_700Bold' },
});
