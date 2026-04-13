import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  copyFileSync,
  statSync,
} from "node:fs";
import { join, relative } from "node:path";
import { SKILLS_DIR, IDE_CONFIGS, TRACKING_FILE } from "./constants.js";
import { resolveTargetIDEs } from "./detect.js";
import { getAvailableSkillSets } from "./list.js";
import { concatenateSkillSet, injectIntoFile } from "./concatenate.js";

function copyDirRecursive(src, dest) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function countFiles(dir) {
  let count = 0;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

function loadManifest(skillSetName) {
  const manifestPath = join(SKILLS_DIR, skillSetName, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(
      `Unknown skill set "${skillSetName}". Run \`developer-skills list\` to see options.`
    );
  }
  return JSON.parse(readFileSync(manifestPath, "utf-8"));
}

function installDirectory(skillSetName, manifest, ideConfig, projectDir) {
  const srcDir = join(SKILLS_DIR, skillSetName);
  const targetBase = ideConfig.skillsPath(projectDir);
  let installed = 0;

  for (const skill of manifest.skills) {
    const srcSkillDir = join(srcDir, skill.name);
    const destSkillDir = join(targetBase, skill.name);

    if (!existsSync(srcSkillDir)) continue;
    copyDirRecursive(srcSkillDir, destSkillDir);
    installed += countFiles(srcSkillDir);
  }

  return { path: relative(projectDir, targetBase), fileCount: installed };
}

function installSingleFile(skillSetName, manifest, ideConfig, projectDir) {
  const targetPath = ideConfig.targetPath(projectDir);
  const targetDir = ideConfig.targetDir(projectDir);
  mkdirSync(targetDir, { recursive: true });

  const block = concatenateSkillSet(skillSetName, manifest);

  let existing = "";
  if (existsSync(targetPath)) {
    existing = readFileSync(targetPath, "utf-8");
  }

  const result = injectIntoFile(existing, skillSetName, block);
  writeFileSync(targetPath, result, "utf-8");

  return { path: relative(projectDir, targetPath) };
}

function updateTracking(projectDir, skillSetName, version, ides) {
  const trackingPath = join(projectDir, TRACKING_FILE);
  let tracking = { installed: {} };

  if (existsSync(trackingPath)) {
    try {
      tracking = JSON.parse(readFileSync(trackingPath, "utf-8"));
    } catch {
      tracking = { installed: {} };
    }
  }

  tracking.installed[skillSetName] = {
    version,
    installedAt: new Date().toISOString().split("T")[0],
    ides,
  };

  writeFileSync(trackingPath, JSON.stringify(tracking, null, 2) + "\n", "utf-8");
}

export async function installSkillSet(skillSetName, projectDir, explicitIde, opts = {}) {
  const { update } = opts;

  if (update) {
    const trackingPath = join(projectDir, TRACKING_FILE);
    if (!existsSync(trackingPath)) {
      throw new Error("No skill sets installed in this project. Run `developer-skills install <name>` first.");
    }
    const tracking = JSON.parse(readFileSync(trackingPath, "utf-8"));
    const names = Object.keys(tracking.installed);

    if (names.length === 0) {
      throw new Error("No skill sets installed in this project.");
    }

    for (const name of names) {
      const prevIdes = tracking.installed[name].ides;
      const ideToUse = explicitIde || null;
      console.log(`Updating ${name}...`);
      await installSkillSet(name, projectDir, ideToUse, { update: false, _prevIdes: prevIdes });
    }
    return;
  }

  const manifest = loadManifest(skillSetName);
  const targetIDEs = opts._prevIdes
    ? opts._prevIdes
    : resolveTargetIDEs(projectDir, explicitIde);

  console.log(`Installing ${manifest.displayName} (v${manifest.version})...\n`);

  const results = [];

  for (const ideId of targetIDEs) {
    const ideConfig = IDE_CONFIGS[ideId];

    if (ideConfig.strategy === "directory") {
      const result = installDirectory(skillSetName, manifest, ideConfig, projectDir);
      results.push({ ide: ideConfig.displayName, ...result });
      console.log(`  ${ideConfig.displayName}: ${result.fileCount} files → ${result.path}/`);
    } else {
      const result = installSingleFile(skillSetName, manifest, ideConfig, projectDir);
      results.push({ ide: ideConfig.displayName, ...result });
      console.log(`  ${ideConfig.displayName}: → ${result.path}`);
    }
  }

  updateTracking(projectDir, skillSetName, manifest.version, targetIDEs);

  console.log(`\nDone. ${manifest.skills.length} skills installed for ${targetIDEs.length} IDE(s).`);
  console.log("Run `npx @ledgerhq/developer-skills update` to refresh when a new version is available.\n");
}
