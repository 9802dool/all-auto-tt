"use client";

import { useState } from "react";
import { PartImage } from "@/components/part-image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const current = photos[active] ?? photos[0];
  if (!current) return <div className="grid aspect-[4/3] place-items-center rounded-3xl bg-muted">No photo yet</div>;
  return (
    <div>
      <button type="button" className="relative block aspect-[4/3] w-full overflow-hidden rounded-3xl bg-muted" onClick={() => setOpen(true)}>
        <PartImage src={current} alt={`${title} photo ${active + 1}`} priority sizes="(max-width: 1024px) 100vw, 60vw" />
        <span className="absolute right-3 bottom-3 rounded-full bg-charcoal/80 px-3 py-1 text-xs font-semibold text-white">Tap to zoom</span>
      </button>
      {photos.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={photo}
              type="button"
              aria-label={`Show photo ${index + 1}`}
              className={`relative size-20 shrink-0 overflow-hidden rounded-xl border ${index === active ? "border-orange" : "border-transparent"}`}
              onClick={() => setActive(index)}
            >
              <PartImage src={photo} alt={`${title} photo ${index + 1}`} sizes="80px" />
            </button>
          ))}
        </div>
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl bg-charcoal p-3 sm:max-w-3xl">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <img src={current} alt={`${title}, enlarged`} className="max-h-[80vh] w-full object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
