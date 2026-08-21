/**
 * Basic HTML & string sanitization helper to strip script tags,
 * dangerous attributes (onload, onerror), and unescaped HTML injection.
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:[^\s'"]+/gi, "")
    .trim();
}

/**
 * Guards a post-auth redirect target so it can only be a same-origin relative
 * path — rejects absolute URLs and protocol-relative ("//host") or
 * backslash ("\host", browsers treat it like "/") tricks that let an
 * attacker-controlled `next`/`redirect` query param send a signed-in user
 * off-site (open redirect).
 */
export function sanitizeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path || !/^\/(?!\/|\\)/.test(path)) return fallback;
  return path;
}

/**
 * Recursively sanitizes object values before dynamic rendering.
 */
export function sanitizeObjectData<T>(obj: T): T {
  if (typeof obj === "string") {
    return sanitizeString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObjectData(item)) as unknown as T;
  }

  if (obj !== null && typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      sanitized[key] = sanitizeObjectData(val);
    }
    return sanitized as T;
  }

  return obj;
}
