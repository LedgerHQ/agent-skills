# wallet-cli Skill

Skill for using the official Ledger **wallet-cli** — the USB-based CLI for Ledger signers flows (account discover, receive, balances, operations, send, swap quote/execute/status, genuine-check).

---

## Structure

```
wallet-cli/
├── README.md                              ← you are here
└── wallet-cli-usage/
    ├── SKILL.md                           ← command reference + intent map + operational rules
    └── references/
        └── business-logic.md              ← genuine check, receive verification, sessions, sandbox, device contention
```

---

## One skill, with a reference file

**`wallet-cli-usage/SKILL.md`** — The entry point. Load for any wallet-cli command execution, and for mapping informal requests ("show me my wallet", "send some ETH", "is this Ledger real") to the right command. Contains the intent map, the full command surface, required flags, the authoritative device/sandbox table, device-contention and device-readiness rules, the out-of-scope list, the network support matrix, and the common-errors table.

**`wallet-cli-usage/references/business-logic.md`** — Loaded on demand from the main skill. Holds *conceptual* rationale: what genuine check cryptographically proves (and doesn't), why the trusted display matters for receive verification, what a session is and isn't, why the sandbox bypass exists, and why device contention happens on the USB HID channel. The main skill explicitly hands off to it for safety rules that must be surfaced to the user.

---

## How to load

1. For any command execution, or to translate an informal request → load `wallet-cli-usage/SKILL.md`.
2. For *why* a command behaves the way it does, or to surface a safety rule's rationale → `wallet-cli-usage/SKILL.md` will direct you to read `wallet-cli-usage/references/business-logic.md`.

---

## Coverage

| Capability                                          | Where                                                     |
| --------------------------------------------------- | --------------------------------------------------------- |
| Command syntax, flags, examples                     | `wallet-cli-usage/SKILL.md`                               |
| Authoritative device/sandbox table (which commands) | `wallet-cli-usage/SKILL.md`                               |
| Session-first, device-contention, device-readiness  | `wallet-cli-usage/SKILL.md`                               |
| Session labels and `--account` references           | `wallet-cli-usage/SKILL.md`                               |
| Natural-language → command mapping                  | `wallet-cli-usage/SKILL.md`                               |
| Out-of-scope intents (staking, NFTs, L2 send, …)    | `wallet-cli-usage/SKILL.md`                               |
| Network support (mainnets vs L2s/testnets)          | `wallet-cli-usage/SKILL.md`                               |
| Common errors and fixes                             | `wallet-cli-usage/SKILL.md`                               |
| `genuine-check` preconditions and receive mismatch  | `wallet-cli-usage/SKILL.md`                               |
| Genuine check — *what it proves* and *doesn't*      | `wallet-cli-usage/references/business-logic.md`           |
| Trusted display — *why* host can't be trusted       | `wallet-cli-usage/references/business-logic.md`           |
| Sessions — *what a session is and isn't*            | `wallet-cli-usage/references/business-logic.md`           |
| Sandbox bypass — *why* it's needed                  | `wallet-cli-usage/references/business-logic.md`           |
| Device contention — *why* it matters                | `wallet-cli-usage/references/business-logic.md`           |
| Custom device integrations (raw APDU, EIP-1193, …)  | DMK skill set — `LedgerHQ/agent-skills/dmk`               |

---

## Legal Notice

The Ledger Wallet CLI is a technology feature that supports AI agents and terminal-based workflows to prepare and present transactions for hardware confirmation on a Ledger device. It is not a financial service, brokerage, investment adviser, or custodian.

Transactions proposed or initiated through this feature require affirmative physical confirmation by the user on their Ledger device before they are signed or executed. Ledger does not hold, manage, or have access to user assets at any time. Ledger exercises no control over, and bears no responsibility for, the logic, prompts, financial parameters, or economic outcomes of any AI agent nor for the accuracy, profitability, suitability, or intent of any AI agent. The user is solely responsible for the logic, instructions, financial parameters, and outcomes of any transaction proposed or initiated by an AI agent operating through this CLI. Ledger does not select, recommend, or endorse specific swap providers, rates, validators, or staking positions. These are presented for user review and confirmation only.

Details regarding transactions that are displayed by the CLI are provided for informational purposes only and are sourced from third-party providers. They do not constitute investment advice or a recommendation to transact. Staking yields displayed by the earn commands are indicative only and not guaranteed. Ledger is not party to any swap or staking transaction. The contractual relationship is between the user and the relevant third-party provider.

Due to the non-deterministic nature of AI models, instructions generated by AI agents may contain errors, inaccuracies, or unintended parameters. Users must independently verify all transaction details on the Ledger device screen before confirming.

Use of this feature does not establish any contractual, advisory, or fiduciary relationship between the user and Ledger SAS or its affiliates. This tool is provided “as is,” in early experimental development, without warranty of any kind. To the maximum extent permitted by law, Ledger SAS and its affiliates shall not be liable for any direct, indirect, incidental, special, punitive, or consequential damages arising from use of this feature, including but not limited to loss of digital assets, unauthorised access, smart contract exploits, or transaction malfunction.
