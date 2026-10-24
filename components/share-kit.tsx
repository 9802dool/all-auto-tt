"use client";

import { useState } from "react";
import { siteUrl } from "@/lib/config";
import { Button } from "@/components/ui/button";

export function ShareKit({ slug, title }: { slug: string; title: string }) {
  const [note, setNote] = useState("");
  const page = `${siteUrl()}/parts/${slug}`;
  const caption = `${title}\n${page}\nListed on ALL AUTO TT`;

  async function download(size: "square" | "story") {
    const response = await fetch(`/api/og/part/${slug}?size=${size}`);
    if (!response.ok) {
      setNote("The share image could not be built.");
      return;
    }
    const blob = await response.blob();
    const file = new File([blob], `${slug}-${size}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title, text: caption });
        setNote(size === "story" ? "Shared. Post it to your WhatsApp status from the share sheet." : "Shared.");
        return;
      } catch {
        /* user cancelled or the target rejected the file */
      }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
    setNote(
      size === "story"
        ? "Image saved. Open WhatsApp, start a status, and pick this photo from your gallery. A link cannot attach the picture by itself."
        : "Square image saved. Post it on Facebook with the part link.",
    );
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="accent" onClick={() => void download("square")}>
          Download square
        </Button>
        <Button type="button" variant="outline" onClick={() => void download("story")}>
          Download story
        </Button>
        <a
          className="inline-flex h-8 items-center rounded-lg bg-whatsapp px-2.5 text-sm font-medium text-white"
          href={`https://wa.me/?text=${encodeURIComponent(caption)}`}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp caption
        </a>
        <a
          className="inline-flex h-8 items-center rounded-lg border border-border bg-white px-2.5 text-sm font-medium"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(page)}`}
          target="_blank"
          rel="noreferrer"
        >
          Facebook
        </a>
      </div>
      {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}
