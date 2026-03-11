<div align="center">

# ✦ VastuChitra ArchViz

**A production-ready platform for hosting Unreal Engine architectural visualization experiences**

Built with Next.js 14 · Supabase · Framer Motion · Vercel

[Live Site]([https://vastuchitra.vercel.app](https://archviz-ook88r84k-veilafk.vercel.app/))

</div>

---

## What This Is

VastuChitra ArchViz is a full-stack platform that turns Vagon Pixel Streaming URLs into a polished, client-facing architectural showcase. Projects are managed entirely through an admin panel — no code changes or redeploys needed to publish, edit, or gate a project.

Clients get a branded experience: browse projects, fill a lead form, and launch a live Unreal Engine walkthrough in a new tab. High-value projects can be locked behind a password or SMS OTP before the stream opens.

---

## Features

| Category | What's included |
|---|---|
| **Public site** | Hero with animated canvas background, filterable project grid, about + contact sections, dark/light mode |
| **Project cards** | 5 hover effects (glow, tilt, tint, lift, border-trace), dual dark/light thumbnails, access type badges |
| **Lead capture** | Visitor form (name + email + phone) before stream launch — saved to Supabase |
| **Access control** | Per-project: Public, Password-protected, or SMS OTP |
| **OTP delivery** | Twilio → Vonage → Resend email fallback chain |
| **Private links** | Per-client tokenised URLs (`/p/[token]`) with optional expiry |
| **Admin panel** | 4 tabs: Projects (CRUD + access), Visitors (analytics), Site Config (CMS), Debug (visual) |
| **Live CMS** | All brand text, hero copy, contact details editable from admin — no redeploy |
| **Visual builder** | 5 font stacks, 10 colour themes, 4 hero variants, 5 carousel styles, 6 cursor variants |
| **Custom cursor** | dot-ring, magnetic, xray, ink-drop, torch, precision (desktop only) |

---

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS, Framer Motion
- **Fonts** — Cormorant Garamond (display) + DM Sans (body) + DM Mono
- **Database** — Supabase (Postgres + Storage)
- **Email** — Resend
- **SMS** — Twilio + Vonage (fallback)
- **Deployment** — Vercel

---

## Project Structure

```
archviz-platform/
├── app/
│   ├── layout.tsx              # Root layout — fonts, providers, cursor, navbar
│   ├── page.tsx                # Public homepage
│   ├── admin/page.tsx          # Admin panel (password-protected)
│   ├── p/[token]/page.tsx      # Private client link pages
│   └── api/
│       ├── admin-auth/         # POST — password validation (SHA-256)
│       ├── send-email/         # POST — Resend transactional email
│       └── send-otp/           # POST — Twilio → Vonage → Resend OTP
├── components/
│   ├── SiteConfigProvider.tsx  # Global CMS context (loads from Supabase)
│   ├── DebugPanel.tsx          # 8-tab live visual customiser
│   ├── LaunchModal.tsx         # Visitor form + access gate (public/pw/otp)
│   ├── ProjectCard.tsx         # Card with 5 hover variants + dual thumbnails
│   ├── ProjectCarousel.tsx     # Mobile/featured carousel
│   ├── CustomCursor.tsx        # 6-variant animated cursor
│   ├── Hero.tsx, Navbar.tsx, About.tsx, Contact.tsx, Footer.tsx
│   └── BackgroundCanvas.tsx    # WebGL gradient mesh animation
├── lib/
│   ├── supabase.ts             # All DB/storage functions
│   └── utils.ts                # cn() + haptic()
├── styles/globals.css          # Tailwind base + CSS custom properties
└── SCHEMA_V2.sql               # Full database setup SQL
```

---

## Database (Supabase)

Five tables, all with RLS enabled:

- **`projects`** — title, description, images (main/dark/light), stream URL, access type + password, sort order
- **`project_links`** — per-client tokenised links with optional expiry
- **`otp_codes`** — 6-digit codes, 10-minute expiry, single-use
- **`visitors`** — lead capture: name, email, phone, project, timestamp
- **`site_settings`** — JSON key/value: `site_config`, `debug_layout`, `debug_presets`

Storage bucket: **`project-images`** (public CDN) — images auto-deleted when a project is deleted.

---

## Access Control Flows

**Public** → Name + Email + Phone → stream launches

**Password** → Name + Email + Phone + Password → if wrong, shows "Contact Sales" popup with email + call buttons

**OTP** → Name + Email + Phone + [Send Code] → 6-box SMS code entry → verified → stream launches  
OTP delivery: Twilio SMS → Vonage SMS → Resend email (each tried if previous fails)

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ADMIN_PASSWORD_HASH=          # SHA-256 hex of your admin password
RESEND_API_KEY=

# SMS OTP (optional — falls back to email without these)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
VONAGE_API_KEY=
VONAGE_API_SECRET=
VONAGE_SENDER_ID=

# Email sender (optional — defaults to onboarding@resend.dev without custom domain)
EMAIL_FROM=noreply@yourdomain.com
```


## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `SCHEMA_V2.sql` in the SQL Editor
3. Confirm the `project-images` storage bucket is set to **Public**

### 2. Vercel

```bash
npm install -g vercel
vercel --prod
```

Add all environment variables in **Vercel → Settings → Environment Variables**, then redeploy.

### 3. Local dev

```bash
npm install
# create .env.local with NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
# → http://localhost:3000
```

---

## Customisation

| What | Where |
|---|---|
| Brand name + favicon | Admin → Site Config |
| Hero headline + CTA text | Admin → Site Config |
| Colour theme | Admin → Debug → Dark/Light themes |
| Font stack | Admin → Debug → Fonts |
| Card hover style | Admin → Site Config → Card Effect |
| Sales contact (password error popup) | `components/LaunchModal.tsx` — `SALES_EMAIL` + `SALES_PHONE` constants |
| Project types list | `lib/supabase.ts` — `ProjectType` union |

---

<div align="center">
<sub>VastuChitra ArchViz · Built with Next.js 14 + Supabase + Vercel · Made By VeilAFK (YumiNoona)</sub>
</div>
