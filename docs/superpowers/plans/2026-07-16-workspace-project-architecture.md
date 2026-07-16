# Workspace Project Architecture — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans

**Goal:** Migrate dari single PortfolioData schema ke Workspace Profile → TemplateDefinition (Zod) → WebsiteDocument → Renderer, dengan projects many:1 workspace.

**Architecture:** Incremental (Opsi B) — tambah tabel/kode baru tanpa hapus yang lama, verifikasi per fase, cleanup di akhir.

**Tech Stack:** Next.js App Router, TypeScript, Zod, Supabase (PostgreSQL + RLS), Tailwind

## Global Constraints
- `npm run lint && npx tsc --noEmit` harus clean setelah setiap task
- Tidak ada breaking change sampai Fase 4
- Tidak ada dependency baru selain Zod (sudah ada di package.json)
- Semua tabel baru harus punya RLS sebelum dicommit

---

## Task 1: DB Migration — workspace_profile + workspace_assets

**Files:**
- Create: `supabase/migrations/20260716000001_add_workspace_profile.sql`
- Create: `supabase/migrations/20260716000002_add_workspace_assets.sql`

**Produces:** Tabel `workspace_profile` dan `workspace_assets` dengan RLS

- [ ] **Step 1: Buat migration workspace_profile**

```sql
-- supabase/migrations/20260716000001_add_workspace_profile.sql
-- WorkspaceProfile: data induk bisnis per workspace (1:1).
-- Kolom terstruktur untuk data yang perlu di-query/filter;
-- JSONB extended_data untuk field yang tidak perlu di-index.

create table if not exists public.workspace_profile (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  name         text,
  logo_url     text,
  email        text,
  phone        text,
  address      text,
  website_url  text,
  extended_data jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

alter table public.workspace_profile enable row level security;

create policy "workspace_profile_owner_all" on public.workspace_profile
  for all
  using (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ));

-- Anon bisa baca profile milik workspace yang punya published project
create policy "workspace_profile_public_read" on public.workspace_profile
  for select to anon
  using (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id
      and exists (
        select 1 from public.sites s
        where s.workspace_id = w.id and s.status = 'published'
      )
  ));
```

- [ ] **Step 2: Buat migration workspace_assets**

```sql
-- supabase/migrations/20260716000002_add_workspace_assets.sql
-- Asset library per workspace. UI asset manager = Fase 2+.
-- ponytail: tabel ada untuk URL terstruktur, UI-nya nanti.

create table if not exists public.workspace_assets (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name         text not null,
  url          text not null,
  mime_type    text,
  size_bytes   bigint,
  created_at   timestamptz not null default now()
);

create index if not exists workspace_assets_workspace_id_idx
  on public.workspace_assets(workspace_id);

alter table public.workspace_assets enable row level security;

create policy "workspace_assets_owner_all" on public.workspace_assets
  for all
  using (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ));
```

- [ ] **Step 3: Verify lint + tsc clean**

```bash
npm run lint && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260716000001_add_workspace_profile.sql \
        supabase/migrations/20260716000002_add_workspace_assets.sql
git commit -m "feat(db): add workspace_profile and workspace_assets tables with RLS"
```

---

## Task 2: DB Migration — projects table

**Files:**
- Create: `supabase/migrations/20260716000003_add_projects.sql`

**Produces:** Tabel `projects` (many:1 workspace) dengan draft_json + published_json + RLS

- [ ] **Step 1: Buat migration**

```sql
-- supabase/migrations/20260716000003_add_projects.sql
-- projects: banyak website per workspace. Menggantikan sites (yang 1:1).
-- Tabel sites TIDAK dihapus di sini — cleanup di Fase 4.

create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  name             text not null,
  template_id      text not null,
  template_version integer not null default 1,
  draft_json       jsonb not null default '{}'::jsonb,
  published_json   jsonb,
  subdomain        text unique,
  status           text not null default 'draft'
                   check (status in ('draft', 'published')),
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Constraint: published project harus punya subdomain
alter table public.projects
  add constraint projects_published_requires_subdomain
  check (status <> 'published' or subdomain is not null);

create index if not exists projects_workspace_id_idx on public.projects(workspace_id);
create index if not exists projects_subdomain_idx on public.projects(subdomain)
  where subdomain is not null;

alter table public.projects enable row level security;

-- Owner: full access
create policy "projects_owner_all" on public.projects
  for all
  using (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.user_id = auth.uid()
  ));

-- Anon: hanya project yang published (untuk subdomain renderer)
create policy "projects_public_read_published" on public.projects
  for select to anon
  using (status = 'published');
```

