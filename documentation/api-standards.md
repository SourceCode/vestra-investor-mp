Below is what Google’s JSON Style Guide (“JSON-C”) is asking you to do, plus example request/response payloads you can use for CRUD and batch APIs (with and without errors).

What the standard is

The document is a set of conventions for JSON request/response bodies so APIs have a consistent “look and feel”, while still being plain JSON per JSON.org.  ￼

Key rules it calls out early:
	•	No comments in real JSON payloads.  ￼
	•	Double quotes for property names and string values.  ￼
	•	Prefer semantic structure (don’t group/ nest just for convenience; nest when it’s a real sub-structure like an address).  ￼
	•	Property names: meaningful, camelCase ASCII, JS-identifier compatible (so JS clients can use dot notation).  ￼
	•	Value types must be JSON types only: boolean, number, string, object, array, null (no JS expressions/functions).  ￼
	•	Enums should be strings (not numbers).  ￼
	•	Some “data types” are standardized as strings with specific formats, e.g. RFC 3339 timestamps, ISO 8601 durations, ISO 6709 lat/long.  ￼

The “envelope” structure (reserved top-level fields)

The guide recommends a consistent top-level structure:
	•	Top-level may include: apiVersion, context, id, method, params
	•	And then either:
	•	data (success) or
	•	error (failure)

Schema excerpt shown in the guide (Orderly format).  ￼

Field types (from the guide’s structure)

Top-level:
	•	apiVersion: string  ￼
	•	context: string  ￼
	•	id: string  ￼
	•	method: string  ￼
	•	params: object/map (arbitrary keys)  ￼
	•	data: object  ￼
	•	error: object  ￼

Inside data (reserved names you can reuse):
	•	kind, fields, etag, id, lang: strings  ￼
	•	updated: string timestamp (RFC 3339)  ￼
	•	deleted: boolean  ￼
	•	Paging integers: currentItemCount, itemsPerPage, startIndex, totalItems, pageIndex, totalPages  ￼
	•	Paging/links: pageLinkTemplate, next, nextLink, previous, previousLink, self, selfLink, edit, editLink  ￼
	•	items: array of objects  ￼

Inside error:
	•	code: integer  ￼
	•	message: string  ￼
	•	errors: array of objects containing:
	•	domain, reason, message, location, locationType, extendedHelp, sendReport (strings)  ￼
And the guide provides an example error payload.  ￼

Example payloads: CRUD for a simple “Contact” resource

1) Create (POST) — request (no errors)

{
  "apiVersion": "1.0",
  "id": "req-0001",
  "method": "contacts.create",
  "params": {
    "contact": {
      "firstName": "Ava",
      "lastName": "Nguyen",
      "email": "ava.nguyen@example.com",
      "status": "ACTIVE"
    }
  }
}

Create — success response

{
  "apiVersion": "1.0",
  "id": "req-0001",
  "data": {
    "kind": "contacts#contact",
    "id": "c_123",
    "etag": "W/\"3f2a9c\"",
    "updated": "2025-12-18T17:22:05.123Z",
    "items": [
      {
        "id": "c_123",
        "firstName": "Ava",
        "lastName": "Nguyen",
        "email": "ava.nguyen@example.com",
        "status": "ACTIVE"
      }
    ]
  }
}

Notes:
	•	updated is RFC 3339 formatted, as recommended.  ￼
	•	status is an enum represented as a string.  ￼

Create — error response (validation)

{
  "apiVersion": "1.0",
  "id": "req-0001",
  "error": {
    "code": 400,
    "message": "Validation failed",
    "errors": [
      {
        "domain": "Contacts",
        "reason": "InvalidParameter",
        "message": "email must be a valid email address",
        "location": "params.contact.email",
        "locationType": "jsonPath"
      }
    ]
  }
}

This follows the guide’s error object pattern.  ￼

⸻

2) Read (GET) — request

{
  "apiVersion": "1.0",
  "id": "req-0002",
  "method": "contacts.get",
  "params": {
    "id": "c_123"
  }
}

Read — success response

{
  "apiVersion": "1.0",
  "id": "req-0002",
  "data": {
    "kind": "contacts#contact",
    "id": "c_123",
    "etag": "W/\"3f2a9c\"",
    "updated": "2025-12-18T17:22:05.123Z",
    "items": [
      {
        "id": "c_123",
        "firstName": "Ava",
        "lastName": "Nguyen",
        "email": "ava.nguyen@example.com",
        "status": "ACTIVE"
      }
    ]
  }
}

Read — error response (not found)

{
  "apiVersion": "1.0",
  "id": "req-0002",
  "error": {
    "code": 404,
    "message": "Contact not found",
    "errors": [
      {
        "domain": "Contacts",
        "reason": "ResourceNotFound",
        "message": "No contact exists with id=c_123"
      }
    ]
  }
}


⸻

3) List (GET collection) — request

{
  "apiVersion": "1.0",
  "id": "req-0003",
  "method": "contacts.list",
  "params": {
    "itemsPerPage": 2,
    "startIndex": 0
  }
}

