# PRD v2 — Portofio

Status: usulan, belum disetujui untuk implementasi
Tanggal: 2026-08-22
Menggantikan: `docs/PRD.md` (v1) — v1 tetap jadi rujukan sampai Fase 1 v2 mulai.

---

## 0. Kenapa v2 ada

v1 berhasil membangun produk satu sisi: user isi form, pilih dari 8 template,
publish. Yang tidak bisa v1 lakukan adalah tumbuh, karena empat batasan
struktural berikut.

**0.1 — Template adalah kode, bukan data.**
`TEMPLATE_IDS` di-hardcode di `src/templates/types.ts`. Registry mengambil
folder lewat `import.meta.glob("./definitions/*/definition.ts")`. Alur designer
yang tertulis di migration `20260719000004_add_template_submissions.sql`:
designer upload ZIP → admin review kode → admin merge ke repo → tambah id ke
`types.ts` → deploy Vercel → template live.

Konsekuensinya, **setiap template baru butuh satu deploy dan satu sesi kerja
admin.** Marketplace butuh ratusan template. Alur ini mentok di sekitar 20.

**0.2 — Data user terikat ke template.**
Tiap template punya `schema.ts` sendiri yang meng-extend `baseProfileSchema`,
dan dokumen disimpan sebagai `data: Record<string, unknown>`
(`src/templates/definition.ts`). Akibatnya user yang pindah dari `corporate`
(punya `education`, `pricing`) ke `minimal` (tidak punya keduanya) kehilangan
data. Padahal "isi sekali, coba semua template" justru nilai jual utama produk
ini.

**0.3 — Tidak ada ekonomi untuk designer.**
`TemplateMeta.price` hanya field dengan komentar `// >0 reserved for
marketplace`. Tidak ada tabel order, lisensi, earnings, atau statistik pakai.
Designer belum punya alasan apa pun untuk datang.

**0.4 — Admin adalah bottleneck teknis.**
Peran admin hari ini secara efektif "integrator kode". Yang dibutuhkan
marketplace adalah admin sebagai penjaga kualitas dan operator katalog.

**0.5 — Bukti bahwa perbaikannya ada di depan mata.**
Delapan template yang sudah ada hanya memakai 13 jenis section, dan sebagian
besar memakai lima yang sama (`profile`, `skills`, `projects`, `contact`,
`experience`). Perbedaan antar template adalah presentasi, bukan struktur. Kit
section bukan penyempitan produk — itu deskripsi akurat dari apa yang sudah
dibangun, hanya saja sekarang ditulis ulang delapan kali sebagai kode.

---

## 1. Tujuan v2

Satu kalimat: **template menjadi data, sehingga siapa pun bisa membuatnya tanpa
deploy, dan data user tidak pernah hilang saat berpindah template.**

Tiga persona, tiga hasil yang harus benar:

| Persona  | Hasil yang harus benar |
|----------|------------------------|
| User     | Isi satu form, lihat datanya sendiri di semua template, publish. Ganti template kapan saja tanpa kehilangan apa pun. |
| Designer | Buat template di kanvas visual di dalam platform, submit, terbit tanpa menunggu deploy. Punya profil publik dan statistik pemakaian. |
| Admin    | Menjaga kualitas katalog lewat antrean review yang sudah disaring otomatis. Tidak pernah menyentuh kode template. |

---

## 2. Prinsip arsitektur

**P1 — Satu schema konten kanonik untuk semua template.**
Template tidak mendefinisikan schema data. Template hanya memilih section mana
yang dipakai dan bagaimana tampilannya. Data user hidup di satu tempat dan
tidak pernah dipetakan ulang.

**P2 — Template adalah baris di database, bukan folder di repo.**
Terbit = insert row. Tidak ada deploy dalam jalur kritis publikasi template.

**P3 — Satu renderer untuk semua permukaan.**
Kanvas designer, preview user, dan situs publik memakai `SectionRenderer` yang
sama. Kalau tiga permukaan pakai jalur render berbeda, WYSIWYG jadi bohong dan
bug muncul di tempat yang paling mahal — situs live milik pelanggan.

**P4 — Situs terbit dikunci ke versi template.**
`sites` menyimpan `template_version_id`. Designer memperbarui template tidak
pernah mengubah situs yang sudah live tanpa persetujuan pemiliknya.

---

## 3. Model konten kanonik

Satu schema, superset dari semua kemampuan section. Diturunkan langsung dari
`src/templates/shared/_base.ts` yang sudah ada — bukan rancangan baru dari nol.

