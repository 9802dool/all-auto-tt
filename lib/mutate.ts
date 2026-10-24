import "server-only";

import { updateTag } from "next/cache";
import { ActionError } from "@/lib/data";

export async function mutate<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    updateTag("catalog");
    return { ok: true as const, data };
  } catch (error) {
    if (error instanceof ActionError) return { ok: false as const, error: error.message };
    throw error;
  }
}
