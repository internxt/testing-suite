const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config();

const SYNC_FOLDER = process.env.SYNC_FOLDER;
if (!SYNC_FOLDER || !fs.existsSync(SYNC_FOLDER)) {
  console.error("❌ SYNC_FOLDER not set or doesn't exist. Check your .env file.");
  process.exit(1);
}

const {
  createTextFile,
  createPdfFile,
  createPngFile,
  createDocxFile
} = require('../../../../helpers/fixtureGenerators');

const TEMP_FIXTURE_DIR = path.join(__dirname, 'temp-fixtures');
if (!fs.existsSync(TEMP_FIXTURE_DIR)) {
  fs.mkdirSync(TEMP_FIXTURE_DIR);
}
const FIXTURE_FILES = [
  { name: 'testfile.txt', generator: createTextFile },
  { name: 'testfile.pdf', generator: createPdfFile },
  { name: 'testfile.png', generator: createPngFile },
  { name: 'testfile.docx', generator: createDocxFile }
];

function generateUniqueFilename(extension) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `testfile_${timestamp}_${random}.${extension}`;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logFileContents(filepath, ext) {
  const size = fs.statSync(filepath).size;
  console.log(`📏 File size: ${size} bytes`);

  if (ext === 'txt') {
    const content = fs.readFileSync(filepath, 'utf-8');
    console.log(`📄 File contents preview:\n ${content}`);
  } else {
    const buffer = fs.readFileSync(filepath);
    const hexPreview = buffer.toString('hex', 0, 16); 
    console.log(`📄 Binary preview (first 16 bytes): ${hexPreview}...`);
  }
}

async function runSyncTestForFile(filename, generatorFn) {
  const ext = path.extname(filename).slice(1);
  const tempPath = path.join(TEMP_FIXTURE_DIR, filename);

  generatorFn(tempPath);
  
  const destFilename = generateUniqueFilename(ext);
  const destPath = path.join(SYNC_FOLDER, destFilename);

  console.log(`\n🔄 Testing sync upload for: ${filename}`);
  console.log(`📤 Copying to sync folder: ${destPath}`);

  try {
    fs.copyFileSync(tempPath, destPath);
  } catch (err) {
    console.error(`❌ Failed to copy ${filename}:`, err.message);
    return;
  }

  const WAIT_MS = 10_000;
  console.log(`⏳ Waiting ${WAIT_MS / 1000}s for Internxt to upload...`);
  await wait(WAIT_MS);

  try {
    const stats = fs.statSync(destPath);
    if (stats.size > 0 && !stats.isSymbolicLink()) {
      console.log("✅ Upload succeeded. File is not a symlink.");
      logFileContents(destPath, ext);
    } else if (stats.isSymbolicLink()) {
      console.warn("⚠️ File is a symlink — may still be uploading or hydrated.");
    } else {
      console.error("❌ File exists but is empty or invalid.");
    }
  } catch (e) {
    console.error("❌ File not found after waiting:", e.message);
  }

}

(async () => {
  console.log("🧪 Starting multi-file sync upload test...");
  for (const { name, generator } of FIXTURE_FILES) {
    await runSyncTestForFile(name,generator);
  }
})();
