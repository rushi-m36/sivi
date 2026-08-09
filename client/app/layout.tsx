import React from "react";
import NextTopLoader from "nextjs-toploader";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sivi",
  description: "Search YouTube without the clutter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full bg-transparent text-slate-900 transition-colors dark:text-white">
          <NextTopLoader
            color="hsl(var(--secondary-light))"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl
            showSpinner
            easing="ease"
            speed={200}
            shadow="0 0 10px hsl(var(--secondary)),0 0 5px hsl(var(--secondary-light))"
            template='<div class="bar" role="bar"><div class="peg"></div></div> 
  <div class="spinner" style="top: 65px" role="spinner"><div class="spinner-icon"></div></div>'
            zIndex={999999}
          />
          <div className="mx-auto flex w-full max-w-7xl flex-col px-3 pb-6 pt-3 sm:px-4 lg:px-6">
            <div className="mb-4">
              <Navbar />
            </div>
            <main className="flex-1 pt-8">{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
