# File Transfer System — Task Overview & Implementation Instruction

- To securely send confidential files that are too large to be attached to emails (20 MB or larger) to parties outside the company.

## Tech Stack

- Frontend: React
  - <https://react.dev/>
- Backend: FastAPI
  - <https://fastapi.tiangolo.com/>
- Package Manager: uv
  - <https://docs.astral.sh/uv/>
- Hosting: Render
  - <https://render.com/>
  - Testing: Ngrok
    - <https://ngrok.com/>
- Database: Supabase
  - <https://supabase.com/>
- File Storage: Google Cloud Storage (GCS)
  - <https://cloud.google.com/storage?hl=en>
- Email Service: Resend
  - <https://resend.com/>

```markdown
# Decision Making

### Keep using techs that are already being used on our existing projects
- React
- FastAPI
- uv
- Render
 - Tested that it can handle a single request containing 500mb file size
- Supabase
 - Supports relational database
- GCS
 - Supports signed URL

### Resend
- Free plan supports:
 - Sending emails
 - 3,000 email per month
 - 100 email per day
```

## Implementation Steps

### Phase 0 — Project Setup

#### Process

- Set up the base project structure

    ```markdown
    file-transfer-system-test/
    ├─ .vscode/
    ├─ app/
    │  ├─ db/               # Supabase config, queries
    │  ├─ routes/
    │  │  └─ api/           # FastAPI Routes
    │  ├─ services/         # Business Logic
    │  │  ├─ utils/         # Utils Logic: GCS, Resend, Token, Formatter
    │  ├─ enums.py
    │  └─ main.py
    ├─ docs/
    ├─ frontend/
    │  ├─ src/
    │  │  ├─ api/
    │  │  │  └─ client.js   # Backend API Client
    │  │  ├─ components/    # React components
    │  │  ├─ pages/         # Upload, Download, Admin Pages
    │  │  ├─ App.css
    │  │  ├─ App.jsx
    │  │  ├─ config.js
    │  │  ├─ index.css
    │  │  └─ main.jsx
    │  ├─ .env.example
    │  ├─ .gitignore
    │  ├─ eslint.config.js
    │  ├─ index.html
    │  ├─ package-lock.json
    │  ├─ package.json
    │  └─ vite.config.js
    ├─ .env.example
    ├─ .gitignore
    ├─ .python-version
    ├─ README.md
    ├─ pyproject.toml
    ├─ run.py
    └─ uv.lock
    ```

- Initialize backend project with `uv`
- Initialize React frontend inside `frontend/`
- Add CORS in FastAPI
- Set up ngrok for local dev

#### Confirmation Points

- [ ]  Frontend is displayed and accessible
- [ ]  Confirm React can call FastAPI
- [ ]  Backend is accessible via endpoint using ngrok

**Estimation:** 0.5 day

### Phase 1 — External Services Setup

#### Process

- Create Supabase project
- Create GCS bucket (private, no public access) & service account
- Create Resend account
- Write a minimal connectivity check for each

#### Confirmation Points

- [ ]  Supabase connection
- [ ]  GCS connection
- [ ]  Resend connection

**Estimation:** 0.5-1 day

### Phase 2 — Database Schema

#### Process

- Create the following tables:
  - Table 1: `file_transfers` (long-lived)
  - Table 2: `otp_attempts` (short-lived)

    ```mermaid
    erDiagram
        file_transfers ||--o{ otp_attempts : "has"

        file_transfers {
            uuid id PK "unique identifier"
            text file_name "original file name, retained as-is"
            text storage_path "GCS object path"
            bigint file_size "size in bytes"
            text recipient_email "external recipient's email address"
            text download_token UK "128-bit random token, used in download URL"
            int download_count "default 0, increments per successful download"
            int max_downloads "default 5, download limit"
            timestamptz created_at "upload timestamp"
            timestamptz expires_at "default created_at + 7 days"
            timestamptz last_download_at "nullable, timestamp of most recent download"
            text last_download_ip "nullable, IP of most recent download"
            text status "Uploaded / Available / Download Limit Reached / Expired / Deleted"
        }

        otp_attempts {
            uuid id PK "unique identifier"
            uuid file_transfer_id FK "references file_transfers.id"
            text otp_hash "hashed OTP, never stored as plaintext"
            timestamptz created_at "OTP generation timestamp"
            timestamptz expires_at "created_at + 10 minutes"
            timestamptz used_at "nullable, set once OTP is successfully verified"
            text ip_address "nullable, IP that requested this OTP"
        }
    ```

