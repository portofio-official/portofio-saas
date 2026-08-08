// ─── Template Scaffold ──────────────────────────────────────────────────────
// Salin folder ini menjadi: src/templates/definitions/<template-id>/
// Lalu implementasi setiap bagian di bawah, dan daftarkan di
// src/templates/registry.tsx (2 baris).
// Lihat docs/TEMPLATE_AUTHORING.md untuk panduan lengkap.

import { z } from "zod";
import type { TemplateDefinition, TemplateVariant } from "@/templates/definition";

// 1. SCHEMA — Zod schema adalah kontrak data template (single source of truth).
export const TEMPLATE_SCHEMA = z.object({
  profile: z.object({
    fullName: z.string(),
    headline: z.string(),
    bio: z.string(),
    photoUrl: z.string(),
  }),
  projects: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      url: z.string().optional(),
    }),
  ),
  // Tambahkan section lain sesuai kebutuhan.
});

export type TemplateData = z.infer<typeof TEMPLATE_SCHEMA>;

// 2. VARIANTS — skema warna bawaan template (Default, dst).
export const TEMPLATE_VARIANTS: TemplateVariant[] = [
  {
    id: "default",
    label: "Default",
    colors: {
      primary: "#00cf7c",
      background: "#ffffff",
      surface: "#f7f7f7",
      text: "#111111",
      textMuted: "#666666",
      border: "#e5e5e5",
    },
  },
];

// 3. DEFAULTS — data awal saat project baru dibuat.
export const TEMPLATE_DEFAULTS: TemplateData = {
  profile: { fullName: "", headline: "", bio: "", photoUrl: "" },
  projects: [],
};

// 4. MIGRATIONS — daftar migrasi data dari version lama ke baru.
export const templateMigrations = [];

// 5. MAPPER — mengisi data template dari UserProfile/WorkspaceProfile.
export function mapProfileToTemplate(): TemplateData {
  return { ...TEMPLATE_DEFAULTS };
}

// 6. RENDERER — komponen React untuk merender data.
export function TemplateRenderer({ data }: { data: TemplateData }) {
  return (
    <div>
      <h1>{data.profile.fullName}</h1>
      <p>{data.profile.headline}</p>
      {data.projects.map((p) => (
        <div key={p.title}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
        </div>
      ))}
    </div>
  );
}

// 7. DEFINITION — satukan semuanya. meta.gallery Wajib diisi (dipakai galeri).
export const templateDefinition: TemplateDefinition<typeof TEMPLATE_SCHEMA> = {
  id: "template-id", // ← ganti jadi id template (huruf kecil, kebab-case)
  version: 1,
  meta: {
    name: "Template Name",
    description: "Short marketing description shown in the gallery.",
    thumbnailUrl: "",
    category: "portfolio",
    capabilities: ["projects", "skills", "contact"],
    tags: ["clean", "modern"],
    author: "portofio",
    price: 0,
    gallery: {
      accentBg: "bg-[#f9f6f1]",
      categories: ["Personal"],
      popular: false,
    },
  },
  variants: TEMPLATE_VARIANTS,
  sections: [],
  schema: TEMPLATE_SCHEMA,
  defaults: TEMPLATE_DEFAULTS,
  migrations: templateMigrations,
  mapper: mapProfileToTemplate,
  renderer: TemplateRenderer,
};
