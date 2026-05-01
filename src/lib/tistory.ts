/**
 * Tistory 데이터 소스.
 * - 목록은 RSS 피드(`/rss`) 사용
 * - 개별 글은 `/{id}` HTML 을 직접 가져와 본문 컨테이너만 추출
 *
 * 외부 의존성 없이 정규식 기반 파서. 외부 HTML 을 그대로 렌더하므로
 * `sanitizeHtml` 로 스크립트/이벤트/위험 요소를 제거한 후 DOM 에 주입한다.
 */

const REVALIDATE_SECONDS = 60 * 30; // 30분

export type TistoryPost = {
  id: string;          // URL 의 마지막 숫자 (예: "10")
  title: string;
  link: string;
  pubDate: string;     // ISO
  excerpt: string;
  thumbnail?: string;
  categories: string[];
};

export type TistoryArticle = {
  id: string;
  title: string;
  url: string;
  date: string;        // ISO
  image?: string;
  contentHtml: string; // sanitized HTML
};

/* ------------------------------------------------------------------ */
/*  목록 (RSS)                                                         */
/* ------------------------------------------------------------------ */

export async function fetchTistoryPosts(
  baseUrl: string,
  limit = 30
): Promise<TistoryPost[]> {
  if (!baseUrl) return [];
  const rssUrl = baseUrl.replace(/\/$/, "") + "/rss";

  let xml: string;
  try {
    const res = await fetch(rssUrl, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PortfolioBot/1.0)" }
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }

  const items = matchAll(xml, /<item\b[\s\S]*?<\/item>/g);
  return items.slice(0, limit).map(toPost).filter((p) => !!p.id);
}

function toPost(itemXml: string): TistoryPost {
  const title = decode(extract(itemXml, /<title>([\s\S]*?)<\/title>/));
  const link = decode(extract(itemXml, /<link>([\s\S]*?)<\/link>/));
  const id = extractIdFromLink(link);
  const pubDateRaw = extract(itemXml, /<pubDate>([\s\S]*?)<\/pubDate>/);
  const pubDate = pubDateRaw ? safeIso(pubDateRaw) : "";

  const description = decode(extract(itemXml, /<description>([\s\S]*?)<\/description>/));
  const thumbnail = extractFirstImg(description);
  const excerpt = stripHtml(description).slice(0, 180);

  const categories = matchAll(itemXml, /<category>([\s\S]*?)<\/category>/g)
    .map((c) => decode(c.replace(/<\/?category>/g, "")))
    .filter(Boolean);

  return { id, title, link, pubDate, excerpt, thumbnail, categories };
}

export function extractIdFromLink(link: string): string {
  const m = link.match(/\/(\d+)\/?$/);
  return m ? m[1] : "";
}

/* ------------------------------------------------------------------ */
/*  개별 글 (HTML scrape)                                              */
/* ------------------------------------------------------------------ */

export async function fetchTistoryArticle(
  baseUrl: string,
  id: string
): Promise<TistoryArticle | null> {
  if (!baseUrl || !id || !/^\d+$/.test(id)) return null;
  const url = baseUrl.replace(/\/$/, "") + "/" + id;

  let html: string;
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PortfolioBot/1.0)" }
    });
    if (!res.ok) return null;
    html = await res.text();
  } catch {
    return null;
  }

  const title =
    extractMeta(html, "og:title") ||
    decode(extract(html, /<title>([\s\S]*?)<\/title>/));
  const image = extractMeta(html, "og:image");
  const regDate = extractMeta(html, "og:regDate"); // YYYYMMDDHHMMSS
  const date = regDate ? regDateToIso(regDate) : "";

  // Tistory 본문 컨테이너 — `tt_article_useless_p_margin contents_style` 가 가장 안정적
  const body = pickArticleBody(html);
  if (!body) return null;

  const contentHtml = sanitizeHtml(body);

  return { id, title, url, date, image, contentHtml };
}

