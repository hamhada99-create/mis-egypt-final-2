import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ميس إيجيبت",
  description: "منصة تعليمية عربية قابلة للتوسع"
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}