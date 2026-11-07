import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb, isAdminEmail } from "./firebase";

export type UserRole = "client" | "admin";
export type UserStatus = "pending" | "accepted" | "refused";

export type AppUser = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  formationSlug: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: number;
  updatedAt?: number;
};

function mapUser(uid: string, data: DocumentData): AppUser {
  return {
    uid,
    email: data.email ?? "",
    firstName: data.firstName ?? "",
    lastName: data.lastName ?? "",
    phone: data.phone ?? "",
    formationSlug: data.formationSlug ?? "",
    role: (data.role as UserRole) || "client",
    status: (data.status as UserStatus) || "pending",
    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt,
    updatedAt: data.updatedAt?.toMillis?.() ?? data.updatedAt,
  };
}

async function withTimeout<T>(promise: Promise<T>, ms = 3500): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const db = getFirebaseDb();
  if (!db) return null;
  try {
    const snap = await withTimeout(getDoc(doc(db, "users", uid)));
    if (!snap || !snap.exists()) return null;
    return mapUser(snap.id, snap.data());
  } catch {
    return null;
  }
}

export async function ensureUserProfile(params: {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  formationSlug?: string;
}): Promise<AppUser> {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");

  const ref = doc(db, "users", params.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    return mapUser(existing.id, existing.data());
  }

  const isAdmin = isAdminEmail(params.email);
  const profile: Omit<AppUser, "createdAt" | "updatedAt"> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    uid: params.uid,
    email: params.email,
    firstName: params.firstName || "",
    lastName: params.lastName || "",
    phone: params.phone || "",
    formationSlug: params.formationSlug || "",
    role: isAdmin ? "admin" : "client",
    status: isAdmin ? "accepted" : "pending",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, profile);
  return {
    uid: params.uid,
    email: params.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    formationSlug: profile.formationSlug,
    role: profile.role,
    status: profile.status,
  };
}

export async function createClientProfile(params: {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  formationSlug: string;
}) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");

  await setDoc(doc(db, "users", params.uid), {
    uid: params.uid,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    phone: params.phone,
    formationSlug: params.formationSlug,
    role: "client",
    status: "pending",
    assignedCourseIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function listUsers(): Promise<AppUser[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapUser(d.id, d.data()));
}

export async function setUserStatus(uid: string, status: UserStatus) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  await updateDoc(doc(db, "users", uid), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function updateClientProfile(
  uid: string,
  data: {
    firstName: string;
    lastName: string;
    phone: string;
  }
) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  await updateDoc(doc(db, "users", uid), {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: data.phone.trim(),
    updatedAt: serverTimestamp(),
  });
}
