# Portofio — Database Schema Reference

> Dokumen satu-file berisi **seluruh skema database Supabase** project `portofio`
> (`yvjwqammizdipwalvets`, Postgres 17). Dihasilkan 2026-08-14 dari skema live
> (bukan hanya dari folder `supabase/migrations/`), jadi ini adalah source of truth
> kondisi DB saat ini.
>
> Riwayat perubahan skema ada di `supabase/migrations/*.sql`. DDL lengkap yang bisa
> menciptakan ulang skema ada di **Lampiran A**.

---

## 1. Ringkasan

- **Schema:** `public` (aplikasi) + `auth` (Supabase Auth) + `storage` (Supabase Storage).
- **Model role:** `user` / `designer` / `admin` (tersimpan di `profiles.role` dan
  disinkronkan ke `auth.users.raw_app_meta_data.role` lewat trigger).
- **Model billing:** tiered `plans` (Basic/Premium/Enterprise × monthly/annual),
  satu `subscriptions` per `user_id`, entitlement diselesaikan server-side lewat
  `get_user_entitlements()`.
- **Multi-tenant:** `workspaces` (kepemilikan user) → `projects` (situs) → `project_versions`
  (riwayat konten draft/live). Satu akun maksimal 1 website `published`.
- **RLS aktif di semua tabel aplikasi.** Tulis data pengguna umumnya via service-role
  (server action / webhook), bukan via anon key.

### Peta relasi utama

```
auth.users
 ├── profiles (1:1, PK = users.id)
 ├── workspaces (1:N, user_id)
 │    ├── workspace_profile (1:1, PK = workspace_id)
 │    ├── workspace_assets (1:N)
 │    └── projects (1:N)
 │         ├── project_versions (1:N; current_version_id, published_version_id)
 │         ├── page_visits (1:N)
 │         └── section_visits (1:N)
 ├── content_library (1:N, user_id)
 ├── subscriptions (1:1, user_id UNIQUE) ──► plans (plan_id)
 ├── billing_events (1:N, user_id)
 ├── payment_transactions (1:N, user_id; subscription_id ► subscriptions)
 ├── template_submissions (1:N, designer_id)
 └── admin_audit_logs (actor_id ► users)

Referensi global: templates (id text), plans (id text), subdomain_blocklist (slug PK)
```

---

## 2. Tabel

### 2.1 `admin_audit_logs`
Audit trail aksi privileged Admin (role, suspend, blocklist, template, review, integrasi).

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| actor_id | uuid | YES | — | admin yang melakukan aksi (FK ► auth.users) |
| action | text | NO | — | e.g. `user.role_change`, `user.suspension` |
| target_type | text | NO | — | e.g. `user`, `template`, `submission` |
| target_id | text | YES | — | id target (text agar fleksibel) |
| metadata | jsonb | NO | '{}' | detail aksi |
| created_at | timestamptz | NO | now() | |

**Indexes:** `admin_audit_logs_actor_idx (actor_id, created_at DESC)`, `admin_audit_logs_created_idx (created_at DESC)`, `admin_audit_logs_target_idx (target_type, target_id)`.

**RLS:** `admin_audit_logs_admin_select` — SELECT untuk `authenticated` di mana `auth.jwt().app_metadata.role = 'admin'`. Tulis hanya service-role.

### 2.2 `billing_events`
Log mentah event payment provider (Midtrans) untuk idempotency + audit.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | YES | — | FK ► auth.users |
| provider_event_id | text | NO | — | kunci idempotency `order_id:transaction_status` (UNIQUE) |
| event_type | text | NO | — | e.g. `midtrans.settlement` |
| payload | jsonb | NO | '{}' | payload webhook mentah |
| processed_at | timestamptz | NO | now() | |

**Indexes:** `billing_events_event_type_idx`, `billing_events_provider_event_id_idx` (UNIQUE, pada kolom yang sama dengan constraint legacy `billing_events_xendit_event_id_key`), `billing_events_user_id_idx`.

**RLS:** `billing_events_owner_select` — SELECT untuk `authenticated` di mana `user_id = auth.uid()`. Tulis hanya service-role.

### 2.3 `content_library`
Content Library account-global (milik user, bukan workspace): reusable Projects, Testimonials, Certificates, Experience, Education, Publications, Media, Case Study, Gallery.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | NO | — | FK ► auth.users (account-global) |
| title | text | NO | '' | |
| description | text | NO | '' | |
| image_url | text | NO | '' | |
| link | text | NO | '' | |
| content_type | text | NO | 'project' | CHECK: project, testimonial, certificate, experience, education, publication, media, caseStudy, gallery |
| content_json | jsonb | NO | '{}' | data terstruktur per tipe |
| is_active | boolean | NO | true | item aktif masuk resolusi template |
| sort_order | integer | NO | 0 | urutan global |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

**Indexes:** `content_library_user_idx (user_id)`, `content_library_user_type_order_idx (user_id, content_type, is_active, sort_order)`.

**RLS:** `content_library_owner_all` (ALL untuk `public`) di mana `user_id = auth.uid()` — akses penuh pemilik, tidak ada akses lintas-user.

