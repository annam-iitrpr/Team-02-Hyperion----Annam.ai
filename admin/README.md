# KrishYantra / AASRA — Administrative Operations Dashboard

The **KrishYantra Admin Dashboard** is a dedicated Next.js operational portal for agricultural extension officers, agronomists, and system administrators to inspect live farm telemetry, monitor farmer enrollments, review biophysical risk distributions across districts, and audit database health.

---

## Directory Structure

```
admin/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # Main Admin Analytics Overview
│   │   ├── login/                  # Secure administrator authentication
│   │   ├── database/               # Live farmer & field record inspector
│   │   ├── farmers/                # Enrolled farmer directory and polygon viewer
│   │   └── api/                    # Admin-specific API routes
│   └── components/                 # Admin data tables, metrics cards & charts
├── package.json                    # Admin dependencies
└── tsconfig.json                   # TypeScript configuration
```

---

## Features

1. **Agronomic Fleet Overview**:
   - Total enrolled acreage, active crops under monitoring, and district-level distribution.
2. **Stress Heatmap & Risk Alerts**:
   - Real-time aggregation of Model 1 stress alerts (heatwave, frost, pests) across registered farms.
3. **Database Audit & Management**:
   - Direct inspection of farmer profiles, verified polygons, crop varieties, and pipeline execution logs.

---

## Local Setup & Development

```bash
# 1. Navigate to the admin directory
cd admin

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev -- -p 3001
```

Access the admin dashboard at `http://localhost:3001`.
