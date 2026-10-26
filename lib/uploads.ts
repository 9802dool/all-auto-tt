import "server-only";

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { usingSupabase } from "@/lib/repo";

export async function getSignedReceiptUrl(receiptUrl: string | null): Promise<string | null> {
  if (!receiptUrl) return null;
  
  // If it's not in the receipts bucket, return as-is
  if (!receiptUrl.includes("/receipts/")) return receiptUrl;
  
  // If demo mode (data: URLs or local uploads), return as-is
  if (!usingSupabase() || receiptUrl.startsWith("data:") || receiptUrl.startsWith("/uploads/")) {
    return receiptUrl;
  }
  
  // Extract the path from the URL (e.g., "receipts/abc-123.jpg")
  const match = receiptUrl.match(/\/storage\/v1\/object\/public\/(.+)$/) || receiptUrl.match(/\/receipts\/(.+)$/);
  if (!match) return receiptUrl;
  
  const filePath = match[1].startsWith("receipts/") ? match[1] : `receipts/${match[1]}`;
  
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  
  // Generate a signed URL valid for 1 hour
  const { data, error } = await client.storage.from("receipts").createSignedUrl(filePath, 3600);
  
  if (error || !data) return receiptUrl;
  return data.signedUrl;
}

export async function saveUpload(file: File, folder: string) {
  if (!file || file.size === 0) throw new Error("Choose a file.");
  
  // Receipts go to private bucket with 10MB limit, media to public bucket with 5MB limit
  const isReceipt = folder === "receipts";
  const maxSize = isReceipt ? 10_000_000 : 5_000_000;
  
  if (file.size > maxSize) throw new Error(`File is larger than ${maxSize / 1_000_000}MB.`);
  const bytes = Buffer.from(await file.arrayBuffer());
  
  if (file.type === "application/pdf") {
    if (!isReceipt) throw new Error("PDFs can only be uploaded as receipts.");
    return storeBuffer(bytes, folder, "pdf", "application/pdf", isReceipt);
  }
  if (!file.type.startsWith("image/")) throw new Error("Upload a photo or a PDF.");
  const image = await sharp(bytes)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 75 })
    .toBuffer();
  return storeBuffer(image, folder, "jpg", "image/jpeg", isReceipt);
}

async function storeBuffer(buffer: Buffer, folder: string, ext: string, contentType: string, isReceipt: boolean) {
  const name = `${folder}/${crypto.randomUUID()}.${ext}`;
  if (usingSupabase()) {
    const bucket = isReceipt ? "receipts" : "media";
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.storage.from(bucket).upload(name, buffer, { contentType, upsert: false });
    if (error) throw new Error(error.message);
    
    // For receipts (private bucket), return the path; admins will generate signed URLs when viewing
    if (isReceipt) {
      const { data } = client.storage.from(bucket).getPublicUrl(name);
      return data.publicUrl;
    }
    
    // For media (public bucket), return the public URL
    const { data } = client.storage.from(bucket).getPublicUrl(name);
    return data.publicUrl;
  }
  // Vercel's filesystem is read-only, so demo-mode uploads are kept inline until Supabase is configured.
  if (process.env.VERCEL) return `data:${contentType};base64,${buffer.toString("base64")}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const filename = path.basename(name);
  await writeFile(/* turbopackIgnore: true */ path.join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}
