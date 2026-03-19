# Dwindik Admin Portal Setup

This guide sets up a simple content admin workflow using Supabase.

## 1) Create a Supabase project

1. Go to Supabase dashboard.
2. Create a new project.
3. Open project settings and copy:
   - Project URL
   - anon public key

## 2) Set environment variables

1. Copy .env.example to .env
2. Fill in:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

## 3) Create database schema and policies

1. Open Supabase SQL editor.
2. Run docs/supabase-admin-setup.sql.

This creates:
- projects table
- update timestamp trigger
- row-level security policies

## 4) Create admin users

1. In Supabase, open Authentication > Users.
2. Add users manually (you and your client).
3. Share credentials securely.

## 5) Run the app

1. Install dependencies.
2. Start dev server.
3. Open /admin/login.
4. Sign in and manage projects.

## Notes

- Public pages read project data directly from Supabase.
- If Supabase is missing, the app falls back to local placeholder data.
- Current policy allows any authenticated user to write. For stricter setup, move to role-based policies later.
