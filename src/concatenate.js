import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SKILLS_DIR, BEGIN_MARKER, END_MARKER } from "./constants.js";

export function concatenateSkillSet(skillSetName, manifest) {
  const skillSetDir = join(SKILLS_DIR, skillSetName);
  const sections = [];

  for (const relativePath of manifest.concatenationOrder) {
    const filePath = join(skillSetDir, relativePath);
    const content = readFileSync(filePath, "utf-8").trim();
    sections.push(content);
  }

  const header = [
    BEGIN_MARKER(skillSetName),
    `<!-- ${manifest.displayName} skills v${manifest.version} -->`,
    `<!-- Installed by @ledgerhq/developer-skills — do not edit between markers -->`,
    `<!-- Run \`npx @ledgerhq/developer-skills update\` to refresh -->`,
    "",
  ].join("\n");

  const footer = `\n${END_MARKER(skillSetName)}`;

  return header + sections.join("\n\n---\n\n") + footer;
}

export function injectIntoFile(existingContent, skillSetName, newBlock) {
  const begin = BEGIN_MARKER(skillSetName);
  const end = END_MARKER(skillSetName);
  const startIdx = existingContent.indexOf(begin);
  const endIdx = existingContent.indexOf(end);

  if (startIdx !== -1 && endIdx !== -1) {
    const before = existingContent.slice(0, startIdx);
    const after = existingContent.slice(endIdx + end.length);
    return before.trimEnd() + "\n\n" + newBlock + "\n" + after.trimStart();
  }

  if (existingContent.trim().length === 0) {
    return newBlock + "\n";
  }

  return existingContent.trimEnd() + "\n\n" + newBlock + "\n";
}
