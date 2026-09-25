/**
 * Browser-side image downscaling, run before the presigned upload.
 *
 * Doing this in the browser rather than with sharp on the server means the
 * admin PUTs a few hundred KB instead of the 16-17MB originals, and keeps
 * sharp (~30MB with libvips) out of the deployment entirely. The cost is that
 * canvas encoding drops the ICC profile, so a wide-gamut source can shift
 * slightly — invisible for renders and model photography at this quality.
 *
 * Client-only: uses createImageBitmap and OffscreenCanvas.
 */

export type ResizedImage = {
  blob: Blob;
  width: number;
  height: number;
  contentType: string;
  extension: string;
};

const MAX_EDGE = 2400;
const QUALITY = 0.82;

/** Anything at or under this is already small enough to ship as-is. */
const PASSTHROUGH_BYTES = 600 * 1024;

export async function resizeForUpload(file: File): Promise<ResizedImage> {
  // PDFs and other documents are stored exactly as uploaded.
  if (!file.type.startsWith("image/")) {
    return {
      blob: file,
      width: 0,
      height: 0,
      contentType: file.type || "application/octet-stream",
      extension: file.name.split(".").pop()?.toLowerCase() || "bin",
    };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    MAX_EDGE / Math.max(bitmap.width, bitmap.height)
  );

  // Already small and already web-friendly: don't re-encode and lose quality
  // for nothing.
  if (scale === 1 && file.size <= PASSTHROUGH_BYTES && file.type === "image/webp") {
    const result = {
      blob: file,
      width: bitmap.width,
      height: bitmap.height,
      contentType: "image/webp",
      extension: "webp",
    };
    bitmap.close();
    return result;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get a 2D canvas context");

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await canvas.convertToBlob({
    type: "image/webp",
    quality: QUALITY,
  });

  return { blob, width, height, contentType: "image/webp", extension: "webp" };
}
