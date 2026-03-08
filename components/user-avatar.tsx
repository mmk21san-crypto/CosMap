import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const C = {
  blue: '#2B5BFF',
  blueBg: '#E8EDFF',
};

export default function UserAvatar({
  uri,
  size = 36,
}: {
  uri?: string | null;
  size?: number;
}) {
  const radius = size / 2;
  if (uri && uri.trim().length > 0) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius }} />;
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
      <Ionicons name="person" size={Math.round(size * 0.5)} color={C.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: C.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
