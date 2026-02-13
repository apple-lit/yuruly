'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Users, 
  Sparkles,
  TrendingUp,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Sun,
  Sunrise,
  Sunset,
  Moon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Footer } from '@/components/footer';
import type { EventData, Response } from '@/lib/event-api';

interface ResultsViewProps {
  event: EventData;
  responses: Response[];
}

export function ResultsView({ event, responses }: ResultsViewProps) {
  const [copied, setCopied] = React.useState(false);
  const [mustAttendees, setMustAttendees] = React.useState<Set<string>>(new Set());

  // ベスト日程を計算
  const dateScores = useMemo(() => {
    const scores = new Map<string, { yes: number; maybe: number; no: number }>();

    event.dates.forEach(date => {
      scores.set(date.id, { yes: 0, maybe: 0, no: 0 });
    });

    responses.forEach(response => {
      response.answers.forEach(answer => {
        const score = scores.get(answer.event_date_id);
        if (score) {
          score[answer.status]++;
        }
      });
    });

    return scores;
  }, [event.dates, responses]);

  // マスト回答者が参加している日程の中で最も人数が多い日を計算
  const bestDateForMust = useMemo(() => {
    if (mustAttendees.size === 0) return null;

    let bestDate: string | null = null;
    let maxYes = -1;

    event.dates.forEach(date => {
      // マスト回答者全員が◯をつけているかチェック
      const allMustAttendeesOk = Array.from(mustAttendees).every(responseId => {
        const response = responses.find(r => r.id === responseId);
        if (!response) return false;
        const answer = response.answers.find(a => a.event_date_id === date.id);
        return answer?.status === 'yes';
      });

      if (allMustAttendeesOk) {
        const score = dateScores.get(date.id);
        if (score && score.yes > maxYes) {
          maxYes = score.yes;
          bestDate = date.id;
        }
      }
    });

    return bestDate;
  }, [mustAttendees, event.dates, responses, dateScores]);

  // マスト回答者をトグル
  const toggleMustAttendee = (responseId: string) => {
    setMustAttendees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(responseId)) {
        newSet.delete(responseId);
      } else {
        newSet.add(responseId);
      }
      return newSet;
    });
  };

  // 日付を得点順にソート
  const sortedDates = useMemo(() => {
    return [...event.dates].sort((a, b) => {
      const scoreA = dateScores.get(a.id);
      const scoreB = dateScores.get(b.id);
      if (!scoreA || !scoreB) return 0;

      // ◯の数が多い順、次に△の数
      const totalA = scoreA.yes * 2 + scoreA.maybe;
      const totalB = scoreB.yes * 2 + scoreB.maybe;
      return totalB - totalA;
    });
  }, [event.dates, dateScores]);

  // ベスト日程（トップ3）
  const bestDates = sortedDates.slice(0, 3);

  // URLをコピー
  const copyUrl = async () => {
    const url = window.location.href.replace('/results', '');
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // 時間表示
  const getTimeDisplay = (date: EventData['dates'][0]) => {
    if (date.time_type === 'none') return '終日';
    if (date.time_type === 'rough') {
      const labels = { morning: '朝', afternoon: '昼', evening: '夕方', night: '夜' };
      return labels[date.rough_time as keyof typeof labels] || '';
    }
    return `${date.start_time} 〜 ${date.end_time || ''}`;
  };

  // 時間タイプの背景色（結果画面用）
  const getTimeHeaderStyle = (date: EventData['dates'][0]) => {
    if (date.time_type === 'none') {
      return 'bg-blue-100 border-blue-300';
    } else if (date.time_type === 'rough') {
      const colors = {
        morning: 'bg-orange-100 border-orange-300',
        afternoon: 'bg-yellow-100 border-yellow-300',
        evening: 'bg-purple-100 border-purple-300',
        night: 'bg-indigo-100 border-indigo-300',
      };
      return colors[date.rough_time as keyof typeof colors] || 'bg-gray-100 border-gray-300';
    } else if (date.time_type === 'detailed') {
      return 'bg-teal-100 border-teal-300';
    }
    return 'bg-gray-100 border-gray-300';
  };

  // 時間タイプの形状（ボーダーの種類）
  const getTimeHeaderShape = (date: EventData['dates'][0]) => {
    if (date.time_type === 'none') {
      return 'rounded-lg'; // 終日: 丸い角
    } else if (date.time_type === 'rough') {
      return 'rounded-none border-l-4'; // ざっくり: 左に太いボーダー
    } else if (date.time_type === 'detailed') {
      return 'rounded-sm border-2'; // 詳細時間: 四角い角、太いボーダー
    }
    return 'rounded-lg';
  };

  // ヒートマップの色
  const getHeatmapColor = (dateId: string) => {
    const score = dateScores.get(dateId);
    if (!score || responses.length === 0) return 'bg-gray-100';

    const yesRate = score.yes / responses.length;
    if (yesRate >= 0.8) return 'bg-green-500';
    if (yesRate >= 0.6) return 'bg-green-400';
    if (yesRate >= 0.4) return 'bg-yellow-400';
    if (yesRate >= 0.2) return 'bg-orange-400';
    return 'bg-red-400';
  };

  // 回答者の回答を取得
  const getResponseAnswer = (responseId: string, dateId: string) => {
    const response = responses.find(r => r.id === responseId);
    const answer = response?.answers.find(a => a.event_date_id === dateId);
    return answer?.status || 'no';
  };

  // 回答アイコン
  const getAnswerIcon = (status: 'yes' | 'maybe' | 'no') => {
    switch (status) {
      case 'yes': return '◯';
      case 'maybe': return '△';
      case 'no': return '✕';
    }
  };

  const getAnswerColorClass = (status: 'yes' | 'maybe' | 'no') => {
    switch (status) {
      case 'yes': return 'text-green-600 font-bold';
      case 'maybe': return 'text-yellow-600';
      case 'no': return 'text-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-2xl mb-2">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  {event.title}
                </CardTitle>
                {event.description && (
                  <CardDescription className="text-base">
                    {event.description}
                  </CardDescription>
                )}
              </div>
              <Button
                onClick={copyUrl}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    URLをコピー
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: サマリー */}
          <div className="lg:col-span-1 space-y-6">
            {/* 参加者数 */}
            <Card className="backdrop-blur-sm bg-white/80 border-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                  回答状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">
                    {responses.length}
                  </div>
                  <p className="text-sm text-muted-foreground">人が回答済み</p>
                </div>
              </CardContent>
            </Card>

            {/* ベスト日程 - 削除（フィードバックに基づき非表示） */}

            {/* 新しく回答する */}
            <Link href={`/event/${event.id}`}>
              <Button className="w-full bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 hover:opacity-90" size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                新しく回答する
              </Button>
            </Link>
          </div>

          {/* 右側: 出欠表とコメント */}
          <div className="lg:col-span-2 space-y-6">
            {/* コメント一覧 */}
            {responses.some(r => r.comment) && (
              <Card className="backdrop-blur-sm bg-white/80 border-amber-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    💬 コメント
                  </CardTitle>
                  <CardDescription>
                    参加者からのコメント
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {responses
                      .filter(r => r.comment)
                      .map((response) => (
                        <div
                          key={response.id}
                          className="p-4 rounded-lg bg-amber-50 border border-amber-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold shrink-0">
                              {response.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm mb-1">
                                {response.name}
                              </div>
                              <div className="text-sm text-gray-700">
                                {response.comment}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 出欠表 */}
            <Card className="backdrop-blur-sm bg-white/80 border-purple-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  出欠表
                </CardTitle>
                <CardDescription>
                  名前をクリックして⭐マークを付けると「マスト回答者」になります。
                  マスト全員が◯の中で最も参加人数が多い日が「⭐ベスト」として強調表示されます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {responses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">まだ回答がありません</p>
                    <p className="text-xs mt-1">参加者にURLを共有しましょう</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2">
                          <th className="text-left p-3 font-semibold sticky left-0 bg-white z-10 border-r">
                            <div>名前</div>
                            {mustAttendees.size > 0 && (
                              <div className="text-xs font-normal text-amber-600 mt-1">
                                {mustAttendees.size}人がマスト
                              </div>
                            )}
                          </th>
                          {event.dates.map(date => {
                            const score = dateScores.get(date.id);
                            const isHighest = score && score.yes === Math.max(...Array.from(dateScores.values()).map(s => s.yes));
                            const isBestForMust = bestDateForMust === date.id;
                            
                            // 時間タイプの背景色と アイコン
                            const getHeaderStyle = () => {
                              if (date.time_type === 'none') {
                                return { bg: 'bg-blue-500', icon: <Sun className="w-5 h-5 text-white" /> };
                              } else if (date.time_type === 'rough') {
                                const styles = {
                                  morning: { bg: 'bg-orange-500', icon: <Sunrise className="w-5 h-5 text-white" /> },
                                  afternoon: { bg: 'bg-yellow-500', icon: <Sun className="w-5 h-5 text-white" /> },
                                  evening: { bg: 'bg-purple-500', icon: <Sunset className="w-5 h-5 text-white" /> },
                                  night: { bg: 'bg-indigo-600', icon: <Moon className="w-5 h-5 text-white" /> },
                                };
                                return styles[date.rough_time as keyof typeof styles] || { bg: 'bg-gray-500', icon: <Clock className="w-5 h-5 text-white" /> };
                              }
                              return { bg: 'bg-teal-500', icon: <Clock className="w-5 h-5 text-white" /> };
                            };
                            
                            const headerStyle = getHeaderStyle();
                            
                            return (
                              <th key={date.id} className="p-1">
                                <div className={cn(
                                  "w-32 h-24 flex flex-col items-center justify-center gap-1 rounded-lg text-white font-bold relative overflow-hidden",
                                  headerStyle.bg,
                                  isBestForMust && "ring-4 ring-amber-400 ring-offset-2",
                                  !isBestForMust && isHighest && "ring-2 ring-green-400"
                                )}>
                                  {/* ベストマークまたは参加数ハイライト */}
                                  {isBestForMust && (
                                    <div className="absolute top-1 right-1 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                      ⭐ ベスト
                                    </div>
                                  )}
                                  {!isBestForMust && isHighest && (
                                    <div className="absolute top-1 right-1 bg-green-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                      👥 最多
                                    </div>
                                  )}
                                  
                                  {headerStyle.icon}
                                  <div className="text-sm">
                                    {format(new Date(date.date + 'T00:00:00'), 'M/d(E)', { locale: ja })}
                                  </div>
                                  <div className="text-xs opacity-90 font-medium truncate max-w-full px-1">
                                    {getTimeDisplay(date)}
                                  </div>
                                  <div className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded">
                                    ◯ {score?.yes || 0}人
                                  </div>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {responses.map((response) => {
                          const isMust = mustAttendees.has(response.id);
                          
                          return (
                            <tr key={response.id} className={cn(
                              "border-b hover:bg-muted/30 transition-colors",
                              isMust && "bg-amber-50"
                            )}>
                              <td className="p-3 sticky left-0 bg-white z-10 border-r">
                                <button
                                  onClick={() => toggleMustAttendee(response.id)}
                                  className={cn(
                                    "w-full text-left p-2 rounded transition-all",
                                    isMust ? "bg-amber-100 border-2 border-amber-400" : "hover:bg-gray-50"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {isMust && <span className="text-amber-600">⭐</span>}
                                    <div className="flex-1">
                                      <div className={cn("font-medium", isMust && "text-amber-900")}>
                                        {response.name}
                                      </div>
                                      {response.comment && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {response.comment}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {isMust && (
                                    <div className="text-xs text-amber-600 mt-1">
                                      この人はマスト
                                    </div>
                                  )}
                                </button>
                              </td>
                              {event.dates.map(date => {
                                const status = getResponseAnswer(response.id, date.id);
                                return (
                                  <td key={date.id} className={cn(
                                    "p-3 text-center",
                                    bestDateForMust === date.id && "bg-amber-50"
                                  )}>
                                    <span className={cn("text-xl font-bold", getAnswerColorClass(status))}>
                                      {getAnswerIcon(status)}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                        {/* 集計行 */}
                        <tr className="bg-muted/50 font-semibold border-t-2">
                          <td className="p-3 sticky left-0 bg-muted/50 z-10 border-r">
                            集計
                          </td>
                          {event.dates.map(date => {
                            const score = dateScores.get(date.id);
                            return (
                              <td key={date.id} className={cn(
                                "p-3 text-center",
                                bestDateForMust === date.id && "bg-amber-100"
                              )}>
                                <div className="text-xs space-y-1">
                                  <div className="text-green-600 font-bold">◯ {score?.yes || 0}</div>
                                  <div className="text-yellow-600">△ {score?.maybe || 0}</div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
