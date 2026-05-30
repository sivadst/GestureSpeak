import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "warning" | "danger" | "info";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-white/10 text-white/80 border-white/10",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
