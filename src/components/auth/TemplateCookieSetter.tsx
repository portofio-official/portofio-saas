"use client";

import { useEffect } from "react";

export function TemplateCookieSetter({ templateId }: { templateId: string }) {
  useEffect(() => {
    // Set cookie for 1 hour
    document.cookie = `preferredTemplateId=${templateId}; path=/; max-age=3600`;
  }, [templateId]);

  return null;
}
