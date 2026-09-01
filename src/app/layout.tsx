import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { AppChrome } from "@/components/layout/app-chrome";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || siteConfig.url;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Purple Squad | Home Services in Chennai, Bangalore and Coimbatore",
    template: "%s | Purple Squad",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  authors: [{ name: "Purple Squad" }],
  creator: "Purple Squad",
  publisher: "Purple Squad",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: siteConfig.name,
    title: "Purple Squad | Trusted Home Services",
    description: siteConfig.description,
    images: [
      {
        url: "/images/hero/purple-squad-home-services-hero.png",
        width: 1200,
        height: 630,
        alt: "Purple Squad home service technician with appliances",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Purple Squad | Trusted Home Services",
    description: siteConfig.description,
    images: ["/images/hero/purple-squad-home-services-hero.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
