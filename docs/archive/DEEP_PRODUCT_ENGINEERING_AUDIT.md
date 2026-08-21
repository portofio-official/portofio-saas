# PORTOFIO DEEP PRODUCT & ENGINEERING AUDIT

**Tanggal:** 15 Agustus 2026
**Metode:** inspeksi repository, dokumen (PRD v1.9, IMPLEMENTATION_PLAN, DATABASE_SCHEMA, DESIGN), migrasi Supabase, RLS, server actions, route handlers, proxy/middleware, editor, template registry, billing, cron, storage, konfigurasi Vercel, package dependencies, dan E2E. Baseline diverifikasi ulang dengan `./init.sh`, `npx tsc --noEmit`, `npm run build`, `npx playwright test`, dan `npm audit`.
**Referensi lanjutan:** `docs/DEEP_RESEARCH_BUILD_PLAN.md` (audit sebelumnya, tetap valid; dokumen ini menyajikan struktur baru yang diminta dan memperdalam beberapa area).

---

## 1. Executive Summary

1. Portofio adalah **vertical slice yang sangat luas dengan kualitas build yang baik**, bukan MVP sempit yang siap production. Nilai terbesar ada di editor form + live preview + publish ke subdomain; sebagian besar kompleksitas lain tidak dibutuhkan untuk nilai inti.
2. **Belum production-ready.** Blocker terbesar adalah operasional, bukan fitur: secret default yang fail-open, enforcement quota publish yang tidak atomic, rate limit in-memory, webhook idempotency yang tidak atomic, sanitasi URL/HTML yang lemah, dan autosave yang menimbulkan race + bloat.
3. **Stack sudah benar.** Next.js + Supabase + Midtrans + Vercel + template code-defined adalah keputusan arsitektur yang tepat untuk skala MVP. Jangan ganti stack.
4. **Xendit sudah dimigrasi ke Midtrans** di kode (webhook, checkout, env). Sisa "Xendit" hanya nama kolom legacy `payment_transactions.xendit_invoice_id` dan beberapa dokumen — kosmetik, bukan fungsional.
5. **Template switching belum ada** walaupun menjadi janji produk (PRD §7.4, SP2-020/SP2-022 diakui deferred). Ini salah satu gap value terbesar: user hanya bisa memilih template saat project dibuat.
6. **Billing tiered baru separuh jalan:** schema `plans`/`entitlements` + checkout plan-aware sudah ada, tetapi enforcement entitlement (watermark, custom domain, template minimum_plan, upgrade/downgrade) dan E2E Midtrans sandbox belum selesai. Untuk launch, **satu plan Basic monthly cukup**; tiering adalah beban, bukan value.
7. **Ada dua model kontak data yang tumpang tindih** (`profiles` account + `workspace_profile` + content di editor) sehingga user diminta mengisi data yang sama berulang, dan `syncFromProfileAction` menjadi tambalan. Ini melanggar prinsip "isi data sekali".
8. **Security finding yang harus diperbaiki sebelum launch:** cron fail-open (`CRON_SECRET` kosong = endpoint terbuka), service-role dipakai di banyak titik publik, validasi URL tidak membatasi skema, upload image hanya memvalidasi base64 MIME tanpa magic-byte/dimensi, redirect parameter tidak di-allowlist, dan `requireRole()` bergantung pada `app_metadata.role` yang sinkronisasinya bergantung pada trigger/manual deploy custom claims.
9. **Autosave saat ini menyimpan satu baris version penuh per debounce** (`project_versions` insert + `current_version_id` update, dua query). Ini race-prone (max+1) dan tidak efisien. Untuk MVP cukup simpan draft JSONB di satu baris `current_draft`, dan buat history snapshot hanya saat milestone (misal sebelum publish/restore).
10. **Rekomendasi terakhir:** lahirkan versi terkecil yang aman (satu persona, satu portfolio, satu plan Basic, 3–5 template terbaik), tutup blocker keamanan/data-consistency, tambahkan template switching yang non-destructive, lalu luncurkan ke kohort 10–20 user. Jangan tambah fitur lagi sampai ada bukti konversi.

---

## 2. Current Product Assessment

Skala 1–10. Skor adalah penilaian terhadap **kesiapan untuk launch MVP**, bukan kualitas kode secara umum.

| Dimensi | Skor | Alasan |
|---|---|---|
| **Product** | 6 | Konsep form+template jelas dan benar. Namun scope melebar (analytics, designer, admin, content library, 3 tier) dan template switching tidak ada. |
| **UX** | 6 | Editor form+preview berkualitas baik; perangkat preview, accordion, autosave, checklist ada. Tetapi terminologi developer-centric (workspace, project, version, Content Library, sections), data ganda, dan onboarding yang tidak langsung ke editor. |
| **Architecture** | 7 | Template code-defined + Zod + JSONB + RLS + dynamic rendering = arsitektur yang tepat. Kelemahan: service-role dipakai terlalu luas, autosave menulis 2 query non-atomic, dua model profile. |
| **Security** | 5 | RLS ownership solid dan RBAC server-side sudah bagus. Namun cron fail-open, rate limit non-durable, webhook race, sanitasi lemah, dan dependensi high vuln. |
| **Performance** | 6 | Rendering dinamis + ISR 60s memadai untuk MVP. Kelemahan: data-URL gambar membengkakkan JSONB, setiap autosave = baris version penuh, N+1 profile→plan query di billing. |
| **Scalability** | 7 | Untuk 100–1.000 user arsitektur lebih dari cukup. Bottleneck nyata baru di >10rb pengguna/autosave berat; tidak relevan untuk launch. |
| **Maintainability** | 7 | Modular per template, registry auto-register, i18n lengkap, E2E ada. Kelemahan: Editor.tsx ~1.700 baris, migrasi manual/schema drift, docs tidak selalu sinkron. |
| **Production Readiness** | 4 | Belum ada bukti backup/restore, observability, error tracking live, staging E2E berbayar, monitoring webhook/cron, dan SMTP production. Blocking. |

Rata-rata kesiapan MVP: **~6.0 / 10**. Di atas ini, launch tetap berisiko kecuali bagian Production Readiness dan Security dinaikkan.

---

## 3. What Is Already Good

Jangan sentuh atau rombak hal berikut — sudah tepat:

