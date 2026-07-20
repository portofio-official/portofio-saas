import { Outfit, Inter } from "next/font/google";
import { LandingPage } from "@/components/landing/LandingPage";
import { getCurrentUserEmail } from "@/lib/auth/session";
import { getUserRole } from "@/lib/auth/roles";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export default async function Home() {
  const [userEmail, userRole] = await Promise.all([
    getCurrentUserEmail(),
    getUserRole()
  ]);

  return (
    <div className={`${outfit.variable} ${inter.variable}`}>
      <LandingPage userEmail={userEmail} userRole={userRole} />
    </div>
  );
}