### 2.4 `entitlements`
Resolver capability per tier (PRD §9.4). **Tidak boleh ditentukan dari client.**

| kolom | tipe | nullable | default |
|---|---|---|---|
| tier | text | NO | — (PK; CHECK: basic, premium, enterprise) |
| max_live_websites | integer | NO | 1 |
| publish_subdomain | boolean | NO | false |
| custom_domain | boolean | NO | false |
| watermark | boolean | NO | true |
| advanced_analytics | boolean | NO | false |
| priority_support | boolean | NO | false |
| premium_templates | boolean | NO | false |

**RLS:** `entitlements_read_authenticated` — SELECT untuk `authenticated`.

### 2.5 `page_visits`
Visitor analytics (beacon `/api/track`). Hanya insert utk situs published.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| project_id | uuid | NO | — | FK ► projects |
| subdomain | text | NO | — | |
| page_path | text | NO | '/' | |
| visitor_hash | text | YES | — | hash anonim, bukan PII |
| referrer_host | text | YES | — | hanya host, bukan URL mentah |
| device_type | text | NO | 'other' | mobile/desktop/tablet/other |
| browser | text | YES | — | |
| country_code | text | YES | — | |
| created_at | timestamptz | NO | now() | |

**Indexes:** `page_visits_project_created_idx (project_id, created_at DESC)`, `page_visits_project_visitor_idx (project_id, visitor_hash)`.

**RLS:**
- `page_visits_public_insert` — INSERT untuk `anon, authenticated` jika project `published`.
- `page_visits_owner_all` — akses pemilik via chain project→workspace.

### 2.6 `payment_transactions`
Transaksi pembayaran (legacy Xendit). Midtrans mencatat ke `billing_events` + `subscriptions`.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | NO | — | FK ► auth.users |
| subscription_id | uuid | YES | — | FK ► subscriptions |
| xendit_invoice_id | text | NO | — | UNIQUE (belum di-rename, nama legacy) |
| amount | integer | NO | — | |
| currency | text | NO | 'IDR' | |
| status | text | NO | 'pending' | CHECK: pending, paid, expired, failed |
| paid_at | timestamptz | YES | — | |
| raw_payload | jsonb | YES | — | |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

**RLS:** `payment_transactions_owner_read` — SELECT untuk `authenticated` di mana `user_id = auth.uid()`.

### 2.7 `plans`
Katalog plan berbayar (PRD v1.9). Harga = snapshot placeholder, bisa diubah Admin.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | text | NO | — | PK, e.g. `basic-monthly` |
| tier | text | NO | — | CHECK: basic, premium, enterprise |
| billing_cycle | text | NO | — | CHECK: monthly, annual |
| name | text | NO | — | Basic / Premium / Enterprise |
| price_idr | integer | NO | — | CHECK > 0 |
| midtrans_product_id | text | NO | — | item id ke Midtrans Snap |
| is_active | boolean | NO | true | |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | auto-update trigger |

**Constraint:** UNIQUE `(tier, billing_cycle)`.
**RLS:** `plans_read_anyone` — SELECT untuk `anon, authenticated` (harga publik). Tulis service-role.

**Seed (6 baris):**

| id | tier | cycle | price_idr | midtrans_product_id |
|---|---|---|---|---|
| basic-monthly | basic | monthly | 49000 | portofio-basic-monthly |
| basic-annual | basic | annual | 490000 | portofio-basic-annual |
| premium-monthly | premium | monthly | 99000 | portofio-premium-monthly |
| premium-annual | premium | annual | 990000 | portofio-premium-annual |
| enterprise-monthly | enterprise | monthly | 199000 | portofio-enterprise-monthly |
| enterprise-annual | enterprise | annual | 1990000 | portofio-enterprise-annual |

### 2.8 `profiles`
Profil akun + role. Dibuat otomatis oleh trigger `handle_new_user`.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | — | PK = auth.users.id (FK) |
| full_name | text | YES | — | |
| avatar_url | text | YES | — | |
| locale | text | NO | 'id' | CHECK: id, en |
| role | text | NO | 'user' | CHECK: user, designer, admin; dilarang diubah sendiri (trigger) |
| phone | text | YES | — | format internasional `+<CC> <national>` |
| address | text | YES | — | |
| nickname | text | YES | — | |
| headline | text | YES | — | |
| bio | text | YES | — | |
| contact_email | text | YES | — | |
| socials | jsonb | YES | '[]' | array social link |
| skills | jsonb | YES | '[]' | array skill |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | auto-update trigger |

**Indexes:** `profiles_role_idx (role)`.
**RLS:**
- `profiles_owner_select` — SELECT pemilik.
- `profiles_owner_update` — UPDATE pemilik (tapi role di-proteksi trigger).
- `profiles_admin_select_all` — SELECT untuk admin (operasional/support).

**Triggers:** `handle_new_user` (auth.users AFTER INSERT), `prevent_profile_role_change`, `sync_role_to_auth_metadata`, `profiles_updated_at`. Lihat §5.

