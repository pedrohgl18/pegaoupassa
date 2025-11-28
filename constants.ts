import { Profile, Chat } from './types';

export const DAILY_FREE_SWIPES = 30;
export const VIP_PRICE = "R$ 9,90";

export const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Júlia',
    age: 23,
    bio: 'Viciada em séries e viagens ✈️. Procurando alguém para dividir uma pizza.',
    imageUrl: 'https://picsum.photos/seed/julia/800/1200',
    distance: 2,
    verified: true,
  },
  {
    id: '2',
    name: 'Mariana',
    age: 25,
    bio: 'Arquitetura 📐 | Coffee lover ☕ | Crossfit',
    imageUrl: 'https://picsum.photos/seed/mariana/800/1200',
    distance: 5,
    verified: false,
  },
  {
    id: '3',
    name: 'Beatriz',
    age: 22,
    bio: 'A vida é muito curta para não comer sobremesa primeiro.',
    imageUrl: 'https://picsum.photos/seed/beatriz/800/1200',
    distance: 12,
    verified: true,
  },
  {
    id: '4',
    name: 'Larissa',
    age: 24,
    bio: 'Gamer 🎮 e mãe de pet 🐶',
    imageUrl: 'https://picsum.photos/seed/larissa/800/1200',
    distance: 8,
    verified: true,
  },
  {
    id: '5',
    name: 'Carolina',
    age: 26,
    bio: 'Sempre pronta para uma aventura na praia 🌊',
    imageUrl: 'https://picsum.photos/seed/carolina/800/1200',
    distance: 15,
    verified: false,
  },
];

export const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Sofia',
    imageUrl: 'https://picsum.photos/seed/sofia/200/200',
    lastMessage: 'Vocês deram match!',
    timestamp: 'Agora',
    unreadCount: 0,
    isNewMatch: true,
  },
  {
    id: '2',
    name: 'Lucas',
    imageUrl: 'https://picsum.photos/seed/lucas/200/200',
    lastMessage: 'Vocês deram match!',
    timestamp: 'Agora',
    unreadCount: 0,
    isNewMatch: true,
  },
  {
    id: '3',
    name: 'Camila',
    imageUrl: 'https://picsum.photos/seed/camila/200/200',
    lastMessage: 'Oi! Tudo bem? Vi que você também curte...',
    timestamp: '14:30',
    unreadCount: 2,
    isNewMatch: false,
  },
  {
    id: '4',
    name: 'Rodrigo',
    imageUrl: 'https://picsum.photos/seed/rodrigo/200/200',
    lastMessage: 'Haha, ótima foto de perfil. Onde foi?',
    timestamp: 'Ontem',
    unreadCount: 0,
    isNewMatch: false,
  },
  {
    id: '5',
    name: 'Juliana',
    imageUrl: 'https://picsum.photos/seed/juliana/200/200',
    lastMessage: 'Você: Vamos combinar algo então!',
    timestamp: 'Sexta',
    unreadCount: 0,
    isNewMatch: false,
  }
];