export type EventItem = {
  id: number;
  name: string;
  venue: string;
  tag: '野外' | '室内' | '大規模';
  date: string;
  time: string;
  ticket: string;
  description: string;
  dressing: boolean;
  photo: boolean;
  url?: string;
};

export type FollowingUser = {
  id: string;
  name: string;
  displayName: string;
  bio: string;
  emoji: string;
  avatarUrl?: string;
  sns: {
    twitter: string;
    instagram: string;
    tiktok: string;
  };
  attending: number[];
  location?: {
    eventId: number;
    area: string;
    text: string;
    updatedAt: string;
  } | null;
};

export const TODAY = '2025-06-15';

export const ALL_EVENTS: EventItem[] = [
  {
    id: 1,
    name: 'acosta! 池袋',
    venue: '東池袋中央公園',
    tag: '野外',
    date: '2025-06-15',
    time: '10:00〜17:00',
    ticket: '無料',
    description: 'acosta! Ikebukuro',
    dressing: true,
    photo: true,
    url: 'https://acosta.jp/',
  },
  {
    id: 2,
    name: 'コスプレサミット渋谷',
    venue: '渋谷区文化総合センター',
    tag: '室内',
    date: '2025-06-15',
    time: '11:00〜18:00',
    ticket: '無料',
    description: 'Cosplay Summit Shibuya',
    dressing: true,
    photo: true,
    url: 'https://worldcosplaysummit.jp/',
  },
  {
    id: 3,
    name: 'コミックマーケット 105',
    venue: '東京ビッグサイト',
    tag: '大規模',
    date: '2025-08-12',
    time: '10:00〜16:00',
    ticket: '1,000円',
    description: 'Comiket 105',
    dressing: true,
    photo: true,
    url: 'https://www.comiket.co.jp/',
  },
  {
    id: 4,
    name: 'ニコニコ超会議 2025',
    venue: '幕張メッセ',
    tag: '大規模',
    date: '2025-09-26',
    time: '10:00〜18:00',
    ticket: '2,500円',
    description: 'Niconico Chokaigi 2025',
    dressing: true,
    photo: true,
    url: 'https://chokaigi.jp/',
  },
  {
    id: 5,
    name: '日本橋ストリートフェスタ',
    venue: '日本橋〜なんば',
    tag: '野外',
    date: '2025-07-16',
    time: '11:00〜17:00',
    ticket: '無料',
    description: 'Nipponbashi Street Festa',
    dressing: false,
    photo: true,
    url: 'https://www.nippombashi.jp/festa/',
  },
];

export const FOLLOWING: FollowingUser[] = [
  {
    id: 'u1',
    name: 'raiden_cos',
    displayName: '雷電コスプレイヤー',
    bio: '原神メイン。雷電将軍が好きです',
    emoji: '⚔️',
    avatarUrl: '',
    sns: { twitter: '@raiden_cos', instagram: 'raiden_cosplay', tiktok: '' },
    attending: [1, 3],
    location: { eventId: 1, area: 'ステージ前', text: '', updatedAt: '14:32' },
  },
  {
    id: 'u2',
    name: 'kafka_star',
    displayName: 'カフカスター',
    bio: 'スタレ・崩壊系。撮影歓迎',
    emoji: '⭐',
    avatarUrl: '',
    sns: { twitter: '@kafka_star', instagram: '', tiktok: 'kafka_star_cos' },
    attending: [1, 2],
    location: { eventId: 1, area: '撮影エリアA', text: '3人で集まってます！', updatedAt: '14:55' },
  },
  {
    id: 'u3',
    name: 'gojo_san',
    displayName: '五条さん',
    bio: '呪術廻戦一筋。五条悟コスずっとやってます',
    emoji: '🌀',
    avatarUrl: '',
    sns: { twitter: '', instagram: 'gojo.cos', tiktok: '' },
    attending: [3],
    location: null,
  },
  {
    id: 'u4',
    name: 'nami_cos',
    displayName: 'ナミコス',
    bio: 'ワンピース・ナミ担当',
    emoji: '🌊',
    avatarUrl: '',
    sns: { twitter: '@nami_cos_one', instagram: 'nami_cosplay_jp', tiktok: 'nami_cos' },
    attending: [1, 4],
    location: { eventId: 1, area: '入口付近', text: '', updatedAt: '15:10' },
  },
];

export const AVATAR_PRESETS = [
  { id: 'cat', emoji: '🐱' },
  { id: 'star', emoji: '⭐' },
  { id: 'moon', emoji: '🌙' },
  { id: 'fire', emoji: '🔥' },
  { id: 'sakura', emoji: '🌸' },
  { id: 'sword', emoji: '⚔️' },
  { id: 'crown', emoji: '👑' },
  { id: 'gem', emoji: '💎' },
  { id: 'wave', emoji: '🌊' },
  { id: 'spiral', emoji: '🌀' },
  { id: 'rainbow', emoji: '🌈' },
  { id: 'bolt', emoji: '⚡' },
];
