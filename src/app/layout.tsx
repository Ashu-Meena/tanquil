import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import CartDrawer from "@/components/cart/CartDrawer";
import SearchModal from "@/components/search/SearchModal";
import Preloader from "@/components/layout/Preloader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ToastContainer from "@/components/ui/ToastContainer";
import AnalyticsWrapper from "@/components/analytics/AnalyticsWrapper";
import CookieConsent from "@/components/ui/CookieConsent";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tranquil | Luxury Fashion",
  description: "Premium luxury fashion and statement clothing designed to make you unforgettable.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { headers } = await import("next/headers");
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") || undefined;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${cormorantGaramond.variable} ${montserrat.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
        {/* Website designed and developed by Samvix Technologies */}
        <Preloader />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomNav />
        <CartDrawer />
        <SearchModal />
        <ToastContainer />
        <CookieConsent />
      </body>
      <AnalyticsWrapper 
        gaId={process.env.NEXT_PUBLIC_GA_ID || "G-04SKZSZQ0E"} 
        gtmId={process.env.NEXT_PUBLIC_GTM_ID || "GTM-TFQH67M7"} 
        nonce={nonce}
      />
    </html>
  );
}
