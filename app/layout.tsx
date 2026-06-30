import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: {
    default: "New & Recycled | Toners, tinteiros e material de escritório",
    template: "%s | New & Recycled",
  },
  description:
    "Loja online de toners, tinteiros, consumíveis, papel, rolos térmicos, material escolar, material de escritório e artigos de limpeza. Encomendas validadas antes do pagamento.",
  keywords: [
    "toners",
    "tinteiros",
    "consumíveis impressoras",
    "material de escritório",
    "material escolar",
    "papel A4",
    "rolos térmicos",
    "cartuchos HP",
    "cartuchos Canon",
    "toner compatível",
    "New & Recycled",
  ],
  authors: [{ name: "New & Recycled" }],
  creator: "New & Recycled",
  publisher: "New & Recycled",
  metadataBase: new URL("https://new-recycled.vercel.app"),
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "New & Recycled",
    title: "New & Recycled | Toners, tinteiros e material de escritório",
    description:
      "Toners, tinteiros, consumíveis, papel, rolos térmicos, material escolar e material de escritório. Encomendas validadas antes do pagamento.",
    url: "https://new-recycled.vercel.app",
    images: [
      {
        url: "/logotipo.png",
        width: 800,
        height: 600,
        alt: "New & Recycled",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "New & Recycled | Toners, tinteiros e material de escritório",
    description:
      "Toners, tinteiros e material de escritório. Encomendas validadas antes do pagamento.",
    images: ["/logotipo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logotipo.png",
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
        <WhatsAppButton />
      </body>
    </html>
  );
}
