'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  CheckCircle, 
  MinusCircle, 
  XCircle,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { submitResponse } from '@/lib/event-api';
import { Footer } from '@/components/footer';
import type { EventData } from '@/lib/event-api';

interface ResponseFormProps {
  event: EventData;
  onSuccess: () => void;
}

type AnswerStatus = 'yes' | 'maybe' | 'no' | null;

export function ResponseForm({ event, onSuccess }: ResponseFormProps) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [answers, setAnswers] = useState<Record<string, AnswerStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 回答ステータスを切り替え
  const toggleAnswer = (dateId: string) => {
    setAnswers(prev => {
      const current = prev[dateId] || null;
      let next: AnswerStatus;
      
      if (current === null || current === 'no') {
        next = 'yes';
      } else if (current === 'yes') {
        next = 'maybe';
      } else {
        next = 'no';
      }
      
      return { ...prev, [dateId]: next };
    });
  };

  // アイコンとラベルを取得
  const getAnswerIcon = (status: AnswerStatus) => {
    switch (status) {
      case 'yes':
        return <CheckCircle className="w-6 h-6" />;
      case 'maybe':
        return <MinusCircle className="w-6 h-6" />;
      case 'no':
        return <XCircle className="w-6 h-6" />;
      default:
        return <XCircle className="w-6 h-6 opacity-30" />;
    }
  };

  const getAnswerLabel = (status: AnswerStatus) => {
    switch (status) {
      case 'yes':
        return '◯';
      case 'maybe':
        return '△';
      case 'no':
        return '✕';
      default:
        return '未回答';
    }
  };

  const getAnswerColor = (status: AnswerStatus) => {
    switch (status) {
      case 'yes':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'maybe':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'no':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  // 時間情報の表示
  const getTimeDisplay = (date: EventData['dates'][0]) => {
    if (date.time_type === 'none') {
      return '終日';
    } else if (date.time_type === 'rough') {
      const roughLabels = {
        morning: '朝',
        afternoon: '昼',
        evening: '夕方',
        night: '夜',
      };
      return roughLabels[date.rough_time as keyof typeof roughLabels] || '';
    } else if (date.time_type === 'detailed') {
      return `${date.start_time} 〜 ${date.end_time || ''}`;
    }
    return '';
  };

  // 時間タイプのアイコン
  const getTimeIcon = (date: EventData['dates'][0]) => {
    if (date.time_type === 'rough') {
      const icons = {
        morning: <Sunrise className="w-5 h-5" />,
        afternoon: <Sun className="w-5 h-5" />,
        evening: <Sunset className="w-5 h-5" />,
        night: <Moon className="w-5 h-5" />,
      };
      return icons[date.rough_time as keyof typeof icons] || <Clock className="w-5 h-5" />;
    } else if (date.time_type === 'none') {
      return <Sun className="w-5 h-5" />;
    }
    return <Clock className="w-5 h-5" />;
  };

  // 時間タイプの背景色
  const getTimeBackgroundColor = (date: EventData['dates'][0]) => {
    if (date.time_type === 'none') {
      return 'bg-blue-50 border-blue-200';
    } else if (date.time_type === 'rough') {
      const colors = {
        morning: 'bg-orange-50 border-orange-200',
        afternoon: 'bg-yellow-50 border-yellow-200',
        evening: 'bg-purple-50 border-purple-200',
        night: 'bg-indigo-50 border-indigo-200',
      };
      return colors[date.rough_time as keyof typeof colors] || 'bg-gray-50 border-gray-200';
    } else if (date.time_type === 'detailed') {
      return 'bg-teal-50 border-teal-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  // 時間タイプの文字色
  const getTimeTextColor = (date: EventData['dates'][0]) => {
    if (date.time_type === 'none') {
      return 'text-blue-700';
    } else if (date.time_type === 'rough') {
      const colors = {
        morning: 'text-orange-700',
        afternoon: 'text-yellow-700',
        evening: 'text-purple-700',
        night: 'text-indigo-700',
      };
      return colors[date.rough_time as keyof typeof colors] || 'text-gray-700';
    } else if (date.time_type === 'detailed') {
      return 'text-teal-700';
    }
    return 'text-gray-700';
  };

  // 回答送信
  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('お名前を入力してください');
      return;
    }

    // 未回答の日付にはデフォルトで'no'を設定
    const completeAnswers: Record<string, 'yes' | 'maybe' | 'no'> = {};
    event.dates.forEach(date => {
      const answer = answers[date.id];
      completeAnswers[date.id] = answer && answer !== null ? answer : 'no';
    });

    setIsSubmitting(true);
    try {
      const success = await submitResponse(
        event.id,
        name.trim(),
        comment.trim() || null,
        completeAnswers
      );

      if (success) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        alert('回答の送信に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 送信完了画面
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full backdrop-blur-sm bg-white/80 shadow-lg animate-fade-in">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">回答を送信しました！</h2>
            <p className="text-muted-foreground mb-6">
              ご協力ありがとうございます
            </p>
            <p className="text-sm text-muted-foreground">
              結果画面にリダイレクトしています...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-8 h-8 text-purple-400 animate-float" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent italic">
              yuruly
            </h1>
          </div>
        </div>

        {/* イベント情報 */}
        <Card className="mb-6 backdrop-blur-sm bg-white/80 border-purple-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calendar className="w-6 h-6 text-purple-400" />
              {event.title}
            </CardTitle>
            {event.description && (
              <CardDescription className="text-base mt-2">
                {event.description}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* 候補日リスト */}
        <Card className="mb-6 backdrop-blur-sm bg-white/80 border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              候補日を選択
            </CardTitle>
            <CardDescription>
              ◯△✕のボタンを押して選択してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 一括選択ボタン */}
            <div className="mb-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const allYes: Record<string, AnswerStatus> = {};
                  event.dates.forEach(date => {
                    allYes[date.id] = 'yes';
                  });
                  setAnswers(allYes);
                }}
                className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
              >
                すべて◯
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const allNo: Record<string, AnswerStatus> = {};
                  event.dates.forEach(date => {
                    allNo[date.id] = 'no';
                  });
                  setAnswers(allNo);
                }}
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                すべて✕
              </Button>
            </div>

            <div className="space-y-3">
              {event.dates.map((date) => {
                const status = answers[date.id];
                
                // 時間タイプごとのアクセントカラー（左側のバー用）
                const getAccentColor = () => {
                  if (date.time_type === 'none') {
                    return 'bg-blue-500';
                  } else if (date.time_type === 'rough') {
                    const colors = {
                      morning: 'bg-orange-500',
                      afternoon: 'bg-amber-500',
                      evening: 'bg-purple-500',
                      night: 'bg-indigo-600',
                    };
                    return colors[date.rough_time as keyof typeof colors] || 'bg-gray-500';
                  }
                  return 'bg-teal-500';
                };
                
                // 時間タイプのアイコンと色
                const getTimeInfo = () => {
                  if (date.time_type === 'none') {
                    return { icon: <Sun className="w-5 h-5 text-blue-600" />, color: 'text-blue-600' };
                  } else if (date.time_type === 'rough') {
                    const info = {
                      morning: { icon: <Sunrise className="w-5 h-5 text-orange-600" />, color: 'text-orange-600' },
                      afternoon: { icon: <Sun className="w-5 h-5 text-amber-600" />, color: 'text-amber-600' },
                      evening: { icon: <Sunset className="w-5 h-5 text-purple-600" />, color: 'text-purple-600' },
                      night: { icon: <Moon className="w-5 h-5 text-indigo-700" />, color: 'text-indigo-700' },
                    };
                    return info[date.rough_time as keyof typeof info] || { icon: <Clock className="w-5 h-5" />, color: 'text-gray-600' };
                  }
                  return { icon: <Clock className="w-5 h-5 text-teal-600" />, color: 'text-teal-600' };
                };
                
                const timeInfo = getTimeInfo();

                return (
                  <div
                    key={date.id}
                    className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all bg-white border-2 border-gray-200"
                  >
                    <div className="flex">
                      {/* 左側のカラーバー */}
                      <div className={cn("w-2 shrink-0", getAccentColor())} />
                      
                      {/* メインコンテンツ */}
                      <div className="flex-1 p-4 flex items-center justify-between gap-4">
                        {/* 左側：アイコンと日付・時間情報 */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {timeInfo.icon}
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xl text-gray-900 mb-0.5">
                              {format(new Date(date.date + 'T00:00:00'), 'M月d日(E)', { locale: ja })}
                            </div>
                            <div className={cn("text-sm font-semibold", timeInfo.color)}>
                              {getTimeDisplay(date)}
                            </div>
                          </div>
                        </div>
                        
                        {/* 右側：回答ボタン */}
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setAnswers(prev => ({ ...prev, [date.id]: 'yes' }))}
                            className={cn(
                              "w-14 h-14 rounded-xl border-2 transition-all duration-300 font-bold text-2xl flex items-center justify-center shadow-sm",
                              "active:scale-95 hover:scale-105",
                              status === 'yes'
                                ? "border-green-600 bg-green-600 text-white scale-110 shadow-lg animate-bounce-once"
                                : "border-green-500 bg-white text-green-600 hover:bg-green-50"
                            )}
                          >
                            ◯
                          </button>
                          <button
                            onClick={() => setAnswers(prev => ({ ...prev, [date.id]: 'maybe' }))}
                            className={cn(
                              "w-14 h-14 rounded-xl border-2 transition-all duration-300 font-bold text-2xl flex items-center justify-center shadow-sm",
                              "active:scale-95 hover:scale-105",
                              status === 'maybe'
                                ? "border-yellow-600 bg-yellow-500 text-white scale-110 shadow-lg animate-bounce-once"
                                : "border-yellow-500 bg-white text-yellow-600 hover:bg-yellow-50"
                            )}
                          >
                            △
                          </button>
                          <button
                            onClick={() => setAnswers(prev => ({ ...prev, [date.id]: 'no' }))}
                            className={cn(
                              "w-14 h-14 rounded-xl border-2 transition-all duration-300 font-bold text-2xl flex items-center justify-center shadow-sm",
                              "active:scale-95 hover:scale-105",
                              status === 'no'
                                ? "border-red-600 bg-red-600 text-white scale-110 shadow-lg animate-bounce-once"
                                : "border-red-500 bg-white text-red-600 hover:bg-red-50"
                            )}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 名前・コメント入力 */}
        <Card className="mb-6 backdrop-blur-sm bg-white/80 border-green-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              あなたの情報
            </CardTitle>
            <CardDescription>
              回答者として表示される名前を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                お名前 <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="例: 山田太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-green-200 focus:border-green-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                コメント <span className="text-muted-foreground text-xs">(任意)</span>
              </label>
              <Textarea
                placeholder="例: 遅刻するかもしれません"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="border-green-200 focus:border-green-400 min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* 送信ボタン */}
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg text-lg"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              回答を送信
            </>
          )}
        </Button>

        {/* 回答状況の確認 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            回答済み: {Object.values(answers).filter(a => a !== null).length} / {event.dates.length}
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
