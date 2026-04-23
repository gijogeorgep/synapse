import fs from 'fs';

function checkImage(path) {
  try {
    const buffer = fs.readFileSync(path);
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      console.log(`${path}: PNG ${width}x${height}`);
    } else if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let i = 2;
      while (i < buffer.length) {
        const marker = buffer[i + 1];
        if (marker === 0xC0 || marker === 0xC2) {
          const height = buffer.readUInt16BE(i + 5);
          const width = buffer.readUInt16BE(i + 7);
          console.log(`${path}: JPEG ${width}x${height}`);
          return;
        }
        const length = buffer.readUInt16BE(i + 2);
        i += length + 2;
      }
    } else {
      console.log(`${path}: Unknown format (First bytes: ${buffer.slice(0, 4).toString('hex')})`);
    }
  } catch (e) {
    console.log(`${path}: Error - ${e.message}`);
  }
}

checkImage('d:/SYNAPSE WEBSITE NEW/frontend/public/app-icon-192.png');
checkImage('d:/SYNAPSE WEBSITE NEW/frontend/public/app-icon-512.png');
