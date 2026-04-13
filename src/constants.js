import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PACKAGE_ROOT = join(__dirname, "..");
export const SKILLS_DIR = join(PACKAGE_ROOT, "skills");

export const IDE_CONFIGS = {
  cursor: {
    displayName: "Cursor",
    detectDir: ".cursor",
    strategy: "directory",
    skillsPath: (projectDir) => join(projectDir, ".cursor", "skills"),
  },
  claude: {
    displayName: "Claude Code",
    detectDir: ".claude",
    strategy: "directory",
    skillsPath: (projectDir) => join(projectDir, ".claude", "skills"),
  },
  windsurf: {
    displayName: "Windsurf",
    detectDir: ".windsurf",
    strategy: "single-file",
    targetPath: (projectDir) => join(projectDir, ".windsurf", "rules", "ledger-dmk.md"),
    targetDir: (projectDir) => join(projectDir, ".windsurf", "rules"),
  },
  copilot: {
    displayName: "GitHub Copilot",
    detectDir: ".github",
    strategy: "single-file",
    targetPath: (projectDir) => join(projectDir, ".github", "copilot-instructions.md"),
    targetDir: (projectDir) => join(projectDir, ".github"),
  },
  cline: {
    displayName: "Cline",
    detectFile: ".clinerules",
    strategy: "single-file",
    targetPath: (projectDir) => join(projectDir, ".clinerules"),
    targetDir: (projectDir) => projectDir,
  },
};

export const BEGIN_MARKER = (skillSet) =>
  `<!-- BEGIN @ledgerhq/developer-skills:${skillSet} -->`;
export const END_MARKER = (skillSet) =>
  `<!-- END @ledgerhq/developer-skills:${skillSet} -->`;

export const TRACKING_FILE = ".ledger-skills.json";
