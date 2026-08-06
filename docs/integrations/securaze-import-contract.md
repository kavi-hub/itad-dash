# Securaze import contract

Status: proposed implementation contract governed by Constitutional Specification v1.1.

## Purpose

Import Securaze workbook data without silently changing meaning when the export structure changes.

## Staged import

1. Preserve the source file in protected evidence storage and calculate its checksum.
2. Read workbook metadata, sheet names, headers and field types into a staging record.
3. Compare the observed structure with a recognised schema fingerprint.
4. Map rows into staged device, storage and report candidates.
5. Validate required fields and controlled outcomes.
6. Preview proposed matches, new records and exceptions.
7. Require operator confirmation before committing the import.
8. Record the source checksum, schema fingerprint, mapping version and importer version.

Re-importing the same source checksum with the same mapping must not create duplicate canonical records.

## Expected logical datasets

The current known export contains device-level and storage-level datasets. Exact sheet and column labels are mapping inputs, not domain truth. The importer maps them to:

- Source record identifier
- Device identity and source serial
- Storage identity and source serial
- Manufacturer, model and product category
- Processing or diagnostic outcome
- Erasure outcome, method and timestamps
- Report reference or retrievable report locator
- Source-row provenance

Source values are preserved. Normalised values are stored separately for matching.

## Change detection

The schema fingerprint covers:

- Workbook and sheet presence
- Header names and order
- Required versus optional fields
- Observed field types
- Controlled-status values
- Relationship keys between device and storage rows

The portal raises a visible alert for new, removed, renamed or type-changed fields and for unknown status values.

### Severity

- Blocking: required sheet/key missing, relationship cannot be established, or outcome meaning is unknown.
- Partial: affected rows are quarantined while independently valid rows may continue.
- Informational: additive optional field with no change to existing meaning.

No unknown field or status is silently discarded when it could affect identity, outcome or evidence.

## Matching rules

Use deterministic identifiers first: recognised source ID, device serial, storage serial, asset tag and approved composite keys. Never auto-match on make and model alone. Duplicate or ambiguous candidates enter the exception queue.

Device and storage records remain distinct. A failed erasure resolves neither the storage risk nor the disposition of the host device automatically.

## Evidence handling

Report presence and processing success are separate facts. During import, retrievable source reports are copied into protected evidence storage and linked by immutable evidence records. A missing or expired report link creates an evidence exception without rewriting the processing outcome.

## Operator alert

The alert must state what changed, which rows are affected, whether prior imports remain valid and what action is required. Example:

> Securaze format changed. Two required fields and one new outcome need review. Twenty-eight unaffected rows are ready to preview; five rows are quarantined.

