import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { AppChrome } from "@/components/layout/app-chrome";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";

import "./globals.css";

const siteUrl = siteConfig.url;
const metaPixelId = "4391979504396894";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Purple Squad | Home Appliance Services in Chennai",
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
    title: "Purple Squad | Home Appliance Services in Chennai",
    description: siteConfig.description,
    images: [
      {
        url: "/images/hero/purple-squad-home-services-og.webp",
        width: 1200,
        height: 630,
        alt: "Purple Squad home service technician with appliances",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Purple Squad | Home Appliance Services in Chennai",
    description: siteConfig.description,
    images: ["/images/hero/purple-squad-home-services-og.webp"],
  },
  icons: {
    icon: [{ url: "/purple-squad-favicon.png", type: "image/png", sizes: "192x192" }],
    shortcut: "/purple-squad-favicon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <Providers>
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
