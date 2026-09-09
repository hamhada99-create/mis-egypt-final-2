import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIS Egypt",
  description: "موقع شركة MIS Egypt",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
