import { readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

const scriptsDirectory = dirname(import.meta.dir);
const projectRoot = scriptsDirectory;
const parentDirectory = dirname(projectRoot);
const projectName = basename(projectRoot);

// Generate custom timestamp with 12-hour AM/PM format (e.g., 2026-09-30_10-17PM)
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");

let hours = now.getHours();
const ampm = hours >= 12 ? "PM" : "AM";
hours = hours % 12 || 12; // Convert 0 to 12 for midnight
const hoursStr = String(hours).padStart(2, "0");
const minutes = String(now.getMinutes()).padStart(2, "0");

const formattedTimestamp = `${year}-${month}-${day}_${hoursStr}-${minutes}${ampm}`;

// Save directly inside the projectRoot
const archiveName = `${projectName}_code_${formattedTimestamp}.zip`;
const archivePath = join(projectRoot, archiveName);

const excludedDirectories = [
  ".pytest_cache",
  "backend/.venv",
  "backend/bin",
  "backend/storage",
  "frontend/node_modules",
  "frontend/dist",
];

// Helper to count total files in projectRoot while respecting exclusions
async function countFiles(dir: string, baseDir: string = dir): Promise<number> {
  let total = 0;
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = fullPath
      .substring(baseDir.length + 1)
      .replace(/\\/g, "/");

    // Skip the archive file if it's already created in projectRoot
    if (entry.isFile() && entry.name.endsWith(".zip")) continue;

    // Check if path starts with or matches any excluded directory
    const isExcluded = excludedDirectories.some(
      (ex) => relativePath === ex || relativePath.startsWith(`${ex}/`),
    );

    if (isExcluded) continue;

    if (entry.isDirectory()) {
      total += await countFiles(fullPath, baseDir);
    } else if (entry.isFile()) {
      total++;
    }
  }

  return total;
}

// Terminal Progress Bar helper
function renderProgressBar(current: number, total: number, width = 30) {
  const percentage = Math.min(
    100,
    Math.floor((current / Math.max(total, 1)) * 100),
  );
  const filledLength = Math.min(
    width,
    Math.round((width * current) / Math.max(total, 1)),
  );
  const bar = "█".repeat(filledLength) + "-".repeat(width - filledLength);

  process.stdout.write(
    `\r archiving... [${bar}] ${percentage}% (${current}/${total} files)`,
  );
}

console.log("=== Starting Code Packaging ===");
console.log(`Project root: ${projectRoot}`);
console.log(`Creating archive: ${archivePath}`);

process.stdout.write("Calculating total files...");
const totalFiles = await countFiles(projectRoot);
process.stdout.write(` Found ${totalFiles} files.\n`);

const tarArguments = [
  "-a",
  "-c",
  "-v",
  "-f",
  archivePath,
  "-C",
  parentDirectory,
  // Exclude the generated zip itself to prevent recursive tar inclusion
  `--exclude=${projectName}/*.zip`,
  ...excludedDirectories.flatMap((directory) => [
    `--exclude=${projectName}/${directory}`,
    `--exclude=${projectName}/${directory}/**`,
  ]),
  projectName,
];

const tarProcess = Bun.spawn(["tar", ...tarArguments], {
  stdout: "pipe",
  stderr: "pipe",
});

let processedFiles = 0;
renderProgressBar(0, totalFiles);

// Stream stdout to process tar's -v output line by line
if (tarProcess.stdout) {
  const reader = tarProcess.stdout.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // Keep trailing incomplete line

    for (const line of lines) {
      if (line.trim()) {
        processedFiles++;
        renderProgressBar(processedFiles, totalFiles);
      }
    }
  }
}

// Read any leftover error output
const stderrText = await new Response(tarProcess.stderr).text();
const exitCode = await tarProcess.exited;

process.stdout.write("\n"); // Move to next line after progress bar finishes

if (exitCode !== 0) {
  console.error(stderrText.trim() || `tar exited with code ${exitCode}`);
  process.exit(exitCode);
}

const archive = Bun.file(archivePath);
console.log(
  `Package successfully created: ${archivePath} (${(archive.size / 1024 / 1024).toFixed(2)} MB)`,
);
console.log(`Archive name: ${basename(archivePath)}`);
console.log("=== Packaging Complete ===");
