#!/usr/bin/env node

import { resolve } from "node:path";
import { listSkillSets } from "../src/list.js";
import { installSkillSet } from "../src/install.js";

const HELP = `
Usage: developer-skills <command> [options]

Commands:
  install <skill-set>   Install a skill set into your project
  list                  List available skill sets
  update                Update all installed skill sets

Options:
  --ide <name>          Target a specific IDE (cursor, claude, windsurf, copilot, cline)
  --project-dir <path>  Project root (defaults to current directory)
  --help                Show this help message

Examples:
  npx @ledgerhq/developer-skills install dmk
  npx @ledgerhq/developer-skills install dmk --ide cursor
  npx @ledgerhq/developer-skills list
  npx @ledgerhq/developer-skills update
`.trim();

function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = { command: null, skillSet: null, ide: null, projectDir: process.cwd() };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      console.log(HELP);
      process.exit(0);
    } else if (arg === "--ide" && i + 1 < args.length) {
      parsed.ide = args[++i];
    } else if (arg === "--project-dir" && i + 1 < args.length) {
      parsed.projectDir = resolve(args[++i]);
    } else if (!parsed.command) {
      parsed.command = arg;
    } else if (!parsed.skillSet) {
      parsed.skillSet = arg;
    }
    i++;
  }

  return parsed;
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.command) {
    console.log(HELP);
    process.exit(0);
  }

  switch (args.command) {
    case "list":
      listSkillSets();
      break;

    case "install":
      if (!args.skillSet) {
        console.error("Error: specify a skill set to install. Run `developer-skills list` to see options.\n");
        process.exit(1);
      }
      await installSkillSet(args.skillSet, args.projectDir, args.ide);
      break;

    case "update":
      await installSkillSet(null, args.projectDir, args.ide, { update: true });
      break;

    default:
      console.error(`Unknown command: ${args.command}\n`);
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
