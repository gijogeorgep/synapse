import fs from 'fs';

// Simple check for PNG dimensions
function getPngDimensions(path) {
    const buffer = fs.readFileSync(path);
    if (buffer.toString('ascii', 1, 4) !== 'PNG') return null;
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
}

console.log(getPngDimensions('d:/SYNAPSE WEBSITE NEW/frontend/public/synapse_favicon.png'));
