import type { Metadata } from "next";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/500.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/800.css";
import "@fontsource/cairo/900.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nile-river-state-link.nabih502.chatgpt.site"),
  title: "رابطة ولاية نهر النيل الرقمية",
  description: "منصة رقمية شاملة تربط أبناء ولاية نهر النيل في الداخل والخارج.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "رابطة ولاية نهر النيل الرقمية",
    description: "منصة رقمية شاملة تربط أبناء الولاية",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "رابطة ولاية نهر النيل الرقمية",
    description: "منصة رقمية شاملة تربط أبناء الولاية",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
