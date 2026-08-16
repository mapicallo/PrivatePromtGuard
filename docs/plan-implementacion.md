# PrivatePrompt Guard â€” Plan de implementaciÃ³n

**Fecha:** 2026-08-16  
**Estado:** planificaciÃ³n (pendiente repo)  
**Nombre CWS propuesto:** **PrivatePrompt Guard**  
**Slug / repo tentativo:** `private-prompt-guard` / `PrivatePromptGuard`  
**Marca:** By AI4Context  
**Workspace previsto:** `C:\code-PrivatePromptGuard\` (crear al arrancar)  
**Referencia en ecosystem:** trust (junto a Monitor your AI, AITokenMeter, Is this site safe)

---

## 1. Objetivo

Dar al usuario una **segunda mirada privada** justo antes de enviar un prompt a una IA cloud (ChatGPT, Claude, Gemini web), detectando datos sensibles **en el dispositivo**.

- Sin DLP empresarial â€œinfalibleâ€
- Sin subir el texto del prompt a servidores de AI4Context
- Sin leer conversaciones en segundo plano de forma continua
- SÃ­: aviso claro + opciones Revisar / Anonimizar / Enviar igualmente

**Promesa de producto (una frase):**  
Â«Una segunda mirada privada antes de enviar informaciÃ³n a una IA.Â»

**No promete:** cumplimiento normativo (GDPR/SOC2), bloqueo absoluto, detecciÃ³n 100 % de secretos, ni sustituir polÃ­ticas corporativas.

---

## 2. Problema y usuario

| QuiÃ©n | SituaciÃ³n |
|-------|-----------|
| Profesionales / freelancers | Pegan emails, nombres de cliente, importes, contratos en ChatGPT/Claude |
| Devs | Pegan API keys, JWT, `.env`, logs con PII |
| Usuarios conscientes de privacidad | Quieren un freno local, no otra IA cloud |

**Por quÃ© Nano / local:** comprobar si algo es confidencial **enviÃ¡ndolo a otra IA cloud** contradice el producto. Reglas deterministas + Gemini Nano en dispositivo.

---

## 3. Alcance MVP vs fuera

### MVP (v0.1) â€” sÃ­

1. Content script **solo** en hosts de IA permitidos (allowlist).
2. DetecciÃ³n **antes de enviar** (interceptar Enter / botÃ³n Send en el composer).
3. Motor **determinista** (regex + heurÃ­sticas) para:
   - Emails, telÃ©fonos (ES/intl bÃ¡sico)
   - DNI/NIE/NIF (formato ES), IBAN (ES + genÃ©rico)
   - Tarjetas (Luhn), JWT, claves `sk-` / `AIza` / `ghp_` / `Bearer â€¦`
   - Posibles secretos tipo `password=`, `api_key=`, PEM privados
4. Overlay modal: hallazgos + acciones.
5. **Anonimizar** MVP: sustituir por placeholders (`[EMAIL]`, `[IBAN]`, `[API_KEY]`, â€¦) y dejar el texto editado en el composer.
6. Preferencias locales: on/off, umbral (estricto / equilibrado), â€œno avisar de nuevo en esta pestaÃ±aâ€ (sesiÃ³n).
7. UI EN/ES; privacy.html; sin backend AI4Context.
8. Gemini Nano **opcional** (si Prompt API disponible): clasificar fragmentos dudosos (â€œparece dato contractualâ€) sin sustituir reglas.

### Fuera de MVP (v0.2+)

- AnonimizaciÃ³n semÃ¡ntica avanzada (nombres propios, empresas) solo con Nano
- PolÃ­ticas por dominio / listas blancas de tÃ©rminos
- Historial de hallazgos (opt-in, local, export JSON)
- Soporte Grok / Perplexity / Copilot web
- Edge Add-ons (tras CWS estable)
- Bloqueo duro sin â€œEnviar igualmenteâ€
- IntegraciÃ³n con Monitor your AI / AITokenMeter (deep links)

---

## 4. Nombre y ficha CWS

| Campo | Propuesta |
|-------|-----------|
| Nombre | PrivatePrompt Guard |
| Short description (â‰¤132) | Private second look before you send prompts to ChatGPT, Claude, or Gemini. Flags emails, IBANs, keysâ€”on your device. |
| CategorÃ­a | Productivity / Privacy tools |
| Keyword spam | Evitar listas largas de marcas en el overview; mencionar hosts en â€œHow it worksâ€ con moderaciÃ³n |

**Expectativas en ficha + UI:**  
Â«May miss some secrets. Not enterprise DLP. You decide whether to send.Â»

---

## 5. Arquitectura

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ChatGPT / Claude / Gemini  â”‚  (pestaÃ±a)
â”‚  content script (isolated)  â”‚
â”‚  - lee composer (DOM)       â”‚
â”‚  - intercepta submit        â”‚
â”‚  - muestra overlay          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚ chrome.runtime.sendMessage
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  service worker             â”‚
â”‚  - preferencias             â”‚
â”‚  - telemetrÃ­a local (conteosâ”‚
â”‚    sin texto) opcional      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
               â”‚
               â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  panel / options (popup)    â”‚
â”‚  - on/off, sensibilidad     â”‚
â”‚  - hosts activos            â”‚
â”‚  - enlace privacy           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

lib/detect/     reglas deterministas
lib/redact/     placeholders
lib/nano/       Prompt API (opcional)
lib/hosts/      allowlist + selectores DOM por proveedor
```

