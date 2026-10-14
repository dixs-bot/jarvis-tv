import type { Category, CategoryId } from "@/types";

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  news: "News",
  entertainment: "Entertainment",
  sports: "Sports",
  movies: "Movies",
  kids: "Kids",
  music: "Music",
  religious: "Religious",
  other: "Other",
};

/** Maps a raw playlist `group-title` (may be `;` separated) to one of our categories. */
export function mapGroupToCategory(group: string): CategoryId {
  const g = group.toLowerCase();
  if (/news|business|weather/.test(g)) return "news";
  if (/sport/.test(g)) return "sports";
  if (/movie|film|classic|series/.test(g)) return "movies";
  if (/kid|animation|family/.test(g)) return "kids";
  if (/music/.test(g)) return "music";
  if (/relig/.test(g)) return "religious";
  if (/entertain|general|comedy|lifestyle|culture|documentary|cooking|travel|auto|outdoor|shop|public|legislative|interactive/.test(g))
    return "entertainment";
  return "other";
}

export function buildCategories(present: Set<CategoryId>, order: CategoryId[], disabled: CategoryId[]): Category[] {
  const ids = [...order, ...(Object.keys(CATEGORY_LABELS) as CategoryId[])].filter(
    (id, i, arr) => arr.indexOf(id) === i,
  );
  return ids
    .filter((id) => present.has(id) && !disabled.includes(id))
    .map((id) => ({ id, label: CATEGORY_LABELS[id] }));
}
