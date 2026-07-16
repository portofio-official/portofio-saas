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

// WebsiteDocument — wrapper disimpan di draft_json / published_json
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

// TemplateDefinition — Zod schema is the single source of truth
export interface TemplateDefinition<TSchema extends z.ZodTypeAny> {
  id: string;
  version: number;
  meta: TemplateMeta;
  // ponytail: not a full DSL — just labels for the form sidebar
  sections: SectionDef[];
  schema: TSchema;
  defaults: z.infer<TSchema>;
  migrations: MigrationStep[];
  renderer: React.ComponentType<{
    data: z.infer<TSchema>;
    workspaceProfile: WorkspaceProfile;
  }>;
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
  // ponytail: warn in dev only; degrade gracefully in prod
  if (process.env.NODE_ENV === "development") {
    console.warn(`[template:${definition.id}] schema validation failed:`, result.error.flatten());
  }
  return definition.defaults;
}

// Build an initial WebsiteDocument for a new project, auto-filling from WorkspaceProfile.
// Top-level keys that exist in defaults AND can be filled from profile are merged;
// template-specific fields keep their defaults.
export function buildInitialDocument(
  profile: WorkspaceProfile,
  definition: TemplateDefinition<z.ZodTypeAny>,
  locale = "id",
): WebsiteDocument {
  const now = new Date().toISOString();
  const defs = definition.defaults as Record<string, unknown>;

  const profileOverride: Record<string, unknown> = {};

  // Auto-fill profile section if the template has one
  if ("profile" in defs && typeof defs.profile === "object") {
    profileOverride.profile = {
      ...(defs.profile as Record<string, unknown>),
      fullName: profile.name ?? "",
    };
  }

  // Auto-fill contact section if the template has one
  if ("contact" in defs && typeof defs.contact === "object") {
    profileOverride.contact = {
      ...(defs.contact as Record<string, unknown>),
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    };
  }

  // Auto-fill socials if the template has one
  if ("socials" in defs && Array.isArray(defs.socials)) {
    profileOverride.socials = profile.extendedData.socials ?? [];
  }

  return {
    meta: {
      templateId: definition.id,
      templateVersion: definition.version,
      createdAt: now,
      updatedAt: now,
      locale,
    },
    data: { ...defs, ...profileOverride },
  };
}
