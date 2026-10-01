import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
    <html lang="en-NG">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