- [ ] **Step 2: Verify**

```bash
npm run lint && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260716000003_add_projects.sql
git commit -m "feat(db): add projects table (many:1 workspace) with draft/published JSON and RLS"
```

---

## Task 3: TemplateDefinition Interface + WorkspaceProfile Type

**Files:**
- Create: `src/lib/templates/definition.ts`
- Modify: `src/lib/templates/types.ts` (tambah WorkspaceProfile, jangan hapus PortfolioData dulu)

**Produces:** `TemplateDefinition<TSchema>` interface, `WorkspaceProfile` type, `WebsiteDocument` type, `runMigrations()` helper

- [ ] **Step 1: Buat definition.ts**

```typescript
// src/lib/templates/definition.ts
import { z } from "zod";
import type React from "react";

// WorkspaceProfile — data induk bisnis dari workspace_profile table
export interface WorkspaceProfile {
  workspaceId: string;
  name: string | null;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  websiteUrl: string | null;
  extendedData: {
    tagline?: string;
    description?: string;
    socials?: { platform: string; url: string }[];
  };
}

// WebsiteDocument — wrapper yang disimpan di draft_json / published_json
export interface WebsiteDocument {
  meta: {
    templateId: string;
    templateVersion: number;
    createdAt: string; // ISO 8601
    updatedAt: string;
    locale: string;    // "id" | "en"
  };
  data: Record<string, unknown>;
}

export interface SectionDef {
  id: string;
  label: string;
  description?: string;
}

export interface MigrationStep {
  from: number;
  to: number;
  migrate: (data: unknown) => unknown;
}

export interface TemplateMeta {
  name: string;
  description: string;
  thumbnailUrl: string;
  category: string;         // "portfolio" | "landing" | "corporate" | "event"
  capabilities: string[];   // ["gallery", "pricing", "testimonials", "blog"]
  tags: string[];
  author: string;           // "portofio" for built-in templates
  price: number;            // 0 = free; >0 reserved for marketplace
}

// TemplateDefinition — Zod schema is the source of truth
export interface TemplateDefinition<TSchema extends z.ZodTypeAny> {
  id: string;
  version: number;
  meta: TemplateMeta;
  sections: SectionDef[];
  schema: TSchema;
  defaults: z.infer<TSchema>;
  migrations: MigrationStep[];
  renderer: React.ComponentType<{
    data: z.infer<TSchema>;
    workspaceProfile: WorkspaceProfile;
  }>;
}

// Run any needed migrations on a WebsiteDocument before rendering
export function runMigrations(
  doc: WebsiteDocument,
  definition: TemplateDefinition<z.ZodTypeAny>,
): WebsiteDocument {
  let { data, meta } = doc;
  const chain = definition.migrations
    .filter((m) => m.from >= meta.templateVersion)
    .sort((a, b) => a.from - b.from);
  for (const m of chain) {
    data = m.migrate(data);
    meta = { ...meta, templateVersion: m.to };
  }
  return { meta, data };
}

// Parse and validate document data against a template's Zod schema.
// Returns defaults merged with data on validation failure (graceful degradation).
export function parseDocumentData<TSchema extends z.ZodTypeAny>(
  doc: WebsiteDocument,
  definition: TemplateDefinition<TSchema>,
): z.infer<TSchema> {
  const migrated = runMigrations(doc, definition);
  const result = definition.schema.safeParse(migrated.data);
  if (result.success) return result.data;
  // ponytail: log in dev, degrade gracefully in prod
  if (process.env.NODE_ENV === "development") {
    console.warn(`[template:${definition.id}] schema validation failed:`, result.error.flatten());
  }
  return definition.defaults;
}

// Build an initial WebsiteDocument for a new project, auto-filling from WorkspaceProfile
export function buildInitialDocument(
  profile: WorkspaceProfile,
  definition: TemplateDefinition<z.ZodTypeAny>,
  locale = "id",
): WebsiteDocument {
  const now = new Date().toISOString();
  // Merge profile fields into defaults where keys overlap
  const profileFields: Record<string, unknown> = {
    profile: {
      fullName: profile.name ?? "",
      email: profile.email ?? "",
      ...(definition.defaults as Record<string, unknown>)?.profile,
    },
    contact: {
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    },
    socials: profile.extendedData.socials ?? [],
  };
  // Deep merge: profileFields override defaults, but only at top level
  const data = { ...(definition.defaults as Record<string, unknown>), ...profileFields };
  return {
    meta: {
      templateId: definition.id,
      templateVersion: definition.version,
      createdAt: now,
      updatedAt: now,
      locale,
    },
    data,
  };
}
```

