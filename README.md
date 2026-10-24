# LeadPilot

Find local businesses, review their websites, approve the good leads, send responsible outreach emails, handle replies and book meetings. Multi-user: every customer only sees their own data (Postgres Row Level Security).

## Setup (about 20 minutes)
1. **Supabase**: create a free project. SQL Editor > paste `sql/schema.sql` > Run. Copy the URL, anon key and service-role key. (To sell privately, turn OFF "Enable sign ups" in Authentication settings and add customers yourself.)
2. **Google Cloud**: enable "Places API (New)", create an API key and restrict it to that API.
3. **Anthropic**: create an API key (writes emails, reads replies).
4. **Resend**: create an account, verify your sending domain, create an API key.
5. Copy `.env.example` to `.env.local` and fill every value. `npm install`, then `npm run dev`.
6. **Deploy**: push to GitHub, import in Vercel, paste the same variables in Project Settings > Environment Variables. Set `APP_URL` to your Vercel URL.

## Built-in safeguards
Login on every page and API call, CSRF origin check, input validation (zod), rate limits, SSRF protection when reviewing websites, signed unsubscribe links, do-not-contact list, human approval before any email, daily send cap, postal address in every email, security headers (CSP, HSTS).

## Not included (on purpose)
AI phone calls (needs a voice provider and explicit consent rules per country), payments/subscriptions for your own customers, automatic inbox reading (replies are pasted in and classified by AI).
