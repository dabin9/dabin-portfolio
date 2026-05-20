import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "swiper/css";
import "swiper/css/pagination";
import "./globals.css";
import { site } from "@/data/site";
import { projects, publicProjects } from "@/data/projects";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientShell from "@/components/ClientShell";

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
    ({ slug, title, year, role, stack }) => ({
      slug,
      title,
      year,
      role,
      stack
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
                  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e){}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ClientShell commandProjects={commandProjects}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientShell>
      </body>
    </html>
  );
}