function pickArticleBody(html: string): string {
  const candidates = [
    /<div[^>]*class="[^"]*tt_article_useless_p_margin[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]*class="[^"]*contents_style[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<article[^>]*class="[^"]*article_view[^"]*"[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class="[^"]*article_view[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i
  ];
  for (const re of candidates) {
    const m = html.match(re);
    if (m && m[1] && m[1].length > 50) return m[1];
  }
  return "";
}

/* ------------------------------------------------------------------ */
/*  Sanitizer — scripts/iframes/event handlers/javascript: 제거       */
/* ------------------------------------------------------------------ */

function sanitizeHtml(html: string): string {
  let out = html;

  // 위험 요소 통째로 제거
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  out = out.replace(/<link\b[^>]*>/gi, "");
  out = out.replace(/<meta\b[^>]*>/gi, "");

  // iframe 은 youtube 만 통과
  out = out.replace(/<iframe\b([^>]*)>([\s\S]*?)<\/iframe>/gi, (_, attrs) => {
    const srcMatch = String(attrs).match(/src=["']([^"']+)["']/i);
    const src = srcMatch ? srcMatch[1] : "";
    if (/^https?:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(src)) {
      return `<iframe src="${escapeAttr(src)}" loading="lazy" allow="encrypted-media" allowfullscreen style="width:100%;aspect-ratio:16/9;border:0"></iframe>`;
    }
    return "";
  });

  // on* 이벤트 핸들러 모두 제거
  out = out.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  out = out.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  out = out.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");

  // javascript:/data: URL 제거 (이미지 data: 는 유지)
  out = out.replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"');
  out = out.replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1='#'");

  // 외부 링크는 새 탭으로 + rel
  out = out.replace(/<a\b([^>]*?)>/gi, (m, attrs) => {
    const a = String(attrs);
    if (/href\s*=\s*["']https?:\/\//i.test(a)) {
      const cleaned = a.replace(/\s+(target|rel)\s*=\s*["'][^"']*["']/gi, "");
      return `<a${cleaned} target="_blank" rel="noreferrer noopener">`;
    }
    return m;
  });

  // 이미지 lazy
  out = out.replace(/<img\b([^>]*)>/gi, (m, attrs) => {
    const a = String(attrs);
    if (/loading\s*=/.test(a)) return m;
    return `<img${a} loading="lazy" decoding="async">`;
  });

  return out;
}

function escapeAttr(s: string) {
  return s.replace(/"/g, "&quot;");
}

/* ------------------------------------------------------------------ */
/*  유틸                                                                */
/* ------------------------------------------------------------------ */

function extract(s: string, re: RegExp): string {
  const m = s.match(re);
  if (!m || !m[1]) return "";
  return unwrapCdata(m[1]).trim();
}

function matchAll(s: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = r.exec(s)) !== null) out.push(m[0]);
  return out;
}

function unwrapCdata(s: string): string {
  const m = s.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return m ? m[1] : s;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstImg(html: string): string | undefined {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : undefined;
}

function extractMeta(html: string, prop: string): string {
  const re = new RegExp(
    `<meta[^>]+property=["']${prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const m = html.match(re);
  if (m) return decode(m[1]);
  // fallback: name=
  const re2 = new RegExp(
    `<meta[^>]+name=["']${prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const m2 = html.match(re2);
  return m2 ? decode(m2[1]) : "";
}

function regDateToIso(s: string): string {
  // "20231204062156" → 2023-12-04T06:21:56+09:00 (KST)
  if (!/^\d{14}$/.test(s)) return "";
  const y = s.slice(0, 4),
    mo = s.slice(4, 6),
    d = s.slice(6, 8),
    h = s.slice(8, 10),
    mi = s.slice(10, 12),
    se = s.slice(12, 14);
  return `${y}-${mo}-${d}T${h}:${mi}:${se}+09:00`;
}

function safeIso(s: string): string {
  const t = new Date(s);
  return isNaN(t.getTime()) ? "" : t.toISOString();
}
