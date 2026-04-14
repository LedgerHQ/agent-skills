# DMK Skill Set

Skills for integrating the Ledger Device Management Kit (DMK) — the TypeScript SDK for communicating with Ledger hardware wallets.

---

## Structure

```
DMK-skills-vFinal/
├── README.md                            ← you are here
└── skills/
    ├── dmk-business-logic/
    │   └── SKILL.md                     ← concepts: Clear Signing, Secure Channel, sessions, etc.
    ├── dmk-implementation/
    │   ├── SKILL.md                     ← implementation skill (entry point)
    │   ├── dmk-sdk-reference.md         ← packages, versions, chain routing, error types, gotchas
    │   ├── dmk-code-patterns.md         ← working code for every DMK pattern
    │   └── dmk-platform-patterns.md     ← React, Node.js CLI, Vite, EIP-1193, WebAuthn
    └── dmk-intent-vocabulary/
        └── SKILL.md                     ← intent recognition
```

---

## Three skills, one skill set

**`skills/dmk-intent-vocabulary/SKILL.md`** — Load first when the developer's request is phrased informally or the intent is ambiguous. Maps natural language ("sign a transaction", "find my Ledger", "is this device real?") to the correct DMK API.

**`skills/dmk-implementation/SKILL.md`** — Load for implementation. Defines a 5-step execution process (Init → Session → Device State → App Management → Operation) with explicit HITL gates, error classification, and timeout bounds. Reference files are loaded on demand as noted in each step.

**`skills/dmk-business-logic/SKILL.md`** — Load for conceptual questions. Covers Clear Signing, Secure Channel, sessions, and other DMK domain concepts.

---

## How to load

1. If the request is ambiguous → load `skills/dmk-intent-vocabulary/SKILL.md` first
2. For all implementation tasks → load `skills/dmk-implementation/SKILL.md`
3. Reference files inside `skills/dmk-implementation/` are loaded on demand — `SKILL.md` specifies which file to load at each step
4. For conceptual questions ("what is Clear Signing?", "what is a Secure Channel?") → load `skills/dmk-business-logic/SKILL.md`

---

## Coverage

| Capability | Where |
|---|---|
| ETH / EVM signing, address, typed data | `skills/dmk-implementation/dmk-code-patterns.md` |
| Bitcoin signing, address, xpub | `skills/dmk-implementation/dmk-code-patterns.md` |
| Solana signing, address | `skills/dmk-implementation/dmk-code-patterns.md` |
| Cosmos signing, address | `skills/dmk-implementation/dmk-code-patterns.md` |
| Genuine check, app install/uninstall | `skills/dmk-implementation/dmk-code-patterns.md` |
| WebAuthn / Security Key | `skills/dmk-implementation/dmk-platform-patterns.md` |
| React integration | `skills/dmk-implementation/dmk-platform-patterns.md` |
| Node.js CLI integration | `skills/dmk-implementation/dmk-platform-patterns.md` |
| EIP-1193 provider (ethers/viem/wagmi) | `skills/dmk-implementation/dmk-platform-patterns.md` |
| Error classification, rejection handling | `skills/dmk-implementation/dmk-code-patterns.md` |
| Clear Signing, Secure Channel concepts | `skills/dmk-business-logic/SKILL.md` |


## Version note

This skill set is v1. The DMK is actively evolving: package versions, method signatures, and observable states may change between releases Verify against your installed package types before shipping.
                                                                 
Using this skill accelerates implementation but does not replace your judgment. You own your app's security model, error handling, and UX. The skill provides patterns, you decide what's appropriate for your context.   


## Legal notice

The Device Management Kit (DMK) is made available under an open source license and is free to use for development, testing, and integration purposes.

Please note that access to the DMK does not grant you any rights to access Ledger SAS backend services, nor any rights to use tokens, APIs, or infrastructure beyond what is explicitly allowed under the open source license. Access to Ledger SAS backend is strictly prohibited unless explicitly authorized by Ledger SAS.

Use of any token to gain access to Ledger SAS backend without a formal, written legal agreement is forbidden. Unauthorized use or access may lead to legal claims, including but not limited to injunctive relief, damages, or other remedies permitted under applicable law.


