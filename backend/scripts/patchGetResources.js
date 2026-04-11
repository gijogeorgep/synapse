const fs = require('fs');
const path = 'd:/SYNAPSE WEBSITE NEW/backend/controllers/adminController.js';
let content = fs.readFileSync(path, 'utf8');

const marker = '// @desc    Get Resources\r\n// @route   GET /api/admin/resources\r\nexport const getResources = async (req, res) => {\r\n  try {\r\n    const resources = await StudyMaterial.find({})';
const markerLF  = '// @desc    Get Resources\n// @route   GET /api/admin/resources\nexport const getResources = async (req, res) => {\n  try {\n    const resources = await StudyMaterial.find({})';

const newBlock_CRLF = '// @desc    Get Resources\r\n// @route   GET /api/admin/resources\r\nexport const getResources = async (req, res) => {\r\n  try {\r\n    // Fix legacy records where classroom was saved as empty string (causes ObjectId cast errors)\r\n    await StudyMaterial.updateMany({ classroom: "" }, { "$set": { classroom: null } });\r\n    const resources = await StudyMaterial.find({})';
const newBlock_LF  = '// @desc    Get Resources\n// @route   GET /api/admin/resources\nexport const getResources = async (req, res) => {\n  try {\n    // Fix legacy records where classroom was saved as empty string (causes ObjectId cast errors)\n    await StudyMaterial.updateMany({ classroom: "" }, { "$set": { classroom: null } });\n    const resources = await StudyMaterial.find({})';

if (content.includes(marker)) {
  content = content.replace(marker, newBlock_CRLF);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS CRLF');
} else if (content.includes(markerLF)) {
  content = content.replace(markerLF, newBlock_LF);
  fs.writeFileSync(path, content, 'utf8');
  console.log('SUCCESS LF');
} else {
  const lines = content.split('\n');
  for (let i = 735; i < 750; i++) {
    console.log((i+1) + ': ' + JSON.stringify(lines[i]));
  }
}