- [ ] **Step 2: Verify**

```bash
npm run lint && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/templates/definition.ts
git commit -m "feat(templates): add TemplateDefinition interface, WebsiteDocument, WorkspaceProfile types"
```

---

## Task 4: Zod Schemas — 5 Template Schemas

**Files:**
- Create: `src/lib/templates/schemas/minimal.ts`
- Create: `src/lib/templates/schemas/bold.ts`
- Create: `src/lib/templates/schemas/creative.ts`
- Create: `src/lib/templates/schemas/corporate.ts`
- Create: `src/lib/templates/schemas/dark.ts`

**Consumes:** `definition.ts` (TemplateDefinition, WorkspaceProfile)
**Produces:** 5 exported `TemplateDefinition` objects; schema = 1:1 dengan PortfolioData yang ada (no breaking change)

- [ ] **Step 1: Buat shared base schemas**

Buat file `src/lib/templates/schemas/_base.ts`:

```typescript
// src/lib/templates/schemas/_base.ts
// Shared Zod schemas reused across all 5 templates.
// These mirror the current PortfolioData contract exactly (no breaking change).
import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().default(""),
  headline: z.string().default(""),
  bio: z.string().default(""),
  photoUrl: z.string().optional(),
  location: z.string().optional(),
});

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string(), // "YYYY-MM"
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  field: z.string().optional(),
  startYear: z.number(),
  endYear: z.number().optional(),
});

export const projectItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  link: z.string().optional(),
});

export const contactSchema = z.object({
  email: z.string().default(""),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
});

export const socialSchema = z.object({
  platform: z.enum(["linkedin", "github", "instagram", "x", "youtube", "tiktok", "website"]),
  url: z.string(),
});

export const themeSchema = z.object({
  accentColor: z.string().default("#3532E5"),
  font: z.enum(["sans", "serif", "mono", "rounded"]).default("sans"),
});

// Base portfolio schema — all 5 current templates use this
export const basePortfolioSchema = z.object({
  profile: profileSchema,
  experiences: z.array(experienceSchema).default([]),
  educations: z.array(educationSchema).default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(projectItemSchema).default([]),
  contact: contactSchema,
  socials: z.array(socialSchema).default([]),
  theme: themeSchema,
});

export type BasePortfolioData = z.infer<typeof basePortfolioSchema>;

export const BASE_DEFAULTS: BasePortfolioData = {
  profile: { fullName: "", headline: "", bio: "" },
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
  contact: { email: "" },
  socials: [],
  theme: { accentColor: "#3532E5", font: "sans" },
};

export const BASE_SECTIONS = [
  { id: "profile",    label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "education",  label: "Education" },
  { id: "skills",     label: "Skills" },
  { id: "projects",   label: "Projects" },
  { id: "contact",    label: "Contact" },
];
```

- [ ] **Step 2: Buat minimal.ts (placeholder renderer — pakai yang ada)**