```
content: {
  profile:      { fullName, headline, bio, photoUrl, location }
  contact:      { email, phone, whatsapp }
  socials:      [{ platform, url }]
  skills:       [string]
  experience:   [{ company, role, startDate, endDate, description }]
  education:    [{ institution, degree, field, startYear, endYear }]
  projects:     [{ title, description, imageUrl, link, tags }]
  testimonials: [{ name, role, avatarUrl, quote, rating }]
  pricing:      [{ name, price, currency, period, features, highlighted }]
  gallery:      [{ imageUrl, caption }]
  certificates: [{ name, issuer, year, url }]
}
```

Aturan yang mengikat:

- Field boleh **ditambah**, tidak pernah dihapus atau diganti nama tanpa
  migration. Ini kontrak antara semua template dan semua situs live.
- Setiap field boleh kosong. Section yang slot datanya kosong **tidak
  dirender**, bukan merender kotak kosong. Ini yang membuat satu template
  bekerja untuk user yang mengisi lengkap maupun seadanya.
- Form user adalah proyeksi dari schema ini, bukan turunan dari template yang
  sedang dipilih.

**Migrasi dari v1:** `portfolio_data.data` yang sekarang per-template
digabungkan ke bentuk kanonik. Karena semua template v1 meng-extend
`baseProfileSchema`, sebagian besar field sudah sejajar; sisanya (`skillsShowcase`,
`caseStudies`, `expertise`) adalah penamaan ulang dari `skills` dan `projects`
dan bisa dipetakan deterministik.

---

## 4. Section Kit

Unit terkecil yang bisa disusun designer. Setiap section punya **slot data
kanonik yang tetap** dan **varian presentasi yang banyak**.

| kind | slot data | varian awal |
|------|-----------|-------------|
| `hero` | profile | split, centered, fullbleed, minimal, stacked |
| `about` | profile.bio | prose, two-column, with-photo |
| `skills` | skills | chips, bars, grid, inline |
| `experience` | experience | timeline, list, cards |
| `education` | education | timeline, list |
| `projects` | projects | grid-2, grid-3, masonry, list, featured-first |
| `gallery` | gallery | grid, carousel, masonry |
| `testimonials` | testimonials | cards, quote-single, marquee |
| `pricing` | pricing | tiers-3, table, single |
| `certificates` | certificates | list, badges |
| `contact` | contact + socials | minimal, split, form, cta-banner |

Aturan kit:

- Menambah **varian** tidak butuh migration dan tidak merusak template yang ada.
- Menambah **kind** baru butuh entri di kit dan boleh dilakukan berdasarkan
  permintaan designer. Ini katup pelepas tekanan kalau kit terasa sempit.
- Section wajib minimal: satu `hero`-family dan satu `contact`. Ditegakkan di
  validasi, bukan di dokumentasi.

### Bentuk layout JSON

```json
{
  "version": 1,
  "tokens": {
    "fontHeading": "...", "fontBody": "...",
    "colorAccent": "#...", "colorBg": "#...", "colorText": "#...",
    "radius": "md", "density": "comfortable", "maxWidth": "1120"
  },
  "sections": [
    { "id": "s1", "kind": "hero", "variant": "split",
      "props": { "align": "left", "showPhoto": true },
      "style": { "bg": "surface", "padY": "xl" } }
  ]
}
```

Inilah seluruh isi sebuah template. Tidak ada kode, tidak ada CSS bebas, tidak
ada eksekusi. Konsekuensi keamanannya besar: **tidak ada permukaan XSS dari
konten designer**, karena tidak ada yang dieksekusi. ZIP upload dan private
bucket dari v1 bisa dipensiunkan seluruhnya.

---

## 5. Designer Studio — kanvas

Rasa Figma, unit section. Yang diambil dari Figma adalah **cara berinteraksi**;
yang tidak diambil adalah geometri bebas, karena template harus terikat data
user yang jumlahnya tidak diketahui saat mendesain.

**Layout layar:**
- **Kiri — Layers.** Daftar section berurutan. Drag untuk mengurutkan, klik
  untuk memilih, toggle sembunyikan. Tombol tambah section membuka kit.
- **Tengah — Kanvas.** Pan dan zoom. Artboard desktop dan mobile berdampingan,
  keduanya live. Klik di kanvas memilih section, klik dua kali masuk ke
  propertinya.
- **Kanan — Inspector.** Varian section, props, override style. Berubah sesuai
  yang dipilih.
- **Atas — Token global.** Pasangan font, palet, radius, density, lebar maks.
  Toggle device. Undo/redo.

**Fitur yang membedakan dari Figma, dan justru yang paling penting:**