1. **Template architecture code-defined + Zod schema** (`src/templates/registry.tsx`, `definition.ts`): renderer/schema/defaults/migrations di code, bukan DB. Mencegah eksekusi kode tak tepercaya dan menghindari engine JSON-to-UI. **Ini keputusan paling penting yang benar.**
2. **Publish via `publish_project()` RPC SECURITY DEFINER** dengan ownership check (`20260716000004_publish_project_rpc.sql`, `20260728000001_add_project_versions.sql`): atomic snapshot `current_version_id → published_version_id`. Konsep snapshot immutable yang benar.
3. **Draft/published terpisah:** published site hanya baca `published_version_id` (`src/app/sites/[subdomain]/page.tsx:121`), draft tidak pernah bocor ke publik.
4. **RLS ownership chain yang konsisten** (workspaces → projects → project_versions → visits) dan hardening role (`20260811000007_harden_role_boundaries.sql`, trigger `prevent_profile_role_change`, `sync_role_to_auth_metadata`).
5. **Editor preview = renderer yang sama dengan public site** (`PreviewTemplateRenderer`/`TemplateRenderer`). Apa yang dilihat user = apa yang dilihat visitor.
6. **Live preview multi-device** (desktop/laptop/tablet/mobile) + zoom — sesuai philosophy preview nyata.
7. **Midtrans signature verification + idempotency key** `order_id:transaction_status` (`route.ts:42`) — perbaikan idempotency yang benar (bug sebelumnya di-key transaction_id).
8. **Privacy/Terms, password strength, autosave indicator, ready check, subdomain sanitizer UI, dan scroll-to-section** — kontrol UX dasar yang bernilai.
9. **i18n lengkap id/en** dan DESIGN.md yang disiplin (light mode, token) untuk app-shell.
10. **E2E Playwright** (35 passed / 3 skipped) termasuk flows berbayar yang opt-in — fondasi regression yang dapat diandalkan untuk dilanjutkan.
11. **Autosave dibatasi oleh Zod schema** dan disanitasi sebelum simpan (`saveDraftAction`), plus `sanitizeObjectData` di public render.

---

## 4. Critical Problems

### CRITICAL

| # | Problem | Evidence | Impact | Recommendation | Priority |
|---|---|---|---|---|---|
| C1 | **Cron subscription fail-open** — GET `/api/cron/check-subscriptions` tanpa auth bila `CRON_SECRET` tidak diset | `src/app/api/cron/check-subscriptions/route.ts:8-13` | Attacker memanggil endpoint, men-trigger scan + soft-unpublish massal (DoS / data tak sengaja di-unpublish) | Wajibkan secret di production; route return 503 bila kosong, 401 bila salah | P0 |
| C2 | **Quota 1 published tidak atomic** — check lalu RPC, dua request bersamaan bisa lolos | `src/lib/projects/actions.ts:196-216` + RPC | Dua website live sekaligus = janji monetisasi rusak, tagihan hosting ganda | Pindahkan enforcement ke dalam satu transaksi/RPC: ownership + entitlement + hitung published lain (locks/unique partial) | P0 |
| C3 | **Rate limit in-memory (`Map`)** — hilang antar instance/cold start Vercel | `src/lib/rate-limit.ts:10-45` | Bypass mudah; signup/publish/upload/webhook abuse | Ganti ke limiter durable (Postgres atomic counter atau managed edge limiter); tutup juga abuse `/api/track` | P0 |

### HIGH

| # | Problem | Evidence | Impact | Recommendation | Priority |
|---|---|---|---|---|---|
| H1 | **Webhook check-then-insert tidak atomic** + **write DB tidak diperiksa error** | `route.ts:45-56,82-109` | Webhook ganda konkuren → subscription diproses dua kali; bila insert gagal tetap balas 200 → pembayaran tidak tercatat | Insert unique `provider_event_id` + handle conflict; cek semua error write dan balas non-2xx agar Midtrans retry | P0 |
| H2 | **Validasi URL tidak membatasi skema** — template render link `href={p.link}`, image `src={imageUrl}` | schema pakai `z.string().url()` (mis. `_base.ts:31`), `sanitize.ts` hanya strip substring | `javascript:`, `data:`, `vbscript:`, varian lain bisa lolos ke atribut; potential stored XSS | Validasi scheme allowlist server-side (`http`,`https`,`mailto`,`tel`) per tipe field; jangan render arbitrary HTML | P0 |
| H3 | **Autosave race + write amplification** — max+1 lalu insert lalu update | `src/lib/projects/store.ts:200-242` | Version collision bila tab/request ganda; row autosave tak terbatas → bloat + storage cost | Simpan `current_draft` (jsonb) di `projects`, autosave = 1 upsert atomic; history snapshot hanya saat milestone | P0 |
| H4 | **Service-role dipakai untuk request publik** — public site, track, cron, webhook | `sites/[subdomain]/page.tsx:13`, `track/route.ts:66`, `unpublish.ts:9`, `admin.ts` | Bypass RLS di jalur publik; satu kesalahan query = kebocoran | Public render pakai client anon/server dengan RLS publik; simpan service-role hanya untuk webhook/cron/admin | P0 |
| H5 | **Enforcement entitlement tidak lengkap** — publish hanya `checkSubscription()` boolean, plan tidak dipakai | `subscription.ts:10-12`, `plans.ts` ada tapi `publishProjectAction` tidak pakai `get_user_entitlements()` | Watermark/custom-domain/minimum_plan/template access tidak ditegakkan | Terapkan `get_user_entitlements()` di publish + template gallery server-side; atau kurangi jadi satu plan sehingga sebagian besar entri tak perlu | P0 (untuk 1 plan: sederhanakan) |
| H6 | **Upload image hanya cek base64 MIME + ukuran**, tanpa magic-byte/dimensi; data-URL disimpan inline di JSONB | `src/lib/content/actions.ts:47-69`, `compressImage.ts` | File non-image bisa di-upload; payload membengkakkan DB/response | Validasi signature bytes, dimensi, decompress limits; simpan di Storage, simpan URL saja | P0 |
| H7 | **Redirect parameter tidak di-allowlist** (`next` di confirm/callback) | `confirm/route.ts:9-21`, `auth/callback` | Open redirect bila parameter dipakai eksternal | Hanya terima path relatif `/...`, tolak `//` dan scheme | P1 |
| H8 | **Tiga high vuln dependency** | `npm audit` (`brace-expansion`, `js-yaml`, `nanoid`) | DoS vectors (transitif) | `npm audit fix`, upgrade lockfile, re-run | P1 |

### MEDIUM

| # | Problem | Evidence | Impact | Recommendation | Priority |
|---|---|---|---|---|---|
| M1 | **Terminologi developer-centric** di UI (workspace, project, version, Content Library, sections) | `messages/*.json`, sidebar, editor | Cognitive load non-teknis, jargon | Satu istilah user-facing: **Portfolio / Publish / Isi data** | P1 |
| M2 | **Dua sumber data profile** (account `profiles` + `workspace_profile`) + editor data; sinkronisasi tambalan | `profile/actions.ts`, `syncFromProfileAction` | Data ganda, bingung, overwrite | Untuk MVP: satu tempat isi data di editor; hapus input berulang | P1 |
| M3 | **Analytics publik tanpa abuse budget** — visitor-controlled cardinality, unlimited insert | `track/route.ts` | Storage abuse, biaya, noise | Retensi + batching + sampling; atau tangguhkan fitur analytics | P2 |
| M4 | **Cache revalidasi** — ISR `revalidate=60` tanpa invalidasi eksplisit saat publish | `sites/[subdomain]/page.tsx:10` | Konten live telat sampai 60 detik setelah publish/update | Gunakan `revalidatePath('/sites/'+subdomain)` setelah publish/unpublish/update; pertimbangkan cache immutable per published snapshot | P1 |
| M5 | **`workspace_profile_public_read` self-comparison** (documented live) | `DATABASE_SCHEMA.md:407,551` | Public read workspace_profile hampir tak terkendali | Perbaiki predicate eksplisit (published project join), expose field minimal | P1 |
| M6 | **Migrasi manual / schema drift** | hanya sebagian migration tercatat (`DATABASE_SCHEMA.md:487-489`), reconcile migration ada | Reproducibility & rollback lemah | Jalankan `supabase db push`/CLI di environment baru sebagai uji; dokumentasikan baseline | P1 |
| M7 | **Editor.tsx ~1.700 baris, banyak eslint-disable** | `Editor.tsx:1-3` | Maintainability, bug silent | Pecah hanya bila refactor berisiko rendah; minimal pecah komponen panel | P3 |

