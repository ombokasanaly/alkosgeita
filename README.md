# ALKOS Apartments Management System v2

## Deployment
Recommended primary deployment: Vercel.
Alternative Node deployment: Render. A `render.yaml` and `Procfile` are included.

## MongoDB
Keep `MONGODB_URI` in hosting Environment Variables. Do NOT put the connection string in source code or GitHub.

Vercel variables:
- MONGODB_URI
- MONGODB_DB=alkos
- MASTER_ADMIN_EMAIL=alkos@geita.tz
- CRON_SECRET
- NEXT_PUBLIC_APP_NAME=ALKOS Apartments

## Master administrator
The master identity is hardcoded server-side as `alkos@geita.tz` in `lib/auth.ts`. This is an authorization identity, not a password. For real production financial data, connect the sign-in screen to a proper authentication provider/session system before public launch. Do not use email-only login as a real security mechanism.

## Weekly automation
Vercel Cron calls `/api/cron/weekly-report` every Sunday at 23:00 UTC. The report is also available manually from Weekly Reports.

## Uploaded branding photo
The provided apartment interior photo is included as `public/alkos-interior.jpg` and is used as the dashboard hero image. It is not a logo. Replace the `A` brandmark with your official logo after uploading it.

## Current modules
Dashboard, Rooms, Guest Billing, Bar POS, Expenses, Weekly Reports, Audit Log, debts, discounts, occupancy, print/save-as-PDF, clipboard report, modal close/back/save controls.

## Security note
Right-click/text-copy restrictions can be added as a deterrent, but they are not true security. Real protection must be enforced on the server with authentication, authorization, validation, rate limiting, audit logs and database permissions.
