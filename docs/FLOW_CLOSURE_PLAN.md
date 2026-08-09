# FLOW Closure Plan — Gap PRD/FLOW vs Codebase

**Versi**: 1.0
**Tanggal**: 2026-08-08
**Berdasarkan**: docs/PRD.md v1.7 · docs/FLOW.md v1.0 · docs/SPRINTS.md · docs/IMPLEMENTATION_PLAN.md · audit codebase
**Tujuan**: Daftar yang BELUM terimplementasi di codebase untuk menutup seluruh alur (FLOW) PRD. Dokumen ini adalah executor checklist — satu task aktif, verifikasi sebelum menandai selesai.

---

## Ringkasan Statistik Audit (2026-08-08)

Docs mengklaim 10/10 FLOW + Sprint 0–3 selesai. Audit kode menemukan beberapa FLOW yang **rusak/gap** padahal diklaim selesai:

| Area | Klaim docs | Realita di kode | Dampak FLOW |
|---|---|---|---|
| Publish subdomain UI | Flow 5 ✅ | Tidak ada `<input subdomain>` di Editor; `publishProjectAction(projectId, "")` short-circuit ke error | **Publish tidak bisa berjalan dari Editor** |
| Profile Sync Banner | Flow 4 ✅ | Action ada (`syncFromProfileAction`), banner tidak pernah dirender | Fitur sync tak terlihat oleh user |
| Publish Readiness modal + subscription CTA | Flow 5 ✅ | State modal & error di-set tapi tidak pernah dirender | Validasi & CTA bayar tidak muncul |
| i18n Billing/Dashboard/Admin | Semua ✅ | `BillingClientView`, `DashboardClientView`, `/admin/*` hardcoded EN/ID | PRD §15 "terjemahan lengkap" belum terpenuhi |
| Sentry / error tracking | Sprint 2 100% | Tidak terpasang sama sekali | Go-live §15 #8 open |
| 8 template di galeri | Flow 3 ✅ | Seed DB `templates` hanya 7 — `freelancer` tersembunyi | Galeri tampil 7, bukan 8 |
| Webhook signature | Flow 5/7 ✅ | Env var beda nama → signature check selalu di-skip | Verifikasi webhook mati pada konfigurasi sesuai docs |
| E2E coverage | 12 test, Flow 1–10 | 12 test hanya render-snapshot, tidak menjalankan alur | Safety net lemah |

---

## Grup A — Bug Fix FLOW inti (harus selesai pertama)

### A-1: Subdomain Input + Validasi di Editor (FLOW 5 step 5–7)
- **File**: `src/components/dashboard/Editor.tsx` (state ~169, call ~478), `src/lib/projects/actions.ts:115`
- **Gap**: `setSubdomain` tidak pernah dipanggil; tidak ada kontrol input subdomain di Publish Panel.
- **Implementasi**:
  1. Render `<input>` subdomain: auto-lowercase, strip karakter invalid, contoh `namamu`, preview URL `{domain}/sites/<subdomain>`.
  2. Wire `setSubdomain(...)` ke state (Editor.tsx:169).
  3. Tampilkan error dari `publishProjectAction` (format invalid / sudah dipakai / kata terlarang) — saat ini `publishError` di-set tapi tidak dirender.
  4. Render Publish Readiness modal (`showPublishModal`/`publishErrors`) sebelum deploy — state ada, JSX tidak ada.
- **AC**: user menginput subdomain → publish sukses; subdomain invalid/duplikat/terlarang → error tampil; kuota 1 publish/akun berjalan (pesan persis FLOW.md:240).

### A-2: Subscription CTA di Editor (FLOW 5 step 5 — tanpa langganan)
- **Gap**: tanpa langganan, klik Publish harus menampilkan CTA "Berlangganan untuk publish" → checkout Midtrans (FLOW.md:211–217). Branch billing gate ada, UI CTA tidak dirender.
- **Implementasi**: render blok `subscription_required` berisi tombol yang memanggil `createCheckoutInvoiceAction`/redirect ke `/dashboard/billing`.
- **AC**: user tanpa subs tidak bisa publish; CTA menuju invoice/billing page.

### A-3: Profile Sync Banner di Editor (Flow 4 step K–N)
- **Gap**: FLOW.md Flow 4 minta banner "Profil workspace diperbarui. Update project ini?" + tombol "Sync dari Profil". `showProfileBanner`/`handleSyncProfile` (Editor.tsx:155–166) ada tapi tidak pernah dirender.
- **Implementasi**: deteksi divergence (`profile_synced_at` vs `workspace_profile.updated_at`) → render banner → `syncFromProfileAction`.
- **AC**: ubah profil workspace → buka editor → banner muncul; klik Sync → data project ikut update, banner hilang.

### A-4: Publish Readiness Validation Modal
- **Gap**: klaim Session 027 ("Publish Readiness" rule-based) tidak ada implementasi modal-nya.
- **Implementasi**: daftarkan rule (nama, kontak, min. 1 pengalaman/proyek) → tampil di modal sebelum deploy bila tidak lengkap; modal render dari `publishErrors`.
- **AC**: project tak lengkap → modal menampilkan daftar item; lengkap → publish langsung.

---

## Grup B — Hardening & Bugfix (sebelum go-live)

### B-1: Fix env var webhook Midtrans
- **Gap**: `.env.example:8` + PRD §9.7 dokumentasikan `MIDTRANS_IS_PRODUCTION`, tapi kode membaca `MIDTRANS_SERVER_KEY` (`src/lib/billing/midtrans.ts:13`, `src/app/api/webhooks/midtrans/route.ts:13`). → signature check di-skip.
- **Implementasi**: samakan nama (pilih satu, update `.env.example` + PRD §9.7), log error bila env tidak set.
- **AC**: dengan env sesuai docs, webhook memverifikasi dan menolak callback dengan `x`-callback-token salah.

