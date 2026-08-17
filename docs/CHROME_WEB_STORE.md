# Chrome Web Store — submit checklist (v0.1.4)

**Zip (upload this file):**  
`C:\code-PrivatePromtGuard\releases\PrivatePromptGuard-v0.1.4.zip`

Copy also at:  
`C:\code-PrivatePromtGuard\apps\extension\PrivatePromptGuard-v0.1.4.zip`

Rebuild: `cd C:\code-PrivatePromtGuard && npm run pack`

---

## Dashboard fields (paste)

**Name:** PrivatePrompt Guard

**Short description (≤132):**  
Private second look before you send prompts to ChatGPT, Claude, or Gemini. Flags emails, IBANs, keys—on your device.

**Category:** Productivity

**Language:** English (add Spanish in description if the form allows)

**Official URL:** https://www.ai4context.com

**Support URL:** https://www.ai4context.com/#contact

**Privacy policy URL:**  
https://github.com/mapicallo/PrivatePromtGuard/blob/main/apps/extension/public/privacy-en.html

(Until a landing page exists; you can later switch to ai4context.com.)

---

## Detailed description

PrivatePrompt Guard gives you a private second look before you send a prompt to a cloud AI chat in the browser.

When you press Send on a supported site, the extension checks the text in the message box on your device. If it finds patterns that often mean sensitive data—ID numbers, IBANs, card-like numbers, common API key shapes, JWTs, private key blocks, or password-style assignments—it pauses and shows a warning.

You can review the draft, anonymize matches with placeholders, send anyway once, or cancel. Prompt text is not uploaded to AI4Context servers.

Optional: if Chrome’s on-device Gemini Nano (Prompt API) is available, it can help flag extra fragments. If Nano is not available, rule-based detection still works.

Sensitivity: strict, balanced (default), relaxed, or custom (choose which types to flag). Interface in English and Spanish. Floating panel: drag, resize, language selector.

Not enterprise DLP. May miss secrets. You decide whether to send.

By AI4Context.

---

## Single purpose

Warn the user about likely sensitive patterns in the message box before sending a prompt on allowlisted AI chat sites. All checks run on the device.

---

## Permission justifications

**storage**  
Save enabled/disabled, sensitivity, custom types, language, and Nano assist on this device.

**activeTab**  
Used when you click the toolbar icon so the panel can note the tab you opened it from.

**tabs**  
Used only to show whether the last normal browser tab is a supported AI site (status + “Refresh active tab”). The extension does not inject into arbitrary websites.

**Host permissions (ChatGPT, Claude, Gemini web)**  
Required to read the message composer and intercept Send on those pages only. No other sites.

---

## Privacy practices (CWS form)

- Not sold to third parties  
- Not used or transferred except for the item’s core functionality  
- Not used for creditworthiness  
- **Does not collect user data** (no remote analytics; prompt text stays on device)

---

## Screenshots (1280×800, JPEG/PNG, at least 1, up to 5)

Use the sample prompt (fictional data). Balanced sensitivity. English UI if the listing is EN.

1. Panel on a supported AI tab — green “Ready on supported AI sites”, custom/balanced visible.  
2. ChatGPT composer with the sample prompt + overlay “Possible sensitive information” (drag the overlay aside so the prompt is visible).  
3. Overlay actions: Anonymize & paste / Send anyway.  
4. Panel showing Custom types (optional).

Promo tile 440×280 and marquee 1400×560 are optional for a first listing.

---

## Do not claim

- Enterprise DLP / GDPR certified / 100% detection  
- Background scanning of all tabs  
- Keyword stuffing of extra AI brand names
