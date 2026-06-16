import type { Metadata } from "next";
import Script from "next/script";
import { getMetadataBase, getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const umamiScriptSrc = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_SRC;
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "乔木 App 洞察",
    template: "%s | 乔木 App 洞察",
  },
  description: "搜索任意 iOS App，生成 App Store 用户评价洞察页，提炼痛点、机会和版本风险。",
  applicationName: "乔木 App 洞察",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "乔木 App 洞察",
    description: "把 App Store 用户评价变成清晰、可复盘的产品洞察页面。",
    url: `${siteUrl}/`,
    siteName: "乔木 App 洞察",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "乔木 App 洞察",
    description: "挖掘 App Store 用户评价里的痛点、机会和版本风险。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className="antialiased"
      >
        {children}
        {umamiWebsiteId && umamiScriptSrc ? (
          <Script
            src={umamiScriptSrc}
            data-website-id={umamiWebsiteId}
            data-domains={process.env.NEXT_PUBLIC_UMAMI_DOMAIN}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
