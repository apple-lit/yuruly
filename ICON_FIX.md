# アイコンエラーの修正方法

## 問題
`lucide-react`のバージョンによって、一部のアイコン名が異なります。
以下のアイコンが存在しないため、エラーが発生しています：
- `CircleCheck`
- `CircleMinus`
- `CircleX`

## 修正方法

`~/Desktop/yuru-plan/components/response-form.tsx` を開いて、以下の2箇所を修正してください。

### 修正1: インポート部分（6行目付近）

**変更前:**
```typescript
import { 
  Calendar, 
  Clock, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  CircleCheck,      // ← これを変更
  CircleMinus,      // ← これを変更
  CircleX,          // ← これを変更
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
```

**変更後:**
```typescript
import { 
  Calendar, 
  Clock, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  CheckCircle,      // ← 変更
  MinusCircle,      // ← 変更
  XCircle,          // ← 変更
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
```

### 修正2: getAnswerIcon関数（62行目付近）

**変更前:**
```typescript
  const getAnswerIcon = (status: AnswerStatus) => {
    switch (status) {
      case 'yes':
        return <CircleCheck className="w-6 h-6" />;     // ← これを変更
      case 'maybe':
        return <CircleMinus className="w-6 h-6" />;    // ← これを変更
      case 'no':
        return <CircleX className="w-6 h-6" />;        // ← これを変更
      default:
        return <CircleX className="w-6 h-6 opacity-30" />; // ← これを変更
    }
  };
```

**変更後:**
```typescript
  const getAnswerIcon = (status: AnswerStatus) => {
    switch (status) {
      case 'yes':
        return <CheckCircle className="w-6 h-6" />;    // ← 変更
      case 'maybe':
        return <MinusCircle className="w-6 h-6" />;    // ← 変更
      case 'no':
        return <XCircle className="w-6 h-6" />;        // ← 変更
      default:
        return <XCircle className="w-6 h-6 opacity-30" />; // ← 変更
    }
  };
```

## 修正後

ファイルを保存すると、開発サーバーが自動的にリロードされます。
ブラウザで回答画面を再読み込みすれば、エラーが解消されているはずです。

---

## コマンドラインで一括修正（上級者向け）

もしくは、以下のコマンドで一括置換できます：

```bash
cd ~/Desktop/yuru-plan

# バックアップを作成
cp components/response-form.tsx components/response-form.tsx.backup

# 一括置換
sed -i '' 's/CircleCheck/CheckCircle/g' components/response-form.tsx
sed -i '' 's/CircleMinus/MinusCircle/g' components/response-form.tsx
sed -i '' 's/CircleX/XCircle/g' components/response-form.tsx
```

修正が完了したら、ブラウザをリロードしてください！
