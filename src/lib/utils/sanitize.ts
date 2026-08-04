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
