import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Terms of Service - Portofio" : "Syarat & Ketentuan - Portofio",
    description: "Terms of Service and Subscription Rules for Portofio SaaS.",
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === "en";

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#111827] flex flex-col font-sans">
      <header className="border-b border-[#E5E7EB] bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[#111827]">
          <div className="h-8 w-8 rounded-lg bg-[#00cf7c] flex items-center justify-center text-white font-black text-sm">
            P
          </div>
          Portofio
        </Link>
        <Link href="/login" className="text-xs font-semibold text-[#00b368] hover:underline">
          {isEn ? "Back to Login" : "Kembali ke Login"}
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 flex-1">
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            {isEn ? "Terms of Service" : "Syarat & Ketentuan Layanan"}
          </h1>
          <p className="text-xs text-[#6B7280] mb-8">
            {isEn ? "Last updated: August 1, 2026" : "Terakhir diperbarui: 1 Agustus 2026"}
          </p>

          <div className="space-y-6 text-sm text-[#374151] leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-[#111827] mb-2">
                1. {isEn ? "Service Overview" : "Ketentuan Layanan"}
              </h2>
              <p>
                {isEn
                  ? "Portofio is a SaaS portfolio website builder. Building drafts and viewing live previews is free. Publishing (deploying) a website to a live subdomain requires an active subscription."
                  : "Portofio adalah platform pembuat website portofolio SaaS. Memasang draft dan melihat live preview gratis. Mempublikasikan (deploy) website ke subdomain aktif membutuhkan langganan yang aktif."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111827] mb-2">
                2. {isEn ? "Single Published Website Policy" : "Aturan 1 Website Dipublikasikan"}
              </h2>
              <p>
                {isEn
                  ? "Each user subscription permits a maximum of 1 active published website at any given time. Users may switch templates or update content freely. Publishing a second website requires unpublishing the currently active website first."
                  : "Setiap paket berlangganan berlaku untuk maksimal 1 website aktif yang dipublikasikan pada satu waktu. Pengguna dapat berganti template atau memperbarui konten secara bebas. Untuk mempublikasikan website kedua, pengguna wajib meng-unpublish website aktif terlebih dahulu."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111827] mb-2">
                3. {isEn ? "Subscription & Grace Period" : "Langganan & Grace Period"}
              </h2>
              <p>
                {isEn
                  ? "Subscriptions renew monthly via Xendit. If a subscription lapses, a 7-day grace period applies. After 7 days without renewal, published websites are automatically soft-unpublished (set to draft). Your portfolio data remains strictly preserved and intact."
                  : "Langganan diperbarui setiap bulan melalui Xendit. Jika pembayaran langganan terhenti, berlaku masa tenggang (grace period) 7 hari. Setelah 7 hari tanpa perpanjangan, website publik otomatis di-unpublish (kembali ke status draft). Data portofolio Anda tetap aman dan tidak akan dihapus."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111827] mb-2">
                4. {isEn ? "Prohibited Content & Subdomain Misuse" : "Konten Terlarang & Penyalahgunaan Subdomain"}
              </h2>
              <p>
                {isEn
                  ? "Subdomains violating intellectual property, containing spam, phishing, or illegal content will be suspended immediately without refund."
                  : "Subdomain yang melanggar hak cipta, mengandung spam, phishing, atau konten ilegal akan langsung dinonaktifkan tanpa pengembalian dana."}
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E5E7EB] bg-white px-6 py-6 text-center text-xs text-[#6B7280]">
        &copy; {new Date().getFullYear()} Portofio SaaS. All rights reserved.
      </footer>
    </div>
  );
}
