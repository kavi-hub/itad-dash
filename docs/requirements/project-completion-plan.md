# ITAD Dash project completion plan

Status: execution baseline  
Date: 19 August 2026  
Governing specification: `docs/constitution/ITAD_DASH_CONSTITUTIONAL_SPEC_V1.1.md`

## 1. Executive assessment

ITAD Dash has a working, deployed security foundation. Authentication, organisation membership, private workbook storage, immutable upload records and bounded workbook-structure inspection have been proven with synthetic data.

The product is not yet an operational ITAD system. It does not yet stage source rows, create canonical jobs/assets/storage records, preview matches and exceptions, atomically confirm an import, or generate a reconciled draft client summary.

### How close are we?

| Finish line | Current estimate | Meaning |
|---|---:|---|
| Secure upload and inspection proof | 85% | The deployed Slices A and partial B work. Authentication email copy and final end-to-end account acceptance remain. |
| Milestone 01: import-to-draft-summary vertical slice | 25–30% | Slice A is complete; Slice B is partially complete; Slices C–F are not implemented. |
| Production-ready Bulk GSM operator MVP | 15–20% | Milestone 01 plus job/custody workflow, evidence preservation, operational controls and production hardening. |
| Full constitutional product scope | 10–15% | Adds downstream processors, destruction batches, certificates, client publication, recipients, delivery and retention controls. |

These are evidence-based delivery estimates, not measures of code volume. The remaining work contains the highest-risk domain logic: canonical truth, matching, exceptions, atomic confirmation, reconciliation and publication gates.

### Indicative delivery range

For one focused full-time engineer with timely operational decisions:

- Milestone 01: approximately 8–12 engineering weeks from this baseline.
- Production-ready operator MVP: approximately 14–20 engineering weeks.
- Full constitutional v1 scope: approximately 20–30 engineering weeks.

Calendar time can reduce through parallel design, legal/compliance review and test-fixture preparation. It will increase if live Securaze formats contradict the accepted synthetic mapping or if external report retrieval requires a new integration.

## 2. Current proven baseline

### Delivered

- React, TypeScript and Vite application deployed through Netlify.
- Supabase Auth with passwordless email link and configurable six-to-eight-digit OTP input.
- Invite-only application flow using `shouldCreateUser: false`.
- Organisation membership with operator, manager and client-viewer roles.
- Private Supabase Storage bucket with organisation-scoped RLS.
- Immutable, checksum-addressed `.xlsx` source-upload records.
- File type, path, size and duplicate-upload controls.
- Bounded ZIP/XML workbook inspection that does not execute formulas or external links.
- Sheet names, row counts, column counts and candidate headers recorded as structural metadata only.
- Database constraint preventing row data from being smuggled into inspection JSON.
- Deployed Bulk GSM organisation and synthetic operator acceptance path.
- Typecheck, unit/contract tests, production build and dependency audit passing.

### Partially delivered

- Slice B structure inspection exists, but the approved ordered-header fingerprint, mapping registry and classified schema-change findings are incomplete.
- Authentication works, but the Supabase email template still requires final wording verification and the test account requires successful first-login confirmation.
- The browser currently performs structural inspection. This is acceptable for the synthetic spike only; the accepted architecture requires server-controlled parsing before live evidence is used.

### Not yet delivered

- Jobs and collection/receipt records.
- Canonical assets and storage media.
- Lossless source-row staging and provenance.
- Versioned Securaze mapping and controlled outcome vocabulary.
- Report retrieval and protected evidence preservation.
- Match proposals, duplicate handling and exception queue.
- Operator preview and stop/confirm controls.
- Atomic, idempotent import confirmation.
- Immutable audit events for canonical changes.
- Draft client summary and exact reconciliation.
- Downstream processor register and compliance expiry controls.
- Destruction/recycling batches and downstream evidence reconciliation.
- Certificate generation, versioning and reissue.
- Client portal publication, evidence downloads and organisation-isolation acceptance.
- Recipient approval, notification and delivery history.
- Retention, legal hold, backup/restore and production incident controls.

