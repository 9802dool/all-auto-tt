import "server-only";

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { usingSupabase } from "@/lib/repo";

export async function saveUpload(file: File, folder: string) {
  if (!file || file.size === 0) throw new Error("Choose a file.");
  if (file.size > 8_000_000) throw new Error("File is larger than 8MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (file.type === "application/pdf") {
    return storeBuffer(bytes, folder, "pdf", "application/pdf");
  }
  if (!file.type.startsWith("image/")) throw new Error("Upload a photo or a PDF.");
  const image = await sharp(bytes)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer();
  return storeBuffer(image, folder, "jpg", "image/jpeg");
}

async function storeBuffer(buffer: Buffer, folder: string, ext: string, contentType: string) {
  const name = `${folder}/${crypto.randomUUID()}.${ext}`;
  if (usingSupabase()) {
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.storage.from("media").upload(name, buffer, { contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = client.storage.from("media").getPublicUrl(name);
    return data.publicUrl;
  }
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const filename = path.basename(name);
  await writeFile(/* turbopackIgnore: true */ path.join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}