**Preview data ekstrem.** Toggle untuk mengisi kanvas dengan: data kosong, data
minimum (1 project, tanpa foto, bio satu baris), data khas, dan data ekstrem
(17 project, judul 90 karakter, 40 skill, bio 8 paragraf). Designer harus
melihat template mereka gagal sebelum user yang mengalaminya. Figma tidak
punya ini karena Figma mendesain gambar, bukan sistem. Ini yang menggantikan
kebebasan geometri: designer tidak menempatkan piksel, tapi mereka bertanggung
jawab atas rentang isi.

**Alur designer:**
Studio → simpan draft (berkali-kali, tidak dibatasi) → Submit versi → gate
otomatis → antrean admin → terbit atau revisi.

---

## 6. Alur user

Perbaikan UX terbesar ada di dua titik.

**6.1 — Onboarding progresif, bukan form panjang.**
Minta lima field saja (nama, headline, bio, satu cara kontak, satu project),
lalu **langsung tunjukkan hasilnya**. Sisa form diisi dari editor, kapan saja.
Form panjang di depan adalah titik keluar terbesar untuk produk seperti ini.

**6.2 — Galeri menampilkan data user sendiri.**
Setelah lima field terisi, galeri template merender **data user itu**, bukan
konten dummy. Ini yang dibeli konversi: user melihat dirinya sendiri di 40
template dalam satu layar gulir. Secara teknis ini gratis begitu P1 dan P3
berlaku — schema kanonik dan renderer tunggal membuat setiap kartu galeri
hanyalah `SectionRenderer` berukuran kecil.

**6.3 — Ganti template tidak pernah menghapus apa pun.**
Karena data kanonik. Ini berubah dari risiko menjadi fitur yang dipasarkan:
"ganti tampilan kapan saja, isinya ikut."

Alur lengkap: signup → onboarding 5 field → galeri dengan data sendiri → pilih
→ editor (form kiri, preview kanan, satu renderer) → publish → paywall
langganan → subdomain live.

Paywall tetap hanya di publish, seperti v1. Tidak ada paywall kedua di
template.

---

## 7. Alur designer

1. Daftar sebagai designer, isi profil publik (nama, bio, avatar, tautan).
2. Studio → buat template → simpan draft.
3. Submit versi untuk review.
4. Gate otomatis jalan lebih dulu (bagian 8). Gagal gate = ditolak seketika
   dengan daftar masalah yang konkret, tidak masuk antrean manusia.
5. Lolos gate → antrean admin → terbit, atau revisi dengan catatan.
6. Terbit: template muncul di galeri, halaman profil designer menautkannya.
7. Designer melihat statistik: dilihat, dipakai, situs aktif.

**Monetisasi ditunda.** Fase ini semua template gratis. Designer mendapat
profil publik, atribusi di setiap situs yang memakai templatenya, badge, dan
statistik. Kompensasi uang dirancang setelah supply dan demand terbukti —
membangun payout, pajak, dan penyelesaian sengketa sebelum ada yang memakai
adalah pekerjaan mahal untuk masalah yang belum ada.

Yang **harus** disiapkan sekarang meski monetisasi ditunda: kolom `designer_id`
di setiap template, pencatatan `install_count` dan situs aktif per versi, dan
persetujuan lisensi saat submit. Tanpa tiga ini, monetisasi nanti butuh
migrasi data yang menyakitkan.

---

## 8. Alur admin

**8.1 — Gate otomatis (sebelum manusia).**
Menjalankan pemeriksaan yang bisa dijalankan mesin, sehingga admin hanya
melihat kandidat yang layak:

- Kontras WCAG AA untuk setiap pasangan token warna yang dipakai.
- Tidak ada overflow horizontal pada 360px, di keempat set data preview.
- Section wajib ada (hero-family + contact).
- Metadata lengkap: nama, deskripsi, kategori, thumbnail.
- Layout JSON valid terhadap schema kit dan versi kit saat ini.
- Bukan duplikat mendekati template terbit lain (bandingkan struktur + token).

**8.2 — Antrean review manusia.**
Yang dinilai admin hanya yang tidak bisa dinilai mesin: apakah ini terlihat
bagus, apakah namanya jujur, apakah kategorinya benar. Review dilakukan di
kanvas yang sama dengan yang dipakai designer, dengan empat set data preview.
Keputusan: terbitkan / minta revisi (dengan catatan) / tolak.

**8.3 — Operasi katalog.**
Feature dan unfeature. Unlist (hilang dari galeri, situs live tetap jalan
karena terkunci versi). Takedown untuk pelanggaran, dengan pemberitahuan ke
pemilik situs terdampak dan jalur migrasi ke template lain.

**8.4 — Operasi designer.**
Verifikasi, peringatan, suspend. Riwayat submission per designer.

**8.5 — Metrik yang admin butuhkan.**
Konversi galeri → pilih → publish per template. Waktu antrean review. Rasio
lolos gate. Template dengan situs aktif terbanyak.

