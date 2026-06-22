export const siteConfig = {
  name: "안개비",
  projectName: "rainy-notes",
  description: "개발과 일상을 남기는 개인 기록장",
  longDescription: "개발과 일상을 오래 남기는 개인 기록장입니다.",
  author: "yusunsang",
  url: "https://yusunsang.github.io",
  logo: "/images/site-logo.png",
  ogImage: "/images/og-image.png",
  nav: [
    { href: "/posts/", label: "Posts" },
    { href: "/about/", label: "About" },
  ],
} as const;

export function getPageTitle(title?: string) {
  return title ? `${title} | ${siteConfig.name}` : siteConfig.name;
}
