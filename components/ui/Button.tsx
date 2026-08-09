import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
}

export function Button({ variant = "primary", className = "", children, ...rest }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-display font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oasis-bright";

  const variants: Record<string, string> = {
    primary: "bg-oasis text-night hover:bg-oasis-bright hover:shadow-[0_0_24px_rgba(47,184,166,0.35)] active:scale-[0.98]",
    outline: "border border-night-line text-ink hover:border-oasis hover:text-oasis-bright",
    ghost: "text-ink-muted hover:text-ink",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
