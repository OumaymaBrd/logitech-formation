import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  type UploadTaskSnapshot,
} from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage, isFirebaseConfigured } from "./firebase";
import { formations as staticFormations } from "./data";
import type { Course, CourseInput, MediaType } from "./types";

const COLLECTION = "courses";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 Mo
const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80 Mo

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function staticToCourse(f: (typeof staticFormations)[number]): Course {
  return {
    id: f.id,
    slug: f.slug,
    title: f.title,
    category: f.category,
    duration: f.duration,
    price: f.price,
    theory: f.theory,
    practice: f.practice,
    image: f.image,
    description: f.description,
    mediaType: "photo",
    mediaUrl: f.image,
    content: f.description,
    modules: f.modules.map((m) => ({
      ...m,
      mediaType: "none" as MediaType,
      content: "",
      mediaUrl: "",
    })),
    published: true,
  };
}

function mapDoc(id: string, data: DocumentData): Course {
  return {
    id,
    slug: data.slug ?? "",
    title: data.title ?? "",
    category: data.category ?? "",
    duration: data.duration ?? "",
    price: Number(data.price ?? 0),
    theory: Boolean(data.theory),
    practice: Boolean(data.practice),
    image: data.image || data.mediaUrl || "",
    description: data.description ?? "",
    mediaType: (data.mediaType as MediaType) || "none",
    mediaUrl: data.mediaUrl ?? "",
    videoUrl: data.videoUrl ?? "",
    videoDurationSec:
      typeof data.videoDurationSec === "number" ? data.videoDurationSec : null,
    content: data.content ?? "",
    modules: Array.isArray(data.modules) ? data.modules : [],
    published: data.published !== false,
    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toMillis?.() ?? data.updatedAt,
    createdBy: data.createdBy,
  };
}

export async function listCourses(opts?: {
  publishedOnly?: boolean;
  /** Si false, ne mélange pas les formations démo (admin / stats) */
  fallbackStatic?: boolean;
}) {
  const useFallback = opts?.fallbackStatic !== false;

  // Fallback immédiat si Firebase absent
  if (!isFirebaseConfigured()) {
    return useFallback ? staticFormations.map(staticToCourse) : [];
  }
  const db = getFirebaseDb();
  if (!db) return useFallback ? staticFormations.map(staticToCourse) : [];

  try {
    // Sans orderBy (évite échec index / docs sans createdAt) — tri côté client
    const snap = await getDocs(collection(db, COLLECTION));
    let items = snap.docs.map((d) => mapDoc(d.id, d.data()));

    items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (opts?.publishedOnly !== false) {
      items = items.filter((c) => c.published);
    }
    if (items.length === 0 && useFallback) {
      return staticFormations.map(staticToCourse);
    }
    return items;
  } catch (err) {
    console.error("[listCourses]", err);
    return useFallback ? staticFormations.map(staticToCourse) : [];
  }
}

export async function getCourseBySlug(
  slug: string,
  opts?: { fallbackStatic?: boolean; publishedOnly?: boolean }
) {
  const db = getFirebaseDb();
  if (db && isFirebaseConfigured()) {
    try {
      const snap = await getDocs(
        query(
          collection(db, COLLECTION),
          where("slug", "==", slug),
          limit(5)
        )
      );
      if (!snap.empty) {
        const courses = snap.docs.map((d) => mapDoc(d.id, d.data()));
        const publishedOnly = opts?.publishedOnly !== false;
        const match = publishedOnly
          ? courses.find((c) => c.published)
          : courses[0];
        if (match) return match;
        if (publishedOnly) return null;
      }
    } catch {
      // fallback liste ci-dessous
    }
  }

  const all = await listCourses({
    publishedOnly: opts?.publishedOnly !== false,
    fallbackStatic: opts?.fallbackStatic === true,
  });
  const found = all.find((c) => c.slug === slug);
  if (found) return found;
  if (opts?.fallbackStatic) {
    const staticOne = staticFormations.find((f) => f.slug === slug);
    return staticOne ? staticToCourse(staticOne) : null;
  }
  return null;
}

export async function getCourseById(id: string) {
  const db = getFirebaseDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return mapDoc(snap.id, snap.data());
}

function assertMediaFile(file: File, mediaType: MediaType) {
  if (mediaType === "photo") {
    if (!file.type.startsWith("image/")) {
      throw new Error("Le fichier doit être une image (JPG, PNG, WEBP…).");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("Image trop lourde (max 8 Mo).");
    }
  }
  if (mediaType === "video") {
    if (!file.type.startsWith("video/")) {
      throw new Error("Le fichier doit être une vidéo (MP4, WEBM…).");
    }
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error("Vidéo trop lourde (max 80 Mo).");
    }
  }
}

