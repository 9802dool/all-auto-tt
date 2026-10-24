import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { PortalShell } from "@/components/portal-shell";
import { adminNav } from "@/lib/nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="px-4 py-10">Opening admin…</p>}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <PortalShell title="ALL AUTO TT" eyebrow="Admin" items={adminNav}>
      {children}
    </PortalShell>
  );
}
