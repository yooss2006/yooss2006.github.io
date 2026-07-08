import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import type { APIRoute } from "astro";
import satori from "satori";
import { html } from "satori-html";
import { siteConfig } from "@/config/site";
import { formatPostDate, getPublishedPosts, getPostSlug, type PostEntry } from "@/lib/posts";

const cardSize = { width: 1200, height: 630 } as const;
const colors = {
  accent: "#d1a15f",
  accentGlow: "rgba(209, 161, 95, 0.12)",
  background: "#121315",
  backgroundSoft: "#191c1f",
  border: "rgba(246, 241, 232, 0.12)",
  glow: "rgba(200, 220, 225, 0.16)",
  link: "#c8dce1",
  linkSoft: "rgba(200, 220, 225, 0.38)",
  rain: "rgba(240, 237, 231, 0.09)",
  text: "#f0ede7",
  textMuted: "#bdb7ac",
  textSubtle: "#8e8a82",
} as const;
const fontFiles = {
  heading: join(process.cwd(), "public/fonts/Paperlogy-9Black.ttf"),
  sans: join(process.cwd(), "public/fonts/Paperlogy-7Bold.ttf"),
} as const;
const fontData = Promise.all([
  readFile(fontFiles.heading),
  readFile(fontFiles.sans),
]);

type OgImageProps = {
  readonly post: PostEntry;
};

type TextGroup = {
  readonly color: string;
  readonly family: "Paperlogy" | "PaperlogyBody";
  readonly lineHeight: number;
  readonly lines: readonly string[];
  readonly size: number;
  readonly weight: number;
  readonly x: number;
  readonly y: number;
};

export async function getStaticPaths() {
  const posts = await getPublishedPosts();

  return posts.map((post) => ({
    params: { slug: getPostSlug(post) },
    props: { post },
  }));
}

export const GET = (async ({ props }) => {
  const png = await renderOgImage(props.post);

  return new Response(new Uint8Array(png), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
}) satisfies APIRoute<OgImageProps>;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function truncateLine(value: string, maxLength: number) {
  const chars = Array.from(value);

  if (chars.length <= maxLength) {
    return value;
  }

  return `${chars.slice(0, Math.max(0, maxLength - 3)).join("")}...`;
}

function textLength(value: string) {
  return Array.from(value).length;
}

function splitWord(word: string, maxLength: number) {
  const chars = Array.from(word);
  const parts: string[] = [];

  for (let start = 0; start < chars.length; start += maxLength) {
    parts.push(chars.slice(start, start + maxLength).join(""));
  }

  return parts;
}

function wrapText(value: string, maxLength: number, maxLines: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const words = normalized.split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    for (const part of splitWord(word, maxLength)) {
      const next = current ? `${current} ${part}` : part;

      if (textLength(next) <= maxLength) {
        current = next;
        continue;
      }

      lines.push(current);
      current = part;
    }
  }

  if (current) {
    lines.push(current);
  }

  const wrappedLines = lines.slice(0, maxLines);
  if (wrappedLines.join(" ") !== normalized) {
    const lastLine = wrappedLines.pop() ?? "";
    wrappedLines.push(truncateLine(lastLine, maxLength));
  }

  return wrappedLines;
}

function renderTextGroup(group: TextGroup) {
  return group.lines
    .map((line, index) => {
      const top = group.y + index * group.lineHeight;

      return `<div style="display:flex; position:absolute; left:${group.x}px; top:${top}px; width:720px; color:${group.color}; font-family:${group.family}; font-size:${group.size}px; font-weight:${group.weight}; line-height:${group.lineHeight}px; letter-spacing:0;">${escapeHtml(line)}</div>`;
    })
    .join("");
}

function renderRule(left: number, top: number, width: number, height: number, color: string) {
  return `<div style="display:flex; position:absolute; left:${left}px; top:${top}px; width:${width}px; height:${height}px; border-radius:${height / 2}px; background-color:${color};"></div>`;
}

