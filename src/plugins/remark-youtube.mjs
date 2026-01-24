import { visit } from 'unist-util-visit';

const YOUTUBE_REGEX = /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;

export function remarkYoutube() {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      // 段落内にリンクが1つだけあるかチェック
      if (node.children.length !== 1) return;

      const child = node.children[0];

      // テキストノードでYouTube URLの場合
      if (child.type === 'text') {
        const match = child.value.match(YOUTUBE_REGEX);
        if (match) {
          const videoId = match[1];
          parent.children[index] = createYoutubeNode(videoId);
        }
      }

      // リンクノードでYouTube URLの場合
      if (child.type === 'link') {
        const match = child.url.match(YOUTUBE_REGEX);
        if (match) {
          const videoId = match[1];
          parent.children[index] = createYoutubeNode(videoId);
        }
      }
    });
  };
}

function createYoutubeNode(videoId) {
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
