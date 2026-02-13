# Yuru-Plan 実装ガイド

## 現在の実装状況

### ✅ 完了している機能

1. **ホームページ（ランディングページ）**
   - サービスの特徴を紹介
   - 3ステップの使い方ガイド
   - CTAボタンでイベント作成画面へ遷移

2. **イベント作成画面**
   - イベント名・説明の入力フォーム
   - インタラクティブなカレンダーUI
     - 複数日の選択・解除
     - 選択済み日付のビジュアルフィードバック
     - 月の切り替え
   - 柔軟な時間設定
     - 終日（時間指定なし）
     - ざっくり枠（朝・昼・夕方・夜）
     - 詳細時間（開始〜終了）
   - 選択中の候補日のリスト表示
   - アコーディオン式の詳細編集UI
   - レスポンシブデザイン

### 🎨 デザインの特徴

- **カラーパレット**
  - Primary: Soft Purple (HSL 280, 70%, 75%)
  - Secondary: Soft Mint (HSL 150, 60%, 85%)
  - Accent: Soft Pink (HSL 340, 80%, 85%)
  - Background: グラデーション（purple → blue → green）

- **アニメーション**
  - フェードイン（0.5s ease-out）
  - スケール変換（hover時）
  - フロート効果（ロゴアイコン）

- **UI/UXのこだわり**
  - 角丸デザイン（1rem = 16px）
  - ガラスモーフィズム（backdrop-blur）
  - カスタムスクロールバー
  - マイクロインタラクション

## Next Steps: 次に実装すべき機能

### Phase 2: バックエンド連携

1. **Supabase セットアップ**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **データベーススキーマ設計**
   ```sql
   -- events テーブル
   CREATE TABLE events (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     title TEXT NOT NULL,
     description TEXT,
     admin_url_token TEXT UNIQUE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- event_dates テーブル
   CREATE TABLE event_dates (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     event_id UUID REFERENCES events(id) ON DELETE CASCADE,
     date DATE NOT NULL,
     time_type TEXT NOT NULL, -- 'none', 'rough', 'detailed'
     rough_time TEXT, -- 'morning', 'afternoon', 'evening', 'night'
     start_time TIME,
     end_time TIME
   );

   -- responses テーブル
   CREATE TABLE responses (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     event_id UUID REFERENCES events(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     comment TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- response_answers テーブル
   CREATE TABLE response_answers (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
     event_date_id UUID REFERENCES event_dates(id) ON DELETE CASCADE,
     status TEXT NOT NULL, -- 'yes', 'maybe', 'no'
     UNIQUE(response_id, event_date_id)
   );
   ```

3. **環境変数設定**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Phase 3: 回答画面の実装

1. **回答画面コンポーネント (`/event/[id]/page.tsx`)**
   - イベント情報の表示
   - カレンダー/リストビューの切り替え
   - タップで◯→△→✕の切り替え
   - 名前・コメント入力フォーム
   - 回答の送信

2. **実装のポイント**
   ```typescript
   // components/response-form.tsx
   const [answers, setAnswers] = useState<Record<string, 'yes' | 'maybe' | 'no'>>({});
   
   const toggleAnswer = (dateId: string) => {
     setAnswers(prev => {
       const current = prev[dateId] || 'no';
       const next = current === 'no' ? 'yes' : current === 'yes' ? 'maybe' : 'no';
       return { ...prev, [dateId]: next };
     });
   };
   ```

### Phase 4: 結果表示画面

1. **結果表示コンポーネント (`/event/[id]/results/page.tsx`)**
   - ヒートマップ形式のベスト日程表示
   - 出欠表（マトリックステーブル）
   - 回答者一覧
   - フィルタリング機能

2. **ヒートマップの計算ロジック**
   ```typescript
   const calculateBestDates = (responses: Response[]) => {
     const scoreboard = new Map<string, number>();
     
     responses.forEach(response => {
       response.answers.forEach(answer => {
         const score = answer.status === 'yes' ? 1 : answer.status === 'maybe' ? 0.5 : 0;
         scoreboard.set(
           answer.event_date_id,
           (scoreboard.get(answer.event_date_id) || 0) + score
         );
       });
     });
     
     return Array.from(scoreboard.entries())
       .sort((a, b) => b[1] - a[1]);
   };
   ```

### Phase 5: 管理機能

1. **管理画面 (`/event/[id]/admin/[token]/page.tsx`)**
   - イベント情報の編集
   - 候補日の追加・削除
   - イベントの削除
   - 回答の管理

2. **URL生成とトークン管理**
   ```typescript
   const generateAdminToken = () => {
     return crypto.randomUUID();
   };
   
   const createEvent = async (data: EventData) => {
     const adminToken = generateAdminToken();
     const event = await supabase
       .from('events')
       .insert({ ...data, admin_url_token: adminToken })
       .select()
       .single();
     
     return {
       viewUrl: `/event/${event.id}`,
       adminUrl: `/event/${event.id}/admin/${adminToken}`
     };
   };
   ```

## パフォーマンス最適化

### 推奨事項

1. **画像最適化**
   ```typescript
   // next.config.js
   module.exports = {
     images: {
       formats: ['image/avif', 'image/webp'],
     },
   }
   ```

2. **動的インポート**
   ```typescript
   const EventCreator = dynamic(() => import('@/components/event-creator'), {
     loading: () => <LoadingSpinner />
   });
   ```

3. **メモ化**
   ```typescript
   const calendarDays = useMemo(() => 
     eachDayOfInterval({ start: monthStart, end: monthEnd }),
     [monthStart, monthEnd]
   );
   ```

## テスト戦略

### 単体テスト

```bash
npm install -D @testing-library/react @testing-library/jest-dom jest
```

### E2Eテスト

```bash
npm install -D @playwright/test
```

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. Vercelで新規プロジェクトを作成
3. 環境変数を設定
4. デプロイ

```bash
vercel --prod
```

## トラブルシューティング

### よくある問題

1. **Date-fnsのロケールエラー**
   - `ja`ロケールが正しくインポートされているか確認

2. **Tailwind CSSが適用されない**
   - `postcss.config.js`と`tailwind.config.ts`を確認
   - `globals.css`が正しくインポートされているか確認

3. **shadcn/uiコンポーネントのスタイルが崩れる**
   - `lib/utils.ts`の`cn`関数を確認
   - CSS変数が正しく定義されているか確認

## コントリビューション

プルリクエストを歓迎します！以下のガイドラインに従ってください：

1. フィーチャーブランチを作成
2. コミットメッセージは明確に
3. テストを追加
4. READMEを更新（必要に応じて）

## サポート

質問や提案がある場合は、GitHubのIssueを作成してください。