### LOW

| # | Problem | Evidence | Impact | Recommendation | Priority |
|---|---|---|---|---|---|
| L1 | Ikon ganda Phosphor + Lucide vs DESIGN.md Material Symbols | `package.json:15,28` | Inconsistency visual, bundle | Satu sistem ikon | P3 |
| L2 | `e2e/dbg.spec.ts` (debug) dan `test-results/` ikut di repo | glob e2e | Noise CI | Hapus | P3 |
| L3 | Nama legacy `xendit_invoice_id`, `raw_payload` | `DATABASE_SCHEMA.md:153,160` | Kebingungan audit | Rename migration bila menyentuh; bukan blocker | P3 |
| L4 | `getSubscriptionState` melakukan query plan tambahan | `subscription.ts:53-61` | N+1 kecil | Join plans sekali | P3 |

---

## 5. Missing MVP Requirements

Hal yang benar-benar harus dibangun/diperbaiki sebelum production:

| ID | Requirement | Why | Priority | Effort | Evidence |
|---|---|---|---|---|---|
| M-01 | Cron auth fail-closed + idempotent | Blocker keamanan | P0 | S | `route.ts:8-13` |
| M-02 | Publish atomic (ownership+entitlement+quota+subdomain dalam satu transaksi) | Data integrity | P0 | M | `actions.ts:196-216` |
| M-03 | Rate limiter durable | Keamanan produksi | P0 | M | `rate-limit.ts` |
| M-04 | Autosave 1-upsert current draft + bounded history | Data integrity, biaya | P0 | M | `store.ts:200-242` |
| M-05 | Validasi URL scheme + XSS defense-in-depth di render | Keamanan stored XSS | P0 | M | template schema + `sanitize.ts` |
| M-06 | Webhook atomic idempotency + error handling | Monetisasi | P0 | M | `route.ts` |
| M-07 | Public render tanpa service-role | Tenant isolation | P0 | M | `sites/[subdomain]/page.tsx` |
| M-08 | Image upload magic-byte/dimensi + Storage URL (hapus inline data-URL) | Keamanan, performa | P0 | M | `content/actions.ts`, `compressImage.ts` |
| M-09 | One Basic monthly plan enforcement (atau entitlement lengkap bila tier dipertahankan) | Monetisasi | P0 | M | `billing-002` |
| M-10 | Revalidasi cache setelah publish/unpublish | UX/consistency | P1 | S | `sites/[subdomain]/page.tsx:10` |
| M-11 | Template switching non-destructive | Janji produk inti | P1 | L | SP2-020/022 deferred |
| M-12 | Satu alur isi data (hapus data ganda profile/workspace/editor) | UX core | P1 | M | `syncFromProfileAction` |
| M-13 | Onboarding langsung ke editor (pilih template → isi) | Speed to value | P1 | S | flow saat ini |
| M-14 | Observability: error tracking + log webhook/cron + health check | Operasional | P0 | S | `IMPLEMENTATION_PLAN.md:370` (belum live) |
| M-15 | Backup restore drill + migration reproducibility | DR | P0 | S | `DATABASE_SCHEMA.md:487` |
| M-16 | Production SMTP + email templates `token_hash` (bukan default fragment) | Auth inti | P0 | S | auth-001 notes |
| M-17 | Terms, Privacy, refund/cancel policy, abuse report path | Legal | P1 | S | halaman Privacy/Terms sudah ada; policy belum lengkap |
| M-18 | SEO wajib: title/desc/OG/robots/sitemap canonical dasar | Discoverability | P1 | S | hanya `generateMetadata` sebagian |
| M-19 | Accessibility pass pada editor dan public site | Inklusivitas | P1 | M | belum ada test a11y |
| M-20 | Midtrans sandbox E2E penuh (settlement → active → grace → unpublish → republish) | Monetisasi | P0 | L | billing-002 pending |

S = ≤1 hari, M = 2–4 hari, L = 1–2 minggu.

---

## 6. Things We Should NOT Build

Fitur yang tampak menarik tetapi premature / bertentangan dengan filosofi Portofio. Untuk setiap item: **NEVER / LATER** + alasan.

| Fitur | Keputusan | Alasan |
|---|---|---|
| Runtime template marketplace + plugin/SDK publik | LATER (Fase 3) | Membuka eksekusi kode tak tepercaya; bertentangan dengan "designer sudah mendesain". Registry code cukup untuk MVP. |
| Custom CSS/JS / arbitrary HTML per user | NEVER | Filosofi: user tidak mendesain. Menambah attack surface besar. |
| Drag-and-drop visual editor | NEVER | Mengubah Portofio menjadi mini-Webflow; menaikkan cognitive load kontraproduktif. |
| AI content generation | LATER | Biaya production belum terbayar; value saat ini = struktur + contoh, bukan generasi. |
| Collaboration / real-time (Yjs) | NEVER (untuk MVP), LATER (Fase 3) | Satu orang membangun satu portfolio. |
| Multi-workspace & multi-project UI | LATER | Persona pertama butuh satu portfolio. Retain data isolation, jangan paksa mental model. |
| Enterprise/team plan | LATER | Tidak ada kolaborasi = tidak ada nilai Enterprise sekarang. |
| Content Library account-global | LATER | Menduplikasi data editor; memperluas model untuk kebutuhan yang belum terbukti. |
| Analytics user-facing | LATER | Tidak membantu create→publish; menambah permukaan ingestion publik yang harus di-rate-limit. |
| Custom domain | LATER (setelah subdomain terbukti) | DNS/SSL/ownership = operasional berat; belum jelas value untuk fresh graduate. |
| Annual billing | LATER | Tambah edge case refund/renewal sebelum monthly terbukti. |
| OAuth Google | LATER | Email/password cukup untuk MVP; Google tidak menurunkan friction build portfolio. |
| Marketplace designer revenue sharing | LATER | Butuh katalog berbayar + payout policy. |
| Visual theming (warna/font/spacing/radius/shadows bebas) | NEVER | Template = keputusan desain. Variant predefined sudah cukup. |
| ISR yang di-set per user build | NEVER | Dynamic rendering sudah benar; jangan build-per-user. |

---

## 7. UX Audit

Prinsip panduan: **CONTENT FIRST, progressive disclosure, recognition over recall, minimal cognitive load, visibility of system status.**

### Journey audit

