# DiagBill — Diagnostic Center Billing System

Full-stack billing SaaS for diagnostic/pathology centers: create patients, pick tests across multiple clinics, generate itemized invoices with barcodes + QR codes, and track revenue on a dashboard.

🔗 **Live demo:** https://diagbill.vercel.app

## Stack
**Backend:** Node.js · Express · MongoDB (Mongoose) · JWT auth · bcrypt · Helmet · rate-limiting
**Frontend:** React · Vite · Tailwind CSS · React Router · React Hook Form · Recharts (charts) · jsPDF (invoice PDF export) · JsBarcode + qrcode.react

## Features
- **JWT authentication** with hashed passwords and a change-password flow
- **Multi-clinic** test catalog (CRUD on clinics and tests)
- **Guided billing wizard** — patient details → clinic → tests → invoice preview
- **Invoice generation** with barcode + QR code and one-click PDF export
- **Dashboard** with revenue chart and recent-bills table
- Security middleware: Helmet headers, CORS allowlist, `express-rate-limit`

## Architecture
```
backend/
  models/        User, Clinic, Test, Bill (Mongoose schemas)
  controllers/   auth, clinic, test, bill, dashboard
  routes/        REST endpoints (/api/auth, /api/clinics, /api/tests, /api/bills, /api/dashboard)
  middleware/    JWT auth guard, central error handler
  seed/          seed + reset scripts for demo data
frontend/
  src/components/  billing wizard, invoice (barcode/QR), dashboard, sidebar
  src/context/     AuthContext, BillingContext
  src/hooks/       useBills, useClinics, useTests (data fetching)
```

## Running locally
```bash
# backend
cd backend
cp .env.example .env        # set MONGODB_URI, JWT_SECRET, ALLOWED_ORIGINS
npm install
npm run seed                # optional: demo clinics/tests
npm start                   # http://localhost:5000

# frontend
cd frontend
cp .env.example .env        # set VITE_API_URL
npm install
npm run dev                 # http://localhost:5173
```

## API (summary)
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Log in, get JWT |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/clinics`, `/api/tests` | List / create (PUT, DELETE on `/:id`) |
| GET/POST | `/api/bills` | List / create invoices |
| GET | `/api/dashboard/stats` | Revenue + counts |

> Demo project. Not a medical-records system and not HIPAA-compliant; do not put real patient data in it.
