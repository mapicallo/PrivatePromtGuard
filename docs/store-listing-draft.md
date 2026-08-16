# Chrome Web Store listing (draft)

**Name:** PrivatePrompt Guard  
**Short description (≤132):**  
Private second look before you send prompts to ChatGPT, Claude, or Gemini. Flags emails, IBANs, keys—on your device.

**Category:** Productivity  

**Overview (EN draft):**

PrivatePrompt Guard gives you a private second look before you send a prompt to a cloud AI chat in the browser.

When you press Send on supported sites, the extension checks the text in the message box on your device. If it finds patterns that often mean sensitive data—emails, IBANs, card-like numbers, common API key shapes, JWTs, private key blocks, or password-style assignments—it pauses and shows a clear warning.

You can review the draft, anonymize matches with placeholders, send anyway once, or cancel. Nothing in the prompt is uploaded to AI4Context servers.

Optional: if Chrome’s on-device Gemini Nano (Prompt API) is available, it can help flag additional fragments. If Nano is not available, rule-based detection still works.

Sensitivity levels: strict, balanced (default), or relaxed. Interface in English and Spanish.

Not enterprise DLP. May miss secrets. You decide whether to send.

By AI4Context.

**Privacy practice:** Does not collect user data (disclose accordingly). Single purpose: warn before sending prompts on allowlisted AI hosts.