### 2.9 `project_versions`
Riwayat konten project (WebsiteDocument jsonb). Draft autosave + published snapshot.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| project_id | uuid | NO | — | FK ► projects |
| version_number | integer | NO | — | UNIQUE per project |
| content_json | jsonb | NO | — | WebsiteDocument `{meta, data}` |
| schema_version | integer | NO | 1 | |
| is_autosave | boolean | NO | true | |
| created_by | uuid | YES | — | FK ► auth.users |
| created_at | timestamptz | NO | now() | |

**Indexes:** `project_versions_project_id_idx`, UNIQUE `project_versions_project_version_idx (project_id, version_number)`.

**RLS:**
- `project_versions_owner_all` — pemilik via chain project→workspace.
- `project_versions_public_read_published` — SELECT publik hanya utk versi yang sedang `published`.

### 2.10 `projects`
Situs/portfolio per workspace. Konten ada di `project_versions`.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| workspace_id | uuid | NO | — | FK ► workspaces |
| name | text | NO | — | |
| template_id | text | NO | — | referensi `templates.id` |
| template_version | integer | NO | 1 | |
| subdomain | text | YES | — | UNIQUE; wajib saat published |
| status | text | NO | 'draft' | CHECK: draft, published |
| current_version_id | uuid | YES | — | FK ► project_versions (draft aktif) |
| published_version_id | uuid | YES | — | FK ► project_versions (snapshot live) |
| published_at | timestamptz | YES | — | |
| profile_synced_at | timestamptz | YES | now() | |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

**Constraint:** CHECK `status <> 'published' OR subdomain IS NOT NULL`.
**Indexes:** UNIQUE `projects_subdomain_key (subdomain)`, `projects_subdomain_idx` (partial, subdomain NOT NULL), `projects_published_subdomain_idx` (partial, status='published'), `projects_workspace_id_idx`.

**RLS:**
- `projects_owner_all` — pemilik via workspace.
- `projects_public_read_published` — SELECT publik untuk `status='published'`.

**RPC:** `publish_project(p_project_id, p_subdomain)` — SECURITY DEFINER; memindahkan `current_version_id → published_version_id`, set subdomain/status. Lihat §4.

### 2.11 `section_visits`
Section engagement analytics (SP2-031). Hanya insert utk situs published.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| project_id | uuid | NO | — | FK ► projects |
| subdomain | text | NO | — | |
| section_key | text | NO | — | dari `data-section-key` |
| section_label | text | YES | — | dari heading h1/h2/h3 |
| page_path | text | NO | '/' | |
| visitor_hash | text | YES | — | |
| device_type | text | NO | 'other' | |
| created_at | timestamptz | NO | now() | |

**Indexes:** `section_visits_project_created_idx`, `section_visits_project_visitor_idx`.
**RLS:** `section_visits_public_insert` + `section_visits_owner_all` (sama pola dengan `page_visits`).

### 2.12 `subdomain_blocklist`
Kata terlarang/ter-reservasi untuk nama subdomain.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| slug | text | NO | — | PK; CHECK `slug = lower(slug)` |

**RLS:** `subdomain_blocklist_public_select` — SELECT untuk `anon, authenticated`. Tulis admin/service-role.

### 2.13 `subscriptions`
Satu subscription aktif per akun (UNIQUE `user_id`).

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | NO | — | FK ► auth.users; UNIQUE |
| status | text | NO | 'inactive' | CHECK: active, inactive, grace_period, expired, canceled |
| plan_id | text | YES | — | FK ► plans |
| billing_cycle | text | YES | — | CHECK: monthly, annual |
| plan_snapshot | jsonb | YES | — | {tier, name, billing_cycle, price_idr} saat purchase |
| current_period_start | timestamptz | YES | — | |
| current_period_end | timestamptz | YES | — | |
| expires_at | timestamptz | YES | — | = end of period (deprecated alias) |
| cancel_at_period_end | boolean | NO | false | |
| provider_order_id | text | YES | — | Midtrans order id |
| provider_transaction_id | text | YES | — | Midtrans transaction id |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | |

**Indexes:** UNIQUE `subscriptions_user_id_unique_idx (user_id)`, `subscriptions_plan_id_idx (plan_id)`.
**RLS:** `subscriptions_owner_read` + `subscriptions_owner_select` — SELECT pemilik. Tulis webhook/service-role.
**Catatan:** status dipakai state machine: `active` (dgn expires_at masa depan) / `grace_period` (7 hari) / `expired` / `canceled`. Grace period & auto-unpublish ditangani di kode (`src/lib/billing/`).

### 2.14 `template_submissions`
Submission template oleh Designer (private ZIP di Storage).

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | uuid | NO | gen_random_uuid() | PK |
| designer_id | uuid | NO | — | FK ► auth.users |
| name | text | NO | — | |
| description | text | YES | — | |
| preview_url | text | YES | — | |
| preview_mobile_url | text | YES | — | |
| category | text | YES | — | CHECK: minimal, creative, corporate, developer, agency, other |
| tags | text[] | NO | '{}' | |
| status | text | NO | 'pending' | CHECK: draft, pending, approved, rejected, revision_requested |
| reviewed_by | uuid | YES | — | FK ► auth.users |
| reviewed_at | timestamptz | YES | — | |
| review_notes | text | YES | — | |
| registry_id | text | YES | — | UNIQUE; diisi saat integrasi |
| integration_status | text | NO | 'not_started' | CHECK: not_started, in_review, merged, failed |
| integration_notes | text | YES | — | |
| integrated_at | timestamptz | YES | — | |
| source_url | text | YES | — | (legacy) |
| source_path | text | YES | — | path ZIP privat di Storage |
| source_filename | text | YES | — | |
| source_size_bytes | integer | YES | — | |
| submitted_at | timestamptz | YES | — | |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | auto-update trigger |

