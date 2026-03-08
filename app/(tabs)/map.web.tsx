import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ALL_EVENTS } from '@/constants/cosmap-data';
import { useCosMap } from '@/context/cosmap-context';

const C = {
  bg: '#EFF2FF',
  white: '#FFFFFF',
  ink: '#16134A',
  mid: '#6B6899',
  soft: '#AAA8C8',
  line: '#E4E2F4',
  blue: '#2B5BFF',
};

const EVENT_COORDS: Record<number, { latitude: number; longitude: number }> = {
  1: { latitude: 35.7303, longitude: 139.7175 },
  2: { latitude: 35.6594, longitude: 139.6989 },
  3: { latitude: 35.6298, longitude: 139.7966 },
  4: { latitude: 35.6486, longitude: 140.0357 },
  5: { latitude: 34.6654, longitude: 135.5046 },
};

export default function MapScreenWeb() {
  const router = useRouter();
  const { appPhase } = useCosMap();

  const points = useMemo(
    () =>
      ALL_EVENTS.filter((e) => EVENT_COORDS[e.id]).map((e) => ({
        ...e,
        ...EVENT_COORDS[e.id],
      })),
    [],
  );

  if (appPhase !== 'main') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>マップ</Text>
          <Text style={styles.help}>ホームからログインしてください</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.title}>マップ（Web簡易版）</Text>
        <View style={styles.card}>
          {points.map((p) => (
            <Pressable key={p.id} onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(p.id) } })} style={styles.row}>
              <View style={styles.dot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{p.name}</Text>
                <Text style={styles.rowSub}>{p.venue}</Text>
              </View>
              <Text style={styles.coord}>{p.latitude.toFixed(3)}, {p.longitude.toFixed(3)}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  page: { padding: 16, gap: 12, paddingBottom: 130 },
  title: { fontSize: 22, color: C.ink, fontFamily: 'Nunito_900Black' },
  help: { color: C.mid, fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  card: { borderRadius: 20, backgroundColor: C.white, padding: 12, gap: 8, borderWidth: 2, borderColor: C.line },
  row: { borderRadius: 12, backgroundColor: C.bg, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.blue },
  rowTitle: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  rowSub: { color: C.mid, fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  coord: { color: C.soft, fontSize: 10, fontFamily: 'Nunito_600SemiBold' },
});
