import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type MapPoint = {
  id: number;
  name: string;
  venue: string;
  latitude: number;
  longitude: number;
};

export default function EventMapWebFallback({
  points,
  onPressPoint,
}: {
  points: MapPoint[];
  onPressPoint: (id: number) => void;
  onUserCoordChange: (coord: { latitude: number; longitude: number } | null) => void;
  focusToken?: number;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>マップ（Web簡易版）</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {points.map((p) => (
          <Pressable key={p.id} onPress={() => onPressPoint(p.id)} style={styles.row}>
            <View style={styles.dot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{p.name}</Text>
              <Text style={styles.rowSub}>{p.venue}</Text>
            </View>
            <Text style={styles.coord}>
              {p.latitude.toFixed(3)}, {p.longitude.toFixed(3)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 22, borderWidth: 2, borderColor: '#E4E2F4', backgroundColor: '#FFFFFF', padding: 12 },
  title: { fontSize: 16, color: '#16134A', fontFamily: 'Nunito_900Black', marginBottom: 8 },
  list: { gap: 8, paddingBottom: 6 },
  row: { borderRadius: 12, backgroundColor: '#EFF2FF', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#2B5BFF' },
  rowTitle: { color: '#16134A', fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  rowSub: { color: '#6B6899', fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  coord: { color: '#AAA8C8', fontSize: 10, fontFamily: 'Nunito_600SemiBold' },
});
