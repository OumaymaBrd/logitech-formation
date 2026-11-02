import Image from "next/image";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

type Variant = "header" | "footer" | "sidebar" | "full";

type Props = {
  href?: string | null;
  variant?: Variant;
  className?: string;
};

const sizeMap: Record<
  Exclude<Variant, "full">,
  { width: number; height: number; className: string; src: string }
> = {
  header: {
    width: 220,
    height: 54,
    className: "h-10 w-auto max-h-10 sm:h-11 sm:max-h-11",
    src: "/logo-mark.png",
  },
  footer: {
    width: 220,
    height: 54,
    className: "h-11 w-auto",
    src: "/logo-mark-light.png",
  },
  sidebar: {
    width: 180,
    height: 44,
    className: "h-9 w-auto",
    src: "/logo-mark-light.png",
  },
};

/** Badge « Centre de formation » — lisible sur fond sombre (hero) */
export function BrandBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex max-w-full items-center gap-3 rounded-full border border-white/25 bg-white/12 px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md sm:gap-3.5 sm:px-5 sm:py-3 ${className}`}
      role="img"
      aria-label="Centre de formation — Apprendre aujourd'hui, réussir demain"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/90 text-white sm:h-10 sm:w-10">
        <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.25} />
      </span>
      <span className="h-8 w-px shrink-0 bg-white/30 sm:h-9" aria-hidden />
      <span className="min-w-0 pr-1">
        <span className="block text-sm font-bold leading-tight tracking-tight text-white sm:text-[15px]">
          Centre de formation
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-white/75 sm:text-xs">
          Apprendre aujourd&apos;hui, réussir demain
        </span>
      </span>
    </div>
  );
}

/**
 * Logo officiel Logitech Formation — violet transparent, sans pastille.
 */
export function Logo({
  href = "/",
  variant = "header",
  className = "",
}: Props) {
  if (variant === "full") {
    const img = (
      <Image
        src="/logo-logitech.png"
        alt="Logitech Formation — Centre de formation"
        width={640}
        height={640}
        className={`h-auto w-full max-w-lg object-contain ${className}`}
        priority
      />
    );
    return href ? (
      <Link href={href} className="inline-block" aria-label="Accueil">
        {img}
      </Link>
    ) : (
      img
    );
  }

  const size = sizeMap[variant];
  const img = (
    <Image
      src={size.src}
      alt="Logitech Formation"
      width={size.width}
      height={size.height}
      className={`${size.className} object-contain object-left ${className}`}
      priority={variant === "header"}
      unoptimized
    />
  );

  if (!href) return img;

  return (
    <Link
      href={href}
      className="inline-flex h-full shrink-0 items-center leading-none"
      aria-label="Logitech Formation — Accueil"
    >
      {img}
    </Link>
  );
}
