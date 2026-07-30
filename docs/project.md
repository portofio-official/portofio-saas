# Portofio — Status Project, Tech Stack, & Structure Overview

> **Dokumen Brainstorming Developer**  
> *Tanggal Pembaruan:* 28 Juli 2026  
> *Repositori:* `portofio-saas` (Portofio — SaaS Portfolio-Website Builder)

---

## 1. Ringkasan Proyek & Status Aktual (Current Actual State)

### 1.1 Deskripsi Proyek
**Portofio** adalah platform SaaS *portfolio-website builder* khusus untuk profesional, desainer, *developer*, dan *freelancer*. Berbeda dengan web builder umum yang menggunakan *drag-and-drop*, Portofio menggunakan pendekatan **Form + Structured Template**:
- **Pembuatan & Preview Gratis**: Pengguna dapat mendaftar, memilih template, mengisi data portofio (bio, proyek, pengalaman, keahlian, media), dan melihat *live preview* secara gratis.
- **Model Bisnis (Subscription Only)**: Mempublikasikan portofio ke subdomain publik (`nama.portofio.id`) memerlukan berlangganan berbayar (single plan subscription per bulan).
- **Multi-Tenancy Subdomain**: Pengunjung mengakses portofio pengguna melalui *wildcard subdomain* yang di-rewrite secara otomatis oleh Next.js Middleware.

---

### 1.2 Status Pengolahan & Fitur Terverifikasi (MVP Progress)

Project saat ini berada pada tahap **MVP Akhir / Hardening Phase**. Hampir seluruh fitur inti sudah diimplementasikan dan terverifikasi via tes/linting/build:

| Fitur / Modul | Status | Deskripsi Singkat |
| :--- | :---: | :--- |
| **`setup-001` Project Setup** | ✅ `passing` | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, linting & build pipeline bersih. |
| **`auth-001` Authentication** | ✅ `passing` | Supabase Auth (Email/Password, Magic Link, Reset Password, Cookie SSR session via `@supabase/ssr`). |
| **`workspace-001` Workspace & Profile** | ✅ `passing` | Manajemen workspace pengguna, upload aset (foto/logo), dan enkapsulasi profil. |
| **`data-001` Form & Schema** | ✅ `passing` | Dynamic portfolio form schema dengan fitur **Autosave** (debounced 1.5s), kompresi gambar client-side. |
| **`template-001` Template Engine** | ✅ `passing` | 6 pilihan template siap pakai: **Minimal**, **Bold**, **Studio**, **Creative**, **Dark**, **Corporate**. |
| **`template-002` Preview Canvas** | ✅ `passing` | Live Preview Modal dengan device switcher responsive (**Desktop 💻 / Tablet 📱 / Mobile 📱**). |
| **`publish-001` Subdomain Publishing** | ✅ `passing` | Subdomain validation, blocklist checking, Vercel wildcard rewrite (`[subdomain].portofio.id`) & fallback path `/sites/[subdomain]`. |
| **`dashboard-001` Dashboard UI** | 🟡 `in_progress` | User Dashboard, Editor UI, Template Selector, Analytics widget mockup & status subscription. |
| **`billing-001` Billing & Webhook Xendit** | ✅ `passing` | Xendit Invoice integration, Webhook signature verification, idempotency (`billing_events`), 7-day grace period, soft-unpublish logic. |
| **`arch-001` Project Architecture** | ✅ `passing` | Arsitektur data terpisah antara `workspaces`, `workspace_profile`, dan `projects` (JSON payload). |
| **`rbac-001` Role-Based Access Control** | ✅ `passing` | Role system (`user`, `designer`, `admin`) tersinkronisasi dari Supabase custom claims ke RLS database. |

---

## 2. Tech Stack Detail