**Permisos MVP**

| Permiso | Motivo |
|---------|--------|
| `storage` | Preferencias |
| `host_permissions` **solo** dominios IA | Leer composer en esas pestaÃ±as |
| Sin `tabs` amplio, sin `webRequest`, sin `<all_urls>` | Menos fricciÃ³n CWS / confianza |

**Hosts iniciales (ajustables)**

- `https://chatgpt.com/*`, `https://chat.openai.com/*`
- `https://claude.ai/*`
- `https://gemini.google.com/*`

---

## 6. Flujo UX

### 6.1 Happy path con hallazgos

1. Usuario escribe / pega en el composer.
2. Pulsa Enviar o Ctrl/Cmd+Enter.
3. ExtensiÃ³n **pausa** el envÃ­o.
4. Overlay:

```
PrivatePrompt Guard Â· By AI4Context

Posible informaciÃ³n sensible (N)
â€¢ Email â€” mapic@â€¦
â€¢ IBAN â€” ES91â€¢â€¢â€¢â€¢
â€¢ Posible API key â€” sk-â€¢â€¢â€¢â€¢

[ Revisar en el cuadro ]  [ Anonimizar y pegar ]
[ Enviar igualmente ]     [ Cancelar ]
```

5. **Anonimizar:** aplica redact en el textarea y cierra overlay (usuario envÃ­a otra vez o auto-envÃ­a tras redact â€” decidir en implementaciÃ³n; recomendaciÃ³n MVP: **rellenar composer y no auto-enviar**).
6. **Enviar igualmente:** un solo bypass para ese submit; no desactiva la extensiÃ³n.

### 6.2 Sin hallazgos

EnvÃ­o normal, sin overlay (latencia &lt; ~30 ms objetivo con solo reglas).

### 6.3 Nano no disponible

Solo reglas; badge sutil en overlay: Â«DetecciÃ³n bÃ¡sica (IA local no disponible)Â».

### 6.4 ExtensiÃ³n desactivada

Bypass total; popup muestra toggle off.

---

## 7. Motor de detecciÃ³n

### 7.1 Capas

| Capa | QuÃ© hace | Obligatorio MVP |
|------|----------|-----------------|
| A â€” Regex / validadores | Email, IBAN, Luhn, JWT shape, secret prefixes | SÃ­ |
| B â€” HeurÃ­sticas de contexto | `password:`, `cliente:`, lÃ­neas `.env` | SÃ­ |
| C â€” Nano (Prompt API) | JSON: `{ findings: [{ span, type, confidence }] }` sobre chunks &lt; N chars | Opcional |
| D â€” DeduplicaciÃ³n | Fusionar solapes; priorizar tipo mÃ¡s especÃ­fico | SÃ­ |

### 7.2 Severidad (UI)

