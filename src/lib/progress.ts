import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type CourseProgress = {
  userId: string;
  courseId: string;
  courseSlug: string;
  completedModuleIds: string[];
  percent: number;
  videoDurationSec?: number | null;
  updatedAt?: number;
};

function progressId(userId: string, courseId: string) {
  return `${userId}_${courseId}`;
}

export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<CourseProgress | null> {
  const db = getFirebaseDb();
  if (!db || !userId || !courseId) return null;
  const snap = await getDoc(doc(db, "progress", progressId(userId, courseId)));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    userId: data.userId ?? userId,
    courseId: data.courseId ?? courseId,
    courseSlug: data.courseSlug ?? "",
    completedModuleIds: Array.isArray(data.completedModuleIds)
      ? data.completedModuleIds
      : [],
    percent: Number(data.percent ?? 0),
    videoDurationSec:
      typeof data.videoDurationSec === "number" ? data.videoDurationSec : null,
    updatedAt: data.updatedAt?.toMillis?.() ?? data.updatedAt,
  };
}

export async function saveCourseProgress(params: {
  userId: string;
  courseId: string;
  courseSlug: string;
  completedModuleIds: string[];
  moduleCount: number;
  videoDurationSec?: number | null;
}) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");

  const percent =
    params.moduleCount > 0
      ? Math.round(
          (params.completedModuleIds.length / params.moduleCount) * 100
        )
      : 0;

  const payload: Record<string, unknown> = {
    userId: params.userId,
    courseId: params.courseId,
    courseSlug: params.courseSlug,
    completedModuleIds: params.completedModuleIds,
    percent,
    updatedAt: serverTimestamp(),
  };
  if (params.videoDurationSec != null) {
    payload.videoDurationSec = params.videoDurationSec;
  }

  await setDoc(
    doc(db, "progress", progressId(params.userId, params.courseId)),
    payload,
    { merge: true }
  );

  return { percent, completedModuleIds: params.completedModuleIds };
}
