import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "タップRPG",
  description: "タップ主体のインクリメンタルRPG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