**Indexes:** `template_submissions_designer_id_idx`, `template_submissions_integration_status_idx`, `template_submissions_registry_id_key` (UNIQUE), `template_submissions_status_idx`.

**RLS:**
- `template_submissions_designer_insert` — INSERT jika `designer_id = auth.uid()` dan role designer/admin.
- `template_submissions_designer_select` — SELECT milik sendiri.
- `template_submissions_designer_update` — UPDATE milik sendiri hanya saat status `draft`/`revision_requested`.
- `template_submissions_admin_all` — akses penuh untuk admin.

**Trigger:** `protect_template_submission_review_fields` — non-admin tidak bisa mengubah field review/integrasi. Lihat §5.

### 2.15 `templates`
Katalog operasional template built-in. Schema/renderer ada di codebase (`src/templates/registry.tsx`), visibility + minimum plan di DB.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| id | text | NO | — | PK, e.g. `minimal` |
| name | text | NO | — | |
| is_active | boolean | NO | true | visibility katalog |
| minimum_plan | text | NO | 'basic' | CHECK: basic, premium, enterprise |
| created_at | timestamptz | NO | now() | |

**RLS:** `templates_public_select` (SELECT anon+authenticated), `templates_admin_update` (UPDATE admin).

**Seed (8 baris):** `minimal`, `bold`, `creative`, `corporate`, `dark`, `freelancer`, `studio`, `portfolio-pro` — semua `minimum_plan = 'basic'`.

### 2.16 `workspace_assets`
Pustaka aset per workspace (stub, belum ada UI upload khusus).

| kolom | tipe | nullable | default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() (PK) |
| workspace_id | uuid | NO | — (FK ► workspaces) |
| name | text | NO | — |
| url | text | NO | — |
| mime_type | text | YES | — |
| size_bytes | bigint | YES | — |
| created_at | timestamptz | NO | now() |

**RLS:** `workspace_assets_owner_all` — pemilik via workspace.

### 2.17 `workspace_profile`
Profil brand per workspace (1:1). Dipakai auto-fill project baru + prop renderer.

| kolom | tipe | nullable | default | catatan |
|---|---|---|---|---|
| workspace_id | uuid | NO | — | PK = FK ► workspaces |
| name | text | YES | — | |
| logo_url | text | YES | — | |
| email | text | YES | — | |
| phone | text | YES | — | |
| address | text | YES | — | |
| website_url | text | YES | — | |
| extended_data | jsonb | NO | '{}' | tagline, description, socials |
| updated_at | timestamptz | NO | now() | |

**RLS:**
- `workspace_profile_owner_all` — pemilik via workspace.
- `workspace_profile_public_read` — SELECT anon jika ada project published (catatan: expression memakai `p.workspace_id = p.workspace_id`, self-comparison; efektif membuka read saat project published).

### 2.18 `workspaces`
Workspace = satu brand/portofolio milik user.

| kolom | tipe | nullable | default |
|---|---|---|---|
| id | uuid | NO | gen_random_uuid() (PK) |
| user_id | uuid | NO | — (FK ► auth.users) |
| name | text | NO | — |
| created_at | timestamptz | NO | now() |

**Indexes:** `workspaces_user_id_idx (user_id)`.
**RLS:**
- `workspaces_owner_all` — pemilik.
- `workspaces_public_read_published` — SELECT anon jika ada project published (utk situs publik).

---

## 3. Storage Buckets + Policy

### 3.1 Bucket `content` (public)
- `public = true`, limit 8 MB, mime: `image/png`, `image/jpeg`, `image/webp`, `image/gif`.
- Path: `content/<user_id>/<uuid>.<ext>` (per-user folder).

Policy `storage.objects`:
| policy | cmd | qual / with_check |
|---|---|---|
| content_objects_public_read | SELECT | bucket_id = 'content' |
| content_objects_authenticated_write_own_folder | INSERT | folder[1] = auth.uid() |
| content_objects_authenticated_update_own_folder | UPDATE | folder[1] = auth.uid() |
| content_objects_authenticated_delete_own_folder | DELETE | folder[1] = auth.uid() |

### 3.2 Bucket `template-submissions` (private)
- `public = false`. Path: `template-submissions/<user_id>/<uuid>.zip`.
- File ZIP privat; akses download via signed URL dari server (admin/designer).

Policy `storage.objects`:
| policy | cmd | qual / with_check |
|---|---|---|
| template_submissions_source_insert | INSERT | role designer/admin DAN folder[1] = auth.uid() |
| template_submissions_source_select | SELECT | folder[1] = auth.uid() ATAU role admin |
| template_submissions_source_update | UPDATE | folder[1] = auth.uid() |
| template_submissions_source_delete | DELETE | folder[1] = auth.uid() ATAU role admin |

