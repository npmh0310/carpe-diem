import type { Metadata } from "next";
import { Anton, Oswald, Inter } from "next/font/google"; // Anton as Druk alternative, Oswald for captions, Inter for body text
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { InitialLoaderProvider } from "@/components/providers/initial-loader-provider";
import { ModeToggle } from "@/components/common/ModeToggle";

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
  metadataBase: new URL("https://carpe-diem-archive.vercel.app"),
  title: "carpe-diem",
  description: "Film Photography Archive",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "carpe-diem",
    description: "Film Photography Archive",
    url: "/",
    siteName: "carpe-diem",
  },
  twitter: {
    card: "summary_large_image",
    title: "carpe-diem",
    description: "Film Photography Archive",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
