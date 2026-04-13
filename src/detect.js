import { existsSync } from "node:fs";
import { join } from "node:path";
import { IDE_CONFIGS } from "./constants.js";

export function detectIDEs(projectDir) {
  const detected = [];

  for (const [id, config] of Object.entries(IDE_CONFIGS)) {
    if (config.detectDir) {
      const dirPath = join(projectDir, config.detectDir);
      if (existsSync(dirPath)) {
        detected.push(id);
      }
    }
    if (config.detectFile) {
      const filePath = join(projectDir, config.detectFile);
      if (existsSync(filePath)) {
        detected.push(id);
      }
    }
  }

  return detected;
}

export function resolveTargetIDEs(projectDir, explicitIde) {
  if (explicitIde) {
    const normalized = explicitIde.toLowerCase();
    if (!IDE_CONFIGS[normalized]) {
      const valid = Object.keys(IDE_CONFIGS).join(", ");
      throw new Error(`Unknown IDE "${explicitIde}". Supported: ${valid}`);
    }
    return [normalized];
  }

  const detected = detectIDEs(projectDir);

  if (detected.length === 0) {
    console.log("No IDE configuration detected in this project.");
    console.log("Defaulting to Cursor (.cursor/skills/).\n");
    return ["cursor"];
  }

  return detected;
}
