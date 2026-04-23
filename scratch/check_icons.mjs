import fs from 'fs';

function checkImage(path) {
  try {
    const buffer = fs.readFileSync(path);
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    // IHDR chunk starts at offset 8. Length is at offset 8 (4 bytes), then 'IHDR' (4 bytes), then width (4 bytes), then height (4 bytes).
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      console.log(`${path}: ${width}x${height}`);
    } else {
      console.log(`${path}: Not a PNG`);
    }
  } catch (e) {
    console.log(`${path}: Error reading - ${e.message}`);
  }
}

checkImage('d:/SYNAPSE WEBSITE NEW/frontend/public/app-icon-192.png');
checkImage('d:/SYNAPSE WEBSITE NEW/frontend/public/app-icon-512.png');
