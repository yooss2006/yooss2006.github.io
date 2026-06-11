import { getCollection, type CollectionEntry } from "astro:content";

export type PostEntry = CollectionEntry<"posts">;

export function getPostSlug(post: PostEntry) {
  return post.id;
}

export function isPublishedPost(post: PostEntry) {
  return !post.data.draft;
}

export async function getPublishedPosts() {
  const posts = await getCollection("posts");

  return posts
    .filter(isPublishedPost)
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export async function getRecentPosts(limit = 5) {
  const posts = await getPublishedPosts();

  return posts.slice(0, limit);
}

export function formatPostDate(date: Date) {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
