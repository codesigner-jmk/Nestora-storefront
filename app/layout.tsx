import type { Metadata } from "next";
import Script from "next/script";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WebCartRealtime } from "@/components/WebCartRealtime";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "NESTORA — Modern furniture for modern living", template: "%s | NESTORA" },
  description: "Thoughtful furniture for slow mornings, long dinners and everyday living.",
  openGraph: {
    title: "NESTORA — Modern furniture for modern living",
    description: "A considered collection for the spaces you call home.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" suppressHydrationWarning>
      <head>
        <Script id="nestora-theme-init" strategy="beforeInteractive">{`(() => {
          try {
            const savedTheme = localStorage.getItem("nestora-theme");
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.dataset.theme = savedTheme === "light" || savedTheme === "dark"
              ? savedTheme
              : systemPrefersDark ? "dark" : "light";
          } catch {
            document.documentElement.dataset.theme = "light";
          }
        })();`}</Script>
      </head>
      <body>
        <SiteHeader />
        <WebCartRealtime />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
