import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 text-center">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
        404
      </p>
      <h1 className="text-2xl font-semibold text-ink">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-deep"
      >
        Kembali ke beranda
      </Link>
    </div>
  );
}
