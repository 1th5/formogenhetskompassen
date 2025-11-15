import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-serif" });

const isProd = process.env.NEXT_PUBLIC_SITE_ENV === "production";

export const metadata: Metadata = {
  title: "Förmögenhetskollen",
  description: "Navigera hushållets ekonomi genom livets olika rikedomsnivåer",
  robots: isProd
    ? {
        index: true,
        follow: true,
      }
    : {
        index: false,
        follow: false,
      },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  // Open Graph används när sidan delas i sociala medier (Facebook, LinkedIn, etc.)
  openGraph: {
    title: "Förmögenhetskollen – FIRE, sparkalkylator och pensionsplanering",
    description: "Beräkna din väg till ekonomisk frihet med Förmögenhetskollen. Jämför FIRE, sparkalkylator, pension och lön efter skatt – allt i ett smart verktyg.",
    url: "https://formogenhetskollen.se",
    siteName: "Förmögenhetskollen",
    locale: "sv_SE",
    type: "website",
    // images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Förmögenhetskollen" }],
  },
  // Twitter Cards används när sidan delas på Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "Förmögenhetskollen – FIRE, sparkalkylator och pensionsplanering",
    description: "Beräkna din väg till ekonomisk frihet med Förmögenhetskollen. Jämför FIRE, sparkalkylator, pension och lön efter skatt – allt i ett smart verktyg.",
    // images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans text-primary bg-[var(--surface-bg)] flex flex-col min-h-screen`}>
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}