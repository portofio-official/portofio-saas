# TEMPLATE AUTHORING — Cara Menambah/Memelihara Template

Versi: 1.0 · 2026-08-08

Tujuan dokumen ini: mencadangkan pengetahuan agar perakit baru (atau sesi agent
berikutnya) dapat menambah atau mengubah template **tanpa membaca seluruh
codebase**. Template TIDAK disimpan di directory terpisah (repo/package/DB).
Alasan keputusan ini ada di `docs/FLOW_CLOSURE_PLAN.md` (awal) — untuk MVP
(kurang dari ~15 template, semua buatan internal) yang di tempat dengan
app code memberikan type-safety + HMR + zero runtime cost.

---

## 1. Struktur Satu Template

```
src/templates/
├── definition.ts          ← jenis TemplateDefinition, TemplateMeta, TemplateVariant
├── types.ts               ← TEMPLATE_IDS (satu-satunya daftar id runtime)
├── registry.tsx           ← SATU-SATUNYA tempat registrasi template
└── definitions/
    └── <template-id>/
        ├── definition.ts  ← Definition object (wajib export default juga)
        ├── schema.ts      ← Zod schema (kontrak data template)
        ├── defaults.ts    ← data awal saat project baru
        ├── mapper.ts      ← isi data dari UserProfile/WorkspaceProfile
        ├── migrations.ts  ← migrasi data antar-version
        └── renderer.tsx   ← komponen React untuk render
```

Referensi paling lengkap: salin
`src/templates/definitions/_template/definition.template.tsx`.

---

## 2. Checklist Menambah Template Baru

1. Buat folder `src/templates/definitions/<template-id>/` (pakai id huruf
   kecil + kebab-case, contoh `clean-agency`).
2. Salin scaffold `_template/` → implementasi `schema.ts`, `defaults.ts`,
   `renderer.tsx`, dst.
3. Isi **`meta.gallery` wajib** — ini single source metadata galeri
   (`accentBg`, `categories`, `popular`). Tanpa itu template tidak tampil di
   galeri publik (TemplateGallery) maupun dashboard (TemplateShowcase).
4. Tambahkan id ke `TEMPLATE_IDS` di `src/templates/types.ts`.
5. Registrasi template **otomatis** via `import.meta.glob` di `registry.tsx`
   (Next ≥ 16.3, Turbopack — sudah aktif). Cukup langkah 1–4; **registry
   TIDAK perlu diedit**. Template **TIDAK** perlu menyentuh
   `TemplateGallery.tsx` / `TemplateShowcase.tsx` — keduanya otomatis membaca
   `TEMPLATE_CATALOG` dari `registry.tsx`.
6. Tambahkan baris seed ke
   `supabase/migrations/20260720131552_add_active_templates.sql` (atau buat
   migration baru) agar memfilter `activeTemplateIds` di `/[locale]/templates`.
7. Verifikasi: `npm run lint && npx tsc --noEmit && npm run build`.

> Catatan: `import.meta.glob` membutuhkan build Turbopack (default di Next 16).
> Jangan downgrade ke webpack (`--webpack`), atau auto-register berhenti bekerja.

---

## 3. Data Sisipan Mengisi Template Baru

- `mapper` (jika semua template porta boleh data dari UserProfile) dipakai
  oleh `buildInitialDocument` (`definition.ts`) saat project baru dibuat.
- `BaseData` di `src/templates/shared/_base.ts` adalah data umum (nama,
  headline, bio, kontak, theme). Template domain-specific (Studio,
  PortfolioPro) memperluas dari sana.

---

## 4. Mengubah Template yang Sudah Ada

- Ubah schema → VERBOSE hanya dari `defaults` baru (Zod merges via
  `parseDocumentData`). Jangan sampai menghapus field lama yang dimiliki
  dokumen tersimpan saat renderer — gunakan `migrations.ts` (`from → to`).
- Ubah deskripsi/accentBg → edit `definition.meta.gallery`, tanpa perlu
  menyentuh galeri komponen.
- Bump `version` + tulis migration saat struktur data berubah, jangan cuma
  mengubah schema.

---

## 5. Definisi "Selesai" (Definition of Done)

1. `npm run lint && npx tsc --noEmit && npm run build` pass.
2. Template muncul di kedua galeri (publik `/templates` + landing showcase).
3. Template bisa dipilih → preview live → project baru render dengan data
   benar (happy path).
4. Data lama (project yang sudah ada) tetap render setelah update schema.
5. `claude-progress.md` + `feature_list.json` (template-related) diperbarui.