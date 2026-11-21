import type { Metadata, Viewport } from "next";
import { Geist_Mono, JetBrains_Mono, Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RegisterSW } from "@/components/RegisterSW";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });
const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"] });
const led = Share_Tech_Mono({ variable: "--font-led", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Clock",
  description: "Themeable clock, timer and focus tools for long work sessions",
  other: { "apple-mobile-web-app-capable": "yes" },
  appleWebApp: { capable: true, title: "Clock", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#0a0a0a", viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${jetbrains.variable} ${orbitron.variable} ${led.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
