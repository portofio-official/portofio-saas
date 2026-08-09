"use client";

import { useRef, useState } from "react";
import { compressImageToDataUrl } from "@/lib/utils/compressImage";
import { uploadContentImageAction } from "@/lib/content/actions";

export function LibraryImageUploadField({
  label,
  value,
  onChange,
  onError,
  uploadLabel,
  replaceLabel,
  removeLabel,
}: {
  label: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  onError?: () => void;
  uploadLabel: string;
  replaceLabel: string;
  removeLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const dataUrl = await compressImageToDataUrl(file, 1600, 0.82);
      const result = await uploadContentImageAction(dataUrl);
      if (result.ok && result.url) {
        onChange(result.url);
      } else {
        onError?.();
      }
    } catch {
      onError?.();
    } finally {
      setBusy(false);
    }
  }

  const preview = value ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={value} alt="" className="h-full w-full object-cover" />
  ) : (
    <span className="material-symbols-outlined text-[20px] text-ink-faint">image</span>
  );

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-soft">{label}</span>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/[0.04] ring-1 ring-black/[0.07]">
          {preview}
        </div>
        <div className="flex flex-col items-start gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-full bg-surface px-4 py-2 text-sm text-ink ring-1 ring-black/10 hover:ring-black/20 disabled:opacity-60"
          >
            {busy ? "…" : value ? replaceLabel : uploadLabel}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-danger/70 hover:text-danger transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
              {removeLabel}
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
