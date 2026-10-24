import { notice } from "@/lib/messages";

export function Flash({ ok, error, extra }: { ok?: string; error?: string; extra?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </p>
    );
  }
  const message = [notice(ok), extra].filter(Boolean).join(" ");
  if (!message) return null;
  return (
    <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      {message}
    </p>
  );
}
