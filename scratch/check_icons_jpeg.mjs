import fs from 'fs';

function checkJpeg(path) {
  const buffer = fs.readFileSync(path);
  let i = 0;
  if (buffer[i] !== 0xFF || buffer[i + 1] !== 0xD8) return console.log(`${path}: Not a JPEG`);
  i += 2;
  while (i < buffer.length) {
    if (buffer[i] !== 0xFF) break;
    const marker = buffer[i + 1];
    if (marker === 0xC0 || marker === 0xC2) { // SOF0 or SOF2
      const height = buffer.readUInt16BE(i + 5);
      const width = buffer.readUInt16BE(i + 7);
      console.log(`${path}: ${width}x${height}`);
      return;
    }
    const length = buffer.readUInt16BE(i + 2);
    i += length + 2;
  }
}

checkJpeg('d:/SYNAPSE WEBSITE NEW/frontend/public/app-icon-192.png');
checkJpeg('d:/SYNAPSE WEBSITE NEW/frontend/public/app-icon-512.png');
