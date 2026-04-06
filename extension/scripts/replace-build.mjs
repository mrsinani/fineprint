import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extRoot = path.join(__dirname, "..");
const dist = path.join(extRoot, "dist");
const zipPath = path.join(extRoot, "fineprint-extension.zip");
const nodeModules = path.join(extRoot, "node_modules");

function run(cmd, opts = {}) {
  execSync(cmd, { cwd: extRoot, stdio: "inherit", ...opts });
}

console.log("FinePrint extension — clean build\n");

if (!fs.existsSync(nodeModules)) {
  console.log("Installing extension dependencies…\n");
  run("npm install");
}

if (fs.existsSync(dist)) {
  console.log("Removing previous dist/ …");
  fs.rmSync(dist, { recursive: true, force: true });
}

if (fs.existsSync(zipPath)) {
  console.log("Removing previous fineprint-extension.zip …");
  fs.unlinkSync(zipPath);
}

console.log("\nBuilding (icons + TypeScript + Vite)…\n");
run("npm run build");

// console.log("\nPackaging ZIP…\n");
// run(`node "${path.join(__dirname, "zip-dist.mjs")}"`);

console.log("\nDone. Load extension/dist in Chrome.");
