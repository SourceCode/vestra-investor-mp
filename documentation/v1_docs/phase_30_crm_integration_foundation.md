# Phase 30: CRM Integration Foundation

## Objective
Build the "Integration Hub" to sync data with external CRMs (Salesforce, HubSpot).

## Dependencies
- Phase 9

## Tasks
1.  **Integration Entity**
    - `OrganizationIntegration`: `org_id`, `provider` (salesforce), `config` (encrypted API keys), `status`.

2.  **Adapter Pattern**
    - Interface `CRMAdapter` (`syncContact`, `syncDeal`).
    - Abstract implementation.

3.  **Job Queue**
    - Setup a queue (e.g., BullMQ or simple DB queue) for background sync jobs.

4.  **Settings UI**
    - Page for Admin to select CRM and enter credentials.

## Technical Considerations
- **Encryption**: API keys MUST be encrypted at rest.
- **Error Handling**: Retries for failed syncs.

## Verification
- Create a mock adapter.
- Trigger a sync job.
- Verify adapter method is called.
