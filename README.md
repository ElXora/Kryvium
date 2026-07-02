# Kryvium

AI assistant built especially for coding and complex problem solving — but talks about anything, like a normal assistant. Black/white theme with light/dark switcher, threaded chats, auto-titling, pin/rename/delete, model selector (Turbo / Tank), thinking mode, web search, image generation, custom instructions per user, and email sending via Google Apps Script.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Google Gemini API for chat (streaming) + image generation (Nano Banana)
- Supabase (optional) for accounts + persistent chat/image storage
- Google Apps Script for outbound email (contact/feedback)
- Zustand for client state

## Local setup

```bash
npm install
cp .env.example .env.local
# fill in .env.local
npm run dev
```

The app works without Supabase configured — chats, images, and profile settings save to the browser's localStorage instead, and login/register show a notice but the app stays fully usable without an account.

## Environment variables (set these in Vercel -> Project -> Settings -> Environment Variables)

| Name | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Powers chat, auto chat titles, and image generation |
| `NEXT_PUBLIC_SUPABASE_URL` | For accounts | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For accounts | Supabase anon/public key |
| `GOOGLE_SCRIPT_EMAIL_URL` | For email sending | Web App URL from the Apps Script below |

## Getting a Gemini API key

1. Go to aistudio.google.com/apikey (Google AI Studio).
2. Sign in, click "Create API key".
3. Copy it into Vercel as `GEMINI_API_KEY`.

Models used: `gemini-3.5-flash` (Kryvium Turbo), `gemini-3.1-pro` (Kryvium Tank), `gemini-2.5-flash-image` (image generation). Change these in `src/lib/types/index.ts` if you want different Gemini models.

## Setting up email sending (Google Apps Script)

The script is at `google-apps-script/Code.gs`.

1. Go to script.google.com -> New project, paste in `Code.gs`.
2. Set `TO_EMAIL` at the top to the address you want messages delivered to.
3. Deploy -> New deployment -> type "Web app" -> Execute as "Me" -> Who has access "Anyone".
4. Copy the Web App URL and set it as `GOOGLE_SCRIPT_EMAIL_URL` in Vercel.
5. Any time you edit `Code.gs`, redeploy via Deploy -> Manage deployments -> Edit -> New version, or the live URL won't update.

Your app can then POST to `/api/contact` with `{ name, email, subject, message }` and it'll relay to your inbox through the script — no email provider or SMTP credentials needed.

## When to add Supabase

Add it whenever you want real accounts and chats/images/settings saved server-side instead of per-browser localStorage. Steps:

1. Create a project at supabase.com.
2. Open the SQL editor, paste the contents of `supabase/schema.sql`, and run it. This creates `profiles` (including `custom_instructions`), `chats`, `messages`, and `generated_images` tables with row-level security so each user only sees their own data.
3. Copy your Project URL and anon public key from Supabase -> Settings -> API.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel and redeploy.

Once those two env vars are set, `/auth/login`, `/auth/register`, and `/settings` start persisting to Supabase automatically — no code changes needed.

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. Import it in Vercel.
3. Add the environment variables above.
4. Deploy.
