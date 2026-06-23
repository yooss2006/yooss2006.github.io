import { siteConfig } from "@/config/site";
import { getPublishedPosts, getPostSlug } from "@/lib/posts";

const siteUrl = new URL(siteConfig.url);

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const posts = await getPublishedPosts();
  const items = posts
    .map((post) => {
      const postUrl = new URL(`/posts/${getPostSlug(post)}/`, siteUrl).toString();
      const publishedAt = post.data.publishedAt.toUTCString();

      return `<item>
  <title>${escapeXml(post.data.title)}</title>
  <link>${postUrl}</link>
  <guid>${postUrl}</guid>
  <description>${escapeXml(post.data.description)}</description>
  <pubDate>${publishedAt}</pubDate>
</item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(siteConfig.name)}</title>
  <link>${siteUrl.toString()}</link>
  <description>${escapeXml(siteConfig.description)}</description>
  <language>ko-KR</language>
  ${items}
</channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