#### Confirmation Points

- [ ]  Table 1 & 2 has been created
- [ ]  Try fetching data from tables to application

**Estimation:** 0.5 day

### Phase 3 — File Upload API & UI

#### Process

- Display a form that can be submitted where user can input recipient’s email, and upload/drop a file.
- Upload/drop a file input validation:
  - File size: <500 MB
  - Any file type must be supported
  - Retain the file name
- Success/failure message is shown accordingly
- On successful submission:
  - Record data in `file_transfers` table
  - Uploaded file is stored in GCS

#### Confirmation Points

- [ ]  Upload/drop a file input validation
- [ ]  Success/failure message is shown accordingly
- [ ]  On successful submission, data is recorded in `file_transfers` table
- [ ]  Uploaded file is stored in GCS

**Estimation:** 1-1.5 day

### Phase 4 — Download Link Landing & Status Check

#### Process

- Check `file_transfers.status` when fetching download link
- Display landing page according to status
  - Available → Request OTP to Access
  - Download Limit Reached → Download limit reached.
  - Expired → This link has expired
  - Deleted → This link was not found

#### Confirmation Points

- [ ]  Landing page is correctly displayed according to `file_transfers.status`

**Estimation:** 1-1.5 day

### Phase 5 — OTP Generation & Sending & Verification

#### Process

- When `file_transfers.status` is `AVAILABLE`, sends an OTP to `file_transfers.recipient_email`
- Display an input OTP form
- OTP Validation:
  - One time use only
  - Valid for 10 minutes after creation
  - Must be hashed before stored in database
- Validate OTP submitted by recipient

#### Confirmation Points

- [ ]  OTP is sent to `file_transfers.recipient_email`
- [ ]  OTP is received by `file_transfers.recipient_email`
- [ ]  OTP Form
- [ ]  OTP Validation

**Estimation:** 1-1.5 day

### Phase 6 — File Download & Limit Enforcement

#### Process

- Only allow file download if:
  - OTP is validated
  - hashed validated OTP matches `otp_attempts.otp_hash`
  - `file_transfers.download_count` < 5
  - `file_transfers.created_at` > 7 days
- Display download button
- Download file when download button is clicked

#### Confirmation Points

- [ ]  File is downloaded accordingly
- [ ]  Download button is shown and is clickable accordingly

**Estimation:** 1-1.5 days

### Phase 7 — Automatic Deletion / Cleanup

#### Process

- Schedule a deletion/cleanup in both database and GCS when:
  - `file_transfers.status` = expired
  - `file_transfers.download_count` > 5

#### Confirmation Points

- [ ]  Files fall in these condition is automatically deleted

**Estimation:** 1-1.5 day

### Phase 8 — Admin Interface

#### Process

- Shows the following information:
  - File Name
  - Recipient
  - Registration Date and Time  → upload timestamp
  - Number of downloads (0–5)
  - Status
  - Last Download Date and Time
- Show checkbox for each record
- Selected checkbox can be deleted by clicking Delete button

#### Confirmation Points

- [ ]  Data are displayed from database to this page
- [ ]  Checkbox is present for each record
- [ ]  Selected checkbox can be deleted

**Estimation:** 1-1.5 day

### Phase 9 — Deploy to Production

**Estimation:** 1-1.5 day

### Phase 10 — Testing

**Estimation:** 1 day
