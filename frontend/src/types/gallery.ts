export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  date: string;
  location?: string;
  rotation?: number;
}

export type ThemeType = "rose" | "midnight" | "sunset" | "emerald" | "neon";
export type ParticleType = "hearts" | "sparkles" | "petals" | "stars" | "butterflies";
export type OccasionType = "anniversary" | "birthday" | "proposal" | "valentine" | "just_because";

export interface GalleryConfig {
  recipient_name: string;
  sender_name: string;
  anniversary_date: string;
  title: string;
  letter: string;
  music_theme: string;
  theme?: ThemeType;
  particle_type?: ParticleType;
  occasion_type?: OccasionType;
  surprise_message?: string;
  reasons?: string[];
  photos: PhotoItem[];
}
