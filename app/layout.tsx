import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "رابطة ولاية نهر النيل الرقمية",
  description: "منصة رقمية شاملة تربط أبناء ولاية نهر النيل في الداخل والخارج.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
