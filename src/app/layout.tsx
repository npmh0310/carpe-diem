import type { Metadata } from "next";
import { Anton, Oswald, Inter } from "next/font/google"; // Anton as Druk alternative, Oswald for captions, Inter for body text
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { InitialLoaderProvider } from "@/components/providers/initial-loader-provider";
import { ModeToggle } from "@/components/common/ModeToggle";
import { getSiteUrl } from "@/lib/site-url";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400", // Anton only has 400, but it looks like 900
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Carpe Diem — Film Photography by Nguyen Phuoc Minh Hieu",
    template: "%s | Carpe Diem",
  },
  description:
    "A personal film photography archive by Nguyen Phuoc Minh Hieu. Shot on analog cameras across Vietnam and beyond — Kodak, Ilford, Fujifilm.",
  keywords: [
    "film photography",
    "analog photography",
    "35mm film",
    "film archive",
    "Nguyen Phuoc Minh Hieu",
    "Vietnam photographer",
    "Kodak Portra",
    "Ilford HP5",
    "carpe diem",
  ],
  authors: [{ name: "Nguyen Phuoc Minh Hieu", url: getSiteUrl() }],
  creator: "Nguyen Phuoc Minh Hieu",
  publisher: "Nguyen Phuoc Minh Hieu",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Carpe Diem — Film Photography by Nguyen Phuoc Minh Hieu",
    description:
      "A personal film photography archive shot on analog cameras across Vietnam and beyond.",
    url: getSiteUrl(),
    siteName: "Carpe Diem",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carpe Diem — Film Photography",
    description:
      "A personal film photography archive shot on analog cameras across Vietnam and beyond.",
    creator: "@carpe__diem.jpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: getSiteUrl(),
  },
};

const siteUrl = getSiteUrl();

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Nguyen Phuoc Minh Hieu",
  url: siteUrl,
  sameAs: [
    "https://www.instagram.com/carpe__diem.jpg",
    "https://www.facebook.com/nguyen.phuoc.minh.hieu.2025",
  ],
  jobTitle: "Film Photographer",
  description:
    "Vietnamese film photographer documenting everyday life on analog cameras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className={`${anton.variable} ${oswald.variable} ${inter.variable} antialiased`}>
        <SmoothScrollProvider>
          <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <InitialLoaderProvider>
              {children}
              <div className="fixed left-4 bottom-4 z-50">
                <ModeToggle />
              </div>
            </InitialLoaderProvider>
          </ThemeProvider>
        </TooltipProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
