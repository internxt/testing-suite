const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

require('dotenv').config();


const SYNC_FOLDER = process.env.SYNC_FOLDER;
if (!SYNC_FOLDER) {
  console.error("❌ SYNC_FOLDER is not set in your .env file");
  process.exit(1);
}


function generateUniqueFolderName(baseName = 'testfolder') {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${baseName}_${timestamp}_${random}`;
}


function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function createTestFolderStructure(targetFolder) {
  fs.mkdirSync(targetFolder, { recursive: true });

  const fileSizeInBytes = 5 * 1024 * 1024;
  const buffer = Buffer.alloc(fileSizeInBytes);

  for (let i = 0; i < fileSizeInBytes; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }

  const files = [
    { name: 'file1.txt' },
    { name: 'file2.txt' },
  ];

  files.forEach(file => {
    fs.writeFileSync(path.join(targetFolder, file.name), buffer);
  });

  console.log(`📁 Created test folder with ${files.length} files: ${targetFolder}`);
}


(async () => {
  console.log("🔄 Starting folder sync upload test...");

  const folderName = generateUniqueFolderName();
  const targetFolderPath = path.join(SYNC_FOLDER, folderName);


  createTestFolderStructure(targetFolderPath);


  const WAIT_TIME_MS = 10_000;
  console.log(`⏳ Waiting ${WAIT_TIME_MS / 1000} seconds for folder sync...`);
  await wait(WAIT_TIME_MS);


  const uploadedFiles = fs.readdirSync(targetFolderPath);
  if (uploadedFiles.length === 0) {
    console.error("❌ Folder was created but contains no files after sync wait.");
    return;
  }

  for (const file of uploadedFiles) {
    const fullPath = path.join(targetFolderPath, file);
    try {
      const stats = fs.statSync(fullPath);
      if (stats.isSymbolicLink()) {
        console.warn(`⚠️ ${file} is still a symlink. Might still be syncing.`);
      } else if (stats.size > 0) {
        console.log(`✅ ${file} uploaded successfully. Size: ${stats.size} bytes`);
      } else {
        console.error(`❌ ${file} exists but is empty.`);
      }
    } catch (e) {
      console.error(`❌ Could not stat ${file}:`, e.message);
    }
  }

 
})();
