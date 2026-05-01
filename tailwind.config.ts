import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      /* 토큰은 CSS 변수로 구동 → 테마 토글 시 전체가 한 번에 스왑됩니다. */
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        panel: "rgb(var(--surface) / <alpha-value>)", // 구파일 호환
        ink: "rgb(var(--ink) / <alpha-value>)",
        inkMuted: "rgb(var(--ink-muted) / <alpha-value>)",
        inkSoft: "rgb(var(--ink-muted) / <alpha-value>)", // 구파일 호환
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        lineStrong: "rgb(var(--line-strong) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        accent: "rgb(var(--brand) / <alpha-value>)", // 구파일 호환
        brandInk: "rgb(var(--brand-ink) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        cobalt: "rgb(var(--cobalt) / <alpha-value>)",
        moss: "rgb(var(--moss) / <alpha-value>)",
        sand: "rgb(var(--sand) / <alpha-value>)"
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "var(--font-sans)",
          "-apple-system",
          "system-ui",
          "sans-serif"
        ],
        display: [
          "var(--font-display)",
          "Pretendard Variable",
          "Pretendard",
          "system-ui",
          "sans-serif"
        ],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace"
        ]
      },
      letterSpacing: {
        tightest: "-0.045em",
        tighter: "-0.028em"
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        introIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      animation: {
        marquee: "marquee 60s linear infinite",
        shimmer: "shimmer 4s linear infinite",
        float: "float 6s ease-in-out infinite",
        introIn: "introIn 400ms ease-out forwards"
      }
    }
  },
  plugins: []
};

export default config;
