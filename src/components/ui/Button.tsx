import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "success" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 shadow-soft border border-transparent",
  secondary:
    "bg-brand-100 text-brand-700 hover:bg-brand-500/20 border border-transparent",
  outline:
    "bg-transparent text-white border-2 border-white hover:bg-white/10",
  success: "bg-success text-white hover:bg-green-600 border border-transparent",
  danger: "bg-danger text-white hover:bg-red-600 border border-transparent",
  ghost:
    "bg-white text-brand-700 border border-brand-100 hover:bg-brand-50 shadow-soft",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  href,
  children,
  className = "",
  ...props
}: Props) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
