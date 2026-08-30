# Transika documentation

Mintlify documentation for Transika's merchant API.

## Local development

```bash
npm install
npm run dev
```

Run the documentation checks before opening a pull request:

```bash
npm run validate
npm run check:links
npm run check:a11y
```

## API URL

Transika uses one API origin with environment-specific route prefixes:

```text
https://sbx-institutional-api.tran-sika.com
```

- Live requests use `/v1`.
- Sandbox requests use `/v1/sandbox`.

Do not commit API keys or other credentials. Use example values such as `txk_test_REPLACE_ME` in documentation.

## Architecture PDF

Generate the Institutional system architecture pack (diagrams + writeups):

```bash
node scripts/generate-architecture-pdf.mjs
```

Output: `Transika-System-Architecture.pdf`

## Go-live UAT PDFs

Merchant Dashboard and Ops Admin checklists (shared helpers in `scripts/uat-pdf-kit.mjs`):

```bash
node scripts/generate-uat-golive-pdf.mjs
node scripts/generate-admin-uat-golive-pdf.mjs
```

Outputs: `Transika-Go-Live-UAT.pdf`, `Transika-Admin-Go-Live-UAT.pdf`

## Content scope

This site documents the merchant-facing API only. Internal operations endpoints, dashboard authentication flows, provider callbacks, and implementation details are outside its public scope.
