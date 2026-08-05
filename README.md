# ITAD Dash

ITAD Dash is an operations, evidence-management and client-reporting portal for Bulk GSM's IT Asset Disposition workflow.

It is designed to turn collection records, device inventories, Securaze processing results and downstream recycling evidence into a clear, controlled audit trail and a simple client experience.

## Product purpose

ITAD Dash supports the journey from initial client estimate through receipt, testing, secure erasure, exception handling, recycling confirmation and publication of the completed job pack.

The system must preserve precise operational evidence internally while presenting clients with clear summaries, supporting device reports and approved certificates.

## Core workflow

1. Record the client's estimated equipment quantities.
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
- Client information and real processing evidence must not be committed to this repository.

## Initial product scope

- Job and collection management
- Canonical asset and storage register
- Securaze workbook import and schema-change detection
- Device and report matching
- Exception handling
- Client-facing job summaries
- Searchable device-level results
- Source-report viewing and controlled downloads
- Recycling and destruction-batch management
- Downstream processor register
- Certificate generation and reconciliation
- Roles, permissions and approval gates
- Notifications, delivery history and audit logs

## Repository structure

```text
docs/
  constitution/
  requirements/
  workflows/
  data-model/
  integrations/
  decisions/
design/
  wireframes/
  prototypes/
  report-layouts/
samples/
  anonymised/
src/
tests/
```

Only anonymised and deliberately sanitised sample data belongs in `samples/`. Raw Securaze exports, client inventories, Certificates of Destruction, Waste Transfer Notes and other live evidence must remain in approved protected storage.

## Current status

The operational workflow and constitutional truth model have completed an adversarial review and are frozen at version 1.1.

The next build stage is:

> Securaze import → matching preview → exception handling → client summary → supporting device reports

## Near-term roadmap

1. Add the v1.1 constitutional specification.
2. Add the current prototype and design references.
3. Formalise the canonical job, asset, storage and evidence data model.
4. Specify the Securaze import contract and structural-change alerts.
5. Build the import and matching preview.
6. Build the client summary and device-report experience.
7. Add recycling batches, downstream reconciliation and certificate publication.
8. Validate the workflow against adversarial acceptance tests.

## Status

Private product repository. Early specification and prototyping stage.
