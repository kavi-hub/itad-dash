# Securaze workbook mapping v0.1

Status: observed integration mapping for one representative export. Sanitized for the private product repository: no client values, asset identifiers, staff names, report filenames or live locators are included.

## Observed structure

| Sheet | Rows observed | Ordered columns | Header fingerprint |
|---|---:|---:|---|
| `PCProduct` | 33 | 98 | `799cc9b872056d43a7249399b323bc01d8bb1f8732f08e20f7ccb4ad6ef08d29` |
| `StorageProduct` | 33 | 61 | `7c7216c2373dae2f7eb15521f0fef53807e61cf9b248af64a8d92e2254ae3e14` |

Observed workbook schema fingerprint: `14bd30f0466a8f6c3c54052f7501586a263f2a0f4f186912ce2d5357fb30e99d`.

Fingerprints cover sheet names and ordered headings only. They detect change; they do not prove that field meanings or row values are valid.

## Identity and provenance

| Upstream field | Sheet | Canonical use | Rule |
|---|---|---|---|
| `Securaze ID` | both | source record identifier | Required within its own sheet; never assumed to identify the same record across sheets |
| `Serial number` | `PCProduct` | asset serial source | Preserve raw value; normalise separately |
| `Serial number` | `StorageProduct` | storage serial source | Preserve raw value; normalise separately |
| `Storage Serial` | `StorageProduct` | supporting storage identifier candidate | Preserve separately; do not assume equality with `Serial number` |
| `Inventory number` | `PCProduct` | asset tag candidate | Optional; test uniqueness per import |
| `Created at` | both | source creation time | Provenance only; never a relationship key |
| `Sale Lot ID` | both | source lot reference | Job/import context candidate, not an asset relationship |
| `Lot name` | both | source lot label | Context only |
| `Data Origin` | both | source-system label | Preserve exact source value |
| `Report` | both | report source reference | Relative source path; never treated as preserved evidence |
| `Erasure report download link` | both | retrieval locator candidate | Temporary retrieval input; preserve evidence separately and record its checksum |

## Product mapping

| Upstream field | Sheet | Canonical use |
|---|---|---|
| `Vendor` | both | manufacturer |
| `Model` | both | model |
| `Chassis` | `PCProduct` | asset category candidate |
| `SKU` | `PCProduct` | source SKU |
| `Grade` | both | source grade, not a processing outcome |
| `Configuration` | both | source configuration text |
| `RAM` | `PCProduct` | observed memory specification |
| `CPU 1` to `CPU 4`, `Additional CPUs` | `PCProduct` | observed processor specifications |
| `Storage 1` to `Storage 4`, `Additional Storages` | both | source storage descriptions; not deterministic host links |
| `Firmware version` | `StorageProduct` | storage diagnostic attribute |

## Processing mapping

| Upstream field | Canonical use | Requirement |
|---|---|---|
| `Data Wipe` | source erasure outcome | Required for a storage processing attempt |
| `Data Wipe Started` | attempt start | Required when an attempt is reported |
| `Data Wipe Finished` | attempt finish | Required for terminal outcomes |
| `Data Wipe Method` | erasure method | Preserve exact source method; map method family separately |
| `Data Wipe Employee` | source operator label | Protected operational data |
| `Data erasure verification` | verification outcome | Separate fact; never merge into erasure outcome |
| `Data erasure verification started` | verification start | Nullable |
| `Data erasure verification finished` | verification finish | Nullable |
| `Data erasure verification method` | verification method | Nullable |
| `SMART Overall` | diagnostic result | Separate from erasure result |
| `Health` | diagnostic metric | Preserve raw and parsed numeric values separately |
| `Security status` | diagnostic capability | Separate from erasure result |

## Observed controlled outcomes

The representative `StorageProduct.Data Wipe` field contains three observed patterns:

| Source pattern | Normalised outcome | Terminal? | Client-facing derivation |
|---|---|---:|---|
| `Storage 1 / Erased` | `successful` | yes | Securely erased, subject to evidence rules |
| `Storage 1 / In progress` | `in_progress` | no | Outcome under review |
| `Storage 1 / Failed: …` | `failed` | yes | Recycling required or further erasure action, determined operationally |

The failure suffix is preserved as source detail. New prefixes or terminal states are blocking until explicitly mapped.

Observed supporting patterns:

- Verification: `Storage 1 / Not verified`
- Verification placeholder: `Storage 1 / N/A`
- Security capability: `Storage 1 / not supported`
- SMART overall: `Storage 1 / Excellent`, `Storage 1 / Good`, `Storage 1 / Fair`

These values are not interchangeable with erasure success.

## Host-to-storage relationship

The representative workbook supplies no deterministic relationship key between `PCProduct` and `StorageProduct`:

- Securaze IDs are unique within each sheet and do not intersect.
- Host-side storage identifier fields are unpopulated.
- Row ordering and timestamps are not identity evidence.

Therefore:

1. Import assets and storage media independently.
2. Leave `storage_medium.host_asset_id` null unless another trusted source supplies a deterministic relationship.
3. Raise a reconciliation item only when host linkage is operationally required.
4. Never join sheets by row number, proximity, make/model or timing.

## Required-field policy

### `PCProduct`

Blocking identity fields:
- `Securaze ID`
- `Serial number`

Required descriptive fields for the current mapping:
- `Vendor`
- `Model`

A missing report reference or retrievable report creates an evidence exception, not a technical outcome.

### `StorageProduct`

Blocking identity fields:
- `Securaze ID`
- `Serial number`

Blocking processing fields:
- `Data Wipe`
- `Data Wipe Started`
- `Data Wipe Method`

Conditionally required:
- `Data Wipe Finished` for terminal outcomes
- recognised report reference or preserved evidence for publishable proof

No host relationship field is required.

## Change detection

Alert when:

- a recognised sheet is missing or renamed
- the ordered-header fingerprint changes
- a required field is missing, renamed or materially type-shifted
- a new `Data Wipe` state or prefix appears
- the report locator field disappears or changes shape
- a previously populated identity field becomes materially sparse
- a new apparent cross-sheet relationship field appears

Additive optional fields create an informational alert unless they may affect identity, outcome or evidence.

## Evidence rule

Relative report references and download locators are not evidence records. During staged import, ITAD Dash attempts retrieval, calculates a checksum, stores the report in protected evidence storage and links it to the source row. Retrieval failure creates an evidence exception while preserving the structured technical outcome unchanged.
