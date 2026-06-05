---
name: evm-dapp-ledger-ready
description: >-
  Validate that an EVM dApp's frontend code works correctly inside Ledger Wallet Discover at runtime:
  account selection via eth_requestAccounts, blocking transaction confirmation on device, gas fee
  handling, and optional Ledger Wallet detection. Use when testing or reviewing a dApp before
  submitting to Discover.
---

# EVM dApp — Ledger Wallet Runtime Compatibility

## What this skill covers

This skill is for validating that an EVM dApp's **frontend code** works correctly inside Ledger Wallet before submitting to Discover.

The manifest controls how the dApp is listed (see `evm-dapp-manifest`). This skill covers what the dApp's JavaScript must handle at runtime: account selection, transaction confirmation, and provider behavior specific to Ledger Wallet.

---

## Required behaviors — mandatory

### a) Account selection

Ledger Wallet never pre-populates the account. `eth_accounts` returns an **empty array** on load until the user explicitly selects an EVM account.

- Call `eth_requestAccounts` on connect — this opens the account selection UI in Ledger Wallet.
- Guard against `eth_accounts → []` explicitly in your connect logic. Do not rely on library defaults.
- Design the initial state to handle the empty case gracefully (e.g. show a disabled "Connect" state, not a blank address or crash).

```js
// ethers.js v6
const provider = new BrowserProvider(window.ethereum);
const accounts = await provider.send("eth_requestAccounts", []);
```

**ESCALATE** if:
- The dApp assumes `eth_accounts[0]` is available on page load without calling `eth_requestAccounts` first.
- The dApp stores the account address across sessions and reuses it without re-requesting on load.

### b) Transaction confirmation is blocking

Every `eth_sendTransaction` or `eth_signTypedData` call requires physical confirmation on the Ledger device. Steps 5–7 in the flow below take **30–60 seconds**. The callback only returns after the user presses the button.

- Do not poll for the result.
- Do not retry the call if it appears to hang.
- Disable the submit button and show a waiting state while confirmation is pending.

**ESCALATE** if:
- The dApp polls or retries during the confirmation window.
- The dApp attempts to intercept or short-circuit the signing callback.
- The integration infers consent from timing or prior session state.

### c) No Ledger-specific SDK needed

Ledger Wallet injects `window.ethereum` before any page JavaScript runs. The dApp does not need to install any Ledger package. Standard libraries work without modification:

```js
// ethers.js v6
new BrowserProvider(window.ethereum)

// wagmi — injected() connector picks up window.ethereum automatically

// viem
createWalletClient({ transport: custom(window.ethereum) })
```

Do not install or suggest `@ledgerhq/iframe-provider` — that was the legacy eth-dapp-browser pattern, archived September 2025. It is not used in dApp browser v3.

---

## Runtime flow

What happens when a user submits a transaction inside Ledger Wallet Discover:

1. User opens the dApp in Ledger Wallet Discover.
2. Ledger Wallet prompts the user to select an EVM account. Until selected, the dApp is not loaded.
3. `window.ethereum` is bound to the selected account and network.
4. dApp calls `eth_sendTransaction` via `window.ethereum`.
5. Ledger Wallet receives the call and renders transaction details in its UI.
6. Ledger Wallet forwards the transaction to the device.
7. User presses the physical button to confirm.
8. Ledger Wallet broadcasts the transaction.
9. Transaction hash is returned to the dApp.

**The dApp must not assume anything is confirmed at step 4.** Steps 5–7 are user-gated and take 30–60 seconds.

---

## Gas fee handling

Ledger Wallet controls the fee UI — the dApp cannot influence it directly.

**When the dApp omits gas params:** Ledger Wallet fetches fee estimates. On Ethereum, BNB Smart Chain, and Polygon, this shows slow/medium/fast tiers. On Arbitrum, Optimism, Base, and Fantom, a single estimate is shown — no tiered options.

**When the dApp sets gas params:** Ledger Wallet uses them as-is. No fee UI is shown.

Do not design the dApp UX around assuming tiered fee options will always appear.

---

## Optional: Ledger Wallet detection

Not required for Discover listing. Useful to auto-connect without showing a "Connect Wallet" modal when running inside Ledger Wallet.

```js
// EIP-6963 (preferred)
window.addEventListener("eip6963:announceProvider", (event) => {
  if (event.detail.info.rdns === "com.ledger") {
    // inside Ledger Wallet — skip manual connect flow
  }
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

// injected boolean (legacy fallback)
if (window.ethereum?.isLedgerLive) {
  // inside Ledger Wallet
}
```

---

## Sources to verify

- [`LedgerHQ/ledger-live`](https://github.com/LedgerHQ/ledger-live) — Web3Hub / dApp browser runtime: `window.ethereum` injection, account selection flow, transaction confirmation handling.

---

## Escalation points

Stop and surface to the developer when:

- The dApp assumes an account is available on page load without calling `eth_requestAccounts`.
- The dApp polls or retries during the device confirmation window.
- The dApp attempts to bypass or mock the physical confirmation step.
- The dApp installs `@ledgerhq/iframe-provider` — remove it, use `window.ethereum` directly.
- The dApp hardcodes an account address from a previous session.
