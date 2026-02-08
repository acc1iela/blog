import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';
import remarkYoutube from './src/plugins/remark-youtube.mjs';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      configFile: './tailwind.config.mjs',
    }),
    mdx(),
    sitemap(),
  ],
  site: 'https://acc1iela-blog.dev',
  markdown: {
    remarkPlugins: [remarkYoutube],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['noopener', 'noreferrer'],
        },
      ],
    ],
  },
});
