// app/layout.tsx
import type { Metadata } from "next";
import { Rubik, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const rubik = Rubik({
  subsets: ["latin", "cyrillic"],
  variable: "--font-rubik",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Зээлийн Апп",
  description: "Зээлийн эрхийг бэлэн мөнгө болгон хувиргах үйлчилгээ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      {/* Rubik-ийг үндсэн фонтоор идэвхжүүлж, layout-аа compact болгосон */}
      <body
        className={`${rubik.className} ${geistMono.variable} antialiased flex min-h-screen flex-col bg-white`}
      >
        <Navbar />
        <main className="flex-1 bg-white">{children}</main>
        <Footer />
      </body>



    </html>
  );
}
