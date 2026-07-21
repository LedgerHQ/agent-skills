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

In dApp Browser v3, **account selection happens before the dApp loads**. Ledger Wallet shows its native account picker; the webview is only opened after the user has selected an EVM account. `eth_accounts` returns the selected account immediately on page load, it is never empty when the dApp starts.

- When `window.ethereum.isLedgerLive` is `true`, auto-connect on load. Do not show a manual "Connect Wallet" modal, the account is already available.
- Call `eth_requestAccounts` (or read `eth_accounts`) once on init. Both resolve immediately with the pre-selected account.
- Listen for the `accountsChanged` event. Ledger Wallet emits it when the user switches accounts without reloading the dApp, your UI must update to reflect the new account.

```js
// ethers.js v6 — auto-connect when inside Ledger Wallet
const provider = new BrowserProvider(window.ethereum);

if (window.ethereum.isLedgerLive) {
  // Account is already selected; resolve immediately
  const accounts = await provider.send("eth_requestAccounts", []);
  // accounts[0] is the pre-selected address
}

// Handle account switching (user changes account in Ledger Wallet native UI)
window.ethereum.on("accountsChanged", (accounts) => {
  if (accounts.length > 0) {
    // Update app state with the new account
  }
});
```

**ESCALATE** if:
- The dApp ignores `accountsChanged` events. When the user switches accounts inside Ledger Wallet, the dApp must update its state.
- The dApp shows a manual "Connect" button and waits for the user to click it before reading `eth_accounts`, unnecessary friction in the Ledger Wallet environment.
- The dApp stores the account address across sessions and reuses it without re-requesting on load.

### b) Transaction confirmation is blocking

Every `eth_sendTransaction` or `eth_signTypedData` call requires physical confirmation on the Ledger device. Steps 5–7 in the flow below take **30–60 seconds**. The callback only returns after the user presses the button.

- Do not poll for the result.
- Do not retry the call if it appears to hang.
- Do not set a client-side timeout on the call, the promise resolves only when the user acts on the device, which can take as long as needed.
- Disable the submit button and show a waiting state while confirmation is pending.

**ESCALATE** if:
- The dApp polls or retries during the confirmation window.
- The dApp sets a timeout that rejects or cancels the pending signing call.
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

1. User selects an EVM account in Ledger Wallet's native account picker.
2. Ledger Wallet opens the dApp in a webview. `window.ethereum` is already bound to the selected account and network. `eth_accounts` returns the account immediately.
3. dApp auto-connects on load (detects `isLedgerLive`, calls `eth_requestAccounts`, gets the account without any user prompt).
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

Not required for Discover listing. Useful to auto-connect without showing a "Connect Wallet" modal when running inside Ledger Wallet. The two mechanisms are complementary, use both:

- **`window.ethereum.isLedgerLive`**: the direct signal that you are running inside Ledger Wallet and should auto-connect. This is what gates the auto-connect behavior in the required section above.
- **EIP-6963**: standards-based provider discovery. Ledger Wallet announces itself with `rdns: "com.ledger"`; use this if your stack already resolves providers via EIP-6963.

```js
// isLedgerLive: direct signal to auto-connect when inside Ledger Wallet
if (window.ethereum?.isLedgerLive) {
  // inside Ledger Wallet, skip the manual connect flow and auto-connect
}

// EIP-6963: standards-based provider discovery
window.addEventListener("eip6963:announceProvider", (event) => {
  if (event.detail.info.rdns === "com.ledger") {
    // inside Ledger Wallet — skip manual connect flow
  }
});
window.dispatchEvent(new Event("eip6963:requestProvider"));
```

---

## Sources to verify

- [`LedgerHQ/ledger-live`](https://github.com/LedgerHQ/ledger-live) — Web3Hub / dApp browser runtime: `window.ethereum` injection, account selection flow, transaction confirmation handling.

---

## Escalation points

Stop and surface to the developer when:

- The dApp ignores `accountsChanged` events. Ledger Wallet emits this when the user switches accounts; the dApp must handle it.
- The dApp blocks behind a manual "Connect" button when `isLedgerLive` is true — auto-connect instead.
- The dApp polls or retries during the device confirmation window.
- The dApp attempts to bypass or mock the physical confirmation step.
- The dApp installs `@ledgerhq/iframe-provider`. Remove it, use `window.ethereum` directly.
- The dApp hardcodes an account address from a previous session.
