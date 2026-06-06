import "server-only";

import sharp from "sharp";

/** Longest edge for the preview sent to the vision model (tokens scale with pixels). */
const MAX_EDGE = 768;

/**
 * Builds a small JPEG preview for multimodal chat. The original buffer should still be
 * passed to image editing APIs unchanged.
 */
export async function downscaleForVisionPreview(
  input: Buffer,
): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}
