import { Armchair, Car, CircleDot, Cog, Lightbulb, MoveVertical, Package, Settings2, Zap, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Cog,
  Settings2,
  Car,
  MoveVertical,
  Zap,
  Armchair,
  CircleDot,
  Lightbulb,
  Package,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Package;
  return <Icon className={className} aria-hidden="true" />;
}
