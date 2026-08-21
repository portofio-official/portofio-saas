/**
 * Sniffs the real format of an image buffer from its magic bytes and reads
 * width/height straight out of the format header — no decode, no
 * dependency. Used to stop uploads where the bytes don't actually match the
 * client-declared MIME type (e.g. an HTML/SVG payload renamed to .png), and
 * to reject corrupt/absurd dimensions before they reach storage.
 *
 * Returns null for anything that isn't a well-formed png/jpeg/gif/webp
 * header — callers should treat null as "reject".
 */

export type SniffedImage = {
  type: "png" | "jpeg" | "gif" | "webp";
  width: number;
  height: number;
};

const MAX_DIMENSION = 6000; // generous vs. the 800px client-side compression cap

function isSaneDimensions(width: number, height: number): boolean {
  return width > 0 && height > 0 && width <= MAX_DIMENSION && height <= MAX_DIMENSION;
}

function sniffPng(b: Buffer): SniffedImage | null {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length < 24 || !sig.every((byte, i) => b[i] === byte)) return null;
  if (b.toString("ascii", 12, 16) !== "IHDR") return null;
  const width = b.readUInt32BE(16);
  const height = b.readUInt32BE(20);
  return isSaneDimensions(width, height) ? { type: "png", width, height } : null;
}

function sniffGif(b: Buffer): SniffedImage | null {
  if (b.length < 10) return null;
  const header = b.toString("ascii", 0, 6);
  if (header !== "GIF87a" && header !== "GIF89a") return null;
  const width = b.readUInt16LE(6);
  const height = b.readUInt16LE(8);
  return isSaneDimensions(width, height) ? { type: "gif", width, height } : null;
}

function sniffJpeg(b: Buffer): SniffedImage | null {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let pos = 2;
  while (pos + 3 < b.length) {
    if (b[pos] !== 0xff) return null;
    const marker = b[pos + 1];
    // Standalone markers with no length/payload.
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      pos += 2;
      continue;
    }
    const segmentLength = b.readUInt16BE(pos + 2);
    const isSOF =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSOF) {
      if (pos + 9 > b.length) return null;
      const height = b.readUInt16BE(pos + 5);
      const width = b.readUInt16BE(pos + 7);
      return isSaneDimensions(width, height) ? { type: "jpeg", width, height } : null;
    }
    if (segmentLength < 2) return null;
    pos += 2 + segmentLength;
  }
  return null;
}

function sniffWebp(b: Buffer): SniffedImage | null {
  if (b.length < 30) return null;
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") return null;
  const fourCC = b.toString("ascii", 12, 16);

  if (fourCC === "VP8X") {
    const width = (b[24] | (b[25] << 8) | (b[26] << 16)) + 1;
    const height = (b[27] | (b[28] << 8) | (b[29] << 16)) + 1;
    return isSaneDimensions(width, height) ? { type: "webp", width, height } : null;
  }
  if (fourCC === "VP8 ") {
    if (b[23] !== 0x9d || b[24] !== 0x01 || b[25] !== 0x2a) return null;
    const width = b.readUInt16LE(26) & 0x3fff;
    const height = b.readUInt16LE(28) & 0x3fff;
    return isSaneDimensions(width, height) ? { type: "webp", width, height } : null;
  }
  if (fourCC === "VP8L") {
    if (b[20] !== 0x2f) return null;
    const bits = b.readUInt32LE(21);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return isSaneDimensions(width, height) ? { type: "webp", width, height } : null;
  }
  return null;
}

/** Sniffs actual format + dimensions from raw bytes, ignoring any claimed MIME type. */
export function sniffImage(bytes: Buffer): SniffedImage | null {
  return sniffPng(bytes) ?? sniffJpeg(bytes) ?? sniffGif(bytes) ?? sniffWebp(bytes);
}
