# Ledger Developer AI Skills

AI coding skills for Ledger developer tools. Install SDK-specific skills into any IDE (Cursor, Claude Code, Copilot, Windsurf, Cline) with one command.

## What this is

The [Ledger Developer Portal](https://developers.ledger.com) documents Ledger developer tools for human readers. This repository is its companion for AI coding assistants.

Where the portal explains how things work, these skills teach your coding assistant how to **use them correctly** — the right APIs, the right patterns, the right constraints, the right error handling. They encode the kind of knowledge that lives in documentation, code review comments, and senior developer experience into a format that AI tools can act on reliably.

The skills are grounded in the same source of truth as the portal documentation: source code, verified API signatures, and domain expertise from the team that builds the projects.

**We're starting with the Device Management Kit (DMK)** — Ledger's TypeScript SDK for Ledger signers integration. More skill sets will follow as we expand coverage across the Ledger developer ecosystem.

## Quick start

Copy the skill files directly from the `skills/` directory in this repository into your IDE's configuration:

```bash
# Cursor
cp -r skills/dmk/* .cursor/skills/

# Claude Code
cp -r skills/dmk/* .claude/skills/
```

## Disclaimer

These skills accelerate implementation but do not replace developer judgment. You own your application's security model, error handling, and user experience. Skills provide patterns grounded in official documentation and source code, you are responsible for verifying they are appropriate for your context and for keeping dependencies up to date.
