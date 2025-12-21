import type { Metadata } from "next";
import { Space_Grotesk, Vazirmatn } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Customer Satisfaction Survey",
  description: "Employee satisfaction survey system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${vazirmatn.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
