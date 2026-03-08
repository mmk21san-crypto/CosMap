import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const C = {
  white: '#FFFFFF',
  blue: '#2B5BFF',
  bg: '#F0F2FF',
  line: '#E4E2F4',
  soft: '#AAA8C8',
};

type Key = 'home' | 'map' | 'search' | 'profile';

const TABS: { key: Key; label: string }[] = [
  { key: 'home', label: 'ホーム' },
  { key: 'map', label: 'マップ' },
  { key: 'search', label: '検索' },
  { key: 'profile', label: 'マイページ' },
];

function Icon({ tab, color }: { tab: Key; color: string }) {
  if (tab === 'map') return <MaterialCommunityIcons name="map-outline" size={22} color={color} />;
  if (tab === 'search') return <Ionicons name="search" size={22} color={color} />;
  if (tab === 'profile') return <Ionicons name="person-outline" size={22} color={color} />;
  return <Ionicons name="home-outline" size={22} color={color} />;
}

export default function CosMapBottomNav({ active = 'home' }: { active?: Key }) {
  const router = useRouter();

  const go = (tab: Key) => {
    if (tab === 'home') router.replace('/(tabs)');
    if (tab === 'map') router.replace('/(tabs)/map');
    if (tab === 'search') router.replace('/(tabs)/search');
    if (tab === 'profile') router.replace('/(tabs)/profile');
  };

  return (
    <View style={styles.wrap}>
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Pressable key={t.key} onPress={() => go(t.key)} style={[styles.item, on && styles.itemOn, { flex: on ? 1.9 : 1 }]}>
            <Icon tab={t.key} color={on ? '#FFFFFF' : C.soft} />
            {on ? <Text style={styles.label}>{t.label}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.white,
    borderTopWidth: 2,
    borderTopColor: C.line,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  itemOn: { backgroundColor: C.blue },
  label: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Nunito_900Black' },
});
