---
title: 'Union型と判別可能ユニオンを使いこなしたい'
description: 'TypeScriptの判別可能ユニオン（Discriminated Union）で型安全なコードを書く方法'
tags: ['TypeScript']
publishedAt: 2026-01-14
---

## そもそも Union 型とは

TypeScriptを使っていると複数の型をまとめる **Union 型（共用体）** にお世話になることは多いと思います。
ただ、単に型を`|`で繋げただけでは型の絞り込み（Type Narrowing）がうまくいかずコードが冗長になったり予期せぬバグを生んだりすることがあります。

そこで登場するのが、**判別可能ユニオン（Discriminated Union）**。
この記事では通常のUnion型で起こりがちな問題とそれを判別可能ユニオンでどう解決するかそしてその強力なメリットについて解説したいと思います。

## 単純なUnion型の落とし穴

例えば、非同期処理の状態管理を考えてみましょう。
「読み込み中」「成功」「失敗」の3つの状態を持つオブジェクトを定義したい場合です。

まずは直感的に書いてしまいがちな「悪い例」です。

```typescript
type State = {
  status: 'loading' | 'success' | 'error';
  data?: User;
  error?: Error;
};
```

この定義でも動くには動きますが、大きな問題があります。
**「不正な状態」を許容してしまう**ことです。

例えば、以下のようなオブジェクトも型定義上は「正しい」ことになってしまいます。

```typescript
// statusは 'loading' なのに data がある？
const invalidState1: State = {
  status: 'loading',
  data: { id: 1, name: 'Alice' },
};

// statusは'success'なのにdataがない？
const invalidState2: State = {
  status: 'success',
  // dataプロパティが欠落していてもdata?なのでエラーにならない...
};
```

また、この型を使う側でも毎回プロパティの存在チェックが必要になります。

```typescript
function render(state: State) {
  if (state.status === 'success') {
    // state.dataはundefinedの可能性があるので、?.や!が必要になる...
    console.log(state.data?.name);
  }
}
```

これではTypeScriptの恩恵を十分に受けられていないと思います。

## 判別可能ユニオン（Discriminated Union）の登場

この問題を解決するのが**判別可能ユニオン**です。

判別可能ユニオンとは **「共通のリテラル型プロパティ（ディスクリミネータ）」を持つオブジェクト型の Union** のことです。

先ほどの例をリファクタリングしてみましょう。

```typescript
type LoadingState = {
  status: 'loading';
};

type SuccessState = {
  status: 'success';
  data: User;
};

type ErrorState = {
  status: 'error';
  error: Error;
};

// これらを Union でまとめる
type State = LoadingState | SuccessState | ErrorState;
```

ここでのポイントは以下の2点です。

1. 各状態を個別の型として定義したこと
2. 全ての型に共通の `status` プロパティ（ディスクリミネータ）を持たせ、それぞれ固有のリテラル型（`'loading'`, `'success'`, `'error'`）を割り当てたこと

## なぜこれが嬉しいのか？（Type Narrowing）

判別可能ユニオンを使う最大のメリットは、**制御フロー解析（Control Flow Analysis）による型の絞り込み**が効くこと。

`if` 文や`switch`文で`status`をチェックするとTypeScriptは自動的にそのブロック内での型を特定してくれます。

```typescript
function render(state: State) {
  if (state.status === 'loading') {
    // ここでは state は LoadingState 型として扱われる
    console.log('Loading...');
  } else if (state.status === 'success') {
    // ここでは state は SuccessState 型として扱われる
    // そのため、data プロパティには確実にアクセスできる（? や ! は不要！）
    console.log(`Hello, ${state.data.name}`);
  } else {
    // ここでは state は ErrorState 型
    console.error(state.error.message);
  }
}
```

このように、`status`が`'success'`であることが確定した時点で`data`プロパティが存在することが保証されます。
逆に`status`が`'loading'`のときに`data`にアクセスしようとするとコンパイルエラーになります。

これが「不正な状態を型レベルで防ぐ」ということになります。

## 実践的なユースケース：状態管理とドメインモデル

判別可能ユニオンは、単なるエラーハンドリングだけでなく、アプリケーションの状態管理やドメインモデリングでかなり役立つのではなかなと思います。

### 1. 画面の UI 状態管理

