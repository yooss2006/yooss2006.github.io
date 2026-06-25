import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { postCategoryLabels } from "@/config/postCategories";

const postDate = z.coerce
  .date()
  .refine((date) => !Number.isNaN(date.valueOf()), "날짜는 YYYY-MM-DD 형식으로 입력합니다.");

const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/*.{md,mdx}" }),
  // slug is derived from the file path, e.g. src/content/posts/first-note.md -> first-note.
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    publishedAt: postDate,
    updatedAt: postDate.optional(),
    category: z.enum(postCategoryLabels),
    tags: z.array(z.string().trim().min(1)).default([]),
    thumbnail: z.string().trim().startsWith("/").optional(),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    eyebrow: z.string().trim().min(1).optional(),
  }),
});

export const collections = { pages, posts };
