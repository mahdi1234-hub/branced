import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BRANCED - AI-Powered Flipbook Assistant",
  description:
    "Professional AI assistant with interactive flipbook guidance, powered by Cerebras LLM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans font-light antialiased">{children}</body>
    </html>
  );
}
