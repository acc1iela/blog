---
title: 'ブログをAstroで作り直した'
description: 'Next.jsで作ってた個人ブログをAstroで書き直した話'
tags: ['雑記', 'Astro']
publishedAt: 2025-01-11
---

## 作り直した理由

元々 Next.js + Sanity で作ってたんだけど、正直ブログにはオーバースペックだった。
API ルートもサーバーアクションも使わないし、Sanity の管理画面を開くのも面倒になってた。

で、前から気になってた Astro を試してみたら、これがちょうど良かった。

## Astro の良いところ

### Markdown をそのまま記事にできる

`src/content/blog/` に md ファイルを置くだけで記事になる。
CMS にログインして記事書いて...みたいな手間がない。VSCode で書いて push すれば終わり。

### 必要なところだけ React が使える

基本は静的 HTML を吐くだけなんだけど、検索ボックスとかダークモード切替みたいな
インタラクティブな部分だけ React コンポーネントを使える。

```astro
<!-- 静的な部分はそのまま -->
<Header />

<!-- ここだけReactでハイドレート -->
<SearchBox client:load />
```

### ビルドが爆速

Next.js より明らかに速い。記事増えてもそんなに変わらなそう。

## 構成

- Astro 5
- Tailwind CSS
- Content Collections（Markdown 管理）
- Vercel にデプロイ

シンプルで気に入ってる。
