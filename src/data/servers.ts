import { ServerItem, SocialLink } from '../types';

export const discordServers: ServerItem[] = [
  {
    name: 'Dead by Daylight RU',
    url: 'https://discord.gg/dbd',
    avatar: '/icons/servers/dead by daylight RU.png',
    tag: 'Community',
    description: 'Главное русскоязычное сообщество DBD — пати, турниры и новости',
    memberCount: '80,000+ участников',
  },
  {
    name: 'ARUKU',
    url: 'https://discord.gg/aruku',
    avatar: '/icons/servers/ARUKU.png',
    tag: 'Community',
    description: 'Атмосферный сервер с дружелюбным комьюнити, музыкой и ивентами',
    memberCount: '25,000+ участников',
  },
  {
    name: 'Monolith',
    url: 'https://discord.gg/EcJuDmxKwv',
    avatar: '/icons/servers/Monolith.png',
    tag: 'Gaming / Squad',
    description: 'Игровой сервер Monolith — совместный гейминг, войсы и общение',
    memberCount: '12,000+ участников',
  },
];

export const socialLinks: SocialLink[] = [
  {
    name: 'Discord',
    url: 'https://discord.com/users/1479799017104998450',
    icon: '/icons/discord.svg',
    handle: 'goodyuikim (ID: 1479799017104998450)',
    color: '#5865F2',
    badge: 'Online & Voice',
  },
  {
    name: 'Steam Profile',
    url: 'https://steamcommunity.com/profiles/76561199086500935/',
    icon: '/icons/steam.svg',
    handle: 'Kedamo (76561199086500935)',
    color: '#66c0f4',
    badge: 'Level 42 • 4,500+ hrs',
  },
  {
    name: 'Telegram',
    url: 'https://t.me/goodyuikim',
    icon: '/icons/telegram.svg',
    handle: '@goodyuikim',
    color: '#229ED9',
    badge: 'Direct PM',
  },
];
