import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "New & Recycled | Toners, tinteiros e material de escritório",
    template: "%s | New & Recycled",
  },
  description:
    "Loja online de toners, tinteiros, consumíveis, papel, rolos térmicos, material escolar, material de escritório e artigos de limpeza. Encomendas sujeitas a confirmação de stock e portes.",
  keywords: [
    "New & Recycled",
    "toners",
    "tinteiros",
    "consumíveis",
    "material de escritório",
    "material escolar",
    "papel",
    "rolos térmicos",
    "impressoras",
    "cartuchos",
    "artigos de limpeza",
  ],
  authors: [{ name: "New & Recycled" }],
  creator: "New & Recycled",
  publisher: "New & Recycled",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "New & Recycled",
    title: "New & Recycled | Toners, tinteiros e material de escritório",
    description:
      "Toners, tinteiros, consumíveis, papel, rolos térmicos, material escolar, material de escritório e artigos de limpeza.",
    url: "https://new-recycled.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}