| Tahap | Masalah ditemukan | Severity |
|---|---|---|
| Landing | Tidak jelas "hasil tanpa usaha" dalam 3 detik; copy masih platform-generik; template demo bagus (perlu dipertahankan) | Medium |
| Template selection | Harus login dulu sebelum memilih dari dashboard; flow login→dashboard→gallery menambah langkah. Galeri publik (template-002) sudah ada di landing — itu jalur terbaik, perkuat | Medium |
| Signup | Form menanyakan First/Last name + phone di signup — itu kerja sebelum value. Tanyakan hanya email+password, lalu fullName sekali di editor | High |
| Onboarding/workspace | User diarahkan ke pembuatan workspace sebelum value. Jargon "workspace" asing bagi job seeker | High |
| Data collection | Data diminta di banyak tempat: signup, profile, workspace_profile, editor, Content Library — duplikasi dan kebingungan | High |
| Editor | Kuat secara visual (accordion + preview + device). Masalah: tab "Appearance" dan "Settings" menawarkan kontrol yang tidak perlu dipahami non-teknis; istilah "sections" developer-centric; checklist "readiness" bagus | Medium |
| Preview | Sudah sangat baik (perangkat, zoom, scroll-to-section). Belum ada highlight section aktif di preview saat accordion dibuka (baru scroll) | Low |
| Publish | Dialog subdomain bagus. Tidak ada penjelasan "apa yang terjadi jika subscription berhenti" dan tidak ada preview draft-versus-live yang jelas | Medium |
| Public site | Render baik. Tidak ada custom 404 yang ramah, tidak ada favicon khusus per user (default OK), expired site tidak ada state khusus | Low |
| Edit again / republish | Template switching tidak ada; setelah publish, perubahan draft tidak terlihat kecuali publish ulang — banner divergensi sudah ada (bagus) | Medium |
| Mobile | Editor punya drawers mobile (bagus). Signup/login/dashboard belum diverifikasi dengan keyboard virtual & tap target | Medium |

### Rekomendasi UX spesifik

1. **Satu alur:** Landing → pilih template → signup (email+password) → editor langsung. Hapus langkah "buat workspace" dari first run (buat portfolio default otomatis di balik layar).
2. **Ubah terminologi:** "Portfolio" untuk website, "Publish"/"Live" untuk status, "Isi data" untuk panel kiri. Hapus "workspace", "project", "version", "Content Library" dari permukaan user normal.
3. **Panel kanan:** sembunyikan "Appearance"; biarkan hanya yang diperlukan (mis. variant template, section visibility bila berguna, SEO). Kontrol lain jangan ditampilkan.
4. **Konteks seksi:** saat user membuka accordion, scroll preview ke seksi itu DAN beri highlight ring yang jelas; klik pada preview section → buka accordion yang sesuai (timbal balik).
5. **Auto-save states:** "Menyimpan… / Tersimpan / Gagal menyimpan (retry)". Hindari indikator yang hanya kedip.
6. **Required fields minimum:** name, headline, 1 proof item, contact email. Semua lain optional. Tampilkan alasan mengapa field diminta.
7. **System status publish:** selalu tampilkan URL live, "perubahan draft belum live", dan "subscription berakhir → situs otomatis offline setelah 7 hari, data tetap aman".
8. **Accessibility:** label, focus trap, aria-expanded untuk accordion, kontras, dan uji keyboard untuk seluruh editor.
9. **Error recovery:** jika autosave gagal, tawarkan retry + simpan draft terakhir di localStorage sebagai jaring pengaman.

---

## 8. Security Audit

Prioritas: CRITICAL > HIGH > MEDIUM > LOW. Semua CRITICAL dan HIGH di bawah **wajib** diperbaiki sebelum launch.

| Severity | Lokasi | Attack scenario | Impact | Fix | Wajib sebelum launch? |
|---|---|---|---|---|---|
| CRITICAL | `cron/check-subscriptions/route.ts:8-13` | Panggil GET tanpa header saat `CRON_SECRET` kosong | Soft-unpublish massal, DoS | Fail closed: 503 bila secret kosong, constant-time compare | YA |
| CRITICAL | `publishProjectAction` + RPC | Dua publish konkuren | 2 website live = quota dilanggar | Enforcement dalam satu transaksi DB | YA |
| HIGH | `rate-limit.ts` Map | Bypass rate limit di multi-instance | Brute force auth/publish | Limiter durable | YA |
| HIGH | webhook `route.ts` | Duplicate concurrent webhook; write gagal tapi 200 | Sub ganda / bayar tanpa aktivasi | Insert conflict-safe + cek error + non-2xx saat transient | YA |
| HIGH | Template schema URL (`z.string().url()`) + render `<a href>`/`<img src>` | Input `javascript:`/`data:` via field | Stored XSS | Allowlist scheme server-side per tipe field | YA |
| HIGH | `sites/[subdomain]/page.tsx` service-role | Query publik tanpa RLS | Potensi kebocoran lintas tenant | Client anon/server publik + ekspos minimal | YA |
| HIGH | `content/actions.ts` base64 upload | File non-image, polyglot | Malware/abuse storage | Magic bytes + dimensi + limit decode | YA |
| HIGH | `sanitize.ts` regex strip | Bukan sanitizer general; `on*`/`javascript:` varian lolos | XSS di render | Validasi + encoding di render (React sudah escape teks; jangan `dangerouslySetInnerHTML` untuk data user) | YA |
| HIGH | `auth/actions.ts:11-14` `x-forwarded-for` pertama | Spoof IP rate-limit identity | Bypass limiter | Pakai IP dari platform/edge yang tepercaya | YA |
| MEDIUM | `confirm/route.ts` `next` param | Open redirect | Phishing | Allowlist path relatif | YA |
| MEDIUM | `track/route.ts` | Visitor-controlled unlimited insert | DB abuse, biaya | Rate/budget/retention; atau nonaktifkan | Disarankan YA (atau defer fitur) |
| MEDIUM | `workspace_profile_public_read` self-comparison | Public baca profile | Info leak | Predicate eksplisit + field minimal | YA |
| MEDIUM | `app_metadata.role` claim manual | Role stale bila custom claims tidak deploy | Bypass/deny RBAC salah | Verifikasi trigger `sync_role_to_auth_metadata` live; dokumentasi deploy hooks | YA |
| MEDIUM | service-role di banyak module | Blast radius | Eksfiltrasi bila bocor key | Kurangi penggunaan; scoped keys jika didukung | YA |
| MEDIUM | 3 high vuln transitive | DoS | Degradasi | `npm audit fix` | YA |
| LOW | Password policy konsisten (Sudah kuat di signup; reset juga sudah) | — | — | Pertahankan | Tidak |
| LOW | CORS/CSRF pada Server Actions (Next.js built-in protection) | — | — | Pastikan cookie `SameSite=Lax`, tidak ada custom CORS longgar | Verifikasi |
| LOW | CSP belum terlihat | Clickjacking/inject | — | Tambah CSP yang kompatibel template + frame-ancestors | Disarankan |

**Catatan tambahan:** Jangan pernah mengeksekusi source template dari DB/upload. Alur designer (ZIP) memaksa review manual sebelum merge — pertahankan; dan karena Designer Portal bukan MVP, **nonaktifkan route tersebut untuk produksi.**

---

## 9. Architecture Audit

Masalah arsitektural yang actionable:

