export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  role: 'admin' | 'partner' | 'visitor';
}

export interface DailyMessage {
  date: string; // YYYY-MM-DD
  message: string;
}

export interface Memory {
  id: string;
  imageUrl: string;
  caption: string;
  date: string;
  type?: 'image' | 'video';
}

export interface LoveLetter {
  id: string;
  title: string;
  content: string;
  unlockDate?: string; // ISO Date string
  archived?: boolean;
  archivedAt?: any;
}

export interface OpenWhenEnvelope {
  id: string;
  title: string;
  message: string;
  category: string; // "stressed", "miss me", "can't sleep", etc.
  type: 'text' | 'image' | 'voice';
  contentUrl?: string; // Optional image or voice url
  unlocked?: boolean;
}

export interface SurpriseData {
  heading: string;
  videoUrl: string;
  promiseTitle: string;
  promiseText: string;
  magicalTitle: string;
  magicalText: string;
  typewriterMessages: string[];
  preBirthdayMusic?: string;
  birthdayMusic?: string;
  landingImageUrl?: string;
  manualUnlocks?: {
    [key: string]: boolean;
  };
}

export interface JarData {
  messages: string[];
}

export interface ThinkingStatus {
  isThinking: boolean;
  timestamp: any;
}
