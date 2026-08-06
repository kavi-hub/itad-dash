# Security and data-handling rules

This repository contains product code and deliberately sanitised design material. It is not an evidence store.

## Never commit

- Client or contact names, email addresses, phone numbers or locations
- Real serial numbers, IMEIs, asset tags or job references
- Raw Securaze workbooks, reports or live download URLs
- Certificates of Destruction, Waste Transfer Notes or collection records
- Credentials, tokens, private keys or environment files
- Screenshots or exports containing operational evidence

## Allowed samples

Only synthetic or deliberately anonymised fixtures may be committed. A fixture must be recognisable as fictional, contain no reversible identifiers and use the `.fixture.json` or `.fixture.csv` suffix.

## Before committing

1. Search changed files for names, email addresses, URLs and identifier-like strings.
2. Confirm every sample is synthetic or irreversibly anonymised.
3. Confirm no source-report link or API credential is present.
4. Keep operational evidence in approved protected storage.

If exposure is suspected, stop sharing the branch, rotate any exposed secret, preserve the audit trail and notify the repository owner.

