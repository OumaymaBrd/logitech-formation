"use client";

import Image from "next/image";
import type { MediaType } from "@/lib/types";

type Props = {
  mediaType: MediaType;
  mediaUrl?: string;
  videoUrl?: string;
  image?: string;
  title: string;
  className?: string;
  /** Durée réelle de la vidéo (secondes) quand metadata chargées */
  onVideoDuration?: (seconds: number) => void;
};

function youtubeEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function PhotoBlock({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const isRemote = src.startsWith("http");
  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-[14px] bg-brand-950 shadow-card ${className ?? ""}`}
    >
      {isRemote ? (
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 70vw"
          unoptimized={src.includes("firebasestorage")}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={title} className="h-full w-full object-cover" />
      )}
    </div>
  );
}

function VideoBlock({
  url,
  poster,
  title,
  className,
  onDuration,
}: {
  url: string;
  poster?: string;
  title: string;
  className?: string;
  onDuration?: (seconds: number) => void;
}) {
  const yt = youtubeEmbed(url);
  if (yt) {
    return (
      <div
        className={`relative aspect-video overflow-hidden rounded-[14px] bg-brand-950 shadow-card ${className ?? ""}`}
      >
        <iframe
          src={yt}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-[14px] bg-brand-950 shadow-card ${className ?? ""}`}
    >
      <video
        src={url}
        controls
        className="h-full w-full object-contain"
        poster={poster || undefined}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) onDuration?.(d);
        }}
      >
        Votre navigateur ne prend pas en charge la vidéo.
      </video>
    </div>
  );
}

export function CourseMedia({
  mediaType,
  mediaUrl = "",
  videoUrl = "",
  image = "",
  title,
  className = "",
  onVideoDuration,
}: Props) {
  if (mediaType === "none") {
    return (
      <div
        className={`flex aspect-video items-center justify-center rounded-[14px] bg-brand-100 text-sm font-medium text-brand-700 ${className}`}
      >
        Contenu textuel — aucun média
      </div>
    );
  }

  const photoSrc =
    mediaType === "photo" || mediaType === "both"
      ? image || mediaUrl
      : image;
  const videoSrc =
    mediaType === "video"
      ? videoUrl || mediaUrl
      : mediaType === "both"
        ? videoUrl || (mediaUrl !== photoSrc ? mediaUrl : "")
        : "";

  if (mediaType === "both" && photoSrc && videoSrc) {
    return (
      <div className={`space-y-4 ${className}`}>
        <PhotoBlock src={photoSrc} title={title} />
        <VideoBlock
          url={videoSrc}
          poster={photoSrc}
          title={title}
          onDuration={onVideoDuration}
        />
      </div>
    );
  }

  if ((mediaType === "video" || mediaType === "both") && (videoSrc || mediaUrl)) {
    return (
      <VideoBlock
        url={videoSrc || mediaUrl}
        poster={image || undefined}
        title={title}
        className={className}
        onDuration={onVideoDuration}
      />
    );
  }

  const src = photoSrc || mediaUrl || image;
  if (!src) {
    return (
      <div
        className={`flex aspect-video items-center justify-center rounded-[14px] bg-brand-100 text-sm text-brand-700 ${className}`}
      >
        Pas d&apos;image
      </div>
    );
  }

  return <PhotoBlock src={src} title={title} className={className} />;
}

/** Formate des secondes en "1 min 24 s" / "45 s" / "1 h 02 min" */
export function formatVideoDuration(seconds: number) {
  const s = Math.round(seconds);
  if (s < 60) return `${s} s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return r > 0 ? `${h} h ${m} min` : `${h} h ${m} min`;
  }
  return r > 0 ? `${m} min ${r} s` : `${m} min`;
}