## 3. Non-negotiable boundaries

1. Use synthetic data until the production-governance gate is passed.
2. Preserve original evidence; derived presentation never replaces source records.
3. Keep host devices and storage media as separate identities.
4. Never convert unknown, missing or conflicting outcomes into success.
5. Keep processing, publication and notification as separate states.
6. Stage before canonical commitment.
7. Make confirmation atomic, idempotent and attributable.
8. Preserve source and normalised values with row-level provenance.
9. Keep secrets and privileged keys outside browser code.
10. Block cross-organisation disclosure at database, storage and application layers.
11. Do not claim destruction or recycling beyond the evidence actually reconciled.
12. Stop when source structure contradicts the approved contract; never guess through it.

## 4. Completion strategy

The shortest credible path is to finish Milestone 01 before expanding into certificates, downstream processors or client delivery. Each slice must be releasable, testable and reversible.

### Phase 0: stabilise the deployed foundation

Target: 2–4 working days.

Deliverables:

- Change Supabase email copy from “six-digit code” to “one-time code.”
- Complete first login for `kw@dagdag.co` and verify active Bulk GSM operator access.
- Test link login, eight-digit OTP login, sign-out and expired-token recovery.
- Add a visible resend-code action with rate-limit-safe feedback.
- Confirm unknown emails cannot create users through the application.
- Re-run Supabase security/performance advisors.
- Add a root README link to this completion plan.
- Remove or ignore local-only empty migration artefacts; only committed migrations define schema history.

Exit gate:

- A new invited operator can authenticate and reach only the Bulk GSM workspace.
- An uninvited email gains no application access.
- Both email sign-in methods work from the production URL.
- No unresolved P0/P1 authentication or organisation-isolation defect remains.

### Phase 1: complete Slice B — schema inspection

Target: 1–2 weeks.

Deliverables:

- Implement the approved ordered-header fingerprint for recognised sheets.
- Add a versioned, non-sensitive Securaze mapping registry.
- Compare each upload with the approved fingerprint.
- Classify findings as informational, review, blocking or critical.
- Detect missing/renamed/new sheets and columns, reordered columns and unknown controlled statuses.
- Show what is recognised, changed, quarantined and required from the operator.
- Move authoritative workbook parsing behind a server-only boundary.
- Preserve browser inspection only as a non-authoritative convenience or remove it.
- Record parser, fingerprint and mapping versions with each inspection/import.

Exit gate:

- Known synthetic fixture is recognised.
- Additive optional fields are informational.
- Renamed required fields block the affected scope.
- Unknown sheets or statuses never map to success.
- Formula and external-link content is treated as inert data.
- A later failed inspection cannot damage an earlier successful record.

### Phase 2: Slice C — lossless staged candidates

Target: 2–3 weeks.

Deliverables:

- Add the minimum Milestone 01 schema for jobs, imports, source rows, assets, storage media, processing attempts, evidence records/links and exceptions.
- Link every import to a job and protected source upload.
- Store source rows losslessly with sheet name, row index and checksum/provenance.
- Store source and normalised identifiers separately.
- Produce device, storage, processing-attempt and evidence-reference candidates.
- Keep storage independent where no deterministic host relationship exists.
- Implement controlled outcome mapping with unknown-value quarantine.
- Attempt report preservation into private evidence storage; missing reports become evidence exceptions, not processing failures.
- Add fixture coverage for recognised, additive, renamed, unknown, duplicate, hostless, storageless, missing-report and mixed-validity cases.

Exit gate:

- Parsing changes no canonical record.
- Every candidate traces to import, source row and mapping version.
- Unknown outcomes and ambiguous identities are quarantined.
- Valid rows remain usable when isolation is safe.
- No live data enters repository, fixtures or logs.

### Phase 3: Slice D — operator preview and exception workflow

Target: 1–2 weeks.

Deliverables:

