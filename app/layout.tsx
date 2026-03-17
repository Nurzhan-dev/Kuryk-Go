import "./globals.css";
import { Outfit } from "next/font/google";
import NavBar from "@/components/NavBar";
import { SelectedCarProvider } from "@/context/SelectedCarContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Kuryk Go — Перевозки твоего поселка",
  description: "Ваш универсальный агрегатор перевозок в Курыке",
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#facc15" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kuryk Go" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
      </head>
      <body className={outfit.className}>
        <SelectedCarProvider>
          <NavBar />
          {children}
        </SelectedCarProvider>
      </body>
    </html>
  );
}