画面の描画状態を管理する際、`isLoading`や`isError`といった複数のフラグで管理しようとすると組み合わせの爆発が起き、あり得ない状態（ロード中かつエラー、など）が発生しがちです。

```typescript
// ❌ 悪い例：複数のフラグで管理
type UIState = {
  isLoading: boolean;
  isError: boolean;
  data?: User;
  error?: Error;
};
// isLoading: true, isError: true みたいな矛盾した状態が作れてしまう
```

これを判別可能ユニオンで定義すれば、状態は常に一つであることが保証される。

```typescript
// ✅ 良い例：状態をユニオンで定義
type UIState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };
```

### 2. ドメインモデル：決済方法

ECサイトなどで、決済方法によって必要な情報が異なるケースも綺麗に表現できると思います。

```typescript
type CreditCard = {
  method: 'credit-card';
  cardNumber: string;
  cvc: string;
  expirationDate: string;
};

type BankTransfer = {
  method: 'bank-transfer';
  bankCode: string;
  branchCode: string;
  accountNumber: string;
};

type PayPal = {
  method: 'paypal';
  email: string;
};

type PaymentMethod = CreditCard | BankTransfer | PayPal;

function processPayment(payment: PaymentMethod) {
  switch (payment.method) {
    case 'credit-card':
      // payment は CreditCard 型
      sendToPaymentGateway(payment.cardNumber);
      break;
    case 'bank-transfer':
      // payment は BankTransfer 型
      showBankInfo(payment.bankCode);
      break;
    case 'paypal':
      // payment は PayPal 型
      redirectToPayPal(payment.email);
      break;
  }
}
```

## 深掘り：Optional Property (`?`) の危険性

TypeScript初心者がやりがちなのがとりあえず`?`をつけてOptional Propertyにしてしまうことです。
これは多くの場合**「あり得ない状態」**を生み出す温床になります。

### なぜ `?` は危険なのか

例えば、ユーザーの設定情報を表す型を考えてみましょう。
「通知設定がONの場合は、通知先のメールアドレスが必須」という仕様があるとします。

```typescript
// ❌ 危険な定義
type UserSettings = {
  notificationsEnabled: boolean;
  notificationEmail?: string; // ONのとき必須なのに、型上は省略可能...
};
```

この定義では、以下のバグを許容してしまいます。

1.  `notificationsEnabled: true` なのに `notificationEmail` が `undefined`
2.  `notificationsEnabled: false` なのに `notificationEmail` が入っている（これはバグではないかもしれないが、データの整合性としては不自然だと思います）

### ユニオン型による解決

これを判別可能ユニオンで書き直すと仕様を型定義に直接落とし込むことができます。

```typescript
// ✅ 安全な定義
type NotificationsOn = {
  enabled: true;
  email: string; // 必須！
};

type NotificationsOff = {
  enabled: false;
};

type UserSettings = NotificationsOn | NotificationsOff;

// 使用例
const settings: UserSettings = {
  enabled: true,
  // email: 'test@example.com' // これを書き忘れるとコンパイルエラーになる！
};
```

このように**「値の組み合わせ」に制約を持たせる**ことができるのがユニオン型の強みです。
単にプロパティをオプショナルにする前に「それは本当に独立して存在できる値なのか？それとも他の値と連動しているのか？」を考える癖をつけると堅牢な設計になります。

### 3. API レスポンスのハンドリング

APIの結果を`Result`型として定義する場合によく使われる例です。

```typescript
type Success<T> = { type: 'ok'; value: T };
type Failure = { type: 'error'; error: Error };

type Result<T> = Success<T> | Failure;

function handleResult(result: Result<User>) {
  if (result.type === 'ok') {
    console.log(result.value);
  } else {
    console.error(result.error);
  }
}
```

### 4. Reducer のアクション（Redux / useReducer）

ReduxやReactの`useReducer`を使う際のアクション定義はまさに判別可能ユニオンの教科書的な例だと思います。

```typescript
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_VALUE'; payload: number };

function reducer(state: number, action: Action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    case 'SET_VALUE':
      // typeが 'SET_VALUE' のときだけ payload にアクセスできる
      return action.payload;
  }
}
```

## TypeScript 5.x と `satisfies`

