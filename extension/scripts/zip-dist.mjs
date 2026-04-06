import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const zipPath = path.join(root, "fineprint-extension.zip");

if (!fs.existsSync(path.join(dist, "manifest.json"))) {
  console.error("Run `npm run build` first — dist/manifest.json is missing.");
  process.exit(1);
}

if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

execSync(`cd "${dist}" && zip -r "${zipPath}" .`, { stdio: "inherit" });
console.log(`\nCreated: ${zipPath}`);
console.log("Upload this ZIP to the Chrome Web Store (not the folder).");
