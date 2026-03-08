import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FOLLOWING } from '@/constants/cosmap-data';
import CosMapBottomNav from '@/components/cosmap-bottom-nav';
import UserAvatar from '@/components/user-avatar';

const C = {
  bg: '#F0F2FF',
  white: '#FFFFFF',
  ink: '#16134A',
  mid: '#6B6899',
  soft: '#AAA8C8',
  blue: '#2B5BFF',
  blueBg: '#E8EDFF',
};

export default function FriendsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>← 戻る</Text>
        </Pressable>
        <Text style={styles.title}>フレンド</Text>
        {FOLLOWING.map((u) => (
          <Pressable key={u.id} onPress={() => router.push({ pathname: '/user/[id]', params: { id: u.id } })} style={styles.row}>
            <UserAvatar uri={u.avatarUrl} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{u.displayName}</Text>
              <Text style={styles.uid}>@{u.name}</Text>
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
  page: { padding: 16, gap: 10, paddingBottom: 118 },
  back: { color: C.blue, fontSize: 13, fontFamily: 'Nunito_700Bold' },
  title: { color: C.ink, fontSize: 22, fontFamily: 'Nunito_900Black' },
  row: { backgroundColor: C.white, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { color: C.ink, fontSize: 14, fontFamily: 'Nunito_800ExtraBold' },
  uid: { color: C.soft, fontSize: 11, fontFamily: 'Nunito_700Bold' },
});
