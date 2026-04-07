import type { CollectionEntry } from 'astro:content';

export function getSlug(post: CollectionEntry<'blog'>): string {
  return post.id.replace(/\.mdx?$/, '');
}

export function sortByDate(
  posts: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] {
  return [...posts].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
}

export function getAllTags(posts: CollectionEntry<'blog'>[]): string[] {
  return [...new Set(posts.flatMap((post) => post.data.tags))].sort();
}
