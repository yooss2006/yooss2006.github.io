export const siteConfig = {
  name: "안개비",
  projectName: "rainy-notes",
  description: "개발과 일상을 남기는 개인 기록장",
  longDescription: "개발과 일상을 오래 남기는 개인 기록장입니다.",
  author: "yooss2006",
  email: "yoofh2006@gmail.com",
  url: "https://yooss2006.github.io",
  logo: "/images/site-logo.png",
  ogImage: "/images/og-image.png",
  repository: {
    label: "yooss2006/yooss2006.github.io",
    href: "https://github.com/yooss2006/yooss2006.github.io",
  },
  links: {
    email: "https://mail.google.com/mail/?view=cm&fs=1&to=yoofh2006@gmail.com",
    github: "https://github.com/yooss2006",
    rss: "/rss.xml",
  },
  nav: [
    { href: "/posts/", label: "Posts" },
    { href: "/about/", label: "About" },
  ],
} as const;

export function getPageTitle(title?: string) {
  return title ? `${title} | ${siteConfig.name}` : siteConfig.name;
}