1. **Service-role sebagai client umum** (`src/lib/supabase/admin.ts` dipakai di 10+ modul termasuk public render dan track). Ini melonggarkan seluruh kontrak RLS di jalur publik. → Pisahkan: `publicClient` (anon, RLS), `authClient` (user session), `serviceClient` (webhook/cron/admin saja).
2. **Autosave = 2 query non-atomic per debounce** (max version + insert + update). → Ubah menjadi 1 upsert `projects.current_draft`; buat `project_versions` hanya saat publish (snapshot) dan saat restore. Ini sekaligus menyelesaikan race dan biaya.
3. **Dua lapisan profil.** → Untuk MVP, hilangkan `workspace_profile` dari alur: editor adalah satu-satunya sumber konten. `profiles` hanya identitas. Bila template perlu brand-level data, simpan sebagai field optional dokumen.
4. **Enforcement quota/entitlement di aplikasi, bukan DB.** → Pindah ke RPC transaksional. DB adalah garis pertahanan terakhir untuk invariant bisnis (1 published/akun, subdomain unique).
5. **Tiering dibangun di atas boolean gate.** → Sederhanakan: satu plan. `get_user_entitlements()` cukup, tanpa watermark/domain/template matrix sampai dibutuhkan.
6. **Cache tanpa invalidasi eksplisit.** → Terapkan `revalidatePath`/tag pada publish/unpublish/update. Public page harus menampilkan published snapshot, bukan draft yang belum live.
7. **Observability kosong.** → Tambah panggilan error tracking di webhook & cron + health endpoint + log terstruktur (minimal `console.error` + Sentry). Tanpa ini, kegagalan payment tidak terdeteksi.
8. **Monolith Next.js + Supabase itu tepat** untuk MVP. Jangan pisah backend, jangan Redis/Kafka/queue/replica/partition. Rekomendasi: **NOW** — perbaiki yang di atas; **LATER** — custom domain, analytics agregat; **NEVER** — microservices, runtime marketplace, plugin engine.

---

## 10. Database Audit

| Isu | Evidence | Dampak | Rekomendasi |
|---|---|---|---|
| Autosave menghasilkan row version tak terbatas | `store.ts:200-242` | Storage/cost, race | Draft tunggal + snapshot milestone |
| `workspace_profile` redundant vs `profiles` vs editor data | PRD §9.4 + `syncFromProfileAction` | Data ganda | Hapus dari alur MVP (pertahankan tabel bila murah, tapi jangan dipakai UI) |
| `workspace_assets` stub tanpa UI | migration 20260716000002, PRD mencatat stub | Dead table | Biarkan atau drop; jangan build UI |
| `payment_transactions` legacy Xendit tidak dipakai | `DATABASE_SCHEMA.md:145-162` | Dead code/data | Drop di masa tenang atau biarkan legacy; dokumentasikan |
| `projects.published_json/draft_json` legacy sudah di-drop — bagus | migration 20260728000001 | — | Pertahankan pattern version pointer |
| RLS `content_library_owner_all` `for all to public` | `DATABASE_SCHEMA.md:663` | Menulis `to public` lebih lebar dari perlu (masih dibatasi `user_id=auth.uid()` sehingga OK, tapi perjelas `to authenticated`) | Perbaiki klausa `to authenticated` |
| Index sudah baik untuk pola query inti | `projects_published_subdomain_idx`, `page_visits_project_created_idx`, dll. | — | Pertahankan |
| JSONB untuk konten template | query pattern = baca-seluruh-dokumen, render | Tepat untuk MVP | Pertahankan JSONB; jangan normalisasi dulu |

**Verdict data:** skema inti (`profiles`, `workspaces`, `projects`, `project_versions`, `subscriptions`, `billing_events`, `plans`, `entitlements`, `templates`) sudah layak. Yang perlu diubah: **autosave**, **enforcement atomic**, **penghapusan duplikasi profile**, dan **pembersihan tabel dead** (bertahap). JSONB adalah keputusan yang benar untuk MVP — jangan rombak.

---

## 11. Publishing & Billing Audit

### State machine subscription aktual

```
FREE → PENDING(checkout) → ACTIVE → (expire/deny) → GRACE_PERIOD(7d) → EXPIRED → (soft-unpublish)
ACTIVE → (cancel) → CANCELED → (soft-unpublish)
```

Implementasi:
- `getSubscriptionState` mengembalikan `isActive` saat `active` (expires di masa depan) ATAU dalam grace 7 hari — konsisten dengan PRD.
- `cron` memindahkan grace yang habis → `expired` + `softUnpublishUserProjects` (reversible, data aman).
- Webhook: `settlement`/`capture` → ACTIVE; `expire` → grace; `cancel`/`deny` → canceled + unpublish.

**Masalah:**
1. **Tidak ada PENDING eksplisit di DB** — pembayaran yang belum selesai tidak tercatat sebagai transaksi yang bisa diverifikasi (kecuali billing_events). Untuk MVP satu plan: cukup, tapi pastikan checkout snapshot user/amount untuk verifikasi webhook.
2. **Webhook tidak memverifikasi jumlah/currency/product** terhadap snapshot — hanya parse order id + plan. Attacker yang punya server key? Tidak. Risiko sebenarnya: order lama/legacy mis-parsing. Tambahkan validasi `gross_amount` vs `plan.price_idr` untuk menghindari salah-kunci entri.
3. **Renewal manual (per-bulan extend)** — belum ada recurring native; `expires_at` di-extend saat webhook settlement berikutnya. Ini OK untuk MVP asalkan reminder/notification direncanakan, dan **open question Midtrans recurring masih terbuka** (`IMPLEMENTATION_PLAN.md:574`).
4. **Upgrade/downgrade belum ada** — dengan 1 plan, tidak perlu. Tunda.
5. **Refund policy belum ada** — legal requirement. Dokumentasikan.

### Publishing state machine

```
draft → [publish] → published (snapshot dari current_version)
published → [unpublish] → draft (data & published_version dipertahankan)
draft → [edit+autosave] → current_version baru (published tak tersentuh)
```

**Race/edge yang harus diuji & dikunci:**
- **Publish ganda bersamaan:** harus di-tolak oleh DB (quota atomic + subdomain unique + status transition). Saat ini hanya app-level → C2.
- **Publish gagal setelah DB update:** RPC adalah satu statement; kalau gagal di tengah, transaksi rollback — baik. Pastikan client menangani error.
- **Edit draft setelah publish:** sudah benar (draft terpisah); banner divergensi ada; perlu tegas "perubahan belum live".
- **Subdomain diganti:** belum ada flow ganti subdomain; saat ini hanya saat publish. Perlu dipertimbangkan (publish ulang dengan subdomain baru = URL berubah). Beri warning bahwa URL lama mati.
- **Hapus website:** konfirmasi + hapus draft/versions/visits (cascade). Sudah ada di dashboard; pastikan published snapshot terhapus + cache invalidasi.
- **Cache:** unpublish harus meng-invalidate agar `/sites/x` 404 cepat; update/publish revalidate.
- **Expired subscription:** unpublish reversible, data aman, republish instant setelah bayar — sudah benar.

---

## 12. Template Engine Audit

**Kesimpulan: arsitektur template saat ini sudah cukup dan benar untuk MVP. JANGAN build runtime JSON schema, plugin loader, atau marketplace.**

