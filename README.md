# Ledger Developer AI Skills

AI coding skills for Ledger developer tools. Install SDK-specific skills into any IDE (Cursor, Claude Code, Copilot, Windsurf, Cline) with one command.

## What this is

The [Ledger Developer Portal](https://developers.ledger.com) documents Ledger developer tools for human readers. This repository is its companion for AI coding assistants.

Where the portal explains how things work, these skills teach your coding assistant how to **use them correctly** — the right APIs, the right patterns, the right constraints, the right error handling. They encode the kind of knowledge that lives in documentation, code review comments, and senior developer experience into a format that AI tools can act on reliably.

The skills are grounded in the same source of truth as the portal documentation: source code, verified API signatures, and domain expertise from the team that builds the projects.

**We're starting with the Device Management Kit (DMK)** — Ledger's TypeScript SDK for Ledger signers integration. More skill sets will follow as we expand coverage across the Ledger developer ecosystem.

## Quick start

```bash
npx @ledgerhq/developer-skills install dmk
```

The installer detects your IDE and places the skill files where your coding assistant will find them.


## Usage

### Install a skill set

```bash
# Auto-detect IDE(s) in your project
npx @ledgerhq/developer-skills install dmk

# Target a specific IDE
npx @ledgerhq/developer-skills install dmk --ide cursor
npx @ledgerhq/developer-skills install dmk --ide claude
npx @ledgerhq/developer-skills install dmk --ide copilot
```

### List available skill sets

```bash
npx @ledgerhq/developer-skills list
```

### Update installed skills

```bash
npx @ledgerhq/developer-skills update
```

## IDE support

| IDE | Method | Location |
|---|---|---|
| Cursor | Directory per skill | `.cursor/skills/<skill-name>/` |
| Claude Code | Directory per skill | `.claude/skills/<skill-name>/` |
| Windsurf | Concatenated rules file | `.windsurf/rules/ledger-dmk.md` |
| GitHub Copilot | Injected into instructions | `.github/copilot-instructions.md` |
| Cline | Injected into rules | `.clinerules` |

For directory-based IDEs (Cursor, Claude Code), each skill gets its own directory with a `SKILL.md` entry point and reference files loaded on demand.

For single-file IDEs (Copilot, Windsurf, Cline), all skills are concatenated into one document with clear section markers. Existing content in the file is preserved — the installer injects a marked section that `update` can find and replace.

## Manual installation

If you prefer not to use the CLI, copy the skill files directly from the `skills/` directory in this repository into your IDE's configuration:

```bash
# Cursor
cp -r skills/dmk/* .cursor/skills/

# Claude Code
cp -r skills/dmk/* .claude/skills/
```

## Disclaimer

These skills accelerate implementation but do not replace developer judgment. You own your application's security model, error handling, and user experience. Skills provide patterns grounded in official documentation and source code, you are responsible for verifying they are appropriate for your context and for keeping dependencies up to date.