- Import summary with proposed creates, matches, updates, warnings and quarantines.
- Separate asset and storage preview tables.
- Deterministic matching hierarchy: stable Securaze ID, serial, asset tag and approved composites.
- Duplicate and ambiguous match handling.
- Exception list with severity, evidence, required action and resolution history.
- Explicit stop conditions and manager escalation for critical structure failures.
- Operator decisions recorded without rewriting source evidence.

Exit gate:

- An operator can explain exactly what confirmation will do.
- Blocked rows cannot be silently accepted.
- No match relies solely on make/model, timing, row order or proximity.
- Device/storage ambiguity remains visible.
- Preview totals reconcile to staged rows.

### Phase 4: Slice E — atomic canonical confirmation

Target: 2–3 weeks.

Deliverables:

- Server-authorised confirmation endpoint.
- One database transaction for canonical writes, provenance and audit event.
- Idempotency key based on source checksum plus mapping version.
- Concurrency protection against double confirmation.
- Canonical assets, storage media, processing attempts, evidence links and resolved exceptions.
- Append-only correction/supersession model.
- Retry-safe failure behaviour.
- Database tests for rollback, concurrent confirmation, RLS and organisation isolation.

Exit gate:

- Repeated confirmation creates no duplicates.
- Failed confirmation leaves canonical truth unchanged.
- Concurrent requests cannot double-create.
- Previous successful imports survive later broken uploads.
- Every canonical value retains source-row provenance and actor/time history.

### Phase 5: Slice F — reconciled draft client summary

Target: 1–2 weeks.

Deliverables:

- Derived counts for received/inventoried assets, secure erasure, unresolved data risk, evidence availability and physical outcome.
- Searchable asset/storage result register.
- Clear separation of technical outcome, evidence availability, data-risk status and disposition.
- Draft summary version with watermark, generation time and mapping/import references.
- Links to preserved supporting evidence records.
- Exact reconciliation checks between summary totals and committed canonical records.
- No publication action in Milestone 01.

Exit gate:

- Every summary total reconciles exactly.
- Unknown/quarantined records never count as success.
- Missing evidence does not rewrite technical outcome.
- Client wording follows the constitutional terminology.
- Summary is visibly draft and cannot be externally published.

### Phase 6: Milestone 01 adversarial acceptance and release

Target: 1–2 weeks.

Deliverables:

- Playwright coverage of upload → inspect → stage → preview → resolve/quarantine → confirm → draft summary.
- Two-organisation isolation suite across database, Storage and UI.
- All Milestone 01 constitutional adversarial tests automated where practical.
- CI gates for typecheck, tests, build, migrations, dependency audit and repository privacy scan.
- Structured operational logging without workbook contents, serials, personal data or secrets.
- Error monitoring and an operator-visible reconciliation/failure path.
- Backup/restore rehearsal for database records and evidence object references.
- Architecture decision record 0002 updated from proposed to accepted only when all eight validation gates pass.

Milestone 01 definition of done:

`Upload workbook → validate structure → stage rows → preview matches/exceptions → confirm atomically → generate an exactly reconciled draft client summary`

## 5. Production operator MVP after Milestone 01

### Phase 7: jobs, custody and warehouse operations

- Client organisation, contacts and authorised job contact.
- Job references, sites and intake states.
- Estimate, collection count, signed custody and warehouse receipt as separate facts.
- Inventory corrections through versioned events.
- Operational dashboard and exception workload.

### Phase 8: evidence preservation and controlled downloads

- Individual Securaze report acquisition and checksum verification.
- Evidence availability, supersession and access history.
- Short-lived download access and bulk evidence package creation.
- Client-safe evidence filtering.

### Phase 9: production security and operations

- Manager step-up MFA for approvals and sensitive evidence.
- Named role/approver matrix.
- Custom SMTP sender, deliverability and failure monitoring.
- Session policy, access reviews and user offboarding.
- Rate limiting, abuse protection and incident runbook.
- Production backup, restore, retention and legal-hold mechanisms.
- Accessibility, mobile and performance acceptance.

