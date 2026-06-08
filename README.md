# AutoNova Dashboard

Production-ready dashboard for monitoring and managing AutoNova cold-email
outreach. The React frontend and Express API deploy together as one web service.

## Features

- Lead dashboard, analytics, sequence tracking, activity logs, and unsubscribes
- Search, filtering, pagination, and CSV export
- Add individual leads from the dashboard
- Bulk CSV import with validation and a downloadable template
- Google Sheets persistence
- n8n workflow triggering for new leads and imports
- Password protection for the public dashboard

## Project Structure

```text
autonova-dashboard/
|-- backend/       Express API and Google Sheets integration
|-- frontend/      React and Vite dashboard
|-- package.json   Production build and start commands
|-- render.yaml    Render Blueprint
`-- README.md
```

## Local Development

Requirements: Node.js 22.12 or newer and npm.

1. Create `backend/.env` from `backend/.env.example`.
2. Install dependencies:

   ```bash
   npm install --prefix backend
   npm install --prefix frontend
   ```

3. Start the backend:

   ```bash
   npm run dev --prefix backend
   ```

4. In another terminal, start the frontend:

   ```bash
   npm run dev --prefix frontend
   ```

Open `http://localhost:5173`.

## Environment Variables

```env
NODE_ENV=production
GOOGLE_SHEETS_ID=your-sheet-id
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
N8N_WEBHOOK_URL=https://n8n.autonovalabs.dev/webhook/lead/add
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=use-a-long-random-password
```

Share the Google Sheet with `GOOGLE_CLIENT_EMAIL` as an **Editor**. The sheet
must contain a `Leads` tab with these headers:

```text
id, first_name, company, email, industry, status, last_sent_at,
last_email_content, followup_count, last_response, notes, sender_account,
validation_reason
```

## CSV Import

Required headers:

```csv
first_name,company,email,industry
Asha,Acme Labs,asha@example.com,Technology
```

Optional headers:

```text
id,status,last_sent_at,last_email_content,followup_count,last_response,notes,sender_account,validation_reason
```

Headers are case-insensitive and may appear in any order. Missing optional
values receive safe defaults.

## Deploy on Render

1. Push this folder to a new GitHub repository.
2. In Render, select **New > Blueprint**.
3. Connect the repository containing `render.yaml`.
4. Enter the five secret values requested by Render:
   `GOOGLE_SHEETS_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
   `DASHBOARD_USERNAME`, and `DASHBOARD_PASSWORD`.
5. Deploy and open the generated `onrender.com` URL.
6. Verify `/api/health` returns `{"status":"ok"}`.

Render builds the frontend, installs production backend dependencies, and serves
the entire application from one HTTPS URL.
