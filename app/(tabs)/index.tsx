import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, Keyboard, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { ALL_EVENTS, FOLLOWING, TODAY } from '@/constants/cosmap-data';
import UserAvatar from '@/components/user-avatar';
import { useCosMap } from '@/context/cosmap-context';
import { AdminEventRow, listEvents } from '@/services/events-admin';
import { registerPushToken, sendLocalLocationNotification, triggerServerPush } from '@/services/push';

const C = {
  bg: '#EFF2FF',
  white: '#FFFFFF',
  ink: '#16134A',
  mid: '#6B6899',
  soft: '#AAA8C8',
  line: '#E4E2F4',
  blue: '#2B5BFF',
  rose: '#FF3D5C',
  violet: '#6C3FF5',
  blueBg: '#E8EDFF',
};

const SETUP_AVATAR_PRESETS = [
  { id: 'p1', emoji: '⚡', bg: '#EDE9FF' },
  { id: 'p2', emoji: '🌸', bg: '#FFE4F0' },
  { id: 'p3', emoji: '🌀', bg: '#E0F2FE' },
  { id: 'p4', emoji: '🍊', bg: '#FFF3E0' },
  { id: 'p5', emoji: '⚔️', bg: '#F3F4F6' },
];

const ONBOARDING = [
  {
    id: 0,
    color: C.blue,
    title: '近くのイベントを\nすぐ見つけよう',
    sub: 'コスプレイベントをマップで一覧表示。今日どこで開催されてるか、一目でわかる。',
    icon: 'map',
  },
  {
    id: 1,
    color: C.rose,
    title: 'イベント中も\n友達とリアルタイムで繋がる',
    sub: '会場でフレンドが今どこにいるか共有。「どこにいる？」がなくなる。',
    icon: 'account-multiple',
  },
  {
    id: 2,
    color: C.violet,
    title: 'さあ、\nはじめよう',
    sub: 'コスプレイベントをもっと楽しく。アカウントを作成して、仲間と繋がろう。',
    icon: 'sparkles',
  },
];
const EVENT_AREAS = ['ステージ前', '撮影エリアA', '撮影エリアB', '更衣室付近', '受付付近', '入口付近', '休憩エリア', 'フードコート', 'その他'];

