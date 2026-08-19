# ITAD Dash Constitutional Specification

**Status:** Frozen v1.1 after adversarial review  
**Date:** 5 August 2026  
**Purpose:** Define the truth, control and publication rules that the product interface must obey.

## 1. Governing principles

1. **Evidence before presentation.** Client-facing summaries are generated from preserved source evidence; they never replace it.
2. **One canonical record.** A device, storage item, job, report, destruction batch and certificate each have one durable identity. Imports attach evidence; they do not create parallel truth.
3. **Estimates remain estimates.** The client's rough count supports planning only. Collection count, warehouse receipt and inventoried assets remain separate facts.
4. **Intent is not completion.** “Recycling required” and “sent to processor” are not evidence that destruction or recycling is complete.
5. **No silent correction.** Verified records are versioned, not overwritten. Every correction records actor, reason, time and previous value.
6. **Least disclosure.** Client users see only their organisation's authorised jobs and documents. Recipient changes require approval.
7. **Useful simplicity.** Clients receive a clear summary first and per-device proof on demand.
8. **Separate technical completion from communication.** Processing, publication and notification are distinct states. An unsent email cannot rewrite operational truth.
9. **No invented precision.** Evidence may prove a sealed batch, quantity or weight without listing every serial. The system must disclose how coverage was established.

## 2. Canonical operational journey

`Client estimate → collection count → warehouse receipt → inventory → Securaze test/erase → unresolved data-risk route → destruction batch → downstream evidence → reconciliation → approval → publication → notification`

The system must preserve these independently:

- Client estimate
- Collection record and custody signature
- Warehouse receipt count and condition
- Canonical asset/storage inventory
- Relationships between a host device and each internal or removable storage item
- Original Securaze workbook and individual reports
- Parsed Securaze outcomes
- Recycling/destruction batch membership
- Transfer and downstream evidence
- Client-facing report and certificate versions
- Approvals, recipients and delivery events

## 3. Securaze import contract

### 3.1 Import package

Each import stores:

- Original workbook, unchanged
- File checksum, upload time and uploader
- Detected workbook structure fingerprint
- Importer/mapping version
- Source sheet names, headers and row counts
- Individual report references and locally preserved report files
- Per-row match decision and confidence
- Import warnings, exceptions and approval history

Temporary local paths or Securaze URLs must not be the permanent evidence location. Reports are copied into controlled storage during import where technically available. If a referenced report cannot be acquired, preserve the workbook row and link metadata, mark the report unavailable and raise an evidence exception. Do not treat a missing file as a failed erasure or discard otherwise valid structured data.

### 3.2 Structure-change detection

Compare every upload with the current approved fingerprint. Detect:

- Missing, renamed or new sheets
- Missing, renamed, new or reordered columns
- Changed data types or status vocabulary
- Broken or materially changed report links
- Unexpected duplicate identifiers
- Row-count or relationship failures between device and storage sheets

Classification:

| Severity | Example | Behaviour |
|---|---|---|
| Informational | Column order changed | Import and log |
| Review | New optional column or status | Import known fields; quarantine affected values |
| Blocking | Required identifier/result missing | Stop affected rows; preserve the upload |
| Critical | Workbook cannot be parsed or relationships collapse | Stop import and alert an authorised manager |

An alert must state what changed, what was imported, what was quarantined and the action required. A failed re-import must never damage a previous successful import.

Imports are staged before commit. The system shows proposed creates, matches, updates, quarantines and conflicts before acceptance. Re-uploading the same source checksum is idempotent and cannot duplicate assets or evidence.

### 3.3 Matching hierarchy

Use deterministic matching first: stable Securaze identifier, device serial, storage serial, asset tag and approved composite keys. Identifier normalisation preserves the source value and records the normalised match value. Never auto-match solely on make/model. Duplicate or ambiguous matches enter the exception queue.

A device and its storage are separate canonical records linked by a versioned relationship. One device may contain multiple storage items; a storage item may be removed and processed separately. A failed storage outcome does not automatically require destruction of the host device.

### 3.4 Parsed outcomes

Internally preserve at least:

- Test complete / incomplete / failed
- Erasure successful
- Erasure failed
- Erasure not possible
- No data-bearing storage verified
- Data-risk resolution required
- Physical destruction required
- Assigned to destruction batch
- Transferred to processor
- Downstream evidence received
- Destruction verified

The existence of a Securaze report is not evidence of successful erasure; the actual result controls the outcome. Unknown or conflicting outcomes remain unresolved. A later successful attempt may supersede an earlier failed attempt, while both remain in the audit history.

## 4. Client reporting

### 4.1 Job summary

The primary report shows:

