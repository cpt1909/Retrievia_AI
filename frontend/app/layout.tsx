import type { Metadata } from "next";
import { googleSans, googleSansCode } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retrievia AI",
  description: "A lightweight Retrieval-Augmented Generation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${googleSans.variable} ${googleSansCode.variable}`}>
      <head>
        <meta name="google-site-verification" content="heeESflfYd3eXBk_J9IkGkxoLf_-sN_t_0pHkRvIK5Q" />
      </head>
      <body className="bg-background text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
