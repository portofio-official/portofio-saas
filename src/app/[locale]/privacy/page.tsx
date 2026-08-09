import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    title: locale === "en" ? "Privacy Policy - Portofio" : "Kebijakan Privasi - Portofio",
    description: "Privacy Policy and Data Protection rules for Portofio SaaS.",
  };
}

export default async function PrivacyPage({
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
            {isEn ? "Privacy Policy" : "Kebijakan Privasi"}
          </h1>
          <p className="text-xs text-[#6B7280] mb-8">
            {isEn ? "Last updated: August 1, 2026" : "Terakhir diperbarui: 1 Agustus 2026"}
          </p>

          <div className="space-y-6 text-sm text-[#374151] leading-relaxed">
            <section>
              <h2 className="text-base font-semibold text-[#111827] mb-2">
                1. {isEn ? "Information We Collect" : "Informasi yang Kami Kumpulkan"}
              </h2>
              <p>
                {isEn
                  ? "We collect information you provide directly to us when creating an account, constructing a portfolio document (such as bio, work experiences, education history, and projects), uploading profile photos, or subscribing to our billing service via Midtrans."
                  : "Kami mengumpulkan informasi yang Anda berikan secara langsung saat membuat akun, menyusun dokumen portofolio (seperti bio, pengalaman kerja, riwayat pendidikan, dan project), mengunggah foto profil, atau berlangganan layanan via Midtrans."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111827] mb-2">
                2. {isEn ? "How We Use Your Information" : "Penggunaan Informasi"}
              </h2>
              <p>
                {isEn
                  ? "Your portfolio data is strictly used to dynamically render your public portfolio website at your chosen subdomain. Payment details are processed securely through certified payment gateways (Midtrans)."
                  : "Data portofolio Anda digunakan secara khusus untuk merender website portofolio publik Anda secara dinamis pada subdomain yang dipilih. Detail pembayaran diproses secara aman melalui payment gateway tersertifikasi (Midtrans)."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111827] mb-2">
                3. {isEn ? "Data Protection & RLS Security" : "Keamanan & Perlindungan Data"}
              </h2>
              <p>
                {isEn
                  ? "We enforce strict Row Level Security (RLS) policies at the database layer ensuring that only you can access or modify your draft projects and workspace data."
                  : "Kami menerapkan kebijakan Row Level Security (RLS) ketat pada lapisan basis data untuk memastikan hanya Anda yang memiliki akses dan hak mengubah draft project serta data workspace Anda."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-[#111827] mb-2">
                4. {isEn ? "Contact Us" : "Hubungi Kami"}
              </h2>
              <p>
                {isEn
                  ? "If you have any questions regarding this Privacy Policy, please contact support@portofio.id."
                  : "Jika Anda memiliki pertanyaan seputar Kebijakan Privasi ini, silakan hubungi support@portofio.id."}
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
