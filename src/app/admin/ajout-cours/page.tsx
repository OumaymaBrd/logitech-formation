"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImageIcon, Loader2, Video, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { categories } from "@/lib/data";
import { createCourse, slugify } from "@/lib/courses";

type MediaMode = "media" | "none";
type ModalPhase = "idle" | "uploading" | "saving" | "done" | "error";

function FileDropZone({
  accept,
  label,
  hint,
  file,
  required,
  onChange,
  preview,
}: {
  accept: string;
  label: string;
  hint: string;
  file: File | null;
  required?: boolean;
  onChange: (f: File | null) => void;
  preview?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-brand-950">{label}</p>
          <p className="mt-0.5 text-xs text-brand-950/55">{hint}</p>
        </div>
        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 text-xs font-medium text-brand-700 hover:underline"
          >
            Retirer
          </button>
        )}
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 bg-white px-4 py-6 text-center transition hover:border-brand-500 hover:bg-brand-50/60">
        <Upload className="h-5 w-5 text-brand-700" />
        <span className="text-sm font-semibold text-brand-700">
          {file ? "Changer le fichier" : "Choisir un fichier"}
        </span>
        <span className="max-w-full truncate px-2 text-xs text-brand-950/50">
          {file ? file.name : "Glisser-déposer ou cliquer"}
        </span>
        <input
          type="file"
          accept={accept}
          required={required}
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>

      {file && (
        <p className="mt-2 truncate text-xs text-brand-700">
          {file.name} ·{" "}
          {file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
            : `${Math.round(file.size / 1024)} Ko`}
        </p>
      )}
      {preview}
    </div>
  );
}

