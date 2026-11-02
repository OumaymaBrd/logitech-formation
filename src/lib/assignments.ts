import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

/** Récupère les IDs de formations affectées à un client */
export async function getAssignedCourseIds(userId: string): Promise<string[]> {
  const db = getFirebaseDb();
  if (!db || !userId) return [];
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data.assignedCourseIds)
    ? data.assignedCourseIds.map(String)
    : [];
}

/** Affecte une ou plusieurs formations à un client (remplace la liste) */
export async function setAssignedCourses(
  userId: string,
  courseIds: string[]
) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  const unique = Array.from(new Set(courseIds.filter(Boolean)));
  await updateDoc(doc(db, "users", userId), {
    assignedCourseIds: unique,
    updatedAt: serverTimestamp(),
  });
  return unique;
}
