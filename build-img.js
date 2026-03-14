const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const imgDir = path.join(__dirname, "img");
const outDir = path.join(__dirname, "_site", "img");

// Directories containing images referenced in templates
const PROCESS_DIRS = [
  "TEAMS/2024",
  "media/league/clapham",
  "media/league/north-finchley",
  "whats-futsal",
];

// Individual files in img/ root referenced in templates
const PROCESS_FILES = ["mision.jpg", "lfl.svg"];

// Directories that get thumbnails (gallery images)
const THUMBNAIL_DIRS = [
  "media/league/clapham",
  "media/league/north-finchley",
];

const WEBP_QUALITY = 80;
const THUMB_WIDTH = 300;

function isImage(file) {
  return /\.(jpe?g|png|gif|bmp)$/i.test(file);
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function processImage(srcPath, destDir, filename) {
  await ensureDir(destDir);

  // Copy original as fallback
  const destPath = path.join(destDir, filename);
  fs.copyFileSync(srcPath, destPath);

  // Skip non-raster images (SVG etc.)
  if (!isImage(filename)) return null;

  // Generate WebP version
  const webpName = filename.replace(/\.(jpe?g|png|gif|bmp)$/i, ".webp");
  const webpPath = path.join(destDir, webpName);
  const metadata = await sharp(srcPath).metadata();

  await sharp(srcPath).webp({ quality: WEBP_QUALITY }).toFile(webpPath);

  const origSize = fs.statSync(srcPath).size;
  const webpSize = fs.statSync(webpPath).size;
  const saving = Math.round((1 - webpSize / origSize) * 100);
  console.log(
    `  WebP: ${filename} → ${webpName} (${formatSize(origSize)} → ${formatSize(webpSize)}, -${saving}%)`
  );

  return { width: metadata.width, height: metadata.height };
}

async function generateThumbnail(srcPath, destDir, filename) {
  if (!isImage(filename)) return null;

  await ensureDir(destDir);

  const thumbName = filename.replace(
    /\.(jpe?g|png|gif|bmp)$/i,
    "-thumb.webp"
  );
  const thumbPath = path.join(destDir, thumbName);

  const result = await sharp(srcPath)
    .resize(THUMB_WIDTH, null, { withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(thumbPath);

  console.log(
    `  Thumb: ${filename} → ${thumbName} (${THUMB_WIDTH}x${result.height})`
  );

  return { width: result.width, height: result.height };
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function processDirectory(relDir) {
  const srcDirFull = path.join(imgDir, relDir);
  const destDirFull = path.join(outDir, relDir);

  if (!fs.existsSync(srcDirFull)) {
    console.warn(`Warning: directory not found: ${relDir}`);
    return;
  }

  const files = fs.readdirSync(srcDirFull).filter((f) => {
    const stat = fs.statSync(path.join(srcDirFull, f));
    return stat.isFile();
  });

  console.log(`\nProcessing ${relDir}/ (${files.length} files)`);

  const needsThumbs = THUMBNAIL_DIRS.includes(relDir);

  for (const file of files) {
    const srcPath = path.join(srcDirFull, file);
    await processImage(srcPath, destDirFull, file);

    if (needsThumbs) {
      await generateThumbnail(srcPath, destDirFull, file);
    }
  }
}

(async () => {
  console.log("Image optimisation starting...\n");

  const startTime = Date.now();
  let totalOriginal = 0;
  let totalOptimised = 0;

  // Process directories
  for (const dir of PROCESS_DIRS) {
    await processDirectory(dir);
  }

  // Process individual root files
  console.log("\nProcessing root files");
  for (const file of PROCESS_FILES) {
    const srcPath = path.join(imgDir, file);
    if (fs.existsSync(srcPath)) {
      await processImage(srcPath, outDir, file);
    }
  }

  // Calculate total savings
  for (const dir of PROCESS_DIRS) {
    const srcDirFull = path.join(imgDir, dir);
    const destDirFull = path.join(outDir, dir);
    if (!fs.existsSync(srcDirFull)) continue;

    const files = fs.readdirSync(srcDirFull).filter((f) =>
      isImage(f) && fs.statSync(path.join(srcDirFull, f)).isFile()
    );

    for (const file of files) {
      totalOriginal += fs.statSync(path.join(srcDirFull, file)).size;
      const webpName = file.replace(/\.(jpe?g|png|gif|bmp)$/i, ".webp");
      const webpPath = path.join(destDirFull, webpName);
      if (fs.existsSync(webpPath)) {
        totalOptimised += fs.statSync(webpPath).size;
      }
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalSaving = Math.round((1 - totalOptimised / totalOriginal) * 100);
  console.log(`\nDone in ${elapsed}s`);
  console.log(
    `Total: ${formatSize(totalOriginal)} → ${formatSize(totalOptimised)} (-${totalSaving}%)`
  );
})();
