import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Outfit } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], weight: ["500", "600", "700"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Golden Tai Operations",
  description: "Internal admin dashboard for Golden Tai Expeditions.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${outfit.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F7F1E3] text-[#22301F]">{children}</body>
    </html>
  );
}
