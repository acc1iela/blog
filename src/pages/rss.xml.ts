import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: 'Accio Blog',
    description: 'Accioの技術ブログ',
    site: context.site!,
    customData: '<managingEditor>acc1iela@gmail.com (Accio)</managingEditor>',
    items: posts
      .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.publishedAt,
        description: post.data.description,
        link: `/blog/${post.id.replace(/\.mdx?$/, '')}/`,
        categories: post.data.tags,
        customData: '<author>acc1iela@gmail.com (Accio)</author>',
      })),
  });
}
