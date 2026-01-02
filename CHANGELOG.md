# Changelog

All notable changes to this project are documented in this file.

## 2025-12-22
- Hardened admin access: same-origin checks for write APIs and stricter admin cookie settings.
- Improved admin UX: loading/empty states and safer form submission in Employees/Questions/Roles pages.
- Improved auth UX: disabled login without employeeId and clearer loading feedback.
- Survey cookies now use secure flags in production.
- Added employee dashboard with KPIs, trends, and recent feedback.
- Added employee report API endpoint for dashboard data.
- Enhanced admin reports with summary KPIs, top/low performers, and loading states.
- Added employee dashboard link in employee list.
- Added portal login for employee/supervisor dashboards with role-based access.
- Added supervisor dashboard for team-only reporting.
- Added date range filters plus Excel/PDF export for admin reports.
- Added survey answer summary before final submission.
- Added report caching and date-range comparisons.
- Added portal access checks for employee reports.
- Added offline/save status indicators in survey flow.
- Added interactive charts for manager, supervisor, and employee dashboards.

## 2025-12-21
- Deployed Phase 1 MVP on Vercel with stable alias setup.
- Added mock auth flow and OAuth payload verification.
- Fixed build issues (TypeScript, QR response body, qrcode types).
- Added in-memory fallback storage for Vercel runtime.
- Added thank-you exit handling to prevent returning after logout/home.
- UI styling aligned to the reference layout and RTL support.