Evaluasi:
- **Schema:** per-template Zod, extended dari base — sesuai kebutuhan. Sudah ada defaults + mapper + migrations (`definition.ts`).
- **Migration:** `runMigrations` + `migrations[]` ada; **belum ada unit test** untuk migration path — tambahkan test fixture (migrate v1→v2 data lama).
- **Compatibility & switching:** `buildInitialDocument` dari profile; **switching tidak ada**. Perlu: fungsi `switchTemplate(oldDoc, newDef)` yang memetakan field base yang sama (nama, headline, bio, contact, projects, skills, socials) dan menolak/meng-merge field ekstensi dengan warning. Simpan hasil sebagai draft baru, jangan sentuh published snapshot.
- **Required vs optional:** semua optional sekarang; readiness check di UI yang menggantinya — baik.
- **Renderer:** React component, menerima data tervalidasi — aman dan performant. Pertahankan.
- **Accessibility/SEO:** bergantung template; beberapa pakai GSAP/Framer — pastikan `prefers-reduced-motion` dan heading semantics.

**Keputusan ADR terkait:** template statis code-defined **NOW**, runtime **NEVER/LATER (Fase 3)**.

---

## 13. Performance Audit

| Area | NOW / LATER | Rekomendasi | Alasan |
|---|---|---|---|
| Autosave write amplification | NOW | 1 upsert current_draft | Setiap debounce = biaya + race |
| Data-URL gambar di JSONB | NOW | Storage URL (upload compressed, simpan URL) | Response/render/query membesar; ~10–100KB+ per gambar |
| Public render | NOW | cache immutable per published snapshot + revalidatePath; jaga `revalidate` bukan 0 | Speed + konsistensi |
| Query billing N+1 plan | NOW (minor) | join plans | — |
| Image delivery | LATER | transform/resize CDN (Supabase imgproxy atau Vercel Image) setelah traffic nyata | Optimasi dini tak perlu |
| Analytics agregasi | LATER | daily rollups | sebelum >10k visits |
| Bundle | LATER | audit besar saat editor/landing lambat di device nyata | ukur dulu |
| Supabase connections | LATER | tidak ada masalah pada skala MVP | koneksi per request normal di Next serverless |

**Skala:**
- **0–100 user:** semua arsitektur saat ini cukup setelah perbaikan di atas.
- **100–1.000:** tambah retensi analytics, image transform, cache immutable. Satu instance Vercel + Supabase cukup.
- **1.000–10.000:** cek hot sites; pertimbangkan aggregation analytics, mungkin read replica *hanya bila* ada bukti query berat — jangan dulu.
- **10.000–100.000:** mulai pertimbangkan edge caching penuh, object storage untuk gambar (sudah dari awal), dan mungkin separation — tetap ukur dulu.

**Jangan sekarang:** Redis, Kafka, sharding, partitioning, microservices, edge functions untuk render.

---

## 14. Production Readiness Checklist

- [ ] **Authentication** — Supabase email/password, SMTP production dikonfigurasi, email templates pakai `token_hash` (bukan fragment), reset password diuji lewat email nyata
- [ ] **Authorization** — `requireRole` di semua action; uji anon/owner/non-owner/admin/designer per resource; role claims sinkron live
- [ ] **RLS** — audit ulang semua policy (target `to authenticated` bukan `to public`); perbaiki `workspace_profile_public_read`; uji dengan peran nyata
- [ ] **Data validation** — Zod di server; length limits; URL scheme allowlist; input login/signup validated
- [ ] **XSS protection** — render plain text via React escaping; tidak ada `dangerouslySetInnerHTML` untuk data user; CSP pasang
- [ ] **Rate limiting** — durable; cover auth, publish, checkout, upload, webhook, analytics
- [ ] **Webhook security** — signature SHA-512, verifikasi amount/product/order, idempotency atomic, retry-safe
- [ ] **Billing** — 1 plan (atau entitlement lengkap), state machine teruji, grace period, cancel/refund policy, soft-unpublish reversible
- [ ] **Publishing** — atomic quota + subdomain + status; snapshot immutable; cache invalidated; unpublish → 404 cepat
- [ ] **SEO** — title, description, OG/Twitter, robots.txt, sitemap, canonical, favicon, heading hierarchy, image alt
- [ ] **Error handling** — server action mapping yang jelas; UI error states; retry autosave
- [ ] **Logging** — structured logs untuk webhook/cron/publish; error boundaries
- [ ] **Monitoring** — error tracking (Sentry/alternatif) live + alert; health endpoint; uptime check; webhook/cron alert
- [ ] **Backup** — Supabase backup aktif, restore drill tercatat
- [ ] **CI/CD** — lint+tsc+build+E2E di CI; staging deployment; migration hanya via pipeline/CLI; rollback runbook
- [ ] **Testing** — unit untuk migration/sanitasi/entitlement; E2E untuk signup→publish→public; payment sandbox E2E; race tests untuk publish/webhook
- [ ] **Accessibility** — keyboard nav, focus states, aria pada accordion/modal/toggle, kontras
- [ ] **Mobile** — editor drawers & form di keyboard virtual; tap target ≥44px
- [ ] **Legal** — Privacy, Terms, refund/cancellation, abuse report, data deletion

---

## 15. Recommended MVP Scope

**"Versi terkecil yang bisa diluncurkan dengan aman dan tetap menghadirkan nilai inti":**

1. Landing dengan 3–5 template demo berkualitas tinggi (sudah ada; kurangi katalog jadi yang terbaik).
2. Signup email/password + konfirmasi + reset (perbaiki SMTP/template).
3. Satu alur: pilih template → isi data → preview → publish.
4. Editor CONTENT-FIRST: profile (nama/headline/bio/foto), pengalaman singkat, skills, 1+ proof item, kontak. Semua field punya contoh; optional jelas.
5. Live preview desktop/tablet/mobile dengan renderer yang sama.
6. Autosave 1-upsert draft + status tersimpan/gagal.
7. Readiness check minimal.
8. Publish ke subdomain unik, 1 live per akun (atomic), snapshot immutable.
9. Unpublish/republish reversible; expiry → offline setelah grace, data aman.
10. Satu plan Basic monthly via Midtrans + webhook idempotent + state machine.
11. SEO dasar (title/desc/OG/robots/sitemap), favicon, custom 404, alt text.
12. Admin minimal: suspend, blocklist, audit, support.
13. Observability + backup + legal.

**Di luar MVP (jangan di-build sekarang):** analytics user, Content Library, multi-workspace UI, Designer Portal, marketplace, enterprise, annual, custom domain, OAuth, i18n site, version history penuh.

---

## 16. Recommended Sprint Plan

### Sprint 0 — Foundation (P0: C1, C2, C3, M-16)
- **Goal:** env production aman, schema reproducible, konfigurasi Supabase/Vercel/Midtrans production siap.
- **Backlog:** cron fail-closed; atomic publish RPC; durable rate limiter; SMTP + email templates; secret/env validation; migrasi reproducible; dependency audit fix.
- **Dependencies:** akses Supabase Dashboard, Vercel project, Midtrans sandbox/production keys.
- **Acceptance:** fresh env dapat dibangun dari migrasi; cron 503 tanpa secret; publish ganda ditolak DB; audit 0 high.
- **Complexity:** M · **Prioritas:** P0.

