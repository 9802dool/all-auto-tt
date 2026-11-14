import "server-only";

import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { usingBlob } from "@/lib/repo";

export async function getSignedReceiptUrl(receiptUrl: string | null): Promise<string | null> {
  return receiptUrl;
}

export async function saveUpload(file: File, folder: string) {
  if (!file || file.size === 0) throw new Error("Choose a file.");
  const isReceipt = folder === "receipts";
  const maxSize = isReceipt ? 10_000_000 : 5_000_000;
  if (file.size > maxSize) throw new Error(`File is larger than ${maxSize / 1_000_000}MB.`);
  const bytes = Buffer.from(await file.arrayBuffer());
  if (file.type === "application/pdf") {
    if (!isReceipt) throw new Error("PDFs can only be uploaded as receipts.");
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
  if (usingBlob()) {
    const blob = await put(name, buffer, {
      access: "private",
      addRandomSuffix: false,
      contentType,
    });
    return `/api/media/${blob.pathname}`;
  }
  if (process.env.VERCEL) {
    throw new Error("Photos cannot be saved yet. Connect the free file store, then try again.");
  }
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const filename = path.basename(name);
  await writeFile(/* turbopackIgnore: true */ path.join(dir, filename), buffer);
  return `/uploads/${folder}/${filename}`;
}
