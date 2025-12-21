# Mock Auth Service (Hypothetical)

This is a **hypothetical** authentication service for local testing only.
It simulates the external auth system and returns a signed JSON payload.

## Endpoint

POST `http://localhost:3000/api/mock-auth/verify`

## Required fields

- `group_id`
- `customer_id`
- `shared_secret`
- `employee_id` (optional)

## Request example

```json
{
  "group_id": "G-001",
  "customer_id": "CUST-8842",
  "shared_secret": "MOCK_SHARED_SECRET",
  "employee_id": "EMP-001"
}
```

## Success response

```json
{
  "status": "ok",
  "group_id": "G-001",
  "customer_id": "CUST-8842",
  "employee_id": "EMP-001",
  "issued_at": "2025-12-21T12:30:00Z",
  "signature": "5f2a8d1f0c0e0b1a1c2d3e4f5a6b7c8d9e0f00112233445566778899aabbccdd"
}
```

## Error response

```json
{
  "status": "error",
  "message": "invalid_credentials"
}
```

## How to use it in this app

Create a `.env` file with:

```
AUTH_ENDPOINT=http://localhost:3000/api/mock-auth/verify
AUTH_SHARED_SECRET=MOCK_SHARED_SECRET
AUTH_GROUP_ID=G-001
MOCK_AUTH_SHARED_SECRET=MOCK_SHARED_SECRET
```

Restart the dev server after updating `.env`.