| Kategori | Teknologi / Library | Penggunaan / Peran |
| :--- | :--- | :--- |
| **Core Framework** | **Next.js 16.2.10 (App Router)** | Framework utama dengan React 19 & Turbopack. Memanfaatkan Server Components & Server Actions. |
| **Language** | **TypeScript 5** | Strict type-checking pada seluruh payload form, API routes, dan Supabase schemas. |
| **Styling & UI** | **Tailwind CSS v4** + **CSS Modules** | Tailwind CSS v4 untuk App Shell (Dashboard/Auth/Editor), CSS Modules untuk Landing Page porting design system. |
| **UI Component Primitives** | **Radix UI** (`@radix-ui/*`) | Primitives accessible untuk Switch, Label, Slot, dll. |
| **Animation & Micro-interaction** | **Framer Motion 12**, **GSAP 3**, `@number-flow/react`, `canvas-confetti` | Animasi transisi halaman, micro-animation, visual counter angka berbayar, dan efek selebrasi publish. |
| **Icons** | **Lucide React**, **Phosphor Icons** | Ikon visual konsisten untuk dashboard, form editor, dan landing page. |
| **Internationalization (i18n)** | **next-intl 4.13.2** | Mendukung multi-bahasa (**Bahasa Indonesia `id`** & **English `en`**). |
| **Database & Auth** | **Supabase (PostgreSQL + RLS)** | Database PostgreSQL, RLS (Row Level Security), Storage Bucket untuk file upload, Edge Functions untuk Auth Claims. |
| **Auth Integration** | **`@supabase/ssr` & `@supabase/supabase-js`** | Autentikasi berbasis cookie SSR yang aman antara server dan client Next.js. |
| **Payment Gateway** | **Xendit API & Webhooks** | Pembuatan Invoice Xendit, webhook handler otomatis, verifikasi signature HMAC, idempotency logging. |
| **Deployment & Hosting** | **Vercel** | Hosting Next.js App Router dengan dukungan *Wildcard Subdomain Domains* (`*.portofio.id`). |

---

## 3. Struktur Direktori Proyek (Project Directory Tree)

