import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// CRC32 calculation table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(typeAndData), 8 + len);
  return buf;
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with scanline filter bytes
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * (isMaskable ? 0.38 : 0.44);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background gradient: Rich Royal Blue (#1d4ed8 to #4338ca)
      const gradT = (x + y) / (width + height);
      let r = Math.round(29 + gradT * (67 - 29));
      let g = Math.round(78 + gradT * (56 - 78));
      let b = Math.round(216 + gradT * (202 - 216));
      let a = 255;

      if (!isMaskable) {
        // Rounded squircle mask for standard icons
        const cornerR = width * 0.22;
        const qx = Math.max(0, Math.abs(dx) - (cx - cornerR));
        const qy = Math.max(0, Math.abs(dy) - (cy - cornerR));
        const cornerDist = Math.sqrt(qx * qx + qy * qy);
        if (cornerDist > cornerR) {
          a = 0;
          r = 0;
          g = 0;
          b = 0;
        }
      }

      // Draw Graduation Cap / Golden Book in center
      if (a > 0) {
        // Center badge circle (subtle white glow)
        if (dist < radius) {
          const innerGlow = 1 - dist / radius;
          r = Math.min(255, Math.round(r + 20 * innerGlow));
          g = Math.min(255, Math.round(g + 25 * innerGlow));
          b = Math.min(255, Math.round(b + 35 * innerGlow));
        }

        // Graduation cap diamond shape
        // diamond coordinates: |dx| / halfW + |dy - capY| / halfH <= 1
        const capY = -height * 0.05;
        const halfW = width * 0.26;
        const halfH = height * 0.13;
        const capDist = Math.abs(dx) / halfW + Math.abs(dy - capY) / halfH;

        if (capDist <= 1.0) {
          // White graduation cap
          r = 255;
          g = 255;
          b = 255;
        }

        // Cap band & base
        const bandY = capY + height * 0.08;
        if (Math.abs(dx) < width * 0.16 && dy >= bandY && dy <= bandY + height * 0.09) {
          r = 255;
          g = 255;
          b = 255;
        }

        // Golden tassel
        if (dx >= width * 0.20 && dx <= width * 0.24 && dy >= capY && dy <= capY + height * 0.20) {
          r = 251; // Gold #fbbf24
          g = 191;
          b = 36;
        }

        // Underneath: stylized open book / star
        const bookY = height * 0.20;
        if (dy >= bookY && dy <= bookY + height * 0.06 && Math.abs(dx) <= width * 0.20) {
          r = 251; // Gold accent
          g = 191;
          b = 36;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Deflate IDAT
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = makeChunk('IDAT', compressed);

  // IEND
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
console.log('Generating PWA Icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, false));

// Also generate public/icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#4338ca" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#grad)" />
  <path d="M256 128 L400 208 L256 288 L112 208 Z" fill="#ffffff" />
  <path d="M176 250 L176 330 C176 370 336 370 336 330 L336 250" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round" />
  <path d="M384 210 L384 320 L370 340" fill="none" stroke="#fbbf24" stroke-width="12" stroke-linecap="round" />
  <circle cx="370" cy="346" r="10" fill="#fbbf24" />
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg, 'utf-8');

console.log('Icons generated successfully in public/');
