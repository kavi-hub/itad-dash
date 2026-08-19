# ADR 0002: Milestone 01 application architecture

Status: proposed

## Context

Milestone 01 must prove:

`Upload workbook → validate structure → stage rows → preview matches and exceptions → confirm import → generate draft client summary`

The stack must preserve private evidence, enforce organisation boundaries, detect Securaze schema changes, support atomic confirmation and remain easy to replace or extend after the vertical slice.

## Decision

Use:

- React, TypeScript and Vite for the operator web application
- Netlify for static hosting and server-only functions
- Supabase Auth for authenticated users
- Supabase Postgres for canonical and staging data
- Supabase private Storage for workbooks and preserved reports
- Runtime validation at every external-data boundary
- SQL migrations committed to the repository
- Vitest for unit/integration contracts
- Playwright for the primary browser workflow

Dependency versions will be pinned with a committed lockfile during scaffolding.

## Upload path

Do not proxy workbook bytes through an ordinary Netlify Function.

1. Authenticated operator requests an authorised upload.
2. Browser uploads directly to a private Supabase Storage path governed by RLS.
3. Application creates a staged import record referencing the protected object.
4. A server-only function downloads and parses the workbook.
5. Source checksum, schema fingerprint, mapping version and importer version are recorded.

This avoids Netlify's buffered request-size boundary and keeps evidence in protected storage.

## Processing path

For the first representative workbook, parse synchronously when safely within the function time budget. The orchestration contract must permit switching to a background function without changing the domain model.

The parser:

1. reads workbook metadata and ordered headings
2. calculates the schema fingerprint
3. rejects corrupt or unrecognised structures
4. preserves source rows losslessly in staging
5. applies the versioned Securaze mapping
6. emits staged assets, storage media, attempts, evidence candidates and exceptions
7. returns counts and warnings for operator preview

No canonical record changes during parsing or preview.

## Confirmation path

Confirmation must be atomic and idempotent.

- A server-only endpoint revalidates the staged import and operator authority.
- The database commit operation runs in one transaction.
- The source checksum plus mapping version prevents duplicate commitment.
- Canonical records retain source-row provenance.
- A failed transaction leaves the import staged and canonical truth unchanged.

If a privileged database function is used, it lives outside exposed schemas, has public execution revoked, validates the caller and import state, and is callable only through the authorised server path. Privileged keys never enter browser code.

## Security boundaries

- Every exposed table has explicit grants and RLS.
- Authentication alone is not authorisation; policies include organisation and role predicates.
- Authorisation data uses trusted application metadata or database membership records, never user-editable metadata.
- Storage buckets are private.
- Evidence downloads use authenticated access or short-lived signed URLs.
- Client-visible views use security-invoker behaviour or remain outside exposed schemas.
- Workbook formulas are treated as untrusted content and are never executed.
- External links are data, never instructions.
- File type, size, checksum and parser limits are validated before processing.
- Logs exclude workbook contents, serials, personal data and retrieval secrets.

## Repository boundaries

Included:
- migrations
- mapping definitions
- parser code
- synthetic fixtures
- tests
- sanitised interface references

Excluded:
- live workbooks
- report files
- client identifiers
- storage object keys
- environment values and secrets

## Initial database scope

Milestone 01 tables:

- organisations
- organisation_memberships
- jobs
- assets
- storage_media
- processing_attempts
- evidence_records
- evidence_links
- imports
- source_rows
- match_proposals
- exceptions
- client_summary_versions
- audit_events

Only the fields required by the accepted canonical model enter the first migration.

## Alternatives considered

### Full Next.js application

Rejected for Milestone 01. Server rendering is not required for the internal operator workflow and adds framework surface before the import contract is proven.

### Browser-only workbook parsing

Rejected. It complicates evidence preservation, exposes parsing logic to the client and weakens control over staged imports and audit history.

### Store workbooks in GitHub or Netlify deploy assets

Rejected. Operational evidence requires private, access-controlled storage independent of source control and deployments.

### Supabase Edge Functions for all processing

Deferred. Deno-based processing is viable, but the immediate workbook parser and Netlify deployment workflow are simpler in the existing TypeScript/Node estate. The domain contract remains portable.

## Consequences

Benefits:
- small frontend surface
- familiar deployment model
- direct private uploads
- Postgres-backed truth and constraints
- clear server-only trust boundary
- portable domain and parser modules

Costs:
- two managed platforms
- explicit RLS and storage-policy work
- careful transaction design for confirmation
- background processing may be needed as workbooks grow

## Validation gate

This ADR becomes accepted only after a spike proves:

1. private authenticated upload
2. known schema recognition
3. safe failure on a changed schema
4. staged preview without canonical mutation
5. atomic idempotent confirmation
6. exact draft-summary reconciliation
7. organisation isolation tests
8. no operational data in logs or repository
