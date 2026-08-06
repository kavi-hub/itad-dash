# ITAD Dash

ITAD Dash is an operations, evidence-management and client-reporting portal for Bulk GSM's IT Asset Disposition workflow.

It turns collection records, device inventories, Securaze processing results and downstream recycling evidence into a controlled audit trail and a clear client experience.

## Product purpose

ITAD Dash supports the journey from initial client estimate through receipt, testing, secure erasure, exception handling, recycling confirmation and publication of the completed job pack.

The system preserves precise operational evidence internally while presenting clients with clear summaries, supporting device reports and approved certificates.

## Core workflow

1. Record estimated equipment quantities.
2. Confirm receipt and complete the working inventory.
3. Import and validate Securaze processing data.
4. Match devices, storage media and source reports.
5. Route unresolved data risks into an exception or destruction workflow.
6. Group relevant assets into downstream recycling batches.
7. Reconcile downstream evidence before confirming completion.
8. Review and publish the client summary, supporting reports and certificates.
9. Approve recipients before sending job communications.

## Governing principles

- Evidence is preserved; presentation never replaces source records.
- Devices and storage media have separate, traceable identities.
- Intended destruction is never reported as completed destruction.
- Securaze imports are staged, repeatable and checked for structural changes.
- Format changes and broken mappings create visible alerts rather than silent guesses.
- Operational completion, client publication and email delivery are separate states.
- Downstream processors are selected per batch from a controlled processor register.
- Client-facing language prioritises secure erasure and responsible recycling.
- Corrections create new versions while preserving the original audit history.
- Client information and real processing evidence must not be committed here.

## Initial product scope

- Job and collection management
- Canonical asset and storage register
- Securaze workbook import and schema-change detection
- Device, storage and report matching
- Exception handling
- Client-facing job summaries and device-level results
- Controlled source-report viewing and downloads
- Recycling and destruction-batch management
- Downstream processor register
- Certificate generation and reconciliation
- Roles, permissions, approval gates and audit logs

## Repository structure

```text
docs/       Product truth, requirements, integrations and decisions
design/     Sanitised prototypes, wireframes and report layouts
samples/    Synthetic or deliberately anonymised fixtures only
src/        Application source
tests/      Automated validation
```

Raw Securaze exports, client inventories, Certificates of Destruction, Waste Transfer Notes and other live evidence remain in approved protected storage.

## Current status

The operational workflow and constitutional truth model completed adversarial review and are frozen at version 1.1. Repository privacy safeguards, the sanitised reference prototype, Securaze import contract and first milestone acceptance criteria are now defined.

The first build milestone is:

> Upload workbook → validate structure → preview import → resolve exceptions → generate client summary

## Near-term roadmap

1. Formalise the canonical job, asset, storage and evidence data model.
2. Create synthetic Securaze fixtures for the import contract.
3. Select the minimum technical architecture needed for the vertical slice.
4. Build schema fingerprinting and staged import.
5. Build matching preview and exception handling.
6. Build the draft client summary and device-report experience.
7. Add recycling batches, downstream reconciliation and certificate publication.
8. Validate the workflow against adversarial acceptance tests.

Private product repository. Early specification and prototyping stage.