---

## 4. Functions / RPC

| fungsi | return | security | keterangan |
|---|---|---|---|
| `current_role()` | text | invoker | `auth.jwt() -> app_metadata ->> 'role'`, fallback `'user'` |
| `get_user_entitlements(target_user_id uuid default auth.uid())` | TABLE(...) | invoker | resolve entitlement dari subscriptions(active/grace) → plans → entitlements; 0 baris = gratis |
| `publish_project(p_project_id uuid, p_subdomain text)` | void | DEFINER | validasi kepemilikan workspace, set published_version_id = current_version_id, subdomain, status='published' |
| `handle_new_user()` | trigger | DEFINER | insert `profiles` default role `user` saat `auth.users` dibuat |
| `prevent_profile_role_change()` | trigger | DEFINER | user tidak bisa mengubah `profiles.role` miliknya sendiri |
| `sync_role_to_auth_metadata()` | trigger | DEFINER | sinkron `profiles.role` → `auth.users.raw_app_meta_data.role` |
| `protect_template_submission_review_fields()` | trigger | DEFINER | non-admin tidak bisa mengubah field review/integrasi submission |
| `set_updated_at()` | trigger | invoker | `updated_at = now()` |
| `set_plans_updated_at()` | trigger | invoker | `plans.updated_at = now()` |

---

## 5. Triggers

| tabel | trigger | event |
|---|---|---|
| auth.users | `handle_new_user` (via `on_auth_user_created` di Supabase) | AFTER INSERT |
| profiles | `prevent_profile_role_change` | BEFORE UPDATE |
| profiles | `sync_role_to_auth_metadata` | AFTER INSERT / UPDATE |
| profiles | `profiles_updated_at` | BEFORE UPDATE |
| template_submissions | `protect_template_submission_review_fields` | BEFORE UPDATE |
| template_submissions | `template_submissions_updated_at` | BEFORE UPDATE |
| plans | `plans_touch_updated_at` | BEFORE UPDATE |

---

## 6. Migrasi (riwayat file di repo)

Urutan `supabase/migrations/`:
`20260713000000_init_schema` → `...01_fix_workspaces_rls_recursion` → `...02_sites_nullable_subdomain` → `2026071600000{1..6}` (workspace_profile, assets, projects, publish RPC, drop legacy, subscriptions) → `2026071900000{1..4}` (profiles, billing_events, blocklist, template_submissions) → `20260720000001_add_admin_read_policies` → `20260720131552_add_active_templates` → `2026072700000{1,2}` (RLS fix, subscription statuses) → `2026072800000{1,2}` (project_versions, profile_synced_at) → `2026073100000{1,2}` (subscriptions schema, published RLS) → `20260805000000_expand_profiles` → `20260808000001_add_freelancer_template` → `20260809000001_add_content_library` → `2026081000000{1..5}` (content sources, global, midtrans, visitor analytics, content types) → `2026081100000{6..10}` (section engagement, role boundaries, designer submissions, reconcile schema, admin audit) → `20260814000000_tiered_billing` (plans/entitlements/minimum_plan).

> Catatan: `20260811080200` satu-satunya versi yang tercatat di `supabase_migrations.schema_migrations` (sebagian besar diterapkan manual via SQL Editor / management API).

---

## Lampiran A — DDL penuh untuk menciptakan ulang skema `public`

> DDL berikut merekonstruksi kondisi **saat ini** (idempotent-friendly, tanpa data user).
> Eksekusi berurutan dari atas ke bawah pada project Supabase baru.