- Job and site references
- Collection and processing dates
- Estimated, received and inventoried totals without conflating them
- Devices securely erased
- Devices or storage items requiring data-risk resolution
- Recycling/destruction confirmed
- No data-bearing storage identified
- Outstanding exceptions, separated into blocking and informational items
- Overall completion state
- Available certificates and supporting reports

### 4.2 Device evidence

Authorised client users may search by serial, asset tag, make or model and may:

- View the beautified device outcome
- View/download the preserved individual Securaze report
- Select multiple reports for download
- Download all supporting evidence as a packaged archive
- Export the published asset register

Internal notes, commercial recovery decisions and processor management data are not exposed unless expressly approved.

### 4.3 Client terminology

Default wording:

- Securely erased
- Recycling required
- Awaiting recycling confirmation
- Transferred to an authorised recycling partner
- Recycling confirmed
- No data-bearing storage identified

Where data-bearing media was physically destroyed and the evidence supports both facts, state: **“Physically destroyed and transferred for compliant recycling.”** If the evidence proves destruction but not the ultimate recycling route, state only what is evidenced. Do not use “recycling” alone as proof of data-risk elimination.

## 5. Destruction batches and processors

### 5.1 Processor register

Processors are controlled records, not hard-coded text. Record:

- Legal name and registered/trading address
- Approved contacts
- Waste-carrier registration
- Environmental permit
- Waste-management licence
- Permitted waste categories
- Insurance/compliance evidence
- Approval status and review history
- Evidence issue and expiry dates
- Accepted downstream document formats

Warn before expiries and block new transfers where a required approval has expired. A manager may record an emergency decision, but cannot convert expired or absent regulatory evidence into valid approval; compliance review remains required before transfer where law or permit conditions require it.

Initial processor record:

| Field | Value |
|---|---|
| Legal name | Envirocity Ltd |
| Waste Carrier Licence | CBDU372302 |
| Environmental Permit | FB3201KJ/A001 |
| Waste Management Licence | 404068 |

These details require normal production onboarding verification before first live use.

### 5.2 Destruction batch

Each batch records processor, exact device/storage membership, quantities/weight, originating jobs, seal/container references, transfer date, custody/WTN evidence, downstream CoD reference/date, reconciliation method, approval and certificate versions.

An asset cannot belong to more than one open destruction batch. Removal or substitution after transfer requires a versioned exception and managerial approval.

### 5.3 Reconciliation gate

Before confirming destruction, verify:

- Processor identity and licence/permit record
- Batch and downstream references
- Dates, quantities and weights
- Coverage of every listed asset/storage item, either directly on the downstream evidence or indirectly through an unbroken sealed-batch custody record
- Extra, omitted or duplicate items
- Evidence legibility and completeness

Mismatch creates an exception. Upload alone cannot complete the batch. Where the downstream CoD certifies only a batch reference, quantity or weight, serial coverage must be labelled as **derived from Bulk GSM batch membership and chain of custody**, not processor-issued serial evidence.

### 5.4 Bulk GSM certificate

Generate only after downstream evidence is reconciled and approved. Reference format:

`BulkCOD-[YYYYMMDD]-[ClientShortCode]-01`

Include job reference, destruction-batch reference, downstream CoD reference/date, supporting asset schedule, processor/regulatory details, Bulk GSM approval date and certificate version. Statements must be assembled from evidenced facts and approved wording; they cannot make a broader WEEE, recycling or destruction claim than the evidence supports.

Reference allocation is atomic and unique. A reissue keeps the certificate reference and increments its version. A multi-client or multi-job downstream batch produces isolated client certificates and schedules without exposing another client's assets.

## 6. Contacts, approval and notification

Each job has one **Authorised Job Contact** and may have approved alternates, document recipients and view-only portal users.

Send sequence:

`Evidence reconciled → client preview generated → Bulk GSM review → recipient approval gate → publish → email → delivery logged`

Controls:

- Default to the authorised job contact.
- A saved alternate may be selected if the main contact is unavailable.
- Any recipient change for the job requires explicit Bulk GSM approval before sending.
- A new address or different email domain triggers an enhanced warning.
- The approval screen shows exact recipients, documents, versions and portal access being granted.
- Record approver, time, recipients, delivery result and resend history.
- Never expose one client's recipients or documents to another organisation.
- Revoking portal access takes effect immediately for future access but does not erase the audit trail.
- Delivery failure changes notification status, not processing or publication status, and creates a follow-up task.

## 7. Roles and permissions

| Role | Core authority |
|---|---|
| Client viewer | View expressly shared jobs and published documents |
| Client administrator | Manage organisation users; cannot alter evidence |
| Bulk GSM operator | Record counts, inventory and upload evidence |
| Bulk GSM reviewer | Resolve matches and operational exceptions |
| Bulk GSM manager | Approve publication, recipient changes, corrections and reissues |
| System service | Parse, calculate and notify only within approved rules |

