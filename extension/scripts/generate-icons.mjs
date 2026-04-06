import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extRoot = path.join(__dirname, "..");
const repoRoot = path.join(extRoot, "..");
const iconsDir = path.join(extRoot, "public", "icons");
const logoSrc = path.join(repoRoot, "public", "logo.png");

fs.mkdirSync(iconsDir, { recursive: true });

if (fs.existsSync(logoSrc)) {
  for (const size of [16, 48, 128]) {
    const out = path.join(iconsDir, `icon-${size}.png`);
    execSync(`sips -Z ${size} "${logoSrc}" --out "${out}"`, { stdio: "pipe" });
  }
  console.log("Resized app logo → extension icons (16, 48, 128)");
} else {
  console.warn("public/logo.png not found, skipping icon generation");
}
