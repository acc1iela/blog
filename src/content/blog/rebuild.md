---
title: 'ブログをAstroで作り直した'
description: 'Next.jsで作ってた個人ブログをAstroで書き直した話'
tags: ['雑記', 'Astro']
publishedAt: 2026-01-11
---

## 作り直した理由

元々 Next.js + Sanity で作っていましたが、正直ブログにはオーバースペックだったと思います。
API ルートもサーバーアクションも使わないし、Sanityの管理画面を開くのも面倒になっていました。

「記事を書く」という本質的な部分に集中したかったのと、前から気になっていた Astro を試してみたかったのが理由です。

## なぜ Astro なのか

静的サイトジェネレーターは色々ありますが、Astro を選んだ理由は主に3つあります。

1. **ゼロ JavaScript がデフォルト**: 必要な部分だけ JS を読み込む設計思想
2. **フレームワーク非依存**: React, Vue, Svelte など好きなものを混在できる
3. **コンテンツファースト**: ブログやドキュメントサイトに特化した機能が充実している

特に「コンテンツファースト」という思想は、ブログを作る上で非常に相性が良いと感じました。

## Astro の主要な機能

### Islands Architecture（部分ハイドレーション）

Astro の最大の特徴とも言えるのが **Islands Architecture** です。

従来の SPA フレームワークでは、ページ全体を JavaScript でハイドレーション（クライアント側で動作可能にする処理）しますが、Astro では**必要な部分だけ**をハイドレーションします。

```astro
---
// サーバーで実行される部分
import Header from '../components/Header.astro';
import SearchBox from '../components/SearchBox.tsx';
import ArticleList from '../components/ArticleList.astro';
---

<!-- 静的なコンポーネント：JS を一切送信しない -->
<Header />

<!-- インタラクティブな部分だけ React でハイドレート -->
<SearchBox client:load />

<!-- こちらも静的 -->
<ArticleList />
```

`client:load` のようなディレクティブで、コンポーネントごとにハイドレーションのタイミングを制御できます。

| ディレクティブ | 動作 |
|--------------|------|
| `client:load` | ページ読み込み時に即座にハイドレーション |
| `client:idle` | ブラウザがアイドル状態になったらハイドレーション |
| `client:visible` | コンポーネントが viewport に入ったらハイドレーション |
| `client:media` | 指定したメディアクエリにマッチしたらハイドレーション |
| `client:only` | サーバーでレンダリングせず、クライアントのみでレンダリング |

このアプローチにより、ブログのようなコンテンツ中心のサイトでは劇的にパフォーマンスが向上します。
実際、このブログでは検索ボックスとダークモード切替以外は完全に静的 HTML として配信されています。

### Content Collections

Astro 2.0 で導入された **Content Collections** は、Markdown/MDX ファイルを型安全に管理できる仕組みです。

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

このスキーマ定義により、以下のメリットがあります。

- **型安全**: frontmatter のプロパティに型がつく
- **バリデーション**: Zod によるランタイム検証で、必須フィールドの漏れや型の不一致を検出
- **自動補完**: エディタで frontmatter のプロパティ名が補完される

以前は frontmatter の typo に気づかず、ビルド後に「あれ、日付が表示されない」となることがありましたが、Content Collections を使えばビルド時にエラーとして検出されます。

### デフォルトで MDX サポート

Astro は `@astrojs/mdx` インテグレーションを追加するだけで MDX をサポートします。

```bash
npx astro add mdx
```

これだけで `.mdx` ファイル内に React/Vue/Svelte コンポーネントを埋め込めるようになります。

```mdx
---
title: 'インタラクティブな記事'
---

import Counter from '../components/Counter.tsx';

## カウンターのデモ

以下のボタンをクリックしてみてください。

<Counter client:visible />

このように、記事の中に動的なコンポーネントを埋め込むことができます。
```

技術ブログでコードのデモを載せたい場合に非常に便利です。ただし、使いすぎると記事の読み込みが重くなるので注意が必要だと思います。

### View Transitions

Astro 3.0 で導入された **View Transitions** は、ページ遷移時のアニメーションを簡単に実現できる機能です。

```astro
---
import { ViewTransitions } from 'astro:transitions';
---

<head>
  <ViewTransitions />
</head>
```

