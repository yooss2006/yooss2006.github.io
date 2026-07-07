import { siteConfig } from "@/config/site";
import { getPublishedPosts, getPostSlug } from "@/lib/posts";

const siteUrl = new URL(siteConfig.url);
const staticPaths = ["/", "/posts/", "/about/"] as const;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function urlEntry(path: string, lastmod?: Date) {
  const loc = escapeXml(new URL(path, siteUrl).toString());
  const lastmodTag = lastmod ? `\n    <lastmod>${toDateOnly(lastmod)}</lastmod>` : "";

  return `  <url>
    <loc>${loc}</loc>${lastmodTag}
  </url>`;
}

export async function GET() {
  const posts = await getPublishedPosts();
  const entries = [
    ...staticPaths.map((path) => urlEntry(path)),
    ...posts.map((post) =>
      urlEntry(`/posts/${getPostSlug(post)}/`, post.data.updatedAt ?? post.data.publishedAt),
    ),
  ].join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