List — success response (with paging fields)

{
  "apiVersion": "1.0",
  "id": "req-0003",
  "data": {
    "kind": "contacts#contactList",
    "etag": "W/\"9a11b1\"",
    "itemsPerPage": 2,
    "startIndex": 0,
    "currentItemCount": 2,
    "totalItems": 5,
    "pageIndex": 0,
    "totalPages": 3,
    "nextLink": "https://api.example.com/contacts?itemsPerPage=2&startIndex=2",
    "items": [
      { "id": "c_123", "firstName": "Ava", "lastName": "Nguyen", "status": "ACTIVE" },
      { "id": "c_124", "firstName": "Mateo", "lastName": "Silva", "status": "INACTIVE" }
    ]
  }
}

These paging fields and items array naming align with the reserved structure.  ￼

⸻

4) Update (PATCH/PUT) — request

{
  "apiVersion": "1.0",
  "id": "req-0004",
  "method": "contacts.update",
  "params": {
    "id": "c_123",
    "contact": {
      "email": "ava.new@example.com",
      "status": "ACTIVE"
    }
  }
}

Update — success response

{
  "apiVersion": "1.0",
  "id": "req-0004",
  "data": {
    "kind": "contacts#contact",
    "id": "c_123",
    "etag": "W/\"41be02\"",
    "updated": "2025-12-18T17:30:44.901Z",
    "items": [
      {
        "id": "c_123",
        "firstName": "Ava",
        "lastName": "Nguyen",
        "email": "ava.new@example.com",
        "status": "ACTIVE"
      }
    ]
  }
}


⸻

5) Delete (DELETE) — request

{
  "apiVersion": "1.0",
  "id": "req-0005",
  "method": "contacts.delete",
  "params": {
    "id": "c_123"
  }
}

Delete — success response (soft-delete style using reserved deleted)

{
  "apiVersion": "1.0",
  "id": "req-0005",
  "data": {
    "kind": "contacts#contact",
    "id": "c_123",
    "deleted": true,
    "updated": "2025-12-18T17:33:10.000Z",
    "items": [
      { "id": "c_123", "deleted": true }
    ]
  }
}

deleted is one of the reserved names in the data object schema.  ￼

⸻

Example payloads: batch operations

The guide defines a consistent envelope and reserved names, but it doesn’t prescribe a single “batch” shape. The pattern below stays compliant with the guide by:
	•	Using the same top-level envelope (apiVersion, id, method, params, then data or error)  ￼
	•	Using plural arrays named items (or requests) and string enum values  ￼

Batch request (mixed CRUD)

{
  "apiVersion": "1.0",
  "id": "req-0100",
  "method": "contacts.batch",
  "params": {
    "requests": [
      {
        "id": "op-1",
        "method": "contacts.create",
        "params": {
          "contact": { "firstName": "Jin", "lastName": "Park", "email": "jin.park@example.com", "status": "ACTIVE" }
        }
      },
      {
        "id": "op-2",
        "method": "contacts.update",
        "params": {
          "id": "c_999",
          "contact": { "email": "bad-email-format", "status": "ACTIVE" }
        }
      },
      {
        "id": "op-3",
        "method": "contacts.delete",
        "params": { "id": "c_124" }
      }
    ]
  }
}

Batch response (partial success: per-item success/error)

{
  "apiVersion": "1.0",
  "id": "req-0100",
  "data": {
    "kind": "contacts#batchResponse",
    "items": [
      {
        "id": "op-1",
        "data": {
          "kind": "contacts#contact",
          "id": "c_200",
          "updated": "2025-12-18T17:40:00.000Z",
          "items": [
            { "id": "c_200", "firstName": "Jin", "lastName": "Park", "email": "jin.park@example.com", "status": "ACTIVE" }
          ]
        }
      },
      {
        "id": "op-2",
        "error": {
          "code": 400,
          "message": "Validation failed",
          "errors": [
            {
              "domain": "Contacts",
              "reason": "InvalidParameter",
              "message": "email must be a valid email address",
              "location": "params.contact.email",
              "locationType": "jsonPath"
            }
          ]
        }
      },
      {
        "id": "op-3",
        "data": {
          "kind": "contacts#contact",
          "id": "c_124",
          "deleted": true,
          "updated": "2025-12-18T17:40:01.000Z",
          "items": [
            { "id": "c_124", "deleted": true }
          ]
        }
      }
    ]
  }
}

The error object shape matches the guide’s reserved error schema (code/message/errors[]).  ￼

Batch response (top-level failure: whole batch rejected)

{
  "apiVersion": "1.0",
  "id": "req-0100",
  "error": {
    "code": 413,
    "message": "Batch too large",
    "errors": [
      {
        "domain": "Contacts",
        "reason": "RequestTooLarge",
        "message": "Maximum 100 operations per batch"
      }
    ]
  }
}


⸻

If you tell me your preferred resource naming (e.g., leads, properties, transactions) and whether you want REST paths (POST /contacts) vs RPC methods (contacts.create), I can tailor these payloads so they map 1:1 to your actual API surface while staying consistent with the guide.