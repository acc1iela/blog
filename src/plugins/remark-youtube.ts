import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text, Link, Html } from 'mdast';

const YOUTUBE_REGEX = /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;

export function remarkYoutube() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (index === undefined || !parent) return;

      // 段落内にリンクが1つだけあるかチェック
      if (node.children.length !== 1) return;

      const child = node.children[0];

      // テキストノードでYouTube URLの場合
      if (child.type === 'text') {
        const textNode = child as Text;
        const match = textNode.value.match(YOUTUBE_REGEX);
        if (match) {
          const videoId = match[1];
          parent.children[index] = createYoutubeNode(videoId);
        }
      }

      // リンクノードでYouTube URLの場合
      if (child.type === 'link') {
        const linkNode = child as Link;
        const match = linkNode.url.match(YOUTUBE_REGEX);
        if (match) {
          const videoId = match[1];
          parent.children[index] = createYoutubeNode(videoId);
        }
      }
    });
  };
}

function createYoutubeNode(videoId: string): Html {
  return {
    type: 'html',
    value: `<div class="youtube-embed">
  <iframe
    src="https://www.youtube.com/embed/${videoId}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
  ></iframe>
</div>`,
  };
}

export default remarkYoutube;