```sql
-- =====================================================================
-- Portofio public schema (reconstruct 2026-08-14)
-- =====================================================================

-- profiles -------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  locale text not null default 'id' check (locale in ('id','en')),
  role text not null default 'user' check (role in ('user','designer','admin')),
  phone text,
  address text,
  nickname text,
  headline text,
  bio text,
  contact_email text,
  socials jsonb default '[]',
  skills jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role);
alter table public.profiles enable row level security;
create policy "profiles_owner_select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_owner_update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_select_all" on public.profiles for select to authenticated using (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin');

-- workspaces -----------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists workspaces_user_id_idx on public.workspaces(user_id);
alter table public.workspaces enable row level security;
create policy "workspaces_owner_all" on public.workspaces for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "workspaces_public_read_published" on public.workspaces for select to anon using (exists (select 1 from public.projects p where p.workspace_id = workspaces.id and p.status = 'published'));

-- workspace_profile -----------------------------------------------------
create table if not exists public.workspace_profile (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  name text, logo_url text, email text, phone text, address text, website_url text,
  extended_data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.workspace_profile enable row level security;
create policy "workspace_profile_owner_all" on public.workspace_profile for all to authenticated
  using (exists (select 1 from public.workspaces w where w.id = workspace_profile.workspace_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workspaces w where w.id = workspace_profile.workspace_id and w.user_id = auth.uid()));
create policy "workspace_profile_public_read" on public.workspace_profile for select to anon
  using (exists (select 1 from public.projects p where p.workspace_id = workspace_profile.workspace_id and p.status = 'published'));

-- workspace_assets ------------------------------------------------------
create table if not exists public.workspace_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null, url text not null, mime_type text, size_bytes bigint,
  created_at timestamptz not null default now()
);
create index if not exists workspace_assets_workspace_id_idx on public.workspace_assets(workspace_id);
alter table public.workspace_assets enable row level security;
create policy "workspace_assets_owner_all" on public.workspace_assets for all to authenticated
  using (exists (select 1 from public.workspaces w where w.id = workspace_assets.workspace_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workspaces w where w.id = workspace_assets.workspace_id and w.user_id = auth.uid()));

-- templates ------------------------------------------------------------
create table if not exists public.templates (
  id text primary key,
  name text not null,
  is_active boolean not null default true,
  minimum_plan text not null default 'basic' check (minimum_plan in ('basic','premium','enterprise')),
  created_at timestamptz not null default now()
);
alter table public.templates enable row level security;
create policy "templates_public_select" on public.templates for select to anon, authenticated using (true);
create policy "templates_admin_update" on public.templates for update to authenticated using (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin') with check (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin');
insert into public.templates (id, name) values
  ('minimal','Minimal'),('bold','Bold'),('creative','Creative'),('corporate','Corporate'),
  ('dark','Dark'),('freelancer','Freelancer'),('studio','Vanguard Studio'),('portfolio-pro','Portfolio Pro')
on conflict (id) do nothing;

-- projects -------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  template_id text not null,
  template_version integer not null default 1,
  subdomain text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  current_version_id uuid,
  published_version_id uuid,
  profile_synced_at timestamptz default now(),
  check (status <> 'published' or subdomain is not null)
);
create unique index if not exists projects_subdomain_key on public.projects(subdomain);
create index if not exists projects_workspace_id_idx on public.projects(workspace_id);
create index if not exists projects_published_subdomain_idx on public.projects(subdomain) where (status = 'published');
alter table public.projects enable row level security;
create policy "projects_owner_all" on public.projects for all to authenticated
  using (exists (select 1 from public.workspaces w where w.id = projects.workspace_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workspaces w where w.id = projects.workspace_id and w.user_id = auth.uid()));
create policy "projects_public_read_published" on public.projects for select to public using (status = 'published');

-- project_versions ------------------------------------------------------
create table if not exists public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  version_number integer not null,
  content_json jsonb not null,
  schema_version integer not null default 1,
  is_autosave boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (project_id, version_number)
);
alter table public.projects
  add constraint projects_current_version_id_fkey foreign key (current_version_id) references public.project_versions(id),
  add constraint projects_published_version_id_fkey foreign key (published_version_id) references public.project_versions(id);
create index if not exists project_versions_project_id_idx on public.project_versions(project_id);
alter table public.project_versions enable row level security;
create policy "project_versions_owner_all" on public.project_versions for all to authenticated
  using (exists (select 1 from public.projects p join public.workspaces w on w.id = p.workspace_id where p.id = project_versions.project_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p join public.workspaces w on w.id = p.workspace_id where p.id = project_versions.project_id and w.user_id = auth.uid()));
create policy "project_versions_public_read_published" on public.project_versions for select to public
  using (exists (select 1 from public.projects p where p.id = project_versions.project_id and p.published_version_id = project_versions.id and p.status = 'published'));

-- publish_project RPC ---------------------------------------------------
create or replace function public.publish_project(p_project_id uuid, p_subdomain text)
returns void language plpgsql security definer as $function$
declare v_workspace_id uuid;
begin
  select workspace_id into v_workspace_id from public.projects where id = p_project_id;
  if not exists (select 1 from public.workspaces where id = v_workspace_id and user_id = auth.uid()) then
    raise exception 'not authorized';
  end if;
  update public.projects set
    published_version_id = current_version_id, subdomain = p_subdomain,
    status = 'published', published_at = now(), updated_at = now()
  where id = p_project_id;
end; $function$;

-- content_library -------------------------------------------------------
create table if not exists public.content_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '', description text not null default '',
  image_url text not null default '', link text not null default '',
  content_type text not null default 'project'
    check (content_type in ('project','testimonial','certificate','experience','education','publication','media','caseStudy','gallery')),
  content_json jsonb not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_library_user_idx on public.content_library(user_id);
create index if not exists content_library_user_type_order_idx on public.content_library(user_id, content_type, is_active, sort_order);
alter table public.content_library enable row level security;
create policy "content_library_owner_all" on public.content_library for all to public using (user_id = auth.uid()) with check (user_id = auth.uid());

-- subdomain_blocklist ---------------------------------------------------
create table if not exists public.subdomain_blocklist (
  slug text primary key check (slug = lower(slug))
);
alter table public.subdomain_blocklist enable row level security;
create policy "subdomain_blocklist_public_select" on public.subdomain_blocklist for select to anon, authenticated using (true);

-- plans -----------------------------------------------------------------
create table if not exists public.plans (
  id text primary key,
  tier text not null check (tier in ('basic','premium','enterprise')),
  billing_cycle text not null check (billing_cycle in ('monthly','annual')),
  name text not null,
  price_idr integer not null check (price_idr > 0),
  midtrans_product_id text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tier, billing_cycle)
);
insert into public.plans (id, tier, billing_cycle, name, price_idr, midtrans_product_id) values
  ('basic-monthly','basic','monthly','Basic',49000,'portofio-basic-monthly'),
  ('basic-annual','basic','annual','Basic',490000,'portofio-basic-annual'),
  ('premium-monthly','premium','monthly','Premium',99000,'portofio-premium-monthly'),
  ('premium-annual','premium','annual','Premium',990000,'portofio-premium-annual'),
  ('enterprise-monthly','enterprise','monthly','Enterprise',199000,'portofio-enterprise-monthly'),
  ('enterprise-annual','enterprise','annual','Enterprise',1990000,'portofio-enterprise-annual')
on conflict (id) do nothing;
create or replace function public.set_plans_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists plans_touch_updated_at on public.plans;
create trigger plans_touch_updated_at before update on public.plans for each row execute function public.set_plans_updated_at();
alter table public.plans enable row level security;
create policy "plans_read_anyone" on public.plans for select to anon, authenticated using (true);

-- entitlements ----------------------------------------------------------
create table if not exists public.entitlements (
  tier text primary key check (tier in ('basic','premium','enterprise')),
  max_live_websites integer not null default 1,
  publish_subdomain boolean not null default false,
  custom_domain boolean not null default false,
  watermark boolean not null default true,
  advanced_analytics boolean not null default false,
  priority_support boolean not null default false,
  premium_templates boolean not null default false
);
insert into public.entitlements (tier, max_live_websites, publish_subdomain, custom_domain, watermark, advanced_analytics, priority_support, premium_templates) values
  ('basic',1,true,false,true,false,false,false),
  ('premium',1,true,true,false,true,true,true),
  ('enterprise',1,true,true,false,true,true,true)
on conflict (tier) do nothing;
alter table public.entitlements enable row level security;
create policy "entitlements_read_authenticated" on public.entitlements for select to authenticated using (true);
create or replace function public.get_user_entitlements(target_user_id uuid default auth.uid())
returns table (tier text, max_live_websites integer, publish_subdomain boolean, custom_domain boolean,
               watermark boolean, advanced_analytics boolean, priority_support boolean, premium_templates boolean)
language sql stable security invoker as $$
  select e.tier, e.max_live_websites, e.publish_subdomain, e.custom_domain,
         e.watermark, e.advanced_analytics, e.priority_support, e.premium_templates
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  join public.entitlements e on e.tier = p.tier
  where s.user_id = target_user_id and s.status in ('active','grace_period')
  limit 1; $$;

-- subscriptions ---------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'inactive' check (status in ('active','inactive','grace_period','expired','canceled')),
  plan_id text references public.plans(id),
  billing_cycle text check (billing_cycle in ('monthly','annual')),
  plan_snapshot jsonb,
  current_period_start timestamptz,
  current_period_end timestamptz,
  expires_at timestamptz,
  cancel_at_period_end boolean not null default false,
  provider_order_id text,
  provider_transaction_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists subscriptions_user_id_unique_idx on public.subscriptions(user_id);
create index if not exists subscriptions_plan_id_idx on public.subscriptions(plan_id);
alter table public.subscriptions enable row level security;
create policy "subscriptions_owner_read" on public.subscriptions for select to authenticated using (user_id = auth.uid());
create policy "subscriptions_owner_select" on public.subscriptions for select to authenticated using (user_id = auth.uid());

-- billing_events --------------------------------------------------------
create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}',
  processed_at timestamptz not null default now()
);
create unique index if not exists billing_events_provider_event_id_idx on public.billing_events(provider_event_id);
create index if not exists billing_events_user_id_idx on public.billing_events(user_id);
create index if not exists billing_events_event_type_idx on public.billing_events(event_type);
alter table public.billing_events enable row level security;
create policy "billing_events_owner_select" on public.billing_events for select to authenticated using (user_id = auth.uid());

-- payment_transactions (legacy Xendit) ----------------------------------
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  xendit_invoice_id text not null unique,
  amount integer not null,
  currency text not null default 'IDR',
  status text not null default 'pending' check (status in ('pending','paid','expired','failed')),
  paid_at timestamptz, raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.payment_transactions enable row level security;
create policy "payment_transactions_owner_read" on public.payment_transactions for select to authenticated using (user_id = auth.uid());

-- visitor analytics -----------------------------------------------------
create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  subdomain text not null, page_path text not null default '/',
  visitor_hash text, referrer_host text, device_type text not null default 'other',
  browser text, country_code text,
  created_at timestamptz not null default now()
);
create index if not exists page_visits_project_created_idx on public.page_visits(project_id, created_at desc);
create index if not exists page_visits_project_visitor_idx on public.page_visits(project_id, visitor_hash);
alter table public.page_visits enable row level security;
create policy "page_visits_public_insert" on public.page_visits for insert to anon, authenticated
  with check (exists (select 1 from public.projects p where p.id = page_visits.project_id and p.status = 'published'));
create policy "page_visits_owner_all" on public.page_visits for all to authenticated
  using (exists (select 1 from public.projects p join public.workspaces w on w.id = p.workspace_id where p.id = page_visits.project_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p join public.workspaces w on w.id = p.workspace_id where p.id = page_visits.project_id and w.user_id = auth.uid()));

create table if not exists public.section_visits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  subdomain text not null, section_key text not null, section_label text,
  page_path text not null default '/', visitor_hash text, device_type text not null default 'other',
  created_at timestamptz not null default now()
);
create index if not exists section_visits_project_created_idx on public.section_visits(project_id, created_at desc);
create index if not exists section_visits_project_visitor_idx on public.section_visits(project_id, visitor_hash);
alter table public.section_visits enable row level security;
create policy "section_visits_public_insert" on public.section_visits for insert to anon, authenticated
  with check (exists (select 1 from public.projects p where p.id = section_visits.project_id and p.status = 'published'));
create policy "section_visits_owner_all" on public.section_visits for all to authenticated
  using (exists (select 1 from public.projects p join public.workspaces w on w.id = p.workspace_id where p.id = section_visits.project_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p join public.workspaces w on w.id = p.workspace_id where p.id = section_visits.project_id and w.user_id = auth.uid()));

-- template_submissions --------------------------------------------------
create table if not exists public.template_submissions (
  id uuid primary key default gen_random_uuid(),
  designer_id uuid not null references auth.users(id) on delete cascade,
  name text not null, description text,
  preview_url text, preview_mobile_url text,
  category text check (category in ('minimal','creative','corporate','developer','agency','other')),
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('draft','pending','approved','rejected','revision_requested')),
  reviewed_by uuid references auth.users(id), reviewed_at timestamptz, review_notes text,
  registry_id text unique,
  integration_status text not null default 'not_started' check (integration_status in ('not_started','in_review','merged','failed')),
  integration_notes text, integrated_at timestamptz,
  source_url text, source_path text, source_filename text, source_size_bytes integer,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists template_submissions_designer_id_idx on public.template_submissions(designer_id);
create index if not exists template_submissions_status_idx on public.template_submissions(status);
create index if not exists template_submissions_integration_status_idx on public.template_submissions(integration_status);
alter table public.template_submissions enable row level security;
create policy "template_submissions_designer_insert" on public.template_submissions for insert to authenticated
  with check (designer_id = auth.uid() and ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = any (array['designer','admin']));
create policy "template_submissions_designer_select" on public.template_submissions for select to authenticated using (designer_id = auth.uid());
create policy "template_submissions_designer_update" on public.template_submissions for update to authenticated
  using (designer_id = auth.uid() and status = any (array['draft','revision_requested'])) with check (designer_id = auth.uid());
create policy "template_submissions_admin_all" on public.template_submissions for all to authenticated
  using (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin') with check (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin');
create or replace function public.protect_template_submission_review_fields() returns trigger language plpgsql security definer set search_path = 'public','auth' as $$
begin
  if (auth.jwt() -> 'app_metadata' ->> 'role') <> 'admin' then
    new.status := old.status; new.reviewed_by := old.reviewed_by; new.reviewed_at := old.reviewed_at;
    new.review_notes := old.review_notes; new.registry_id := old.registry_id;
    new.integration_status := old.integration_status; new.integration_notes := old.integration_notes;
    new.integrated_at := old.integrated_at; new.submitted_at := old.submitted_at;
  end if;
  return new;
end; $$;
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists template_submissions_updated_at on public.template_submissions;
create trigger template_submissions_updated_at before update on public.template_submissions for each row execute function public.set_updated_at();
drop trigger if exists template_submissions_protect_review_fields on public.template_submissions;
create trigger template_submissions_protect_review_fields before update on public.template_submissions for each row execute function public.protect_template_submission_review_fields();

-- admin_audit_logs ------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null, target_type text not null, target_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_logs_actor_idx on public.admin_audit_logs(actor_id, created_at desc);
create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs(created_at desc);
create index if not exists admin_audit_logs_target_idx on public.admin_audit_logs(target_type, target_id);
alter table public.admin_audit_logs enable row level security;
create policy "admin_audit_logs_admin_select" on public.admin_audit_logs for select to authenticated
  using (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin');

-- role triggers on profiles / auth --------------------------------------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = 'public' as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url', 'user')
  on conflict (id) do nothing;
  return new;
end; $$;
create or replace function public.prevent_profile_role_change() returns trigger language plpgsql security definer set search_path = 'public','auth' as $$
begin
  if new.role is distinct from old.role and auth.uid() = old.id then
    raise exception 'role changes require a trusted server-side operation';
  end if;
  return new;
end; $$;
create or replace function public.sync_role_to_auth_metadata() returns trigger language plpgsql security definer set search_path = 'public','auth' as $$
begin
  update auth.users set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
    || jsonb_build_object('role', new.role)
  where id = new.id;
  return new;
end; $$;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change before update on public.profiles for each row execute function public.prevent_profile_role_change();
drop trigger if exists profiles_sync_role on public.profiles;
create trigger profiles_sync_role after insert or update on public.profiles for each row execute function public.sync_role_to_auth_metadata();
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
```

---

*Catatan pemeliharaan: dokumentasi ini otomatis disusun dari metadata Postgres live.
Jalankan ulang query `information_schema` / `pg_policies` / `pg_proc` setelah migrasi baru,
lalu perbarui file ini.*
