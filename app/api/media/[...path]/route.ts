import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const parts = (await context.params).path ?? [];
  if (!parts.length || parts.some((part) => !part || part.includes("..") || part.includes("/") || part.includes("\\"))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const pathname = parts.join("/");
  if (pathname.endsWith("db.json")) return new NextResponse("Not found", { status: 404 });
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return new NextResponse("Not found", { status: 404 });
  }
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