```typescript
// src/lib/templates/schemas/minimal.ts
import type { TemplateDefinition } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS } from "./_base";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import type { WorkspaceProfile } from "@/lib/templates/definition";
import type React from "react";

// Adapter: MinimalTemplate currently expects PortfolioData, not the new props.
// ponytail: wrap it so existing renderer works unchanged until template refactor.
const MinimalRenderer: React.ComponentType<{
  data: typeof BASE_DEFAULTS;
  workspaceProfile: WorkspaceProfile;
}> = ({ data }) => {
  // MinimalTemplate uses the old prop shape — pass data directly
  // TODO(template-refactor): update MinimalTemplate to accept new props
  return MinimalTemplate({ data });
};

export const minimalDefinition: TemplateDefinition<typeof basePortfolioSchema> = {
  id: "minimal",
  version: 1,
  meta: {
    name: "Minimal",
    description: "Clean editorial layout. Warm paper tones, serif typography, one column.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "education", "skills", "contact"],
    tags: ["clean", "editorial", "serif", "light"],
    author: "portofio",
    price: 0,
  },
  sections: BASE_SECTIONS,
  schema: basePortfolioSchema,
  defaults: BASE_DEFAULTS,
  migrations: [],
  renderer: MinimalRenderer,
};
```

- [ ] **Step 3: Buat bold.ts**

```typescript
// src/lib/templates/schemas/bold.ts
import type { TemplateDefinition } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS } from "./_base";
import { BoldTemplate } from "@/components/templates/BoldTemplate";
import type { WorkspaceProfile } from "@/lib/templates/definition";
import type React from "react";

const BoldRenderer: React.ComponentType<{
  data: typeof BASE_DEFAULTS;
  workspaceProfile: WorkspaceProfile;
}> = ({ data }) => BoldTemplate({ data });

export const boldDefinition: TemplateDefinition<typeof basePortfolioSchema> = {
  id: "bold",
  version: 1,
  meta: {
    name: "Bold",
    description: "Strong accent colors, large headings. Built for creatives and marketers.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "skills", "contact"],
    tags: ["bold", "colorful", "creative", "marketing"],
    author: "portofio",
    price: 0,
  },
  sections: BASE_SECTIONS,
  schema: basePortfolioSchema,
  defaults: BASE_DEFAULTS,
  migrations: [],
  renderer: BoldRenderer,
};
```

- [ ] **Step 4: Buat creative.ts**

```typescript
// src/lib/templates/schemas/creative.ts
import type { TemplateDefinition } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS } from "./_base";
import { CreativeTemplate } from "@/components/templates/CreativeTemplate";
import type { WorkspaceProfile } from "@/lib/templates/definition";
import type React from "react";

const CreativeRenderer: React.ComponentType<{
  data: typeof BASE_DEFAULTS;
  workspaceProfile: WorkspaceProfile;
}> = ({ data }) => CreativeTemplate({ data });

export const creativeDefinition: TemplateDefinition<typeof basePortfolioSchema> = {
  id: "creative",
  version: 1,
  meta: {
    name: "Creative",
    description: "Project grid front and center. Ideal for designers and photographers.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "skills", "contact"],
    tags: ["grid", "visual", "design", "photography"],
    author: "portofio",
    price: 0,
  },
  sections: BASE_SECTIONS,
  schema: basePortfolioSchema,
  defaults: BASE_DEFAULTS,
  migrations: [],
  renderer: CreativeRenderer,
};
```

- [ ] **Step 5: Buat corporate.ts**

```typescript
// src/lib/templates/schemas/corporate.ts
import type { TemplateDefinition } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS } from "./_base";
import { CorporateTemplate } from "@/components/templates/CorporateTemplate";
import type { WorkspaceProfile } from "@/lib/templates/definition";
import type React from "react";

const CorporateRenderer: React.ComponentType<{
  data: typeof BASE_DEFAULTS;
  workspaceProfile: WorkspaceProfile;
}> = ({ data }) => CorporateTemplate({ data });

export const corporateDefinition: TemplateDefinition<typeof basePortfolioSchema> = {
  id: "corporate",
  version: 1,
  meta: {
    name: "Corporate",
    description: "Structured and formal, experience timeline prominent. For job seekers.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "education", "skills", "contact"],
    tags: ["formal", "timeline", "job-seeker", "professional"],
    author: "portofio",
    price: 0,
  },
  sections: BASE_SECTIONS,
  schema: basePortfolioSchema,
  defaults: BASE_DEFAULTS,
  migrations: [],
  renderer: CorporateRenderer,
};
```

