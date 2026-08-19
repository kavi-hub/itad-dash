# Milestone 01 implementation plan

Status: proposed execution plan for ADR 0002.

## Slice A: secure shell

Deliver:
- Vite React TypeScript application
- Supabase client/server boundaries
- authenticated operator route
- private upload bucket and policies
- synthetic-only development data
- environment template without secrets

Pass when:
- unauthenticated access is denied
- an authorised test operator can upload a synthetic workbook
- another organisation cannot list or retrieve it
- no secret key appears in the browser bundle

## Slice B: schema inspection

Deliver:
- workbook metadata reader
- ordered-heading fingerprint
- recognised mapping registry
- source checksum
- size/type/parser limits
- explicit schema-change findings

Pass when:
- known fixture is recognised
- additive optional field is informational
- renamed required field blocks the affected scope
- unknown sheet/status never maps to success
- formulas and external links are not executed

## Slice C: staged candidates

Deliver:
- lossless source-row staging
- device and storage candidates
- processing-attempt candidates
- evidence-reference candidates
- row-level validation and exceptions

Pass when:
- no canonical table changes
- source and normalised values coexist
- storage remains independent where no host key exists
- every staged candidate points back to source row and import

## Slice D: operator preview

Deliver:
- import summary
- counts for ready, warning and quarantined records
- schema-change alert
- staged asset/storage tables
- exception details
- confirm/import stop conditions

Pass when:
- operator can understand what will happen before commitment
- blocked rows cannot be silently accepted
- independently valid rows remain visible
- client-facing wording is not shown as verified truth prematurely

## Slice E: atomic confirmation

Deliver:
- authority check
- idempotent transactional commit
- canonical provenance
- immutable audit event
- safe retry behaviour

Pass when:
- repeated confirmation creates no duplicates
- failed commit leaves canonical truth unchanged
- concurrent confirmation cannot double-create records
- previous successful imports survive later broken uploads

## Slice F: draft client summary

Deliver:
- derived outcome counts
- asset/storage result register
- evidence-availability state
- draft watermark/status
- exact reconciliation check

Pass when:
- every displayed total reconciles to committed canonical records
- unknown or quarantined outcomes never count as success
- missing evidence remains separate from technical outcome
- the summary cannot be published in Milestone 01

## Test layers

- Unit: normalisation, schema fingerprinting, outcome mapping
- Contract: fixtures against parser output
- Database: constraints, RLS, idempotency and transaction rollback
- Integration: private upload through staged import
- Browser: upload, preview, exception and confirmation flow
- Privacy: log and repository scans

## Stop conditions

Stop implementation and return to the relevant contract when:

- the real export contradicts the accepted mapping
- a secure direct-upload path cannot be proven
- organisation isolation fails
- confirmation cannot be made atomic
- parser behaviour depends on workbook row order
- summary totals cannot reconcile exactly
- operational data appears in repository, fixtures or logs

## Not in Milestone 01

- downstream processor register
- destruction batches
- Certificates of Destruction
- client publication
- gated email delivery
- production retention automation
- billing