これを `<head>` に追加するだけで、ページ遷移がスムーズなアニメーション付きになります。
SPA のような体験を、MPA（Multi-Page Application）のままで実現できるのは面白いと思います。

さらに、要素ごとにトランジションをカスタマイズすることもできます。

```astro
<header transition:persist>
  <!-- ページ遷移しても維持される -->
</header>

<main transition:animate="slide">
  <!-- スライドアニメーションで遷移 -->
</main>
```

`transition:persist` を使えば、ダークモードの状態やヘッダーの位置などをページ遷移後も維持できます。

### 画像の最適化

Astro には組み込みの画像最適化機能があります。

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.png';
---

<Image src={heroImage} alt="ヒーロー画像" />
```

`<Image>` コンポーネントを使うと、以下の最適化が自動で行われます。

- WebP/AVIF への変換
- 適切なサイズへのリサイズ
- lazy loading の設定
- width/height 属性の自動付与（CLS 防止）

外部 URL の画像も最適化できますが、セキュリティのため `astro.config.mjs` で許可するドメインを指定する必要があります。

## Next.js との比較

せっかくなので、Next.js から移行して感じた違いを整理しておきます。

| 観点 | Next.js | Astro |
|------|---------|-------|
| デフォルトの出力 | JavaScript を含む | 静的 HTML のみ |
| ビルド速度 | 記事が増えると遅くなりがち | 非常に高速 |
| 学習コスト | React の知識が必須 | HTML/CSS だけでも書ける |
| インタラクティブ性 | 全体的に高い | 必要な部分だけ |
| ユースケース | Web アプリ全般 | コンテンツサイト向け |

Next.js が悪いわけではなく、用途が違うという話です。
管理画面やダッシュボードなど、インタラクティブ性が求められるアプリケーションなら Next.js の方が適していると思います。

一方で、ブログやドキュメントサイトのようなコンテンツ中心のサイトでは、Astro の方がシンプルに書けて、パフォーマンスも良いと感じました。

## 現在の構成

最終的な構成は以下のようになりました。

- **Astro 5**: フレームワーク本体
- **Tailwind CSS**: スタイリング（`@astrojs/tailwind` で統合）
- **Content Collections**: 記事の管理（Zod によるスキーマ定義）
- **MDX**: 一部の記事でコンポーネント埋め込み
- **View Transitions**: ページ遷移のアニメーション
- **Vercel**: ホスティング（静的エクスポート）

シンプルな構成ですが、ブログとしては十分だと思います。

## 移行時のハマりポイント

移行作業中にいくつかハマったポイントがあったので共有しておきます。

### 1. Content Collections の設定ファイル名

Astro 5 では、Content Collections の設定ファイル名が変更されました。

```diff
- src/content/config.ts
+ src/content.config.ts
```

古いドキュメントやブログ記事を参考にすると間違える可能性があるので注意が必要です。

### 2. React コンポーネントの拡張子

Astro で React を使う場合、コンポーネントの拡張子は `.tsx` または `.jsx` である必要があります。
`.ts` ファイルで JSX を書いてもエラーになります。

### 3. 相対パスの扱い

Markdown 内の画像パスは、`src/assets/` からの相対パスで書く必要があります。

```markdown
<!-- ❌ うまくいかない -->
![画像](./image.png)

<!-- ✅ 正しい -->
![画像](../../assets/blog/image.png)
```

または、Content Collections の schema で画像を定義する方法もあります。

## まとめ

Next.js から Astro に移行してみて、以下の点が良かったと感じています。

- **シンプルさ**: Markdown ファイルを置くだけで記事になる
- **パフォーマンス**: ゼロ JS がデフォルトなので軽い
- **型安全**: Content Collections による frontmatter の型チェック
- **柔軟性**: 必要な部分だけ React を使える Islands Architecture
- **ビルド速度**: 明らかに速い

もちろん、Astro が全てのユースケースで最適というわけではありません。
複雑な状態管理やリアルタイム性が求められるアプリケーションなら、Next.js や Remix の方が適していると思います。

ただ、ブログのような「コンテンツを届ける」ことが目的のサイトには、Astro は非常に良い選択肢だと感じました。

まだまだ Astro を使いこなせている感は全くないので、もっと勉強していきたいと思います。
