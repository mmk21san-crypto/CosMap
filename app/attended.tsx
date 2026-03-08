import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ALL_EVENTS } from '@/constants/cosmap-data';
import { useCosMap } from '@/context/cosmap-context';

export default function AttendedScreen() {
  const router = useRouter();
  const { attendedIds, appPhase } = useCosMap();
  const events = useMemo(() => ALL_EVENTS.filter((e) => attendedIds.has(e.id)), [attendedIds]);

  if (appPhase !== 'main') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.page}>
          <Text style={styles.title}>参加予定</Text>
          <Text style={styles.rowSub}>先にホームタブからログインしてください</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← 戻る</Text>
        </Pressable>
        <Text style={styles.title}>参加予定</Text>
        {events.length === 0 ? <Text style={styles.help}>参加予定のイベントはありません</Text> : null}
        {events.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(e.id) } })}
            style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.rowTitle}>{e.name}</Text>
              <Text style={styles.rowSub}>{e.venue}</Text>
            </View>
            <Text style={styles.badge}>参加予定</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2FF' },
  page: { padding: 20, gap: 10 },
  back: { color: '#2B5BFF', fontWeight: '700', fontFamily: 'Nunito_700Bold' },
  title: { fontSize: 24, fontWeight: '900', color: '#16134A', fontFamily: 'Nunito_900Black' },
  help: { color: '#6B6899', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  row: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowMain: { flex: 1, paddingRight: 10 },
  rowTitle: { fontWeight: '800', color: '#16134A', fontFamily: 'Nunito_800ExtraBold', fontSize: 14 },
  rowSub: { marginTop: 4, color: '#6B6899', fontSize: 12 },
  badge: {
    color: '#2B5BFF',
    backgroundColor: '#E8EDFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    fontSize: 11,
    fontWeight: '700', fontFamily: 'Nunito_700Bold',
  },
});
