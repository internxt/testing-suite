const fs = require('fs');

function createTextFile(filePath, content = 'This is a test file for Internxt Drive sync.') {
  fs.writeFileSync(filePath, content, 'utf-8');
}

function createPdfFile(filePath) {
  const content = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog >>\nendobj\n');
  fs.writeFileSync(filePath, content);
}

function createPngFile(filePath) {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  fs.writeFileSync(filePath, pngHeader);
}

function createDocxFile(filePath) {
  const dummyContent = Buffer.from('PK\u0003\u0004'); 
  fs.writeFileSync(filePath, dummyContent);
}

module.exports = {
  createTextFile,
  createPdfFile,
  createPngFile,
  createDocxFile
};
