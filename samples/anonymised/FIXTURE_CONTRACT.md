# Synthetic fixture contract v0.1

Fixtures validate meaning, not a specific spreadsheet library.

Each fixture describes:
- workbook sheets and headers
- fictional source rows
- expected schema findings
- expected staged candidates
- expected exceptions
- whether operator confirmation is allowed
- expected committed totals when confirmation is allowed

## Identifier rules

All fixture identifiers must:
- begin with `DEMO-` or `SYN-`
- identify fictional organisations and devices
- contain no live URLs, names, emails, serials, IMEIs or job references

## Required scenarios

| Fixture | Expected behaviour |
|---|---|
| recognised structure | imports cleanly |
| additive optional column | informational notice |
| renamed required column | affected scope blocked |
| unknown status | outcome quarantined |
| duplicate source checksum | no second committed import |
| duplicate serial | ambiguous match exception |
| storage without host | preserved and queued for host resolution |
| host without storage | valid host; no invented storage |
| missing report | technical result preserved; evidence exception |
| mixed rows | valid rows preview independently from quarantined rows |

## Logical workbook shape

Milestone 01 fixtures use two logical sheets:

### PCProduct

Required logical fields:
- `source_record_id`
- `device_serial`
- `manufacturer`
- `model`
- `processing_status`
- `completed_at`

Optional:
- `asset_tag`
- `report_reference`
- `report_locator`

### StorageProduct

Required logical fields:
- `source_record_id`
- `storage_serial`
- `host_source_record_id`
- `erasure_status`
- `completed_at`

Optional:
- `media_type`
- `capacity_bytes`
- `erasure_method`
- `report_reference`
- `report_locator`

Exact upstream headings are mapping-version inputs and will be added only after the real workbook is translated into a non-sensitive field dictionary outside GitHub.
