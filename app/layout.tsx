import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Excalidraw Clone - Infinite Canvas",
  description: "A hand-drawn style infinite canvas drawing application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
