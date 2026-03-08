import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Animated, Easing, Image, Keyboard, Linking, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { ALL_EVENTS } from '@/constants/cosmap-data';
import { useCosMap } from '@/context/cosmap-context';

const C = {
  bg: '#F0F2FF',
  white: '#FFFFFF',
  ink: '#16134A',
  mid: '#6B6899',
  soft: '#AAA8C8',
  line: '#E4E2F4',
  blue: '#2B5BFF',
  blueBg: '#E8EDFF',
  rose: '#FF3D5C',
};

const AVATAR_COLORS = ['#EDE9FF', '#FFE4F0', '#E0F2FE', '#FFF3E0', '#E9F7EE'];

type ProfileState = {
  name: string;
  handle: string;
  tag: string;
  bio: string;
  avatarUrl?: string;
  avatarColor: string;
  sns: { twitter: string; instagram: string; tiktok: string; other: string };
};

export default function ProfileScreen() {
  const router = useRouter();
  const { appPhase, attendedIds, logout } = useCosMap();
  const canShowAdmin = process.env.EXPO_PUBLIC_ENABLE_ADMIN === 'true';
  const attendedEvents = useMemo(() => ALL_EVENTS.filter((e) => attendedIds.has(e.id)), [attendedIds]);

  const [profile, setProfile] = useState<ProfileState>({
    name: 'raiden_cos',
    handle: 'raiden_cos',
    tag: '東京 · 原神 · スタジオ派',
    bio: 'コスプレ歴5年。原神メインで週1でイベント参加してます。',
    avatarColor: AVATAR_COLORS[0],
    avatarUrl: '',
    sns: { twitter: '@raiden_cos', instagram: 'raiden_cosplay', tiktok: '', other: '' },
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileState | null>(null);
  const keyboardShift = useState(() => new Animated.Value(0))[0];

  React.useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvt, (e: any) => {
      const toValue = Math.max(0, (e?.endCoordinates?.height ?? 0) - 24);
      Animated.timing(keyboardShift, {
        toValue,
        duration: e?.duration ?? 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    const onHide = Keyboard.addListener(hideEvt, (e: any) => {
      Animated.timing(keyboardShift, {
        toValue: 0,
        duration: e?.duration ?? 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [keyboardShift]);

  const openSns = (kind: 'twitter' | 'instagram' | 'tiktok' | 'other', value: string) => {
    const raw = value.trim();
    if (!raw) return;
    if (kind === 'other') {
      const url = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
      Linking.openURL(url);
      return;
    }
    const normalized = raw.replace(/^@/, '');
    const url =
      kind === 'twitter'
        ? `https://x.com/${normalized}`
        : kind === 'instagram'
          ? `https://www.instagram.com/${normalized}`
          : `https://www.tiktok.com/@${normalized}`;
    Linking.openURL(url);
  };

  const pickAvatar = async () => {
    if (!draft) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      selectionLimit: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setDraft({ ...draft, avatarUrl: result.assets[0].uri });
    }
  };

  if (appPhase !== 'main') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>マイページ</Text>
          <Text style={styles.help}>先にホームタブからログインしてください</Text>
        </View>
      </SafeAreaView>
    );
  }

  const visibleEvents = attendedEvents.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <Modal visible={editing} animationType="slide" transparent onRequestClose={() => setEditing(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: Animated.multiply(keyboardShift, -1) }] }]}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>プロフィール編集</Text>
              <Pressable onPress={() => setEditing(false)} style={styles.iconGhost}>
                <Ionicons name="close" size={20} color={C.mid} />
              </Pressable>
            </View>

            {draft ? (
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12, paddingBottom: 16 }}>
                <View style={styles.avatarEditRow}>
                  <View style={[styles.avatar, { backgroundColor: draft.avatarColor }]}> 
                    {draft.avatarUrl ? (
                      <Image source={{ uri: draft.avatarUrl }} style={styles.avatarPhoto} />
                    ) : (
                      <Ionicons name="person" size={30} color={C.blue} />
                    )}
                  </View>
                  <Pressable onPress={pickAvatar} style={styles.avatarPickBtn}>
                    <Ionicons name="image-outline" size={14} color={C.blue} />
                    <Text style={styles.avatarPickText}>写真を選択</Text>
                  </Pressable>
                </View>
                <View style={styles.avatarPalette}>
                  {AVATAR_COLORS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setDraft({ ...draft, avatarColor: c, avatarUrl: draft.avatarUrl })}
                      style={[styles.paletteDot, { backgroundColor: c }, draft.avatarColor === c && styles.paletteDotOn]}
                    />
                  ))}
                </View>

                <TextInput value={draft.name} onChangeText={(v) => setDraft({ ...draft, name: v })} placeholder="表示名" style={styles.input} />
                <View style={styles.lockedInput}>
                  <Text style={styles.lockedLabel}>@ID（変更不可）</Text>
                  <Text style={styles.lockedValue}>@{draft.handle}</Text>
                </View>
                <TextInput value={draft.tag} onChangeText={(v) => setDraft({ ...draft, tag: v })} placeholder="タグ" style={styles.input} />
                <TextInput
                  value={draft.bio}
                  onChangeText={(v) => setDraft({ ...draft, bio: v.slice(0, 120) })}
                  placeholder="自己紹介（最大120文字）"
                  style={[styles.input, { minHeight: 82 }]}
                  multiline
                  maxLength={120}
                />
                <Text style={styles.bioCounter}>{draft.bio.length}/120</Text>
                <Text style={styles.editSectionTitle}>SNSリンク</Text>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>X (Twitter)</Text>
                  <TextInput
                    value={draft.sns.twitter}
                    onChangeText={(v) => setDraft({ ...draft, sns: { ...draft.sns, twitter: v } })}
                    placeholder="@username または https://x.com/username"
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Instagram</Text>
                  <TextInput
                    value={draft.sns.instagram}
                    onChangeText={(v) => setDraft({ ...draft, sns: { ...draft.sns, instagram: v } })}
                    placeholder="@username または https://instagram.com/username"
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>TikTok</Text>
                  <TextInput
                    value={draft.sns.tiktok}
                    onChangeText={(v) => setDraft({ ...draft, sns: { ...draft.sns, tiktok: v } })}
                    placeholder="@username または https://tiktok.com/@username"
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>その他サイト</Text>
                  <TextInput
                    value={draft.sns.other}
                    onChangeText={(v) => setDraft({ ...draft, sns: { ...draft.sns, other: v } })}
                    placeholder="https://example.com"
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </View>
                <Pressable
                  onPress={() => {
                    setProfile(draft);
                    setEditing(false);
                  }}
                  style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>保存する</Text>
                </Pressable>
              </ScrollView>
            ) : null}
          </Animated.View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.hero}>
          <View style={styles.headRow}>
            <View style={[styles.avatar, { backgroundColor: profile.avatarColor }]}> 
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarPhoto} />
              ) : (
                <Ionicons name="person" size={30} color={C.blue} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile.name}</Text>
                <Pressable
                  onPress={() => {
                    setDraft({ ...profile, sns: { ...profile.sns } });
                    setEditing(true);
                  }}
                  style={styles.editBtn}>
                  <Ionicons name="create-outline" size={12} color="#FFFFFF" />
                  <Text style={styles.editText}>編集</Text>
                </Pressable>
              </View>
              <Text style={styles.uid}>@{profile.handle}</Text>
              <Text style={styles.tag}>{profile.tag}</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </View>
          </View>

          <Pressable onPress={() => router.push('/friends')} style={styles.friendBtn}>
            <View style={styles.friendIcon}><Ionicons name="people" size={14} color="#FFFFFF" /></View>
            <Text style={styles.friendLabel}>フレンド</Text>
            <Text style={styles.friendCount}>4人</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
          </Pressable>
          {canShowAdmin ? (
            <Pressable onPress={() => router.push('/admin/events')} style={styles.adminBtn}>
              <Ionicons name="settings-outline" size={14} color="#FFFFFF" />
              <Text style={styles.adminBtnText}>イベント管理</Text>
            </Pressable>
          ) : null}
        </View>

        {(profile.sns.twitter || profile.sns.instagram || profile.sns.tiktok || profile.sns.other) ? (
          <View style={styles.card}>
            <Text style={styles.cardSmall}>SNS</Text>
            <View style={styles.snsGrid}>
              {profile.sns.twitter ? (
                <Pressable onPress={() => openSns('twitter', profile.sns.twitter)} style={[styles.snsChip, styles.snsChipX]}>
                  <Text style={[styles.snsX, { color: C.ink }]}>𝕏</Text>
                  <Text style={[styles.snsChipText, { color: C.ink }]}>X</Text>
                </Pressable>
              ) : null}
              {profile.sns.instagram ? (
                <Pressable onPress={() => openSns('instagram', profile.sns.instagram)} style={[styles.snsChip, styles.snsChipInsta]}>
                  <Ionicons name="logo-instagram" size={15} color="#E1306C" />
                  <Text style={[styles.snsChipText, { color: '#E1306C' }]}>Instagram</Text>
                </Pressable>
              ) : null}
              {profile.sns.tiktok ? (
                <Pressable onPress={() => openSns('tiktok', profile.sns.tiktok)} style={[styles.snsChip, styles.snsChipTiktok]}>
                  <Ionicons name="musical-notes" size={15} color={C.blue} />
                  <Text style={[styles.snsChipText, { color: C.blue }]}>TikTok</Text>
                </Pressable>
              ) : null}
            </View>
            {profile.sns.other ? (
              <Pressable onPress={() => openSns('other', profile.sns.other)} style={styles.snsOtherRow}>
                <Ionicons name="link-outline" size={15} color={C.mid} />
                <Text style={styles.snsOtherText} numberOfLines={1}>{profile.sns.other}</Text>
                <Ionicons name="open-outline" size={14} color={C.soft} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.iconBadge}><Ionicons name="checkmark" size={14} color={C.blue} /></View>
            <Text style={styles.cardTitle}>参加予定イベント</Text>
            {attendedEvents.length > 0 ? <Text style={styles.count}>{attendedEvents.length}</Text> : null}
          </View>
          {attendedEvents.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>参加予定のイベントはありません</Text>
              <Text style={styles.emptySub}>イベント詳細画面から登録できます</Text>
            </View>
          ) : (
            <>
              {visibleEvents.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(e.id) } })}
                  style={styles.eventRow}>
                  <View style={styles.eventDotWrap}><View style={styles.eventDot} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventName}>{e.name}</Text>
                    <Text style={styles.eventMeta}>{e.date} ・ {e.venue}</Text>
                  </View>
                </Pressable>
              ))}
              {attendedEvents.length > 3 ? (
                <Pressable onPress={() => router.push('/profile/attended')} style={styles.moreBtn}>
                  <Text style={styles.moreBtnText}>すべて見る</Text>
                  <Ionicons name="chevron-forward" size={15} color={C.blue} />
                </Pressable>
              ) : null}
            </>
          )}
        </View>

        <Pressable
          style={[styles.card, styles.logoutCard]}
          onPress={() => {
            logout();
            router.replace('/');
          }}>
          <View style={styles.logoutRow}>
            <Ionicons name="log-out-outline" size={20} color={C.rose} />
            <Text style={styles.logoutText}>ログアウト</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  page: { paddingBottom: 130, gap: 12, backgroundColor: C.bg },
  title: { fontSize: 24, color: C.ink, fontFamily: 'Nunito_900Black' },
  help: { color: C.mid, fontSize: 13, fontFamily: 'Nunito_600SemiBold' },

  hero: { backgroundColor: C.blue, paddingTop: 52, paddingHorizontal: 22, paddingBottom: 24 },
  headRow: { flexDirection: 'row', gap: 14, marginBottom: 18 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarPhoto: { width: '100%', height: '100%' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { color: C.white, fontSize: 20, fontWeight: '900' },
  editBtn: { borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { color: C.white, fontSize: 11, fontFamily: 'Nunito_700Bold' },
  uid: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'Nunito_700Bold' },
  tag: { color: 'rgba(255,255,255,0.82)', fontSize: 12, fontFamily: 'Nunito_600SemiBold', marginTop: 3 },
  bio: { color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 18, marginTop: 3 },

  friendBtn: { minHeight: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  friendIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  friendLabel: { color: C.white, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', flex: 1 },
  friendCount: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: 'Nunito_700Bold' },
  adminBtn: {
    marginTop: 8,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  adminBtnText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Nunito_700Bold' },

  card: { marginHorizontal: 16, backgroundColor: C.white, borderRadius: 24, padding: 20, gap: 12 },
  cardSmall: { color: C.soft, fontSize: 10, letterSpacing: 0.8, fontFamily: 'Nunito_800ExtraBold' },
  snsGrid: { flexDirection: 'row', gap: 8 },
  snsChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  snsChipX: { backgroundColor: 'rgba(22,19,74,0.04)', borderColor: 'rgba(22,19,74,0.2)' },
  snsChipInsta: { backgroundColor: 'rgba(225,48,108,0.07)', borderColor: 'rgba(225,48,108,0.2)' },
  snsChipTiktok: { backgroundColor: 'rgba(43,91,255,0.07)', borderColor: 'rgba(43,91,255,0.2)' },
  snsChipText: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  snsX: { fontSize: 15, fontWeight: '900' },
  snsOtherRow: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: C.bg,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  snsOtherText: { color: C.mid, fontSize: 12, fontFamily: 'Nunito_700Bold', flex: 1 },

  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  iconBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.blueBg, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', flex: 1 },
  count: { color: '#FFFFFF', backgroundColor: C.blue, minWidth: 18, height: 18, borderRadius: 9, textAlign: 'center', textAlignVertical: 'center', fontSize: 10, fontFamily: 'Nunito_800ExtraBold', overflow: 'hidden', paddingHorizontal: 5 },

  emptyWrap: { paddingVertical: 18, alignItems: 'center' },
  emptyTitle: { color: C.mid, fontSize: 13, fontFamily: 'Nunito_700Bold' },
  emptySub: { color: C.soft, fontSize: 11, fontFamily: 'Nunito_500Medium', marginTop: 3 },

  eventRow: { borderRadius: 16, backgroundColor: C.bg, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventDotWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.blueBg, alignItems: 'center', justifyContent: 'center' },
  eventDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.blue },
  eventName: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  eventMeta: { color: C.mid, fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 3 },
  moreBtn: {
    borderRadius: 12,
    minHeight: 38,
    backgroundColor: C.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  moreBtnText: { color: C.blue, fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },

  logoutCard: { paddingVertical: 18 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoutText: { color: C.rose, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(22,19,74,0.58)', justifyContent: 'flex-end' },
  modalSheet: { maxHeight: '92%', backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { color: C.ink, fontSize: 17, fontFamily: 'Nunito_900Black' },
  iconGhost: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  avatarEditRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPickBtn: { minHeight: 38, borderRadius: 12, paddingHorizontal: 12, backgroundColor: C.blueBg, flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatarPickText: { color: C.blue, fontSize: 12, fontFamily: 'Nunito_700Bold' },
  avatarPalette: { flexDirection: 'row', gap: 8 },
  paletteDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  paletteDotOn: { borderColor: C.blue },
  editSectionTitle: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  fieldGroup: { gap: 6 },
  fieldLabel: { color: C.mid, fontSize: 11, fontFamily: 'Nunito_700Bold' },
  input: { minHeight: 48, borderRadius: 12, borderWidth: 2, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 10, color: C.ink, backgroundColor: C.bg },
  bioCounter: { color: C.soft, fontSize: 11, fontFamily: 'Nunito_700Bold', textAlign: 'right', marginTop: -6 },
  lockedInput: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.line,
    paddingHorizontal: 12,
    backgroundColor: '#ECEBFA',
    justifyContent: 'center',
  },
  lockedLabel: { color: C.soft, fontSize: 10, fontFamily: 'Nunito_700Bold' },
  lockedValue: { color: C.mid, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', marginTop: 2 },
  saveBtn: { minHeight: 48, borderRadius: 14, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: C.white, fontSize: 14, fontFamily: 'Nunito_900Black' },
});