function renderTags(tags: readonly string[]) {
  const visibleTags = tags.slice(0, 3);

  if (visibleTags.length === 0) {
    return siteConfig.projectName;
  }

  return visibleTags.map((tag) => `#${tag}`).join(" ");
}

async function renderOgImage(post: PostEntry) {
  const [headingFont, sansFont] = await fontData;
  const titleLines = wrapText(post.data.title, 17, 2);
  const descriptionLines = wrapText(post.data.description, 31, 2);
  const tagLine = renderTags(post.data.tags);
  const date = formatPostDate(post.data.publishedAt);
  const markup = `<div style="display:flex; position:relative; width:${cardSize.width}px; height:${cardSize.height}px; overflow:hidden; background-color:${colors.background};">
  <div style="display:flex; position:absolute; left:64px; top:64px; width:1072px; height:502px; border:1px solid ${colors.border}; border-radius:28px; background-color:${colors.backgroundSoft};"></div>
  <div style="display:flex; position:absolute; left:856px; top:-64px; width:360px; height:360px; border-radius:180px; background-color:${colors.glow};"></div>
  <div style="display:flex; position:absolute; left:980px; top:52px; width:268px; height:268px; border-radius:134px; background-color:${colors.accentGlow};"></div>
  <div style="display:flex; position:absolute; left:768px; top:118px; width:324px; height:350px; border:1px solid ${colors.border}; border-radius:48px; background-color:rgba(18, 19, 21, 0.72);"></div>
  ${renderRule(806, 170, 248, 12, colors.linkSoft)}
  ${renderRule(806, 228, 248, 12, colors.linkSoft)}
  ${renderRule(806, 286, 176, 12, colors.linkSoft)}
  ${renderRule(806, 344, 216, 12, colors.linkSoft)}
  ${renderRule(740, 130, 4, 360, colors.rain)}
  ${renderRule(822, 110, 4, 396, colors.rain)}
  ${renderRule(944, 126, 4, 344, colors.rain)}
  ${renderRule(1034, 174, 4, 282, colors.rain)}
  <div style="display:flex; position:absolute; left:100px; top:100px; color:${colors.accent}; font-family:PaperlogyBody; font-size:28px; font-weight:700; line-height:32px; letter-spacing:0;">${escapeHtml(siteConfig.name)} · ${escapeHtml(post.data.category)}</div>
  ${renderTextGroup({
    color: colors.text,
    family: "Paperlogy",
    lineHeight: 74,
    lines: titleLines,
    size: 58,
    weight: 900,
    x: 100,
    y: 166,
  })}
  ${renderTextGroup({
    color: colors.textMuted,
    family: "PaperlogyBody",
    lineHeight: 40,
    lines: descriptionLines,
    size: 30,
    weight: 700,
    x: 104,
    y: 340,
  })}
  <div style="display:flex; position:absolute; left:104px; top:468px; color:${colors.textSubtle}; font-family:PaperlogyBody; font-size:25px; font-weight:700; line-height:32px; letter-spacing:0;">${escapeHtml(date)} · ${escapeHtml(tagLine)}</div>
  <div style="display:flex; position:absolute; left:104px; top:512px; color:${colors.link}; font-family:PaperlogyBody; font-size:25px; font-weight:700; line-height:32px; letter-spacing:0;">${escapeHtml(siteConfig.url.replace("https://", ""))}</div>
</div>`;
  const svg = await satori(html(markup), {
    embedFont: true,
    fonts: [
      { data: headingFont, lang: "ko-KR", name: "Paperlogy", style: "normal", weight: 900 },
      { data: sansFont, lang: "ko-KR", name: "PaperlogyBody", style: "normal", weight: 700 },
    ],
    height: cardSize.height,
    width: cardSize.width,
  });

  return new Resvg(svg, {
    font: {
      loadSystemFonts: false,
    },
  })
    .render()
    .asPng();
}