### B-2: Seed `templates` DB → 8 (tambah `freelancer`)
- **Gap**: `20260720131552_add_active_templates.sql` seed hanya 7; registry `src/templates/registry.tsx` punya 8 termasuk `freelancer`. Galeri menyaring `activeTemplateIds.includes(id)` → freelancer tersembunyi.
- **Implementasi**: (a) update migration seed (insert `freelancer`), catat perlu apply remote; (b) fallback seandainya tabel kosong → jangan filter (dan tulis ulang PRD §9.4 yang menyebut "templates: TIDAK ada di DB").
- **AC**: galeri publik & dashboard menampilkan 8 template.

### B-3: i18n hardcoded di app-shell
- **Gap**: `BillingClientView.tsx`, `DashboardClientView.tsx`, `src/app/[locale]/admin/*`, `AdminSidebar.tsx`, Editor chrome hardcoded EN/ID.
- **Implementasi**: pindahkan string ke `messages/{id,en}.json` + `useTranslations`; sertakan namespace baru (billing, dashboard, admin) di kedua file.
- **AC**: tidak ada string EN-only dalam flow inti; kedua berkas dictionary sama; build bersih.

### B-4: Wire error tracking (Sentry / Vercel Auditor)
- **Gap**: tidak ada `@sentry/nextjs`, `instrumentation.ts`, atau Vercel Analytics; padahal Sprint 2 diklaim 100%.
- **Implementasi**: pasang `@sentry/nextjs` (+ `NEXT_PUBLIC_SENTRY_DSN`) ATAU `@vercel/analytics`; update IMPLEMENTATION_PLAN.md B-009, TASK_TRACKER 6.3.
- **AC**: error test tercatat di monitoring; DSN di `.env.example`.

### B-5: UX polish lainnya
- Ganti `confirm()` di `BlocklistClientView.tsx` dengan sistem Toast yang sudah ada.
- Pertimbangkan menghilangkan tombol "⚡ Activate Test Sub" non-prod di Billing page.

### B-6: Perbaiki kontradiksi docs vs realita
- `feature_list.json` `editor-architecture` → tambahkan evidence (variant engine) atau tandai `in_progress`.
- `claude-progress.md` Session 028/029 klaim granular theme UI padahal sudah diganti variant — catat.
- `TASK_TRACKER.md`: Billing i18n (B-3) belum; Sentry B-4 belum selesai.
- Zoom update `FLOW.md` Status saat A-* selesai.

---

## C — Perkuat E2E (safety net sebelum go-live)

### C-1: E2E deep-flow (bukan render-snapshot)
- **Gap**: `e2e/*.spec.ts` hanya assert header/input muncul; tidak Submit, edit, publish, checkout.
- **Tambahan**: (a) signup→konfirmasi; (b) buat workspace→isi editor; (c) publish dgn subdomain input→`/sites/x` live; (d) unpublish; (e) billing page.
- **AC**: `npm run test:e2e` pass untuk Flow 2, 4, 5, 6, 7, 8.

### C-2: KPI stopwatch bermakna
- `e2e/kpi-stopwatch.spec.ts` hanya `page.goto` 4 URL. Ganti dengan ukuran nyata visitor→publish bila feasible, atau tandai smoke test.

---

## Grup D — Fase 2 (di luar MVP scope, PRD §5 + Sprint 4 — JANGAN sebelum A/B)

| Task | PRD | File target | Catatan |
|---|---|---|---|
| D-1 Designer submission `/designer` + form submit → `template_submissions` | Sprint 4.4 | `src/app/[locale]/designer/`, `src/lib/designer/actions.ts` | Admin approval (`admin/templates`) sudah ada; yang kurang form submit. Navbar "Designer Dashboard" link salah (`/dashboard`) |
| D-2 Workspace asset manager UI | §9.4 (`workspace_assets` stub) | `src/lib/workspace/assets.ts` → tambah upload/serve; UI Media Library (tombol Upload di Editor tanpa onClick) | Server `listAssets` sudah ada |
| D-3 Google OAuth | Sprint 4.1 | Supabase provider + tombol | |
| D-4 Custom domain mapping | Sprint 4.2 | Verifikasi CNAME + kolom `custom_domain` | |
| D-5 Visitor analytics | Sprint 4.3 | Widget di dashboard | |

---

## Urutan Eksekusi yang Direkomendasikan

```
Grup A   A-1 → A-2 → A-3 → A-4        (flow inti; VERIFIKASI manual + publish)
Grup B   B-1 → B-2 → B-3 → B-4 → B-5 → B-6
Grup C   C-1 → C-2
Grup D   D-* (post-go-live)
```

## DoD per task (PRD §14)

1. `npm run lint && npx tsc --noEmit && npm run build` pass.
2. Manual happy path + minimal 1 edge case.
3. Responsive mobile + desktop bila menyentuh UI.
4. Catatan di `claude-progress.md` + `feature_list.json`.

## Env checklist setelah B-1

| Var | Diperlukan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | ya |
| `NEXT_PUBLIC_ROOT_DOMAIN` | ya |
| `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION` (sync nama kode di B-1) | prod |
| `CRON_SECRET` | prod (dicek cron) |
| `NEXT_PUBLIC_SENTRY_DSN` (B-4) | opsional |