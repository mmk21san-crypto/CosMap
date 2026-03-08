import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { ALL_EVENTS, FOLLOWING } from '@/constants/cosmap-data';
import CosMapBottomNav from '@/components/cosmap-bottom-nav';
import UserAvatar from '@/components/user-avatar';
import { useCosMap } from '@/context/cosmap-context';
import { AdminEventRow, getEventById } from '@/services/events-admin';

const C = {
  bg: '#F0F2FF',
  white: '#FFFFFF',
  ink: '#16134A',
  mid: '#6B6899',
  soft: '#AAA8C8',
  line: '#E4E2F4',
  blue: '#2B5BFF',
  rose: '#FF3D5C',
  blueBg: '#E8EDFF',
  roseBg: '#FFE9ED',
};

const EVENT_COLORS = [C.blue, C.rose, '#7C3AED', C.blue, C.rose];
const eventColor = (id: number) => EVENT_COLORS[(id - 1) % EVENT_COLORS.length];

export default function EventDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { attendedIds, toggleAttend, appPhase } = useCosMap();

  const eventId = Number(params.id);
  const staticEvent = useMemo(() => ALL_EVENTS.find((e) => e.id === eventId), [eventId]);
  const [dbEvent, setDbEvent] = useState<AdminEventRow | null>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [openingExternal, setOpeningExternal] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const photoScrollRef = useRef<ScrollView | null>(null);
  const { width } = useWindowDimensions();
  const mediaItems = useMemo(
    () =>
      [...(dbEvent?.event_media ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .slice(0, 3)
        .map((m) => ({
          type: m.media_type,
          imageUrl: m.image_url,
          colorHex: m.color_hex,
        })),
    [dbEvent?.event_media],
  );
  const galleryLengthByMedia = mediaItems.length > 0 ? mediaItems.length : 3;
  const isCarouselByMedia = galleryLengthByMedia > 1;

  useEffect(() => {
    if (!Number.isFinite(eventId)) return;
    let mounted = true;
    setDbLoading(true);
    getEventById(eventId)
      .then((row) => {
        if (!mounted) return;
        setDbEvent(row);
      })
      .catch(() => {
        if (!mounted) return;
        setDbEvent(null);
      })
      .finally(() => {
        if (!mounted) return;
        setDbLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [eventId]);

  useEffect(() => {
    setPhotoIdx(0);
    photoScrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [eventId, galleryLengthByMedia]);

  useEffect(() => {
    if (!isCarouselByMedia) return;
    const timer = setInterval(() => {
      setPhotoIdx((prev) => {
        const next = (prev + 1) % galleryLengthByMedia;
        photoScrollRef.current?.scrollTo({ x: next * (width - 32), animated: true });
        return next;
      });
    }, 3400);
    return () => clearInterval(timer);
  }, [galleryLengthByMedia, isCarouselByMedia, width]);

  if (appPhase !== 'main') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.page}>
          <Text style={styles.help}>先にホームタブからログインしてください</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (dbLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.page}>
          <Text style={styles.help}>イベントを読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if ((!staticEvent && !dbEvent) || !Number.isFinite(eventId)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.page}>
          <Text style={styles.help}>イベントが見つかりません</Text>
          <Pressable onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.back}>戻る</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const displayEvent = dbEvent
    ? {
        id: dbEvent!.id,
        name: dbEvent!.name,
        venue: dbEvent!.venue,
        tag: dbEvent!.event_tag,
        date: new Date(dbEvent!.start_at).toISOString().slice(0, 10),
        time: `${new Date(dbEvent!.start_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜${new Date(dbEvent!.end_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`,
        ticket: dbEvent!.is_free ? '無料' : dbEvent!.ticket_price_yen ? `${dbEvent!.ticket_price_yen.toLocaleString('ja-JP')}円` : dbEvent!.ticket_label,
        description: dbEvent!.description,
        dressing: dbEvent!.dressing_room_available,
        photo: dbEvent!.photo_allowed,
        url: dbEvent!.url ?? undefined,
      }
    : {
        id: staticEvent!.id,
        name: staticEvent!.name,
        venue: staticEvent!.venue,
        tag: staticEvent!.tag,
        date: staticEvent!.date,
        time: staticEvent!.time,
        ticket: staticEvent!.ticket,
        description: staticEvent!.description,
        dressing: staticEvent!.dressing,
        photo: staticEvent!.photo,
        url: staticEvent!.url,
      };

  const col = eventColor(displayEvent.id);
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = displayEvent.date === todayStr;
  const friendsGoing = FOLLOWING.filter((u) => u.attending.includes(displayEvent.id));
  const isAttended = attendedIds.has(displayEvent.id);
  const photoColors = [col, '#6B56FF', '#FF5C7A'];
  const galleryItems =
    mediaItems.length > 0
      ? mediaItems
      : [0, 1, 2].map((idx) => ({
          type: 'color' as const,
          imageUrl: null,
          colorHex: photoColors[idx % photoColors.length],
        }));
  const galleryLength = galleryItems.length;
  const isCarousel = galleryLength > 1;

  const openExternalLink = async () => {
    if (!displayEvent.url || openingExternal) return;
    try {
      setOpeningExternal(true);
      const canOpen = await Linking.canOpenURL(displayEvent.url);
      if (!canOpen) throw new Error('URLを開けません');
      await Linking.openURL(displayEvent.url);
    } catch {
      Alert.alert('リンクを開けませんでした', 'ネットワーク状態を確認して再度お試しください。');
    } finally {
      setTimeout(() => setOpeningExternal(false), 350);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { backgroundColor: col }]}> 
          <Pressable onPress={() => router.back()} style={styles.backRow}>
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
            <Text style={styles.backWhite}>戻る</Text>
          </Pressable>

          {isToday ? (
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>LIVE 本日開催</Text>
            </View>
          ) : null}

          <Text style={styles.heroTitle}>{displayEvent.name}</Text>

          <View style={styles.chipRow}>
            {[displayEvent.tag, displayEvent.dressing ? '更衣室あり' : null, displayEvent.photo ? '撮影可' : null]
              .filter(Boolean)
              .map((t) => (
                <View key={t} style={styles.chip}>
                  <Text style={styles.chipText}>{t}</Text>
                </View>
              ))}
          </View>
        </View>

        <View style={styles.page}>
          {isCarousel ? (
            <>
              <ScrollView
                ref={photoScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const next = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                  setPhotoIdx(Math.max(0, Math.min(galleryLength - 1, next)));
                }}
                style={styles.photoScroller}>
                {galleryItems.map((media, idx) => {
                  const hasImage = media.type === 'image_url' && !!media.imageUrl;
                  return (
                    <View key={idx} style={[styles.photoHero, { backgroundColor: media.colorHex || photoColors[idx % photoColors.length], width: width - 32 }]}>
                      {hasImage ? (
                        <Image source={{ uri: media.imageUrl! }} style={styles.photoImage} resizeMode="cover" />
                      ) : (
                        <>
                          <Ionicons name="images-outline" size={30} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.photoHeroText}>イベント画像 {idx + 1}/{galleryLength}</Text>
                        </>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
              <View style={styles.photoDots}>
                {Array.from({ length: galleryLength }).map((_, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => {
                      setPhotoIdx(idx);
                      photoScrollRef.current?.scrollTo({ x: idx * (width - 32), animated: true });
                    }}
                    style={[styles.photoDot, photoIdx === idx && styles.photoDotOn]}
                  />
                ))}
              </View>
            </>
          ) : (
            (() => {
              const media = galleryItems[0];
              const hasImage = media.type === 'image_url' && !!media.imageUrl;
              return (
                <View style={[styles.photoHero, { backgroundColor: media.colorHex || photoColors[0], width: '100%' }]}>
                  {hasImage ? (
                    <Image source={{ uri: media.imageUrl! }} style={styles.photoImage} resizeMode="cover" />
                  ) : (
                    <>
                      <Ionicons name="images-outline" size={30} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.photoHeroText}>イベント画像 1/1</Text>
                    </>
                  )}
                </View>
              );
            })()
          )}

          <Pressable onPress={() => toggleAttend(displayEvent.id)} style={[styles.attendBtn, isAttended && styles.attendBtnOn]}>
            <View style={[styles.attendIconCircle, isAttended && styles.attendIconCircleOn]}>
              {isAttended ? (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <View style={styles.attendDot} />
              )}
            </View>
            <Text style={[styles.attendText, isAttended && styles.attendTextOn]}>
              {isAttended ? '参加予定に登録済み' : '参加予定に登録する'}
            </Text>
          </Pressable>

          {friendsGoing.length > 0 ? (
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.peopleIconWrap}>
                  <Ionicons name="people" size={16} color={C.rose} />
                </View>
                <Text style={styles.cardTitle}>イベント参加予定のフレンド</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{friendsGoing.length}</Text>
                </View>
              </View>
              {friendsGoing.slice(0, 3).map((u) => (
                <Pressable
                  key={u.id}
                  style={styles.followerRow}
                  onPress={() => router.push({ pathname: '/user/[id]', params: { id: u.id } })}>
                  <UserAvatar uri={u.avatarUrl} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.followerName}>{u.displayName}</Text>
                    <Text style={styles.followerId}>@{u.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.soft} />
                </Pressable>
              ))}
              {friendsGoing.length > 3 ? (
                <Pressable
                  onPress={() => router.push({ pathname: '/event/[id]/friends', params: { id: String(displayEvent.id) } })}
                  style={styles.moreBtn}>
                  <Text style={styles.moreBtnText}>もっと見る</Text>
                  <Ionicons name="chevron-forward" size={15} color={C.blue} />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={C.soft} />
              <Text style={styles.infoLabel}>会場</Text>
              <Text style={styles.infoValue}>{displayEvent.venue}</Text>
            </View>
            <View style={styles.hr} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color={C.soft} />
              <Text style={styles.infoLabel}>時間</Text>
              <Text style={styles.infoValue}>{displayEvent.time}</Text>
            </View>
            <View style={styles.hr} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="ticket-confirmation-outline" size={14} color={C.soft} />
              <Text style={styles.infoLabel}>参加費</Text>
              <Text style={styles.infoValue}>{displayEvent.ticket}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.detailLabel}>イベント詳細</Text>
            <Text style={styles.detailText}>{displayEvent.description}</Text>
          </View>

          <Pressable
            disabled={!displayEvent.url || openingExternal}
            onPress={openExternalLink}
            style={[styles.linkBtn, { backgroundColor: col }, (!displayEvent.url || openingExternal) && styles.linkBtnDisabled]}> 
            {openingExternal ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Ionicons name="link-outline" size={16} color="#FFFFFF" />}
            <Text style={styles.linkBtnText}>{openingExternal ? '開いています...' : '公式HPを見る'}</Text>
          </Pressable>
        </View>
      </ScrollView>
      <CosMapBottomNav active="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 118 },
  page: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  help: { color: C.mid, fontSize: 13, fontFamily: 'Nunito_600SemiBold' },
  back: { color: C.blue, fontSize: 14, fontFamily: 'Nunito_700Bold', marginTop: 8 },

  hero: { paddingHorizontal: 22, paddingTop: 52, paddingBottom: 28 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 20 },
  backWhite: { color: '#FFFFFF', fontSize: 13, fontFamily: 'Nunito_700Bold' },
  liveTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveTagText: { color: '#FFFFFF', fontSize: 10, letterSpacing: 0.5, fontFamily: 'Nunito_800ExtraBold' },
  heroTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 28, fontFamily: 'Nunito_900Black', marginBottom: 10 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Nunito_700Bold' },

  attendBtn: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  attendBtnOn: { backgroundColor: C.blue },
  photoHero: {
    height: 176,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 2,
  },
  photoImage: { ...StyleSheet.absoluteFillObject },
  photoScroller: { borderRadius: 20 },
  photoHeroText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontFamily: 'Nunito_700Bold' },
  photoDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 4 },
  photoDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.line },
  photoDotOn: { width: 20, backgroundColor: C.blue },
  attendIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendIconCircleOn: { backgroundColor: 'rgba(255,255,255,0.2)' },
  attendDot: { width: 10, height: 10, borderRadius: 6, borderWidth: 2.5, borderColor: C.soft },
  attendText: { color: C.ink, fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
  attendTextOn: { color: '#FFFFFF' },

  card: { backgroundColor: C.white, borderRadius: 20, padding: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  peopleIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: C.roseBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold', flex: 1 },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: C.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
  followerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  followerName: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  followerId: { color: C.soft, fontSize: 11, fontFamily: 'Nunito_700Bold' },
  moreBtn: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: C.blueBg,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  moreBtnText: { color: C.blue, fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },

  infoRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 10 },
  hr: { height: 1, backgroundColor: C.line },
  infoLabel: { width: 46, color: C.soft, fontSize: 11, fontFamily: 'Nunito_600SemiBold' },
  infoValue: { flex: 1, color: C.ink, fontSize: 13, fontFamily: 'Nunito_700Bold' },
  detailLabel: { color: C.soft, fontSize: 10, letterSpacing: 0.8, fontFamily: 'Nunito_800ExtraBold', marginBottom: 8 },
  detailText: { color: C.mid, fontSize: 13, lineHeight: 21, fontFamily: 'Nunito_500Medium' },

  linkBtn: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  linkBtnDisabled: { opacity: 0.72 },
  linkBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Nunito_800ExtraBold' },
});
