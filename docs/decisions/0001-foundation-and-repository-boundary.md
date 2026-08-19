# ADR 0001: Foundation and repository boundary

Status: accepted

## Decision

ITAD Dash is maintained as a separate product repository from the Bulk GSM marketing website.

The repository contains product specifications, sanitised design references, synthetic fixtures, application code and tests. Live client evidence remains in approved protected storage and is referenced by the running system through controlled evidence records.

The Constitutional Specification v1.1 governs product truth. Technical architecture remains proposed until validated through the first vertical slice.

## Consequences

- Marketing-site changes do not couple to operational portal releases.
- Authentication, evidence handling and audit controls can evolve independently.
- Repository safeguards must prevent raw operational documents from being committed.
- The Bulk GSM website may link to the portal but does not own its operational data model.

