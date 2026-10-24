import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const controlClass =
  "h-11 w-full rounded-lg border border-input bg-white px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-1.5 text-sm font-medium", className)}>
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
