# Manifest Reference

---

## Required fields

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier for the Live App. Kebab-case. Must not conflict with existing entries. |
| `name` | `string` | Display name shown in Ledger Wallet Discover. |
| `url` | `string \| URL` | The URL Ledger Wallet loads in the webview. For dApp browser v3: your dApp's URL directly. |
| `homepageUrl` | `string` | Public homepage of the dApp. Displayed in Ledger Wallet. |
| `platforms` | `AppPlatform[]` | Target platforms. Valid values: `"ios"`, `"android"`, `"desktop"`. Use all three for maximum reach. |
| `apiVersion` | `string` | Wallet API version supported. Use `"^2.0.0"` for all new integrations. |
| `manifestVersion` | `string` | Manifest schema version. Use `"2"` for dApp browser v3. |
| `branch` | `AppBranch` | Deployment branch. Developers use two values: `"stable"` for production, `"debug"` for local testing (visible to users with Developer mode enabled — do not ship to production). `"experimental"` (visible with Developer mode) and `"soon"` (may appear as a disabled entry in Discover — verify with Ledger) are set by Ledger's internal team; do not instruct developers to use them. |
| `permissions` | `string[]` | Must be `[]` for dApp browser v3. All EVM interactions go through the injected `window.ethereum` provider — the wallet-api permission system does not apply to this integration path. |
| `domains` | `string[]` | Allowed domains for the webview. Use `["https://"]` for production. For local dev with `http://localhost`, use `["http://", "https://"]`. |
| `categories` | `string[]` | Categorisation for Discover section (e.g. `["defi"]`, `["staking"]`, `["nft"]`). |
| `currencies` | `string[] \| "*"` | Currency identifiers the dApp operates on. Must match the `currency` values in `dapp.networks`. Use `"*"` only if the dApp is genuinely currency-agnostic. |
| `visibility` | `Visibility` | Controls where the app appears. `"complete"`: full listing. `"searchable"`: search only. `"deep"`: deep-link only. Use `"complete"` for standard Discover entries. |
| `content` | `object` | Localised copy for Discover. Must include `shortDescription` and `description`, each with at least `{ "en": "..." }`. |

---

## Optional fields

| Field | Type | Description |
|---|---|---|
| `author` | `string` | Author or team name. |
| `private` | `boolean` | If `true`, the app is not publicly listed. Used for internal testing. |
| `cacheBustingId` | `number` | Increment to force cache invalidation of the app in Ledger Wallet. |
| `nocache` | `boolean` | Disable Ledger Wallet caching for the webview. Useful during development. |
| `supportUrl` | `string` | Support URL displayed in Ledger Wallet. |
| `icon` | `string \| null` | URL to the icon displayed in Discover. Must be hosted on a publicly accessible CDN. For production, Ledger migrates icons to the Ledger CDN. |
| `highlight` | `boolean` | If `true`, the app may be featured in a prominent position in Discover. Set by Ledger. |
| `featureFlags` | `string[] \| "*"` | Restricts visibility to users with specific Ledger Wallet feature flags active. |
| `storage` | `string[]` | Storage key namespaces the app is allowed to use via `storage.get` / `storage.set`. |

---

## The `dapp` field (dApp browser v3)

Use `dapp` for all dApp browser v3 integrations. Do not use the legacy `params.dappUrl` pattern.

```ts
dapp?: {
  provider: "evm";        // only supported value
  nanoApp: string;        // Ledger device app for clear signing (e.g. "Ethereum", "1inch")
  networks: Array<{
    currency: string;     // Ledger currency identifier (e.g. "ethereum", "polygon")
    chainID: number;      // EVM chain ID
    nodeURL?: string;     // RPC endpoint — omit in production; Ledger sets this
  }>;
  dependencies?: string[]; // other nanoApps needed (e.g. plugins for contract decoding)
}
```

**`nanoApp`**: The Ledger device app used during the signing flow. Required — do not omit.