| Nivel | Ejemplos | Default UX |
|-------|----------|------------|
| Alto | API key, JWT, PEM, tarjeta Luhn | Siempre overlay |
| Medio | IBAN, DNI, email+nombre en misma lÃ­nea | Overlay en modo equilibrado/estricto |
| Bajo | Email suelto, telÃ©fono | Solo modo estricto (configurable) |

### 7.3 Contrato Nano (cuando exista)

- Input: texto del composer (truncado / chunked), **nunca** a red.
- Output schema estricto (`responseConstraint` si disponible).
- Timeout corto (p. ej. 800â€“1500 ms); si falla â†’ solo capas A+B.
- No bloquear el UI: mostrar â€œAnalizandoâ€¦â€ mÃ¡ximo X ms, luego reglas.

---

## 8. Selectores DOM (riesgo tÃ©cnico principal)

Los composers de ChatGPT/Claude/Gemini cambian a menudo.

**Estrategia**

1. MÃ³dulo `hosts/<provider>.ts` con:
   - `matchHost`
   - `getComposerText()`
   - `setComposerText(text)`
   - `bindSubmitIntercept(handler)`
2. Tests manuales por proveedor en checklist de release.
3. Fallback: si no se encuentra composer â†’ no interceptar; badge â€œinactivo en esta pÃ¡ginaâ€ en popup.
4. Versionar selectores; documentar roturas en CHANGELOG.

**Fase 0 del cÃ³digo:** spike de 1â€“2 dÃ­as solo selectores + intercept en los 3 hosts, sin Nano.

---

## 9. Fases de implementaciÃ³n

### Fase 0 â€” Spike (1â€“2 dÃ­as)

- Repo MV3 + Vite/TS (mismo patrÃ³n que LocalChat / AITokenMeter si aplica)
- Content script mÃ­nimo en un host (p. ej. ChatGPT)
- Intercept submit + leer/escribir texto
- Criterio de salida: demo â€œpausa + alertâ€ sin detecciÃ³n real

### Fase 1 â€” DetecciÃ³n determinista (2â€“3 dÃ­as)

- LibrerÃ­a `detect` + tests unitarios (fixtures con/sin PII)
- Overlay UI (HTML/CSS aislado, shadow DOM recomendado)
- Acciones Revisar / Anonimizar / Enviar / Cancelar
- Preferencias on/off + sensibilidad

### Fase 2 â€” Tres proveedores + i18n (2 dÃ­as)

- Claude + Gemini
- EN/ES
- Privacy policy local
- Iconos / popup opciones

### Fase 3 â€” Nano opcional (2â€“3 dÃ­as)

- Feature-detect Prompt API
- ClasificaciÃ³n semÃ¡ntica de fragmentos no cubiertos por regex
- DegradaciÃ³n elegante

### Fase 4 â€” Empaquetado tienda (1â€“2 dÃ­as)

- Capturas 1280Ã—800
- Store listing EN (y ES en descripciÃ³n larga si cabe)
- Privacy disclosures CWS
- Zip release `PrivatePromptGuard-v0.1.0.zip`

### Fase 5 â€” Landing AI4Context (0.5â€“1 dÃ­a)

- Entrada en `storeUrls.ts` (chrome cuando aprueben)
- Traducciones portal + categorÃ­a trust
- Icono / pantallazos en `landing/public/images/extensions/â€¦`

**EstimaciÃ³n total MVP usable:** ~8â€“12 dÃ­as de trabajo enfocado (una persona).

---

## 10. Estructura de repo sugerida

```
PrivatePromptGuard/
  apps/extension/
    manifest.json
    src/
      background/sw.ts
      content/main.ts
      content/overlay.ts
      hosts/chatgpt.ts
      hosts/claude.ts
      hosts/gemini.ts
      lib/detect/index.ts
      lib/detect/patterns.ts
      lib/redact.ts
      lib/nano.ts
      popup/
      options/
    privacy.html
    privacy-en.html
  docs/
    plan-implementacion.md   â† copia viva de este plan
  package.json
  README.md
```

---

## 11. Privacidad y CWS (checklist)

