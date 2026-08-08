import { z } from "zod";
import type React from "react";
import type { UserProfile } from "@/lib/profile/types";

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

// WebsiteDocument — wrapper disimpan di draft_json / published_json
export interface WebsiteDocument {
  meta: {
    templateId: string;
    templateVersion: number;
    createdAt: string; // ISO 8601
    updatedAt: string;
    locale: string;    // "id" | "en"
    seo?: {
      title?: string;
      description?: string;
      ogImage?: string;
    };
  };
  data: Record<string, unknown>;
}

export interface SectionDef {
  id: string;
  label: string;
  description?: string;
}

export interface TemplateVariant {
  id: string;
  label: string;
  colors: {
    primary: string;
    secondary?: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    [key: string]: string | undefined;
  };
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
  /**
   * Gallery card metadata (single source of truth — consumed by
   * TemplateGallery + TemplateShowcase; no separate per-file lists allowed).
   * "All" is prepended automatically, do NOT include it here.
   */
  gallery?: {
    accentBg: string;       // Tailwind class for the card thumbnail background
    categories: string[];   // e.g. ["Personal"] / ["Professional", "Portfolio"]
    popular?: boolean;      // shows the "Populer" badge
  };
}

// TemplateDefinition — Zod schema is the single source of truth
export interface TemplateDefinition<TSchema extends z.ZodTypeAny> {
  id: string;
  version: number;
  meta: TemplateMeta;
  variants: TemplateVariant[];
  sections: SectionDef[];
  schema: TSchema;
  defaults: z.infer<TSchema>;
  migrations: MigrationStep[];
  renderer: React.ComponentType<{
    data: z.infer<TSchema>;
    workspaceProfile?: WorkspaceProfile;
  }>;
  mapper?: (profile: WorkspaceProfile) => z.infer<TSchema>;
}

// Run any needed migrations on a WebsiteDocument before rendering/editing
export function runMigrations(
  doc: WebsiteDocument,
  definition: TemplateDefinition<z.ZodTypeAny>,
): WebsiteDocument {
  let { data, meta } = doc;
  const chain = definition.migrations
    .filter((m) => m.from >= meta.templateVersion)
    .sort((a, b) => a.from - b.from);
  for (const m of chain) {
    data = m.migrate(data) as Record<string, unknown>;
    meta = { ...meta, templateVersion: m.to };
  }
  return { meta, data };
}

// Parse + validate document data against template Zod schema.
// Returns defaults merged with data on validation failure (graceful degradation).
export function parseDocumentData<TSchema extends z.ZodTypeAny>(
  doc: WebsiteDocument,
  definition: TemplateDefinition<TSchema>,
): z.infer<TSchema> {
  const migrated = runMigrations(doc, definition);
  const result = definition.schema.safeParse(migrated.data);
  if (result.success) return result.data;
  if (process.env.NODE_ENV === "development") {
    console.warn(`[template:${definition.id}] schema validation failed:`, result.error.flatten());
  }
  return definition.defaults;
}

// Build an initial WebsiteDocument for a new project, using template mapper if available or generic auto-fill
export function buildInitialDocument(
  profile: UserProfile,
  definition: TemplateDefinition<z.ZodTypeAny>,
  locale = "id",
): WebsiteDocument {
  const now = new Date().toISOString();
  let initialData: Record<string, unknown>;

  if (definition.mapper) {
    // We pass UserProfile but cast to what mapper expects (if it still expects WorkspaceProfile, we should update mappers too. For now, we adapt).
    // Let's assume mappers expect the old WorkspaceProfile shape for a bit, or we rewrite mappers.
    // Actually, it's better to adapt the UserProfile into a mock WorkspaceProfile shape to avoid breaking all mappers immediately.
    const mockWorkspaceProfile = {
      workspaceId: "", // Not needed for mapping
      name: profile.full_name,
      logoUrl: profile.avatar_url,
      email: profile.contact_email,
      phone: profile.phone,
      address: profile.address,
      websiteUrl: null,
      extendedData: {
        tagline: profile.headline || undefined,
        description: profile.bio || undefined,
        socials: profile.socials,
      }
    };
    initialData = definition.mapper(mockWorkspaceProfile) as Record<string, unknown>;
  } else {
    const defs = definition.defaults as Record<string, unknown>;
    const profileOverride: Record<string, unknown> = {};

    if ("profile" in defs && typeof defs.profile === "object") {
      profileOverride.profile = {
        ...(defs.profile as Record<string, unknown>),
        fullName: profile.full_name ?? "",
        nickname: profile.nickname ?? "",
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        location: profile.address ?? "",
        photoUrl: profile.avatar_url ?? "",
      };
    }

    if ("contact" in defs && typeof defs.contact === "object") {
      profileOverride.contact = {
        ...(defs.contact as Record<string, unknown>),
        email: profile.contact_email ?? "",
        phone: profile.phone ?? "",
      };
    }

    if ("socials" in defs && Array.isArray(defs.socials)) {
      profileOverride.socials = profile.socials ?? [];
    }

    if ("skills" in defs && Array.isArray(defs.skills) && profile.skills?.length > 0) {
      profileOverride.skills = profile.skills;
    }

    initialData = { ...defs, ...profileOverride };
  }

  return {
    meta: {
      templateId: definition.id,
      templateVersion: definition.version,
      createdAt: now,
      updatedAt: now,
      locale,
    },
    data: initialData,
  };
}