Verified evidence, published reports, recipient approvals and processor credentials require step-up protection appropriate to production risk.

## 8. Retention baseline

This is an operational baseline subject to legal, contractual and insurer review:

| Record | Baseline |
|---|---:|
| Raw Securaze files/reports | 7 years after job completion |
| Asset register and processing history | 7 years |
| Custody, WTN and destruction evidence | 7 years, or longer where required |
| Client summaries and certificates | 7 years |
| Approval and delivery records | 7 years with job |
| Failed validation uploads | 90 days unless linked to an investigation |
| Access logs | 24 months |
| Routine photos | 12 months; retain with related claim/exception if needed |

Deletion must be policy-driven, logged and suspended by legal/claim/audit holds. Removing a user must not remove the organisation's records.

## 9. Publication and completion gates

A job may be **Processing complete — awaiting recycling confirmation** while downstream evidence is outstanding.

A job becomes **Operationally complete** only when:

- Received inventory is reconciled or exceptions are formally resolved
- Every data-bearing storage item has a resolved data outcome
- Every inventoried asset and storage item has a resolved physical outcome appropriate to its type
- Every destruction-required item has verified downstream evidence
- Required reports/certificates are generated and approved
- Client summary is reviewed
- No blocking exception remains

Publication is a separate approved state. Notification is complete only when the approved recipient set and exact document versions have been sent or a manager records a justified non-email delivery outcome. Recipient approval or delivery failure cannot hold an operationally complete job in a false processing state.

An interim client view may be published while processing continues, but it must be labelled **Interim**, show its data cut-off time and outstanding work, and never expose unapproved or cross-client evidence. Publication creates an immutable version. Corrections generate a superseding version with reason and notification history. Reopening a completed job creates a controlled processing cycle and never edits the historical completed version.

## 10. Minimum adversarial acceptance tests

1. Known Securaze format imports successfully.
2. Renamed required column quarantines affected rows and alerts management.
3. Unknown status cannot be coerced into “successful.”
4. Duplicate serial/report does not create a second canonical asset.
5. Ambiguous device/storage match enters exception review.
6. Failed erasure creates unresolved data risk; it does not automatically condemn the host device.
7. A serialised downstream CoD missing one required item blocks that item and batch completion.
8. Expired processor approval blocks a normal new transfer.
9. Alternate recipient cannot receive documents before approval.
10. Different-domain recipient creates an enhanced disclosure warning.
11. Reissued certificate preserves and supersedes the prior version.
12. Client download contains only published evidence for the authorised organisation.
13. A previous successful import survives a later broken upload.
14. Job cannot complete while any destruction-required item lacks verified evidence.
15. A device with two drives can retain the erased drive while only the failed drive enters destruction.
16. A later successful erasure attempt supersedes but does not erase the failed attempt.
17. A batch-level CoD reconciles through seal, quantity/weight and custody without falsely claiming processor-issued serial detail.
18. The same workbook checksum cannot create a duplicate import.
19. A missing individual report raises an evidence exception without converting a successful structured result into failure.
20. Delivery failure creates follow-up but does not reverse operational completion.
21. An interim publication is visibly incomplete and cannot leak internal or other-client records.
22. Reopening a completed job preserves the former published version and recipient history.
23. Multi-job destruction evidence produces isolated client certificates and schedules.

## 11. Decisions still requiring confirmation before production

- Legal/insurer validation of retention periods
- Authentication and step-up verification method
- Exact internal job roles and named approvers
- Processor onboarding/expiry thresholds
- Email templates, sender identity and delivery-failure escalation
- Whether a client administrator may approve alternate recipients or Bulk GSM alone controls approval
- Final definition of non-blocking versus blocking exceptions
- Legal review of certificate wording and the evidential threshold for batch-level versus serial-level claims
- Rules for authorised job reopening and exceptional non-email delivery

These decisions do not block the reporting prototype, but they must be resolved before live client data is processed.

## 12. Adversarial review record

The review corrected six material assumptions:

1. Storage media, not always the whole host device, is the unit of data-risk resolution.
2. Operational completion, publication and email delivery are separate truths.
3. Batch evidence may be valid without a serial schedule, but the portal must disclose how serial coverage was derived.
4. Reprocessing can supersede an earlier technical result without deleting it.
5. Missing reports and broken links are evidence exceptions, not invented processing failures.
6. Compliance exceptions may be recorded but cannot manufacture valid processor approval.

No contradiction remains that blocks the Securaze import and reporting prototype. Section 11 contains production-governance decisions that must remain visible rather than being guessed during interface design.
