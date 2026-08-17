# PrivatePrompt Guard

**By AI4Context** — private second look before you send prompts to ChatGPT, Claude, or Gemini. Flags emails, IBANs, API keys and similar patterns **on your device**.

> Product name: **PrivatePrompt Guard**  
> Repo folder: `code-PrivatePromtGuard` (matches GitHub `PrivatePromtGuard`)

## Features (v0.1.3)

- Intercepts Send / Enter on supported AI sites
- Deterministic detectors (email, phone, DNI/NIE, IBAN, Luhn cards, JWT, common API keys, PEM, `password=`-style assignments)
- Optional Gemini Nano assist when Chrome Prompt API is available
- Overlay: Review · Anonymize & paste · Send anyway · Cancel
- Sensitivity: strict / balanced / relaxed
- Floating panel (header, language selector, footer) like the rest of the AI4Context family
- UI EN/ES · no AI4Context backend for prompt text

- Intercepts Send / Enter on supported AI sites
- Deterministic detectors (email, phone, DNI/NIE, IBAN, Luhn cards, JWT, common API keys, PEM, `password=`-style assignments)
- Optional Gemini Nano assist when Chrome Prompt API is available
- Overlay: Review · Anonymize & paste · Send anyway · Cancel
- Sensitivity: strict / balanced / relaxed
- UI EN/ES · no AI4Context backend for prompt text

## Develop

```bash
cd C:\code-PrivatePromtGuard
npm install
npm test
npm run build
```

Load unpacked in Chrome: `apps/extension/dist`  
Click the toolbar icon to open the floating panel (not a popup).

```bash
npm run pack   # → releases/PrivatePromptGuard-v0.1.3.zip
```

## Privacy

- [Spanish](apps/extension/public/privacy.html) · [English](apps/extension/public/privacy-en.html)

## Plan

See [docs/plan-implementacion.md](docs/plan-implementacion.md).

## Disclaimer

Not enterprise DLP. May miss secrets. You decide whether to send.
