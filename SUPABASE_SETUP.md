# Supabase Setup Guide

This guide walks you through setting up Supabase for local development and testing the AI Readiness assessment feature.

## Step 1: Create Supabase Account & Project

1. **Go to Supabase**: https://supabase.com
2. **Sign up** or log in with GitHub
3. **Create a new project**:
   - Click "New Project"
   - Choose your organization (or create one)
   - Set project details:
     - **Name**: `creative-milk` (or your preference)
     - **Database Password**: Generate a strong password and **save it** (you'll need it)
     - **Region**: Choose closest to you (e.g., `ap-southeast-2` for Australia)
     - **Pricing Plan**: Free tier is fine for development
   - Click "Create new project"
   - **Wait 2-3 minutes** for project to provision

## Step 2: Run Database Migration

Once your project is ready:

1. **Open SQL Editor**:
   - In your Supabase dashboard, click "SQL Editor" in the left sidebar
   - Click "New Query"

2. **Copy the migration SQL**:
   - Open the file: `supabase/migrations/0001_ai_readiness_and_crm_v2.sql`
   - Copy the entire contents

3. **Paste and Run**:
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" (or press Cmd+Enter / Ctrl+Enter)
   - You should see "Success. No rows returned" if all went well

4. **Verify Tables Created**:
   - Click "Table Editor" in the left sidebar
   - You should see these new tables:
     - `contacts`
     - `readiness_assessments`
     - `activities` (updated with new columns)
     - `documents` (updated with new columns)
     - `opportunities` (updated/reshaped)

## Step 3: Get Your API Credentials

1. **Go to Project Settings**:
   - Click the gear icon (⚙️) at the bottom left
   - Select "API" from the settings menu

2. **Copy these values**:
   - **Project URL**: Found under "Project URL" (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: Under "Project API keys" → Copy the `anon` `public` key
   - **service_role key**: Under "Project API keys" → Click "Reveal" on `service_role` → Copy it
     - ⚠️ **IMPORTANT**: The service_role key is secret - never commit it to git!

## Step 4: Configure Local Environment

1. **Create `.env.local` file** in your project root:

```bash
# Navigate to project root
cd /Users/darrynlee-warden/Documents/DEV/ai-integration

# Create .env.local
touch .env.local
```

2. **Add your credentials** to `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Contact form (if you have Resend set up)
RESEND_API_KEY=your_resend_key_if_you_have_it
RESEND_FROM=Creative Milk <onboarding@resend.dev>
RESEND_TO=contact@creative-milk.com.au
```

**Replace:**
- `https://your-project-id.supabase.co` with your actual Project URL
- `your-service-role-key-here` with your actual service_role key

3. **Verify `.env.local` is in `.gitignore`**:
   - It should already be there (it is!)
   - Never commit this file to git

## Step 5: Test Locally

1. **Restart your dev server**:
```bash
npm run dev
```

2. **Test the AI Readiness Assessment**:
   - Go to http://localhost:3000/ai-readiness
   - Click "Start the Assessment"
   - Answer all 15 questions
   - Click "Submit" on the last question
   - You should be redirected to a results page with your score

3. **Verify in Supabase**:
   - Go to Supabase → Table Editor → `readiness_assessments`
   - You should see your assessment record
   - Check the `activities` table for the completion event

## Step 6: Deploy to Vercel (When Ready)

When deploying to Vercel, add these environment variables in your Vercel project settings:

1. Go to your Vercel project → Settings → Environment Variables
2. Add these variables for **Production**, **Preview**, and **Development**:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
   - `NEXT_PUBLIC_SITE_URL` = your production domain (e.g., `https://www.creative-milk.com.au`)
   - `RESEND_API_KEY` = your Resend API key (for contact form)

## Troubleshooting

### "Failed to persist assessment" error

**Check:**
1. Environment variables are set correctly in `.env.local`
2. The service_role key is correct (not the anon key)
3. The migration ran successfully (check Table Editor for tables)
4. Restart your dev server after adding `.env.local`

### Database connection errors

**Check:**
1. Project URL is correct (includes `https://`)
2. No extra spaces or quotes in `.env.local`
3. Supabase project is active (not paused)

### RLS (Row Level Security) errors

The migration sets up RLS policies that allow the service role to insert assessments anonymously. If you see RLS errors, the API route should be using the service role key (it is - check `lib/supabase/server.ts`).

### View error details

Check your browser console (F12) for detailed error messages from the API.

## Database Schema Overview

**Tables:**
- `readiness_assessments` - Stores completed assessments with scores and metadata
- `contacts` - Person records (linked to assessments when they book a call)
- `opportunities` - Sales pipeline (linked to assessments that convert)
- `activities` - Event log (assessment completed, playbook sent, etc.)
- `documents` - File storage metadata (playbook PDFs)

**Storage:**
- `playbooks` bucket - For generated PDF playbooks (private)

## Security Notes

- ✅ Anonymous users NEVER access the database directly
- ✅ All assessment submissions go through `/api/readiness/submit` using the service_role key
- ✅ Public result URLs are sanitized and don't expose PII
- ✅ RLS policies ensure only authenticated team members can access the CRM
- ⚠️ Keep your service_role key secret - it bypasses RLS

## Support

If you encounter issues:
1. Check the Supabase logs (Project → Logs → Database)
2. Review the API route console output in your terminal
3. Verify the migration SQL ran without errors in SQL Editor
