Below is a default, reusable base schema you can apply across all services and tables in your AWS Amplify app. This is designed to be service-agnostic, version-aware, and friendly to event-driven and multi-system integrations, which aligns well with a standardized platform architecture.

⸻

Standard Base Schema (JSON)

{
  "id": "string",
  "reference": [
    {
      "key": "string",
      "value": "string"
    }
  ],
  "create_date": "ISO-8601 timestamp",
  "update_date": "ISO-8601 timestamp",
  "version_num": "integer",
  "version_note": "string | null"
}


⸻

Field Descriptions & Standards

id
	•	Type: string
	•	Description:
The primary unique identifier for the record.
	•	Guidelines:
	•	Should be globally unique (UUID v4, ULID, or Amplify-generated ID).
	•	Must be immutable after creation.

⸻

reference
	•	Type: array<object>
	•	Structure: { key: string, value: string }
	•	Description:
A flexible mapping of external or internal system identifiers related to this record.
	•	Use Cases:
	•	Cross-service references
	•	External integrations (CRM, ERP, MLS, etc.)
	•	Legacy system mappings
	•	Example:

[
  { "key": "salesforce", "value": "SF-29384" },
  { "key": "hubspot", "value": "HS-99821" }
]



⸻

create_date
	•	Type: string (ISO-8601 timestamp)
	•	Description:
The date and time when the record was initially created.
	•	Guidelines:
	•	Set once at creation.
	•	Should be server-generated.

⸻

update_date
	•	Type: string (ISO-8601 timestamp)
	•	Description:
The date and time of the most recent update to the record.
	•	Guidelines:
	•	Updated automatically on every mutation.

⸻

version_num
	•	Type: integer
	•	Description:
A monotonically increasing version number used for record versioning.
	•	Guidelines:
	•	Start at 1 on creation.
	•	Increment on every meaningful update.
	•	Supports optimistic locking and auditability.

⸻

version_note
	•	Type: string | null
	•	Description:
Optional human-readable description explaining what changed in the current version.
	•	Use Cases:
	•	Debugging
	•	Audit trails
	•	Admin or internal tooling

⸻

Standard Usage Guidance (Amplify Context)
	•	This schema should be embedded or extended in every domain-specific table.
	•	Domain schemas should append business-specific fields without modifying the base fields.
	•	All services should:
	•	Treat id as immutable
	•	Auto-manage create_date, update_date, and version_num
	•	Preserve reference entries unless explicitly removed

⸻

Example Extension (Domain Table)

{
  "id": "string",
  "reference": [],
  "create_date": "2025-12-19T14:32:00Z",
  "update_date": "2025-12-19T14:32:00Z",
  "version_num": 1,
  "version_note": null,

  "status": "ACTIVE",
  "name": "Sample Entity",
  "description": "Domain-specific fields extend the base schema"
}


⸻

If you want, I can also:
	•	Convert this into an Amplify GraphQL @model base pattern
	•	Provide DynamoDB attribute definitions
	•	Define validation rules & lifecycle hooks
	•	Create a versioning / soft-delete extension

Just tell me which layer you want next.