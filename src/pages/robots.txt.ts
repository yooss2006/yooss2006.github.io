import { siteConfig } from "@/config/site";

const siteUrl = new URL(siteConfig.url);

export function GET() {
  const sitemapUrl = new URL("/sitemap.xml", siteUrl).toString();
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
