# Design Spec: Workspace Profile → Template Schema → Website JSON → Renderer

**Tanggal:** 2026-07-16
**Status:** Approved
**PRD:** v1.4
**Ponytail:** full

---

## Latar Belakang

Arsitektur saat ini: satu `PortfolioData` global untuk semua template, satu `sites` row per workspace.

Masalah:
- Template tidak bisa punya field/section unik
- Satu workspace = satu website (tidak bisa multi-project)
- Tidak ada pemisahan data induk bisnis vs konten website

---

## Model Konseptual

```
User
  └── Workspace (identitas bisnis/brand)
        ├── workspace_profile    ← data induk: nama, logo, email, socials
        ├── workspace_assets     ← library file
        └── projects[]           ← banyak website
              ├── Project: "Company Profile"   (template: corporate)
              ├── Project: "Landing Page A"    (template: bold)
              └── Project: "Event Website"     (template: minimal)
```

---

## Komponen 1 — WorkspaceProfile

Tabel `workspace_profile` (1:1 dengan `workspaces`).

Kolom terstruktur (query-able):
- `name`, `logo_url`, `email`, `phone`, `address`, `website_url`

JSONB `extended_data` (tidak perlu di-query langsung):
- `socials[]`, `tagline`, `description`

Auto-fill: saat project baru dibuat, data ini dipetakan ke field yang relevan di WebsiteJSON.

---

## Komponen 2 — WorkspaceAssets

Tabel `workspace_assets`:
- `id`, `workspace_id`, `name`, `url`, `mime_type`, `size_bytes`, `created_at`

ponytail: UI asset manager tidak dibangun di MVP. Tabel ada untuk URL terstruktur.

---

## Komponen 3 — TemplateDefinition (Zod sebagai Source of Truth)

```typescript
interface TemplateDefinition<TSchema extends z.ZodTypeAny> {
  id: string;        // "minimal", "bold", dll.
  version: number;   // integer >= 1

  meta: {
    name: string;
    description: string;
    thumbnailUrl: string;
    category: string;           // "portfolio" | "landing" | "corporate" | "event"
    capabilities: string[];     // ["gallery", "pricing", "testimonials", "blog"]
    tags: string[];
    author: string;             // "portofio" untuk built-in
    price: number;              // 0 = free, > 0 = marketplace kelak
  };

  // Ponytail: bukan DSL penuh. Hanya label untuk sidebar form editor.
  sections: { id: string; label: string; description?: string }[];

  schema: TSchema;                  // SOURCE OF TRUTH
  defaults: z.infer<TSchema>;       // validated by schema

  migrations: {
    from: number;
    to: number;
    migrate: (data: unknown) => unknown;
  }[];

  renderer: React.ComponentType<{
    data: z.infer<TSchema>;
    workspaceProfile: WorkspaceProfile;
  }>;
}
```

---

## Komponen 4 — WebsiteDocument (Document Wrapper)

Format yang disimpan di `draft_json` dan `published_json`:

```typescript
interface WebsiteDocument {
  meta: {
    templateId: string;
    templateVersion: number;
    createdAt: string;   // ISO 8601
    updatedAt: string;
    locale: string;      // "id" | "en"
  };
  data: Record<string, unknown>;  // divalidasi oleh template.schema saat dibaca
}
```

---

## Komponen 5 — Projects Table

Menggantikan `sites` (1:1 workspace → many:1 workspace).

```sql
projects {
  id             uuid PK default gen_random_uuid()
  workspace_id   uuid FK → workspaces(id) ON DELETE CASCADE
  name           text NOT NULL
  template_id    text NOT NULL
  template_version int NOT NULL DEFAULT 1
  draft_json     jsonb NOT NULL DEFAULT '{}'
  published_json jsonb           -- null sampai publish pertama
  subdomain      text UNIQUE     -- null sampai publish
  status         text NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'published'))
  published_at   timestamptz
  created_at     timestamptz NOT NULL DEFAULT now()
  updated_at     timestamptz NOT NULL DEFAULT now()
}
```

Semantik:
- Edit → update `draft_json` + `updated_at`
- Publish → `published_json = draft_json`, `status = 'published'`, `published_at = now()`
- Public renderer membaca `published_json`
- User bisa terus edit `draft_json` tanpa merusak live site

---

## Komponen 6 — Versioned Migration Pipeline

```typescript
function runMigrations(
  doc: WebsiteDocument,
  definition: TemplateDefinition<z.ZodTypeAny>
): WebsiteDocument {
  let { data, meta } = doc;
  const chain = definition.migrations
    .filter(m => m.from >= meta.templateVersion)
    .sort((a, b) => a.from - b.from);
  for (const m of chain) {
    data = m.migrate(data);
    meta = { ...meta, templateVersion: m.to };
  }
  return { meta, data };
}
```

Dipanggil saat `getProjectDocument()` mendeteksi `meta.templateVersion < definition.version`.

---

## Strategi Migrasi (Incremental — Opsi B)

### Fase 1 — DB Additive
- Tambah: `workspace_profile`, `workspace_assets`, `projects`
- Tetap: `portfolio_data`, `sites` (belum disentuh)

### Fase 2 — Code: TemplateDefinition + Zod Schemas
- Buat `src/lib/templates/definition.ts`
- Buat `src/lib/templates/schemas/*.ts` (5 template)
- Zod schema awal = padanan PortfolioData yang ada (tidak ada breaking change)
- Update registry

### Fase 3 — Code: Projects Store + Auto-fill + Editor
- Buat `src/lib/projects/` (store, actions, types)
- Buat `src/lib/workspace/profile.ts`
- Auto-fill: `buildInitialDocument(profile, templateDef)` → `WebsiteDocument`
- Update Editor: baca/tulis `draft_json` dari `projects`

### Fase 4 — Cleanup
- Drop `portfolio_data`, `sites`
- Hapus `src/lib/portfolio/`
- Hapus `PortfolioData` type

---

## File Map

### New
```
src/lib/templates/definition.ts
src/lib/templates/schemas/minimal.ts
src/lib/templates/schemas/bold.ts
src/lib/templates/schemas/creative.ts
src/lib/templates/schemas/corporate.ts
src/lib/templates/schemas/dark.ts
src/lib/projects/types.ts
src/lib/projects/store.ts
src/lib/projects/actions.ts
src/lib/workspace/profile.ts
src/lib/workspace/assets.ts
supabase/migrations/20260716000001_add_workspace_profile.sql
supabase/migrations/20260716000002_add_workspace_assets.sql
supabase/migrations/20260716000003_add_projects.sql
```

### Modified
```
src/lib/templates/types.ts       (tambah WorkspaceProfile type)
src/lib/templates/registry.tsx   (gunakan TemplateDefinition)
src/components/templates/*.tsx   (terima WebsiteDocument bukan PortfolioData)
src/components/templates/shared.tsx
src/components/dashboard/Editor.tsx
```

### Deleted (Fase 4)
```
src/lib/portfolio/types.ts
src/lib/portfolio/store.ts
src/lib/portfolio/actions.ts
src/lib/portfolio/compressImage.ts
```

---

## Verification Per Fase

Setiap fase: `npm run lint && npx tsc --noEmit` harus clean sebelum lanjut.
