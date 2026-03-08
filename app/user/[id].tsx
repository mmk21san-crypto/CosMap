import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CosMapBottomNav from '@/components/cosmap-bottom-nav';
import UserAvatar from '@/components/user-avatar';
import { ALL_EVENTS, FOLLOWING } from '@/constants/cosmap-data';
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
};

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { attendedIds } = useCosMap();

  const user = FOLLOWING.find((u) => u.id === id);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.page}>
          <Text style={styles.help}>ユーザーが見つかりません</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>戻る</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const userEvents = ALL_EVENTS.filter((e) => user.attending.includes(e.id));
  const openSns = (kind: 'twitter' | 'instagram' | 'tiktok', value: string) => {
    const raw = value.trim().replace(/^@/, '');
    if (!raw) return;
    const url =
      kind === 'twitter'
        ? `https://x.com/${raw}`
        : kind === 'instagram'
          ? `https://www.instagram.com/${raw}`
          : `https://www.tiktok.com/@${raw}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← 戻る</Text>
        </Pressable>

        <View style={styles.header}>
          <UserAvatar uri={user.avatarUrl} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.userId}>@{user.name}</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        </View>

        {(user.sns.twitter || user.sns.instagram || user.sns.tiktok) ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>SNS</Text>
            <View style={styles.snsGrid}>
              {user.sns.twitter ? (
                <Pressable onPress={() => openSns('twitter', user.sns.twitter)} style={[styles.snsChip, styles.snsChipX]}>
                  <Text style={styles.snsX}>𝕏</Text>
                  <Text style={[styles.snsText, { color: C.ink }]}>X</Text>
                </Pressable>
              ) : null}
              {user.sns.instagram ? (
                <Pressable onPress={() => openSns('instagram', user.sns.instagram)} style={[styles.snsChip, styles.snsChipInsta]}>
                  <Ionicons name="logo-instagram" size={14} color="#E1306C" />
                  <Text style={[styles.snsText, { color: '#E1306C' }]}>Instagram</Text>
                </Pressable>
              ) : null}
              {user.sns.tiktok ? (
                <Pressable onPress={() => openSns('tiktok', user.sns.tiktok)} style={[styles.snsChip, styles.snsChipTiktok]}>
                  <Ionicons name="musical-notes" size={14} color={C.blue} />
                  <Text style={[styles.snsText, { color: C.blue }]}>TikTok</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{user.displayName} の参加予定</Text>
          {userEvents.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(e.id) } })}
              style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{e.name}</Text>
                <Text style={styles.rowSub}>{e.date} ・ {e.venue}</Text>
              </View>
              {attendedIds.has(e.id) ? <Text style={styles.badge}>参加予定</Text> : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <CosMapBottomNav active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  page: { padding: 16, gap: 12, paddingBottom: 118 },
  back: { color: C.blue, fontSize: 13, fontFamily: 'Nunito_700Bold' },
  help: { color: C.mid, fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  header: { backgroundColor: C.white, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12 },
  displayName: { color: C.ink, fontSize: 18, fontFamily: undefined, fontWeight: '900' },
  userId: { color: C.soft, fontSize: 12, fontFamily: 'Nunito_700Bold', marginTop: 2 },
  bio: { color: C.mid, fontSize: 12, fontFamily: undefined, marginTop: 6, lineHeight: 18 },
  card: { backgroundColor: C.white, borderRadius: 20, padding: 16, gap: 10 },
  cardTitle: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', marginBottom: 2 },
  snsGrid: { flexDirection: 'row', gap: 8 },
  snsChip: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  snsChipX: { backgroundColor: 'rgba(22,19,74,0.04)', borderColor: 'rgba(22,19,74,0.2)' },
  snsChipInsta: { backgroundColor: 'rgba(225,48,108,0.07)', borderColor: 'rgba(225,48,108,0.2)' },
  snsChipTiktok: { backgroundColor: 'rgba(43,91,255,0.07)', borderColor: 'rgba(43,91,255,0.2)' },
  snsText: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  snsX: { color: C.ink, fontSize: 15, fontWeight: '900' },
  row: { borderRadius: 14, backgroundColor: C.bg, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowTitle: { color: C.ink, fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  rowSub: { color: C.mid, fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 4 },
  badge: { color: C.blue, backgroundColor: C.blueBg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4, fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
});
