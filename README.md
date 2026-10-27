# InfraTrack AI — Project Workspace

A from-scratch full-stack starter for an infrastructure project workspace.

## Stack
- React + Vite frontend
- Express API
- SQLite persistence via `better-sqlite3`
- Multer uploads with file type/size validation
- Local report storage in `server/uploads/`

## Requirements
- Node.js 20+
- npm

## Run locally
Open two terminals:

### 1. Backend
```bash
cd server
npm install
npm run dev
```
API runs at `http://localhost:4000`. SQLite database is created automatically at `server/data/infratrack.db`.

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Open the URL printed by Vite (usually `http://localhost:5173`).

Vite proxies `/api` requests to the backend.

## Features
- Empty initial state (no seeded/demo projects)
- Create project with required fields and a required planned report
- PDF, XLS, XLSX, and DOCX report validation (15 MB max)
- Project list, search, status filters, update status, delete
- Dashboard route `/projects/:id` with project details and report link
- SQLite persistence across refresh/restarts
- Responsive dark navy UI with blue/cyan gradients and rotating taglines

## Production notes
This is a runnable baseline, not a hosted deployment. Before production, add authentication/authorization, CSRF/rate limiting as appropriate, malware scanning for uploaded files, object storage for uploads, database backups, audit logging, and deployment-specific environment configuration. Local SQLite and disk uploads are intended for a single-instance deployment.


## Report review workflow (updated)

- Project report submissions are stored in SQLite and uploaded files are stored under `server/uploads`.
- Every submission is placed in a **pending human review** queue. A reviewer can accept or reject it from the report details drawer.
- Accepted reports appear in Report History with type, submitter, date, details, and a download action.
- Plain text and CSV files receive text extraction; PDF extraction is best-effort. DOCX/XLSX currently show a parser-required note, and image OCR requires an OCR service.
- This build does **not** include a hosted LLM/OCR integration or user authentication/role-based reviewer accounts. Review actions are available to anyone with access to the application, so configure authentication and a real document-extraction provider before production use.
- Project workspace now has a saved light/dark appearance toggle. The dark appearance remains the default.
