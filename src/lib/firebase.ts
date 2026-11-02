import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

/**
 * Auth avec persistence IndexedDB (reste connecté après refresh / nouvel onglet).
 * Pas de sessionStorage → pas de reconnexion à chaque fermeture d'onglet.
 */
export function getFirebaseAuth() {
  const a = getFirebaseApp();
  if (!a) return null;

  if (typeof window === "undefined") {
    // Côté serveur : pas de persistence navigateur
    if (!auth) auth = getAuth(a);
    return auth;
  }

  if (!auth) {
    try {
      auth = initializeAuth(a, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      });
    } catch {
      // Déjà initialisé (HMR / double appel)
      auth = getAuth(a);
    }
  }
  return auth;
}

export function getFirebaseDb() {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!db) db = getFirestore(a);
  return db;
}

export function getFirebaseStorage() {
  const a = getFirebaseApp();
  if (!a) return null;
  if (!storage) storage = getStorage(a);
  return storage;
}

export function getAdminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const admins = getAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(email.toLowerCase());
}

/** Marqueur local pour éviter le flash "vérification" à chaque navigation */
const ADMIN_FLAG = "lf_admin_authed";
const ADMIN_EMAIL_COOKIE = "lf_admin_email";
const REMEMBER_COOKIE = "lf_admin_remember";

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const key = `${encodeURIComponent(name)}=`;
  const part = document.cookie.split("; ").find((c) => c.startsWith(key));
  if (!part) return "";
  try {
    return decodeURIComponent(part.slice(key.length));
  } catch {
    return "";
  }
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

export function markAdminSession(email: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      ADMIN_FLAG,
      JSON.stringify({ email: email.toLowerCase(), at: Date.now() })
    );
    // Cookie miroir (30 jours) — session admin mémorisée
    setCookie(ADMIN_FLAG, "1", 30);
  } catch {
    /* ignore */
  }
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_FLAG);
    deleteCookie(ADMIN_FLAG);
  } catch {
    /* ignore */
  }
}

export function hasCachedAdminSession() {
  if (typeof window === "undefined") return false;
  try {
    if (getCookie(ADMIN_FLAG) === "1") return true;
    const raw = localStorage.getItem(ADMIN_FLAG);
    if (!raw) return false;
    const data = JSON.parse(raw) as { email?: string; at?: number };
    if (!data?.email || !isAdminEmail(data.email)) {
      localStorage.removeItem(ADMIN_FLAG);
      return false;
    }
    // Valide 30 jours (la vraie session Firebase gère le refresh token)
    if (data.at && Date.now() - data.at > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(ADMIN_FLAG);
      deleteCookie(ADMIN_FLAG);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Mémoriser l'email admin (cookie) si « Se souvenir de moi » */
export function saveRememberedAdminEmail(email: string, remember: boolean) {
  if (typeof window === "undefined") return;
  if (remember) {
    setCookie(ADMIN_EMAIL_COOKIE, email.trim().toLowerCase(), 30);
    setCookie(REMEMBER_COOKIE, "1", 30);
  } else {
    deleteCookie(ADMIN_EMAIL_COOKIE);
    deleteCookie(REMEMBER_COOKIE);
  }
}

export function getRememberedAdminEmail() {
  if (typeof window === "undefined") return "";
  if (getCookie(REMEMBER_COOKIE) !== "1") return "";
  return getCookie(ADMIN_EMAIL_COOKIE);
}

export function isAdminRememberChecked() {
  return getCookie(REMEMBER_COOKIE) === "1";
}
