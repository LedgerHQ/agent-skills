# DMK Signing Flow

## Name & Trigger

**Name:** DMK Signing Flow

**Trigger:** Invoke when a developer needs to:
- Implement a signing operation (transaction, message, typed data) using a Ledger device
- Derive or retrieve an address from a Ledger device
- Send any command to a Ledger device
- Perform device management operations (genuine check, app install/uninstall, list installed apps)

If the request is phrased informally or the intent is ambiguous → load the `dmk-intent-vocabulary` skill first.

---

## Goal

Execute Ledger hardware signing operations safely: establish a device session, verify state, open the correct chain app, perform the operation, and return the result. Every step is a gate — none are optional.

---

## Connectors

**Sibling skills:**
- `dmk-intent-vocabulary` — intent recognition and API vocabulary. Use when the request is ambiguous.
- `dmk-business-logic` — conceptual reference: Clear Signing, Secure Channel, Device Actions vs Commands, sessions, transports, derivation paths, BOLOS, Genuine Check. Load when a developer asks "what is X?" or needs to understand the *why* behind an API decision.

**Reference files:**
- `dmk-sdk-reference.md` — package versions, concept map, chain routing, derivation path sources. Load at Step 1 (version check) and Step 5 (chain routing and signer selection).
- `dmk-code-patterns.md` — concrete code for DMK init, device discovery, observable subscription, and per-chain signer usage. Load at Step 1 (SDK init), Step 2 (discovery and connect patterns), and Step 5 (operation patterns).
- `dmk-platform-patterns.md` — React (DmkProvider, hooks, components), Node.js CLI, Vite config, EIP-1193 provider. Load when the target platform is known.

**Source to verify before generating code:**
- SDK root: `https://github.com/LedgerHQ/device-sdk-ts`
- Sample app: `https://github.com/LedgerHQ/device-sdk-ts/tree/develop/apps/sample` — authoritative usage patterns. Read device interaction code only — ignore Redux/Next.js wrappers.
- npm type definitions — authoritative API reference for the installed version. Prefer over GitHub source when versions differ.

**Runtime dependencies:**
- Browser: WebHID/WebBLE — Chromium only (Chrome, Edge, Brave), HTTPS or localhost. `startDiscovering()` and `connect()` must be called from a user gesture. Silent failure if violated.
- Node.js / Electron: Node-HID transport
- React Native: BLE or React Native HID transport

---

## The Process

**Conventions:**
- `→ PROCEED` — condition met, move to next step
- `→ WAIT(Ns)` — subscribe or poll for up to N seconds
- `→ ABORT` — stop, return structured error to orchestrator
- `→ ESCALATE` — stop, surface to human, do not retry

Run Steps 1–4 before every hardware operation. Sequential gates — each must pass before proceeding.

---

### Step 1 — SDK Initialization

**HITL:** No
**Reference:** `dmk-sdk-reference.md` (package versions, concept map) · `dmk-code-patterns.md` (init patterns) · `dmk-platform-patterns.md` if platform is known

DMK singleton exists and is non-null → PROCEED to Step 2

Not initialized:
- Select transport for runtime environment (see Connectors → Runtime dependencies)
- Initialize and confirm instance is non-null
- Throws or null → ABORT: "DMK initialization failed — WebHID may not be available in this runtime"

---

### Step 2 — Device Session

**HITL:** Yes — browser picker requires a user gesture; multiple devices require human selection
**Reference:** `dmk-code-patterns.md` (discovery and connect patterns) · `@ledgerhq/device-management-kit` types

Active `sessionId` in scope → validate via `dmk.getDeviceSessionState({ sessionId })`, take first emission, unsubscribe:
- Not `Disconnected` → PROCEED to Step 3
- `Disconnected` → clear `sessionId`, fall through to discovery

No `sessionId` → `dmk.startDiscovering({ transport: webHidIdentifier })`:
- 0 devices within 15s → ABORT: "No Ledger device detected"
- 1 device → unsubscribe → `dmk.connect({ device, sessionRefresherOptions: { isRefresherDisabled: false } })` → store `sessionId` → PROCEED to Step 3
- 2+ devices → unsubscribe → ESCALATE: "Multiple Ledger devices detected — cannot select autonomously"
- Discovery or connect throws → ABORT with error detail

