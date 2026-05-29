---
name: evm-dapp-manifest
description: >-
  Write and validate the manifest JSON that lists an EVM dApp in Ledger Wallet Discover (dApp
  browser v3). Covers field rules, branch values, network configuration, nanoApp / clear signing
  path selection, local testing, and PR submission checklist. Use when authoring, reviewing, or
  debugging a Discover manifest.
---

# EVM dApp — Ledger Wallet Discover (dApp Browser v3)

## What this skill covers

This skill is for writing the **manifest JSON** that lists an EVM dApp in Ledger Wallet Discover (dApp browser v3).

The manifest tells Ledger Wallet where to load the dApp, which networks it supports, which device app handles signing, and how it appears in the Discover section. Getting it right is the entire integration — no Ledger-specific SDK is needed on the dApp side. Standard ethers.js, wagmi, and viem work without modification against the `window.ethereum` injected by Ledger Wallet. Do not suggest `@ledgerhq/iframe-provider` — that was the legacy pattern (archived September 2025) and is not used in v3.

Field definitions, manifest examples, and the submission checklist are in `manifest-reference.md`. This file contains the security invariants and escalation rules the agent must follow.

---

## Integration overview

Three steps:

1. **Author the manifest** — write a JSON file that describes your dApp to Ledger Wallet.
2. **Test locally** — load the manifest via Developer mode in Ledger Wallet.
3. **Submit for review** — open a PR to the Ledger Wallet apps list (coordinate with Ledger).

---

## Manifest field rules — mandatory

These apply to every dApp browser v3 manifest. They are not recommendations.

### a) Branch values — only two are developer-facing

Developers use exactly two `branch` values:
- `"stable"` — production. Required for all submissions.
- `"debug"` — local development only. Never visible to end users. Never ship.

`"experimental"` and `"soon"` are set by Ledger's internal team after review, not by the developer submitting the manifest. Do not suggest or instruct developers to use them.

### b) nodeURL is set by Ledger in production

The `nodeURL` field in `dapp.networks` is optional. For local testing, a public RPC endpoint is acceptable. In production, Ledger Wallet uses its own node infrastructure — do not hardcode internal Ledger node URLs. Leave `nodeURL` absent or set it to a public endpoint for testing; Ledger will set production values when the manifest is merged.

### c) Clear signing vs blind signing

The `nanoApp` field in `dapp` specifies which Ledger device app handles signing for the dApp. Do not omit `nanoApp`.

There are two paths to clear signing:

**Preferred — ERC-7730 descriptor (no dedicated plugin required)**
Submit a JSON descriptor for your contracts to the [`clear-signing-erc7730-registry`](https://github.com/ethereum/clear-signing-erc7730-registry). Once merged, the generic `"Ethereum"` app reads the descriptor from the CAL and displays human-readable transaction details on device. No custom device app is needed.

**Legacy — dedicated nanoApp plugin**
If a dedicated Ledger device app already exists for your dApp (e.g. `"1inch"`, `"Uniswap"`), set `nanoApp` to that value. This predates ERC-7730 and is not the recommended path for new integrations.

**If neither applies (no descriptor, no plugin):** `nanoApp` must still be set to `"Ethereum"`. This means blind signing. Disclose this explicitly in the PR description. Do not omit the field.

---

## Execution process

### Step 1 — Determine the manifest version

Use `manifestVersion: "2"` for all new dApp browser v3 integrations. Version 1 uses the legacy `params.dappUrl` pattern (eth-dapp-browser, archived September 2025). Do not use the `params` field for new integrations.

### Step 2 — Author the manifest

See `manifest-reference.md` for full field definitions, examples, and the submission checklist. Minimum viable manifest for a dApp browser v3 integration:

```json
{
  "id": "your-dapp-id",
  "name": "Your dApp Name",
  "url": "https://your-dapp-url.com",
  "homepageUrl": "https://your-dapp-url.com",
  "supportUrl": "https://your-support-url.com",
  "icon": "https://cdn.link.to/your-icon.png",
  "platforms": ["ios", "android", "desktop"],
  "apiVersion": "^2.0.0",
  "manifestVersion": "2",
  "branch": "stable",
  "categories": ["defi"],
  "currencies": ["ethereum"],
  "visibility": "complete",
  "permissions": [],
  "domains": ["https://"],
  "dapp": {
    "provider": "evm",
    "nanoApp": "Ethereum",
    "networks": [
      {
        "currency": "ethereum",
        "chainID": 1
      }
    ]
  },
  "content": {
    "shortDescription": {
      "en": "One-sentence description of your dApp."
    },
    "description": {
      "en": "Longer description of your dApp for the Ledger Wallet Discover section."
    }
  }
}
```

### Step 3 — Add supported networks

List each network in `dapp.networks` and mirror the currency identifiers in the top-level `currencies` field. See `manifest-reference.md` for the supported chain list and their `currency` / `chainID` values.

**ESCALATE** if the developer asks about a chain not in that list — do not invent `currency` values.

### Step 4 — Set permissions

Set `permissions: []`. The wallet-api permission system (`account.list`, `transaction.signAndBroadcast`, etc.) applies to the **Wallet API / Live App** path — not the dApp browser path. All EVM interactions go through the injected `window.ethereum`. Do not copy permissions from wallet-api examples.

### Step 5 — Test locally

Enable **Developer mode** (Settings → Developer), click **Load Platform Manifest**, and paste your JSON. Test the full flow: account selection → dApp load → transaction → device confirmation → broadcast.

Use `branch: "debug"` for local testing. Switch to `branch: "stable"` before submission.

### Step 6 — Submit

Open a PR against the Ledger Wallet apps list. Walk through the **Submission checklist** in `manifest-reference.md` before opening — it covers every required field and the ERC-7730 / blind-signing disclosure.

---

## Sources to verify

- [`LedgerHQ/ledger-live`](https://github.com/LedgerHQ/ledger-live) — manifest schema: `libs/ledger-live-common/src/platform/types.ts`; dApp browser v3 field definitions and branch values.
- [`ethereum/clear-signing-erc7730-registry`](https://github.com/ethereum/clear-signing-erc7730-registry) — ERC-7730 descriptors for clear signing; CAL integration.

---

## Escalation points

Stop and surface to the developer when:

- A requested network is not in the supported chains list above — verify before proceeding.
- The manifest includes internal Ledger node URLs — remove them.
- The `nanoApp` field is absent — always require it.
- The developer sets `branch: "debug"` for a production submission.
- The manifest `permissions` field contains anything other than `[]` — this signals the developer is following the Wallet API path, not the dApp browser path.
- The `url` field contains a localhost address intended for production.
