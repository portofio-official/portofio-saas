# Task Tracker — Portofio

Sumber kebenaran untuk status per fitur tetap `feature_list.json` (dibaca ulang tiap sesi per `CLAUDE.md`). Tabel ini adalah ringkasan tampilan untuk tracking, urut sesuai prioritas pengerjaan. Update manual setiap kali status sebuah task berubah di `feature_list.json`.

**Legenda Status:** `Not Started` · `In Progress` · `Blocked` · `In Review` · `Completed`
**Kolom tanggal kosong (`-`)** berarti belum masuk fase itu. **Deadline At / Checker** masih `-` di semua baris — proyek ini belum punya target tanggal rilis maupun reviewer/QA yang ditunjuk (lihat PRD §16 Open Questions); isi begitu sudah diputuskan, jangan ditebak.

| Epic / Area (Backend Focus) | Task ID | Backend Task Description | Status | Progress | Remarks |
|---|---|---|---|---|---|
| **1. Database & Architecture** | 1.1 | Setup DB Schema (Workspaces, Sites, Profil) | Completed | 100% | Migrasi SQL dan relasi tabel (Init). |
| | 1.2 | Row Level Security (RLS) & Multi-tenant | Completed | 100% | Keamanan akses (isolasi) data antar workspace & user. |
| | 1.3 | Migrasi Arsitektur Project (Fase 1-4) | Completed | 100% | Perombakan table `projects` (`draft_json` / `published_json`). |
| **2. Auth, JWT & RBAC** | 2.1 | Konfigurasi Supabase Auth & Verifikasi | In Progress | 95% | Konfigurasi tautan di Email Templates Supabase belum sesuai. |
| | 2.2 | Edge Function: Custom JWT Claims | Completed | 100% | Inject `role` ke dalam JWT metadata saat sesi baru dibuat. |
| | 2.3 | Trigger & Proteksi Rute (Middleware) | Completed | 100% | Sinkronisasi `profiles.role` dan proteksi backend `/admin`. |
| **3. Core Server Actions** | 3.1 | CRUD Workspace API & Actions | Completed | 100% | Server mutasi untuk pembuatan dan penghapusan workspace aman. |
| | 3.2 | API Simpan Data Portofolio (Auto-save) | Completed | 100% | Mengamankan payload dan menulis ke dalam JSONB Supabase. |
| | 3.3 | Penyimpanan Aset / Foto | Completed | 100% | Skema base64/kompresi aset di client yang masuk ke payload server. |
| **4. Publishing Engine** | 4.1 | RPC `publish_project()` (Atomic Transfer) | Completed | 100% | Fungsi `SECURITY DEFINER` (PL/pgSQL) transfer draft ke published. |
| | 4.2 | Validasi Subdomain (Server-side) | Completed | 100% | Regex check, cek relasi bentrok dengan akun lain, query blocklist. |
| | 4.3 | Dynamic Subdomain Router | Completed | 100% | Pengambilan data `published_json` via *Server Component*. |
| **5. Billing & Webhooks** | 5.1 | Integrasi Xendit API (Create Invoice) | Not Started | 0% | Endpoint server untuk menghasilkan payload pembayaran ke Xendit. |
| | 5.2 | Xendit Webhook Listener (Route Handler) | Not Started | 0% | Endpoint penerima webhook (termasuk validasi signature Xendit). |
| | 5.3 | Idempotency (`billing_events`) & Update | Not Started | 0% | Memastikan satu webhook Xendit diproses tepat satu kali ke `subscriptions`. |
| | 5.4 | Auto-Unpublish (Grace period checker) | Not Started | 0% | Mekanisme cron/logic penarikan *site* jika subscription *expired*. |
| **6. Admin Service API** | 6.1 | Admin Actions: Suspend User (`ban_duration`) | Completed | 100% | Bypass RLS via Supabase Admin Client API untuk menangguhkan user. |
| | 6.2 | Toggle Active Templates API | Completed | 100% | API admin untuk menyembunyikan/menampilkan template (visibilitas). |
| **7. Frontend Assist** | 7.1 | UI Galeri, Live Preview, Editor, Dashboard | Completed | 100% | *Assist only:* Integrasi dari endpoint backend ke state React client. |

---

## Ringkasan Progres

- **Selesai (Completed):** 10 dari 13 (#1 PRD, #2 Setup Supabase, #4 Workspace, #5 Data Portofolio, #6 Galeri Template Dashboard, #7 Galeri Template Publik, #8 Publish Subdomain, #11 Arsitektur Project, #12 RBAC, #13 Admin Dashboard)
- **Sedang berjalan (In Progress):** 2 dari 13 (#3 Auth — sisa bug konfigurasi email template di Supabase Dashboard; #9 Dashboard Pengguna — tinggal menunggu integrasi billing)
- **Belum mulai (Not Started):** 1 dari 13 (#10 Billing & Subscription — integrasi Xendit)
- Kedua migration SQL yang sebelumnya pending **sudah dijalankan dan dikonfirmasi aktif** oleh user — tidak ada lagi blocker migration.
- Repo ini **sudah jadi git repository** dengan remote (`origin` → GitHub), ada commit history. Blocker version-control dari sesi-sesi sebelumnya sudah tidak berlaku lagi.
