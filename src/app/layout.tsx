import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://findaidir.com'),
  title: {
    default: "AI Tools Directory - Discover 6000+ AI Tools",
    template: "%s | AI Tools Directory",
  },
  description:
    "Explore the largest directory of AI tools. Find the perfect AI solution from 6000+ tools across 290+ categories including chatbots, image generators, writing assistants, and more.",
  keywords: [
    "AI tools",
    "artificial intelligence",
    "AI directory",
    "AI software",
    "machine learning tools",
    "AI chatbot",
    "AI image generator",
    "AI writing assistant",
  ],
  authors: [{ name: "AI Tools Directory" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AI Tools Directory",
    title: "AI Tools Directory - Discover 6000+ AI Tools",
    description:
      "Explore the largest directory of AI tools. Find the perfect AI solution from 6000+ tools across 290+ categories.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tools Directory - Discover 6000+ AI Tools",
    description:
      "Explore the largest directory of AI tools. Find the perfect AI solution from 6000+ tools across 290+ categories.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense - Uncomment and add your publisher ID after approval */}
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        /> */}

        {/* Google Analytics - Uncomment and add your GA ID */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        /> */}
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