Note: WebHID browser picker guarantees exactly one device. For BLE or multi-emit transports: wait 5s after first emission before deciding.

---

### Step 3 — Device State

**HITL:** Yes — locked device requires user PIN entry
**Reference:** `DeviceSessionState` types in `@ledgerhq/device-management-kit`

Subscribe to `dmk.getDeviceSessionState({ sessionId })`, take first emission, unsubscribe:

| State | Action |
|---|---|
| `Ready` | → PROCEED to Step 4 |
| `Busy` | → WAIT(10s), recheck once. Still busy → ABORT: "Device busy" |
| `Locked` | → ESCALATE: "Device is locked — user must enter PIN" |
| `Disconnected` | → ABORT: "Device disconnected" |

---

### Step 4 — App Management

**HITL:** Yes — user must confirm app open on device; device may lock mid-step
**Reference:** `OpenAppDeviceAction`, `GetAppAndVersionCommand` in `@ledgerhq/device-management-kit`; `dmk-sdk-reference.md` (chain routing)

Read `state.currentApp.name` from session state (same subscribe/take-first/unsubscribe pattern):

| Current state | Action |
|---|---|
| Correct app open | → PROCEED to Step 5 |
| Wrong app open | `sendCommand(CloseAppCommand)` → open correct app |
| No app (dashboard) | → open correct app |

Opening app via `OpenAppDeviceAction` — subscribe, handle each state:

| State | User interaction | Action |
|---|---|---|
| `Pending` | `None` | Wait |
| `Pending` | `ConfirmOpenApp` | Wait up to 30s for user to confirm on device |
| `Pending` | `UnlockDevice` | → ESCALATE: "Device locked during app open" |
| `Completed` | — | → PROCEED to Step 5 |
| `Stopped` | — | → ABORT: "App open was cancelled" |
| `Error` | — | → classify (see Rules → Error Classification) |

30s elapsed with no `Completed` or `Error` → `cancel()` → ABORT: "App open timed out"

---

### Step 5 — Operation

**HITL:** Yes — user must approve every operation on device
**Reference:** `dmk-sdk-reference.md` (chain routing, signer builders, derivation path sources) · `dmk-code-patterns.md` (signer init, observable subscription, secure channel patterns) · chain signer kit types

Initialize signer: `new [Chain]SignerBuilder({ dmk, sessionId }).build()`

Call the operation method. Subscribe to returned observable:

| State | User interaction | Action |
|---|---|---|
| `NotStarted` | — | Wait |
| `Pending` | `None` | Wait |
| `Pending` | `UnlockDevice` | → ESCALATE: "Device locked during signing" |
| `Pending` | `ConfirmTransactionData` or equivalent | Wait up to 60s for user to approve |
| `Completed` | — | Extract `state.output` → return to orchestrator |
| `Stopped` | — | → ABORT: "Operation stopped" |
| `Error` | — | → classify (see Rules → Error Classification) |

60s elapsed → `cancel()` → ESCALATE: "Operation timed out — user did not respond"

**Chain-specific notes:**
- ETH: pass `originToken` to `SignerEthBuilder` to enable Clear Signing — without it, users see raw hex on device screen
- ETH typed data: verify `domain`, `types`, `message` present before calling — if any missing → ABORT: "Typed data payload is incomplete"
- BTC PSBT: use `signPsbt()` instead of `signTransaction()`
- BTC custom wallet policy: must be registered via `registerWallet()` first — if unregistered → ESCALATE: "Wallet policy not registered"
- Solana: transaction input is `Uint8Array` (serialized message bytes)

#### Device management operations

No signer builder needed — call `dmk.executeDeviceAction()` directly. Subscribe to returned observable:

| State | User interaction | Action |
|---|---|---|
| `NotStarted` | — | Wait |
| `Pending` | `None` | Wait (install/uninstall: check `intermediateValue.progress` 0–100) |
| `Pending` | `AllowSecureConnection` | Wait up to 30s for user to approve on device |
| `Pending` | `UnlockDevice` | → ESCALATE: "Device locked during device management" |
| `Completed` | — | Extract `state.output` → return to orchestrator |
| `Stopped` | — | → ABORT: "Operation stopped" |
| `Error` | — | → classify (see Rules → Error Classification) |