- [ ] **Step 6: Buat dark.ts**

```typescript
// src/lib/templates/schemas/dark.ts
import type { TemplateDefinition } from "@/lib/templates/definition";
import { basePortfolioSchema, BASE_DEFAULTS, BASE_SECTIONS } from "./_base";
import { DarkTemplate } from "@/components/templates/DarkTemplate";
import type { WorkspaceProfile } from "@/lib/templates/definition";
import type React from "react";

const DarkRenderer: React.ComponentType<{
  data: typeof BASE_DEFAULTS;
  workspaceProfile: WorkspaceProfile;
}> = ({ data }) => DarkTemplate({ data });

export const darkDefinition: TemplateDefinition<typeof basePortfolioSchema> = {
  id: "dark",
  version: 1,
  meta: {
    name: "Dark",
    description: "Dark theme with neon accents. Built for developers and tech professionals.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "experience", "skills", "contact"],
    tags: ["dark", "neon", "developer", "tech"],
    author: "portofio",
    price: 0,
  },
  sections: BASE_SECTIONS,
  schema: basePortfolioSchema,
  defaults: BASE_DEFAULTS,
  migrations: [],
  renderer: DarkRenderer,
};
```

- [ ] **Step 7: Verify**

```bash
npm run lint && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add src/lib/templates/schemas/
git commit -m "feat(templates): add Zod schemas and TemplateDefinition for all 5 templates"
```

---

## Task 5: Template Registry — Gunakan TemplateDefinition Baru

**Files:**
- Modify: `src/lib/templates/registry.tsx` → `src/lib/templates/registry.ts` (hapus JSX)
- Create: `src/lib/templates/registry.tsx` (komponen TemplateRenderer baru)

**Consumes:** 5 TemplateDefinition dari Task 4
**Produces:** `TEMPLATE_REGISTRY`, `getDefinition()`, `TemplateRenderer` komponen generik

- [ ] **Step 1: Update registry.tsx**

```typescript
// src/lib/templates/registry.tsx
import type { z } from "zod";
import type { TemplateDefinition, WorkspaceProfile, WebsiteDocument } from "@/lib/templates/definition";
import { parseDocumentData } from "@/lib/templates/definition";
import { minimalDefinition } from "@/lib/templates/schemas/minimal";
import { boldDefinition } from "@/lib/templates/schemas/bold";
import { creativeDefinition } from "@/lib/templates/schemas/creative";
import { corporateDefinition } from "@/lib/templates/schemas/corporate";
import { darkDefinition } from "@/lib/templates/schemas/dark";

// ponytail: using Record<string, ...> so marketplace templates can be added at runtime
export const TEMPLATE_REGISTRY: Record<string, TemplateDefinition<z.ZodTypeAny>> = {
  minimal: minimalDefinition,
  bold: boldDefinition,
  creative: creativeDefinition,
  corporate: corporateDefinition,
  dark: darkDefinition,
};

export function getDefinition(templateId: string): TemplateDefinition<z.ZodTypeAny> | null {
  return TEMPLATE_REGISTRY[templateId] ?? null;
}

// Backward-compatible IDs list (other code may still reference TEMPLATE_IDS)
export const TEMPLATE_IDS = Object.keys(TEMPLATE_REGISTRY) as [string, ...string[]];

export function TemplateRenderer({
  templateId,
  document,
  workspaceProfile,
}: {
  templateId: string;
  document: WebsiteDocument;
  workspaceProfile: WorkspaceProfile;
}) {
  const definition = getDefinition(templateId);
  if (!definition) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-gray-500">
        Template &quot;{templateId}&quot; not found.
      </div>
    );
  }
  const data = parseDocumentData(document, definition);
  const Renderer = definition.renderer;
  return <Renderer data={data} workspaceProfile={workspaceProfile} />;
}
```

