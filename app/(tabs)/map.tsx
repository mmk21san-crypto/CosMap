import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ALL_EVENTS } from '@/constants/cosmap-data';
import { useCosMap } from '@/context/cosmap-context';
import { AdminEventRow, listEvents } from '@/services/events-admin';

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

type MapPoint = {
  id: number;
  name: string;
  venue: string;
  latitude: number;
  longitude: number;
};

export default function MapScreen() {
  const router = useRouter();
  const { appPhase } = useCosMap();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const [dbRows, setDbRows] = useState<AdminEventRow[]>([]);
  const [userCoord, setUserCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    listEvents()
      .then((rows) => {
        if (!mounted) return;
        setDbRows(rows);
      })
      .catch(() => {
        if (!mounted) return;
        setDbRows([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const points = useMemo<MapPoint[]>(() => {
    const fromDb = dbRows
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        id: r.id,
        name: r.name,
        venue: r.venue,
        latitude: r.latitude as number,
        longitude: r.longitude as number,
      }));
    if (fromDb.length > 0) return fromDb;
    return ALL_EVENTS.filter((e) => EVENT_COORDS[e.id]).map((e) => ({
      id: e.id,
      name: e.name,
      venue: e.venue,
      latitude: EVENT_COORDS[e.id].latitude,
      longitude: EVENT_COORDS[e.id].longitude,
    }));
  }, [dbRows]);

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
      <View style={[styles.page, { paddingTop: Math.max(insets.top, 8) + 8 }]}>
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>ピンをタップしてイベント詳細へ</Text>
        </View>

        <View style={styles.mapCard}>
          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation
            onUserLocationChange={(e) => {
              const c = e.nativeEvent.coordinate;
              if (!c) return;
              setUserCoord({ latitude: c.latitude, longitude: c.longitude });
            }}
            initialRegion={{
              latitude: 35.6812,
              longitude: 139.7671,
              latitudeDelta: 5.5,
              longitudeDelta: 5.5,
            }}>
            {points.map((p) => (
              <Marker key={p.id} coordinate={{ latitude: p.latitude, longitude: p.longitude }}>
                <Callout onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(p.id) } })}>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{p.name}</Text>
                    <Text style={styles.calloutSub}>{p.venue}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => {
              if (!userCoord) {
                Alert.alert('位置情報を許可してください', '設定で位置情報を許可すると現在地へ戻れます。', [
                  { text: 'キャンセル', style: 'cancel' },
                  { text: '設定を開く', onPress: () => Linking.openSettings() },
                ]);
                return;
              }
              mapRef.current?.animateToRegion(
                {
                  latitude: userCoord.latitude,
                  longitude: userCoord.longitude,
                  latitudeDelta: 0.03,
                  longitudeDelta: 0.03,
                },
                300,
              );
            }}
            style={styles.locateBtn}>
            <Text style={styles.locateText}>{userCoord ? '現在地へ' : '許可して現在地へ'}</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/nearby')} style={styles.nearbyBtn}>
            <Text style={styles.nearbyText}>一覧で見る</Text>
          </Pressable>
        </View>

        {!userCoord ? <Text style={styles.locateHelp}>位置情報を許可すると現在地へ戻れます</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  page: { flex: 1, paddingHorizontal: 16, paddingBottom: 112 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, color: C.ink, fontFamily: 'Nunito_900Black' },
  help: { color: C.mid, fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  mapCard: {
    marginTop: 10,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: C.line,
    height: '72%',
    backgroundColor: C.white,
  },
  map: { flex: 1 },
  callout: { width: 180, paddingVertical: 2 },
  calloutTitle: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  calloutSub: { color: C.mid, fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  hintBar: {
    borderRadius: 12,
    backgroundColor: 'rgba(22,19,74,0.82)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  hintText: { color: C.white, fontSize: 12, fontFamily: 'Nunito_700Bold' },
  actionRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nearbyBtn: {
    borderRadius: 999,
    backgroundColor: C.blue,
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyText: { color: C.white, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  locateBtn: {
    borderRadius: 999,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.line,
    minHeight: 44,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateText: { color: C.ink, fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  locateHelp: { marginTop: 8, color: C.soft, fontSize: 11, fontFamily: 'Nunito_600SemiBold' },
});