export async function uploadCourseMedia(
  file: File,
  slug: string,
  mediaType: MediaType,
  onProgress?: (pct: number) => void
) {
  const storage = getFirebaseStorage();
  if (!storage) {
    throw new Error(
      "Firebase Storage non configuré. Activez Storage dans la console Firebase."
    );
  }
  assertMediaFile(file, mediaType);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const folder = mediaType === "video" ? "videos" : "photos";
  const path = `courses/${slug}/${folder}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);

  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type || undefined,
  });

  await new Promise<UploadTaskSnapshot>((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress && snap.totalBytes > 0) {
          onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        }
      },
      reject,
      () => resolve(task.snapshot)
    );
  });

  return getDownloadURL(task.snapshot.ref);
}

export async function createCourse(
  input: Omit<CourseInput, "slug" | "image"> & {
    slug?: string;
    image?: string;
    /** @deprecated Preférer photoFile / videoFile */
    file?: File | null;
    photoFile?: File | null;
    videoFile?: File | null;
  },
  createdBy?: string,
  onProgress?: (pct: number) => void
) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré. Remplissez .env.local");

  const slug = input.slug || slugify(input.title);
  const photoFile =
    input.photoFile ??
    (input.mediaType === "photo" || input.mediaType === "both"
      ? input.file
      : null) ??
    null;
  const videoFile =
    input.videoFile ??
    (input.mediaType === "video" ? input.file : null) ??
    null;

  const hasPhoto = Boolean(photoFile);
  const hasVideo = Boolean(videoFile);

  let mediaType: MediaType = "none";
  if (hasPhoto && hasVideo) mediaType = "both";
  else if (hasPhoto) mediaType = "photo";
  else if (hasVideo) mediaType = "video";
  else if (input.mediaType === "none") mediaType = "none";
  else {
    throw new Error(
      "Uploadez au moins une photo ou une vidéo, ou choisissez « Texte uniquement »."
    );
  }

  let image = input.image?.trim() || "";
  let mediaUrl = "";
  let videoUrl = "";

  const report = (pct: number, weight: number, offset: number) => {
    if (!onProgress) return;
    onProgress(Math.min(100, Math.round(offset + pct * weight)));
  };

  if (hasPhoto && photoFile) {
    const weight = hasVideo ? 0.5 : 1;
    image = await uploadCourseMedia(photoFile, slug, "photo", (p) =>
      report(p, weight, 0)
    );
    mediaUrl = image;
  }

  if (hasVideo && videoFile) {
    const weight = hasPhoto ? 0.5 : 1;
    const offset = hasPhoto ? 50 : 0;
    videoUrl = await uploadCourseMedia(videoFile, slug, "video", (p) =>
      report(p, weight, offset)
    );
    mediaUrl = videoUrl;
  }

  if (!image) {
    image =
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80";
  }

  const modules = (input.modules || []).map((m) => ({
    ...m,
    mediaType,
    mediaUrl: mediaType === "none" ? "" : mediaUrl,
    content: m.content || input.content || input.description,
  }));

  const payload = {
    slug,
    title: input.title,
    category: input.category,
    duration: input.duration,
    price: Number(input.price) || 0,
    theory: Boolean(input.theory),
    practice: Boolean(input.practice),
    image,
    description: input.description,
    mediaType,
    mediaUrl: mediaType === "none" ? "" : mediaUrl,
    videoUrl: videoUrl || "",
    content: input.content || input.description,
    modules,
    published: input.published !== false,
    createdBy: createdBy || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const refDoc = await addDoc(collection(db, COLLECTION), payload);
  return refDoc.id;
}

export async function updateCourse(
  id: string,
  patch: Partial<CourseInput> & { file?: File | null },
  onProgress?: (pct: number) => void
) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");

  const data: Record<string, unknown> = {
    ...patch,
    updatedAt: serverTimestamp(),
  };
  delete data.file;

  if (patch.file && (patch.mediaType === "photo" || patch.mediaType === "video")) {
    const slug = patch.slug || id;
    const url = await uploadCourseMedia(
      patch.file,
      slug,
      patch.mediaType,
      onProgress
    );
    data.mediaUrl = url;
    if (patch.mediaType === "photo") data.image = url;
  }

  await updateDoc(doc(db, COLLECTION, id), data);
}

/** Enregistre la durée réelle de la vidéo (une seule fois / mise à jour) */
export async function saveCourseVideoDuration(
  courseId: string,
  videoDurationSec: number
) {
  const db = getFirebaseDb();
  if (!db || !courseId || !Number.isFinite(videoDurationSec)) return;
  await updateDoc(doc(db, COLLECTION, courseId), {
    videoDurationSec: Math.round(videoDurationSec),
    updatedAt: serverTimestamp(),
  });
}

/** Publier / dépublier un cours (visible ou non sur le site) */
export async function setCoursePublished(id: string, published: boolean) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  await updateDoc(doc(db, COLLECTION, id), {
    published,
    updatedAt: serverTimestamp(),
  });
}

export { slugify };
