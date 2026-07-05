import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "swiper/css";
import "swiper/css/pagination";
import "./globals.css";
import { site } from "@/shared/config/site";
import { projects, publicProjects } from "@/entities/project";
import { getProjectSearchText } from "@/entities/project/model/searchText";
import Header from "@/features/site-shell/components/Header";
import Footer from "@/features/site-shell/components/Footer";
import ClientShell from "@/features/site-shell/components/ClientShell";
import VisitTracker from "@/features/analytics/components/VisitTracker";

const GA_TRACKING_ID = "G-YHJTVXKLC2";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap"
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s · ${site.name}`
  },
  description: site.tagline,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
    type: "website",
    locale: "ko_KR"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const commandProjects = publicProjects(projects).map(
    (project) => ({
      slug: project.slug,
      title: project.title,
      year: project.year,
      role: project.role,
      stack: project.stack,
      searchText: getProjectSearchText(project)
    })
  );

  return (
    <html lang="ko" className={`${display.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      {/* FOUC 방지: 테마 선호 즉시 적용 */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e){}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}');
            `
          }}
        />
        <ClientShell commandProjects={commandProjects}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <VisitTracker />
        </ClientShell>
      </body>
    </html>
  );
}
