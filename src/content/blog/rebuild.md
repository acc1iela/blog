---
title: 'ブログをAstroで作り直した'
description: 'Next.jsで作ってた個人ブログをAstroで書き直した話'
tags: ['雑記', 'Astro']
publishedAt: 2026-01-11
---

## 作り直した理由

元々Next.js + Sanityで作ってましたが、正直ブログにはオーバースペックだったと思います。
APIルートもサーバーアクションも使わないし、Sanityの管理画面を開くのも面倒になってました。

前から気になってたAstroを試してみようと。

## Astro の良いところ

### Markdown をそのまま記事にできる

`src/content/blog/` にmdファイルを置くだけで記事になります。
CMSにログインして記事書いて...みたいな手間がない。エディタで書いてpushすれば終わりです。

### 必要なところだけ React が使える

基本は静的HTMLを吐くだけなんですが、検索ボックスとかダークモード切替みたいな
インタラクティブな部分だけReactコンポーネントを使えます。

```astro
<!-- 静的な部分はそのまま -->
<Header />

<!-- ここだけReactでハイドレート -->
<SearchBox client:load />
```

### ビルドが爆速

Next.jsより明らかに速いと思います。記事増えてもそんなに変わらなそうです。

## 構成

- Astro 5
- Tailwind CSS
- Content Collections（Markdown 管理）
- Vercel にデプロイ

シンプルで気に入ってる。
けどAstro使いこなせてる感は全くないのでもっとちゃんと勉強しなくては
