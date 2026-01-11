---
title: 'React Hooksで気をつけたいこと'
description: 'React Hooksを使う上で知っておきたいTipsとベストプラクティスをまとめました。'
tags: ['React', 'TypeScript']
publishedAt: 2025-01-10
---

## はじめに

React Hooksは便利ですが、正しく使わないとパフォーマンス問題やバグの原因になります。この記事では実際の開発で役立つTipsを紹介します。

## useEffectの依存配列

`useEffect`の依存配列は正確に指定することが重要です。

```typescript
// Bad: 依存配列が空だとuserIdの変更を検知できない
useEffect(() => {
  fetchUser(userId);
}, []);

// Good: userIdを依存配列に含める
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

## useCallbackとuseMemo

不要な再レンダリングを防ぐために`useCallback`と`useMemo`を使いますが、使いすぎも良くありません。

### 使うべき場面

- コンポーネントに渡すコールバック関数
- 重い計算処理の結果

### 使わなくて良い場面

- プリミティブな値
- 軽い処理

## カスタムフック

ロジックの再利用にはカスタムフックが便利です。

```typescript
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle] as const;
}
```

## まとめ

Hooksは強力なツールですが、基本を理解して使うことが大切です。
