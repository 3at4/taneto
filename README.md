# タネト (Taneto) プロジェクト

**種と、人。そして未来へ。**

## プロジェクト概要

このリポジトリは、男性向け妊活支援アプリ「タネト」の開発プロジェクトです。包括的な企画文書と実装されたNext.jsアプリケーションを含んでいます。

## 構成

```
taneto-pj/
├── docs/                  # プロジェクト文書
│   ├── prd.md            # 製品要求仕様書
│   ├── solution.md       # 技術的解決策分析
│   ├── painSurvey.md     # ユーザーペイン調査
│   └── report.md         # 市場調査・競合分析
├── taneto-app/           # Next.jsアプリケーション
└── CLAUDE.md            # 開発ガイダンス
```

## アプリケーション

実装されたアプリケーションは `taneto-app/` ディレクトリにあります。

### 実行方法

```bash
cd taneto-app
npm install
npm run dev
```

### 主要機能
- エモーショナル・オンボーディング
- AI問いかけ型ジャーナリング
- 庭の比喩による状態可視化
- プライバシー重視のローカルストレージ

詳細は `taneto-app/README.md` をご覧ください。

## デプロイと環境設定 (Deployment and Environment Setup)

このプロジェクトはFirebase Hosting (Next.jsアプリ) と Cloud Functions (バックエンド) を利用します。以下の手順で環境設定を行ってください。

### 1. Firebaseコンソールの設定

**ステップ1: Firebaseプロジェクトの作成**
1.  [Firebaseコンソール](https://console.firebase.google.com/)にアクセスします。
2.  「プロジェクトを追加」をクリックし、新しいプロジェクトを作成します（例: `taneto-pj`）。
3.  Google アナリティクスを有効にすることを推奨します。

**ステップ2: ウェブアプリの登録と設定キーの取得**
1.  プロジェクト概要ページでウェブアイコン `</>` をクリックします。
2.  アプリのニックネーム（例: `Taneto App`）でアプリを登録します。
3.  表示される `firebaseConfig` の値をコピーしておきます。

**ステップ3: Authenticationの有効化**
1.  左メニューから「Authentication」>「始める」を選択します。
2.  「Sign-in method」タブで、使用するログインプロバイダー（例: メール/パスワード, Google）を有効化します。

**ステップ4: Firestore Databaseの有効化**
1.  左メニューから「Firestore Database」>「データベースの作成」を選択します。
2.  **本番環境モード**で開始します。
3.  ロケーションを選択します（例: `asia-northeast1` (東京)）。

**ステップ5: Hostingの有効化**
1.  左メニューから「Hosting」>「始める」を選択します。
2.  画面の指示に従いますが、CLIのステップは完了済みのため、主にコンソール上での有効化が目的です。

**ステップ6: Functionsの有効化**
1.  左メニューから「Functions」を選択します。
2.  プロジェクトのプランを**Blaze（従量課金制）**にアップグレードします（Cloud Functionsの利用に必須）。

### 2. アプリケーションへのFirebase設定の組み込み

**ステップ1: 環境変数ファイルの作成**
`taneto-app`ディレクトリの直下に `.env.local` ファイルを新規作成します。

**ステップ2: 設定キーを`.env.local`に記述**
Firebaseコンソールで取得した`firebaseConfig`の値を、以下のように`.env.local`ファイルに貼り付け、ご自身のキーに置き換えてください。

```bash
# taneto-app/.env.local

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
```
(`NEXT_PUBLIC_`の接頭辞はNext.jsがブラウザ側で変数を読み込むために必要です。)

### 3. Google Cloudコンソールの確認
Firebaseサービスを有効にすると通常は自動で設定されますが、念のため確認します。
1.  [Google Cloudコンソール](https://console.cloud.google.com/)で同じプロジェクトを選択します。
2.  「APIとサービス」>「有効なAPIとサービス」で以下のAPIが有効になっていることを確認します。
    - Cloud Functions API
    - Cloud Build API
    - Artifact Registry API
    - Cloud Run Admin API

---

## 企画文書

### PRD (製品要求仕様書)
`docs/prd.md` - アプリの全体構想、ターゲットユーザー、機能要件を詳細に記載

### 市場調査
`docs/report.md` - 妊活市場の男女差、競合分析、機会の特定

### ユーザー調査
`docs/painSurvey.md` - 男性ユーザーが抱える具体的なペインポイントの分析

### 技術設計
`docs.solution.md` - 競合との差別化戦略と具体的な解決アプローチ

## 開発ガイダンス

`CLAUDE.md` - Claude Codeでの開発時に参照すべきプロジェクト情報

---

**2025年 - 男性の妊活参加を促進し、少子化問題に貢献するプロジェクト**
