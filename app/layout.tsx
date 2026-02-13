import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "yuruly - ログイン不要の日程調整サービス",
  description: "飲み会やふわっとした予定も、サクッと調整。モバイルファーストで直感的な日程調整ツール。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${nunito.variable} ${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