```text
portofio-saas/
├── .env.example                # Template variabel lingkungan (Supabase, Xendit, App URL)
├── AGENTS.md                   # Aturan kerja & workflow agentic coding
├── CLAUDE.md                   # Panduan singkat dev commands
├── DESIGN.md                   # Design System & brand guideline (light mode only)
├── PRD.md                      # Product Requirement Document utama
├── REQUIREMENT.md              # Ringkasan requirement teknis
├── TASK_TRACKER.md             # Status log task manual
├── claude-progress.md          # History verified state & log sesi kerja
├── feature_list.json           # Source of truth status modul fitur
├── init.sh                     # Script inisialisasi & verifikasi awal
├── next.config.ts              # Konfigurasi Next.js
├── package.json                # Dependensi & script pnpm/npm
├── postcss.config.mjs          # Konfigurasi PostCSS / Tailwind CSS v4
├── tsconfig.json               # Konfigurasi TypeScript compiler
│
├── docs/                       # Dokumentasi arsitektur & spec (RBAC, dll)
│   ├── progress-archive.md
│   └── superpowers/
│       ├── plans/
│       └── specs/
│
├── messages/                   # File kamus penerjemahan i18n
│   ├── en.json                 # Bahasa Inggris
│   └── id.json                 # Bahasa Indonesia
│
├── public/                     # Aset statis (Font lokal, Gambar Template, Logo)
│   ├── fonts/                  # ClashDisplay, Inter, JetBrainsMono, PlayfairDisplay, Poppins
│   ├── Logo-Portofio-white.png
│   └── portrait-*.png
│
├── src/                        # Kode Utama Aplikasi
│   ├── proxy.ts                # Middleware rewrite untuk Subdomain Routing (*.portofio.id)
│   │
│   ├── app/                    # Next.js App Router Routes
│   │   ├── favicon.ico
│   │   ├── [locale]/           # Halaman utama berwawasan i18n (Indonesia / English)
│   │   │   ├── layout.tsx      # Root Layout dengan i18n Provider
│   │   │   ├── page.tsx        # Marketing Landing Page
│   │   │   ├── globals.css     # Design tokens & style global
│   │   │   ├── login/          # Auth - Login Page
│   │   │   ├── signup/         # Auth - Signup Page
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── dashboard/      # User Dashboard & Portfolio Editor
│   │   │   ├── templates/      # Template Showcase / Gallery Page
│   │   │   └── admin/          # Admin Dashboard (RBAC protected)
│   │   │
│   │   ├── api/                # API Routes & Webhook handlers
│   │   │   └── webhooks/
│   │   │       └── xendit/     # Endpoint Webhook Payment Xendit
│   │   │
│   │   ├── auth/               # Route callback autentikasi (Confirm Email / Magic Link)
│   │   │   └── confirm/
│   │   │
│   │   └── sites/              # Route penanganan portofio publik berdasarkan subdomain
│   │       └── [subdomain]/    # Dynamic route hasil rewrite dari proxy.ts
│   │
│   ├── components/             # Komponen UI React
│   │   ├── ui/                 # Reusable UI primitives (Button, Input, FormPanel)
│   │   ├── landing/            # Komponen Halaman Utama (Hero, Pricing, TemplateShowcase, FAQ, Footer)
│   │   ├── auth/               # Komponen Layout & Form Autentikasi
│   │   ├── workspace/          # Form pembuatan workspace
│   │   ├── dashboard/          # Editor UI, Sidebar, Live Preview Wrapper, Template Gallery
│   │   ├── portfolio/          # Komponen Form Section (Photo upload, Repeatable list)
│   │   ├── admin/              # Komponen Khusus Admin
│   │   └── templates/          # Renderer Template Portofio (Minimal, Bold, Studio, Creative, Dark, Corporate)
│   │       ├── registry.tsx    # Mapping registry id template ke komponen React
│   │       ├── shared.tsx
│   │       ├── minimal/
│   │       ├── bold/
│   │       ├── studio/
│   │       ├── creative/
│   │       ├── dark/
│   │       └── corporate/
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   └── useAutosave.ts      # Debounced autosave hook untuk form editor
│   │
│   ├── i18n/                   # Konfigurasi routing & request next-intl
│   │   ├── navigation.ts
│   │   ├── request.ts
│   │   └── routing.ts
│   │
│   └── lib/                    # Logic bisnis, Server Actions, & Utilitas Data
│       ├── admin/              # Action admin & user suspension
│       ├── auth/               # Session helper, auth actions, role checks
│       ├── billing/            # Integration Xendit, invoice creation, subscription state machine, soft-unpublish
│       ├── projects/           # Operations CRUD project portofio
│       ├── supabase/           # Client Supabase (client, server, admin service_role)
│       ├── templates/          # Zod Schemas & Tipe Data JSON Template Portofio
│       ├── utils/              # Image compression & formatting helpers
│       └── workspace/          # Operations CRUD workspace & profile
│
└── supabase/                   # Konfigurasi & Migrasi Database Supabase
    ├── functions/
    │   └── custom-claims/      # Supabase Edge Function untuk auto-set JWT claims role user
    └── migrations/             # SQL Migrations (17 file SQL berurutan)
        ├── 20260713000000_init_schema.sql
        ├── 20260716000001_add_workspace_profile.sql
        ├── 20260716000003_add_projects.sql
        ├── 20260716000006_add_subscriptions.sql
        ├── 20260719000001_add_profiles.sql
        ├── 20260719000002_add_billing_events.sql
        ├── 20260719000003_add_subdomain_blocklist.sql
        ├── 20260720000001_add_admin_read_policies.sql
        ├── 20260727000001_fix_rls_policies_and_stale_references.sql
        └── 20260727000002_update_subscription_statuses.sql
```

---

## 4. Ringkasan Skema Database & Model Data (Supabase Postgres)

Arsitektur database mengadopsi prinsip **Separation of Profile & Content Payload**:

