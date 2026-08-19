# Canonical data model v0.1

Status: proposed for Milestone 01 validation. Governed by Constitutional Specification v1.1.

## Modelling rules

1. Canonical records express operational truth; source rows preserve what an external system supplied.
2. A host asset and its storage media are separate records.
3. Technical outcome, evidence availability, data-risk resolution and physical disposition are separate facts.
4. Staging records cannot mutate canonical records before an operator confirms the import.
5. Corrections and repeat attempts append history; they do not rewrite earlier events.
6. Client summaries are derived, versioned views, never primary evidence.
7. All identifiers use opaque application IDs. Human-readable references are secondary and unique within their stated scope.

## Aggregate boundaries

### Organisation

A client or Bulk GSM operating organisation.

Key fields:
- `id`
- `legal_name`
- `display_name`
- `short_code`
- `status`
- `created_at`

### Contact

A person associated with an organisation.

Key fields:
- `id`
- `organisation_id`
- `name`
- `email`
- `role_label`
- `status`

Contact data is protected operational data and never belongs in repository fixtures.

### Job

The operational container for one client engagement.

Key fields:
- `id`
- `reference`
- `client_organisation_id`
- `authorised_contact_id`
- `site_reference`
- `operational_status`
- `publication_status`
- `delivery_status`
- `opened_at`
- `operationally_completed_at`

The three statuses are independent. Email failure cannot reverse operational completion.

### Asset

A host device or standalone item received into a job.

Key fields:
- `id`
- `job_id`
- `asset_tag_source`
- `asset_tag_normalised`
- `serial_source`
- `serial_normalised`
- `manufacturer`
- `model`
- `category`
- `inventory_status`
- `physical_disposition`

No match may rely on make and model alone.

### Storage medium

A data-bearing component, whether installed in a host or handled separately.

Key fields:
- `id`
- `job_id`
- `host_asset_id` nullable
- `serial_source`
- `serial_normalised`
- `media_type`
- `capacity_bytes` nullable
- `data_risk_status`
- `physical_disposition`

A host may have zero, one or many storage media. A storage medium may temporarily have no resolved host.

### Processing attempt

One diagnostic, erasure or destruction-related attempt against an asset or storage medium.

Key fields:
- `id`
- `job_id`
- exactly one of `asset_id` or `storage_medium_id`
- `attempt_type`
- `sequence`
- `source_system`
- `source_outcome`
- `normalised_outcome`
- `method`
- `started_at`
- `completed_at`
- `supersedes_attempt_id` nullable

Allowed normalised outcomes for Milestone 01:
- `successful`
- `failed`
- `not_attempted`
- `not_applicable`
- `unknown_blocking`

A later success may resolve risk but never deletes the earlier failure.

### Evidence record

An immutable reference to preserved supporting evidence.

Key fields:
- `id`
- `job_id`
- `evidence_type`
- `storage_locator`
- `checksum`
- `captured_at`
- `source_reference`
- `verification_status`
- `version`
- `supersedes_evidence_id` nullable

A source URL is a locator candidate, not preserved evidence.

### Evidence link

A many-to-many association between evidence and the truth it supports.

Key fields:
- `evidence_id`
- exactly one supported record reference
- `support_type`
- `created_at`

Supported records in Milestone 01: import, source row, asset, storage medium and processing attempt.

### Import

One staged ingestion of a source workbook.

Key fields:
- `id`
- `job_id`
- `source_checksum`
- `source_filename`
- `schema_fingerprint`
- `mapping_version`
- `importer_version`
- `status`
- `uploaded_by`
- `uploaded_at`
- `confirmed_by` nullable
- `confirmed_at` nullable

Allowed statuses:
- `staged`
- `review_required`
- `ready_to_confirm`
- `committed`
- `rejected`

The tuple `source_checksum + mapping_version` is idempotent.

### Source row

A lossless staging record for one workbook row.

Key fields:
- `id`
- `import_id`
- `sheet_name`
- `row_number`
- `raw_values`
- `row_checksum`
- `candidate_type`
- `validation_status`

### Match proposal

A proposed relationship between a staged candidate and canonical record.

Key fields:
- `id`
- `source_row_id`
- `candidate_record_type`
- `candidate_record_id` nullable
- `match_basis`
- `confidence_class`
- `decision`
- `decided_by` nullable
- `decided_at` nullable

Only deterministic match bases may be automatically accepted. Confidence scores alone cannot create truth.

### Exception

A visible, owned issue requiring resolution or accepted quarantine.

Key fields:
- `id`
- `job_id`
- `import_id` nullable
- `source_row_id` nullable
- `code`
- `severity`
- `blocking_scope`
- `status`
- `owner_id` nullable
- `resolution`
- `resolved_by` nullable
- `resolved_at` nullable

Severity and blocking scope are independent. A serious row-level exception need not block unrelated valid rows.

### Client summary version

A derived, immutable client-facing representation.

Key fields:
- `id`
- `job_id`
- `version`
- `status`
- `data_cutoff_at`
- `generated_from_snapshot`
- `approved_by` nullable
- `approved_at` nullable
- `supersedes_summary_id` nullable

Allowed statuses:
- `draft`
- `approved`
- `published`
- `superseded`

## Core relationships

- Organisation 1 → many Jobs
- Job 1 → many Assets
- Asset 1 → many Storage media
- Asset or Storage medium 1 → many Processing attempts
- Job 1 → many Imports
- Import 1 → many Source rows
- Source row 1 → many Match proposals or Exceptions
- Evidence many ↔ many supported records through Evidence links
- Job 1 → many Client summary versions

## Derived truth

### Storage data-risk status

Derived from confirmed processing attempts and verified destruction evidence:

- `unassessed`
- `erasure_in_progress`
- `erasure_failed`
- `erased_verified`
- `destruction_required`
- `destruction_pending`
- `destroyed_verified`

### Milestone 01 client outcome

Derived per canonical record:

- Securely erased
- Recycling required
- Awaiting recycling confirmation
- No data-bearing storage identified
- Outcome under review

Unknown or quarantined outcomes never appear as successful.

## Invariants

1. Every asset and storage medium belongs to exactly one job.
2. A storage medium cannot belong to an asset from another job.
3. A processing attempt targets exactly one asset or storage medium.
4. A committed import is immutable.
5. The same source checksum and mapping version cannot create a second committed import.
6. Every canonical value created by import retains source-row provenance.
7. An evidence record checksum is immutable.
8. Missing evidence cannot change a technical result into success or failure.
9. A summary total must reconcile to its stored canonical snapshot.
10. Client publication is impossible while a blocking publication exception remains.