- [ ] **Step 2: Verify**

```bash
npm run lint && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/templates/registry.tsx
git commit -m "feat(templates): update registry to use TemplateDefinition, add getDefinition()"
```

---

## Task 6: Projects Store + WorkspaceProfile Store

**Files:**
- Create: `src/lib/projects/types.ts`
- Create: `src/lib/projects/store.ts`
- Create: `src/lib/projects/actions.ts`
- Create: `src/lib/workspace/profile.ts`

**Consumes:** `definition.ts` types, Supabase client
**Produces:** CRUD untuk `projects`, getter/setter untuk `workspace_profile`

- [ ] **Step 1: Buat src/lib/projects/types.ts**

```typescript
// src/lib/projects/types.ts
import type { WebsiteDocument } from "@/lib/templates/definition";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  templateId: string;
  templateVersion: number;
  draftJson: WebsiteDocument;
  publishedJson: WebsiteDocument | null;
  subdomain: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectSummary = Pick<
  Project,
  "id" | "name" | "templateId" | "status" | "subdomain" | "updatedAt"
>;
```

- [ ] **Step 2: Buat src/lib/projects/store.ts**

```typescript
// src/lib/projects/store.ts
import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectSummary } from "./types";
import type { WebsiteDocument } from "@/lib/templates/definition";

function mapRow(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    name: row.name as string,
    templateId: row.template_id as string,
    templateVersion: row.template_version as number,
    draftJson: row.draft_json as WebsiteDocument,
    publishedJson: (row.published_json as WebsiteDocument | null) ?? null,
    subdomain: (row.subdomain as string | null) ?? null,
    status: row.status as "draft" | "published",
    publishedAt: (row.published_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listProjects(workspaceId: string): Promise<ProjectSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, template_id, status, subdomain, updated_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    templateId: r.template_id,
    status: r.status,
    subdomain: r.subdomain,
    updatedAt: r.updated_at,
  }));
}

export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function createProject(
  workspaceId: string,
  name: string,
  templateId: string,
  initialDocument: WebsiteDocument,
): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name,
      template_id: templateId,
      template_version: initialDocument.meta.templateVersion,
      draft_json: initialDocument,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

export async function saveDraftJson(
  projectId: string,
  draftJson: WebsiteDocument,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      draft_json: draftJson,
      template_version: draftJson.meta.templateVersion,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);
  return !error;
}

export async function publishProject(
  projectId: string,
  subdomain: string,
): Promise<boolean> {
  const supabase = await createClient();
  // Copy draft_json to published_json atomically
  const { error } = await supabase.rpc("publish_project", {
    p_project_id: projectId,
    p_subdomain: subdomain,
  });
  return !error;
}
```

- [ ] **Step 3: Buat src/lib/projects/actions.ts**

```typescript
// src/lib/projects/actions.ts
"use server";

import { createProject, saveDraftJson } from "./store";
import { buildInitialDocument, type WebsiteDocument } from "@/lib/templates/definition";
import { getDefinition } from "@/lib/templates/registry";
import { getWorkspaceProfile } from "@/lib/workspace/profile";

export async function createProjectAction(
  workspaceId: string,
  name: string,
  templateId: string,
  locale = "id",
): Promise<{ ok: boolean; projectId?: string; error?: string }> {
  const definition = getDefinition(templateId);
  if (!definition) return { ok: false, error: "Template not found" };

  const profile = await getWorkspaceProfile(workspaceId);
  const initialDoc = buildInitialDocument(profile, definition, locale);

  const project = await createProject(workspaceId, name, templateId, initialDoc);
  if (!project) return { ok: false, error: "Failed to create project" };
  return { ok: true, projectId: project.id };
}

export async function saveDraftAction(
  projectId: string,
  draftJson: WebsiteDocument,
): Promise<{ ok: boolean }> {
  const ok = await saveDraftJson(projectId, draftJson);
  return { ok };
}
```

