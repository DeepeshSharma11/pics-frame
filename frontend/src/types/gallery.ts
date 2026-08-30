export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  date: string;
  location?: string;
  rotation?: number;
}

export interface GalleryConfig {
  recipient_name: string;
  sender_name: string;
  anniversary_date: string;
  title: string;
  letter: string;
  music_theme: string;
  photos: PhotoItem[];
}