### Sprint 1 — Core Product (P1: M-04, M-11)
- **Goal:** draft loop yang benar dan template switching aman.
- **Backlog:** autosave 1-upsert + snapshot milestone; template switching dengan mapper + test migration; terminologi user-facing.
- **Dependencies:** Sprint 0.
- **Acceptance:** reload/close-tab aman; switch template mempertahankan data dan published snapshot; migration path teruji.
- **Complexity:** L · **Prioritas:** P0/P1.

### Sprint 2 — Editor & UX (P1: M-01/M-05/M-12/M-13/M-19)
- **Goal:** editor benar-benar CONTENT FIRST untuk non-teknis.
- **Backlog:** satu alur isi data; hapus workspace dari first-run; panel kanan minimal; section highlight dua arah; a11y; mobile keyboard.
- **Dependencies:** Sprint 1.
- **Acceptance:** user baru selesai isi dasar tanpa bantuan; tidak ada istilah developer di permukaan utama; lighthouse/axe pass dasar.
- **Complexity:** M-L · **Prioritas:** P1.

### Sprint 3 — Publishing & Billing (P0: M-03/M-06/M-07/M-10/M-20)
- **Goal:** publish atomic + monetisasi bekerja end-to-end.
- **Backlog:** entitlement/1-plan enforcement; webhook atomic; public render tanpa service-role; cache revalidate; Midtrans sandbox E2E.
- **Dependencies:** Sprint 0-1.
- **Acceptance:** settlement→active→publish; duplicate webhook no-op; grace→unpublish→republish; race test lolos.
- **Complexity:** L · **Prioritas:** P0.

### Sprint 4 — Security & Production Hardening (M-05/M-08/M-14/M-15)
- **Goal:** tutup sisa keamanan dan buat observability.
- **Backlog:** URL scheme + XSS; upload magic-byte + Storage; CSP; open redirect; error tracking + health + backup drill; hapus dead route designer dari produksi.
- **Dependencies:** Sprint 3.
- **Acceptance:** checklist keamanan §14 lengkap; tidak ada high finding; restore drill tercatat.
- **Complexity:** M · **Prioritas:** P0/P1.

### Sprint 5 — Launch Preparation (M-17/M-18/M-19/M-20)
- **Goal:** kohort launch 10–20 user.
- **Backlog:** legal lengkap; SEO final; a11y pass; staging E2E penuh; monitoring alert; support/abuse path; funnel events internal.
- **Dependencies:** Sprint 4.
- **Acceptance:** cohort user selesai create→publish; payment reconciliation; incident owner; rollback tested.
- **Complexity:** M · **Prioritas:** P1.

---

## 17. Product Backlog

**MUST HAVE** (blokir launch)

| ID | Backlog | User Story | Priority | SP | Acceptance Criteria |
|---|---|---|---|---|---|
| MH-01 | Auth production (SMTP, email template, reset) | Sebagai pengguna, saya ingin verifikasi email dan reset password bekerja sehingga akun saya aman | P0 | 3 | Signup→email→confirm→login sukses; reset sukses |
| MH-02 | Atomic publish quota | Sebagai pemilik, saya ingin hanya satu website live sehingga tidak membayar ganda | P0 | 5 | Publish ganda ditolak di DB |
| MH-03 | Durable rate limit | Sebagai operator, saya ingin membatasi abuse | P0 | 3 | Limit lintas instance teruji |
| MH-04 | Autosave reliable | Sebagai pengguna, saya ingin isi saya aman saat reload | P0 | 5 | Tidak ada race; status jelas |
| MH-05 | Public render aman | Sebagai pemilik, saya ingin data saya tidak bocor | P0 | 5 | Uji anon/owner/service-role |
| MH-06 | Webhook aman | Sebagai pelanggan, saya ingin pembayaran saya tercatat sekali | P0 | 5 | Idempotent; error retry |
| MH-07 | Validasi input + XSS | Sebagai pemilik, saya ingin situs saya aman dibuka orang lain | P0 | 5 | URL scheme allowlist; no stored XSS |
| MH-08 | 1 plan Basic + E2E sandbox | Sebagai pelanggan, saya ingin membayar dan publish | P0 | 8 | Settlement→active; grace; unpublish; republish |
| MH-09 | Observability + backup | Sebagai operator, saya ingin mendeteksi error dan memulihkan data | P0 | 5 | Error masuk dashboard; restore drill |
| MH-10 | Template switching | Sebagai pengguna, saya ingin ganti template tanpa kehilangan isi | P1 | 8 | Data bertahan; published aman |

**SHOULD HAVE**

| ID | Backlog | User Story | Priority | SP | Acceptance Criteria |
|---|---|---|---|---|---|
| SH-01 | Satu alur isi data | Sebagai user, saya ingin isi sekali tidak berulang | P1 | 5 | Tidak ada input duplikat di journey |
| SH-02 | Terminologi user-facing | Sebagai user, saya ingin memahami istilah | P1 | 2 | Tidak ada "workspace/version/Content Library" di permukaan utama |
| SH-03 | Section highlight dua arah | Sebagai user, saya ingin tahu seksi mana yang saya edit | P1 | 3 | Klik accordion→scroll+highlight; klik preview→buka form |
| SH-04 | SEO dasar | Sebagai user, saya ingin link saya dibagikan dengan baik | P1 | 3 | OG/title/desc/robots/sitemap |
| SH-05 | Upload image aman | Sebagai user, saya ingin foto tampil dan aman | P1 | 5 | Magic byte; Storage; orphan cleanup |
| SH-06 | Revalidasi cache publish | Sebagai user, saya ingin perubahan saya langsung live | P1 | 2 | Publish→halaman publik ter-update cepat |
| SH-07 | Legal + abuse report | Sebagai operator, saya ingin menindak abuse secara sah | P1 | 3 | Terms/Privacy/refund; report path |
| SH-08 | Mobile editor pass | Sebagai user, saya ingin mengedit dari HP | P1 | 5 | Keyboard virtual; tap target |

**COULD HAVE**

| ID | Backlog | User Story | Priority | SP | Acceptance Criteria |
|---|---|---|---|---|---|
| CH-01 | Custom 404 + state expired | Sebagai visitor, saya ingin tahu situs tidak ada | P2 | 2 | 404 ramah; pesan expired |
| CH-02 | Undo/redo terbatas di editor | Sebagai user, saya ingin batalkan perubahan | P2 | 3 | Ctrl+Z; history singkat |
| CH-03 | Analytics dasar (jika operator mau) | Sebagai pemilik, saya ingin tahu visitor | P2 | 5 | Retensi + anti-spam |
| CH-04 | OAuth Google | Sebagai user, saya ingin login cepat | P2 | 3 | Flow ada (sudah UI-nya) |

**LATER**

