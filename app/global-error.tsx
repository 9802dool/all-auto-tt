"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-TT">
      <body style={{ fontFamily: "sans-serif", background: "#f4f1ec", color: "#111827", padding: 32 }}>
        <h1>ALL AUTO TT hit a problem</h1>
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
