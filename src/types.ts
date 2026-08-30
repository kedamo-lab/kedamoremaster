export type TabType = 'home' | 'music' | 'games';

export interface LyricLine {
  time: number;
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  audioSrc: string;
  coverSrc: string;
  lyrics: string[];
  syncedLyrics?: LyricLine[];
}

export interface GameMilestone {
  hours: number;
  label: string;
  desc: string;
  unlocked: boolean;
  badge: string;
}

export interface GameStat {
  label: string;
  value: string;
}

export interface GameItem {
  id: string;
  title: string;
  image: string;
  videoSrc?: string;
  videoEmbedUrl?: string;
  hours: number;
  hoursFormatted: string;
  genre: string;
  developer: string;
  releaseYear: string;
  rating: string;
  rank: string;
  status: string;
  summary: string;
  fullDescription: string;
  videoTitle?: string;
  stats: GameStat[];
  milestones: GameMilestone[];
  favoriteCharactersOrRole?: string[];
  tags: string[];
}

export interface ServerItem {
  name: string;
  url: string;
  avatar: string;
  tag: string;
  description: string;
  memberCount: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  handle: string;
  color: string;
  badge?: string;
}