Operator MVP exit gate:

- Bulk GSM can run a synthetic job from collection through reconciled draft summary with auditable operator actions and no manual database intervention.

## 6. Full constitutional v1 after operator MVP

### Phase 10: processors and destruction/recycling batches

- Controlled processor register with approval evidence and expiries.
- Transfer blocking when required approval is absent/expired.
- Exact batch membership, seal/container, WTN/custody and downstream evidence.
- Serial-level or batch-level reconciliation with explicit evidence basis.
- Multi-job/client isolation.

### Phase 11: certificates

- Atomic `BulkCOD-[YYYYMMDD]-[ClientShortCode]-01` reference allocation.
- Evidence-gated certificate generation.
- Supporting schedules, legal wording controls, approval and versioned reissue.
- Reconciliation tests preventing claims broader than evidence.

### Phase 12: client portal, publication and delivery

- Client viewer/admin access model.
- Interim versus final publication versions.
- Client summary, device register, individual/bulk evidence downloads.
- Recipient selection and enhanced different-domain warning.
- Manager approval gate showing exact recipients, documents and versions.
- Email delivery, failure, resend and non-email outcome history.
- Reopening workflow that preserves previous completed/publication versions.

Full v1 exit gate:

- A complete job can move through intake, processing, unresolved-data-risk handling, downstream evidence, reconciliation, certificate approval, client publication and delivery without conflating operational truth or exposing another client’s data.

## 7. Decisions required from Bulk GSM

Resolve before the named phase begins:

| Decision | Needed by |
|---|---|
| Named operators, reviewers, managers and approval delegation | Phase 3 |
| Deterministic host-to-storage reconciliation input | Phase 2 |
| Blocking versus non-blocking exception catalogue | Phase 3 |
| Production MFA/step-up policy | Phase 9 |
| Retention periods validated by legal/insurer | Phase 9 |
| Approved processors, evidence requirements and expiry thresholds | Phase 10 |
| Certificate wording and batch-versus-serial evidential threshold | Phase 11 |
| Client administrator authority over alternate recipients | Phase 12 |
| Sender identity, email templates and delivery-failure escalation | Phase 12 |
| Reopening and exceptional non-email delivery authority | Phase 12 |

Decision rule: record each settled item as an ADR or governed requirement. Do not encode an unapproved assumption into UI or database logic.

## 8. Delivery controls

### Branch and release discipline

- One bounded slice per branch/PR.
- Migrations, tests and rollback notes in the same PR as schema changes.
- Draft PR first; critical pass before production merge.
- Netlify preview acceptance before `main` where practical.
- Production deployment verified against the expected commit SHA.

### Required checks on every slice

- TypeScript typecheck.
- Unit and contract tests.
- Production build.
- Dependency audit.
- RLS/grant/policy review for schema changes.
- Supabase security and performance advisors after DDL.
- No secrets or operational/client evidence in repository or logs.
- Explicit negative test proving the protected failure mode.

### Severity and stop rules

- P0: cross-client disclosure, evidence corruption or privilege bypass — stop and contain immediately.
- P1: false success, duplicate canonical truth, broken rollback or irreconcilable totals — stop the slice.
- P2: workflow blocker with safe data state — fix before slice acceptance.
- P3: usability/polish issue — schedule without redefining truth.

## 9. Immediate next actions

1. Finish the production email-template wording and confirm the test operator’s first login.
2. Accept this plan as the execution baseline.
3. Start Phase 1 with the approved mapping dictionary and ordered-header fingerprint.
4. Add server-controlled parsing before any live workbook is introduced.
5. Keep downstream certificates and client publication out of scope until Milestone 01 passes.

## 10. Progress reporting

Update this document at the end of every accepted slice:

- completed deliverables
- evidence/tests proving acceptance
- new risks or mapping contradictions
- decisions made and ADR links
- revised percentage and delivery range
- next bounded slice

Percentages must move only when an exit gate passes, not when code is merely started.
