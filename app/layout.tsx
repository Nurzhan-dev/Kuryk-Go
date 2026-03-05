import "./globals.css";
import { Outfit } from "next/font/google";
import NavBar from "@/components/NavBar";
import { SelectedCarProvider } from "@/context/SelectedCarContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Kuryk Go — Перевозки твоего поселка",
  description: "Единый агрегатор такси, грузоперевозок и спецтехники в Курыке",
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <SelectedCarProvider>
        <NavBar />
        {children}
        </SelectedCarProvider>
      </body>
    </html>
  );
}