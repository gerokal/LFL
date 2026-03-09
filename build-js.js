const { minify } = require("terser");
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "scripts");
const outDir = path.join(__dirname, "_site", "scripts");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".js"));

(async () => {
  for (const file of files) {
    const code = fs.readFileSync(path.join(srcDir, file), "utf8");
    const result = await minify(code);
    if (result.code) {
      fs.writeFileSync(path.join(outDir, file), result.code);
      console.log(`Minified: ${file}`);
    }
  }
  console.log(`Done. ${files.length} files minified.`);
})();