1. **`profiles`**:
   - Menyimpan data identitas user (`id`, `email`, `role`: `'user' | 'designer' | 'admin'`, `created_at`).
   - Trigger otomatis mensinkronkan `role` ke `auth.users.raw_app_meta_data` (Custom Claims).
2. **`workspaces`**:
   - Entitas workspace utama milik user (`id`, `owner_id`, `name`, `subdomain`, `created_at`).
3. **`workspace_profile`**:
   - Informasi profil pemilik portofio (nama lengkap, headline, bio, kontak, avatar_url, media sosial).
4. **`workspace_assets`**:
   - Metadata media/foto proyek yang diunggah ke Supabase Storage.
5. **`projects`**:
   - Menyimpan data struktur portofio lengkap dalam bentuk **JSONB Payload** (`content_json`), `template_id`, `status` (`'draft' | 'published'`), dan `published_at`.
6. **`subscriptions`**:
   - Data status berlangganan Xendit (`status`: `'active' | 'inactive' | 'grace_period' | 'expired' | 'canceled'`, `xendit_invoice_id`, `current_period_end`).
7. **`billing_events`**:
   - Audit log penerimaan webhook Xendit untuk memfasilitasi **Idempotency** via `xendit_event_id`.
8. **`subdomain_blocklist`**:
   - Daftar kata subdomain terlarang (misal: `admin`, `api`, `dashboard`, `root`, `null`, `undefined`).

---

## 5. Topik Poin Diskusi & Brainstorming Developer

Dokumen ini disiapkan untuk mendiskusikan beberapa poin strategis dengan tim developer:

### 💡 Poin 1: Templating Engine & Extensibility
- **Kondisi Sekarang:** Template ditaruh di `src/components/templates/` dan di-registry lewat `registry.tsx`. Data konten di-pass sebagai JSON payload yang divalidasi oleh Zod schema (`_base.ts`).
- **Diskusi:** Apakah struktur JSON schema saat ini sudah mencukupi untuk mendukung 10+ template baru di masa mendatang tanpa breaking changes pada data lama pengguna?

### 💡 Poin 2: Multi-Tenancy & Custom Domain Strategy
- **Kondisi Sekarang:** Subdomain di-rewrite via Next.js Middleware (`src/proxy.ts`) mengarahkan request `nama.portofio.id` ke route `/sites/[subdomain]`. Terdapat juga fallback URL path `/sites/[subdomain]` untuk kemudahan testing tanpa DNS wildcard local.
- **Diskusi:** Apakah kita perlu merencanakan dukungan **Custom Domain** (misal: `www.namapengguna.com`) di Fase 2? Bagaimana integrasi Vercel Domains API & SSL certificate provisioning-nya?

### 💡 Poin 3: Ketahanan Webhook Xendit & Failure Recovery
- **Kondisi Sekarang:** Webhook handler di `/api/webhooks/xendit` melakukan verifikasi token signature HMAC, pengecekan idempotency `billing_events`, dan mengatur *7-day grace period* sebelum melakukan *soft-unpublish* (mengubah `projects.status` dari `'published'` ke `'draft'`).
- **Diskusi:** Bagaimana skenario jika Xendit mengalami delay pemicuan webhook atau ketika user melakukan retry pembayaran di saat status berada dalam *grace period*?

### 💡 Poin 4: Performa & Optimasi Autosave Editor
- **Kondisi Sekarang:** Hook `useAutosave` melakukan debounce 1.5 detik saat user mengetik di form editor dan mengirimkan perubahan ke Supabase Server Action.
- **Diskusi:** Apakah perlu menambahkan indicator visual *save status* ("Saved", "Saving...", "Unsaved changes") atau offline fallback jika koneksi internet terputus?

---

> Dokumen ini dibuat secara otomatis dan komprehensif berdasarkan keadaan aktual repositori `portofio-saas`. Dapat langsung digunakan sebagai acuan diskusi / brainstorming bersama tim dev!
