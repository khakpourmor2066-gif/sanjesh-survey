# Customer Satisfaction Survey (MVP)

Minimal Next.js app for QR-based employee satisfaction surveys with RTL + 3 languages.

## Run locally

```bash
npm run dev
```

Open:
- http://localhost:3000/fa
- http://localhost:3000/fa/employees

## Auth integration

This project uses a simple POST-based auth exchange with HMAC signatures.
For full details and examples, see `AUTH.md`.

## Admin panel (local)

Visit:
- http://localhost:3000/admin/login

Default credentials (if not set in `.env`):
- username: `admin`
- password: `admin123`
