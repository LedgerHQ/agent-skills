# EVM dApp — Ledger Wallet Discover (dApp Browser v3)

AI coding skills for integrating an EVM dApp with **Ledger Wallet Discover** via the dApp browser v3 (Web3Hub).

Two skills, two jobs:

| Skill | Job |
|---|---|
| `evm-dapp-manifest` | Write and validate the **manifest JSON** |
| `evm-dapp-ledger-ready` | Validate the **dApp's frontend code** works inside Ledger Wallet |

Use them sequentially: get the manifest right first, then verify the app's runtime behavior.

**Sources of truth:**
- `LedgerHQ/ledger-live` — `libs/ledger-live-common/src/platform/types.ts` (manifest schema)
- `ethereum/clear-signing-erc7730-registry` — ERC-7730 descriptors for clear signing

---

## Install

```bash
npx skills add LedgerHQ/agent-skills -s evm-dapp-manifest evm-dapp-ledger-ready
```

---

## When to use each skill

**`evm-dapp-manifest`** — load when:
- Authoring or reviewing a manifest JSON
- Checking which fields, networks, or permissions to set
- Debugging a manifest that fails to load in Ledger Wallet
- Preparing a PR submission

**`evm-dapp-ledger-ready`** — load when:
- Testing the dApp inside Ledger Wallet for the first time
- Debugging account selection or connection issues
- Reviewing transaction submission and confirmation handling
- Checking gas fee UX behavior

---

## Disclaimer

These AI skills are provided by Ledger SAS as a developer resource to accelerate integration with Ledger products. They are provided "as is," without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.

Skills encode patterns derived from official Ledger documentation and publicly available source code. They do not constitute a security audit, certification, or endorsement of any application built using them. The developer is solely responsible for the security, correctness, and compliance of their application.

Ledger SAS shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use of these skills, including but not limited to loss of digital assets, unauthorized access, or application malfunction.

Use of these skills does not establish any contractual, advisory, or fiduciary relationship between the developer and Ledger SAS.

Pattern accuracy is grounded in the public `LedgerHQ/ledger-live` repository. Verify against your installed version — SDK constraints and supported networks change across releases.
