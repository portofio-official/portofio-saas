import { Outfit, Inter } from "next/font/google";
import { LandingPage } from "@/components/landing/LandingPage";
import { getCurrentUserEmail } from "@/lib/auth/session";

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
  const userEmail = await getCurrentUserEmail();

  return (
    <div className={`${outfit.variable} ${inter.variable}`}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
      />
      <LandingPage userEmail={userEmail} />
    </div>
  );
}
