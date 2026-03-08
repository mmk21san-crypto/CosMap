import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CosMapBottomNav from '@/components/cosmap-bottom-nav';
import { ALL_EVENTS } from '@/constants/cosmap-data';
import { useCosMap } from '@/context/cosmap-context';

const C = {
  bg: '#F0F2FF',
  white: '#FFFFFF',
  ink: '#16134A',
  mid: '#6B6899',
  soft: '#AAA8C8',
  blue: '#2B5BFF',
  blueBg: '#E8EDFF',
};

export default function ProfileAttendedScreen() {
  const router = useRouter();
  const { attendedIds } = useCosMap();
  const events = useMemo(() => ALL_EVENTS.filter((e) => attendedIds.has(e.id)), [attendedIds]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← 戻る</Text>
        </Pressable>
        <Text style={styles.title}>参加予定イベント</Text>
        {events.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(e.id) } })}
            style={styles.row}>
            <View style={styles.icon}><View style={styles.dot} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{e.name}</Text>
              <Text style={styles.meta}>{e.date} ・ {e.venue}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.soft} />
          </Pressable>
        ))}
      </ScrollView>
      <CosMapBottomNav active="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  page: { padding: 16, gap: 10, paddingBottom: 120 },
  back: { color: C.blue, fontSize: 13, fontFamily: 'Nunito_700Bold' },
  title: { color: C.ink, fontSize: 22, fontFamily: 'Nunito_900Black' },
  row: { borderRadius: 16, backgroundColor: C.white, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.blueBg, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.blue },
  name: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  meta: { color: C.mid, fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 3 },
});