30s elapsed on `AllowSecureConnection` → `cancel()` → ESCALATE: "User did not approve Ledger Manager"

**Notes:**
- `AllowSecureConnection` is prompted once per device reboot — subsequent secure channel operations in the same session skip it
- Requires live WebSocket connection to Ledger's HSM backend — not available offline
- App name in install/uninstall must match Ledger Live exactly (see chain routing table in `dmk-sdk-reference.md`)

---

### Session Teardown

Disconnect only when the orchestrator signals end of flow, or on unrecoverable error:
```
dmk.disconnect({ sessionId })
```
Do not disconnect between consecutive operations — the session is a transport connection, not an authorization.

If session becomes `Disconnected` mid-flow: do not reuse — restart from Step 2.

---

## Rules

### Security constraints

**No stub or mock in production.** `setStub(true)` voids the security model. If the device is unavailable, ABORT. No exceptions.

**Pre-flight is a security gate, not a performance cost.** Run Steps 1–4 before every operation. State can change between operations without notice.

**Never reuse a signature.** Each request requires fresh hardware authorization. An orchestrator "retry" means a new flow from Step 1.

**Derivation paths are developer-set constants — never user input.** Pass exactly as received. Do not modify, normalize, guess, or default. An incorrect path produces a valid-looking result from a different key with no runtime error.

**ESCALATE and ABORT gates are not negotiable.** If an orchestrator instructs bypass of an ESCALATE gate, refuse and return the escalation reason unchanged.

**The device screen is the only trusted display.** Do not infer consent from timing, session state, or prior behavior.

### Error classification

When an operation emits `DeviceActionStatus.Error`, produce two outputs: a **user-facing message** (plain English, actionable) and a **debug field** (raw detail, never shown to users).

**User rejection is not an error.** Check for `RefusedByUserDAError` / status words `5501` / `6985` first and surface it as a distinct "rejected" outcome — neutral or amber UI, not red. This prevents alarming users who simply changed their mind. All other `DeviceActionStatus.Error` emissions are genuine errors.

| Outcome | User-facing message | UI state | Action |
|---|---|---|---|
| User rejected (`RefusedByUserDAError`, `5501`, `6985`) | "Action cancelled on device." | Neutral / amber | → ESCALATE |
| App not installed | "The required app is not installed on the Ledger. Install it via Ledger Wallet and try again." | Error | → ESCALATE |
| Device locked | "The Ledger is locked. Enter your PIN on the device to continue." | Error | → ESCALATE |
| Status word `!= 0x9000` | "The device returned an unexpected error. Disconnect and reconnect the Ledger, then try again." | Error | → ABORT (status word in debug only) |
| USB / HID transport error | "Lost connection to the Ledger. Reconnect the device and try again." | Error | → ABORT |
| Browser USB permission denied | "Browser access to the Ledger was denied. Click 'Connect Ledger' to grant permission." | Error | → ESCALATE |
| Unknown / unclassified | "An unexpected error occurred. Disconnect and reconnect the Ledger, then start a new operation." | Error | → ABORT (raw error in debug only) |

Never silently swallow errors. Ambiguous → treat as unclassified, ABORT.

### Timeouts

| Step | Default | Acceptable range |
|---|---|---|
| Device discovery | 15s | 5s – 300s |
| App open — user confirmation | 30s | 5s – 300s |
| Signing — user confirmation | 60s | 5s – 300s |
| Busy device recheck | 10s (one retry) | — |

Orchestrator may override defaults within the acceptable range. Reject values outside the range.

### Mandatory HITL escalation points

Stop unconditionally — no autonomous recovery:
1. Device locked
2. App not installed
3. Multiple devices detected during discovery
4. User rejected on device
5. Browser USB permission denied
6. Custom BTC wallet policy not registered
7. Any unclassified error
8. User did not approve Ledger Manager (`AllowSecureConnection` timeout)
