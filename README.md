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
https://sbx-institutional.tran-sika.com
```

- Live requests use `/v1`.
- Sandbox requests use `/sandbox/v1`.

Do not commit API keys or other credentials. Use example values such as `txk_test_REPLACE_ME` in documentation.

## Content scope

This site documents the merchant-facing API only. Internal operations endpoints, dashboard authentication flows, provider callbacks, and implementation details are outside its public scope.
