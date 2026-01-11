---
title: 'Hello World - ブログを始めました'
description: 'Astroで技術ブログを新しく作り直しました。このブログでは技術的な学びを発信していきます。'
tags: ['雑記', 'Astro']
publishedAt: 2025-01-11
---

## はじめに

このブログをAstroで新しく作り直しました。以前はNext.jsを使っていましたが、コンテンツサイトにはAstroの方が適していると判断して移行しました。

## なぜAstroを選んだのか

Astroを選んだ理由は主に以下の3つです。

### 1. コンテンツファースト

Astroはコンテンツサイトに特化して設計されています。Content Collectionsという機能で、Markdownファイルを型安全に扱えます。

### 2. パフォーマンス

デフォルトでJavaScriptを一切出力しません。必要な部分だけReactなどのコンポーネントを使えるIslands Architectureを採用しています。

### 3. シンプルさ

`.astro`ファイルの構文はシンプルで、Reactを知っていればすぐに書けます。

```astro
---
// ここがサーバーサイド
const message = 'Hello!';
---

<h1>{message}</h1>
```

## 今後の予定

これから技術的な記事を書いていく予定です。お楽しみに！
