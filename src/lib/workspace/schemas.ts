import { z } from "zod";

export const WorkspaceProfileSchema = z.object({
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().regex(/^62[0-9]{8,15}$/, "Phone must start with 62 and be 10-17 digits").optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});
