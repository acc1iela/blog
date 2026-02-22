---
title: 'React18 → 19移行ガイド：何が変わって、何に気をつけるか'
description: 'React19で追加・削除された機能を整理し、v18からの移行で気をつけるべきポイントをまとめた実践ガイド'
tags: ['React', 'TypeScript', 'フロントエンド']
publishedAt: 2026-02-23
draft: true
---

## はじめに

React v18からv19への移行は破壊的変更は少ないと言われているが、廃止されたAPIや新しいパターンを把握しておかないと地味にハマる箇所がある。

本記事では、v18との差分を中心に何が変わり、何に注意すべきかを整理する。

---

## 1. React Compiler（自動メモ化）

### 何が変わるか

**React Compiler**（旧称: React Forget）は、React19と同時期に安定版としてリリースされた別個のオプトインツール。React17/18でも動作するが、React19での使用が最適とされている。コンパイル時に自動でメモ化を行うため、以下を手書きするケースが激減する見込み。

```tsx
// v18 まではこういうのを書く必要があった
const expensiveValue = useMemo(() => compute(a, b), [a, b]);
const handleClick = useCallback(() => doSomething(id), [id]);
const MemoChild = memo(Child);
```

Compiler が有効な環境では、これらを書かなくても同等の最適化が適用される。

### 注意点

- React Compilerはオプトイン（まず Babel/SWC プラグインの導入が必要）
- `eslint-plugin-react-hooks` との組み合わせで不要な、`useMemo` を警告してくれるモードも来る予定
- 既存コードを一斉削除しない。まずCompilerなしで動かし、安定したら整理する

---

## 2. Actions と新しい hooks

非同期のミューテーション（フォーム送信・APIコールなど）を扱うパターンが整備された。

### `useActionState`（旧 `useFormState`）

```tsx
// v18 Canary（react-domのuseFormState）
const [state, dispatch] = useFormState(action, initialState);

// v19
import { useActionState } from 'react';
const [state, dispatch, isPending] = useActionState(action, initialState);
```

`isPending` が第3戻り値として直接得られるのが便利。`useFormState` は**非推奨**になったので、段階的に移行すること。

### `useFormStatus`

フォームの送信状態を子コンポーネントから参照できる。

```tsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>送信</button>;
}
```

### `useOptimistic`

非同期処理中に「楽観的更新」を表現する hook。

```tsx
const [optimisticList, addOptimistic] = useOptimistic(list, (state, newItem) => [
  ...state,
  newItem,
]);
```

---

## 3. `ref` が普通の prop に

`forwardRef` が不要になった。

```tsx
// v18
const Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} {...props} />);

// v19：ref を普通の prop として受け取るだけでいい
function Input({ ref, ...props }: Props & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

また、ref コールバックが **クリーンアップ関数を返せる** ようになった。

```tsx
<div
  ref={(node) => {
    // マウント時の処理
    return () => {
      // アンマウント時の処理
    };
  }}
/>
```

### 注意点

- `forwardRef`は非推奨（v19 でも動くが将来削除される）
- TypeScript の型定義も変わるので、型エラーが出たら `@types/react` のバージョンを確認する

---

## 4. `use` hook

条件分岐の中でも呼べる特殊なhook。PromiseとContextを受け取ることができる。

```tsx
import { use } from 'react';

// Contextを条件付きで読む（他のhooksでは NG）
function Component({ shouldRead }: { shouldRead: boolean }) {
  if (shouldRead) {
    const value = use(MyContext);
  }
}

// Promiseを「待つ」（Suspense と組み合わせて使う）
function UserCard({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspenseがフォールバックを表示
  return <div>{user.name}</div>;
}
```

### 注意点

- Promise を `use()` する場合は **必ず Suspense でラップ** すること
- コンポーネント内で毎回 `new Promise()` を渡さない（再レンダリングのたびに新しい Promise が生成される）

---

## 5. Document Metadata のネイティブサポート

`<title>`、`<meta>`、`<link>` をコンポーネントの中に書くと、React が自動で `<head>` に移動してくれる。

```tsx
function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

### 注意点

- `react-helmet`を使っていた場合は競合する可能性がある
- Next.jsなど、メタデータ管理を独自に行うフレームワークではフレームワーク側のAPIを引き続き使うのが安全

---

## 6. 削除された API（破壊的変更）

v18で非推奨になっていたものがv19で完全削除された。

| 削除された API                       | 移行先                           |
| ------------------------------------ | -------------------------------- |
| `ReactDOM.render`                    | `ReactDOM.createRoot().render()` |
| `ReactDOM.hydrate`                   | `ReactDOM.hydrateRoot()`         |
| `ReactDOM.unmountComponentAtNode`    | `root.unmount()`                 |
| `ReactDOM.findDOMNode`               | DOM refs                         |
| `renderToNodeStream`                 | `renderToPipeableStream`         |
| String refs（`ref="myRef"`）         | コールバック ref / `useRef`      |
| `defaultProps`（関数コンポーネント） | デフォルト引数                   |
| `contextTypes` / `getChildContext`   | `React.createContext`            |
| `React.createFactory`                | JSX                              |

### 注意点

- `ReactDOM.render` を直接使っているコードはビルドが通らなくなる
- サードパーティライブラリが内部で使っている場合もあるので、依存関係を確認する

```bash
npm ls react-dom
```

---

## 移行チェックリスト

```
□ React / react-dom を 19.x に更新
□ @types/react を 19.x に更新
□ ReactDOM.render → createRoot に移行済み
□ useFormState → useActionState にリネーム
□ forwardRef → 通常の prop（ref）に移行（急がなくてもOK）
□ react-helmet / next/head の扱いを確認
□ React Compiler の導入可否を検討（任意）
□ 既存テストが通ることを確認
```

公式のcodemodを使うと機械的にやれる部分を一括変換できる。

```bash
npx codemod@latest react/19/migration-recipe
```

---

## まとめ

React19の変更は大きく2軸。

1. ボイラープレートの削減（`forwardRef`、`useMemo`、`useFormState` → より簡潔に）
2. 非同期・フォームパターンの整備（Actions、`use` hook、`useOptimistic`）

破壊的変更は主に「v18で既に非推奨だったもの」なので、v18で警告を潰してきたプロジェクトなら移行コストは低い。一方、古いコードベースでは `ReactDOM.render`やString refsがまだ残っているケースもあるので、まずcodemodを当てて確認するのが堅実な進め方。
