import type { Metadata } from "next";
import { Anton, Oswald } from "next/font/google"; // Anton as Druk alternative, Oswald for captions
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

export const metadata: Metadata = {
  title: "carpe-diem",
  description: "carpe-diem",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Carpe Diem",
    description: "Carpe Diem",
    url: "https://carpediem.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${anton.variable} ${oswald.variable} antialiased`}>
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
