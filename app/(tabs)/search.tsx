import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ALL_EVENTS, FOLLOWING } from '@/constants/cosmap-data';
import { useCosMap } from '@/context/cosmap-context';
import { AdminEventRow, listEvents } from '@/services/events-admin';

export default function SearchScreen() {
  const router = useRouter();
  const { appPhase } = useCosMap();
  const [query, setQuery] = useState('');
  const [dbEvents, setDbEvents] = useState<AdminEventRow[]>([]);

  useEffect(() => {
    let mounted = true;
    listEvents()
      .then((rows) => {
        if (!mounted) return;
        setDbEvents(rows);
      })
      .catch(() => {
        if (!mounted) return;
        setDbEvents([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const users = q
    ? FOLLOWING.filter((u) => u.name.toLowerCase().includes(q) || u.bio.toLowerCase().includes(q))
    : [];
  const searchableEvents = useMemo(() => {
    const staticRows = ALL_EVENTS.map((e) => ({
      id: e.id,
      name: e.name,
      venue: e.venue,
      tag: e.tag,
      description: e.description,
    }));
    if (dbEvents.length === 0) return staticRows;

    const merged = new Map<number, { id: number; name: string; venue: string; tag: string; description: string }>();
    staticRows.forEach((e) => merged.set(e.id, e));
    dbEvents.forEach((e) =>
      merged.set(e.id, {
        id: e.id,
        name: e.name,
        venue: e.venue,
        tag: e.event_tag,
        description: e.description,
      }),
    );
    return [...merged.values()];
  }, [dbEvents]);

  const events = q
    ? searchableEvents.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.tag.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      )
    : [];

  if (appPhase !== 'main') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.title}>検索</Text>
          <Text style={styles.help}>先にホームタブからログインしてください</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.title}>検索</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ユーザー名・イベント名で検索"
          style={styles.input}
        />

        {q.length === 0 ? <Text style={styles.help}>キーワードを入力すると結果が表示されます。</Text> : null}

        {q.length > 0 ? <Text style={styles.blockTitle}>ユーザー</Text> : null}
        {users.length === 0 && events.length === 0 && q.length > 0 ? (
          <Text style={styles.noResult}>検索結果がありません</Text>
        ) : null}

        {users.map((u) => (
          <Pressable
            key={u.id}
            onPress={() => router.push({ pathname: '/user/[id]', params: { id: u.id } })}
            style={styles.row}>
            <Text style={styles.rowTitle}>{u.displayName}</Text>
            <Text style={styles.rowId}>@{u.name}</Text>
            <Text style={styles.rowSub}>{u.bio}</Text>
          </Pressable>
        ))}

        {events.length > 0 ? <Text style={styles.blockTitle}>イベント</Text> : null}
        {events.map((e) => (
          <Pressable
            key={e.id}
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(e.id) } })}
            style={styles.row}>
            <Text style={styles.rowTitle}>{e.name}</Text>
            <Text style={styles.rowSub}>{e.venue}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  page: { padding: 20, gap: 10, paddingBottom: 30 },
  title: { fontSize: 24, fontWeight: '900', color: '#16134A', fontFamily: 'Nunito_900Black' },
  help: { color: '#6B6899', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  blockTitle: { fontSize: 13, color: '#6B6899', fontWeight: '800', marginTop: 2, fontFamily: 'Nunito_800ExtraBold' },
  noResult: { color: '#6B6899', fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: '#16134A',
    borderWidth: 1,
    borderColor: '#E4E2F4',
  },
  row: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    gap: 4,
  },
  rowTitle: { fontWeight: '800', color: '#16134A', fontFamily: 'Nunito_800ExtraBold', fontSize: 14 },
  rowId: { color: '#AAA8C8', fontSize: 11, fontFamily: 'Nunito_700Bold' },
  rowSub: { color: '#6B6899', fontSize: 12 },
});
