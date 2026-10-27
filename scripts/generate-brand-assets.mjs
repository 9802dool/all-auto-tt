import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const src = path.join(root, "public/brand/all-auto-tt-logo.jpg");
const brandDir = path.join(root, "public/brand");
const appDir = path.join(root, "app");

const CHARCOAL = { r: 31, g: 31, b: 31 };
const ORANGE = { r: 242, g: 107, b: 29 };

/** Crop of the interlocking AA mark (1024×1024 source). */
const SYMBOL = { left: 108, top: 118, width: 808, height: 500 };

async function symbolOnLight() {
  const { data, info } = await sharp(src)
    .extract(SYMBOL)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const distBg = Math.hypot(r - CHARCOAL.r, g - CHARCOAL.g, b - CHARCOAL.b);
    const distOrange = Math.hypot(r - ORANGE.r, g - ORANGE.g, b - ORANGE.b);
    const lum = (r + g + b) / 3;

    if (distBg < 48) {
      pixels[i + 3] = 0;
      continue;
    }
    if (distOrange > 55) {
      continue;
    }
    if (lum > 150) {
      pixels[i] = CHARCOAL.r;
      pixels[i + 1] = CHARCOAL.g;
      pixels[i + 2] = CHARCOAL.b;
      pixels[i + 3] = 255;
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

async function main() {
  await mkdir(brandDir, { recursive: true });

  await sharp(src).extract(SYMBOL).png().toFile(path.join(brandDir, "logo-aa-dark.png"));

  await (await symbolOnLight()).png().toFile(path.join(brandDir, "logo-aa-light.png"));

  const iconSize = 512;
  await sharp(src)
    .extract(SYMBOL)
    .resize(iconSize, iconSize, { fit: "contain", background: CHARCOAL })
    .flatten({ background: CHARCOAL })
    .png()
    .toFile(path.join(appDir, "icon.png"));

  await sharp(path.join(appDir, "icon.png"))
    .resize(180, 180, { fit: "contain", background: CHARCOAL })
    .flatten({ background: CHARCOAL })
    .png()
    .toFile(path.join(appDir, "apple-icon.png"));

  console.log("Brand assets generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