- If a **dedicated plugin** exists for your dApp (e.g. `"1inch"`, `"Uniswap"`), use it.
- If your contracts have an **ERC-7730 descriptor** merged into the [`clear-signing-erc7730-registry`](https://github.com/ethereum/clear-signing-erc7730-registry), set `nanoApp` to `"Ethereum"`. The Ethereum app will load the descriptor from the CAL and display human-readable signing screens — no dedicated plugin needed. This is the recommended path for new integrations.
- If **neither** applies, set `nanoApp` to `"Ethereum"` and disclose blind signing in your PR. Consider submitting an ERC-7730 descriptor in parallel.

**`dependencies`**: Use when your dApp routes through multiple protocols that each have their own Ledger plugin (e.g. a DEX aggregator using `"Paraswap"` and `"Squid"` under the hood).

### Supported EVM chains

Only list networks the dApp actually supports. Mirror each `currency` in the top-level `currencies` array.

| Chain | `currency` value | `chainID` |
|---|---|---|
| Ethereum Mainnet | `"ethereum"` | `1` |
| BNB Smart Chain | `"bsc"` | `56` |
| Polygon | `"polygon"` | `137` |
| Arbitrum | `"arbitrum"` | `42161` |
| Optimism | `"optimism"` | `10` |
| Base | `"base"` | `8453` |
| Fantom | `"fantom"` | `250` |

---

## `content` object

```json
"content": {
  "shortDescription": {
    "en": "One sentence. Shown in card views."
  },
  "description": {
    "en": "Full description. Shown in the app detail page."
  },
  "subtitle": {
    "en": "Optional. Shown as a subtitle in some views."
  },
  "cta": {
    "en": "Optional. Call-to-action button label."
  }
}
```

---

## Examples

### Multi-network

Add each chain to `dapp.networks` and mirror the currency identifiers in the top-level `currencies` array:

```json
"currencies": ["ethereum", "polygon", "arbitrum"],
"dapp": {
  "provider": "evm",
  "nanoApp": "Ethereum",
  "networks": [
    { "currency": "ethereum", "chainID": 1 },
    { "currency": "polygon", "chainID": 137 },
    { "currency": "arbitrum", "chainID": 42161 }
  ]
}
```

### dApp aggregator with dependencies

```json
"dapp": {
  "provider": "evm",
  "nanoApp": "1inch",
  "dependencies": ["Paraswap", "Squid"],
  "networks": [
    { "currency": "ethereum", "chainID": 1 },
    { "currency": "bsc", "chainID": 56 }
  ]
}
```

`nanoApp` is the primary app. `dependencies` lists plugins Ledger Wallet may need to load to decode contract calls during the signing flow.

### Local testing manifest

For local development only — never submit this:

```json
{
  "id": "your-dapp-id-debug",
  "name": "Your dApp (dev)",
  "url": "http://localhost:3000",
  "homepageUrl": "http://localhost:3000",
  "platforms": ["desktop"],
  "apiVersion": "^2.0.0",
  "manifestVersion": "2",
  "branch": "debug",
  "categories": ["defi"],
  "currencies": ["ethereum"],
  "visibility": "complete",
  "permissions": [],
  "domains": ["http://", "https://"],
  "dapp": {
    "provider": "evm",
    "nanoApp": "Ethereum",
    "networks": [
      { "currency": "ethereum", "chainID": 1, "nodeURL": "https://eth.public-rpc.com" }
    ]
  },
  "content": {
    "shortDescription": { "en": "Local dev build." },
    "description": { "en": "Local dev build." }
  }
}
```

Load via: **Ledger Wallet Desktop → Settings → Developer → Load Platform Manifest**.

**Switch `branch` to `"stable"`, remove `nodeURL`, and use a production `url` before submitting.**

---

## Submission checklist

Before opening a PR:

- [ ] `manifestVersion` is `"2"`
- [ ] `branch` is `"stable"`
- [ ] `url` is a production HTTPS URL
- [ ] No `nodeURL` values in `dapp.networks`
- [ ] `nanoApp` is present and correct
- [ ] All entries in `currencies` have a matching entry in `dapp.networks`
- [ ] `permissions` is `[]` — not copied from a wallet-api example
- [ ] `content.shortDescription` and `content.description` are filled in English
- [ ] `icon` is hosted on a publicly accessible CDN
- [ ] Local testing completed with a real Ledger device — full signing flow confirmed
- [ ] If `nanoApp` is `"Ethereum"`: confirm an ERC-7730 descriptor exists in the clear-signing registry for your contracts, OR explicitly disclose blind signing in the PR description
