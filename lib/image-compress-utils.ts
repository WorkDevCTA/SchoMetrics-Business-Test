// lib/image-utils.ts
import sharp from "sharp";

export async function optimizeImage(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return sharp(buffer)
    .resize({ width: 1200 }) // Puedes ajustar el tamaño si es necesario
    .toFormat("webp") // Cambiar a WebP para mayor compresión
    .webp({ quality: 50 }) // Calidad de WebP (ajustable según necesidad)
    .toBuffer();
}
