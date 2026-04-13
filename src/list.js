import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { SKILLS_DIR } from "./constants.js";

export function getAvailableSkillSets() {
  const entries = readdirSync(SKILLS_DIR, { withFileTypes: true });
  const skillSets = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = join(SKILLS_DIR, entry.name, "manifest.json");
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
      skillSets.push(manifest);
    } catch {
      continue;
    }
  }

  return skillSets;
}

export function listSkillSets() {
  const skillSets = getAvailableSkillSets();

  if (skillSets.length === 0) {
    console.log("No skill sets available.");
    return;
  }

  console.log("Available skill sets:\n");

  for (const ss of skillSets) {
    console.log(`  ${ss.name}  (v${ss.version})`);
    console.log(`    ${ss.description}`);
    console.log(`    Skills: ${ss.skills.map((s) => s.name).join(", ")}`);
    console.log();
  }

  console.log("Install with: npx @ledgerhq/developer-skills install <name>");
}
