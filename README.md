# Note-Taking App

A full-stack, mobile-friendly note-taking application with email/OTP and Google authentication, using Supabase as the backend database.

## Features
- Sign up and sign in with email + OTP or Google
- JWT-based authentication
- Create and delete personal notes
- Responsive, modern UI (mobile & desktop)
- Error handling and validation

## Tech Stack
- **Frontend:** ReactJS (TypeScript), TailwindCSS, React Router, Axios, @react-oauth/google
- **Backend:** Node.js (TypeScript), Express, JWT, Nodemailer, Google OAuth, Supabase
- **Database:** Supabase (PostgreSQL)

---

## Supabase Setup
1. [Create a Supabase project](https://app.supabase.com/).
2. In the SQL editor, run the following to create tables:
   ```sql
   create table public.users (
     id uuid primary key default uuid_generate_v4(),
     name text not null,
     email text not null unique,
     google_id text,
     created_at timestamptz not null default now()
   );
   create table public.notes (
     id uuid primary key default uuid_generate_v4(),
     user_id uuid references public.users(id) on delete cascade,
     content text not null,
     created_at timestamptz not null default now()
   );
   alter table public.users enable row level security;
   alter table public.notes enable row level security;
   -- Add RLS policies as described in the backend code or previous instructions
   ```
3. Get your Supabase project URL and API key from the dashboard.
4. Set these in your backend `.env` or directly in the code (see `src/utils/supabase.ts`).

---

## Local Setup

### 1. Clone the repository
```
git clone <your-repo-url>
cd ASSIGNMENT
```

### 2. Backend Setup
```
cd backend
npm install
```
- Set up your `.env` file in `backend/` (see `.env.example` for required variables):
  - `SUPABASE_URL` (your Supabase project URL)
  - `SUPABASE_KEY` (your Supabase API key)
  - `JWT_SECRET` (any strong secret)
  - `EMAIL_USER` and `EMAIL_PASS` (Gmail credentials for OTP)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (from Google Cloud Console)

- Start the backend:
```
npm run dev
```

### 3. Frontend Setup
```
cd ../frontend
npm install
```
- Start the frontend:
```
npm start
```
- The app will be available at `http://localhost:3000`

---

## API Endpoints

### **Auth**
- `POST /api/auth/request-otp` — Request OTP for signup or login
  - Body: `{ email, name?, dob?, signup: true|false }`
- `POST /api/auth/verify-otp` — Verify OTP and sign up or log in
  - Body: `{ email, otp, name?, dob? }`
- `POST /api/auth/google-login` — Google OAuth login/signup
  - Body: `{ idToken }`

### **Notes** (JWT required in `Authorization: Bearer <token>` header)
- `GET /api/notes` — Get all notes for the authenticated user
- `POST /api/notes` — Create a new note
  - Body: `{ content }`
- `DELETE /api/notes/:id` — Delete a note by ID

---

## Deployment Guide

### **Backend (Render)**
1. Push your code to GitHub.
2. Go to [Render](https://render.com/) and create a new Web Service.
3. Connect your GitHub repo and select the backend folder.
4. Set environment variables in Render:
   - `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
5. Set the build command: `npm install && npm run build`
6. Set the start command: `npm start`
7. Deploy and note your backend URL (e.g., `https://your-backend.onrender.com`)

### **Frontend (Vercel or Netlify)**
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
3. Import your repo and select the frontend folder.
4. If your backend is deployed, update all API URLs in the frontend to point to your backend (e.g., `https://your-backend.onrender.com/api/...`).
5. Deploy!

---

## How to Use
1. Sign up with your email (OTP will be sent) or Google account
2. Sign in and access your dashboard
3. Create and delete notes
4. Log out securely

---

## Commit & Share
- Commit your work after each feature:
  ```
  git add .
  git commit -m "<feature description>"
  git push
  ```
- Share your deployed URLs when done

---

**Enjoy your note-taking app!** 