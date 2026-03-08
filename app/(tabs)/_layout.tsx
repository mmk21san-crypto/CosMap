import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useCosMap } from '@/context/cosmap-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const C = {
  white: '#FFFFFF',
  blue: '#2B5BFF',
  bg: '#F0F2FF',
  line: '#E4E2F4',
  soft: '#AAA8C8',
};

function TabIcon({ name, color }: { name: string; color: string }) {
  if (name === 'map') return <MaterialCommunityIcons name="map-outline" size={22} color={color} />;
  if (name === 'search') return <Ionicons name="search" size={22} color={color} />;
  if (name === 'profile') return <Ionicons name="person-outline" size={22} color={color} />;
  return <Ionicons name="home-outline" size={22} color={color} />;
}

function CosMapTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const animRefs = useRef<Animated.Value[]>(state.routes.map((_, i) => new Animated.Value(state.index === i ? 1 : 0)));
  const visibleRoutes = state.routes.filter((route) => route.name !== 'explore');

  useEffect(() => {
    animRefs.current.forEach((v, i) => {
      Animated.spring(v, {
        toValue: state.index === i ? 1 : 0,
        useNativeDriver: false,
        tension: 120,
        friction: 14,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={styles.barWrap}>
      {visibleRoutes.map((route) => {
        const index = state.routes.findIndex((r) => r.key === route.key);
        const focused = state.index === index;
        const options = descriptors[route.key].options;
        const label = (options.title as string) ?? route.name;
        const anim = animRefs.current[index];
        const flexGrow = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.95] });
        const bg = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Animated.View key={route.key} style={[styles.itemOuter, { flexGrow }]}> 
            <Pressable onPress={onPress} style={styles.itemPress}>
              <Animated.View
                style={[
                  styles.itemInner,
                  {
                    backgroundColor: bg.interpolate({
                      inputRange: [0, 1],
                      outputRange: [C.bg, C.blue],
                    }),
                  },
                ]}>
                <TabIcon name={route.name} color={focused ? '#FFFFFF' : C.soft} />
                {focused ? <Text style={styles.itemLabel}>{label}</Text> : null}
              </Animated.View>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const { appPhase } = useCosMap();

  return (
    <Tabs
      tabBar={(props) => (appPhase === 'main' ? <CosMapTabBar {...props} /> : null)}
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'マップ',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '検索',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'マイページ',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.white,
    borderTopWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 8,
    flexDirection: 'row',
  },
  itemOuter: { minWidth: 0 },
  itemPress: { width: '100%' },
  itemInner: {
    borderRadius: 999,
    minHeight: 44,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  itemLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'Nunito_900Black',
  },
});
