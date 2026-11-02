"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  indexedDBLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  clearAdminSession,
  getFirebaseAuth,
  isAdminEmail,
  isFirebaseConfigured,
  markAdminSession,
} from "@/lib/firebase";
import {
  createClientProfile,
  ensureUserProfile,
  getUserProfile,
  type AppUser,
} from "@/lib/users";

type AuthContextValue = {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  configured: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isAccepted: boolean;
  isPending: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  registerClient: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    formationSlug: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const configured = isFirebaseConfigured();

  const loadProfile = useCallback(async (u: User) => {
    setProfileReady(false);
    try {
      let p = await getUserProfile(u.uid);
      if (!p) {
        p = await ensureUserProfile({
          uid: u.uid,
          email: u.email || "",
          firstName: u.displayName?.split(" ")[0] || "",
          lastName: u.displayName?.split(" ").slice(1).join(" ") || "",
        });
      }
      setProfile(p);
      if (
        p.role === "admin" ||
        isAdminEmail(u.email) ||
        isAdminEmail(p.email)
      ) {
        markAdminSession(u.email || p.email);
      } else {
        clearAdminSession();
      }
      return p;
    } finally {
      setProfileReady(true);
    }
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthReady(true);
      setProfileReady(true);
      return;
    }

    // Forcer IndexedDB (pas session) — reste connecté après refresh
    void setPersistence(auth, indexedDBLocalPersistence).catch(() => {
      /* déjà appliqué via initializeAuth */
    });

    const timeout = window.setTimeout(() => {
      setAuthReady(true);
      setProfileReady(true);
    }, 4000);

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
      if (!u) {
        setProfile(null);
        setProfileReady(true);
        clearAdminSession();
        return;
      }
      loadProfile(u).catch(() => {
        setProfile(null);
        setProfileReady(true);
      });
    });

    return () => {
      window.clearTimeout(timeout);
      unsub();
    };
  }, [loadProfile]);

  const loading = !authReady || (Boolean(user) && !profileReady);

  const value = useMemo<AuthContextValue>(() => {
    const isAdmin =
      Boolean(profile?.role === "admin") ||
      Boolean(user && isAdminEmail(user.email));
    const isClient = profile?.role === "client" || (!isAdmin && Boolean(user));
    const isAccepted = isAdmin || profile?.status === "accepted" || false;
    const isPending =
      profile?.role === "client" && profile?.status === "pending";

    return {
      user,
      profile,
      loading,
      configured,
      isAdmin,
      isClient,
      isAccepted,
      isPending,
      async refreshProfile() {
        if (user) await loadProfile(user);
      },
      async login(email, password) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase non configuré (.env.local)");
        // Persistence IndexedDB avant la connexion
        await setPersistence(auth, indexedDBLocalPersistence);
        const cred = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        const p = await loadProfile(cred.user);
        return p;
      },
      async registerClient(data) {
        const auth = getFirebaseAuth();
        if (!auth) throw new Error("Firebase non configuré (.env.local)");
        if (isAdminEmail(data.email)) {
          throw new Error(
            "Cet email est réservé à l'administration. Utilisez /admin/login."
          );
        }
        await setPersistence(auth, indexedDBLocalPersistence);
        const cred = await createUserWithEmailAndPassword(
          auth,
          data.email.trim(),
          data.password
        );
        await updateProfile(cred.user, {
          displayName: `${data.firstName} ${data.lastName}`.trim(),
        });
        await createClientProfile({
          uid: cred.user.uid,
          email: data.email.trim(),
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phone.trim(),
          formationSlug: data.formationSlug,
        });
        await loadProfile(cred.user);
      },
      async logout() {
        const auth = getFirebaseAuth();
        clearAdminSession();
        if (auth) await signOut(auth);
        setProfile(null);
      },
    };
  }, [user, profile, configured, loadProfile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
