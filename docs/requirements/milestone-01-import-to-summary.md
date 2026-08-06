# Milestone 01: Import to client summary

## Objective

Prove that ITAD Dash can ingest a Securaze workbook defensively, let an operator verify its interpretation and produce an accurate draft client summary without exposing or falsifying evidence.

## In scope

- Workbook upload into protected staging
- Schema fingerprint and change detection
- Device and storage candidate extraction
- Deterministic matching preview
- Duplicate, ambiguous and missing-evidence exceptions
- Operator confirmation and idempotent commit
- Draft job totals and client-facing outcome summary
- Links from summary rows to controlled supporting evidence records

## Out of scope

- Downstream recycling batches and processor reconciliation
- Certificate generation
- Client publication and email delivery
- Production authentication and billing

## Primary flow

Upload workbook → validate structure → stage rows → preview matches → resolve or quarantine exceptions → confirm import → generate draft client summary.

## Acceptance criteria

1. The known workbook structure is recognised without manual mapping.
2. Device and storage rows remain separately traceable.
3. Source and normalised identifiers are both preserved.
4. Re-importing the same workbook does not duplicate assets, storage or evidence.
5. An added optional column creates an informational notice.
6. A missing required field blocks only the affected import scope where safe isolation is possible.
7. An unknown processing outcome is never mapped to success.
8. Duplicate and ambiguous identifiers enter the exception queue.
9. A report URL without a preserved report creates an evidence exception.
10. The operator sees counts for proposed matches, new records, quarantined rows and warnings before committing.
11. No staged import changes canonical job data before confirmation.
12. The generated summary reconciles exactly to committed canonical records.
13. Client wording uses secure erasure and recycling while retaining precise internal outcomes.
14. The summary remains a draft until its publication gate is satisfied.
15. Audit history records the source checksum, schema/mapping versions, operator and confirmation time.

## Stop conditions

Stop the import and require review when the workbook cannot be fingerprinted, required relationships cannot be established, controlled outcomes are unknown, or the source appears corrupt. Never guess through these conditions.

## Validation fixtures

Use synthetic fixtures only. At minimum cover: recognised structure, additive column, renamed required column, unknown status, duplicate source, duplicate serial, storage without host, host without storage, missing report and mixed valid/quarantined rows.