| ID | Backlog | User Story | Priority | SP | Acceptance Criteria |
|---|---|---|---|---|---|
| LT-01 | Annual billing | Sebagai pelanggan, saya ingin bayar tahunan | P3 | 5 | Policy refund/renewal |
| LT-02 | Custom domain | Sebagai pelanggan premium, saya ingin domain sendiri | P3 | 8 | Verifikasi DNS/SSL |
| LT-03 | Multi-workspace/portfolio | Sebagai freelancer, saya ingin beberapa portfolio | P3 | 8 | Isolasi + billing |
| LT-04 | Designer submission | Sebagai designer, saya ingin mengusulkan template | P3 | 13 | Security review |
| LT-05 | Enterprise | Sebagai tim, saya ingin kolaborasi | P3 | 13 | Org model |

---

## 18. Architecture Decision Records

### ADR-001 — Multi-workspace vs single portfolio
- **Context:** personae berbeda; saat ini multi-workspace dibangun penuh.
- **Decision:** MVP = satu portfolio aktif per akun; backend boleh menahan `workspaces` (isolasi data) tetapi UI first-run menyembunyikan konsep tersebut.
- **Why:** job seeker hanya butuh satu; mengurangi input duplikat dan jargon.
- **Trade-offs:** freelancer multi-brand butuh refactor kecil di masa depan.
- **Status:** Diterima.

### ADR-002 — JSONB vs normalized portfolio content
- **Context:** konten per template beragam; query pattern baca-seluruh-dokumen.
- **Decision:** simpan `WebsiteDocument` sebagai JSONB di `current_draft` + `published snapshot`; normalisasi hanya untuk data operasional (user, subscription, publish identity, billing, analytics).
- **Why:** renderer memegang schema; MVP tidak query per field.
- **Trade-offs:** field-level query/reporting lebih sulit — tidak dibutuhkan sekarang.
- **Status:** Diterima.

### ADR-003 — Template statis code-defined vs runtime
- **Context:** marketplace/plugin tergoda dibangun.
- **Decision:** template statis di codebase dengan `TemplateDefinition`; `templates` table hanya katalog operasional (is_active, minimum_plan).
- **Why:** keamanan (tidak eksekusi kode tak tepercaya), deterministik, cepat.
- **Trade-offs:** menambah template butuh deploy; acceptable untuk MVP.
- **Status:** Diterima. Runtime = LATER/Fase 3, hanya bila ada bisnis case marketplace.

### ADR-004 — Autosave strategy
- **Context:** sekarang setiap debounce menulis baris version baru (2 query).
- **Decision:** autosave = 1 upsert `current_draft`; history snapshot hanya saat milestone (publish/restore/manual). Batasi history (mis. 10 snapshot + published).
- **Why:** atomic, hemat biaya, menghilangkan race.
- **Trade-offs:** granular history lebih kasar; cukup untuk MVP.
- **Status:** Direkomendasikan.

### ADR-005 — Publishing architecture
- **Context:** snapshot vs pointer; cache.
- **Decision:** publish = satu transaksi RPC yang men-set `published_version_id = current_version_id` + status + subdomain + enforcement quota/entitlement; cache public di-invalidate via `revalidatePath`.
- **Why:** draft tak pernah bocor; atomic; konsisten.
- **Trade-offs:** perlu RPC lebih kompleks (tetap kecil).
- **Status:** Diterima (perkuat enforcement atomic).

### ADR-006 — Storage strategy
- **Context:** data-URL inline di JSONB saat ini.
- **Decision:** upload compressed ke Supabase Storage (bucket privat + signed/public URL), simpan URL di dokumen; validasi magic-byte/dimensi.
- **Why:** payload kecil, response cepat, isolasi, abuse terbatasi.
- **Trade-offs:** perlu upload flow server-side; manfaat besar.
- **Status:** Direkomendasikan.

### ADR-007 — RLS strategy
- **Context:** service-role dipakai luas; beberapa policy `to public`.
- **Decision:** tiga kelas client (public/anonymous, authenticated, service-only); RLS ownership chain; semua policy eksplisit `to authenticated` untuk tulis.
- **Why:** defense-in-depth; least privilege.
- **Trade-offs:** sedikit boilerplate; aman.
- **Status:** Diterima.

### ADR-008 — Caching strategy
- **Context:** ISR `revalidate=60` tanpa invalidasi eksplisit.
- **Decision:** cache immutable per published snapshot; invalidasi eksplisit pada publish/unpublish/update; fallback revalidate untuk keamanan.
- **Why:** konsistensi live; performa.
- **Trade-offs:** perlu hook revalidate — kecil.
- **Status:** Direkomendasikan.

---

## 19. Final Recommendation

1. **Build sekarang:**
   - Fix keamanan/data-integrity yang kritis: cron fail-closed, publish atomic, rate limiter durable, autosave 1-upsert, public render tanpa service-role, webhook atomic, URL scheme validation, upload magic-byte.
   - Template switching non-destructive.
   - Satu alur isi data (hapus duplikasi profile/workspace) dan terminologi user-facing.
   - Observability + backup + legal.

2. **Perbaiki:**
   - SMTP/email templates production.
   - Webhook verifikasi amount/product + idempotency atomic + error handling.
   - Cache invalidasi publish.
   - RLS `workspace_profile_public_read` dan policy `to public`.
   - Dependency audit.

3. **Hapus dari launch surface:**
   - Designer Portal route dari produksi (nonaktifkan) hingga Fase 2.
   - Analytics user-facing (atau nonaktifkan sementara).
   - Enterprise/annual/custom domain dari pricing sampai terbukti.
   - Content Library dari UI first-run.
   - Dead code/tables: `payment_transactions`, `workspace_assets` UI, `e2e/dbg.spec.ts`, ikon ganda.

4. **Tunda:**
   - Tiered billing (gunakan satu Basic), multi-workspace UI, marketplace, revenue sharing, OAuth, i18n site, advanced analytics, version history penuh.

5. **Apakah project sudah mendekati production?**
   **Belum.** Secara fungsional 70–80% jalan, tetapi produksi = keamanan + data integrity + observability + monetisasi yang terbukti. Fase tersebut belum ada bukti. Dengan perbaikan P0 di atas, project dapat mencapai launch-ready dalam 3–5 sprint.

6. **Blocker terbesar sebelum launch:**
   1. **Operational/keamanan:** cron fail-open, publish non-atomic, rate limit non-durable, service-role di jalur publik.
   2. **Monetisasi:** webhook/idempotency + enforcement entitlement + E2E sandbox yang belum tuntas.
   3. **Data:** autosave race/bloat dan duplikasi input user.
   4. **Value:** template switching yang tidak ada — janji produk inti belum terpenuhi.
   5. **Observability:** tanpa error tracking dan backup restore drill, insiden = kehilangan permanen yang tak terdeteksi.

> Prioritas bertingkat: **1 User value → 2 Security → 3 Data integrity → 4 Reliability → 5 Simplicity → 6 Performance → 7 Scalability.** Rekomendasi di atas mengikuti urutan itu. Hal-hal yang hanya "menarik" (marketplace, analytics, enterprise, multi-workspace) sudah ditekan ke LATER/NEVER sampai ada bukti kebutuhan — karena menambah fitur sekarang justru memperlambat satu-satunya tujuan yang penting: **membuat pengguna pertama berhasil publish dan membayar.**
