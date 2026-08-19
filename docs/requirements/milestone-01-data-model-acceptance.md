# Milestone 01 data-model acceptance

The canonical model and fixture contract are ready for implementation-stack selection only when all checks below pass.

## Truth separation

- [x] Asset and storage medium are separate records.
- [x] Source values and normalised values are preserved separately.
- [x] Processing outcome and evidence availability are separate.
- [x] Technical result, data-risk state and physical disposition are separate.
- [x] Operational completion, publication and delivery remain separate.

## Import safety

- [x] Staging cannot mutate canonical data before confirmation.
- [x] Import identity includes source checksum and mapping version.
- [x] Every imported canonical value retains row provenance.
- [x] Unknown controlled values are blocking, never coerced.
- [x] Row-level quarantine can isolate independently valid rows.

## History and audit

- [x] Repeat attempts append history.
- [x] Evidence is immutable and checksum-addressed.
- [x] Client summaries are versioned derived snapshots.
- [x] Supersession preserves prior attempts, evidence and summaries.

## Fixture coverage

- [x] Recognised structure
- [x] Additive optional column
- [x] Renamed required column
- [x] Unknown status
- [x] Duplicate source
- [x] Duplicate serial
- [x] Storage without host
- [x] Host without storage
- [x] Missing report
- [x] Mixed valid and quarantined rows

## Remaining validation before code

1. Translate the real Securaze workbook headings into a non-sensitive field dictionary.
2. Confirm the exact controlled status values found in the representative export.
3. Confirm which report locator fields are stable identifiers versus temporary download URLs.
4. Convert the logical JSON fixtures into workbook fixtures during implementation without copying live data.
5. Select the smallest stack that can test schema fingerprinting, staged import and reconciliation end to end.

These items refine integration mapping. They do not reopen the constitutional truth model.
