"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
      }}
    >
      {done ? "Copied" : label}
    </Button>
  );
}