- [ ] **Step 4: Buat src/lib/workspace/profile.ts**

```typescript
// src/lib/workspace/profile.ts
import { createClient } from "@/lib/supabase/server";
import type { WorkspaceProfile } from "@/lib/templates/definition";

const EMPTY_PROFILE: Omit<WorkspaceProfile, "workspaceId"> = {
  name: null,
  logoUrl: null,
  email: null,
  phone: null,
  address: null,
  websiteUrl: null,
  extendedData: {},
};

export async function getWorkspaceProfile(workspaceId: string): Promise<WorkspaceProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_profile")
    .select("*")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !data) return { workspaceId, ...EMPTY_PROFILE };
  return {
    workspaceId,
    name: data.name ?? null,
    logoUrl: data.logo_url ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    address: data.address ?? null,
    websiteUrl: data.website_url ?? null,
    extendedData: (data.extended_data as WorkspaceProfile["extendedData"]) ?? {},
  };
}

export async function saveWorkspaceProfile(
  workspaceId: string,
  profile: Partial<Omit<WorkspaceProfile, "workspaceId">>,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("workspace_profile").upsert({
    workspace_id: workspaceId,
    name: profile.name ?? null,
    logo_url: profile.logoUrl ?? null,
    email: profile.email ?? null,
    phone: profile.phone ?? null,
    address: profile.address ?? null,
    website_url: profile.websiteUrl ?? null,
    extended_data: profile.extendedData ?? {},
    updated_at: new Date().toISOString(),
  });
  return !error;
}
```

- [ ] **Step 5: Verify**

```bash
npm run lint && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/lib/projects/ src/lib/workspace/profile.ts
git commit -m "feat(projects): add projects store, actions, workspace profile store with auto-fill"
```

---

## Task 7: DB Function — publish_project RPC

**Files:**
- Create: `supabase/migrations/20260716000004_publish_project_rpc.sql`

**Produces:** Atomic `publish_project(p_project_id, p_subdomain)` Postgres function

- [ ] **Step 1: Buat migration**

```sql
-- supabase/migrations/20260716000004_publish_project_rpc.sql
-- Atomic publish: copy draft_json → published_json, set subdomain + status.
-- Runs as SECURITY DEFINER so it can bypass RLS check on subdomain uniqueness
-- while still enforcing ownership via the explicit user_id check.

create or replace function public.publish_project(
  p_project_id uuid,
  p_subdomain   text
) returns void
language plpgsql
security definer
as $$
declare
  v_workspace_id uuid;
begin
  -- Verify caller owns this project
  select workspace_id into v_workspace_id
  from public.projects
  where id = p_project_id;

  if not exists (
    select 1 from public.workspaces
    where id = v_workspace_id and user_id = auth.uid()
  ) then
    raise exception 'not authorized';
  end if;

  update public.projects
  set
    published_json = draft_json,
    subdomain      = p_subdomain,
    status         = 'published',
    published_at   = now(),
    updated_at     = now()
  where id = p_project_id;
end;
$$;
```

- [ ] **Step 2: Verify + commit**

```bash
git add supabase/migrations/20260716000004_publish_project_rpc.sql
git commit -m "feat(db): add publish_project RPC function (atomic draft → published copy)"
```

---

## Task 8: Verification — Full Lint + Type Check + Apply Migrations

- [ ] **Step 1: Run full check**

```bash
npm run lint && npx tsc --noEmit
```

Expected: no errors, no warnings

- [ ] **Step 2: Apply migrations (jika Supabase sudah terkoneksi)**

```bash
npx supabase db push
```

Jika belum terkoneksi, catat bahwa migrations sudah ditulis dan siap di-push.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: workspace profile + projects architecture (Fase 1-2 complete, incremental migration)"
```

- [ ] **Step 4: Update claude-progress.md dan feature_list.json**

Catat: Fase 1 (DB) dan Fase 2 (TemplateDefinition + Schemas + Registry) selesai. Fase 3 (Projects store + Editor) dalam progress. Fase 4 (cleanup portfolio_data) belum.
