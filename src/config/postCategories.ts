export const postCategoryLabels = ["개발", "일상", "메모"] as const;

export type PostCategory = (typeof postCategoryLabels)[number];

export const postCategories = [
  { label: "개발", value: "dev" },
  { label: "일상", value: "daily" },
  { label: "메모", value: "memo" },
] as const satisfies readonly { readonly label: PostCategory; readonly value: string }[];

export type PostCategoryValue = (typeof postCategories)[number]["value"];
