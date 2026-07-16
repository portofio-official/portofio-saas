"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, X } from "@phosphor-icons/react";
import { compressImageToDataUrl } from "@/lib/utils/compressImage";

export function PhotoUploadField({
  label,
  value,
  onChange,
  uploadLabel,
  replaceLabel,
}: {
  label: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  uploadLabel: string;
  replaceLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      onChange(dataUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink-soft">{label}</span>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-black/[0.04] ring-1 ring-black/[0.07]">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={20} weight="light" className="text-ink-faint" />
          )}
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-surface px-4 py-2 text-sm text-ink ring-1 ring-black/10 hover:ring-black/20 disabled:opacity-60"
        >
          {value ? replaceLabel : uploadLabel}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-black/[0.04]"
          >
            <X size={16} weight="light" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
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
