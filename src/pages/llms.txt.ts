import { siteConfig } from "@/config/site";
import { getPublishedPosts, getPostSlug } from "@/lib/posts";

const siteUrl = new URL(siteConfig.url);

function markdownText(value: string) {
  return value.replaceAll("\n", " ").replaceAll("[", "\\[").replaceAll("]", "\\]");
}

function markdownLink(label: string, path: string, description: string) {
  const url = new URL(path, siteUrl).toString();

  return `- [${markdownText(label)}](${url}): ${markdownText(description)}`;
}

export async function GET() {
  const posts = await getPublishedPosts();
  const postLinks = posts
    .map((post) =>
      markdownLink(post.data.title, `/posts/${getPostSlug(post)}/`, post.data.description),
    )
    .join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.longDescription} 글이 중심이고, 비와 소리는 배경인 미니멀한 정적 블로그입니다.

이 사이트는 한국어 개인 블로그입니다. 공개 글만 참고 대상으로 보며, 초안 글과 빌드되지 않은 콘텐츠는 제외합니다.

## Site

${markdownLink("Home", "/", siteConfig.description)}
${markdownLink("Posts", "/posts/", "전체 글 목록")}
${markdownLink("About", "/about/", "블로그와 작성자 소개")}

## Posts

${postLinks}

## Optional

${markdownLink("RSS", "/rss.xml", "최신 글 피드")}
${markdownLink("Sitemap", "/sitemap.xml", "공개 URL 목록")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
