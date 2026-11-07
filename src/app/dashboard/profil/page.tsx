"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { KeyRound, Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { getFirebaseAuth } from "@/lib/firebase";
import { updateClientProfile } from "@/lib/users";
import { friendlyAuthError } from "@/lib/authErrors";

const inputClass =
  "w-full rounded-xl border border-brand-100 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500 focus:ring-2 disabled:bg-brand-50 disabled:text-brand-950/60";

export default function ProfilPage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passErr, setPassErr] = useState("");

  useEffect(() => {
    if (!profile && !user) return;
    setFirstName(profile?.firstName || "");
    setLastName(profile?.lastName || "");
    setPhone(profile?.phone || "");
    setEmail(profile?.email || user?.email || "");
  }, [profile, user]);

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!user?.uid) return;
    setProfileErr("");
    setProfileMsg("");
    setSavingProfile(true);
    try {
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error("Prénom et nom sont obligatoires.");
      }
      await updateClientProfile(user.uid, {
        firstName,
        lastName,
        phone,
      });
      const auth = getFirebaseAuth();
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        });
      }
      await refreshProfile();
      setProfileMsg("Informations enregistrées.");
    } catch (err) {
      setProfileErr(
        err instanceof Error ? err.message : "Enregistrement impossible"
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setPassErr("");
    setPassMsg("");
    setSavingPass(true);
    try {
      const auth = getFirebaseAuth();
      const current = auth?.currentUser;
      if (!current?.email) throw new Error("Session invalide. Reconnectez-vous.");

      if (newPassword.length < 6) {
        throw new Error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("La confirmation ne correspond pas au nouveau mot de passe.");
      }
      if (!currentPassword) {
        throw new Error("Saisissez votre mot de passe actuel.");
      }

      const cred = EmailAuthProvider.credential(current.email, currentPassword);
      await reauthenticateWithCredential(current, cred);
      await updatePassword(current, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPassMsg("Mot de passe mis à jour.");
    } catch (err) {
      const msg = friendlyAuthError(
        err,
        "Impossible de changer le mot de passe."
      );
      setPassErr(
        msg === "Email ou mot de passe incorrect."
          ? "Mot de passe actuel incorrect."
          : msg
      );
    } finally {
      setSavingPass(false);
    }
  }

  if (authLoading) {
    return <p className="text-sm text-brand-950/50">Chargement du profil…</p>;
  }

  const initials = (
    (firstName[0] || "") + (lastName[0] || "") ||
    email[0] ||
    "U"
  ).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-950">Mon profil</h1>
        <p className="mt-1 text-sm text-brand-950/55">
          Consultez et mettez à jour vos informations, ou changez votre mot de
          passe.
        </p>
      </div>

      {/* Header card */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-brand-100/80 bg-white p-5 shadow-soft">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-700 text-lg font-extrabold text-white">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-brand-950">
            {`${firstName} ${lastName}`.trim() || "Client"}
          </p>
          <p className="truncate text-sm text-brand-950/50">{email}</p>
          {phone && (
            <p className="mt-0.5 text-xs text-brand-700">{phone}</p>
          )}
        </div>
      </div>

      {/* Infos */}
      <form
        onSubmit={onSaveProfile}
        className="rounded-2xl border border-brand-100/80 bg-white p-5 shadow-soft sm:p-6"
      >
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <UserRound className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-brand-950">
              Informations personnelles
            </h2>
            <p className="text-xs text-brand-950/45">
              Les champs marqués * sont obligatoires.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              Prénom *
            </label>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              Nom *
            </label>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              Email *
            </label>
            <input
              type="email"
              required
              value={email}
              disabled
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-brand-950/40">
              L&apos;email de connexion ne peut pas être modifié ici.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              Téléphone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+212 6XX-XXXXXX"
              className={inputClass}
            />
          </div>
        </div>

        {profileErr && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {profileErr}
          </p>
        )}
        {profileMsg && (
          <p className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
            {profileMsg}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            className="gap-2"
            disabled={savingProfile}
          >
            <Save className="h-4 w-4" />
            {savingProfile ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>

      {/* Password */}
      <form
        onSubmit={onChangePassword}
        className="rounded-2xl border border-brand-100/80 bg-white p-5 shadow-soft sm:p-6"
      >
        <div className="mb-5 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <KeyRound className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-brand-950">
              Changer le mot de passe
            </h2>
            <p className="text-xs text-brand-950/45">
              Pour votre sécurité, confirmez d&apos;abord le mot de passe actuel.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              Mot de passe actuel *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              Nouveau mot de passe *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-950">
              Confirmer *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
        </div>

        {passErr && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {passErr}
          </p>
        )}
        {passMsg && (
          <p className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
            {passMsg}
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            className="gap-2"
            disabled={savingPass}
          >
            <KeyRound className="h-4 w-4" />
            {savingPass ? "Mise à jour…" : "Changer le mot de passe"}
          </Button>
        </div>
      </form>
    </div>
  );
}
