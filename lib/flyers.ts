import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

const charcoal = rgb(0.067, 0.094, 0.153);
const orange = rgb(0.976, 0.451, 0.086);
const ink = rgb(0.12, 0.14, 0.18);

export async function flyerPdf(input: { kicker: string; title: string; lines: string[]; url: string; footer: string }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: rgb(0.957, 0.945, 0.925) });
  page.drawRectangle({ x: 0, y: 748, width: 595.28, height: 94, color: charcoal });
  page.drawText("ALL AUTO", { x: 36, y: 786, size: 32, font: bold, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 214, y: 778, width: 52, height: 32, color: orange });
  page.drawText("TT", { x: 226, y: 786, size: 18, font: bold, color: charcoal });
  page.drawText(input.kicker, { x: 36, y: 762, size: 11, font: regular, color: rgb(0.9, 0.9, 0.92) });

  const title = input.title.slice(0, 42);
  page.drawText(title, { x: 36, y: 690, size: 26, font: bold, color: ink });

  input.lines.slice(0, 6).forEach((line, index) => {
    page.drawText(line.slice(0, 80), { x: 36, y: 650 - index * 22, size: 13, font: regular, color: ink });
  });

  const png = await QRCode.toBuffer(input.url, { width: 640, margin: 1, errorCorrectionLevel: "M" });
  const image = await pdf.embedPng(png);
  page.drawRectangle({ x: 157, y: 250, width: 280, height: 280, color: rgb(1, 1, 1) });
  page.drawImage(image, { x: 172, y: 265, width: 250, height: 250 });
  page.drawText("Scan with your phone camera", { x: 190, y: 228, size: 12, font: bold, color: ink });
  page.drawText(input.url.replace(/^https?:\/\//, "").slice(0, 64), { x: 36, y: 180, size: 11, font: regular, color: ink });

  page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 72, color: orange });
  page.drawText(input.footer.slice(0, 90), { x: 36, y: 30, size: 12, font: bold, color: charcoal });

  return pdf.save();
}
