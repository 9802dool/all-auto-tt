"use client";

import { useEffect } from "react";

export function ViewBeacon({ partId }: { partId: string }) {
  useEffect(() => {
    const key = `aat-view-${partId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partId, type: "view" }),
    });
  }, [partId]);
  return null;
}

export function AdBeacon({ adId }: { adId: string }) {
  useEffect(() => {
    const key = `aat-ad-${adId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId, type: "ad_impression" }),
    });
  }, [adId]);
  return null;
}