- [ ] No se envÃ­a contenido del prompt a AI4Context
- [ ] Host permissions limitados a sitios de IA
- [ ] Sin telemetrÃ­a remota en MVP (si hay contadores, solo `chrome.storage.local`, sin texto)
- [ ] Privacy: explicar allowlist, quÃ© se lee (solo composer al enviar), opt-out
- [ ] Copy: â€œnot enterprise DLPâ€
- [ ] Anonimizar no garantiza irreversibilidad frente a adversarios
- [ ] Cumplir polÃ­ticas CWS sobre â€œsecurity / privacyâ€ extensions (no exagerar)

---

## 12. Criterios de aceptaciÃ³n MVP

1. En ChatGPT, pegar un texto con email + `sk-â€¦` + IBAN ES â†’ overlay con â‰¥2 hallazgos correctos.
2. Anonimizar sustituye y deja el composer editable; un segundo envÃ­o limpio no vuelve a avisar por esos placeholders.
3. â€œEnviar igualmenteâ€ envÃ­a el texto original una vez.
4. Toggle off â†’ ningÃºn intercept.
5. En una web no-IA â†’ sin content script activo (o inerte).
6. Sin `RESEND` / sin llamadas de red propias al analizar.
7. Si Nano falta, el flujo A+B sigue funcionando.

---

## 13. Riesgos y mitigaciones

| Riesgo | MitigaciÃ³n |
|--------|------------|
| DOM de ChatGPT rompe selectores | MÃ³dulos por host + checklist release + fallback inactivo |
| Falsos positivos molestos | Niveles de sensibilidad; â€œEnviar igualmenteâ€; no auto-bloquear sin overlay |
| Falsos negativos (secretos raros) | Copy honesto; ampliar patrones en v0.2; Nano como ayuda, no garantÃ­a |
| Review CWS (keyword / security claims) | Overview sobrio; sin â€œbank-gradeâ€ / â€œGDPR compliantâ€ |
| Solape con Monitor your AI | Messaging distinto: Guard = contenido del prompt; Monitor = metadatos de red |
| Usuario confunde con antivirus | Naming + short description centrados en *prompts a IA* |

---

## 14. RelaciÃ³n con el ecosistema

| ExtensiÃ³n | RelaciÃ³n |
|-----------|----------|
| Monitor your AI | Complementaria: red vs contenido |
| AITokenMeter | Misma audiencia; posible menciÃ³n cruzada en â€œtambiÃ©n te puede interesarâ€ |
| Create my AI Context | Upstream: reduce PII al compactar contexto (otro momento del flujo) |
| LocalChat | Alternativa: no enviar a cloud; Guard asume que sÃ­ usarÃ¡n cloud |

**Posicionamiento conjunto (landing):**  
Â«Usa IA cloud con mÃ¡s cuidado: mide tokens, audita red, y revisa el prompt antes de enviar.Â»

---

## 15. Orden de trabajo inmediato (cuando digas â€œarrancaâ€)

1. Crear repo `PrivatePromptGuard` + scaffold MV3/TS.  
2. Fase 0 spike ChatGPT.  
3. Fase 1 detect + overlay.  
4. Claude/Gemini + privacy + i18n.  
5. Nano opcional.  
6. Assets + submit CWS.  
7. Enlazar en `ai4context.com` al aprobar.

---

## 16. Decisiones abiertas (cerrar en kickoff)

1. Â¿Auto-enviar tras anonimizar o solo rellenar composer? â†’ **RecomendaciÃ³n: solo rellenar.**  
2. Â¿Nombre final CWS exacto con/sin â€œPrivateâ€?** â†’ RecomendaciÃ³n: mantener PrivatePrompt Guard.  
3. Â¿Incluir Perplexity/Copilot en v0.1?** â†’ RecomendaciÃ³n: no.  
4. Â¿Contadores locales de â€œavisos mostradosâ€ (sin texto)? â†’ Opcional v0.1.1.  
5. Â¿Shadow DOM obligatorio para overlay?** â†’ RecomendaciÃ³n: sÃ­.

---

*Documento espejo en code-rag-java. Cuando exista el repo de la extensiÃ³n, la copia viva deberÃ­a vivir en `PrivatePromptGuard/docs/plan-implementacion.md`.*

