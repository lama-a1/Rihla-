import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl2 border border-night-line bg-night-panel/80 backdrop-blur-sm shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