Yang **dihapus** dari peran admin: review kode, merge, edit `types.ts`, deploy.

---

## 9. Skema database

```sql
-- Katalog template
create table templates (
  id uuid primary key,
  slug text unique not null,
  designer_id uuid not null references auth.users(id),
  name text not null,
  description text,
  category text not null,
  tags text[] not null default '{}',
  status text not null default 'draft',
    -- draft | in_review | published | rejected | unlisted | takedown
  current_version_id uuid,
  install_count int not null default 0,
  view_count int not null default 0,
  featured_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Versi template. Yang di-render selalu versi, bukan template.
create table template_versions (
  id uuid primary key,
  template_id uuid not null references templates(id) on delete cascade,
  version int not null,
  layout_json jsonb not null,
  kit_version int not null,
  thumbnail_url text,
  changelog text,
  status text not null default 'draft',
    -- draft | gate_failed | in_review | approved | rejected
  gate_report jsonb,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  unique (template_id, version)
);

-- Situs terkunci ke versi. P4.
alter table sites
  add column template_ref_id uuid references templates(id),
  add column template_version_id uuid references template_versions(id);
```

RLS: designer membaca dan menulis miliknya sendiri saat `status` masih
`draft`; publik membaca `templates` yang `published` dan versi yang `approved`;
field milik review hanya bisa disentuh service role atau admin. Pola trigger
proteksi field yang sudah ada di
`20260811000008_designer_submissions.sql` dipakai ulang, tidak ditulis ulang.

`template_submissions` dari v1 dipensiunkan setelah data draft yang ada
dipindahkan. Bucket `template-submissions` dan seluruh jalur upload ZIP
dihapus — tidak ada lagi artefak tak terpercaya di sistem.

---

## 10. Fase

Urutan ini dipilih supaya nilai untuk **user yang membayar** datang lebih dulu.
Designer Studio adalah bagian termahal dan pada hari pertama punya nol
pengguna berbayar, jadi ia tidak boleh memblokir Fase 1–3.

**Fase 1 — Model konten kanonik.**
Satu schema, migrasi `portfolio_data`, form user jadi proyeksi schema.
*Selesai kalau:* user berpindah antara dua template dengan bentuk data paling
berbeda (`corporate` ↔ `minimal`) dan tidak ada field yang hilang, dibuktikan
dengan tes.

**Fase 2 — Section kit + SectionRenderer, port 8 template.**
`src/sections/` dibuat, `src/templates/definitions/` dihapus, 8 template jadi
8 baris `template_versions` hasil seed.
*Selesai kalau:* 8 situs seed render identik dengan sebelum port
(perbandingan visual), dan `definitions/` sudah tidak ada.

**Fase 3 — Galeri dengan data user sendiri + onboarding 5 field.**
Perbaikan konversi terbesar, dan hampir gratis setelah Fase 1–2.
*Selesai kalau:* galeri merender data user nyata dan waktu dari signup ke
preview pertama turun di bawah dua menit.

**Fase 4 — Designer Studio (kanvas).**
Layers, kanvas, inspector, token, preview data ekstrem, draft dan submit.

**Fase 5 — Gate otomatis + konsol admin.**
Antrean review, operasi katalog, metrik.

**Fase 6 — Profil publik designer + statistik.**

**Ditunda ke setelah v2:** monetisasi designer, revenue share, payout.

---

## 11. Di luar cakupan v2

- Payout, revenue share, penjualan template.
- Kode atau CSS kustom dari designer.
- Penempatan elemen bebas ala kanvas vektor.
- Kolaborasi realtime di Studio.
- Blog/CMS, multi-halaman.
- Kolaborator per workspace.

---

## 12. Risiko

| Risiko | Mitigasi |
|--------|----------|
| Port 8 template kehilangan nuansa visual | Perbandingan visual per template sebagai gate Fase 2. Kalau satu varian tidak bisa direproduksi, tambahkan varian ke kit — bukan pertahankan jalur kode kedua. |
| Kit terasa sempit, designer bosan | Varian dan token dibuat luas sejak awal; jalur permintaan `kind` baru dari designer dibuka dan diumumkan. |
| Template gratis, supply designer lemah | Terima ini di v2. Rekrut 5–10 designer awal secara manual dengan atribusi dan sorotan. Monetisasi ketika demand terbukti. |
| Studio kanvas menghabiskan waktu, user berbayar tidak dapat apa-apa | Fase 1–3 rilis lebih dulu dan berdiri sendiri. Studio boleh telat tanpa memblokir siapa pun. |
| Situs live rusak saat designer update | P4: `sites` terkunci ke `template_version_id`. Upgrade selalu tindakan sadar pemilik situs. |
