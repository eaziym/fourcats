import type { Metadata } from "next";
import {
  Baloo_2,
  Geist_Mono,
  Inter,
  Nunito,
  Quicksand,
} from "next/font/google";
import { TweaksPanel } from "@/components/pet-care/tweaks-panel";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TWEAKS_BOOTSTRAP } from "@/lib/tweaks";
import "./globals.css";

/** Body UI — Little Lovely Pets design handoff (Inter). */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Headlines / brand moments — Quicksand (also tweakable to Nunito / Baloo 2). */
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const baloo2 = Baloo_2({
  variable: "--font-baloo2",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Little Lovely Pets — Singapore AI care",
  description:
    "Track care, discover local spots, and get AI tips for your pets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&display=optional"
          rel="stylesheet"
        />
        {/** Apply saved Tweaks before paint to avoid a flash of default styling. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: tiny static bootstrap, no user input */}
        <script dangerouslySetInnerHTML={{ __html: TWEAKS_BOOTSTRAP }} />
      </head>
      <body
        className={`${inter.variable} ${quicksand.variable} ${nunito.variable} ${baloo2.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <ThemeProvider>
          <Toaster position="top-center" richColors />
          {children}
          <TweaksPanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
