export type MediaType = "photo" | "video" | "both" | "none";

export type CourseModule = {
  id: string;
  title: string;
  duration: string;
  content?: string;
  mediaType?: MediaType;
  mediaUrl?: string;
  completed?: boolean;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  price: number;
  theory: boolean;
  practice: boolean;
  image: string;
  description: string;
  /** Type de média principal du cours */
  mediaType: MediaType;
  /** URL photo (ou média principal) */
  mediaUrl: string;
  /** URL vidéo si présente (photo+vidéo ou vidéo seule) */
  videoUrl?: string;
  /** Durée réelle de la vidéo (secondes), détectée / sauvegardée */
  videoDurationSec?: number | null;
  /** Contenu textuel / leçon */
  content: string;
  modules: CourseModule[];
  published: boolean;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
};

export type CourseInput = Omit<Course, "id" | "createdAt" | "updatedAt">;