function formatAdminEventDate(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
  const date = start.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });
  const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${date} ${hhmm(start)}〜${hhmm(end)}`;
}

function EventRow({
  event,
  attended,
  onPress,
  showDate = false,
}: {
  event: (typeof ALL_EVENTS)[number];
  attended: boolean;
  onPress: () => void;
  showDate?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowIcon}>
        <View style={styles.rowDot} />
      </View>
      <View style={styles.rowMain}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle}>{event.name}</Text>
          {attended ? <Text style={styles.badge}>参加予定</Text> : null}
        </View>
        <Text style={styles.rowSub}>
          {showDate ? `${event.date} ・ ` : ''}
          {event.venue}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.soft} />
    </Pressable>
  );
}

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 120);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1250);
    const t4 = setTimeout(onDone, 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onDone]);

  return (
    <SafeAreaView style={styles.splashWrap}>
      <View style={styles.splashCircleA} />
      <View style={styles.splashCircleB} />
      <View style={[styles.splashLogoCard, { opacity: phase >= 1 ? 1 : 0.25 }]}>
        <Ionicons name="location" size={48} color={C.blue} />
      </View>
      <Text style={[styles.splashTitle, { opacity: phase >= 2 ? 1 : 0.4 }]}>CosMap</Text>
      <Text style={[styles.splashSub, { opacity: phase >= 3 ? 0.8 : 0.2 }]}>COSPLAY EVENT MAP</Text>
      <View style={styles.splashDots}>
        <View style={styles.splashDot} />
        <View style={styles.splashDot} />
        <View style={styles.splashDot} />
      </View>
    </SafeAreaView>
  );
}

function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [cur, setCur] = useState(0);
  const transition = useState(new Animated.Value(1))[0];
  const s = ONBOARDING[cur];
  const isLast = cur === ONBOARDING.length - 1;

  useEffect(() => {
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [cur, transition]);

  return (
    <SafeAreaView style={[styles.onboardingWrap, { backgroundColor: s.color }]}>
      {!isLast ? (
        <Pressable onPress={() => setCur(ONBOARDING.length - 1)} style={styles.skipBtn}>
          <Text style={styles.skipText}>スキップ</Text>
        </Pressable>
      ) : null}

      <Animated.View
        style={[
          styles.onboardingContent,
          {
            opacity: transition,
            transform: [
              {
                translateY: transition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.onboardingIconWrap}>
          {s.icon === 'map' ? (
            <MaterialCommunityIcons name="map-search-outline" size={78} color="#FFFFFF" />
          ) : s.icon === 'account-multiple' ? (
            <Ionicons name="people" size={74} color="#FFFFFF" />
          ) : (
            <Ionicons name="sparkles" size={72} color="#FFFFFF" />
          )}
        </View>
        <Text style={styles.onboardingTitle}>{s.title}</Text>
        <Text style={styles.onboardingSub}>{s.sub}</Text>
      </Animated.View>

      <View style={styles.onboardingBottom}>
        <View style={styles.dotsRow}>
          {ONBOARDING.map((x, i) => (
            <Pressable key={x.id} onPress={() => setCur(i)} style={[styles.dot, i === cur && styles.dotActive]} />
          ))}
        </View>
        <Pressable onPress={() => (isLast ? onDone() : setCur(cur + 1))} style={styles.nextBtn}>
          <Text style={[styles.nextBtnText, { color: s.color }]}>{isLast ? 'アカウントを作成' : '次へ'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function AuthScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <SafeAreaView style={styles.authRoot}>
      <View style={styles.authTop}>
        <View style={styles.authTopCircleA} />
        <View style={styles.authTopCircleB} />
        <View style={styles.authLogoCard}>
          <Ionicons name="location" size={42} color={C.blue} />
        </View>
        <Text style={styles.authBrand}>CosMap</Text>
        <Text style={styles.authTag}>COSPLAY EVENT MAP</Text>
      </View>

      <View style={styles.authBottom}>
        <View>
          <Text style={styles.authTitle}>はじめましょう</Text>
          <Text style={styles.authDesc}>ログイン・新規登録どちらも同じボタンから。</Text>
        </View>

        <View style={styles.authButtons}>
          <Pressable onPress={onContinue} style={styles.appleBtn}>
            <Text style={styles.appleBtnText}>Appleでつづける</Text>
          </Pressable>
          <Pressable onPress={onContinue} style={styles.googleBtn}>
            <Text style={styles.googleBtnText}>Googleでつづける</Text>
          </Pressable>
        </View>

        <Text style={styles.authTerms}>
          続けることで<Text style={styles.termLink}>利用規約</Text>および
          <Text style={styles.termLink}>プライバシーポリシー</Text>に同意したことになります
        </Text>
      </View>
    </SafeAreaView>
  );
}

function ProfileSetupScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [handle, setHandle] = useState('');
  const [dispName, setDispName] = useState('');
  const [avatarType, setAvatarType] = useState<'preset' | 'photo'>('preset');
  const [avatar, setAvatar] = useState(SETUP_AVATAR_PRESETS[0]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const canNext = step === 1 ? handle.length >= 6 && dispName.length >= 1 : true;
  const progressW: `${number}%` = `${(step / 2) * 100}%`;

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      selectionLimit: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.setupRoot}>
      <View style={styles.setupTop}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: progressW }]} />
        </View>
        <View style={styles.setupStepsRow}>
          {[{ num: 1, label: '基本情報' }, { num: 2, label: 'アイコン' }].map((s) => (
            <View key={s.num} style={styles.setupStepItem}>
              <View style={[styles.stepCircle, step >= s.num ? styles.stepCircleOn : styles.stepCircleOff]}>
                <Text style={[styles.stepCircleText, step >= s.num ? styles.stepCircleTextOn : styles.stepCircleTextOff]}>
                  {s.num}
                </Text>
              </View>
              <Text style={[styles.stepLabel, step >= s.num ? styles.stepLabelOn : styles.stepLabelOff]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.setupBody}>
        {step === 1 ? (
          <View style={styles.setupSection}>
            <View>
              <Text style={styles.setupTitle}>基本情報を設定しよう</Text>
              <Text style={styles.setupSub}>あとから変更できます</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ユーザーID</Text>
              <View style={[styles.inputWrap, handle.length > 0 && styles.inputWrapActive]}>
                <Text style={styles.atMark}>@</Text>
                <TextInput
                  value={handle}
                  onChangeText={(t) => setHandle(t.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                  placeholder="raiden_cos"
                  style={styles.textInput}
                  maxLength={20}
                />
                <Text style={styles.counter}>{handle.length}/20</Text>
              </View>
              <Text style={[styles.hint, handle.length > 0 && (handle.length >= 6 ? styles.hintOk : styles.hintNg)]}>
                {handle.length === 0
                  ? '6文字以上・英数字とアンダースコア（_）のみ使用可'
                  : handle.length >= 6
                    ? 'このIDは使用できます'
                    : '6文字以上入力してください'}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>表示名</Text>
              <View style={[styles.inputWrap, dispName.length > 0 && styles.inputWrapActive]}>
                <TextInput
                  value={dispName}
                  onChangeText={setDispName}
                  placeholder="例：雷電コスプレイヤー"
                  style={[styles.textInput, styles.emojiInput]}
                  maxLength={20}
                />
                <Text style={styles.counter}>{dispName.length}/20</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.setupSection}>
            <View>
              <Text style={styles.setupTitle}>アイコンを設定しよう</Text>
              <Text style={styles.setupSub}>プリセットか写真から選べます</Text>
            </View>

            <View style={styles.avatarPreviewWrap}>
              <View style={[styles.avatarPreview, { backgroundColor: avatarType === 'preset' ? avatar.bg : C.blueBg }]}>
                {avatarType === 'preset' ? (
                  <Ionicons name="person" size={42} color={C.blue} />
                ) : photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.avatarPhoto} />
                ) : (
                  <Ionicons name="camera-outline" size={42} color={C.blue} />
                )}
              </View>
            </View>

            <View style={styles.segment}>
              <Pressable onPress={() => setAvatarType('preset')} style={[styles.segBtn, avatarType === 'preset' && styles.segBtnOn]}>
                <Text style={[styles.segText, avatarType === 'preset' && styles.segTextOn]}>プリセット</Text>
              </Pressable>
              <Pressable onPress={() => setAvatarType('photo')} style={[styles.segBtn, avatarType === 'photo' && styles.segBtnOn]}>
                <Text style={[styles.segText, avatarType === 'photo' && styles.segTextOn]}>写真</Text>
              </Pressable>
            </View>

            {avatarType === 'preset' ? (
              <View style={styles.avatarGrid}>
                {SETUP_AVATAR_PRESETS.map((a) => (
                  <Pressable
                    key={a.id}
                    onPress={() => setAvatar(a)}
                    style={[styles.avatarCell, { backgroundColor: a.bg }, avatar.id === a.id && styles.avatarCellOn]}>
                    <Ionicons name="person-outline" size={20} color={C.blue} />
                  </Pressable>
                ))}
              </View>
            ) : (
              <Pressable onPress={pickFromLibrary} style={styles.photoBtn}>
                <Ionicons name="camera-outline" size={24} color={C.blue} />
                <Text style={styles.photoBtnText}>{photoUri ? '写真を変更する' : '写真を選ぶ'}</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.setupFooter}>
        {step > 1 ? (
          <Pressable onPress={() => setStep((s) => s - 1)}>
            <Text style={styles.backBtn}>← 戻る</Text>
          </Pressable>
        ) : null}
        <Pressable
          disabled={!canNext}
          onPress={() => {
            if (!canNext) return;
            if (step < 2) {
              setStep((s) => s + 1);
            } else {
              onDone();
            }
          }}
          style={[styles.setupNext, !canNext && styles.setupNextDisabled]}>
          <Text style={styles.setupNextText}>{step < 2 ? '次へ →' : 'CosMapをはじめる!'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const {
    attendedIds,
    appPhase,
    finishSplash,
    finishOnboarding,
    continueWithProvider,
    completeProfileSetup,
  } = useCosMap();

  const todayEvents = useMemo(() => ALL_EVENTS.filter((e) => e.date === TODAY), []);
  const upcomingEvents = useMemo(() => ALL_EVENTS.filter((e) => e.date > TODAY), []);
  const [homeTab, setHomeTab] = useState<'home' | 'attending'>('home');
  const attendingToday = useMemo(() => todayEvents.filter((e) => attendedIds.has(e.id)), [attendedIds, todayEvents]);
  const [locModal, setLocModal] = useState<number | null>(null);
  const [locArea, setLocArea] = useState('');
  const [locText, setLocText] = useState('');
  const [myLocations, setMyLocations] = useState<Record<number, { area: string; text: string; updatedAt: string }>>({});
  const [friendLocations, setFriendLocations] = useState(
    Object.fromEntries(
      FOLLOWING.filter((u) => u.location).map((u) => [
        u.id,
        {
          eventId: u.location?.eventId ?? 0,
          area: u.location?.area ?? '',
          text: u.location?.text ?? '',
          updatedAt: u.location?.updatedAt ?? '',
        },
      ]),
    ) as Record<string, { eventId: number; area: string; text: string; updatedAt: string }>,
  );
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string; unread: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const keyboardShift = useState(() => new Animated.Value(0))[0];
  const [nationwideUpcomingEvents, setNationwideUpcomingEvents] = useState<AdminEventRow[]>([]);
  const [nationwideLoading, setNationwideLoading] = useState(false);
  const [nationwideError, setNationwideError] = useState<string | null>(null);
  const [nationwideExpanded, setNationwideExpanded] = useState(false);
  const friendEventIds = useMemo(() => [...new Set(FOLLOWING.flatMap((u) => u.attending))], []);
  const friendEvents = useMemo(() => ALL_EVENTS.filter((e) => friendEventIds.includes(e.id)).slice(0, 4), [friendEventIds]);
  const visibleNationwideEvents = useMemo(
    () => (nationwideExpanded ? nationwideUpcomingEvents : nationwideUpcomingEvents.slice(0, 3)),
    [nationwideExpanded, nationwideUpcomingEvents],
  );

  const openLocationModal = (eventId: number) => {
    const cur = myLocations[eventId];
    setLocArea(cur?.area ?? '');
    setLocText(cur?.text ?? '');
    setLocModal(eventId);
  };

  const sendLocation = () => {
    if (locModal === null) return;
    if (!locArea && !locText.trim()) return;
    const now = new Date();
    const updatedAt = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMyLocations((prev) => ({
      ...prev,
      [locModal]: { area: locArea || '未設定', text: locText.trim(), updatedAt },
    }));
    setLocModal(null);
  };

  const stopLocationShare = (eventId: number) => {
    setMyLocations((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
  };

  useEffect(() => {
    registerPushToken('11111111-1111-1111-1111-111111111999').then(setPushToken).catch(() => {});
  }, []);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvt, (e: any) => {
      const toValue = Math.max(0, (e?.endCoordinates?.height ?? 0) - 24);
      Animated.timing(keyboardShift, {
        toValue,
        duration: e?.duration ?? 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    const onHide = Keyboard.addListener(hideEvt, (e: any) => {
      Animated.timing(keyboardShift, {
        toValue: 0,
        duration: e?.duration ?? 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [keyboardShift]);

  useEffect(() => {
    let mounted = true;
    setNationwideLoading(true);
    listEvents()
      .then((rows) => {
        if (!mounted) return;
        const now = Date.now();
        const upcoming = rows.filter((row) => {
          const end = new Date(row.end_at).getTime();
          return Number.isFinite(end) && end >= now;
        });
        setNationwideUpcomingEvents(upcoming);
        setNationwideError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setNationwideUpcomingEvents([]);
        setNationwideError('イベント取得に失敗しました');
      })
      .finally(() => {
        if (!mounted) return;
        setNationwideLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (attendingToday.length === 0) return;
    const timer = setInterval(() => {
      const pool = FOLLOWING.filter((u) => u.attending.some((id) => attendingToday.some((e) => e.id === id)));
      if (pool.length === 0) return;
      const target = pool[Math.floor(Math.random() * pool.length)];
      const eventId = target.attending.find((id) => attendingToday.some((e) => e.id === id)) ?? target.attending[0];
      setFriendLocations((current) => {
        const prev = current[target.id];
        const nextArea = EVENT_AREAS[(EVENT_AREAS.indexOf(prev?.area || '') + 1 + EVENT_AREAS.length) % EVENT_AREAS.length];
        const now = new Date();
        const updatedAt = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (!prev || prev.area !== nextArea) {
          setNotifications((before) => [
            { id: `${target.id}-${Date.now()}`, text: `${target.displayName} が現在地を「${nextArea}」に更新`, time: updatedAt, unread: true },
            ...before,
          ]);
          sendLocalLocationNotification(target.displayName, nextArea).catch(() => {});
          triggerServerPush({
            title: 'フレンドの現在地が更新されました',
            body: `${target.displayName} が「${nextArea}」に移動しました`,
            targetProfileIds: ['11111111-1111-1111-1111-111111111999'],
          }).catch(() => {});
          return {
            ...current,
            [target.id]: { eventId, area: nextArea, text: '', updatedAt },
          };
        }
        return current;
      });
    }, 16000);
    return () => clearInterval(timer);
  }, [attendingToday]);

  if (appPhase === 'splash') return <SplashScreen onDone={finishSplash} />;
  if (appPhase === 'onboarding') return <OnboardingScreen onDone={finishOnboarding} />;
  if (appPhase === 'auth') return <AuthScreen onContinue={continueWithProvider} />;
  if (appPhase === 'profile-setup') return <ProfileSetupScreen onDone={completeProfileSetup} />;

  return (
    <SafeAreaView style={styles.container}>
      {locModal !== null ? (
        <Modal transparent animationType="fade" visible>
          <Pressable style={styles.modalOverlay} onPress={() => setLocModal(null)}>
            <Animated.View style={[styles.modalCard, { transform: [{ translateY: Animated.multiply(keyboardShift, -1) }] }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHead}>
              <View>
                <Text style={styles.modalTitle}>今どこにいる？</Text>
                <Text style={styles.modalSub}>{ALL_EVENTS.find((e) => e.id === locModal)?.name ?? ''}</Text>
              </View>
              <Pressable onPress={() => setLocModal(null)} style={styles.modalClose}>
                <Ionicons name="close" size={16} color={C.mid} />
              </Pressable>
            </View>
            <Text style={styles.modalLabel}>エリアを選ぶ</Text>
            <View style={styles.areaWrap}>
              {EVENT_AREAS.map((a) => (
                <Pressable key={a} onPress={() => setLocArea(a)} style={[styles.areaChip, locArea === a && styles.areaChipOn]}>
                  <Text style={[styles.areaChipText, locArea === a && styles.areaChipTextOn]}>{a}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.modalLabel}>ひとこと（任意）</Text>
            <TextInput
              value={locText}
              onChangeText={(v) => setLocText(v.slice(0, 30))}
              placeholder="例: 3人で集まってます！"
              style={styles.modalInput}
            />
            <Pressable onPress={sendLocation} style={styles.modalSend}>
              <Text style={styles.modalSendText}>フレンドに知らせる</Text>
            </Pressable>
            </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
      ) : null}
      <Modal transparent animationType="fade" visible={showNotifications} onRequestClose={() => setShowNotifications(false)}>
        <Pressable style={styles.notifyOverlay} onPress={() => setShowNotifications(false)}>
          <Pressable style={styles.notifyModal} onPress={(e) => e.stopPropagation()}>
            <View style={styles.notifyModalHead}>
              <Text style={styles.notifyModalTitle}>通知</Text>
              <Pressable onPress={() => setShowNotifications(false)} style={styles.notifyCloseBtn}>
                <Ionicons name="close" size={18} color={C.mid} />
              </Pressable>
            </View>
            {pushToken ? <Text style={styles.notifyHelper}>Push登録済み</Text> : <Text style={styles.notifyHelper}>Push未登録（実機で許可が必要）</Text>}
            {notifications.length === 0 ? (
              <Text style={styles.notifyEmpty}>通知はありません</Text>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <View key={n.id} style={styles.notifyRow}>
                  <Text style={styles.notifyText}>{n.text}</Text>
                  <Text style={styles.notifyTime}>{n.time}</Text>
                </View>
              ))
            )}
          </Pressable>
        </Pressable>
      </Modal>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.headRowTop}>
          <View>
            <Text style={styles.dateText}>6月15日（土）</Text>
            <Text style={styles.sectionTitle}>今日のコスプレ</Text>
          </View>
          <Pressable
            onPress={() => {
              setShowNotifications(true);
              setNotifications((current) => current.map((n) => ({ ...n, unread: false })));
            }}
            style={styles.notifyBtn}>
            <Ionicons name="notifications-outline" size={18} color={C.ink} />
            {notifications.some((n) => n.unread) ? <View style={styles.notifyDot} /> : null}
          </Pressable>
        </View>
        <Text style={styles.help}>今日のコスプレイベントをチェック</Text>

        <View style={styles.homeTabs}>
          <Pressable onPress={() => setHomeTab('home')} style={[styles.homeTabBtn, homeTab === 'home' && styles.homeTabBtnOn]}>
            <Text style={[styles.homeTabText, homeTab === 'home' && styles.homeTabTextOn]}>ホーム</Text>
          </Pressable>
          <Pressable
            onPress={() => setHomeTab('attending')}
            style={[styles.homeTabBtn, homeTab === 'attending' && styles.homeTabAttendOn]}>
            <Text style={[styles.homeTabText, homeTab === 'attending' && styles.homeTabAttendTextOn]}>
              参加中 {attendingToday.length > 0 ? `(${attendingToday.length})` : ''}
            </Text>
          </Pressable>
        </View>

        {homeTab === 'home' ? (
          <>
            <View style={styles.quickActions}>
              <Pressable onPress={() => router.push('/nearby')} style={styles.quickCardBlue}>
                <Text style={styles.quickCountBlue}>{upcomingEvents.length}</Text>
                <View style={styles.quickRow}>
                  <Text style={styles.quickCaption}>周辺イベント</Text>
                  <Ionicons name="chevron-forward" size={17} color="rgba(255,255,255,0.62)" />
                </View>
              </Pressable>
              <Pressable onPress={() => router.push('/attended')} style={styles.quickCardRose}>
                <Text style={styles.quickCountRose}>{attendedIds.size}</Text>
                <View style={styles.quickRow}>
                  <Text style={styles.quickCaptionStrong}>参加予定</Text>
                  <Ionicons name="chevron-forward" size={17} color="rgba(255,61,92,0.55)" />
                </View>
              </Pressable>
            </View>

            <View style={styles.todayCard}>
              <View style={styles.todayHead}>
                <Text style={styles.todayTitle}>本日開催</Text>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              </View>
              {todayEvents.map((e, idx) => (
                <View key={e.id}>
                  <EventRow
                    event={e}
                    attended={attendedIds.has(e.id)}
                    onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(e.id) } })}
                  />
                  {idx < todayEvents.length - 1 ? <View style={styles.innerHr} /> : null}
                </View>
              ))}
            </View>

            <View style={styles.listCard}>
              <View style={styles.sectionRowInBox}>
                <Text style={styles.sectionRowTitle}>近くのイベント</Text>
                <Pressable onPress={() => router.push('/nearby')}>
                  <Text style={styles.sectionRowAction}>すべて見る</Text>
                </Pressable>
              </View>
              {upcomingEvents.slice(0, 3).map((e, idx) => (
                <View key={e.id}>
                  <EventRow
                    event={e}
                    attended={attendedIds.has(e.id)}
                    showDate
                    onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(e.id) } })}
                  />
                  {idx < Math.min(3, upcomingEvents.length) - 1 ? <View style={styles.innerHr} /> : null}
                </View>
              ))}
            </View>

            <View style={styles.listCard}>
              <View style={styles.sectionRowInBox}>
                <Text style={styles.followTitle}>フレンドが参加予定のイベント</Text>
              </View>
              {friendEvents.map((e, idx) => (
                <View key={e.id}>
                  <EventRow
                    event={e}
                    attended={attendedIds.has(e.id)}
                    showDate
                    onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(e.id) } })}
                  />
                  {idx < friendEvents.length - 1 ? <View style={styles.innerHr} /> : null}
                </View>
              ))}
            </View>

            <View style={styles.listCard}>
              <View style={styles.sectionRowInBox}>
                <Text style={styles.followTitle}>開催予定イベント一覧（全国）</Text>
              </View>
              {nationwideLoading ? <Text style={styles.nationwideMeta}>読み込み中...</Text> : null}
              {!nationwideLoading && nationwideError ? <Text style={styles.nationwideMeta}>{nationwideError}</Text> : null}
              {!nationwideLoading && !nationwideError && nationwideUpcomingEvents.length === 0 ? (
                <Text style={styles.nationwideMeta}>開催予定イベントはありません</Text>
              ) : null}
              {!nationwideLoading && !nationwideError
                ? visibleNationwideEvents.map((e, idx) => (
                    <View key={`nationwide-${e.id}`}>
                      <Pressable
                        onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(e.id) } })}
                        style={styles.row}>
                        <View style={styles.rowIcon}>
                          <View style={styles.rowDot} />
                        </View>
                        <View style={styles.rowMain}>
                          <Text style={styles.rowTitle}>{e.name}</Text>
                          <Text style={styles.rowSub}>
                            {formatAdminEventDate(e.start_at, e.end_at)} ・ {e.venue}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={C.soft} />
                      </Pressable>
                      {idx < visibleNationwideEvents.length - 1 ? <View style={styles.innerHr} /> : null}
                    </View>
                  ))
                : null}
              {!nationwideLoading && !nationwideError && nationwideUpcomingEvents.length > 3 ? (
                <Pressable onPress={() => setNationwideExpanded((prev) => !prev)} style={styles.nationwideMoreBtn}>
                  <Text style={styles.sectionRowAction}>{nationwideExpanded ? '折りたたむ' : 'もっと見る'}</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : (
          <View style={{ gap: 12 }}>
            {attendingToday.length === 0 ? (
              <View style={styles.followBox}>
                <Text style={styles.followTitle}>本日の参加中イベント</Text>
                <Text style={styles.help}>本日参加予定のイベントはありません</Text>
              </View>
            ) : (
              attendingToday.map((e) => {
                const friendsHere = FOLLOWING.filter((u) => u.attending.includes(e.id));
                const myLoc = myLocations[e.id];
                return (
                  <View key={e.id} style={{ gap: 8 }}>
                    <Pressable
                      onPress={() => router.push({ pathname: '/event/[id]', params: { id: String(e.id) } })}
                      style={styles.liveEventCard}>
                      <Text style={styles.liveLabel}>LIVE 参加中</Text>
                      <Text style={styles.liveEventName}>{e.name}</Text>
                      <Text style={styles.liveEventMeta}>{e.venue}</Text>
                    </Pressable>

                    <View style={styles.followBox}>
                      <Text style={styles.followTitle}>自分の現在地</Text>
                      {myLoc ? (
                        <View style={styles.myLocCard}>
                          <Text style={styles.myLocArea}>{myLoc.area}</Text>
                          {myLoc.text ? <Text style={styles.myLocText}>{myLoc.text}</Text> : null}
                          <Text style={styles.myLocTime}>{myLoc.updatedAt} 更新</Text>
                        </View>
                      ) : null}
                      {myLoc ? (
                        <View style={styles.locationActionRow}>
                          <Pressable onPress={() => openLocationModal(e.id)} style={[styles.shareBtn, styles.shareBtnGhost]}>
                            <Text style={[styles.shareBtnText, { color: C.blue }]}>場所を更新する</Text>
                          </Pressable>
                          <Pressable onPress={() => stopLocationShare(e.id)} style={styles.stopBtn}>
                            <Text style={styles.stopBtnText}>共有を止める</Text>
                          </Pressable>
                        </View>
                      ) : (
                        <Pressable onPress={() => openLocationModal(e.id)} style={styles.shareBtn}>
                          <Ionicons name="location" size={14} color="#FFFFFF" />
                          <Text style={styles.shareBtnText}>今いる場所をフレンドに知らせる</Text>
                        </Pressable>
                      )}
                    </View>

                    {friendsHere.length > 0 ? (
                      <View style={styles.followBox}>
                        <Text style={styles.followTitle}>フレンドの現在地</Text>
                        {friendsHere.map((u) => (
                          <Pressable
                            key={u.id}
                            onPress={() => router.push({ pathname: '/user/[id]', params: { id: u.id } })}
                            style={styles.friendLocRow}>
                            <UserAvatar uri={u.avatarUrl} size={30} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.friendLocName}>{u.displayName}</Text>
                              <Text style={styles.friendLocMeta}>
                                {friendLocations[u.id]?.area ?? '場所未共有'} ・ {friendLocations[u.id]?.updatedAt ?? '--:--'}
                              </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={14} color={C.soft} />
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  splashWrap: { flex: 1, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center' },
  splashCircleA: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    right: -80,
    top: -80,
  },
  splashCircleB: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    left: -60,
    bottom: 60,
  },
  splashLogoCard: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  splashTitle: { fontSize: 44, fontWeight: '900', color: C.white, letterSpacing: -1.4, fontFamily: 'Nunito_900Black' },
  splashSub: { marginTop: 8, fontSize: 12, fontWeight: '800', color: C.white, letterSpacing: 2, fontFamily: 'Nunito_800ExtraBold' },
  splashDots: { position: 'absolute', bottom: 60, flexDirection: 'row', gap: 8 },
  splashDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.8)' },

  onboardingWrap: { flex: 1 },
  skipBtn: {
    marginTop: 6,
    marginRight: 20,
    alignSelf: 'flex-end',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipText: { color: C.white, fontSize: 12, fontWeight: '800', fontFamily: 'Nunito_800ExtraBold' },
  onboardingContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  onboardingIconWrap: {
    marginTop: 10,
    width: 196,
    height: 196,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.32)',
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  onboardingTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: C.white,
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.6,
    fontFamily: 'Nunito_900Black',
  },
  onboardingSub: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: 'Nunito_600SemiBold',
  },
  onboardingBottom: { paddingHorizontal: 32, paddingBottom: 40, gap: 20 },
  dotsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 22, backgroundColor: C.white },
  nextBtn: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
  },
  nextBtnText: { fontWeight: '900', fontSize: 16, fontFamily: 'Nunito_900Black' },

  authRoot: { flex: 1, backgroundColor: C.white },
  authTop: { flex: 0.52, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  authTopCircleA: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    right: -80,
    top: -100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  authTopCircleB: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    left: -40,
    bottom: -40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  authLogoCard: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  authBrand: { fontSize: 38, fontWeight: '900', color: C.white, letterSpacing: -1.2, fontFamily: 'Nunito_900Black' },
  authTag: { marginTop: 8, fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.65)', letterSpacing: 2.2, fontFamily: 'Nunito_800ExtraBold' },
  authBottom: { flex: 1, paddingHorizontal: 32, paddingTop: 36, paddingBottom: 40, justifyContent: 'space-between' },
  authTitle: { fontSize: 22, fontWeight: '900', color: C.ink, letterSpacing: -0.4, marginBottom: 8, fontFamily: 'Nunito_900Black' },
  authDesc: { fontSize: 13, fontWeight: '600', color: C.mid, lineHeight: 21, fontFamily: 'Nunito_600SemiBold' },
  authButtons: { gap: 12 },
  appleBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtn: {
    height: 54,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleBtnText: { color: C.white, fontSize: 15, fontWeight: '900', fontFamily: 'Nunito_900Black' },
  googleBtnText: { color: C.ink, fontSize: 15, fontWeight: '900', fontFamily: 'Nunito_900Black' },
  authTerms: { fontSize: 11, color: C.soft, textAlign: 'center', lineHeight: 18, fontWeight: '600', fontFamily: 'Nunito_600SemiBold' },
  termLink: { color: C.blue },

  setupRoot: { flex: 1, backgroundColor: C.white },
  setupTop: { backgroundColor: C.blue, paddingTop: 16, paddingHorizontal: 28, paddingBottom: 24 },
  progressTrack: {
    height: 4,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: { height: 4, borderRadius: 99, backgroundColor: C.white },
  setupStepsRow: { flexDirection: 'row', justifyContent: 'center', gap: 32 },
  setupStepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepCircleOn: { backgroundColor: C.white },
  stepCircleOff: { backgroundColor: 'rgba(255,255,255,0.22)' },
  stepCircleText: { fontSize: 10, fontWeight: '900' },
  stepCircleTextOn: { color: C.blue },
  stepCircleTextOff: { color: 'rgba(255,255,255,0.6)' },
  stepLabel: { fontSize: 11, fontWeight: '800' },
  stepLabelOn: { color: C.white },
  stepLabelOff: { color: 'rgba(255,255,255,0.5)' },
  setupBody: { padding: 28, paddingBottom: 12 },
  setupSection: { gap: 20 },
  setupTitle: { fontSize: 22, fontWeight: '900', color: C.ink, letterSpacing: -0.3, fontFamily: 'Nunito_900Black' },
  setupSub: { marginTop: 6, fontSize: 13, fontWeight: '600', color: C.mid, fontFamily: 'Nunito_600SemiBold' },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: C.mid, letterSpacing: 0.3, fontFamily: 'Nunito_800ExtraBold' },
  inputWrap: {
    height: 52,
    borderRadius: 14,
    backgroundColor: C.bg,
    paddingHorizontal: 14,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputWrapActive: { borderColor: C.blue },
  atMark: { fontSize: 15, fontWeight: '800', color: C.blue, marginRight: 2 },
  textInput: { flex: 1, color: C.ink, fontSize: 15, fontWeight: '700', fontFamily: 'Nunito_700Bold' },
  emojiInput: { fontFamily: undefined },
  counter: { fontSize: 11, fontWeight: '700', color: C.soft, fontFamily: 'Nunito_700Bold' },
  hint: { fontSize: 11, fontWeight: '600', color: C.soft, fontFamily: 'Nunito_600SemiBold' },
  hintOk: { color: C.blue, fontWeight: '700' },
  hintNg: { color: C.rose, fontWeight: '700' },
  avatarPreviewWrap: { alignItems: 'center' },
  avatarPreview: {
    width: 96,
    height: 96,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPhoto: { width: 90, height: 90, borderRadius: 25 },
  segment: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, padding: 4, gap: 4 },
  segBtn: { flex: 1, borderRadius: 9, height: 38, alignItems: 'center', justifyContent: 'center' },
  segBtnOn: { backgroundColor: C.white },
  segText: { fontSize: 13, fontWeight: '800', color: C.soft, fontFamily: 'Nunito_800ExtraBold' },
  segTextOn: { color: C.blue },
  avatarGrid: { flexDirection: 'row', flexWrap: 'nowrap', gap: 8, justifyContent: 'space-between' },
  avatarCell: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  avatarCellOn: { borderColor: C.blue },
  photoBtn: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.blue,
    borderStyle: 'dashed',
    backgroundColor: C.blueBg,
    paddingVertical: 22,
    alignItems: 'center',
    gap: 8,
  },
  photoBtnText: { color: C.blue, fontSize: 14, fontWeight: '800', fontFamily: 'Nunito_800ExtraBold' },
  setupFooter: { paddingHorizontal: 28, paddingBottom: 34, paddingTop: 10 },
  backBtn: { color: C.soft, fontSize: 13, fontWeight: '700', marginBottom: 12, fontFamily: 'Nunito_700Bold' },
  setupNext: {
    height: 54,
    borderRadius: 16,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupNextDisabled: { backgroundColor: C.line },
  setupNextText: { color: C.white, fontSize: 16, fontWeight: '900', fontFamily: 'Nunito_900Black' },

  page: { paddingHorizontal: 16, paddingTop: 10, gap: 14, paddingBottom: 132 },
  headRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { color: C.soft, fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginBottom: 4, letterSpacing: 0.6 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: C.ink, fontFamily: 'Nunito_900Black' },
  notifyBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifyDot: { position: 'absolute', right: 12, top: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: C.rose },
  notifyOverlay: { flex: 1, justifyContent: 'flex-start', paddingTop: 96, backgroundColor: 'rgba(22,19,74,0.58)' },
  notifyModal: {
    marginHorizontal: 16,
    borderRadius: 18,
    backgroundColor: C.white,
    padding: 14,
    gap: 8,
  },
  notifyModalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 42 },
  notifyModalTitle: { color: C.ink, fontSize: 15, fontFamily: 'Nunito_900Black' },
  notifyCloseBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  notifyHelper: { color: C.soft, fontSize: 10, fontFamily: 'Nunito_600SemiBold', marginTop: -4, marginBottom: 2 },
  notifyRow: {
    borderRadius: 10,
    backgroundColor: C.bg,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifyText: { color: C.ink, fontSize: 11, fontFamily: 'Nunito_700Bold', flex: 1 },
  notifyTime: { color: C.soft, fontSize: 10, fontFamily: 'Nunito_700Bold' },
  notifyEmpty: { color: C.soft, fontSize: 11, fontFamily: 'Nunito_600SemiBold', textAlign: 'center', paddingVertical: 4 },
  help: { color: C.mid, fontSize: 12, fontWeight: '600', fontFamily: 'Nunito_600SemiBold', marginTop: -6 },
  homeTabs: { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 14, padding: 4, gap: 4 },
  homeTabBtn: { flex: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center', minHeight: 40 },
  homeTabBtnOn: { backgroundColor: C.white },
  homeTabAttendOn: { backgroundColor: C.rose },
  homeTabText: { color: C.mid, fontSize: 12, fontWeight: '800', fontFamily: 'Nunito_800ExtraBold' },
  homeTabTextOn: { color: C.ink },
  homeTabAttendTextOn: { color: C.white },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 2 },
  quickCardBlue: { flex: 3, borderRadius: 24, backgroundColor: C.blue, minHeight: 126, justifyContent: 'center', padding: 18 },
  quickCardRose: { flex: 2, borderRadius: 24, backgroundColor: '#FFE9ED', minHeight: 126, justifyContent: 'center', padding: 18 },
  quickCountBlue: { color: '#FFFFFF', fontWeight: '900', fontSize: 48, lineHeight: 56, fontFamily: 'Nunito_900Black' },
  quickCountRose: { color: C.rose, fontWeight: '900', fontSize: 48, lineHeight: 56, fontFamily: 'Nunito_900Black' },
  quickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quickCaption: { color: 'rgba(255,255,255,0.75)', fontWeight: '700', fontSize: 12, marginTop: 0, fontFamily: 'Nunito_700Bold' },
  quickCaptionStrong: { color: C.rose, fontWeight: '700', fontSize: 12, marginTop: 0, fontFamily: 'Nunito_700Bold' },
  todayCard: { backgroundColor: C.white, borderRadius: 24, paddingHorizontal: 12, paddingVertical: 14 },
  todayHead: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, marginBottom: 4 },
  todayTitle: { color: C.ink, fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
  liveBadge: { backgroundColor: C.rose, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  liveBadgeText: { color: C.white, fontSize: 11, fontFamily: 'Nunito_900Black' },
  innerHr: { height: 1, backgroundColor: C.line, marginHorizontal: 20 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 8, marginBottom: 6 },
  sectionRowInBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },
  sectionRowTitle: { color: C.ink, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  sectionRowAction: { color: C.blue, fontSize: 12, fontFamily: 'Nunito_700Bold' },
  listCard: { backgroundColor: C.white, borderRadius: 24, paddingTop: 8, paddingBottom: 12, marginBottom: 8 },
  row: {
    backgroundColor: C.white,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(43,91,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDot: { width: 13, height: 13, borderRadius: 8, backgroundColor: C.blue },
  rowMain: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowTitle: { fontWeight: '800', color: C.ink, fontSize: 14, flex: 1, fontFamily: 'Nunito_800ExtraBold' },
  rowSub: { marginTop: 4, color: C.mid, fontSize: 11, fontWeight: '600', fontFamily: 'Nunito_600SemiBold' },
  nationwideMeta: { color: C.soft, fontSize: 12, fontFamily: 'Nunito_600SemiBold', paddingHorizontal: 18, paddingBottom: 12 },
  nationwideMoreBtn: { alignItems: 'center', justifyContent: 'center', minHeight: 36, marginTop: 4 },
  badge: {
    color: C.blue,
    backgroundColor: C.blueBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'Nunito_800ExtraBold',
  },
  followBox: { backgroundColor: C.white, borderRadius: 24, padding: 18, gap: 10, marginTop: 2 },
  followTitle: { color: C.ink, fontWeight: '800', fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  liveEventCard: {
    borderRadius: 20,
    backgroundColor: C.blue,
    padding: 16,
    gap: 4,
  },
  liveLabel: { color: 'rgba(255,255,255,0.82)', fontSize: 10, letterSpacing: 1, fontFamily: 'Nunito_800ExtraBold' },
  liveEventName: { color: C.white, fontSize: 18, fontFamily: 'Nunito_900Black' },
  liveEventMeta: { color: 'rgba(255,255,255,0.78)', fontSize: 11, fontFamily: 'Nunito_600SemiBold' },
  myLocCard: { borderRadius: 14, backgroundColor: C.blueBg, padding: 12, gap: 2 },
  myLocArea: { color: C.blue, fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  myLocText: { color: C.ink, fontSize: 12, fontFamily: 'Nunito_600SemiBold' },
  myLocTime: { color: C.soft, fontSize: 10, fontFamily: 'Nunito_600SemiBold' },
  shareBtn: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  shareBtnGhost: { backgroundColor: '#DCE5FF', flex: 1 },
  shareBtnText: { color: C.white, fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  locationActionRow: { flexDirection: 'row', gap: 8 },
  stopBtn: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  stopBtnText: { color: C.mid, fontSize: 12, fontFamily: 'Nunito_700Bold' },
  friendLocRow: {
    borderRadius: 12,
    backgroundColor: C.bg,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  friendLocName: { color: C.ink, fontSize: 12, fontFamily: 'Nunito_700Bold' },
  friendLocMeta: { color: C.soft, fontSize: 10, fontFamily: 'Nunito_600SemiBold' },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(22,19,74,0.58)', zIndex: 120, justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 34, gap: 10 },
  modalHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  modalTitle: { color: C.ink, fontSize: 17, fontFamily: 'Nunito_900Black' },
  modalSub: { color: C.soft, fontSize: 11, fontFamily: 'Nunito_600SemiBold', marginTop: 3 },
  modalClose: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  modalLabel: { color: C.soft, fontSize: 10, letterSpacing: 0.7, fontFamily: 'Nunito_800ExtraBold', marginTop: 4 },
  areaWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  areaChip: { borderRadius: 99, backgroundColor: C.bg, paddingHorizontal: 12, paddingVertical: 8 },
  areaChipOn: { backgroundColor: C.blue },
  areaChipText: { color: C.mid, fontSize: 11, fontFamily: 'Nunito_800ExtraBold' },
  areaChipTextOn: { color: C.white },
  modalInput: { minHeight: 44, borderRadius: 12, borderWidth: 2, borderColor: C.line, backgroundColor: C.bg, paddingHorizontal: 12, color: C.ink, fontFamily: 'Nunito_700Bold' },
  modalSend: { minHeight: 48, borderRadius: 14, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  modalSendText: { color: C.white, fontSize: 13, fontFamily: 'Nunito_900Black' },
});
