import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { hasSupabaseEnv, supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerPushToken(profileId?: string) {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) return null;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  if (hasSupabaseEnv && supabase && profileId) {
    await supabase.from('push_tokens').upsert(
      {
        profile_id: profileId,
        expo_push_token: token,
        platform: Device.osName ?? 'unknown',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'expo_push_token' },
    );
  }

  return token;
}

export async function sendLocalLocationNotification(name: string, area: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'フレンドの現在地が更新されました',
      body: `${name} が「${area}」に移動しました`,
    },
    trigger: null,
  });
}

export async function triggerServerPush(payload: {
  title: string;
  body: string;
  targetProfileIds: string[];
}) {
  if (!supabase) return;
  await supabase.functions.invoke('send-push', { body: payload });
}