export default function AjoutCoursPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [modalPhase, setModalPhase] = useState<ModalPhase>("idle");
  const [createdSlug, setCreatedSlug] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[1] ?? "Grues");
  const [duration, setDuration] = useState("5 jours");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [mediaMode, setMediaMode] = useState<MediaMode>("media");
  const [wantPhoto, setWantPhoto] = useState(true);
  const [wantVideo, setWantVideo] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [theory, setTheory] = useState(true);
  const [practice, setPractice] = useState(true);

  const photoPreview = useMemo(() => {
    if (!photoFile) return "";
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  const videoPreview = useMemo(() => {
    if (!videoFile) return "";
    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setProgress(0);
    setCreatedSlug("");
    setPending(true);
    setModalPhase(
      mediaMode === "media" && (wantPhoto || wantVideo) ? "uploading" : "saving"
    );
    try {
      if (mediaMode === "media") {
        if (!wantPhoto && !wantVideo) {
          throw new Error("Cochez Photo et/ou Vidéo, ou choisissez Texte uniquement.");
        }
        if (wantPhoto && !photoFile) {
          throw new Error("Choisissez un fichier image à uploader.");
        }
        if (wantVideo && !videoFile) {
          throw new Error("Choisissez un fichier vidéo à uploader.");
        }
      }

      const mediaType =
        mediaMode === "none"
          ? "none"
          : wantPhoto && wantVideo
            ? "both"
            : wantPhoto
              ? "photo"
              : "video";

      const slug = slugify(title);
      await createCourse(
        {
          title,
          category: category.trim() || "Autres",
          duration,
          price: 0,
          theory,
          practice,
          description,
          content: content || description,
          mediaType,
          mediaUrl: "",
          image: "",
          photoFile: mediaMode === "media" && wantPhoto ? photoFile : null,
          videoFile: mediaMode === "media" && wantVideo ? videoFile : null,
          modules: [
            {
              id: "m1",
              title: "Module 1 — Introduction",
              duration: "",
              content: content || description,
              mediaType,
              mediaUrl: "",
            },
          ],
          published: false,
          slug,
        },
        user?.email || undefined,
        (pct) => {
          setProgress(pct);
          if (pct >= 100) setModalPhase("saving");
          else setModalPhase("uploading");
        }
      );

      setCreatedSlug(slug);
      setProgress(100);
      setModalPhase("done");
      setTimeout(() => router.push("/admin/formations"), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'ajout";
      const full =
        msg.toLowerCase().includes("storage") || msg.includes("403")
          ? `${msg} → Vérifiez Firebase Storage (règles en mode test).`
          : msg;
      setError(full);
      setModalPhase("error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-brand-950">
          Ajout du cours
        </h1>
        <p className="mt-1 text-sm text-brand-950/55">
          Importez une photo, une vidéo, ou les deux — fichiers uniquement.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft"
      >
        <div className="space-y-6 p-5 sm:p-7">
          {/* Infos générales */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Informations
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-950">
                Titre du cours *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="Ex: Conduite de grue mobile"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-950">
                  Catégorie
                </label>
                <input
                  list="category-suggestions"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Choisir ou saisir une catégorie…"
                  className="w-full rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <datalist id="category-suggestions">
                  {categories
                    .filter((c) => c !== "Toutes")
                    .map((c) => (
                      <option key={c} value={c} />
                    ))}
                </datalist>
                <p className="mt-1 text-[11px] text-brand-950/45">
                  Suggestions disponibles, ou tapez une catégorie libre.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-brand-950">
                  Durée
                </label>
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/50 px-3.5 py-2 text-sm text-brand-950">
                <input
                  type="checkbox"
                  checked={theory}
                  onChange={(e) => setTheory(e.target.checked)}
                  className="accent-brand-700"
                />
                Théorie
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/50 px-3.5 py-2 text-sm text-brand-950">
                <input
                  type="checkbox"
                  checked={practice}
                  onChange={(e) => setPractice(e.target.checked)}
                  className="accent-brand-700"
                />
                Pratique
              </label>
            </div>
          </section>

          <hr className="border-brand-100" />

          {/* Contenu */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Contenu
            </h2>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-950">
                Description courte *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-y rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-brand-950">
                Contenu de la leçon
              </label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Texte affiché dans l'espace leçon"
                className="w-full resize-y rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </section>

          <hr className="border-brand-100" />

          {/* Médias */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-700">
              Médias
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setMediaMode("media");
                  if (!wantPhoto && !wantVideo) setWantPhoto(true);
                }}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                  mediaMode === "media"
                    ? "border-brand-700 bg-brand-100/80 text-brand-700 shadow-sm"
                    : "border-brand-100 text-brand-950/80 hover:bg-brand-50"
                }`}
              >
                <Upload className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">
                    Photo et / ou vidéo
                  </span>
                  <span className="mt-0.5 block text-xs opacity-70">
                    Uploader un ou deux fichiers
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaMode("none");
                  setPhotoFile(null);
                  setVideoFile(null);
                  setProgress(0);
                }}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                  mediaMode === "none"
                    ? "border-brand-700 bg-brand-100/80 text-brand-700 shadow-sm"
                    : "border-brand-100 text-brand-950/80 hover:bg-brand-50"
                }`}
              >
                <FileText className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">
                    Texte uniquement
                  </span>
                  <span className="mt-0.5 block text-xs opacity-70">
                    Aucun fichier média
                  </span>
                </span>
              </button>
            </div>

            {mediaMode === "media" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <label
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${
                      wantPhoto
                        ? "border-brand-700 bg-brand-100 text-brand-700"
                        : "border-brand-100 text-brand-950/70 hover:bg-brand-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={wantPhoto}
                      onChange={(e) => {
                        setWantPhoto(e.target.checked);
                        if (!e.target.checked) setPhotoFile(null);
                      }}
                    />
                    <ImageIcon className="h-4 w-4" />
                    Photo
                  </label>
                  <label
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${
                      wantVideo
                        ? "border-brand-700 bg-brand-100 text-brand-700"
                        : "border-brand-100 text-brand-950/70 hover:bg-brand-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={wantVideo}
                      onChange={(e) => {
                        setWantVideo(e.target.checked);
                        if (!e.target.checked) setVideoFile(null);
                      }}
                    />
                    <Video className="h-4 w-4" />
                    Vidéo
                  </label>
                </div>

                <div
                  className={`grid gap-4 ${
                    wantPhoto && wantVideo ? "sm:grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {wantPhoto && (
                    <FileDropZone
                      accept="image/*"
                      label="Upload image *"
                      hint="JPG, PNG, WEBP — max 8 Mo"
                      file={photoFile}
                      required
                      onChange={(f) => {
                        setPhotoFile(f);
                        setProgress(0);
                      }}
                      preview={
                        photoPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={photoPreview}
                            alt="Aperçu"
                            className="mt-3 max-h-40 w-full rounded-xl object-cover"
                          />
                        ) : null
                      }
                    />
                  )}
                  {wantVideo && (
                    <FileDropZone
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      label="Upload vidéo *"
                      hint="MP4 / WEBM — max 80 Mo"
                      file={videoFile}
                      required
                      onChange={(f) => {
                        setVideoFile(f);
                        setProgress(0);
                      }}
                      preview={
                        videoPreview ? (
                          <video
                            src={videoPreview}
                            controls
                            className="mt-3 max-h-48 w-full rounded-xl bg-black"
                          />
                        ) : null
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </section>

        </div>

        {/* Actions */}
        <div className="flex justify-end border-t border-brand-100 bg-brand-50/40 px-5 py-4 sm:px-7">
          <Button
            type="submit"
            variant="primary"
            disabled={pending}
            className="w-full min-w-[200px] sm:w-auto"
          >
            {pending
              ? progress > 0
                ? `Upload ${progress}%…`
                : "Enregistrement…"
              : "Ajouter le cours"}
          </Button>
        </div>
      </form>

      {/* Modal avancement */}
      {modalPhase !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-brand-950">
                  {modalPhase === "done"
                    ? "Cours créé"
                    : modalPhase === "error"
                      ? "Erreur"
                      : "Publication en cours"}
                </h3>
                <p className="mt-1 text-sm text-brand-950/55">
                  {modalPhase === "uploading" &&
                    "Upload des fichiers vers Firebase Storage…"}
                  {modalPhase === "saving" &&
                    "Enregistrement du cours dans Firestore…"}
                  {modalPhase === "done" &&
                    "Redirection vers la liste des formations…"}
                  {modalPhase === "error" && "La création a échoué."}
                </p>
              </div>
              {modalPhase === "error" && (
                <button
                  type="button"
                  onClick={() => setModalPhase("idle")}
                  className="rounded-lg p-1 text-brand-950/50 hover:bg-brand-50 hover:text-brand-950"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {(modalPhase === "uploading" || modalPhase === "saving") && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {modalPhase === "uploading"
                    ? `Upload ${progress}%`
                    : "Finalisation…"}
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-brand-100">
                  <div
                    className="h-full rounded-full bg-brand-700 transition-all duration-300"
                    style={{
                      width: `${
                        modalPhase === "saving"
                          ? 100
                          : Math.max(progress, 4)
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {modalPhase === "done" && (
              <div className="flex items-start gap-3 rounded-xl bg-green-50 px-3.5 py-3 text-sm text-green-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Cours enregistré avec succès.</p>
                  {createdSlug && (
                    <p className="mt-0.5 text-xs text-green-700/80">
                      /formations/{createdSlug}
                    </p>
                  )}
                </div>
              </div>
            )}

            {modalPhase === "error" && (
              <div className="space-y-4">
                <p className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">
                  {error}
                </p>
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={() => setModalPhase("idle")}
                >
                  Réessayer
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
