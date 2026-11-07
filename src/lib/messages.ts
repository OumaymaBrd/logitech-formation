import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "./firebase";

export type ContactMessageStatus = "new" | "read" | "archived";

export type ContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: ContactMessageStatus;
  createdAt?: number;
};

const COLLECTION = "contactMessages";

function mapMessage(id: string, data: DocumentData): ContactMessage {
  return {
    id,
    fullName: data.fullName ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    message: data.message ?? "",
    status: (data.status as ContactMessageStatus) || "new",
    createdAt: data.createdAt?.toMillis?.() ?? data.createdAt,
  };
}

export async function createContactMessage(input: {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const message = input.message.trim();

  if (!fullName || !email.includes("@") || !phone || !message) {
    throw new Error("Veuillez remplir tous les champs correctement.");
  }

  const ref = await addDoc(collection(db, COLLECTION), {
    fullName,
    email,
    phone,
    message,
    status: "new",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const db = getFirebaseDb();
  if (!db) return [];
  try {
    const q = query(
      collection(db, COLLECTION),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapMessage(d.id, d.data()));
  } catch (err) {
    console.error("[listContactMessages]", err);
    // Fallback sans orderBy si index / docs sans createdAt
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs
      .map((d) => mapMessage(d.id, d.data()))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

export async function setContactMessageStatus(
  id: string,
  status: ContactMessageStatus
) {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase non configuré");
  await updateDoc(doc(db, COLLECTION, id), { status });
}