TypeScript 4.9 (5.x 系でも重要) で導入された `satisfies` オペレーターを使うとユニオン型をより柔軟に扱えます。

例えば、設定オブジェクトで「キーは決まっているが、値は文字列か RGB 配列のどちらか」というケースです。

```typescript
type Color = string | readonly [number, number, number];

type ThemeConfig = {
  primary: Color;
  secondary: Color;
};

const theme = {
  primary: 'blue',
  secondary: [255, 255, 255] as const,
} satisfies ThemeConfig;

console.log(theme.primary.toUpperCase());
console.log(theme.secondary[0]);
```

注意点として配列リテラルは `as const` を付けないと `number[]` にワイドニングされてしまいます。
タプル型として推論させたい場合は `as const` を明示的に付ける必要があります。

もし `const theme: ThemeConfig = ...` と型注釈を書いてしまうと`theme.primary`は `string | readonly [number, number, number]` 型にワイドニング（広げられて）されてしまい`toUpperCase()`を呼ぶ前に型チェックが必要になってしまいます。`satisfies`はこの問題を解決します。

## 現代技術との接続：ZodとRSC

判別可能ユニオンは最新のライブラリやフレームワークとも相性抜群だと思います。

### Zod によるランタイム型チェック

外部からの入力（APIレスポンスやフォーム入力）を判別可能ユニオンとして検証するには[Zod](https://zod.dev/)の `z.discriminatedUnion` が便利です。

```typescript
import { z } from 'zod';

const LoadingState = z.object({ status: z.literal('loading') });
const SuccessState = z.object({ status: z.literal('success'), data: z.string() });
const ErrorState = z.object({
  status: z.literal('error'),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
  }),
});

const StateSchema = z.discriminatedUnion('status', [LoadingState, SuccessState, ErrorState]);

// 実行時にデータを検証し、型安全なオブジェクトを返す
const result = StateSchema.safeParse(apiResponse);
if (result.success) {
  const state = result.data; // ここで state は判別可能ユニオン型になる
}
```

注意点としてAPIレスポンスなどの外部入力はプレーンなJSONで来るため`z.instanceof(Error)`のようなクラスインスタンスのチェックは通常使えないと思います。
上記のようにシリアライズ可能なオブジェクト構造で定義するのが実務的かなと思います。

### React Server Components (RSC)

Next.jsなどのRSCではServer Actionからクライアントに結果を返す際に判別可能ユニオンが役立つと思います。

```typescript
// server-action.ts
'use server';

type ActionState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; errors: Record<string, string[]> };

export async function submitForm(prevState: ActionState, formData: FormData): Promise<ActionState> {
  // ...処理...
  if (error) {
    return { status: 'error', errors: validationErrors };
  }
  return { status: 'success', message: '送信しました' };
}
```

クライアント側では `status` をチェックするだけでエラー表示や成功メッセージの表示を安全に分岐できると思います。

## 応用：網羅性チェック（Exhaustiveness Checking）

判別可能ユニオンと `switch` 文を組み合わせる際、  **「全てのパターンを網羅しているか」** をコンパイラにチェックさせることができます。
これには `never` 型を利用しましょう。

```typescript
function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x);
}

function render(state: State) {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Hello ${state.data.name}`;
    case 'error':
      return `Error: ${state.error.message}`;
    default:
      // もし将来 State に新しい型（例: 'idle'）が追加された場合、
      // ここで型エラーが発生するようになります。
      return assertNever(state);
  }
}
```

`default`節で`state`を`never`型に代入しようとすることで、もし`case`の漏れがあれば`state`が`never`にならず（残りの型になるため）、コンパイルエラーが発生する。
これで将来的な仕様変更によるバグを未然に防げます。

## まとめ

- 単純なUnion型ではなく、**判別可能ユニオン（Discriminated Union）**を使う
- 共通のプロパティ（ディスクリミネータ）を持たせることで TypeScript が型を自動的に絞り込んでくれる
- これにより、`?`や`as`を使わずに安全にプロパティにアクセスでき、バグを減らせる
- `never`型を使った網羅性チェックを導入すれば、保守性もさらに向上する

型定義を少し工夫するだけで、コードの安全性と可読性は劇的に向上します。
自分もまだまだ理解が甘い部分がありますが日々の勉強で少しずつ理解を深めていきたいと思います。
