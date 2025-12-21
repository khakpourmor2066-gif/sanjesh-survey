# Auth Integration (Hypothetical)

This document describes the assumed auth exchange between the authentication
system and the survey system. The flow is POST-based and uses HMAC signatures.

## Environment variables

Create a `.env` file:

```
AUTH_ENDPOINT=https://auth.example.com/api/verify
AUTH_SHARED_SECRET=MY_SHARED_SECRET
AUTH_GROUP_ID=G-001
```

## Outgoing request (from this app to auth service)

POST `https://auth.example.com/api/verify`

Request JSON:

```json
{
  "group_id": "G-001",
  "customer_id": "CUST-8842",
  "shared_secret": "MY_SHARED_SECRET",
  "employee_id": "EMP-001"
}
```

## Success response (from auth service)

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

## Error response (from auth service)

```json
{
  "status": "error",
  "message": "invalid_credentials"
}
```

## HMAC signature rule (hypothetical)

Algorithm: `HMAC_SHA256`  
String to sign:

```
group_id + "." + customer_id + "." + issued_at
```

Example:

```
data = "G-001.CUST-8842.2025-12-21T12:30:00Z"
signature = HMAC_SHA256(data, "MY_SHARED_SECRET").toString("hex")
```

