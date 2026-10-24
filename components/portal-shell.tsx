import { logoutAction } from "@/app/actions/public";
import { PortalNav } from "@/components/portal-nav";

export function PortalShell({
  title,
  eyebrow,
  items,
  children,
}: {
  title: string;
  eyebrow: string;
  items: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="text-xs font-semibold tracking-wide text-orange-ink uppercase">{eyebrow}</p>
        <p className="font-display text-2xl leading-none font-bold tracking-tight uppercase">{title}</p>
        <PortalNav items={items} />
        <form action={logoutAction} className="mt-4">
          <button type="submit" className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline">
            Sign out
          </button>
        </form>
      </aside>
      <div className="grid min-w-0 content-start gap-4">{children}</div>
    </div>
  );
}
