import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EduHub — AI Worksheet Generator",
  description: "AI-native question set and worksheet generator for teachers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} h-full`}>
      <body className="min-h-full antialiased" style={{ backgroundColor: '#121417', color: '#E8EAED' }}>
        {children}
      </body>
    </html>
  );
}
