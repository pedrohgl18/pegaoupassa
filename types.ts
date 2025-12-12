export interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  imageUrl: string;
  photos: string[];
  distance: number;
  verified: boolean;
  zodiacSign?: string;
  profession?: string;
  education?: string;
  height?: number;
  interests?: { id: string; name: string; emoji: string }[];
  vibeStatus?: string;
  vibeExpiresAt?: string;
  neighborhood?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
}

export interface Chat {
  id: string;
  conversationId: string;
  otherUserId: string;
  name: string;
  imageUrl: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isNewMatch?: boolean;
  isVip?: boolean;
}

export enum ScreenState {
  LOGIN = 'LOGIN',
  ONBOARDING = 'ONBOARDING',
  HOME = 'HOME',
  CHAT = 'CHAT',
  VIP = 'VIP',
  PROFILE = 'PROFILE',
  EDIT_PROFILE = 'EDIT_PROFILE',
  ADMIN = 'ADMIN'
}

export type SwipeDirection = 'up' | 'down' | null;